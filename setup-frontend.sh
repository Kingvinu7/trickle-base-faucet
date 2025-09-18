#!/bin/bash

# Trickle Base Faucet - Frontend Setup Script
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_status "🚀 Setting up Trickle Base Faucet Frontend..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm found: $NPM_VERSION"

echo ""

# Install dependencies
print_status "📦 Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Configuration
print_status "⚙️ Configuration"
echo "Please provide your WalletConnect Project ID:"
echo "Get it from: https://cloud.walletconnect.com"
echo ""

read -p "WalletConnect Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    print_error "WalletConnect Project ID is required!"
    exit 1
fi

# Update .env.local
print_status "Updating environment configuration..."
cat > .env.local << EOF
# WalletConnect Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$PROJECT_ID

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001

# Environment
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
EOF

print_success "Environment configuration updated"

echo ""

# Type checking
print_status "🔍 Running type check..."
if npm run type-check; then
    print_success "Type check passed"
else
    print_warning "Type check failed - but continuing anyway"
fi

echo ""

# Build test
print_status "🏗️ Testing build..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

echo ""

print_success "🎉 Frontend setup completed successfully!"
echo ""
print_status "📋 Next Steps:"
echo ""
echo "1. 🌐 Start Development Server:"
echo "   npm run dev"
echo ""
echo "2. 🚀 Production Build:"
echo "   npm run build"
echo "   npm start"
echo ""
echo "3. 📱 Open in Browser:"
echo "   http://localhost:3000"
echo ""
echo "4. 🔧 Backend Setup:"
echo "   Make sure your backend API is running on http://localhost:3001"
echo "   Or update NEXT_PUBLIC_API_URL in .env.local"
echo ""
print_status "🎨 Features:"
echo "   ✅ Modern Next.js 14 with App Router"
echo "   ✅ WalletConnect integration with 300+ wallets"
echo "   ✅ Beautiful UI with Tailwind CSS & Framer Motion"
echo "   ✅ TypeScript for type safety"
echo "   ✅ Responsive design for all devices"
echo "   ✅ Real-time stats and eligibility checking"
echo "   ✅ Transaction progress tracking"
echo "   ✅ Error handling and user feedback"
echo ""
print_warning "⚠️  Remember to:"
echo "   - Keep your WalletConnect Project ID secure"
echo "   - Update API URLs for production deployment"
echo "   - Test thoroughly before deploying"
echo ""
print_success "Happy coding! 🚀"