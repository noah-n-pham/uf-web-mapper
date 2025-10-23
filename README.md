# UF COE Web Ecosystem Mapper

A web crawler and visualization tool for discovering and mapping WordPress installations across the UF College of Education domain.

---

## Overview

This tool helps organizations understand their WordPress web ecosystem by:
- Automatically discovering WordPress installations across a domain
- Detecting WordPress sites using multiple fallback methods
- Cataloging all pages within each installation
- Providing a searchable, filterable web interface for exploration

**Use Case**: Organizations with complex multi-site WordPress deployments need visibility into their full web ecosystem for information architecture planning, migration projects, and content audits.

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

### Frontend (Vercel/Netlify)

1. Push repository to GitHub
2. Connect to hosting provider
3. Deploy (no environment variables needed for frontend)

### Automated Crawling (GitHub Actions)

Optional: Set up scheduled crawling

1. Add repository secret: `CRAWLER_CONTACT_EMAIL`
2. Rename `.github/workflows/crawler.yml.template` to `crawler.yml`
3. Configure schedule in workflow file
4. Enable workflow permissions (Settings → Actions → Read and write)

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

This project was built for the UF College of Education. If you'd like to adapt it for your organization:

1. Fork the repository
2. Update `env.example` with your configuration
3. Modify `crawler/src/index.ts` seedUrl as needed
4. Follow the security guidelines in `SECURITY.md`

---

## Support

- **Documentation**: Check the `/crawler/README.md` for crawler-specific docs
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Security**: See `SECURITY.md` for vulnerability reporting
