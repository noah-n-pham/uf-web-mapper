# UF College of Education Web Ecosystem Mapper

An MVP tool for automatically discovering and visualizing the web ecosystem of the UF College of Education. This project crawls `education.ufl.edu`, detects WordPress subsites, and renders an interactive left-to-right tree visualization.

## 🎯 Project Overview

**Scope:** MVP only – focus on subsite discovery, detection, and visualization.

**Key Features:**
- Automated WordPress subsite detection
- Respects robots.txt and rate limiting
- Interactive React Flow visualization
- TypeScript across the stack
- Docker support for the crawler
- Static JSON output for frontend consumption

**What this does NOT include:**
- Lighthouse or axe audits
- Authentication or admin endpoints
- Automated commits/pushes to GitHub

---

## 🏗️ Architecture

### Stack
- **Crawler:** TypeScript (Node.js), cheerio, robots-parser
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, React Flow
- **Deployment:** Vercel (frontend), Docker (crawler)

### Project Structure
```
/
├── crawler/               # TypeScript web crawler
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── crawler.ts    # Main crawl logic
│   │   ├── detector.ts   # WordPress detection
│   │   ├── utils.ts      # Utility functions
│   │   └── types.ts      # TypeScript types
│   ├── Dockerfile        # Container for local runs
│   ├── package.json      # Crawler dependencies
│   └── tsconfig.json     # Crawler TypeScript config
├── app/                   # Next.js App Router
│   ├── map/
│   │   └── page.tsx      # Visualization route
│   ├── components/        # React Flow components
│   │   ├── MapVisualization.tsx
│   │   ├── SubsiteNode.tsx
│   │   ├── PageNode.tsx
│   │   └── DetailPanel.tsx
│   └── types/
│       └── data.ts        # Frontend types
├── public/
│   └── data.json          # Crawler output (consumed by frontend)
└── .github/
    └── workflows/
        └── crawler.yml.template  # CI template (not active)
```

---

## 🔍 How Subsite Detection Works

The crawler uses a **three-tier fallback approach** to detect WordPress installations:

### Priority 1: `/wp-json/` Endpoint (High Confidence)
- Requests `<baseUrl>/wp-json/`
- Success + JSON content-type = confirmed WordPress installation
- **Most reliable method**

### Priority 2: `/wp-content/` Asset Detection (Medium Confidence)
- Fetches the candidate page
- Searches HTML for `/wp-content/` URLs that include the candidate subdirectory path
- Indicates WordPress assets are served from that location

### Priority 3: Meta Generator Tag (Medium Confidence)
- Parses HTML for `<meta name="generator" content="WordPress ...">`
- Fallback when REST API and asset detection fail

### Confidence Levels
- **High:** Detected via `/wp-json/`
- **Medium:** Detected via `/wp-content/` or meta tag
- **Low:** Not detected (not included in output)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm or yarn
- Docker (optional, for containerized crawler runs)

### Installation

#### 1. Install Frontend Dependencies
```bash
npm install
```

This installs Next.js and existing dependencies. React Flow and its dependencies will be installed automatically.

#### 2. Install Crawler Dependencies
```bash
cd crawler
npm install
cd ..
```

---

## 🕷️ Running the Crawler

### Method 1: Direct Node.js Execution
```bash
cd crawler
npm run build      # Compile TypeScript
npm start          # Run crawler
```

Output: `public/data.json` (relative to repo root)

### Method 2: Docker
```bash
# Build the image
docker build -t uf-coe-crawler ./crawler

# Run the container and mount the output directory
docker run --rm -v "$(pwd)/public:/output" uf-coe-crawler
```

The crawler will:
1. Fetch `robots.txt` from `education.ufl.edu`
2. Discover subdirectories under the root
3. Test each subdirectory for WordPress signals
4. Crawl up to 20 pages per subsite (configurable)
5. Output `data.json` with all discovered subsites and pages

### Environment Variables
- `OUTPUT_PATH`: Override output path (default: `../public/data.json`)

---

