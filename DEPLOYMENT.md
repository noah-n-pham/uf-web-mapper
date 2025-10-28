# Deployment Guide

This guide covers deploying the UF COE Web Mapper to production using Vercel and setting up automated crawls with GitHub Actions.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [GitHub Actions Setup](#github-actions-setup)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code & Configuration
- ✅ All code committed to GitHub
- ✅ Working tree clean (no uncommitted changes)
- ✅ `public/data.json` exists with recent crawl data
- ✅ `vercel.json` configured (already included)
- ✅ Dependencies audited (`npm audit` shows no critical issues)

### Documentation
- ✅ README.md up to date
- ✅ SECURITY.md reviewed
- ✅ ACCESSIBILITY.md reviewed
- ✅ DEPENDENCIES.md documents all packages

### Environment Variables
- ✅ `.env` files NOT committed (in `.gitignore`)
- ✅ `env.example` files present and documented
- ✅ No secrets or sensitive data in code

### Testing
- ✅ Crawler runs successfully locally
- ✅ Frontend builds without errors (`npm run build`)
- ✅ Frontend displays data correctly in dev mode
- ✅ TypeScript type checking passes

Run these checks:
```bash
# Type check frontend
npx tsc --noEmit

# Type check crawler
cd crawler && npm run type-check && cd ..

# Lint frontend
npm run lint

# Build frontend
npm run build

# Test crawler
cd crawler
npm run build
npm start
cd ..
```

---

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended for First Deploy)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Select the repository

