import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FAUCET_CONTRACT_ADDRESS = '0x52dA60097d20F5AE30a3A620095139B10a7B1734'

export async function GET(request: NextRequest) {
  try {
    const { ethers } = await import('ethers')
    
    const provider = new ethers.JsonRpcProvider('https://base-rpc.publicnode.com')
    const currentBlock = await provider.getBlockNumber()
    
    // Check if contract exists
    const code = await provider.getCode(FAUCET_CONTRACT_ADDRESS)
    const contractExists = code !== '0x'
    
    if (!contractExists) {
      return NextResponse.json({
        error: 'Contract does not exist at this address',
        address: FAUCET_CONTRACT_ADDRESS
      })
    }
    
    // Query ALL events (not just FundsDripped) from last 1 day
    const blocksPerDay = 43200
    const fromBlock = Math.max(0, currentBlock - blocksPerDay)
    
    console.log(`Querying ALL events from ${fromBlock} to ${currentBlock}`)
    
    // Query all logs without filtering by event signature
    const logs = await provider.getLogs({
      address: FAUCET_CONTRACT_ADDRESS,
      fromBlock,
      toBlock: currentBlock
    })
    
    console.log(`Found ${logs.length} total logs`)
    
    // Try to parse with different event signatures
    const eventSignatures = [
      "event FundsDripped(address indexed recipient, uint256 amount)",
      "event TokensClaimed(address indexed recipient, uint256 amount)",
      "event Claimed(address indexed recipient, uint256 amount)",
      "event Drip(address indexed recipient, uint256 amount)",
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ]
    
    const parsedEvents: any = {}
    
    for (const sig of eventSignatures) {
      try {
        const iface = new ethers.Interface([sig])
        const eventName = sig.match(/event (\w+)/)?.[1] || 'Unknown'
        const parsed = logs.map(log => {
          try {
            return iface.parseLog({ topics: log.topics as string[], data: log.data })
          } catch {
            return null
          }
        }).filter(e => e !== null)
        
        if (parsed.length > 0) {
          parsedEvents[eventName] = {
            count: parsed.length,
            samples: parsed.slice(0, 3).map(e => ({
              args: e?.args ? Object.keys(e.args).reduce((acc: any, key) => {
                if (isNaN(Number(key))) {
                  acc[key] = e.args[key]?.toString()
                }
                return acc
              }, {}) : null
            }))
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    return NextResponse.json({
      contractAddress: FAUCET_CONTRACT_ADDRESS,
      contractExists: true,
      currentBlock,
      queryRange: {
        from: fromBlock,
        to: currentBlock,
        blocks: currentBlock - fromBlock
      },
      totalLogsFound: logs.length,
      rawLogs: logs.slice(0, 5).map(log => ({
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        topics: log.topics,
        data: log.data
      })),
      parsedEvents,
      message: logs.length === 0 
        ? 'No events found in last 24 hours - contract may be inactive or events are older'
        : `Found ${logs.length} events - check parsedEvents to see what they are`
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
