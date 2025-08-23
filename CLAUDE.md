# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript/TypeScript project optimized for modern web development. The project uses industry-standard tools and follows best practices for scalable application development.

## Development Commands

### Available Scripts (from package.json)
- `npm start` - Start development server (react-scripts start)
- `npm run build` - Build the project for production (react-scripts build)
- `npm test` - Run tests (react-scripts test)
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

### Package Management
- `npm install` - Install dependencies
- `npm ci` - Install dependencies for CI/CD
- `npm update` - Update dependencies

### Recommended Additional Scripts
- `npm run lint` - Run ESLint (needs setup)
- `npm run lint:fix` - Run ESLint with auto-fix (needs setup)
- `npm run format` - Format code with Prettier (needs setup)
- `npm run format:check` - Check code formatting (needs setup)

## Technology Stack

### Current Project Setup
- **JavaScript** - Primary programming language (ES6+)
- **React 18.2.0** - UI library with hooks and functional components
- **Create React App** - Development environment and build tool
- **Supabase** - Backend-as-a-Service for authentication and database
- **Lucide React** - Icon library
- **Node.js** - Runtime environment
- **npm** - Package management

### Build Tools
- **React Scripts 5.0.1** - Webpack-based build tool from CRA
- **Webpack** - Module bundler (via react-scripts)

### Backend Integration
- **Supabase Client** - Database and authentication
- **OAuth Integration** - Google & GitHub social login

### Code Quality Tools (Recommended Setup)
- **ESLint** - JavaScript linter (needs configuration)
- **Prettier** - Code formatter (needs configuration)
- **Jest** - Testing framework (included with CRA but no tests written yet)

## Project Structure Guidelines

### Current File Organization
```
src/
├── components/     # React components (Auth.jsx)
├── services/       # API calls (workoutService.js)
├── supabase.js     # Supabase client configuration
├── workout-planner.jsx  # Main app component
└── index.js        # App entry point
```

### Recommended Structure Expansion
```
src/
├── components/     # Reusable UI components
│   ├── common/     # Shared components
│   └── forms/      # Form components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── services/      # API calls and external services
├── constants/     # Application constants
├── styles/        # Global styles and themes
└── __tests__/     # Test files
```

### Naming Conventions
- **Files**: Use kebab-case or camelCase (`workout-planner.jsx`, `workoutService.js`)
- **Components**: Use PascalCase for component names (`WorkoutPlanner`, `Auth`)
- **Functions**: Use camelCase for function names (`getUserData`, `createWorkout`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`API_BASE_URL`)
- **Database**: Use snake_case for Supabase table/column names

## JavaScript Guidelines (Current Setup)

### Code Quality
- Use modern ES6+ features (arrow functions, destructuring, async/await)
- Prefer `const` and `let` over `var`
- Use JSDoc comments for complex functions
- Implement proper error handling with try/catch
- Use PropTypes for component prop validation (recommended)

### Potential TypeScript Migration
- Project could benefit from TypeScript for better type safety
- Would require adding TypeScript dependencies and tsconfig.json
- Gradual migration possible by renaming .jsx files to .tsx
- Consider for future development phases

## Code Quality Standards

### ESLint Configuration
- Use recommended ESLint rules for JavaScript/TypeScript
- Enable React-specific rules if using React
- Configure import/export rules for consistent module usage
- Set up accessibility rules for inclusive development

### Prettier Configuration
- Use consistent indentation (2 spaces recommended)
- Set maximum line length (80-100 characters)
- Use single quotes for strings
- Add trailing commas for better git diffs

### Testing Standards
- Aim for 80%+ test coverage
- Write unit tests for utilities and business logic
- Use integration tests for component interactions
- Implement e2e tests for critical user flows
- Follow AAA pattern (Arrange, Act, Assert)

## Performance Optimization

### Bundle Optimization
- Use code splitting for large applications
- Implement lazy loading for routes and components
- Optimize images and assets
- Use tree shaking to eliminate dead code
- Analyze bundle size regularly

### Runtime Performance
- Implement proper memoization (React.memo, useMemo, useCallback)
- Use virtualization for large lists
- Optimize re-renders in React applications
- Implement proper error boundaries
- Use web workers for heavy computations

## Security Guidelines

### Dependencies
- Regularly audit dependencies with `npm audit`
- Keep dependencies updated
- Use lock files (`package-lock.json`, `yarn.lock`)
- Avoid dependencies with known vulnerabilities

### Code Security
- Sanitize user inputs
- Use HTTPS for API calls
- Implement proper authentication and authorization
- Store sensitive data securely (environment variables)
- Use Content Security Policy (CSP) headers

## Development Workflow

### Before Starting
1. Check Node.js version compatibility
2. Install dependencies with `npm install`
3. Copy environment variables from `.env.example`
4. Run type checking with `npm run typecheck`

### During Development
1. Use TypeScript for type safety
2. Run linter frequently to catch issues early
3. Write tests for new features
4. Use meaningful commit messages
5. Review code changes before committing

### Before Committing
1. Run full test suite: `npm test`
2. Check linting: `npm run lint`
3. Verify formatting: `npm run format:check`
4. Run type checking: `npm run typecheck`
5. Test production build: `npm run build`