#!/bin/bash

# Trickle Base Faucet - Setup Script
# This script helps set up the development environment for all platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " input
        eval "$var_name=\${input:-$default_value}"
    else
        read -p "$prompt: " input
        eval "$var_name=\$input"
    fi
}

print_status "🚀 Welcome to Trickle Base Faucet Setup!"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm."
    exit 1
fi

# Check git
if command_exists git; then
    print_success "Git found"
else
    print_error "Git not found. Please install Git."
    exit 1
fi

echo ""

# Collect configuration
print_status "📝 Configuration Setup"
echo "Please provide the following information:"
echo ""

# WalletConnect Project ID
prompt_input "WalletConnect Project ID (get from https://cloud.walletconnect.com)" "WALLETCONNECT_PROJECT_ID"
if [ -z "$WALLETCONNECT_PROJECT_ID" ]; then
    print_error "WalletConnect Project ID is required!"
    exit 1
fi

# Database URL
prompt_input "Database URL (PostgreSQL connection string)" "DATABASE_URL"

# API Base URL
prompt_input "API Base URL" "API_BASE_URL" "http://localhost:3001"

# Domain for deep linking
prompt_input "Your domain (for deep linking)" "DOMAIN" "your-domain.com"

echo ""

# Create .env file
print_status "Creating .env file..."
cat > .env << EOF
# WalletConnect Configuration
WALLETCONNECT_PROJECT_ID=$WALLETCONNECT_PROJECT_ID

# Database Configuration
DATABASE_URL=$DATABASE_URL

# API Configuration
API_BASE_URL=$API_BASE_URL

# App Configuration
DOMAIN=$DOMAIN

# Contract Configuration (Base Mainnet)
FAUCET_CONTRACT_ADDRESS=0x8D08e77837c28fB271D843d84900544cA46bA2F3

# Environment
NODE_ENV=development
PORT=3001
EOF

print_success ".env file created"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Update web configuration
print_status "Updating web configuration..."
if [ -f "public/index.html" ]; then
    # Replace placeholder project ID in HTML
    sed -i.bak "s/YOUR_PROJECT_ID/$WALLETCONNECT_PROJECT_ID/g" public/index.html
    rm -f public/index.html.bak
    print_success "Web configuration updated"
fi

# Update shared configuration
print_status "Updating shared configuration..."
if [ -f "shared/constants.js" ]; then
    # Replace placeholder values
    sed -i.bak "s/YOUR_PROJECT_ID/$WALLETCONNECT_PROJECT_ID/g" shared/constants.js
    sed -i.bak "s/your-domain.com/$DOMAIN/g" shared/constants.js
    sed -i.bak "s|https://your-api-domain.com|$API_BASE_URL|g" shared/constants.js
    rm -f shared/constants.js.bak
    print_success "Shared configuration updated"
fi

# Update wallet config
print_status "Updating wallet configuration..."
if [ -f "wallet-config.js" ]; then
    sed -i.bak "s/YOUR_PROJECT_ID/$WALLETCONNECT_PROJECT_ID/g" wallet-config.js
    sed -i.bak "s/your-domain.com/$DOMAIN/g" wallet-config.js
    rm -f wallet-config.js.bak
    print_success "Wallet configuration updated"
fi

echo ""

# Android setup (optional)
if [ -d "mobile/android" ]; then
    print_status "🤖 Android Setup (Optional)"
    read -p "Do you want to set up Android development? (y/n): " setup_android
    
    if [ "$setup_android" = "y" ] || [ "$setup_android" = "Y" ]; then
        if command_exists java; then
            print_success "Java found"
            
            # Update Android configuration
            if [ -f "mobile/android/app/src/main/java/com/trickle/faucet/TrickleFaucetApplication.kt" ]; then
                sed -i.bak "s/YOUR_PROJECT_ID/$WALLETCONNECT_PROJECT_ID/g" mobile/android/app/src/main/java/com/trickle/faucet/TrickleFaucetApplication.kt
                rm -f mobile/android/app/src/main/java/com/trickle/faucet/TrickleFaucetApplication.kt.bak
                print_success "Android configuration updated"
            fi
            
            # Update AndroidManifest.xml
            if [ -f "mobile/android/app/src/main/AndroidManifest.xml" ]; then
                sed -i.bak "s/your-domain.com/$DOMAIN/g" mobile/android/app/src/main/AndroidManifest.xml
                rm -f mobile/android/app/src/main/AndroidManifest.xml.bak
                print_success "Android manifest updated"
            fi
        else
            print_warning "Java not found. Please install Java 8+ for Android development"
        fi
    fi
