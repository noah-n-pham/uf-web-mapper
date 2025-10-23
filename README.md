# 🎓 UF College of Education Web Ecosystem Mapper

A production-ready web ecosystem mapper that discovers and visualizes WordPress subsites across the UF College of Education domain. Features a sophisticated warm academic color theme, advanced search, and smooth animations.

**Portfolio-ready frontend showcase built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.**

---

## 🎯 **Project Overview**

### **What It Does:**
- **Discovers** all WordPress installations under `education.ufl.edu`
- **Detects** WordPress using 3-tier fallback (wp-json → wp-content → meta)
- **Visualizes** 55 subsites and 1,191 pages in a clean card interface
- **Provides** advanced search, sorting, and detailed exploration

### **Key Features:**
- ✅ Warm academic color theme (cream/brown light, charcoal/coffee dark)
- ✅ WCAG AAA accessible (all contrast ratios 4.5:1+)
- ✅ Responsive grid (1-4 columns based on screen size)
- ✅ Advanced search (real-time filtering)
- ✅ Smart sorting (by name or page count)
- ✅ Smooth animations (Framer Motion, spring physics)
- ✅ Instant theme switching (light/dark)
- ✅ Detail panels (slides from right with all pages)

---

## 🏗️ **Architecture**

### **Stack:**
- **Crawler:** TypeScript (Node.js), cheerio, robots-parser
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4 with custom warm theme
- **Animations:** Framer Motion
- **Icons:** Lucide React

### **Project Structure:**
```
/
├── crawler/               # TypeScript web crawler
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── crawler.ts    # Main crawl logic
│   │   ├── detector.ts   # WordPress detection (3-tier)
│   │   └── utils.ts      # Utilities
│   ├── Dockerfile        # Container for local runs
│   └── package.json      # Crawler dependencies
├── app/                   # Next.js App Router
│   ├── components/        # React components
│   │   ├── ThemeProvider.tsx
│   │   ├── MapProvider.tsx
│   │   ├── Header.tsx
│   │   ├── EnhancedGridView.tsx
│   │   ├── EnhancedSubsiteCard.tsx
│   │   └── EnhancedDetailPanel.tsx
│   ├── page.tsx          # Homepage with visualization
│   └── types/
│       └── data.ts        # TypeScript types
└── public/
    └── data.json          # Crawler output
```

---

## 🚀 **Getting Started**

### **Prerequisites:**
- Node.js 20+
- npm or yarn

### **Installation:**

```bash
# Install frontend dependencies
npm install

# Install crawler dependencies
cd crawler
npm install
cd ..

# Configure crawler (IMPORTANT for public use)
cp env.example .env
# Edit .env and set your CRAWLER_CONTACT_EMAIL
```

---

## 🕷️ **Running the Crawler**

### **Option A: Node.js (Development)**

```bash
# First time: Configure your contact email
cp env.example .env
# Edit .env and set CRAWLER_CONTACT_EMAIL=your-email@example.com

cd crawler
npm run build
npm start
```

**Output:** `public/data.json` (discovered 55 subsites, 1,191 pages)

**⚠️ Important:** Always set `CRAWLER_CONTACT_EMAIL` before running the crawler. This allows website administrators to contact you if needed.

### **Option B: Docker (Production)**

```bash
# Build image
docker build -t uf-coe-crawler ./crawler

# Run with volume mount
docker run --rm -v "$(pwd)/public:/output" uf-coe-crawler
```

### **What the Crawler Does:**

1. Fetches `robots.txt` from `education.ufl.edu`
2. Discovers subdirectories through deep crawling + pattern matching
3. Detects WordPress installations using:
   - **Priority 1:** `/wp-json/` endpoint (HIGH confidence)
   - **Priority 2:** `/wp-content/` assets (MEDIUM confidence)
   - **Priority 3:** Meta generator tag (MEDIUM confidence)
4. Uses WordPress REST API to get accurate page counts
5. Outputs `public/data.json` with all discovered sites and pages

---

## 🎨 **Running the Frontend**

### **Development:**

```bash
npm run dev
```

**Open:** http://localhost:3000

### **Production:**

```bash
npm run build
npm start
```

---

## 🎨 **Color Theme**

