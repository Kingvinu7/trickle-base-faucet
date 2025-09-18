package com.trickle.faucet

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity

/**
 * Activity to handle WalletConnect redirects from wallet apps
 */
class WalletConnectRedirectActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Handle the redirect by forwarding to MainActivity
        val intent = Intent(this, MainActivity::class.java).apply {
            // Forward any data from the redirect
            data = intent.data
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        
        startActivity(intent)
        finish() // Close this activity immediately
    }
}