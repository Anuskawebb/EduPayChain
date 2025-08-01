# EduPayChain - Decentralized University Fee Payment DApp

A full-stack decentralized application for university fee payments using blockchain technology, ERC-20 tokens, and NFT certificates.

## 🚀 Features

- **ERC-20 Token Payments**: Secure fee payments using ERC-20 tokens
- **On-Chain Verification**: All payments and verifications recorded on blockchain
- **NFT Certificates**: Unique NFT certificates issued after payment verification
- **University Management**: Admin-controlled university registration
- **Real-time Notifications**: EPNS/Push Protocol integration for instant updates
- **Role-based Access**: Admin-only controls with hardcoded admin address
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js v6
- **Wallet**: MetaMask integration
- **Notifications**: EPNS/Push Protocol
- **Icons**: Lucide React
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Access to Sepolia testnet (or your preferred network)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd EduPayChain

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd7fddb3352f406e1a45c03100599aac1e9901eab
NEXT_PUBLIC_ADMIN_ADDRESS=0x92f6D0Aed727EaFCDbdd020899415E72DAb93A0d
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your-project-id
NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS=0x1234567890123456789012345678901234567890
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
EduPayChain/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── student/           # Student dashboard
│   ├── admin/             # Admin dashboard
│   └── universities/      # Universities page
├── components/            # Reusable components
│   └── Navigation.tsx     # Navigation component
├── contexts/              # React contexts
│   └── WalletContext.tsx  # Wallet management
├── contracts/             # Smart contract files
│   └── abi.json          # Contract ABI
├── utils/                 # Utility functions
│   ├── contract.ts        # Contract interactions
│   └── notifications.ts   # EPNS notifications
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── README.md             # This file
```

## 🎯 Smart Contract Functions

### Student Functions
- `registerAsStudent()` - Register as a student
- `payFees(university, amount)` - Pay fees to university
- `getStatus(address)` - Get payment status

### Admin Functions
- `addUniversity(name, address, course, fee)` - Add new university
- `removeUniversity(address)` - Remove university
- `verifyAndRelease(student, metadata)` - Verify payment & issue certificate
- `refund(student)` - Refund payment

### NFT Functions
- `mint(to, uri)` - Mint certificate NFT
- `tokenURI(tokenId)` - Get certificate metadata
- `balanceOf(address)` - Get NFT balance

## 🔐 Admin Access

The admin address is hardcoded as: `0x92f6D0Aed727EaFCDbdd020899415E72DAb93A0d`

Only this address can:
- Add/remove universities
- Verify payments
- Issue certificates
- Process refunds

## 📱 Pages Overview

### 1. Landing Page (`/`)
- Hero section with project description
- Feature highlights
- Call-to-action buttons
- Wallet connection

### 2. Student Dashboard (`/student`)
- Student registration
- University selection
- Fee payment form
- Payment status display
- Certificate viewing (if verified)

### 3. Admin Dashboard (`/admin`)
- University management (add/remove)
- Payment verification
- Certificate issuance
- Refund processing
- Student records

### 4. Universities Page (`/universities`)
- List of approved universities
- Course and fee information
- Admin controls (if admin)

## 🔔 Notifications

The app integrates with EPNS/Push Protocol for real-time notifications:

- **Payment Made**: When student makes payment
- **Payment Verified**: When admin verifies payment
- **Certificate Issued**: When NFT certificate is minted
- **Payment Refunded**: When admin processes refund
- **Student Registered**: When new student registers
- **University Added/Removed**: When admin manages universities

## 🎨 UI Components

### Status Badges
- `status-pending`: Yellow badge for pending payments
- `status-paid`: Green badge for paid amounts
- `status-verified`: Blue badge for verified payments
- `status-refunded`: Red badge for refunded payments

### Buttons
- `btn-primary`: Primary action buttons
- `btn-secondary`: Secondary action buttons
- `btn-danger`: Destructive actions
- `btn-success`: Success actions

### Forms
- `input-field`: Standard input styling
- Responsive grid layouts
- Loading states with spinners

## 🔧 Configuration

### Contract Address
Update the contract address in `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your-contract-address
```

### Network Configuration
Set your preferred network:
```env
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia testnet
NEXT_PUBLIC_RPC_URL=your-rpc-url
```

### Admin Address
Change the admin address if needed:
```env
NEXT_PUBLIC_ADMIN_ADDRESS=your-admin-address
```

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment
```bash
npm run build
npm start
```

## 🧪 Testing

### Local Testing
1. Connect MetaMask to Sepolia testnet
2. Import test accounts with ETH
3. Test all functionality as both student and admin

### Contract Testing
- Test all smart contract functions
- Verify event emissions
- Check NFT metadata generation

## 🔒 Security Considerations

- Admin address is hardcoded for security
- All transactions require user confirmation
- Input validation on all forms
- Error handling for failed transactions
- Secure environment variable usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the documentation
- Review the smart contract code
- Test with different networks
- Verify environment variables

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Future updates will include additional features and improvements

---

**Built with ❤️ using Next.js, Ethers.js, and Tailwind CSS** 