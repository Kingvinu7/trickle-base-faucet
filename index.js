require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://trickle-base-faucet.vercel.app'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

// Serve static files (your HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
const COOLDOWN_HOURS = 24;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize database table if it doesn't exist
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS claims (
                id SERIAL PRIMARY KEY,
                wallet_address VARCHAR(42) NOT NULL,
                tx_hash VARCHAR(66) NOT NULL,
                claim_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Serve the main HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/check-eligibility', async (req, res) => {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: "Address is required." });
    
    try {
        const cooldownPeriod = new Date(new Date().getTime() - COOLDOWN_HOURS * 60 * 60 * 1000);
        const { rows } = await pool.query(
            'SELECT claim_timestamp FROM claims WHERE wallet_address = $1 AND claim_timestamp > $2 ORDER BY claim_timestamp DESC LIMIT 1',
            [address.toLowerCase(), cooldownPeriod]
        );
        
        if (rows.length > 0) {
            const nextClaimTime = new Date(rows[0].claim_timestamp.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
            const hoursLeft = Math.ceil((nextClaimTime - new Date()) / (1000 * 60 * 60));
            return res.status(200).json({ 
                eligible: false, 
                message: `Please wait ${hoursLeft} more hours before claiming again.`,
                nextClaimTime: nextClaimTime.toISOString()
            });
        }
        
        return res.status(200).json({ eligible: true });
    } catch (error) {
        console.error('Eligibility check error:', error);
        res.status(500).json({ error: "Error checking eligibility." });
    }
});

app.post('/log-claim', async (req, res) => {
    const { address, txHash } = req.body;
    if (!address || !txHash) {
        return res.status(400).json({ error: "Address and transaction hash are required." });
    }
    
    try {
        await pool.query(
            'INSERT INTO claims (wallet_address, tx_hash) VALUES ($1, $2)', 
            [address.toLowerCase(), txHash]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Claim logging error:', error);
        res.status(500).json({ error: "Error logging claim." });
    }
});

// Get faucet stats
app.get('/stats', async (req, res) => {
    try {
        const totalClaims = await pool.query('SELECT COUNT(*) FROM claims');
        const last24h = await pool.query(
            'SELECT COUNT(*) FROM claims WHERE claim_timestamp > $1',
            [new Date(Date.now() - 24 * 60 * 60 * 1000)]
        );
        
        res.json({
            totalClaims: parseInt(totalClaims.rows[0].count),
            claimsLast24h: parseInt(last24h.rows[0].count)
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: "Error fetching stats." });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

initDb().then(() => {
    app.listen(PORT, () => console.log(`Faucet gatekeeper listening on port ${PORT}`));
});
