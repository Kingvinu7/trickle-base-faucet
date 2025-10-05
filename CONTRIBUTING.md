# Contributing to Trickle Base Faucet

Thank you for your interest in contributing to the Trickle Base Faucet project! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- WalletConnect Project ID (get from [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/trickle-base-faucet.git
   cd trickle-base-faucet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused

### Component Structure

```typescript
// Component file structure
'use client' // Only if needed

import { ... } from '...'

interface ComponentProps {
  // Props interface
}

export function Component({ ... }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}
```

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```
feat: add dark mode toggle to settings

- Implement theme switching functionality
- Add theme persistence with localStorage
- Update UI components for dark mode support
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Wallet connection flow works
- [ ] Network switching functions properly
- [ ] Eligibility checking works correctly
- [ ] Transaction signing and submission
- [ ] Error handling displays appropriate messages
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Loading states work as expected
- [ ] Success notifications appear correctly

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

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the issue
2. **Steps to reproduce** - Detailed steps to reproduce the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - Browser, OS, wallet used
6. **Screenshots** - If applicable

## 💡 Feature Requests

When suggesting features:

1. **Use case** - Explain why this feature would be useful
2. **Proposed solution** - Describe your proposed implementation
3. **Alternatives** - Any alternative solutions considered
4. **Additional context** - Any other relevant information

## 📚 Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation if applicable
- Include examples for complex features

## 🔒 Security

- Never commit sensitive information (API keys, private keys)
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices

## 🤝 Code Review Process

1. All changes require a pull request
2. At least one review required before merging
3. Address all review comments
4. Ensure tests pass
5. Update documentation as needed

## 📞 Getting Help

- Open an issue for questions
- Check existing issues first
- Join our Discord for community support
- Read the documentation thoroughly

## 🎯 Project Goals

- Provide a reliable Base faucet service
- Maintain excellent user experience
- Ensure security and privacy
- Support multiple wallet types
- Keep the codebase maintainable

Thank you for contributing to Trickle Base Faucet! 🎉