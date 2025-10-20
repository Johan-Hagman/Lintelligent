# Lintelligent - AI Code Review Assistant

## Project Overview

Thesis project for web development education. 6-week project building an AI-driven code review tool using Model Context Protocol (MCP).

**Core Goal:** Demonstrate ability to learn new technologies and build functional applications with them.

## Problem Statement

Code reviews are time-consuming and quality varies between reviewers. Junior developers get generic feedback, and teams lack consistency in coding standards. An AI-assisted tool can provide immediate, consistent feedback and learn from team preferences over time.

## Solution (MVP)

A web application where developers can:

- Paste code and get immediate AI analysis
- Receive structured feedback on code quality, security, and best practices
- Provide feedback on AI suggestions (thumbs up/down)
- See the system improve over time based on user input
- View statistics on feedback quality

## Key Technologies (Core - Must Use)

### New Tech Focus (Main Learning Goals):

- **Model Context Protocol (MCP)** - Anthropic's 2024 protocol for giving AI context and tools
- **MCP Servers** - Connect coding standards, project files, and documentation
- **AI API** - Claude API or OpenAI as alternative
- **Modern Database** - Supabase (PostgreSQL) or similar

### Supporting Stack (Flexible):

- **Frontend Framework** - React, Vue, or similar modern framework
- **Build Tool** - Vite, Next.js, or similar
- **Styling** - TailwindCSS, CSS-in-JS, or modern CSS framework
- **Backend** - Node.js/Express, or alternative like Fastify, Hono
- **Deployment** - Vercel/Netlify (frontend) + Railway/Render (backend), or alternatives

## Architecture Principles

### Overall Architecture

```
Frontend (React/Vue/etc)
    ↓ REST API
Backend (Node.js/etc)
    ├── Controllers (HTTP handlers)
    ├── Services (Business Logic)
    │   ├── AI Service
    │   ├── MCP Service
    │   └── Learning Service
    ↓
External Services
    ├── AI API (Claude/OpenAI)
    ├── MCP Server
    └── Database (Supabase/PostgreSQL)
```

### Design Patterns to Follow

**Backend:**

1. **Service Layer Pattern** - Separate business logic from controllers
2. **Repository Pattern** (optional) - Abstract database operations
3. **Factory Pattern** - For creating different types of prompts/reviews
4. **Strategy Pattern** - For different AI providers

**Frontend:**

1. **Custom Hooks/Composables** - Reusable logic
2. **Container/Presentational** - Smart vs dumb components
3. **Compound Components** - Flexible, composable UI

## Project Structure (Monorepo)

```
Lintelligent/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom hooks (or composables)
│   │   ├── lib/             # Utilities, API client
│   │   └── [entry-point]    # App.jsx, main.js, etc
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── ai.service.*
│   │   │   ├── mcp.service.*
│   │   │   └── learning.service.*
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Error handling, validation
│   │   ├── utils/           # Helper functions
│   │   └── config/          # Configuration
│   └── package.json
│
├── mcp-servers/
│   └── code-standards/
│       └── src/
│           ├── index.*      # MCP server implementation
│           ├── tools/       # MCP tools
│           └── resources/   # Standards, configs
│
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md
    ├── AI_USAGE.md          # CRITICAL: Document AI assistance
    └── DECISIONS.md
```

## Core Features (MVP Scope)

### ✅ MUST HAVE (In Scope):

- Code input interface (code editor component)
- AI analysis of JavaScript/TypeScript code
- 3+ review types (security, best-practices, performance)
- Structured feedback with severity levels
- User rating system (thumbs up/down)
- Database storage of reviews and ratings
- At least ONE MCP server integration
- Basic statistics dashboard
- Deployment (publicly accessible)
- Comprehensive documentation
- Tests (unit tests, integration tests, e2e tests)

### ❌ OUT OF SCOPE (Not Required):

- GitHub webhooks/PR integration
- Multi-user authentication system
- Multiple programming languages (JS/TS is enough)
- Advanced ML training
- Real-time collaboration
- Team management

## API Design

### REST Endpoints (Example):

```
POST   /api/review              # Submit code for review
GET    /api/review/:id          # Get specific review
PATCH  /api/review/:id/rating   # Update rating
GET    /api/stats               # Get statistics
GET    /api/health              # Health check
```

### Request/Response Structure:

```javascript
// POST /api/review
Request: {
  code: string,
  language: string,
  reviewType: string
}

Response: {
  id: string,
  feedback: {
    suggestions: Array<{
      severity: string,
      line: number,
      message: string,
      reason: string,
      fixedCode?: string
    }>,
    summary: string,
    aiModel: string
  },
  createdAt: string
}
```

## Database Schema Concept

```sql
-- Main reviews table
code_reviews:
  - id (UUID/primary key)
  - created_at (timestamp)
  - code_snippet (text)
  - language (string)
  - review_type (string)
  - ai_feedback (JSON)
  - ai_model (string)
  - user_rating (integer: -1, 0, 1)
  - reviewed_at (timestamp)

-- Indexes needed:
  - created_at
  - user_rating
  - review_type
```

## MCP Integration

### What is MCP?

Model Context Protocol allows AI to use "tools" to access context:

- Read ESLint configurations
- Access coding standards
- Query documentation
- Check project-specific rules

### MCP Server Structure:

