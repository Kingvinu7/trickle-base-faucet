package com.trickle.faucet

import android.app.Application
import com.walletconnect.android.Core
import com.walletconnect.android.CoreClient
import com.walletconnect.android.relay.ConnectionType
import com.walletconnect.sign.client.Sign
import com.walletconnect.sign.client.SignClient
import com.walletconnect.web3.modal.client.Modal
import com.walletconnect.web3.modal.client.Web3Modal

class TrickleApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        
        initializeWalletConnect()
    }

    private fun initializeWalletConnect() {
        // Initialize Core Client
        val serverUrl = "relay.walletconnect.com"
        val connectionType = ConnectionType.AUTOMATIC
        val application = this
        val metaData = Core.Model.AppMetaData(
            name = "Trickle - Base Faucet",
            description = "Get gas fees for Base mainnet",
            url = "https://your-domain.com",
            icons = listOf("https://your-domain.com/favicon.ico"),
            redirect = "trickle://request"
        )

        CoreClient.initialize(
            relayServerUrl = serverUrl,
            connectionType = connectionType,
            application = application,
            metaData = metaData
        ) { error ->
            // Handle initialization error
            error?.let {
                println("WalletConnect Core initialization error: ${it.throwable}")
            }
        }

        // Initialize Sign Client
        val init = Sign.Params.Init(core = CoreClient)
        SignClient.initialize(init) { error ->
            error?.let {
                println("WalletConnect Sign initialization error: ${it.throwable}")
            }
        }

        // Initialize Web3Modal
        val projectId = "YOUR_PROJECT_ID" // Replace with your actual project ID
        val initParams = Modal.Params.Init(
            core = CoreClient,
            projectId = projectId
        )

        Web3Modal.initialize(initParams) { error ->
            error?.let {
                println("Web3Modal initialization error: ${it.throwable}")
            }
        }
    }
}