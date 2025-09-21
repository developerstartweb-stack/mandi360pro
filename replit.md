# Overview

Mandi360pro is a comprehensive Indian mandi (agricultural marketplace) management system designed for single-owner/single-business operations. The application provides FY-based organization for managing lots, accounts, products, transactions, and inventory with a focus on Indian agricultural business workflows. Built as a full-stack web application with React frontend and Express backend, it features a clean, professional interface with agricultural theming and supports complex business logic around lot management, account tracking, and financial year organization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Styling**: Tailwind CSS with custom agricultural color palette (brand green, warm orange accents) and shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query for server state management with caching and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for robust form validation and error handling
- **Component Structure**: Modular component architecture with reusable UI components, form components (AccountForm, LotForm), and feature modules (DashboardModule, MasterDataModule)

## Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful API structure with dedicated routes for accounts, products, lots, and master data
- **Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Storage Interface**: Abstracted storage layer (IStorage) allowing for flexible database implementations

## Database Design
- **Schema**: PostgreSQL-compatible schema with tables for users, account master, product master, product expenses, place master, and lot management
- **Financial Year Organization**: All entities are organized by financial year (FY-based) with default FY 2025-26
- **ID Generation**: Custom ID logic for accounts (Type + Initials + Sequence) and lots (Product + Quantity + Sequence)
- **JSON Fields**: Flexible custom fields and bank details stored as JSON for extensibility
- **Audit Trail**: Created/updated timestamps on all entities

## Key Features Architecture
- **Master Data Management**: Centralized management of accounts, products, places, and expenses with CRUD operations
- **Lot Management**: Complex lot creation with farmer/agent relationships, quantity tracking, and quality assessments
- **Financial Tracking**: Opening balance, credit limits, and transaction history per account
- **Dashboard**: Real-time metrics and analytics with customizable cards and notifications
- **Theme System**: Light/dark mode support with CSS custom properties and agricultural color theming

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless) for production data storage
- **Drizzle ORM**: Type-safe database operations and migrations (drizzle-orm, drizzle-kit)
- **Session Storage**: PostgreSQL-based session storage (connect-pg-simple) for user authentication

## UI & Styling
- **Radix UI**: Comprehensive headless UI components (@radix-ui/*) for accessibility and consistent behavior
- **Tailwind CSS**: Utility-first CSS framework with custom agricultural design system
- **Lucide React**: Icon library for consistent iconography throughout the application
- **Google Fonts**: Inter and Poppins fonts for professional typography

## Development & Build Tools
- **Vite**: Fast build tool and development server with React plugin
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Validation & Forms
- **Zod**: Schema validation library shared between client and server
- **React Hook Form**: Performance-focused form library with validation integration
- **Hookform Resolvers**: Zod integration for React Hook Form

## Utilities & Enhancement
- **Class Variance Authority**: Type-safe component variants
- **clsx & tailwind-merge**: Conditional CSS class management
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command palette functionality for search and navigation