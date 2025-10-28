# UF COE Web Ecosystem Mapper

A web crawler and visualization tool for discovering and mapping WordPress installations across the UF College of Education domain.

---

## Background & Impact

### The Problem

The College of Education previously lacked a reliable way to distinguish which URLs under `education.ufl.edu` were independent WordPress installations (separate site instances with their own dashboards) versus pages belonging to those installations.  
This ambiguity created operational risks: updates performed in one installation's dashboard did not affect others, making it difficult to coordinate fixes, roll out changes, or plan migrations without clear visibility into the college's web footprint.

### The Solution

After joining the web team, I developed this automated crawler, data pipeline, and interactive frontend to address that gap. The system:

- Discovers WordPress site instances hosted at subpaths under the domain  
- Groups pages by their parent installation using WordPress REST API detection  
- Presents results in a clean, searchable, and sortable interface with expandable site-instance cards  

### Real-World Impact

The tool now provides the team with clear, auditable visibility into the College of Education's web ecosystem, enabling:

- **Safe coordination** — Apply fixes and upgrades confidently across independent installations  
- **Migration planning** — Identify consolidation opportunities and plan content migrations  
- **Systematic audits** — Perform accessibility, content ownership, and architectural reviews at scale

**Adaptability**: While built for UF COE, this tool can be easily configured for any organization managing multiple WordPress installations across a domain. The crawler is designed to be domain-agnostic and requires only environment variable configuration to target different domains.

---

## Overview

This tool helps organizations understand their WordPress web ecosystem by:
- Automatically discovering WordPress installations across a domain
- Detecting WordPress sites using multiple fallback methods (REST API → assets → meta tags)
- Cataloging all pages within each installation
- Providing a searchable, filterable web interface for exploration

**Technical Approach**: The crawler uses a 3-tier detection fallback to reliably identify WordPress installations, queries the WordPress REST API for accurate page counts, and outputs structured JSON data consumed by an accessible Next.js frontend.

---

## Features

- **Automated discovery** - Crawls domain to find WordPress installations
- **Reliable detection** - 3-tier fallback method (REST API → assets → meta tags)
- **Accurate counting** - Uses WordPress API for precise page counts
- **Web interface** - Search, filter, and explore discovered sites
- **Accessible** - WCAG 2.1 AA compliant
- **Configurable** - Environment-based settings for different use cases
- **Ethical crawling** - Respects robots.txt, includes rate limiting

---

## Architecture

### Components

- **Crawler** (TypeScript/Node.js) - Discovers and catalogs WordPress sites
- **Frontend** (Next.js) - Visualizes and explores crawl results
- **Data Format** (JSON) - Static output for portability

### Tech Stack

| Component | Technology |
|-----------|------------|
| Crawler | TypeScript, cheerio, robots-parser |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Visualization | React components |

### Project Structure

```
/
├── crawler/              # Web crawler
│   ├── src/             # TypeScript source
│   ├── Dockerfile       # Container configuration
│   └── package.json     # Crawler dependencies
├── app/                 # Next.js application
│   ├── components/      # UI components
│   └── types/          # TypeScript types
└── public/
    └── data.json       # Crawler output
```

---

## Installation

**Requirements:**
- Node.js 20+
- npm or yarn

```bash
# Install dependencies
npm install
cd crawler && npm install && cd ..

# Configure crawler
cp env.example .env
# Edit .env and set CRAWLER_CONTACT_EMAIL
```

---

## Usage

### Running the Crawler

**Prerequisites**: Set `CRAWLER_CONTACT_EMAIL` in `.env` file. This is required for responsible crawling and allows site administrators to contact you.

```bash
cd crawler
npm run build
npm start
```

Output: `public/data.json`

**Docker Option:**
```bash
docker build -t uf-coe-crawler ./crawler
docker run --rm -v "$(pwd)/public:/output" uf-coe-crawler
```

### Running the Frontend

**Development:**
```bash
npm run dev
# Open http://localhost:3000
```

**Production:**
```bash
npm run build
npm start
```

---

## Configuration

### Environment Variables

Set in `.env` file:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CRAWLER_CONTACT_EMAIL` | Yes | - | Contact email for User-Agent |
| `SEED_URL` | No | `https://education.ufl.edu/` | Starting URL |
| `MAX_CONCURRENCY` | No | `5` | Concurrent requests |
| `DELAY_MS` | No | `250` | Delay between requests (ms) |
| `OUTPUT_PATH` | No | `../public/data.json` | Output file path |

### Rate Limiting

Default configuration:
- 5 concurrent requests maximum
- 250ms delay between requests to same host
- Automatic robots.txt compliance

For production use, consider increasing `DELAY_MS` to 500-1000ms.

---

## WordPress Detection

The crawler uses a 3-tier fallback approach:

