import SwiftUI

@main
struct TrickleFaucetApp: App {
    @StateObject private var walletConnectManager = WalletConnectManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(walletConnectManager)
                .onOpenURL { url in
                    // Handle deep links from wallet apps
                    walletConnectManager.handleDeepLink(url)
                }
        }
    }
}