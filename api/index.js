require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
// path module removed - no longer serving static files

const app = express();
app.use(express.json());

// More permissive CORS for debugging
app.use(cors());

// Static file serving removed - using Next.js frontend instead

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
        environment: process.env.NODE_ENV || 'development',
        version: '1.1'  // Added version to trigger new deployment
    });
});

// Root endpoint for API status
app.get('/', (req, res) => {
    res.json({ 
        message: "Trickle Base Faucet API",
        version: "2.0.0",
        endpoints: ["/health", "/stats", "/blockchain-stats", "/check-eligibility", "/log-claim"],
        timestamp: new Date().toISOString()
    });
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


// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: "Backend is working!",
        timestamp: new Date().toISOString(),
        endpoint: "test"
    });
});

// Get faucet stats from blockchain
app.get('/blockchain-stats', async (req, res) => {
    try {
        // Import ethers locally
        const { ethers } = require('ethers');
        
        // Your contract address (use env variable or fallback to hardcoded)
        const FAUCET_CONTRACT_ADDRESS = process.env.FAUCET_CONTRACT_ADDRESS || "0x8D08e77837c28fB271D843d84900544cA46bA2F3";
        
        console.log('Fetching blockchain stats for contract:', FAUCET_CONTRACT_ADDRESS);
        
        // Contract ABI for the FundsDripped event
        const contractABI = [
            "event FundsDripped(address indexed recipient, uint256 amount)"
        ];
        
        // Try multiple RPC providers for reliability
        const rpcUrls = [
            'https://mainnet.base.org',
            'https://base.llamarpc.com',
            'https://base-rpc.publicnode.com',
            'https://base-mainnet.public.blastapi.io',
            'https://developer-access-mainnet.base.org'
        ];
        
        let provider = null;
        let lastError = null;
        
        for (const rpcUrl of rpcUrls) {
            try {
                console.log('Trying RPC:', rpcUrl);
                // Ethers v6 syntax
                provider = new ethers.JsonRpcProvider(rpcUrl);
                
                // Test the connection
                const network = await provider.getNetwork();
                console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
                break;
            } catch (rpcError) {
                console.log('RPC failed:', rpcUrl, rpcError.message);
                lastError = rpcError;
                continue;
            }
        }
        
        if (!provider) {
            throw new Error(`All RPC providers failed. Last error: ${lastError?.message}`);
        }
        
        // Create contract instance (ethers v6 syntax)
        const contract = new ethers.Contract(FAUCET_CONTRACT_ADDRESS, contractABI, provider);
        
        try {
            // Get the current block number
            const currentBlock = await provider.getBlockNumber();
            console.log('Current block:', currentBlock);
            
            // Try to query events in smaller chunks to avoid RPC limits
            const blocksPerDay = 43200; // 86400 seconds / 2 seconds per block
            const chunkSize = 10000; // Query 10k blocks at a time
            let allEvents = [];
            let querySuccess = false;
            
            // Try different strategies based on what works
            try {
                // Strategy 1: Try last 7 days in chunks
                const daysToQuery = 7;
                const totalBlocks = blocksPerDay * daysToQuery;
                const fromBlock = Math.max(0, currentBlock - totalBlocks);
                
                console.log(`Attempting to query ${daysToQuery} days of events (${totalBlocks} blocks)`);
                
                // Query in chunks to avoid RPC limits
                for (let start = fromBlock; start < currentBlock; start += chunkSize) {
                    const end = Math.min(start + chunkSize - 1, currentBlock);
                    console.log(`Querying blocks ${start} to ${end}...`);
                    
                    try {
                        const filter = contract.filters.FundsDripped();
                        const events = await contract.queryFilter(filter, start, end);
                        allEvents = allEvents.concat(events);
                        console.log(`Found ${events.length} events in this chunk`);
                    } catch (chunkError) {
                        console.log(`Chunk failed: ${chunkError.message}`);
                        // Continue with other chunks
                    }
                }
                
                querySuccess = true;
                console.log(`Total events found: ${allEvents.length}`);
                
            } catch (strategyError) {
                console.log('Strategy 1 failed:', strategyError.message);
                
                // Strategy 2: Just try the last 1000 blocks
                try {
                    console.log('Trying fallback: last 1000 blocks only');
                    const filter = contract.filters.FundsDripped();
                    allEvents = await contract.queryFilter(filter, currentBlock - 1000, currentBlock);
                    querySuccess = true;
                    console.log(`Found ${allEvents.length} recent events`);
                } catch (fallbackError) {
                    console.log('Fallback also failed:', fallbackError.message);
                }
            }
            
            if (!querySuccess || allEvents.length === 0) {
                // If we can't get real events, return placeholder data
                console.log('Unable to fetch events, returning placeholder data');
                
                res.json({
                    totalClaims: 0,
                    claimsLast24h: 0,
                    source: 'blockchain',
                    contractAddress: FAUCET_CONTRACT_ADDRESS,
                    status: 'no-events',
                    message: 'Contract deployed but no events found or RPC limits exceeded',
                    currentBlock
                });
                return;
            }
            
            // Count total claims
            const totalClaims = allEvents.length;
            
            // Count claims in last 24 hours
            const last24HoursBlock = currentBlock - blocksPerDay;
            let claimsLast24h = 0;
            
            for (const event of allEvents) {
                if (event.blockNumber >= last24HoursBlock) {
                    claimsLast24h++;
                }
            }
            
            console.log(`Claims in last 24h: ${claimsLast24h}`);
            
            res.json({
                totalClaims,
                claimsLast24h,
                source: 'blockchain',
                contractAddress: FAUCET_CONTRACT_ADDRESS,
                currentBlock,
                eventsQueried: allEvents.length
            });
            
        } catch (queryError) {
            console.error('Error querying events:', queryError.message);
            
            // If querying events fails, try a simpler approach
            // Just check if contract exists and return placeholder data
            try {
                const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS);
                if (code === '0x') {
                    throw new Error('Contract not found at address');
                }
                
                console.log('Contract exists but event query failed, returning placeholder data');
                res.json({
                    totalClaims: 0,
                    claimsLast24h: 0,
                    source: 'blockchain',
                    contractAddress: FAUCET_CONTRACT_ADDRESS,
                    status: 'partial',
                    message: 'Contract found but unable to query events'
                });
            } catch (codeError) {
                throw new Error(`Contract verification failed: ${codeError.message}`);
            }
        }
        
    } catch (error) {
        console.error('Blockchain stats error:', error.message);
        console.error('Full error stack:', error.stack);
        
        // Return error but don't fail completely
        res.status(500).json({ 
            error: "Blockchain stats failed",
            message: error.message,
            fallback: true,
            timestamp: new Date().toISOString()
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