### 1. REST API Endpoint (High Confidence)
```
GET /wp-json/
→ Valid JSON response = WordPress confirmed
```

### 2. Asset Detection (Medium Confidence)
```
Parse HTML for /wp-content/ URLs
→ Assets found = WordPress likely
```

### 3. Meta Generator (Medium Confidence)
```html
<meta name="generator" content="WordPress ...">
→ Tag found = WordPress likely
```

Each method is attempted in order until WordPress is detected or all methods fail.

---

## Data Format

Output: `public/data.json`

```json
{
  "crawlTimestamp": "2025-10-23T...",
  "root": "https://education.ufl.edu/",
  "subsiteCount": 55,
  "subsites": [
    {
      "id": "unique-id",
      "baseUrl": "https://...",
      "title": "Site Title",
      "detectionMethod": "wp-json",
      "detectionConfidence": "high",
      "isLive": true,
      "pages": [
        {
          "path": "/page-path",
          "title": "Page Title",
          "url": "https://...",
          "isLive": true,
          "outboundLinks": ["https://..."]
        }
      ]
    }
  ]
}
```

---

## Deployment

### Quick Start

**Frontend**: Deploy to Vercel by connecting your GitHub repository (no environment variables needed)

**Automated Crawls**: Set up GitHub Actions for weekly data updates

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step deployment instructions**

### Prerequisites

- GitHub repository with code
- Recent `public/data.json` file from crawler
- Valid contact email for crawler (for GitHub Actions)

### Summary

1. **Vercel**: Import repo → Auto-deploy on push to main
2. **GitHub Actions**: 
   - Add secret: `CRAWLER_CONTACT_EMAIL`
   - Rename workflow template: `crawler.yml.template` → `crawler.yml`
   - Enable write permissions in repo settings
   - Optionally uncomment schedule for weekly runs

📖 **Detailed guides:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment walkthrough
- [.github/workflows/SETUP.md](.github/workflows/SETUP.md) - GitHub Actions setup

---

## Development

### Type Checking
```bash
# Frontend
npx tsc --noEmit

# Crawler
cd crawler && npm run type-check
```

### Linting
```bash
# Frontend
npm run lint

# Crawler
cd crawler && npm run lint
```

---

## Troubleshooting

### Crawler Not Finding Sites

1. Verify seed URL is accessible:
   ```bash
   curl -I https://education.ufl.edu/
   ```

2. Check robots.txt:
   ```bash
   curl https://education.ufl.edu/robots.txt
   ```

3. Rebuild crawler:
   ```bash
   cd crawler
   rm -rf node_modules dist
   npm install && npm run build
   ```

### Frontend Build Issues

```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## Security

**Important**: This tool crawls public websites. Follow responsible crawling practices:

- Always set a valid contact email
- Respect robots.txt rules
- Use appropriate rate limiting
- Monitor server responses
- Stop if you receive complaints or rate-limiting errors

See `SECURITY.md` for detailed guidelines and vulnerability reporting.

---

## Accessibility

This project follows WCAG 2.1 Level AA standards:
- Full keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast ratios
- Responsive design up to 200% zoom

See `ACCESSIBILITY.md` for details.

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Contributing

### Adapting for Your Organization

This project was built for the UF College of Education, but it's designed to work for any organization facing similar challenges with WordPress multi-site ecosystems. The tool is domain-agnostic and highly configurable.

**To adapt for your organization:**

1. **Fork the repository** — Create your own copy
2. **Configure the crawler** — Set your domain in the `SEED_URL` environment variable
3. **Set contact information** — Update `CRAWLER_CONTACT_EMAIL` for responsible crawling
4. **Adjust rate limiting** — Tune `MAX_CONCURRENCY` and `DELAY_MS` for your needs
5. **Run and deploy** — Follow the installation and deployment guides above

No code changes are required for basic adaptation. The crawler automatically discovers WordPress installations regardless of domain structure. For advanced customization, see the `/crawler/README.md` documentation.

**Common use cases for other organizations:**
- Universities with distributed department websites
- Large enterprises with franchise or regional WordPress sites  
- Digital agencies managing multiple client installations
- Government organizations with decentralized web presence

---

## Documentation

- **[README.md](README.md)** - Main documentation (you are here)
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[DEPENDENCIES.md](DEPENDENCIES.md)** - Dependency documentation and rationale
- **[SECURITY.md](SECURITY.md)** - Security policy and responsible crawling
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - WCAG 2.1 AA compliance details
- **[crawler/README.md](crawler/README.md)** - Crawler-specific documentation
- **[.github/workflows/SETUP.md](.github/workflows/SETUP.md)** - GitHub Actions setup guide

---

## Support

- **Documentation**: See links above for comprehensive guides
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Security**: See `SECURITY.md` for vulnerability reporting
- **Deployment**: See `DEPLOYMENT.md` for production deployment help