```javascript
// Define tools AI can use
tools: [
  {
    name: "read_eslint_config",
    description: "Read ESLint configuration",
    // ...
  },
  {
    name: "get_coding_standards",
    description: "Get team coding standards",
    // ...
  },
];

// Define resources AI can access
resources: [
  {
    uri: "standards://javascript",
    name: "JavaScript Standards",
    // ...
  },
];
```

## Workflow (How System Works)

1. User pastes code in editor
2. Frontend sends POST request to backend
3. Backend validates and processes request
4. MCP Server gathers context (ESLint rules, standards)
5. AI Service sends to AI API with MCP context
6. AI analyzes code using MCP tools
7. Structured feedback returned
8. Saved to database
9. Frontend displays feedback
10. User rates feedback (thumbs up/down)
11. Learning Service updates metrics

## Learning Loop Concept

When user provides rating:

1. Save rating in database
2. Analyze patterns (which suggestions accepted most?)
3. Adjust future prompts based on patterns
4. Display statistics on approval rates

## AI-Assisted Development (AIAD)

### CRITICAL: Documentation Required

Must document in `docs/AI_USAGE.md`:

- Which parts were AI-generated
- Which parts were written manually
- Reasoning for the division of labor
- What AI did well vs poorly
- Learnings about working with AI

### Suggested Division:

**AI Can Generate:**

- Boilerplate code (initial setup)
- Basic CRUD operations
- Test cases structure
- Documentation templates
- Type definitions

**Human Should Write:**

- Core MCP integration logic
- AI prompt engineering
- Business logic in services
- Architecture decisions
- Complex state management
- Custom algorithms

## Code Style & Best Practices

### General Principles:

- **Single Responsibility** - Each function/module does one thing
- **DRY** - Don't Repeat Yourself
- **Separation of Concerns** - UI ≠ Logic ≠ Data
- **Error Handling** - Always handle errors gracefully
- **Type Safety** - Use TypeScript or JSDoc for types

### Naming Conventions:

```
Components/Classes:    PascalCase
Functions/Variables:   camelCase
Constants:             UPPER_SNAKE_CASE
Files:                 kebab-case or camelCase (be consistent)
```

### Error Handling Pattern:

```javascript
// Backend - centralized error handler
app.use(errorHandler);

// Frontend - try/catch with user feedback
try {
  const result = await operation();
} catch (error) {
  showErrorToUser(error.message);
  logError(error);
}
```

## Testing Strategy

### Backend:

- Unit tests for services
- Integration tests for API endpoints
- Test error handling

### Frontend:

- Component tests
- Integration tests for user flows
- E2E tests (optional)

## Environment Variables Pattern

```bash
# Backend
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=...

# AI Provider
AI_API_KEY=...
AI_MODEL=...

# MCP
MCP_SERVER_PORT=3002
```

## Development Timeline (6 weeks)

**Week 1-2:** Foundation

- Setup project structure
- Basic UI with code input
- Backend with first AI integration
- Database setup and CRUD

**Week 3-4:** MCP & Core Features

- MCP server implementation
- Integrate MCP with AI
- Learning loop (rating system)
- Statistics

**Week 5-6:** Polish & Documentation

- Testing and bug fixes
- Complete documentation (AI_USAGE.md!)
- Deployment
- Demo preparation

## Risk Management

### If MCP is too complex:

- Fallback: Use AI API without MCP, with manual context
- Still valid: Shows AI integration + learning loop

### If AI costs too much:

- Use cheaper models (GPT-3.5)
- Use local models (Ollama)
- Cache responses for demos

### If time runs short:

- Priority: Working basic flow > many half-done features
- Cut: Advanced stats, just show basic feedback

## Success Criteria

### Minimum (Pass):

- Functional web application
- AI provides useful code feedback
- MCP or clear AI integration
- Good documentation (AI_USAGE.md)
- Live deployment

### Excellent (Portfolio-worthy):

- Learning loop actually improves over time
- Clean, professional UI
- Well-structured code (design patterns)
- Insightful analysis of AI strengths/weaknesses
- Could be used in real projects

## Important Reminders

1. **This is an educational project** - Focus on learning and demonstrating new tech
2. **MCP is the "new tech"** - This is what makes it special for examensarbete
3. **Document AI usage** - Critical requirement for the course
4. **MVP mindset** - Better to have one feature working perfectly than many half-done
5. **Show your work** - Good documentation is as important as good code

## When Generating Code

### Always Consider:

- Is this following the Service Layer pattern?
- Am I separating concerns properly?
- Is this code testable?
- Does this fit the project architecture?
- Should this be documented in AI_USAGE.md?

### Prefer:

- Clear, readable code over clever code
- Explicit over implicit
- Simple solutions over complex ones
- Established patterns over custom solutions

### Ask Before:

- Adding new dependencies
- Changing core architecture
- Implementing features outside MVP scope
- Using significantly different patterns

## Questions to Ask Me

If uncertain about:

- Architecture decisions
- Which features to prioritize
- How to implement MCP integration
- What to document in AI_USAGE.md
- Whether something is in/out of scope

**ASK** rather than assume!

---

## Project Status: Planning Phase

Waiting for clearance from examinator before starting implementation.

## Current Task:

Setting up project structure and planning architecture.

## Next Steps After Clearance:

1. Initialize repositories
2. Setup development environment
3. Create initial boilerplate
4. Start with backend OR frontend (TBD)
5. Begin documentation from day 1
