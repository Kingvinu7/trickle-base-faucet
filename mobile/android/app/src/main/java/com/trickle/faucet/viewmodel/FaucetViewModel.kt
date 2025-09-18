package com.trickle.faucet.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.walletconnect.android.Core
import com.walletconnect.sign.client.Sign
import com.walletconnect.sign.client.SignClient
import com.walletconnect.web3.modal.client.Web3Modal
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.web3j.crypto.Credentials
import org.web3j.protocol.Web3j
import org.web3j.protocol.http.HttpService
import org.web3j.tx.gas.DefaultGasProvider
import java.math.BigInteger

data class FaucetUiState(
    val isConnected: Boolean = false,
    val walletAddress: String? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val totalClaims: Int = 0,
    val dailyClaims: Int = 0,
    val canClaim: Boolean = true,
    val nextClaimTime: String? = null
)

class FaucetViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(FaucetUiState())
    val uiState: StateFlow<FaucetUiState> = _uiState.asStateFlow()

    private val web3j = Web3j.build(HttpService("https://mainnet.base.org"))
    private val faucetContractAddress = "0x8D08e77837c28fB271D843d84900544cA46bA2F3"
    
    private var currentSession: Sign.Model.Session? = null

    init {
        setupWalletConnectCallbacks()
        loadStats()
    }

    private fun setupWalletConnectCallbacks() {
        val wcDelegate = object : SignClient.WalletDelegate {
            override fun onSessionApproved(approvedSession: Sign.Model.Session) {
                currentSession = approvedSession
                val address = approvedSession.accounts.firstOrNull()?.split(":")?.lastOrNull()
                _uiState.value = _uiState.value.copy(
                    isConnected = true,
                    walletAddress = address,
                    isLoading = false,
                    successMessage = "Wallet connected successfully!"
                )
                clearMessages()
            }

            override fun onSessionRejected(rejectedSession: Sign.Model.SessionRequestResponse) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Connection rejected by wallet"
                )
                clearMessages()
            }

            override fun onSessionDelete(deletedSession: Sign.Model.SessionDelete) {
                currentSession = null
                _uiState.value = _uiState.value.copy(
                    isConnected = false,
                    walletAddress = null,
                    successMessage = "Wallet disconnected"
                )
                clearMessages()
            }

            override fun onSessionExtend(session: Sign.Model.Session) {
                currentSession = session
            }

            override fun onSessionRequestResponse(response: Sign.Model.SessionRequestResponse) {
                // Handle transaction responses
                when (response) {
                    is Sign.Model.SessionRequestResponse.Result -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            successMessage = "Transaction submitted successfully!"
                        )
                        loadStats() // Refresh stats after successful transaction
                    }
                    is Sign.Model.SessionRequestResponse.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = "Transaction failed: ${response.error.message}"
                        )
                    }
                }
                clearMessages()
            }

            override fun onConnectionStateChange(state: Sign.Model.ConnectionState) {
                // Handle connection state changes
            }

            override fun onError(error: Sign.Model.Error) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "WalletConnect error: ${error.throwable.message}"
                )
                clearMessages()
            }
        }

        SignClient.setWalletDelegate(wcDelegate)
    }

    fun connectWallet() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                // Open Web3Modal
                Web3Modal.open { error ->
                    if (error != null) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = "Failed to open wallet selection: ${error.throwable.message}"
                        )
                        clearMessages()
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Connection failed: ${e.message}"
                )
                clearMessages()
            }
        }
    }

    fun disconnectWallet() {
        viewModelScope.launch {
            currentSession?.let { session ->
                val disconnect = Sign.Params.Disconnect(
                    sessionTopic = session.topic,
                    reason = Sign.Model.DeletedSession.Reason(
                        code = 6000,
                        message = "User disconnected"
                    )
                )
                
                SignClient.disconnect(disconnect) { error ->
                    error?.let {
                        _uiState.value = _uiState.value.copy(
                            errorMessage = "Disconnect failed: ${it.throwable.message}"
                        )
                        clearMessages()
                    }
                }
            }
        }
    }

    fun claimTokens() {
        viewModelScope.launch {
            val address = _uiState.value.walletAddress
            if (address == null || currentSession == null) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Please connect your wallet first"
                )
                clearMessages()
                return@launch
            }

            _uiState.value = _uiState.value.copy(isLoading = true)

            try {
                // Check eligibility first
                val eligibility = checkEligibility(address)
                if (!eligibility.first) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = eligibility.second,
                        canClaim = false,
                        nextClaimTime = eligibility.third
                    )
                    clearMessages()
                    return@launch
                }

                // Create transaction request
                val transaction = createClaimTransaction(address)
                
                val sessionRequest = Sign.Params.SessionRequest(
                    sessionTopic = currentSession!!.topic,
                    request = Sign.Model.SessionRequest(
                        id = System.currentTimeMillis(),
                        method = "eth_sendTransaction",
                        params = listOf(transaction)
                    ),
                    chainId = "eip155:8453" // Base chain
                )

                SignClient.request(sessionRequest) { error ->
                    if (error != null) {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = "Transaction request failed: ${error.throwable.message}"
                        )
                        clearMessages()
                    }
                }

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Claim failed: ${e.message}"
                )
                clearMessages()
            }
        }
    }

    private suspend fun checkEligibility(address: String): Triple<Boolean, String, String?> {
        // Implementation to check eligibility via API
        // This should call your backend API
        return try {
            // Mock implementation - replace with actual API call
            Triple(true, "", null)
        } catch (e: Exception) {
            Triple(false, "Eligibility check failed: ${e.message}", null)
        }
    }

    private fun createClaimTransaction(address: String): Map<String, String> {
        // Create transaction data for requestTokens() function call
        val functionSignature = "0x9fbc8713" // keccak256("requestTokens()")
        
        return mapOf(
            "from" to address,
            "to" to faucetContractAddress,
            "data" to functionSignature,
            "value" to "0x0"
        )
    }

    private fun loadStats() {
        viewModelScope.launch {
            try {
                // Mock implementation - replace with actual API call to your backend
                _uiState.value = _uiState.value.copy(
                    totalClaims = 0,
                    dailyClaims = 0
                )
            } catch (e: Exception) {
                // Handle error silently for stats
            }
        }
    }

    fun handleAppResume() {
        // Handle any pending wallet responses when app resumes
        // This is useful for deep linking scenarios
    }

    private fun clearMessages() {
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000) // Show message for 3 seconds
            _uiState.value = _uiState.value.copy(
                errorMessage = null,
                successMessage = null
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    fun clearSuccess() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }
}