import SwiftUI

struct FaucetView: View {
    @StateObject private var viewModel = FaucetViewModel()
    @EnvironmentObject var walletConnectManager: WalletConnectManager
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color(red: 0.4, green: 0.495, blue: 0.918), Color(red: 0.463, green: 0.294, blue: 0.635)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 16) {
                        // Header Card
                        VStack(spacing: 16) {
                            // Logo
                            ZStack {
                                RoundedRectangle(cornerRadius: 16)
                                    .fill(LinearGradient(
                                        colors: [Color(red: 0, green: 0.322, blue: 1), Color(red: 0, green: 0.831, blue: 1)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ))
                                    .frame(width: 64, height: 64)
                                
                                Text("💧")
                                    .font(.title)
                            }
                            
                            // Title
                            Text("Trickle")
                                .font(.largeTitle)
                                .fontWeight(.bold)
                                .foregroundStyle(LinearGradient(
                                    colors: [Color(red: 0, green: 0.322, blue: 1), Color(red: 0, green: 0.831, blue: 1)],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                ))
                            
                            // Subtitle
                            Text("Get $0.025 worth of ETH for gas fees on Base mainnet")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(32)
                        .background(Color.white.opacity(0.95))
                        .cornerRadius(24)
                        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                        
                        // Stats Cards
                        HStack(spacing: 8) {
                            StatsCard(title: "Total Claims", value: "\(viewModel.totalClaims)")
                            StatsCard(title: "Today", value: "\(viewModel.dailyClaims)")
                        }
                        
                        // Main Action Card
                        VStack(spacing: 16) {
                            if !viewModel.isConnected {
                                // Connect Wallet Button
                                Button(action: {
                                    viewModel.connectWallet(using: walletConnectManager)
                                }) {
                                    HStack {
                                        if viewModel.isLoading {
                                            ProgressView()
                                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                .scaleEffect(0.8)
                                        } else {
                                            Text("🔗 Connect Wallet")
                                                .font(.body)
                                                .fontWeight(.semibold)
                                        }
                                    }
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 56)
                                    .background(Color(red: 0, green: 0.322, blue: 1))
                                    .foregroundColor(.white)
                                    .cornerRadius(12)
                                }
                                .disabled(viewModel.isLoading)
                            } else {
                                // Wallet Connected Section
                                VStack(spacing: 16) {
                                    // Wallet Info
                                    VStack(spacing: 8) {
                                        Text("Connected Wallet")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                        
                                        if let address = viewModel.walletAddress {
                                            Text("\(String(address.prefix(6)))...\(String(address.suffix(4)))")
                                                .font(.body)
                                                .fontWeight(.semibold)
                                                .foregroundColor(Color(red: 0, green: 0.322, blue: 1))
                                        }
                                    }
                                    .padding()
                                    .background(Color(red: 0.973, green: 0.976, blue: 1))
                                    .cornerRadius(12)
                                    
                                    // Claim Button
                                    Button(action: {
                                        viewModel.claimTokens(using: walletConnectManager)
                                    }) {
                                        HStack {
                                            if viewModel.isLoading {
                                                ProgressView()
                                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    .scaleEffect(0.8)
                                            } else {
                                                Text(viewModel.canClaim ? "🪙 Claim ETH" : "⏰ Cooldown Active")
                                                    .font(.body)
                                                    .fontWeight(.semibold)
                                            }
                                        }
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 56)
                                        .background(viewModel.canClaim ? Color(red: 0, green: 0.322, blue: 1) : Color.gray)
                                        .foregroundColor(.white)
                                        .cornerRadius(12)
                                    }
                                    .disabled(viewModel.isLoading || !viewModel.canClaim)
                                    
                                    // Disconnect Button
                                    Button("Disconnect Wallet") {
                                        viewModel.disconnectWallet(using: walletConnectManager)
                                    }
                                    .font(.body)
                                    .foregroundColor(.secondary)
                                }
                            }
                            
                            // Error/Success Messages
                            if let errorMessage = viewModel.errorMessage {
                                VStack {
                                    Text("❌ \(errorMessage)")
                                        .font(.body)
                                        .foregroundColor(Color(red: 0.447, green: 0.110, blue: 0.141))
                                        .multilineTextAlignment(.center)
                                }
                                .padding()
                                .background(Color(red: 0.973, green: 0.843, blue: 0.855))
                                .cornerRadius(12)
                            }
                            
                            if let successMessage = viewModel.successMessage {
                                VStack {
                                    Text("✅ \(successMessage)")
                                        .font(.body)
                                        .foregroundColor(Color(red: 0.082, green: 0.341, blue: 0.141))
                                        .multilineTextAlignment(.center)
                                }
                                .padding()
                                .background(Color(red: 0.831, green: 0.929, blue: 0.855))
                                .cornerRadius(12)
                            }
                        }
                        .padding(24)
                        .background(Color.white.opacity(0.95))
                        .cornerRadius(24)
                        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
                        
                        // Footer
                        VStack(spacing: 8) {
                            Text("⏰ 24 hour cooldown • ⛽ You pay gas fees")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                            Text("Powered by Base Network")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        .multilineTextAlignment(.center)
                        
                        Spacer(minLength: 20)
                    }
                    .padding(16)
                }
            }
        }
        .onAppear {
            viewModel.loadStats()
        }
    }
}

struct StatsCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(Color(red: 0, green: 0.322, blue: 1))
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.white.opacity(0.9))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}

struct FaucetView_Previews: PreviewProvider {
    static var previews: some View {
        FaucetView()
            .environmentObject(WalletConnectManager())
    }
}