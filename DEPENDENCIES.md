# Dependencies Documentation

## Frontend Dependencies

### Core Framework
- **next** (16.0.0) - React framework with SSR, routing, and optimization
- **react** (19.2.0) - UI library for building component-based interfaces
- **react-dom** (19.2.0) - DOM rendering for React

### UI & Visualization
- **reactflow** (^11.11.4) - Interactive node-based graph visualization for the site map
- **lucide-react** (^0.546.0) - Icon library for UI elements
- **framer-motion** (^12.23.24) - Animation library for smooth transitions and interactions

### Performance
- **@tanstack/react-virtual** (^3.13.12) - Virtual scrolling for efficiently rendering large lists of sites

### Styling
- **tailwindcss** (^4) - Utility-first CSS framework
- **@tailwindcss/postcss** (^4) - PostCSS plugin for Tailwind

### Development Tools
- **typescript** (^5) - Type safety and developer experience
- **eslint** (^9) - Code linting
- **eslint-config-next** (16.0.0) - Next.js ESLint configuration
- **@types/node**, **@types/react**, **@types/react-dom** - TypeScript definitions

---

## Crawler Dependencies

### Core Dependencies
- **cheerio** (^1.0.0-rc.12) - Fast, jQuery-like HTML parsing for WordPress detection
  - Used for: Parsing HTML to find WordPress indicators (wp-content, meta tags)
  - Why: Lightweight, server-side DOM manipulation without a full browser

- **robots-parser** (^3.0.1) - Parses and respects robots.txt rules
  - Used for: Ethical crawling by checking robots.txt before requesting URLs
  - Why: Industry-standard compliance with webmaster directives

### Development Tools
- **typescript** (^5.3.3) - Type safety
- **@types/node** (^20.10.0) - Node.js type definitions
- **eslint** (^8.54.0) - Code linting
- **@typescript-eslint/eslint-plugin** (^6.13.0) - TypeScript linting rules
- **@typescript-eslint/parser** (^6.13.0) - TypeScript parser for ESLint

---

## Why These Versions?

### Frontend
- **Next.js 16** - Latest stable version with improved performance
- **React 19** - Concurrent features, automatic batching, transitions
- **Tailwind CSS 4** - Latest version with performance improvements
- **ReactFlow 11** - Stable version with good TypeScript support

### Crawler
- **Node 20** - LTS version with modern features and security updates
- **TypeScript 5** - Latest features (decorators, const type parameters)
- **Cheerio 1.0 RC** - Most stable pre-release, widely used in production

---

## Dependency Management

### Adding New Dependencies

Before adding a new dependency, consider:
1. **Is it necessary?** - Can we achieve this with existing dependencies or vanilla code?
2. **Is it maintained?** - Check last update date, GitHub activity, npm downloads
3. **Is it secure?** - Run `npm audit` after installation
4. **Is it lightweight?** - Check bundle size impact (use bundlephobia.com)
5. **Is it well-typed?** - TypeScript support is critical for this project

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update with caution
npm update

# Audit for security issues
npm audit

# Fix security issues automatically (with caution)
npm audit fix
```

### Security Policy

- Run `npm audit` before every release
- Update dependencies monthly (schedule in calendar)
- Review security advisories for all dependencies
- Keep Next.js and React on latest stable versions
- Pin major versions, allow minor/patch updates

---

## Known Issues & Considerations

### Frontend
- **framer-motion** - Large bundle size (~50KB), but provides smooth animations
  - Mitigation: Tree-shaking and code splitting reduce impact
  - Alternative considered: CSS animations (rejected due to complexity)

- **reactflow** - Large bundle size (~100KB), but core to visualization
  - Mitigation: Lazy load the map page
  - Alternative considered: D3.js (rejected due to development time)

### Crawler
- **cheerio 1.0.0-rc.12** - Release candidate, not final 1.0
  - Risk: Low - RC has been stable since 2022, widely used in production
  - Monitoring: Will migrate to 1.0 stable when released

---

## Audit History

| Date | Action | Notes |
|------|--------|-------|
| Oct 2025 | Initial setup | All dependencies audited, no critical vulnerabilities |
| Oct 2025 | Cleaned crawler deps | Removed accidental frontend dependencies from crawler |

---

## Future Considerations

### Potential Additions
- **compression** - Middleware for response compression (if deploying crawler as API)
- **pino** - Structured logging for production crawler runs
- **zod** - Runtime schema validation for crawler output

### Potential Removals
- If visualization requirements change, consider lighter alternatives to ReactFlow
- Evaluate framer-motion usage - some animations could use CSS instead

---

**Last Updated**: October 28, 2025

