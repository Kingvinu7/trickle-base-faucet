import SwiftUI
import Foundation

@MainActor
class FaucetViewModel: ObservableObject {
    @Published var isConnected = false
    @Published var walletAddress: String?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var successMessage: String?
    @Published var totalClaims = 0
    @Published var dailyClaims = 0
    @Published var canClaim = true
    @Published var nextClaimTime: String?
    
    private let faucetContractAddress = "0x8D08e77837c28fB271D843d84900544cA46bA2F3"
    private let baseRpcUrl = "https://mainnet.base.org"
    
    func connectWallet(using walletConnectManager: WalletConnectManager) {
        isLoading = true
        clearMessages()
        
        Task {
            do {
                let session = try await walletConnectManager.connect()
                if let account = session.accounts.first {
                    // Extract address from account (format: eip155:8453:0x...)
                    let address = String(account.split(separator: ":").last ?? "")
                    await MainActor.run {
                        self.walletAddress = address
                        self.isConnected = true
                        self.isLoading = false
                        self.successMessage = "Wallet connected successfully!"
                        self.clearMessagesAfterDelay()
                    }
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Connection failed: \(error.localizedDescription)"
                    self.clearMessagesAfterDelay()
                }
            }
        }
    }
    
    func disconnectWallet(using walletConnectManager: WalletConnectManager) {
        Task {
            do {
                try await walletConnectManager.disconnect()
                await MainActor.run {
                    self.isConnected = false
                    self.walletAddress = nil
                    self.successMessage = "Wallet disconnected"
                    self.clearMessagesAfterDelay()
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = "Disconnect failed: \(error.localizedDescription)"
                    self.clearMessagesAfterDelay()
                }
            }
        }
    }
    
    func claimTokens(using walletConnectManager: WalletConnectManager) {
        guard let address = walletAddress else {
            errorMessage = "Please connect your wallet first"
            clearMessagesAfterDelay()
            return
        }
        
        isLoading = true
        clearMessages()
        
        Task {
            do {
                // Check eligibility first
                let eligibility = try await checkEligibility(address: address)
                if !eligibility.eligible {
                    await MainActor.run {
                        self.isLoading = false
                        self.errorMessage = eligibility.message
                        self.canClaim = false
                        self.nextClaimTime = eligibility.nextClaimTime
                        self.clearMessagesAfterDelay()
                    }
                    return
                }
                
                // Create transaction
                let transaction = createClaimTransaction(from: address)
                
                // Send transaction via WalletConnect
                let txHash = try await walletConnectManager.sendTransaction(transaction)
                
                // Log the claim
                try await logClaim(address: address, txHash: txHash)
                
                await MainActor.run {
                    self.isLoading = false
                    self.successMessage = "Claim successful! Transaction: \(txHash.prefix(10))..."
                    self.loadStats()
                    self.clearMessagesAfterDelay()
                }
                
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Claim failed: \(error.localizedDescription)"
                    self.clearMessagesAfterDelay()
                }
            }
        }
    }
    
    func loadStats() {
        Task {
            do {
                let stats = try await fetchStats()
                await MainActor.run {
                    self.totalClaims = stats.totalClaims
                    self.dailyClaims = stats.dailyClaims
                }
            } catch {
                // Handle error silently for stats
                print("Failed to load stats: \(error)")
            }
        }
    }
    
    // MARK: - Private Methods
    
    private func checkEligibility(address: String) async throws -> (eligible: Bool, message: String, nextClaimTime: String?) {
        // Replace with your actual API endpoint
        guard let url = URL(string: "https://your-api-endpoint.com/check-eligibility") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["address": address]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        struct EligibilityResponse: Codable {
            let eligible: Bool
            let message: String?
            let nextClaimTime: String?
        }
        
        let response = try JSONDecoder().decode(EligibilityResponse.self, from: data)
        return (response.eligible, response.message ?? "", response.nextClaimTime)
    }
    
    private func createClaimTransaction(from address: String) -> [String: Any] {
        // Function signature for requestTokens()
        let functionSignature = "0x9fbc8713"
        
        return [
            "from": address,
            "to": faucetContractAddress,
            "data": functionSignature,
            "value": "0x0"
        ]
    }
    
    private func logClaim(address: String, txHash: String) async throws {
        // Replace with your actual API endpoint
        guard let url = URL(string: "https://your-api-endpoint.com/log-claim") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["address": address, "txHash": txHash]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    private func fetchStats() async throws -> (totalClaims: Int, dailyClaims: Int) {
        // Replace with your actual API endpoint
        guard let url = URL(string: "https://your-api-endpoint.com/stats") else {
            throw URLError(.badURL)
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        
        struct StatsResponse: Codable {
            let totalClaims: Int
            let claimsLast24h: Int
        }
        
        let response = try JSONDecoder().decode(StatsResponse.self, from: data)
        return (response.totalClaims, response.claimsLast24h)
    }
    
    private func clearMessages() {
        errorMessage = nil
        successMessage = nil
    }
    
    private func clearMessagesAfterDelay() {
        Task {
            try await Task.sleep(nanoseconds: 3_000_000_000) // 3 seconds
            await MainActor.run {
                self.clearMessages()
            }
        }
    }
}