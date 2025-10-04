# Trickle Base Faucet - Next.js Frontend

A modern, responsive web application for claiming ETH on Base mainnet with WalletConnect integration.

## ✨ Features

- 🔗 **WalletConnect Integration**: Connect with 300+ wallets
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS & Framer Motion
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast**: Built with Next.js 14 and App Router
- 🔒 **Type Safe**: Full TypeScript support
- 🌐 **Multi-Chain Ready**: Easily extendable to other networks
- 📊 **Real-time Stats**: Live claim statistics and eligibility checking
- 🎯 **Smart Error Handling**: User-friendly error messages
- 🚀 **Production Ready**: Optimized for deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Web3**: Wagmi + Viem
- **WalletConnect SDK**: Web3Modal v4 (supports 300+ wallets)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner

## 🔗 WalletConnect SDK Integration

This project integrates **WalletConnect SDK v4** to provide comprehensive wallet support:

### Key Features:
- ✅ **300+ Wallet Support**: MetaMask, Coinbase Wallet, Trust Wallet, and many more
- ✅ **Multi-Platform**: Desktop, mobile, and browser extension wallets
- ✅ **QR Code Connection**: Easy mobile wallet connection via QR scanning
- ✅ **Deep Links**: Direct wallet app integration on mobile devices
- ✅ **Session Management**: Persistent wallet connections across browser sessions

### WalletConnect Packages Used:
- `@web3modal/wagmi` - Main WalletConnect modal integration
- `@wagmi/core` - Core Web3 functionality
- `wagmi` - React hooks for Web3 interactions
- `viem` - Low-level Ethereum interactions

### Configuration:
- Project ID: Configured via `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Supported Networks: Base Mainnet (extensible to other chains)
- Wallet Types: Injected, WalletConnect, Coinbase Wallet

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- WalletConnect Project ID (get from [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your WalletConnect Project ID:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Automated Setup

Run the setup script for guided configuration:

```bash
./setup-frontend.sh
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes (proxy to backend)
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── faucet-card.tsx # Main faucet interface
│   │   ├── header.tsx      # App header
│   │   ├── footer.tsx      # App footer
│   │   ├── stats-cards.tsx # Statistics display
│   │   └── providers.tsx   # App providers
│   ├── config/             # Configuration
│   │   ├── wagmi.ts        # WalletConnect & Wagmi config
│   │   └── constants.ts    # App constants
│   ├── hooks/              # Custom React hooks
│   │   ├── use-stats.ts    # Statistics hook
│   │   ├── use-eligibility.ts # Eligibility checking
│   │   └── use-faucet-claim.ts # Claim functionality
│   └── lib/                # Utilities
│       └── utils.ts        # Helper functions
├── public/                 # Static assets
├── .env.example           # Environment template
├── .env.local            # Local environment (gitignored)
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Project ID | Yes |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | Yes |
| `API_BASE_URL` | Backend API base URL (for API routes) | Yes |
| `NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS` | Override contract address | No |

### WalletConnect Configuration

Edit `src/config/wagmi.ts` to customize:

- **Supported chains**: Add/remove blockchain networks
- **Featured wallets**: Highlight specific wallets
- **Theme**: Customize modal appearance
- **Metadata**: Update app information

### Contract Configuration

Edit `src/config/constants.ts` to update:

- **Contract address**: Faucet smart contract
- **Contract ABI**: Smart contract interface
- **Network settings**: RPC URLs, explorers
- **App settings**: Claim amounts, cooldowns

## 🎨 UI Customization

### Theming

The app uses a custom design system built on Tailwind CSS:

- **Colors**: Defined in `tailwind.config.ts`
- **Components**: Styled with CSS classes
- **Animations**: Framer Motion for smooth interactions
- **Responsive**: Mobile-first design approach

### Custom Colors

```css
/* Trickle brand colors */
--trickle-blue: #0052FF
--trickle-blue-light: #00D4FF
--trickle-gradient-from: #667eea
--trickle-gradient-to: #764ba2
```

### Component Library

The app includes reusable components:

- `Button`: Styled button with variants
- `Progress`: Animated progress bar
- `Card`: Container with glass morphism effect
- `Toast`: Notification system

## 🔗 API Integration

The frontend communicates with your backend through Next.js API routes:

### API Routes

- `GET /api/stats` - Get faucet statistics
- `GET /api/blockchain-stats` - Get blockchain statistics  
- `POST /api/check-eligibility` - Check claim eligibility
- `POST /api/log-claim` - Log successful claim

### Custom Hooks

- `useStats()` - Fetch and cache statistics
- `useEligibility(address)` - Check if address can claim
- `useFaucetClaim()` - Handle claim transactions

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Next.js frontend"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Environment Variables in Vercel**:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   API_BASE_URL=https://your-api-domain.com
   ```

### Other Platforms

The app can be deployed to:

- **Netlify**: Static site deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: App platform
- **AWS**: Amplify or EC2

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection flow
- [ ] Network switching (to Base)
- [ ] Eligibility checking
- [ ] Transaction signing
- [ ] Error handling
- [ ] Responsive design
- [ ] Loading states
- [ ] Success notifications

### Browser Testing

Test in multiple browsers:
- Chrome/Chromium
- Firefox
- Safari
- Mobile browsers

### Wallet Testing

Test with popular wallets:
- MetaMask (browser extension)
- Coinbase Wallet (mobile)
- Trust Wallet (mobile)
- Rainbow (mobile)

## 🔍 Troubleshooting

### Common Issues

1. **WalletConnect not working**:
   - Check Project ID is correct
   - Verify network configuration
   - Check browser console for errors

2. **API calls failing**:
   - Ensure backend is running
   - Check API_BASE_URL configuration
   - Verify CORS settings

3. **Build errors**:
   - Run `npm run type-check`
   - Check for missing dependencies
   - Verify environment variables

4. **Wallet connection issues**:
   - Clear browser cache
   - Try different wallet
   - Check network connectivity

### Debug Mode

Enable debug logging:

```javascript
// Add to wagmi config
config: {
  // ...
  logger: {
    warn: console.warn,
    error: console.error,
  },
}
```

## 🔒 Security

### Best Practices

- ✅ Environment variables for sensitive data
- ✅ Input validation on all forms
- ✅ HTTPS in production
- ✅ Content Security Policy headers
- ✅ No private keys in frontend code
- ✅ Secure API communication

### Security Headers

Configure in `next.config.js`:

```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // ... more headers
]
```

## 📈 Performance

### Optimizations

- ⚡ Next.js App Router for fast navigation
- 📦 Automatic code splitting
- 🖼️ Optimized images with next/image
- 🗃️ React Query for data caching
- 🎨 CSS-in-JS with zero runtime cost
- 📱 Mobile-optimized bundle size

### Monitoring

Add performance monitoring:

- **Web Vitals**: Built-in Next.js analytics
- **Vercel Analytics**: Deployment analytics
- **Google Analytics**: User behavior tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Git Configuration

Make sure to configure your git user information before contributing:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code style
- Add comments for complex logic
- Test on multiple devices
- Update documentation

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs
- **Community**: Join our Discord for support

---

**Built with ❤️ for the Base ecosystem**