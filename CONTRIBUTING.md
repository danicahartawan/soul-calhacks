# Contributing to SoleForSole Backend

Thank you for your interest in contributing to SoleForSole! This document provides guidelines for contributing to the backend API.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Development Setup

1. **Fork and clone the repository:**
```bash
git clone https://github.com/your-username/SoleForSole.git
cd SoleForSole
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your Supabase credentials
```

4. **Set up the database:**
```bash
# Run the SQL schema in your Supabase SQL editor
# Copy contents from src/database/schema.sql
```

5. **Start development server:**
```bash
npm run dev
```

## 📋 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused

### Git Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes and commit:**
```bash
git add .
git commit -m "feat: add your feature description"
```

3. **Push and create a pull request:**
```bash
git push origin feature/your-feature-name
```

### Commit Message Format

Use conventional commits format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:
```
feat: add real-time alert notifications
fix: resolve sensor data validation issue
docs: update API documentation
```

## 🧪 Testing

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

### Testing API Endpoints

Use the provided test device ID for testing:
- Device ID: `550e8400-e29b-41d4-a716-446655440000`
- Test user: `test@soleforsole.com`

## 📝 API Development

### Adding New Endpoints

1. **Create route file** in `src/routes/`
2. **Add validation schema** in `src/middleware/validation.ts`
3. **Update types** in `src/types/index.ts`
4. **Add route to main app** in `src/index.ts`
5. **Update documentation** in `API_DOCUMENTATION.md`

### Database Changes

1. **Update schema** in `src/database/schema.sql`
2. **Update types** in `src/database/database.types.ts`
3. **Test with existing data**
4. **Document migration steps**

## 🔧 Architecture Guidelines

### Backend Responsibilities

The backend should focus on:
- IoT sensor data processing
- Alert generation and analysis
- Data aggregation and statistics
- External service integrations

### Mobile App Integration

Remember that the mobile app connects directly to Supabase for:
- User authentication
- Profile management
- Device management
- Real-time alerts

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment details:**
   - Node.js version
   - Operating system
   - Supabase project details

2. **Steps to reproduce:**
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Error logs:**
   - Full error messages
   - Stack traces
   - Relevant log files

## 💡 Feature Requests

When suggesting features:

1. **Describe the problem** you're trying to solve
2. **Explain your proposed solution**
3. **Consider the mobile app integration**
4. **Think about scalability and performance**

## 📚 Documentation

### Updating Documentation

- Keep `README.md` up to date
- Update `API_DOCUMENTATION.md` for API changes
- Add examples in `MOBILE_EXAMPLES.md` for mobile integration
- Document any breaking changes

### Code Documentation

- Add JSDoc comments for public functions
- Explain complex business logic
- Document API endpoint parameters and responses

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Logging configured
- [ ] Health checks working
- [ ] Rate limiting configured
- [ ] CORS settings updated

## 📞 Support

If you need help:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Join our community discussions

## 📄 License

By contributing to SoleForSole, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to SoleForSole! 🦶⚕️