### **Warm Academic (Light Mode):**
- **Background:** Warm cream (#fefcf9) - like aged quality paper
- **Cards:** Pure white with warm shadows
- **Text:** Rich dark brown (#1a1614) - comfortable reading
- **Borders:** Warm beige (#e8e3df)
- **Accents:** Vibrant blue, emerald, purple gradients

### **Sophisticated Earth (Dark Mode):**
- **Background:** Rich charcoal (#0f0e0d) - not pure black
- **Cards:** Coffee brown (#252320)
- **Text:** Warm white (#faf8f6) - not harsh blue-white
- **Borders:** Dark taupe (#3a3632)
- **Accents:** Same vibrant gradients (pop on dark!)

**All colors WCAG AAA accessible** (contrast ratios 4.5:1 to 14:1)

---

## 🔍 **WordPress Detection**

### **3-Tier Fallback Approach:**

**Priority 1: wp-json Endpoint (High Confidence)**
```
GET https://education.ufl.edu/subsite/wp-json/
→ Success + JSON = WordPress confirmed
```

**Priority 2: wp-content Assets (Medium Confidence)**
```
Parse HTML for /subsite/wp-content/ URLs
→ Found = WordPress confirmed
```

**Priority 3: Meta Generator (Medium Confidence)**
```
Search for <meta name="generator" content="WordPress ...">
→ Found = WordPress confirmed
```

---

## 📊 **Data Model**

### **Output: `public/data.json`**

```json
{
  "crawlTimestamp": "2025-10-23T...",
  "root": "https://education.ufl.edu/",
  "subsiteCount": 55,
  "subsites": [
    {
      "id": "unique-id",
      "baseUrl": "https://education.ufl.edu/subsite/",
      "title": "Subsite Title",
      "detectionMethod": "wp-json",
      "detectionConfidence": "high",
      "isLive": true,
      "pages": [
        {
          "path": "/page-path",
          "title": "Page Title",
          "url": "https://education.ufl.edu/subsite/page",
          "isLive": true,
          "outboundLinks": ["https://external.com"]
        }
      ]
    }
  ]
}
```

---

## ⚙️ **Configuration**

### **Crawler Settings** (Environment Variables):

Set these in a `.env` file (copy from `env.example`):

```bash
CRAWLER_CONTACT_EMAIL=your-email@example.com  # REQUIRED
SEED_URL=https://education.ufl.edu/          # Optional
MAX_CONCURRENCY=5                             # Optional
DELAY_MS=250                                  # Optional
```

The crawler will use these to build a proper User-Agent string:
```
UF-COE-Web-Mapper/1.0 (+mailto:your-email@example.com)
```

### **Rate Limiting:**
- **5 concurrent requests** maximum
- **250ms delay** between requests
- **Respects robots.txt**
- **Ethical crawling**

---

## 🚢 **Deployment**

### **Before Deploying (Important!)**

1. **Configure crawler contact info:**
   ```bash
   cp env.example .env
   # Edit .env and set CRAWLER_CONTACT_EMAIL=your-email@example.com
   ```

2. **Verify no personal info in code:**
   ```bash
   grep -r "your-email" . --exclude-dir=node_modules --exclude-dir=.git
   ```

3. **Test locally:**
   ```bash
   cd crawler && npm run build && npm start
   ```

### **Frontend → Vercel**

1. Push to GitHub
2. Import project in Vercel (auto-detects Next.js)
3. Deploy (no environment variables needed)

### **Crawler → GitHub Actions (Optional)**

To automate weekly crawls:

1. **Add secret:** Repo Settings → Secrets → New secret
   - Name: `CRAWLER_CONTACT_EMAIL`
   - Value: your monitored email

2. **Enable workflow:**
   ```bash
   mv .github/workflows/crawler.yml.template .github/workflows/crawler.yml
   # Edit schedule as needed
   ```

3. **Grant permissions:** Settings → Actions → Workflow permissions → Read and write

See `SECURITY.md` for responsible crawling guidelines.

---

## 🧪 **Type Checking & Linting**

### **Frontend:**
```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript check
```

### **Crawler:**
```bash
cd crawler
npm run lint
npm run type-check
```

---

## 📋 **Design Decisions**

### **Why Card View Only?**

Initially implemented both card and network views, but removed the network view because:

- **No unique value:** Network view duplicated card functionality
- **Better UX:** One excellent interface > two redundant ones
- **Simpler:** Reduced cognitive load for users
- **Faster:** Better performance without React Flow overhead
- **Cleaner:** Less code to maintain
- **Professional:** Shows product thinking and restraint

**Result:** A focused, polished interface that does one thing excellently.

---

## 🎓 **Portfolio Highlights**

### **For Frontend SWE Roles:**

**Technical Skills:**
- ✅ Full-stack TypeScript (crawler + frontend)
- ✅ Next.js 16 with App Router
- ✅ React 19 (latest features)
- ✅ Tailwind CSS 4 (custom theming)
- ✅ Framer Motion (advanced animations)
- ✅ Context API (state management)
- ✅ SSR-safe patterns
- ✅ Performance optimization

**Design Skills:**
- ✅ Custom color theme (warm academic)
- ✅ WCAG AAA accessibility
- ✅ Responsive design
- ✅ Micro-interactions
- ✅ Animation choreography
- ✅ Visual hierarchy

**Product Skills:**
- ✅ Feature prioritization (removed redundant view)
- ✅ User-centered decisions
- ✅ Scope management
- ✅ Data-driven choices

---

## 📊 **Results**

### **Discovered:**
- **55 WordPress installations** (1 root + 54 sub-installations)
- **1,191 total pages** (accurately counted via WordPress API)
- **Complete sitemap** of UF College of Education web ecosystem

### **Notable Subsites:**
- Educational Technology (26 pages)
- Faculty Policy (213 pages)
- School Teaching & Learning (172 pages)
- Educational Research (28 pages)
- And 51 more...

---

## 🐛 **Troubleshooting**

### **Crawler Issues:**
```bash
# Test connectivity
curl -I https://education.ufl.edu/

# Check robots.txt
curl https://education.ufl.edu/robots.txt

# Clean rebuild
cd crawler
rm -rf node_modules dist
npm install
npm run build
```

### **Frontend Issues:**
```bash
# Clear cache
rm -rf .next

# Reinstall
npm install

# Rebuild
npm run build
```

---

## 📄 **License**

**Project:** UF College of Education Web Ecosystem Mapper  
**License:** MIT (see LICENSE file)

For security issues, see SECURITY.md

---

## 🙏 **Acknowledgments**

Built for the UF College of Education to provide visibility into the web ecosystem and support information architecture planning.

---

**A production-ready, portfolio-worthy frontend engineering showcase.** 🎓✨