fi

echo ""

# iOS setup (optional)
if [ -d "mobile/ios" ]; then
    print_status "🍎 iOS Setup (Optional)"
    read -p "Do you want to set up iOS development? (y/n): " setup_ios
    
    if [ "$setup_ios" = "y" ] || [ "$setup_ios" = "Y" ]; then
        if command_exists xcodebuild; then
            print_success "Xcode found"
            
            # Update iOS configuration
            if [ -f "mobile/ios/TrickleFaucet/WalletConnectManager.swift" ]; then
                sed -i.bak "s/YOUR_PROJECT_ID/$WALLETCONNECT_PROJECT_ID/g" mobile/ios/TrickleFaucet/WalletConnectManager.swift
                rm -f mobile/ios/TrickleFaucet/WalletConnectManager.swift.bak
                print_success "iOS configuration updated"
            fi
            
            # Update Info.plist
            if [ -f "mobile/ios/TrickleFaucet/Info.plist" ]; then
                sed -i.bak "s/your-domain.com/$DOMAIN/g" mobile/ios/TrickleFaucet/Info.plist
                rm -f mobile/ios/TrickleFaucet/Info.plist.bak
                print_success "iOS Info.plist updated"
            fi
        else
            print_warning "Xcode not found. Please install Xcode for iOS development"
        fi
    fi
fi

echo ""

# Database setup
print_status "🗄️ Database Setup"
if [ -n "$DATABASE_URL" ]; then
    read -p "Do you want to initialize the database? (y/n): " init_db
    
    if [ "$init_db" = "y" ] || [ "$init_db" = "Y" ]; then
        print_status "Starting server to initialize database..."
        npm run dev &
        SERVER_PID=$!
        
        # Wait a moment for server to start
        sleep 3
        
        # Stop the server
        kill $SERVER_PID 2>/dev/null || true
        
        print_success "Database initialization attempted"
    fi
else
    print_warning "No database URL provided. Skipping database setup."
fi

echo ""

# Final instructions
print_success "🎉 Setup completed successfully!"
echo ""
print_status "📋 Next Steps:"
echo ""
echo "1. 🌐 Web Development:"
echo "   npm run dev              # Start development server"
echo "   npm start               # Start production server"
echo ""
echo "2. 🤖 Android Development:"
echo "   cd mobile/android"
echo "   ./gradlew assembleDebug # Build debug APK"
echo ""
echo "3. 🍎 iOS Development:"
echo "   cd mobile/ios"
echo "   open TrickleFaucet.xcodeproj  # Open in Xcode"
echo ""
echo "4. 🚀 Deployment:"
echo "   - Web: Deploy to Vercel/Netlify"
echo "   - Android: Upload to Google Play Console"
echo "   - iOS: Upload to App Store Connect"
echo ""
print_status "📖 Documentation:"
echo "   - Check README.md for detailed instructions"
echo "   - Visit https://docs.walletconnect.com for WalletConnect docs"
echo ""
print_status "🔧 Configuration Files Updated:"
echo "   - .env (environment variables)"
echo "   - public/index.html (web config)"
echo "   - shared/constants.js (shared config)"
echo "   - wallet-config.js (wallet config)"
if [ "$setup_android" = "y" ] || [ "$setup_android" = "Y" ]; then
    echo "   - Android configuration files"
fi
if [ "$setup_ios" = "y" ] || [ "$setup_ios" = "Y" ]; then
    echo "   - iOS configuration files"
fi
echo ""
print_warning "⚠️  Remember to:"
echo "   - Keep your WalletConnect Project ID secure"
echo "   - Set up proper SSL certificates for production"
echo "   - Configure rate limiting for your API"
echo "   - Test thoroughly on all target platforms"
echo ""
print_success "Happy coding! 🚀"