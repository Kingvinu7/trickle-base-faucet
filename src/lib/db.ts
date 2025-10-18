import { Pool } from 'pg'

// Create a singleton pool instance
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for most hosted databases
      },
      // Connection pool settings
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
    
    console.log('PostgreSQL connection pool created')
  }
  
  return pool
}

// Initialize database schema
export async function initializeDatabase() {
  const pool = getPool()
  
  try {
    // Drop existing table if it exists (clean slate)
    // Comment this out after first successful deployment
    await pool.query(`DROP TABLE IF EXISTS claims CASCADE`)
    console.log('Dropped existing claims table if present')
    
    // Create claims table with correct schema
    await pool.query(`
      CREATE TABLE claims (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) NOT NULL,
        tx_hash VARCHAR(66) NOT NULL UNIQUE,
        claim_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        farcaster_fid INTEGER,
        farcaster_username VARCHAR(255),
        farcaster_display_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `)
    console.log('Created claims table')
    
    // Create index on claim_timestamp for faster queries
    await pool.query(`
      CREATE INDEX idx_claims_timestamp ON claims(claim_timestamp DESC)
    `)
    console.log('Created timestamp index')
    
    // Create index on farcaster_fid for filtering
    await pool.query(`
      CREATE INDEX idx_claims_farcaster_fid ON claims(farcaster_fid) WHERE farcaster_fid IS NOT NULL
    `)
    console.log('Created farcaster_fid index')
    
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Save a claim to the database
export async function saveClaim(data: {
  address: string
  txHash: string
  farcasterUser?: {
    fid: number
    username: string
    displayName: string
  }
}) {
  const pool = getPool()
  
  const query = `
    INSERT INTO claims (address, tx_hash, farcaster_fid, farcaster_username, farcaster_display_name, claim_timestamp)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (tx_hash) DO NOTHING
    RETURNING *
  `
  
  const values = [
    data.address.toLowerCase(),
    data.txHash,
    data.farcasterUser?.fid || null,
    data.farcasterUser?.username || null,
    data.farcasterUser?.displayName || null,
  ]
  
  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (error) {
    console.error('Failed to save claim:', error)
    throw error
  }
}

// Get recent claims (optionally filter by Farcaster only)
export async function getRecentClaims(limit: number = 20, farcasterOnly: boolean = true) {
  const pool = getPool()
  
  const whereClause = farcasterOnly ? 'WHERE farcaster_fid IS NOT NULL' : ''
  
  const query = `
    SELECT 
      address,
      tx_hash as "txHash",
      claim_timestamp,
      farcaster_fid as fid,
      farcaster_username as username,
      farcaster_display_name as "displayName"
    FROM claims
    ${whereClause}
    ORDER BY claim_timestamp DESC
    LIMIT $1
  `
  
  try {
    const result = await pool.query(query, [limit])
    
    // Transform to match the expected format
    return result.rows.map(row => ({
      address: row.address,
      txHash: row.txHash,
      timestamp: row.claim_timestamp.toISOString(),
      ...(row.fid && {
        farcasterUser: {
          fid: row.fid,
          username: row.username,
          displayName: row.displayName
        }
      })
    }))
  } catch (error) {
    console.error('Failed to get recent claims:', error)
    throw error
  }
}
