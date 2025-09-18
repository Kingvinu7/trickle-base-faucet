import SwiftUI

struct ContentView: View {
    @EnvironmentObject var walletConnectManager: WalletConnectManager
    
    var body: some View {
        NavigationView {
            FaucetView()
                .navigationTitle("")
                .navigationBarHidden(true)
        }
        .navigationViewStyle(StackNavigationViewStyle())
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(WalletConnectManager())
    }
}