3. **Configure Build Settings**
   
   Vercel should auto-detect Next.js. Verify these settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (repository root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 20.x (recommended)

4. **Environment Variables**
   
   The frontend requires NO environment variables! Skip this section.

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (~2-3 minutes)
   - Visit your production URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

The included `vercel.json` provides:

- **Security Headers**: Content security, frame protection, XSS protection
- **Caching**: `data.json` cached for 1 hour, stale-while-revalidate for 24 hours
- **Framework Detection**: Automatic Next.js optimization

No changes needed unless you have specific requirements.

---

## GitHub Actions Setup

GitHub Actions enables automated weekly crawls to keep your site map up to date.

### Quick Start

1. **Set Repository Secret**
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Add secret: `CRAWLER_CONTACT_EMAIL` = your monitored email

2. **Enable Workflow Permissions**
   - **Settings** → **Actions** → **General** → **Workflow permissions**
   - Select **Read and write permissions**
   - Save

3. **Activate Workflow**
   ```bash
   # Rename the template
   mv .github/workflows/crawler.yml.template .github/workflows/crawler.yml
   
   # Edit to enable schedule (optional)
   # Uncomment the schedule section and/or auto-commit step
   
   # Commit and push
   git add .github/workflows/crawler.yml
   git commit -m "chore: enable crawler workflow"
   git push
   ```

4. **Test Manually**
   - Go to **Actions** tab
   - Select **Web Ecosystem Crawler**
   - Click **Run workflow**
   - Monitor progress

### Detailed Setup

See `.github/workflows/SETUP.md` for:
- Step-by-step instructions
- Customizing the schedule
- Enabling auto-commit
- Adding notifications
- Troubleshooting

---

## Post-Deployment

### Verify Deployment

1. **Check Frontend**
   - Visit your Vercel URL
   - Verify site map loads
   - Test search and filtering
   - Check mobile responsiveness
   - Test keyboard navigation

2. **Check Data Loading**
   - Open browser DevTools → Network
   - Verify `data.json` loads (200 status)
   - Check data is recent (crawlTimestamp)

3. **Test Accessibility**
   - Use keyboard navigation (Tab, Enter, Escape)
   - Test with screen reader (if available)
   - Verify color contrast
   - Test at 200% zoom

### Set Up Monitoring (Optional)

1. **Vercel Analytics** (Built-in)
   - Go to Vercel Dashboard → Your Project → Analytics
   - Free tier includes basic metrics

2. **Uptime Monitoring**
   - Use Vercel's built-in monitoring, or
   - Set up [UptimeRobot](https://uptimerobot.com/) (free)
   - Monitor your production URL

3. **GitHub Actions Notifications**
   - Add Slack/email notifications to workflow
   - See `.github/workflows/SETUP.md` for examples

### Schedule Regular Maintenance

Add to calendar:
- **Weekly**: Check GitHub Actions workflow runs
- **Monthly**: Review dependencies (`npm outdated`, `npm audit`)
- **Quarterly**: Audit accessibility with latest WCAG guidelines
- **As needed**: Update crawl data if manually triggered

---

## Updating Data

### Option 1: Manual Update

```bash
# Run crawler locally
cd crawler
npm run build
npm start

# Review output
ls -lh ../public/data.json

# Commit and push
cd ..
git add public/data.json
git commit -m "chore: update web ecosystem data"
git push
```

Vercel will automatically redeploy.

### Option 2: GitHub Actions (Automated)

If you enabled auto-commit in the workflow:
- Runs on schedule (e.g., weekly)
- Automatically commits updated `data.json`
- Triggers Vercel deployment

If auto-commit is disabled:
- Workflow uploads artifact
- Download and review
- Manually commit if satisfied

### Option 3: Trigger Workflow Manually

- Go to **Actions** → **Web Ecosystem Crawler**
- Click **Run workflow**
- Wait for completion
- Download artifact or let auto-commit handle it

---

## Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `webmap.education.ufl.edu`)
3. Follow DNS configuration instructions:
   - **CNAME**: Point to `cname.vercel-dns.com`
   - Or **A Record**: Use Vercel's IP addresses

4. Wait for DNS propagation (up to 48 hours, usually minutes)
5. Vercel automatically provisions SSL certificate

### UF-Specific Domains

If using a `*.ufl.edu` subdomain:
- Contact UF IT or your department's IT support
- Request DNS changes through official channels
- Provide them with Vercel's DNS targets

---

## Troubleshooting

### Build Fails on Vercel

**Error: "Cannot find module 'next'"**
```bash
# Solution: Ensure dependencies are in package.json, not devDependencies
# Vercel uses NODE_ENV=production, which skips devDependencies
```

**Error: "Type errors in build"**
```bash
# Solution: Fix type errors locally first
npx tsc --noEmit

# TypeScript errors will prevent production builds
```

**Error: "Missing data.json"**
```bash
# Solution: Ensure public/data.json is committed
git add public/data.json
git commit -m "chore: add initial crawl data"
git push
```

### GitHub Actions Fails

**"Missing required environment variable"**
```bash
# Solution: Add CRAWLER_CONTACT_EMAIL secret
# Settings → Secrets and variables → Actions → New repository secret
```

**"Permission denied" on git push**
```bash
# Solution: Enable write permissions
# Settings → Actions → General → Workflow permissions → Read and write
```

**"Workflow doesn't appear"**
```bash
# Solution: Rename .yml.template to .yml
mv .github/workflows/crawler.yml.template .github/workflows/crawler.yml
git add .github/workflows/crawler.yml
git commit -m "chore: enable crawler workflow"
git push
```

### Frontend Issues

**Data not loading**
- Check `public/data.json` exists
- Verify JSON is valid (use JSONLint)
- Check browser console for errors
- Verify file size (should be < 10MB for good performance)

**Slow page loads**
- Check `data.json` size
- Consider implementing pagination
- Review Vercel Analytics for performance metrics

**Accessibility issues**
- Run Lighthouse audit
- Test with keyboard only
- Use axe DevTools browser extension
- See `ACCESSIBILITY.md` for guidelines

---

## Rollback Procedure

If deployment has issues:

### Vercel Rollback

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Find last known good deployment
3. Click **...** → **Promote to Production**

Or via CLI:
```bash
vercel rollback
```

### GitHub Rollback

```bash
# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force  # Only if necessary and safe
```

**⚠️ Warning**: Force push to main should be a last resort. Consider creating a hotfix commit instead.

---

## Production Best Practices

### Security
- ✅ Never commit `.env` files
- ✅ Keep dependencies updated (`npm audit` regularly)
- ✅ Review Vercel logs for suspicious activity
- ✅ Use HTTPS only (Vercel does this automatically)

### Performance
- ✅ Monitor `data.json` size (keep under 5MB ideally)
- ✅ Use Vercel Analytics to track performance
- ✅ Implement caching headers (already in `vercel.json`)
- ✅ Consider CDN for large assets

### Maintenance
- ✅ Update dependencies monthly
- ✅ Review GitHub Actions logs weekly
- ✅ Test accessibility quarterly
- ✅ Document any custom changes

### Monitoring
- ✅ Set up uptime monitoring
- ✅ Enable Vercel email notifications
- ✅ Monitor GitHub Actions workflow runs
- ✅ Check Vercel logs for errors

---

## Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Project README**: [README.md](README.md)
- **Security Guidelines**: [SECURITY.md](SECURITY.md)
- **Accessibility Standards**: [ACCESSIBILITY.md](ACCESSIBILITY.md)

---

## Deployment Checklist Summary

Use this checklist for each deployment:

- [ ] Code committed and pushed to GitHub
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] `npm run build` succeeds locally
- [ ] `public/data.json` is present and recent
- [ ] TypeScript type checking passes
- [ ] Vercel project configured correctly
- [ ] GitHub Actions secret set (if using automation)
- [ ] Workflow permissions enabled (if using automation)
- [ ] Post-deployment verification completed
- [ ] Monitoring set up (optional but recommended)
- [ ] Team notified of deployment

---

**Last Updated**: October 28, 2025

**Questions?** Open a GitHub issue or contact the repository maintainer.

