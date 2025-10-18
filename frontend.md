    📋 Overview

    Transform the basic React TypeScript Vite app into a comprehensive school appointment management system with modern UI/UX, leveraging the existing backend API and native fetch.

    🏗️ Architecture & Tech Stack

    Core Technologies

    - React 19 + TypeScript (already initialized)
    - TanStack Router for file-based routing
    - TanStack Query for server state management  
    - Tailwind CSS + shadcn/ui for styling
    - React Hook Form + Zod for forms/validation
    - Zustand for client state management
    - Native Fetch API for HTTP requests

    Project Structure (in /frontend/react-ts-vite-app/src/)

    src/
    ├── api/                    # Fetch client & TanStack Query hooks
    ├── components/
    │   ├── ui/                # shadcn/ui components
    │   ├── layout/            # Layout components
    │   └── shared/            # Reusable components
    ├── features/
    │   ├── auth/              # Authentication feature
    │   ├── teachers/          # Teacher management
    │   ├── appointments/      # Appointment booking
    │   ├── admin/             # Admin dashboard
    │   └── calendar/          # Calendar views
    ├── routes/                # TanStack Router pages
    ├── stores/                # Zustand stores
    ├── lib/                   # Utilities & configurations
    └── types/                 # TypeScript type definitions

    🚀 Implementation Phases

    Phase 1: Foundation Setup

    1. Package Installation: Add TanStack Router, Query, shadcn/ui, Tailwind
    2. API Client: Create fetch wrapper with auth interceptors
    3. shadcn/ui Setup: Initialize component library
    4. TanStack Router: Configure file-based routing in /frontend/react-ts-vite-app/
    5. Base Layout: Header, navigation, responsive design

    Phase 2: Authentication System

    1. Auth Store: Zustand store for JWT token management
    2. Fetch Wrapper: Custom hook with auth headers
    3. Login/Register Forms: React Hook Form + Zod validation
    4. Protected Routes: Role-based access control
    5. User Profile: View/edit functionality

    Phase 3: Core Features

    1. Teacher Directory: List and search teachers
    2. Appointment Booking: Multi-step booking flow
    3. Calendar Integration: Weekly/monthly views using backend /calendar endpoints
    4. Parent Dashboard: Appointment management

    Phase 4: Admin Features

    1. Teacher Management: CRUD operations
    2. Slot Management: Bulk slot creation
    3. Analytics Dashboard: Appointment metrics
    4. Notification Management: Email tracking

    Phase 5: Enhancement

    1. Real-time Updates: Polling with TanStack Query
    2. Mobile Optimization: PWA features
    3. Offline Support: Service workers
    4. Export Features: PDF reports from backend

    🌐 API Integration Strategy

    Fetch Client Setup

    - Custom fetch wrapper in src/api/client.ts
    - Automatic JWT token attachment
    - Error handling and retry logic
    - TypeScript response typing

    Backend Integration

    - Base URL: http://localhost:8002/api/v1
    - Auth: /auth/login, /auth/register
    - Teachers: /teachers/*
    - Appointments: /appointments/*
    - Calendar: /calendar/*
    - Health: /health/*

    📱 Key User Flows

    Parent Flow

    1. Login → Teacher Selection → Available Slots → Meeting Mode → Confirmation
    2. Dashboard → View Appointments → Cancel/Reschedule
    3. Profile → Update Information

    Teacher Flow

    1. Login → Dashboard → View Schedule
    2. Slot Management → Create/Edit Availability
    3. Appointment History → Student Notes

    Admin Flow

    1. Dashboard → System Overview
    2. Teacher Management → Add/Remove Teachers
    3. Bulk Operations → Mass Slot Creation
    4. Reports → Export Data

    🎨 Design System

    UI Components (shadcn/ui)

    - Forms: Input, Select, DatePicker, Textarea
    - Navigation: Breadcrumbs, Pagination, Tabs
    - Feedback: Toast, Alert, Loading States
    - Data Display: Table, Card, Badge, Calendar

    Theme

    - Primary: School blue (#1e40af)
    - Secondary: Warm gray (#6b7280)
    - Success: Green (#10b981)
    - Warning: Amber (#f59e0b)
    - Error: Red (#ef4444)

    🔒 Security Features

    Authentication

    - JWT token storage (localStorage with security considerations)
    - Automatic token refresh
    - Role-based route protection
    - Logout on token expiry

    Data Validation

    - Client-side validation with Zod schemas
    - API error handling and user feedback
    - Form submission protection

    📊 State Management Strategy

    Server State (TanStack Query)

    - Teachers list with search/filter
    - Appointment data with real-time sync
    - User profile and settings
    - Calendar events and availability

    Client State (Zustand)

    - Authentication state
    - UI preferences (theme, language)
    - Form state for multi-step flows
    - Global loading/error states

    🚀 Development Workflow

    1. Work in /frontend/react-ts-vite-app/
    2. Backend API available at http://localhost:8002
    3. Hot reload for development
    4. TypeScript for type safety
    5. ESLint for code quality