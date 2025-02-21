# HeroicFlow

A modern, full-stack project management application built with Next.js 14, featuring real-time updates and a beautiful UI.

## Features

- 🔐 **Authentication & Authorization**
  - Secure authentication using Clerk
  - Organization-based access control
  - Role-based permissions

- 📊 **Project Management**
  - Create and manage multiple projects
  - Real-time project updates
  - Task tracking and management
  - Team collaboration features
  - Sprint management

- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light mode support
  - Beautiful animations using Framer Motion
  - Accessible components using Shadcn UI

- 📱 **Admin Dashboard**
  - Organization management
  - User management
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

- **Authentication**
  - Clerk

- **Deployment**
  - Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database (or Neon account)
- Clerk account

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

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

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
project-management-tool/
├── app/                    # Next.js 14 app directory
│   ├── (main)/             # Main application routes
│   ├── (platform)/         # Platform-specific routes
│   └── api/                # API routes
├── components/             # Reusable components
│   ├── ui/                 # UI components
│   └── ...                 # Other components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## Key Components and Features

- **Project Management**: Create, update, and manage projects
- **Sprint Management**: Create and manage sprints within projects
- **Issue Tracking**: Create, assign, and track issues within sprints
- **User Authentication**: Secure login and registration using Clerk
- **Organization Management**: Create and manage organizations
- **Role-based Access Control**: Different permissions for admins and regular users
- **Real-time Updates**: Live updates for project and sprint changes
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [Neon](https://neon.tech/)
