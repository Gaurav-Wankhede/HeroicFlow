# HeroicFlow

A modern, full-stack project management application built with Next.js 14, featuring real-time updates, subscription-based access, and a beautiful UI.

## Features

- 🔐 **Authentication & Authorization**
  - Secure authentication using Clerk
  - Organization-based access control
  - Role-based permissions

- � **Subscription System**
  - Stripe integration for payment processing
  - Multiple subscription tiers (Free Trial, Pro, Enterprise)
  - Usage-based billing
  - Automatic subscription management

- 📊 **Project Management**
  - Create and manage multiple projects
  - Real-time project updates
  - Task tracking and management
  - Team collaboration features
  - File attachments and sharing

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Beautiful animations using Framer Motion
  - Accessible components using Shadcn UI

- 📱 **Admin Dashboard**
  - Organization management
  - User management
  - Subscription management
  - Usage analytics

## Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - React
  - Tailwind CSS
  - Shadcn UI
  - Framer Motion
  - Lucide Icons

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL (Neon)
  - Stripe API

- **Authentication**
  - Clerk

- **Deployment**
  - Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database (or Neon account)
- Stripe account
- Clerk account

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=your_pro_monthly_price_id
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=your_pro_yearly_price_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=your_enterprise_monthly_price_id
NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID=your_enterprise_yearly_price_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-management-tool.git
cd project-management-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Set up Stripe webhook:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/subscription
```

## Subscription Plans

### Free Trial
- 100 API requests per month
- Basic project management
- Up to 3 team members
- Basic analytics
- 30-day trial period

### Pro Plan ($49.99/month)
- 1,000 API requests per month
- Advanced project management
- Unlimited team members
- Advanced analytics
- Priority support
- Custom integrations

### Enterprise Plan ($99.99/month)
- 5,000 API requests per month
- Enterprise-grade security
- Dedicated account manager
- Custom analytics
- 24/7 phone support
- SLA guarantees

## Project Structure

```
project-management-tool/
├── app/                    # Next.js 13 app directory
│   ├── (main)/            # Main application routes
│   ├── (platform)/        # Platform-specific routes
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [Stripe](https://stripe.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Neon](https://neon.tech/)
