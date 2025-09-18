# Deployment Guide - Trickle Base Faucet

This guide covers deployment of the multi-platform WalletConnect-enabled faucet across Web, Android, and iOS platforms.

## 🌐 Web Deployment

### Vercel Deployment (Recommended)

1. **Prerequisites**
   - GitHub account
   - Vercel account
   - WalletConnect Project ID

2. **Setup Repository**
   ```bash
   git add .
   git commit -m "Initial WalletConnect integration"
   git push origin main
   ```

3. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables:
     ```
     WALLETCONNECT_PROJECT_ID=your_project_id
     DATABASE_URL=your_postgresql_url
     NODE_ENV=production
     FAUCET_CONTRACT_ADDRESS=0x8D08e77837c28fB271D843d84900544cA46bA2F3
     ```

4. **Custom Domain (Optional)**
   - Add your custom domain in Vercel settings
   - Update DNS records as instructed
   - Update deep link configurations in mobile apps

### Alternative Deployments

#### Netlify
```bash
# Build command
npm run build

# Publish directory
public
```

#### Railway
```bash
# Dockerfile included
docker build -t trickle-faucet .
```

#### DigitalOcean App Platform
- Connect GitHub repository
- Set environment variables
- Deploy with auto-scaling

## 🤖 Android Deployment

### Google Play Store

1. **Prepare Release Build**
   ```bash
   cd mobile/android
   
   # Generate signing key (first time only)
   keytool -genkey -v -keystore release-key.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
   
   # Create gradle.properties
   echo "MYAPP_RELEASE_STORE_FILE=release-key.keystore" >> gradle.properties
   echo "MYAPP_RELEASE_KEY_ALIAS=release" >> gradle.properties
   echo "MYAPP_RELEASE_STORE_PASSWORD=your_store_password" >> gradle.properties
   echo "MYAPP_RELEASE_KEY_PASSWORD=your_key_password" >> gradle.properties
   ```

2. **Update build.gradle**
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                   storeFile file(MYAPP_RELEASE_STORE_FILE)
                   storePassword MYAPP_RELEASE_STORE_PASSWORD
                   keyAlias MYAPP_RELEASE_KEY_ALIAS
                   keyPassword MYAPP_RELEASE_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               ...
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build Release APK/AAB**
   ```bash
   # For APK
   ./gradlew assembleRelease
   
   # For App Bundle (recommended)
   ./gradlew bundleRelease
   ```

4. **Google Play Console Setup**
   - Create app listing
   - Upload APK/AAB to Internal Testing
   - Configure store listing:
     - App name: "Trickle - Base Faucet"
     - Short description: "Get ETH for gas fees on Base mainnet"
     - Full description: Include features and benefits
     - Screenshots: Include phone and tablet screenshots
     - App icon: High-quality 512x512 PNG
   - Set pricing (Free)
   - Configure content rating
   - Submit for review

### Alternative Android Distribution

#### Direct APK Distribution
```bash
# Build debug APK for testing
./gradlew assembleDebug

# Distribute via website or email
# Note: Users need to enable "Unknown sources"
```

#### Amazon Appstore
- Similar process to Google Play
- Upload APK to Amazon Developer Console

## 🍎 iOS Deployment

### App Store Connect

1. **Xcode Setup**
   ```bash
   cd mobile/ios
   open TrickleFaucet.xcodeproj
   ```

2. **Configure Signing & Capabilities**
   - Select your development team
   - Configure App ID with your bundle identifier
   - Enable required capabilities:
     - Associated Domains (for universal links)
     - Push Notifications (if needed)

3. **Update Info.plist**
   ```xml
   <!-- Update with your domain -->
   <key>com.apple.developer.associated-domains</key>
   <array>
       <string>applinks:yourdomain.com</string>
   </array>
   ```

4. **Archive and Upload**
   - Select "Any iOS Device" as target
   - Product → Archive
   - In Organizer, select archive and click "Distribute App"
   - Choose "App Store Connect"
   - Upload to App Store Connect

5. **App Store Connect Configuration**
   - App Information:
     - Name: "Trickle - Base Faucet"
     - Bundle ID: com.trickle.faucet
     - SKU: unique identifier
   - Pricing: Free
   - App Store Listing:
     - Screenshots (required sizes)
     - App description
     - Keywords
     - Support URL
     - Privacy Policy URL
   - Submit for Review

### TestFlight Beta Testing

1. **Upload Build**
   - Archive and upload as described above
   - Build will appear in TestFlight section

2. **Configure Beta Testing**
   - Add beta testing information
   - Invite internal testers (team members)
   - Invite external testers (up to 10,000)

3. **Distribute Test Link**
   - Share TestFlight link with beta testers
   - Collect feedback and iterate

## 🔧 Configuration for Production

### Environment Variables

