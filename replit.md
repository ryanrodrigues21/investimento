# Investment Platform

## Overview

This is a full-stack investment platform built with React, Express.js, and PostgreSQL that allows users to make investments in various AI-powered trading plans. The application features user authentication via Replit Auth, a dashboard for portfolio management, investment plans with different risk/return profiles, wallet functionality for deposits and withdrawals, and administrative tools for managing plans and users. The platform uses Drizzle ORM for database operations and includes automated earnings calculation services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with protected routes
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Server**: Express.js with TypeScript running in ESM mode
- **Authentication**: Replit Auth with OpenID Connect integration using Passport.js
- **Session Management**: Express sessions stored in PostgreSQL using connect-pg-simple
- **Database Layer**: Drizzle ORM with Neon serverless PostgreSQL driver
- **API Design**: RESTful endpoints with consistent error handling middleware
- **Background Services**: Automated earnings calculation and investment finalization

### Database Schema
- **Users**: Stores user profiles, balances, and admin flags
- **Investment Plans**: Configurable investment products with duration and rates
- **User Investments**: Tracks individual investment positions and earnings
- **Transactions**: Records all financial activities (deposits, withdrawals, earnings)
- **Trading Activities**: Logs system trading operations for transparency
- **Sessions**: Handles authentication session persistence

### Key Design Patterns
- **Monorepo Structure**: Shared schema and types between client and server
- **Service Layer**: Business logic encapsulated in service classes (InvestmentService, EarningsCalculator)
- **Repository Pattern**: Database operations abstracted through storage interface
- **Middleware Chain**: Authentication, logging, and error handling as Express middleware
- **Type Safety**: End-to-end TypeScript with shared validation schemas

## External Dependencies

- **Database**: PostgreSQL via Neon serverless with connection pooling
- **Authentication**: Replit Auth service for OAuth/OIDC user management
- **UI Library**: Radix UI primitives for accessible component foundations
- **Payment Processing**: Configured for PIX integration (Brazilian payment system)
- **Development Tools**: Replit-specific plugins for hot reloading and error overlay
- **Font Services**: Google Fonts for typography (Inter, DM Sans, Fira Code, Geist Mono)