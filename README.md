# Trickle Base Faucet - WalletConnect Integration

A multi-platform faucet application for Base mainnet with WalletConnect support across Web, Android, and iOS platforms.

## 🚀 Features

- **Multi-platform support**: Web, Android (native), iOS (native)
- **WalletConnect integration**: Connect with 300+ wallets
- **Base mainnet support**: Get ETH for gas fees on Base
- **24-hour cooldown**: Prevents spam and ensures fair distribution
- **Real-time stats**: Track total claims and daily usage
- **Modern UI**: Beautiful, responsive design across all platforms

## 🌐 Platform

### Next.js Web Frontend
- Built with Next.js 14 and TypeScript
- Uses Web3Modal v4 for wallet connections
- Supports 300+ WalletConnect-compatible wallets
- Modern responsive design with Tailwind CSS
- Framer Motion animations
- Production-ready deployment configuration

## 🛠️ Setup Instructions

### Prerequisites

1. **WalletConnect Project ID**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project
   - Copy your Project ID

2. **Environment Variables**
   ```bash
   WALLETCONNECT_PROJECT_ID=your_project_id_here
   DATABASE_URL=your_database_connection_string
   FAUCET_CONTRACT_ADDRESS=0x8D08e77837c28fB271D843d84900544cA46bA2F3
   ```

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your WalletConnect Project ID
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

6. **Deploy to Vercel**
   - Push to GitHub and connect to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically

### Automated Setup

Use the setup script for guided configuration:

```bash
cd frontend
./setup-frontend.sh
```

## 🔧 Configuration

### WalletConnect Configuration

Update the configuration in `/wallet-config.js`:

```javascript
export const WALLETCONNECT_CONFIG = {
    projectId: 'your_project_id_here',
    metadata: {
        name: 'Your App Name',
        description: 'Your App Description',
        url: 'https://your-domain.com',
        icons: ['https://your-domain.com/favicon.ico']
    }
};
```

### Network Configuration

The app is configured for Base mainnet by default. To add other networks, update `/shared/constants.js`:

```javascript
export const NETWORKS = {
    BASE_MAINNET: {
        chainId: 8453,
        name: 'Base Mainnet',
        rpcUrl: 'https://mainnet.base.org',
        // ... other config
    }
    // Add more networks here
};
```

### Contract Configuration

Update the faucet contract address in `/shared/constants.js`:

```javascript
export const CONTRACTS = {
    FAUCET: {
        address: '0xYourContractAddress',
        // ... ABI and other config
    }
};
```

## 🚀 Deployment

### Web Deployment (Vercel)

1. **Connect Repository**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the Node.js project

2. **Environment Variables**
   Set the following in Vercel dashboard:
   ```
   WALLETCONNECT_PROJECT_ID=your_project_id
   DATABASE_URL=your_database_url
   NODE_ENV=production
   ```

3. **Deploy**
   - Push to main branch to trigger deployment
   - Vercel will build and deploy automatically

### Android Deployment (Google Play)

1. **Generate Signed APK**
   ```bash
   cd mobile/android
   ./gradlew assembleRelease
   ```

2. **Upload to Google Play Console**
   - Create app listing
   - Upload APK/AAB
   - Configure store listing and pricing

### iOS Deployment (App Store)

1. **Archive in Xcode**
   - Select "Any iOS Device" as target
   - Product → Archive
   - Upload to App Store Connect

2. **App Store Connect**
   - Configure app metadata
   - Submit for review

## 🔗 Deep Linking

### URL Schemes

- **iOS**: `trickle://`
- **Android**: `trickle://`
- **Universal**: `https://your-domain.com/app`

### Implementation

The apps handle deep links to redirect users back from wallet apps after signing transactions.

## 🧪 Testing

### Web Testing

1. **Local Testing**
   ```bash
   npm run dev
   # Open http://localhost:3001
   ```

2. **Wallet Testing**
   - Test with MetaMask browser extension
   - Test with WalletConnect mobile wallets
   - Test on different devices and browsers

### Mobile Testing

1. **Android Testing**
   - Test on physical devices
   - Test deep linking with wallet apps
   - Test on different Android versions

2. **iOS Testing**
   - Test on physical devices
   - Test universal links
   - Test on different iOS versions

## 📚 API Documentation

### Endpoints

- `POST /check-eligibility` - Check if address can claim
- `POST /log-claim` - Log successful claim
- `GET /stats` - Get database statistics
- `GET /blockchain-stats` - Get blockchain statistics
- `GET /health` - Health check

### Example Usage

```javascript
// Check eligibility
const eligibility = await checkEligibility(walletAddress);

// Log claim
await logClaim(walletAddress, transactionHash);

// Get stats
const stats = await getCombinedStats();
```

## 🛡️ Security Considerations

1. **Rate Limiting**: Implement rate limiting on API endpoints
2. **Input Validation**: Validate all user inputs
3. **HTTPS Only**: Use HTTPS in production
4. **Environment Variables**: Keep sensitive data in environment variables
5. **Audit**: Regular security audits of smart contracts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Community**: Join our Discord for community support

## 🔄 Updates

### v1.0.0
- Initial release with WalletConnect integration
- Multi-platform support (Web, Android, iOS)
- Base mainnet support
- 24-hour cooldown system

---

**Built with ❤️ for the Base ecosystem**