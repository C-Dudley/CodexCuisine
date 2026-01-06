# Contributing to CodexCuisine

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to CodexCuisine.

## Code of Conduct

- Be respectful and inclusive
- Focus on code quality and user experience
- Help others learn and grow
- Report issues constructively

## Getting Started

1. **Read** [SETUP.md](./SETUP.md) to set up your development environment
2. **Review** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) to understand the API
3. **Check** open issues and discussions for what's being worked on
4. **Fork** the repository and create a feature branch

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New feature
- `fix/` - Bug fix
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `perf/` - Performance improvement

### 2. Make Changes

Follow the project's code style and patterns:

**Backend (TypeScript/Express)**:

- Use async/await for asynchronous operations
- Validate inputs with Zod schemas
- Handle errors with custom error classes
- Use meaningful variable and function names
- Write JSDoc comments for complex functions

**Frontend (React/TypeScript)**:

- Use functional components with hooks
- Use React Query for data fetching
- Tailwind CSS for styling
- Keep components focused and reusable
- Use TypeScript for type safety

### 3. Commit Messages

Write clear, descriptive commit messages:

```
feat: Add meal plan modal with date picker
fix: Correct validation error message display
docs: Update API documentation
perf: Add database indexes for query optimization
refactor: Extract form validation into custom hook
```

Format: `<type>: <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### 4. Create a Pull Request

1. **Push** your branch to GitHub
2. **Create** a Pull Request with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Link to related issues if applicable
   - Screenshots for UI changes
3. **Wait** for code review and CI checks to pass

## Code Style Guide

### TypeScript

```typescript
// ✓ Good
const getUserMealPlans = async (userId: string): Promise<Meal[]> => {
  try {
    const plans = await prisma.mealPlan.findMany({
      where: { userId },
      include: { recipe: true },
    });
    return plans;
  } catch (error) {
    throw new MealPlanError("Failed to fetch meal plans", 500);
  }
};

// ✗ Avoid
const getMealPlans = async (id) => {
  return prisma.mealPlan.findMany({ where: { userId: id } });
};
```

### React Components

```typescript
// ✓ Good
interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onSelect(recipe.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div onClick={handleClick} className="...">
      <h3>{recipe.title}</h3>
    </div>
  );
};

// ✗ Avoid
const RecipeCard = (props) => {
  const onclick = () => props.onSelect(props.recipe.id);
  return <div onClick={onclick}>{props.recipe.title}</div>;
};
```

### Tailwind CSS Classes

```jsx
// ✓ Good: Responsive and organized
<div className="min-h-screen bg-gray-50 pt-4">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 text-white px-4 py-2 rounded-lg transition-colors">
      Click me
    </button>
  </div>
</div>

// ✗ Avoid: Not responsive or readable
<div className="bg-purple-600 p-10">
  <button className="button">Click</button>
</div>
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd web && npm run test
```

### Writing Tests

- Write tests for new features
- Test happy paths and error cases
- Use descriptive test names
- Keep tests focused and isolated

## Documentation

### Update Documentation When:

- Adding new API endpoints
- Changing API response formats
- Adding new environment variables
- Making architectural changes
- Fixing documentation issues

## Performance Considerations

### Backend

- Use database indexes for common queries ✓ (Already implemented)
- Avoid N+1 queries with proper includes
- Use select to fetch only needed fields
- Cache frequently accessed data

### Frontend

- Use React Query for data caching
- Implement lazy loading for images
- Code split components with React.lazy
- Minimize bundle size with tree-shaking

## Accessibility

All UI changes must be accessible:

- Use semantic HTML (`<button>`, `<nav>`, etc.)
- Add ARIA labels for icon buttons
- Ensure focus states are visible
- Check color contrast (4.5:1 for text)
- Support keyboard navigation
- Test with screen readers

## Security

- Never commit secrets or API keys
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated
- Review security advisories: `npm audit`
- Use parameterized queries (Prisma does this)

## Common Tasks

### Adding a New API Endpoint

1. **Create schema** (Zod validation in route file)
2. **Add route handler** with error handling
3. **Update documentation** in API_DOCUMENTATION.md
4. **Update frontend** to call new endpoint
5. **Test** with manual requests or tests

### Adding a New Database Model

1. **Update** `backend/prisma/schema.prisma`
2. **Create migration**: `npm run migrate`
3. **Add indexes** for common queries
4. **Update** Prisma generate: `npm run generate`
5. **Create routes** and update API docs

### Updating Frontend Component

1. **Follow** component patterns in existing code
2. **Add TypeScript** types for props
3. **Use Tailwind** for styling (not CSS files)
4. **Test** responsive design on mobile
5. **Check** accessibility with browser tools

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules && npm install

# Type check
npx tsc --noEmit

# Build frontend
npm run build --workspace=web
```

### Database Issues

```bash
# Reset database (⚠️ deletes all data)
cd backend && npm run reset

# Regenerate Prisma client
cd backend && npm run generate
```

### Merge Conflicts

```bash
# Update your branch with latest main
git fetch origin
git rebase origin/master

# Or merge
git merge origin/master

# Resolve conflicts manually, then
git add .
git rebase --continue  # or git merge --continue
```

## Review Process

Pull requests will be reviewed for:

1. **Code Quality**: Follows style guide and patterns
2. **Testing**: Tests are included for new features
3. **Documentation**: Changes are documented
4. **Performance**: No unnecessary re-renders or queries
5. **Accessibility**: Meets accessibility standards
6. **Security**: No security vulnerabilities

## Release Process

Releases follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

## Questions?

- Check existing issues and discussions
- Start a new discussion for questions
- Read the [README](./README.md) for overview
- Review [docs/](./docs/) folder

Thank you for contributing! 🎉
