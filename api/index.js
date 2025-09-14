require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());

// More permissive CORS for debugging
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
const COOLDOWN_HOURS = 24;

// Add connection pooling configuration for better Vercel performance
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

// Initialize database table if it doesn't exist
const initDb = async () => {
    try {
        const connected = await testConnection();
        if (!connected) {
            console.error('Skipping database initialization - no connection');
            return;
        }

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
        console.error('Database initialization error:', error.message);
    }
};

// Health check - simple endpoint that doesn't require database
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve the main HTML file at root
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).json({ error: 'Failed to serve homepage' });
    }
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

// Get faucet stats from blockchain
app.get('/blockchain-stats', async (req, res) => {
    try {
        const { ethers } = require('ethers');
        
        // Your contract ABI (minimal for events)
        const contractABI = [
            "event FundsDripped(address indexed recipient, uint256 amount)"
        ];
        
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const contract = new ethers.Contract(process.env.FAUCET_CONTRACT_ADDRESS, contractABI, provider);
        
        // Get all FundsDripped events
        const filter = contract.filters.FundsDripped();
        const events = await contract.queryFilter(filter, 0, 'latest');
        
        // Count total claims
        const totalClaims = events.length;
        
        // Count claims in last 24 hours
        const last24Hours = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
        let claimsLast24h = 0;
        
        for (let event of events) {
            const block = await provider.getBlock(event.blockNumber);
            if (block.timestamp >= last24Hours) {
                claimsLast24h++;
            }
        }
        
        res.json({
            totalClaims,
            claimsLast24h,
            source: 'blockchain'
        });
        
    } catch (error) {
        console.error('Blockchain stats error:', error);
        res.status(500).json({ error: "Error fetching blockchain stats." });
    }
});

// Get faucet stats from blockchain
app.get('/blockchain-stats', async (req, res) => {
    try {
        // Your new contract address
        const FAUCET_CONTRACT_ADDRESS = "0x8D08e77837c28fB271D843d84900544cA46bA2F3";
        
        // Minimal ABI for the FundsDripped event
        const contractABI = [
            "event FundsDripped(address indexed recipient, uint256 amount)"
        ];
        
        // Use a more reliable RPC provider
        const provider = new ethers.providers.JsonRpcProvider('https://base.blockpi.network/v1/rpc/public');
        
        const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider);
        
        // Get current block first
        const currentBlock = await provider.getBlockNumber();
        console.log(`Current block: ${currentBlock}`);
        
        // Start from a recent block to avoid timeout (last 5000 blocks = ~few hours on Base)
        const fromBlock = Math.max(0, currentBlock - 5000);
        console.log(`Scanning from block ${fromBlock} to ${currentBlock}`);
        
        const filter = contract.filters.FundsDripped();
        const events = await contract.queryFilter(filter, fromBlock, 'latest');
        
        console.log(`Found ${events.length} FundsDripped events`);
        
        // Count total claims (from this scan)
        const totalClaims = events.length;
        
        // Count claims in last 24 hours  
        const last24Hours = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
        let claimsLast24h = 0;
        
        for (let event of events) {
            try {
                const block = await provider.getBlock(event.blockNumber);
                if (block && block.timestamp >= last24Hours) {
                    claimsLast24h++;
                }
            } catch (blockError) {
                console.error(`Error getting block ${event.blockNumber}:`, blockError.message);
            }
        }
        
        console.log(`Blockchain stats: ${totalClaims} total, ${claimsLast24h} last 24h`);
        
        res.json({
            totalClaims,
            claimsLast24h,
            source: 'blockchain',
            blocksScanned: currentBlock - fromBlock,
            contractAddress: FAUCET_CONTRACT_ADDRESS
        });
        
    } catch (error) {
        console.error('Blockchain stats error:', error.message);
        
        // Return a more helpful error
        res.status(500).json({ 
            error: "Blockchain stats temporarily unavailable",
            message: error.message,
            fallbackAdvice: "Using database stats instead"
        });
    }
});

// Get faucet stats (database)
app.get('/stats', async (req, res) => {
    try {
        const totalClaims = await pool.query('SELECT COUNT(*) FROM claims');
        const last24h = await pool.query(
            'SELECT COUNT(*) FROM claims WHERE claim_timestamp > $1',
            [new Date(Date.now() - 24 * 60 * 60 * 1000)]
        );
        
        res.json({
            totalClaims: parseInt(totalClaims.rows[0].count),
            claimsLast24h: parseInt(last24h.rows[0].count),
            source: 'database'
        });
    } catch (error) {
        console.error('Stats error:', error);
        // Return default stats if database fails
        res.json({
            totalClaims: 0,
            claimsLast24h: 0,
            source: 'database'
        });
    }
});

// Export for Vercel
module.exports = app;

// Initialize database and start server (only in development)
if (process.env.NODE_ENV !== 'production') {
    initDb().then(() => {
        app.listen(PORT, () => console.log(`Faucet gatekeeper listening on port ${PORT}`));
    });
} else {
    // Initialize database in production (but don't start server)
    initDb();
}
