# 📦 Dependency Installation Instructions

This file documents the additional dependencies that need to be installed for the Web Mapper to work properly.

## Required Frontend Dependencies

The following dependency must be added to the root `package.json`:

### React Flow (Visualization Library)

```bash
npm install reactflow
```

This installs:
- `reactflow` - Interactive node-based graph visualization library

## Why Not Auto-Added?

Per project requirements, we do NOT overwrite the existing root `package.json`. You must install this dependency manually.

## Complete Installation Steps

```bash
# From repository root
npm install reactflow

# From crawler directory
cd crawler
npm install
cd ..
```

## Verification

After installation, verify React Flow is installed:

```bash
npm list reactflow
```

Expected output:
```
uf-web-mapper@0.1.0
└── reactflow@11.x.x
```

## Optional: Update package.json Manually

If you prefer to persist the dependency in `package.json`, add to the `dependencies` section:

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "next": "16.0.0",
    "reactflow": "^11.11.4"
  }
}
```

Then run:
```bash
npm install
```

## Full Dependency Tree

### Root (Frontend)
- `next` 16.0.0 ✅ (already installed)
- `react` 19.2.0 ✅ (already installed)
- `react-dom` 19.2.0 ✅ (already installed)
- `tailwindcss` 4.x ✅ (already installed)
- `reactflow` ⚠️ **Must install**

### Crawler
All crawler dependencies are listed in `crawler/package.json` and install via:
```bash
cd crawler && npm install
```

## Troubleshooting

**React Flow not rendering:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall
npm install reactflow

# Restart dev server
npm run dev
```

**TypeScript errors:**
```bash
# React Flow includes its own types, no @types package needed
# If issues persist, restart your IDE/editor
```

**Version conflicts:**
React Flow 11.x is compatible with React 18-19. The existing React 19 installation is supported.

