# CODEBASE AUDIT: Mandi360Pro

This document provides a comprehensive, exhaustive audit of the Mandi360Pro project. It breaks down the architecture, folder structure, integrations, and identifies gaps in the current implementation.

## 1. ROOT LEVEL CONFIGURATION

- **`package.json`**:
  - **Stack**: Full-stack TypeScript application.
  - **Frontend**: React 18, Vite, Tailwind CSS, `wouter` (routing), `react-hook-form`, `zod`, `recharts`, `react-to-print`, `lucide-react`.
  - **Backend**: Express.js, Drizzle ORM, `whatsapp-web.js`, `puppeteer`.
  - **Scripts**: Standard `dev` (runs Vite + Express concurrently), `build` (compiles TS and Vite), `start` (runs production server).
- **`drizzle.config.ts`**:
  - Configures Drizzle ORM to connect to a PostgreSQL database (specifically geared towards `@neondatabase/serverless`) using the `DATABASE_URL` environment variable.
- **`vite.config.ts` / `tailwind.config.ts` / `tsconfig.json`**:
  - Standard configuration. Sets up path aliases (`@/` for `client/src` and `@shared/` for `shared`).
- **`replit.md` / `.replit`**:
  - Describes the core system: a comprehensive Indian mandi (agricultural marketplace) management system designed for single-owner/single-business operations. Supports Financial Year (FY) based accounting.
- **`design_guidelines.md`**:
  - Establishes a cohesive UI design system heavily focused on "agricultural business software" aesthetics.
  - Colors: Brand Green (`#16a34a`), Success Green, Warm Orange.
  - UX: Emphasizes data tables, card-based metrics, and responsive layouts.

## 2. CLIENT FOLDER (Frontend)

The frontend is built as a Single Page Application (SPA), heavily relying on React components and TanStack Query for state management.

- **Routing Architecture**:
  - The application lacks traditional URL-based routing (despite importing `wouter`). Instead, `client/src/App.tsx` controls the view by rendering different modules based on an `activeTab` state (e.g., clicking "Inventory" changes the state and renders `InventoryModule`).
  - **Gap**: Deep linking to specific pages (e.g., sending a link directly to a specific invoice or module) is not possible with this state-based tab routing.
- **State Management & Data Fetching**:
  - **Global State**: `useGlobalState` (React Context) is used for tracking the active Financial Year (`currentFY`) and the active Company Profile.
  - **API Fetching**: `TanStack Query` (`useQuery`, `useMutation`) is used extensively across modules to interact with backend endpoints.
  - **Forms**: Managed by `react-hook-form` coupled with `zod` for strict schema validation.
- **Major Modules (`client/src/components/`)**:
  - **`DashboardModule`**: Intended for a high-level overview. 
    - **CRITICAL GAP**: This module is currently mocked. It uses `getDefaultDashboardData()` to generate fake data and stores it in `localStorage` rather than fetching real analytics from the backend API.
  - **`MasterDataModule`**: CRUD interfaces for Accounts (Farmers, Buyers), Products, and Places. Connects to `/api/accounts`, `/api/products`, etc.
  - **`InventoryModule`**: Handles stock entry. Includes Lot Entries, Godown Awak (warehouse arrivals), Damage reports, and Weight Slips.
  - **`BillDeskModule`**: The core billing engine for Customer Billing, Khata (credit) Billing, and Payment Receipts. Integrates with `react-to-print` for physical bill generation.
  - **Other Modules**: `FarmerInvoiceModule`, `AccountingModule`, `LedgerModule` (Uplag, Khata, Income, Expense), `ReportsModule`, `SettingsModule`, `WhatsAppModule`.

## 3. SERVER FOLDER (Backend)

The backend acts as a REST API server and a background worker for WhatsApp integrations.

- **Server Initialization (`index.ts`)**:
  - Standard Express setup. Middleware for JSON parsing and a custom request logger.
  - In development mode (`NODE_ENV=development`), it integrates Vite middleware to serve the React app directly from Express.
  - Starts listening on the port defined by the `PORT` environment variable.
- **API Endpoints (`routes.ts`)**:
  - A massive, centralized file defining all RESTful CRUD routes.
  - Routes correspond 1:1 with frontend modules, for example:
    - Master Data: `/api/accounts`, `/api/products`, `/api/places`
    - Inventory: `/api/inventory/lot-entry`, `/api/inventory/godown-awak`
    - Billing: `/api/billdesk/customer-billing`, `/api/billdesk/khata-billing`
    - Ledgers: `/api/ledgers/uplag`, `/api/ledgers/khata`
  - Routes enforce Financial Year separation by requiring and filtering by `fy` or `financialYear` parameters.
- **WhatsApp Service (`whatsapp.ts`)**:
  - Implements `whatsapp-web.js` using a headless Puppeteer browser.
  - Handles authentication (`LocalAuth` which creates the `.wwebjs_auth` directory).
  - Listens for QR code generation and connection states.
  - Exposes functions to send text messages and media (used for sending invoices/receipts directly to customers).

## 4. SHARED FOLDER (Data Models)

- **`schema.ts`**:
  - The most critical file defining the entire data architecture using Drizzle ORM.
  - Contains over 45+ table definitions (`pgTable`), including:
    - `users`, `company_profile`
    - `account_master`, `product_master`, `place_master`
    - `lot_entry`, `weight_slip`, `godown_awak`
    - `customer_billing`, `khata_billing`, `farmer_invoice`
    - `uplag_ledger`, `khata_ledger`
    - `whatsapp_messages`, `whatsapp_session`
  - Automatically exports `zod` schemas (e.g., `insertUserSchema`, `selectUserSchema`) using `drizzle-zod`, ensuring that the frontend and backend validate data identically.

## 5. IDENTIFIED GAPS & RISKS

1. **Dashboard Mocking**: `DashboardModule.tsx` uses completely fake data and `localStorage`. It needs to be wired up to actual aggregate API endpoints on the backend.
2. **URL Routing**: The application relies on state (`activeTab`) rather than URLs. This harms usability if users want to use browser back/forward buttons or bookmark specific modules.
3. **Authentication/Authorization**: While there is a `users` table in the schema, the application appears to operate without strict login walls or role-based access control, implying it's designed to be run in a secured, private local network or used by a single trusted operator.
4. **WhatsApp Session Stability**: Puppeteer-based WhatsApp integrations (`whatsapp-web.js`) are notoriously fragile against WhatsApp Web UI updates. Disconnects will require manual re-scanning of the QR code.

## 6. ENVIRONMENT VARIABLES

The system relies on the following environment variables:
- `DATABASE_URL`: (Required) PostgreSQL connection string.
- `PORT`: (Optional) Port for the Express server (defaults to 5000).
- `NODE_ENV`: Environment flag (`development` or `production`).
- `REPL_ID`: Replit-specific environment tracking.
