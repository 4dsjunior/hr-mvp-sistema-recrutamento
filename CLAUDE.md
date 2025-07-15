# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an HR MVP (Minimum Viable Product) system built with a Flask backend and React frontend. The system manages recruitment processes including candidates, jobs, and dashboard metrics.

## Architecture

### Backend (Flask)
- **Location**: `backend/`
- **Main entry**: `app.py` - Flask application with CORS configuration
- **Routes**: `routes.py` - API endpoints blueprint
- **Database**: Uses Supabase for data persistence
- **Authentication**: JWT-based authentication via Supabase
- **API Base URL**: `http://localhost:5000/api`

### Frontend (React + TypeScript)
- **Location**: `frontend/`
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext)
- **Authentication**: Supabase Auth UI
- **API Communication**: Axios with interceptors for token management
- **Routing**: React Router DOM

## Key Technologies

- **Backend**: Flask, Flask-CORS, Supabase Python Client
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Supabase JS, Axios
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Lucide React icons, React Hook Form, React Hot Toast, Recharts

## Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
python app.py        # Start Flask development server
# Backend runs on port 5000 by default
```

## Project Structure

### Frontend Components
- `components/Auth/` - Authentication components (ProtectedRoute, UserProfile)
- `components/Candidates/` - Candidate management components
- `components/Dashboard/` - Dashboard metrics and analytics
- `components/Jobs/` - Job posting and management
- `components/Layout/` - App layout components (Header, Sidebar)
- `components/UI/` - Reusable UI components (Pagination, Toast, ToastContainer, ErrorBoundary)

### Frontend Pages
- `pages/LoginPage.tsx` - Login page with authentication
- `pages/RegisterPage.tsx` - User registration page
- `pages/ForgotPasswordPage.tsx` - Password recovery page
- `pages/DashboardPage.tsx` - Main dashboard with metrics
- `pages/CandidatesPage.tsx` - Candidate management interface
- `pages/JobsPage.tsx` - Job posting and management
- `pages/PipelinePage.tsx` - Recruitment pipeline management
- `pages/ReportsPage.tsx` - Reports and analytics

### Frontend Services
- `lib/api.ts` - Axios configuration with auth interceptors
- `lib/supabase.ts` - Supabase client configuration
- `services/` - API service layers for different entities
- `hooks/useAuth.tsx` - Authentication state management hook
- `hooks/useDashboard.ts` - Dashboard data management hook

### Backend Structure
- `app.py` - Main Flask application
- `routes.py` - API routes blueprint
- `requirements.txt` - Python dependencies

## Environment Configuration

### Frontend (.env in frontend/)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env in backend/)
```
SECRET_KEY=your_secret_key
DEBUG=True
FLASK_PORT=5000
FLASK_HOST=127.0.0.1
```

## API Endpoints

Base URL: `http://localhost:5000/api`

- `/test` - Health check endpoint
- `/candidates` - Candidate management
- `/jobs` - Job posting management  
- `/dashboard/metrics` - Dashboard metrics

## Authentication Flow

1. Custom authentication forms (LoginPage, RegisterPage, ForgotPasswordPage)
2. JWT tokens managed through useAuth hook
3. Axios interceptors automatically add Authorization headers
4. Backend validates tokens with Supabase
5. 401 responses automatically redirect to login
6. ProtectedRoute component guards authenticated routes
7. UserProfile component displays user information

## Development Notes

- Frontend runs on port 5173 (Vite default)
- Backend runs on port 5000 (Flask default)
- CORS is configured for both localhost and 127.0.0.1 on both ports
- The system uses Supabase for both authentication and database operations
- TypeScript is used throughout the frontend for type safety
- Authentication has been refactored from Supabase Auth UI to custom forms
- Dashboard includes advanced metrics and analytics with Recharts
- Error boundaries implemented for better error handling
- Toast notifications system for user feedback

## Recent Changes

- Replaced Supabase Auth UI with custom authentication forms
- Added UserProfile component for user management
- Implemented ForgotPasswordPage and RegisterPage
- Enhanced dashboard with advanced metrics and visualizations
- Added ErrorBoundary component for error handling
- Migrated from AuthContext to useAuth hook pattern
- Added useDashboard hook for dashboard data management
- Implemented comprehensive toast notification system