#### Web (Vercel)
```env
WALLETCONNECT_PROJECT_ID=your_production_project_id
DATABASE_URL=your_production_database_url
NODE_ENV=production
API_BASE_URL=https://your-api-domain.com
FAUCET_CONTRACT_ADDRESS=0x8D08e77837c28fB271D843d84900544cA46bA2F3
```

#### Android (gradle.properties)
```properties
WALLETCONNECT_PROJECT_ID=your_production_project_id
API_BASE_URL=https://your-api-domain.com
```

#### iOS (Build Settings)
```swift
// In build configuration
WALLETCONNECT_PROJECT_ID = your_production_project_id
API_BASE_URL = https://your-api-domain.com
```

### Domain Configuration

1. **Web Domain**
   - Configure DNS for your domain
   - Set up SSL certificate (automatic with Vercel/Netlify)
   - Update CORS settings if needed

2. **Mobile Deep Linking**
   - Configure universal links (iOS) / app links (Android)
   - Upload required JSON files to your domain:
     - `/.well-known/apple-app-site-association` (iOS)
     - `/.well-known/assetlinks.json` (Android)

### Database Setup

1. **Production Database**
   ```sql
   -- Create production database
   CREATE DATABASE trickle_faucet_prod;
   
   -- Create claims table
   CREATE TABLE claims (
       id SERIAL PRIMARY KEY,
       wallet_address VARCHAR(42) NOT NULL,
       tx_hash VARCHAR(66) NOT NULL,
       claim_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Create indexes
   CREATE INDEX idx_wallet_address ON claims(wallet_address);
   CREATE INDEX idx_claim_timestamp ON claims(claim_timestamp);
   ```

2. **Database Providers**
   - **Supabase**: Easy PostgreSQL hosting
   - **PlanetScale**: MySQL-compatible serverless
   - **AWS RDS**: Managed database service
   - **Google Cloud SQL**: Managed database service

## 🔒 Security Checklist

### Web Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Content Security Policy headers

### Mobile Security
- [ ] API keys not hardcoded in source
- [ ] Certificate pinning implemented
- [ ] Deep link validation
- [ ] Secure storage for sensitive data
- [ ] Obfuscation enabled for release builds

### Smart Contract Security
- [ ] Contract audited
- [ ] Rate limiting on contract level
- [ ] Proper access controls
- [ ] Emergency pause functionality
- [ ] Upgrade mechanisms secured

## 📊 Monitoring and Analytics

### Web Analytics
```javascript
// Google Analytics 4
gtag('config', 'GA_MEASUREMENT_ID');

// Custom events
gtag('event', 'wallet_connected', {
  wallet_type: 'metamask'
});
```

### Mobile Analytics
```kotlin
// Android - Firebase Analytics
firebaseAnalytics.logEvent("wallet_connected") {
    param("wallet_type", walletType)
}
```

```swift
// iOS - Firebase Analytics
Analytics.logEvent("wallet_connected", parameters: [
    "wallet_type": walletType
])
```

### Error Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Bugsnag**: Error monitoring
- **LogRocket**: Session replay and monitoring

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
      - run: cd mobile/android && ./gradlew assembleRelease
      - uses: actions/upload-artifact@v3
        with:
          name: android-release
          path: mobile/android/app/build/outputs/apk/release/

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd mobile/ios && xcodebuild archive
```

## 🧪 Testing Strategy

### Web Testing
```bash
# Unit tests
npm test

# E2E tests with Playwright
npm run test:e2e

# Lighthouse performance audit
npm run audit
```

### Mobile Testing
```bash
# Android unit tests
./gradlew test

# Android UI tests
./gradlew connectedAndroidTest

# iOS unit tests
xcodebuild test -scheme TrickleFaucet
```

### Manual Testing Checklist
- [ ] Wallet connection flow
- [ ] Transaction signing
- [ ] Deep link handling
- [ ] Error scenarios
- [ ] Network switching
- [ ] Cooldown functionality
- [ ] Cross-platform consistency

## 📱 Store Optimization

### App Store Optimization (ASO)

#### Keywords Research
- "crypto faucet"
- "base network"
- "ethereum gas"
- "web3 wallet"
- "defi tools"

#### Store Listing
- **Title**: Trickle - Base Faucet
- **Subtitle**: Get ETH for gas fees
- **Description**: Highlight key features and benefits
- **Screenshots**: Show main features and beautiful UI
- **App Preview**: 30-second video demonstration

### Marketing Assets
- App icons (various sizes)
- Screenshots (phone, tablet, different screens)
- Feature graphics
- App preview videos
- Press kit with logos and descriptions

## 🔄 Post-Deployment

### Monitoring
- Set up uptime monitoring
- Configure error alerts
- Monitor user analytics
- Track conversion rates

### Updates
- Plan regular updates
- Monitor user feedback
- Fix bugs promptly
- Add new features based on user requests

### Support
- Set up support channels (email, Discord)
- Create FAQ documentation
- Monitor social media mentions
- Respond to app store reviews

---

**Deployment completed! Your multi-platform WalletConnect faucet is now live! 🚀**