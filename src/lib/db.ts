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
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'claims'
      )
    `)
    
    if (!tableExists.rows[0].exists) {
      // Table doesn't exist - create it with full schema
      await pool.query(`
        CREATE TABLE claims (
          id SERIAL PRIMARY KEY,
          address VARCHAR(42) NOT NULL,
          tx_hash VARCHAR(66) NOT NULL UNIQUE,
          claim_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          network VARCHAR(50) DEFAULT 'base',
          farcaster_fid INTEGER,
          farcaster_username VARCHAR(255),
          farcaster_display_name VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `)
      console.log('✅ Created claims table')
      
      // Create index on claim_timestamp for faster queries
      await pool.query(`
        CREATE INDEX idx_claims_timestamp ON claims(claim_timestamp DESC)
      `)
      console.log('✅ Created timestamp index')
      
      // Create index on farcaster_fid for filtering
      await pool.query(`
        CREATE INDEX idx_claims_farcaster_fid ON claims(farcaster_fid) WHERE farcaster_fid IS NOT NULL
      `)
      console.log('✅ Created farcaster_fid index')
    } else {
      console.log('✅ Claims table already exists')
      
      // Run migrations for existing table
      // Migration 1: Add network column if it doesn't exist
      const networkColumnExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'claims' AND column_name = 'network'
        )
      `)
      
      if (!networkColumnExists.rows[0].exists) {
        await pool.query(`
          ALTER TABLE claims 
          ADD COLUMN network VARCHAR(50) DEFAULT 'base'
        `)
        console.log('✅ Migration: Added network column')
        
        // Backfill existing rows to have 'base' as default
        await pool.query(`
          UPDATE claims 
          SET network = 'base' 
          WHERE network IS NULL
        `)
        console.log('✅ Migration: Backfilled network column with "base"')
      } else {
        console.log('✅ Network column already exists')
      }
    }
    
    console.log('✅ Database schema initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    throw error
  }
}

// Save a claim to the database
export async function saveClaim(data: {
  address: string
  txHash: string
  network?: string
  farcasterUser?: {
    fid: number
    username: string
    displayName: string
  }
}) {
  const pool = getPool()
  
  const query = `
    INSERT INTO claims (address, tx_hash, network, farcaster_fid, farcaster_username, farcaster_display_name, claim_timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (tx_hash) DO NOTHING
    RETURNING *
  `
  
  const values = [
    data.address.toLowerCase(),
    data.txHash,
    data.network || 'base',
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
  
  const whereClause = farcasterOnly ? 'WHERE c.farcaster_fid IS NOT NULL' : ''
  
  const query = `
    WITH user_mon_stats AS (
      SELECT 
        c2.farcaster_fid,
        COUNT(*) FILTER (WHERE c2.network = 'monad-testnet' AND c2.claim_timestamp > NOW() - INTERVAL '24 hours') as mon_claims_today
      FROM claims c2
      WHERE c2.farcaster_fid IS NOT NULL AND c2.network = 'monad-testnet'
      GROUP BY c2.farcaster_fid
    )
    SELECT 
      c.address,
      c.tx_hash as "txHash",
      c.claim_timestamp,
      c.network,
      c.farcaster_fid as fid,
      c.farcaster_username as username,
      c.farcaster_display_name as "displayName",
      COALESCE(ums.mon_claims_today, 0) as mon_claims_today
    FROM claims c
    LEFT JOIN user_mon_stats ums ON c.farcaster_fid = ums.farcaster_fid
    ${whereClause}
    ORDER BY c.claim_timestamp DESC
    LIMIT $1
  `
  
  try {
    const result = await pool.query(query, [limit])
    
    // Transform to match the expected format
    return result.rows.map(row => ({
      address: row.address,
      txHash: row.txHash,
      timestamp: row.claim_timestamp.toISOString(),
      network: row.network || 'base',
      monClaimsToday: Number(row.mon_claims_today) || 0,
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
