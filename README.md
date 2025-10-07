# Lintelligent

**Examensarbete Webbutveckling – 2024**

An AI-driven tool for intelligent and consistent code review. The system learns from user feedback and improves suggestions over time.

## Project Structure

This project uses a modern monorepo structure:

```
/apps
  /web       # Frontend (React + Vite)
/api         # Backend (Node.js + Express)
/packages
  /shared    # Shared libraries, types, and utilities
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

Install all dependencies for the monorepo:

```bash
npm install
```

### Development

Run all services in development mode:

```bash
npm run dev
```

Or run individual services:

```bash
# Frontend only
cd apps/web && npm run dev

# Backend only
cd api && npm run dev
```

### Building

Build all packages:

```bash
npm run build
```

### Project Components

#### Frontend (`/apps/web`)
- Built with React and Vite
- TypeScript support
- Modern development experience with HMR

#### Backend (`/api`)
- Node.js with Express
- TypeScript support
- RESTful API for code review services

#### Shared (`/packages/shared`)
- Common TypeScript types
- Shared utilities
- Reusable across frontend and backend

## Development Workflow

1. Make changes in the appropriate workspace
2. Run tests: `npm run test`
3. Build the project: `npm run build`
4. Commit your changes

## License

MIT License - see [LICENSE](LICENSE) file for details