## 🎨 Running the Frontend

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000/map](http://localhost:3000/map) to view the visualization.

### Production Build
```bash
npm run build
npm start
```

The frontend:
- Reads `public/data.json` at build time (or on-demand in dev mode)
- Renders an interactive React Flow graph
- Supports pan/zoom, search, and node selection
- Shows detail panels for subsites and pages

---

## 📊 Data Model

### `public/data.json` Structure
```json
{
  "crawlTimestamp": "ISO 8601 timestamp",
  "root": "https://education.ufl.edu/",
  "subsiteCount": 3,
  "subsites": [
    {
      "id": "unique-id",
      "baseUrl": "https://education.ufl.edu/subsite/",
      "title": "Subsite Title",
      "detectionMethod": "wp-json | wp-content | meta",
      "detectionConfidence": "high | medium | low",
      "isLive": true,
      "pages": [
        {
          "path": "/relative/path",
          "title": "Page Title",
          "url": "https://education.ufl.edu/subsite/path",
          "isLive": true,
          "outboundLinks": ["https://external.com"]
        }
      ]
    }
  ]
}
```

---

## 🔧 Configuration

### Crawler Settings
Edit `crawler/src/index.ts`:
```typescript
const config: CrawlConfig = {
  seedUrl: 'https://education.ufl.edu/',
  maxConcurrency: 5,           // Concurrent requests
  delayMs: 250,                // Delay between requests (per host)
  userAgent: 'UF-COE-Web-Mapper/1.0 (+mailto:phamkhoi@ufl.edu)',
  outputPath: resolve(process.cwd(), '../public/data.json')
};
```

### Page Sampling
For large subsites, the crawler samples up to **20 pages** by default. To change this, edit `crawler/src/crawler.ts`:
```typescript
await this.crawlSubsitePages(subsite, 20); // Change the number here
```

---

## 🚢 Deployment

### Frontend (Vercel)
1. Push this repo to GitHub
2. Connect to Vercel
3. Set **Root Directory** to `/` (repo root)
4. Deploy

Vercel will automatically:
- Detect Next.js
- Build the frontend
- Serve the static `public/data.json`

### Crawler (CI/CD)
A **GitHub Actions template** is provided at `.github/workflows/crawler.yml.template`.

**To enable automated crawling:**
1. Rename `crawler.yml.template` → `crawler.yml`
2. Uncomment the commit/push step (if desired)
3. Set up a cron schedule (e.g., weekly)
4. Grant workflow write permissions in repo settings

**Note:** The template does NOT auto-commit by default. You must manually enable that step.

---

## 📋 Edge Cases & Limitations

### Robots.txt Compliance
- The crawler fetches and respects `robots.txt`
- If blocked, the crawler skips that path

### Detection Fallbacks
- If `/wp-json/` is blocked/missing, falls back to `/wp-content/` and meta tags
- Confidence level logged for each subsite

### Page Sampling
- Very large subsites are sampled (default: 20 pages)
- This ensures the demo is performant while still showing the subsite node
- To crawl more pages, increase the limit in `crawler.ts`

### Rate Limiting
- **5 concurrent requests** max
- **250ms delay** per request
- Prevents aggressive scraping

---

## 🧪 Type Checking & Linting

### Frontend
```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript type check
```

### Crawler
```bash
cd crawler
npm run lint        # ESLint
npm run type-check  # TypeScript type check
```

---

## 📦 Dependencies

### Root (Frontend)
- `next` 16.0.0
- `react` 19.2.0
- `react-dom` 19.2.0
- `reactflow` (to be installed)
- `tailwindcss` 4.x

**To add React Flow:**
```bash
npm install reactflow
```

### Crawler
- `cheerio` - HTML parsing
- `robots-parser` - robots.txt compliance
- TypeScript, ESLint

---

## 🎓 MVP Scope & Assumptions

### Included
✅ Automated subsite discovery  
✅ WordPress detection (3-tier fallback)  
✅ Rate-limited, respectful crawling  
✅ Static JSON output  
✅ Interactive React Flow visualization  
✅ TypeScript across the stack  
✅ Docker support  
✅ Example data for demo  

### NOT Included
❌ Lighthouse / axe audits  
❌ Authentication or admin endpoints  
❌ Automated git commits (template only)  
❌ Deep link analysis beyond outbound links  
❌ Historical tracking or database storage  

### Assumptions
- All target pages are publicly accessible
- WordPress sites use standard paths (`/wp-json/`, `/wp-content/`)
- The College of Education site structure is relatively stable
- Subdirectories under the root are potential subsite candidates

---

## 🐛 Troubleshooting

### "No Data Available" on `/map`
- Run the crawler first: `cd crawler && npm run dev`
- Ensure `public/data.json` exists
- Check file permissions

### Crawler Fails with Network Errors
- Check internet connection
- Verify the seed URL is accessible
- Check if `robots.txt` blocks your user agent

### React Flow Not Rendering
- Install dependencies: `npm install reactflow`
- Clear Next.js cache: `rm -rf .next`
- Restart dev server

### TypeScript Errors
- Run `npm install` in both root and `crawler/`
- Check Node.js version (20+ required)

---

## 📄 License & Contact

**Project:** UF College of Education Web Ecosystem Mapper (MVP)  
**Contact:** phamkhoi@ufl.edu  
**License:** Internal use only (specify as needed)

---

## 🗓️ Future Enhancements (Post-MVP)

Ideas for expansion beyond this MVP:
- Historical tracking and change detection
- Deeper link analysis (PageRank-style metrics)
- Performance audits (Lighthouse integration)
- Database storage for large-scale crawls
- Admin dashboard for scheduled crawls
- Subsite health monitoring
- Automated notifications for broken links

---

## 🙏 Acknowledgments

Built for the UF College of Education to provide visibility into the web ecosystem and support information architecture planning.
