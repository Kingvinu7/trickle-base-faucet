package com.trickle.faucet

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.trickle.faucet.ui.theme.TrickleFaucetTheme
import com.trickle.faucet.ui.screens.FaucetScreen
import com.trickle.faucet.viewmodel.FaucetViewModel

class MainActivity : ComponentActivity() {
    
    private val faucetViewModel: FaucetViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            TrickleFaucetTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FaucetScreen(
                        viewModel = faucetViewModel,
                        onWalletConnect = { faucetViewModel.connectWallet() }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Handle any deep link or redirect from wallet apps
        faucetViewModel.handleAppResume()
    }
}