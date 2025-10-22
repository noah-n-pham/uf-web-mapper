# 🚀 UF COE Web Mapper - Quick Start Runbook

This runbook provides step-by-step commands to run the Web Ecosystem Mapper locally.

---

## ⚡ Quick Start

### 1. Install All Dependencies

```bash
# Install frontend dependencies (from repo root)
npm install

# Install React Flow (required for visualization)
npm install reactflow

# Install crawler dependencies
cd crawler
npm install
cd ..
```

---

## 🕷️ Running the Crawler

### Option A: Node.js (Recommended for Development)

```bash
# Navigate to crawler directory
cd crawler

# Build TypeScript
npm run build

# Run the crawler
npm start

# Output: ../public/data.json
```

**What happens:**
1. Fetches `robots.txt` from `education.ufl.edu`
2. Discovers subdirectories
3. Detects WordPress installations (wp-json → wp-content → meta)
4. Crawls pages (max 20 per subsite)
5. Generates `public/data.json`

**Expected duration:** 2-5 minutes depending on network and site size.

---

### Option B: Docker (Recommended for Production)

```bash
# Build the Docker image (from repo root)
docker build -t uf-coe-crawler ./crawler

# Run the crawler with volume mount
docker run --rm -v "$(pwd)/public:/output" uf-coe-crawler

# Output: public/data.json
```

**Volume mount explanation:**
- `-v "$(pwd)/public:/output"` maps your local `public/` folder to container's `/output`
- `--rm` automatically removes the container after completion
- The crawler writes to `/output/data.json` which appears as `public/data.json` on your host

---

## 🎨 Running the Frontend

### Development Mode

```bash
# From repo root
npm run dev
```

Open: [http://localhost:3000/map](http://localhost:3000/map)

**Features:**
- Hot reload on file changes
- Interactive React Flow visualization
- Search subsites/pages
- Click nodes for details
- Pan/zoom controls

---

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

Open: [http://localhost:3000/map](http://localhost:3000/map)

---

## 🔄 Updating Data

After running the crawler, the frontend automatically picks up the new `public/data.json`:

### In Development Mode
- Data is read on each page load
- Just refresh the browser after running crawler

### In Production Mode
- Data is read at build time
- Run `npm run build` again after updating `data.json`

---

## 🏗️ Full Workflow Example

```bash
# 1. Install everything (first time only)
npm install
npm install reactflow
cd crawler && npm install && cd ..

# 2. Run the crawler
cd crawler
npm run dev  # Builds and runs in one command
cd ..

# 3. Verify output
cat public/data.json | head -20

# 4. Start the frontend
npm run dev

# 5. Open browser
# http://localhost:3000/map
```

---

## 🐳 Docker-Only Workflow

If you prefer to use Docker exclusively for the crawler:

```bash
# Build once
docker build -t uf-coe-crawler ./crawler

# Run crawler whenever you need fresh data
docker run --rm -v "$(pwd)/public:/output" uf-coe-crawler

# Run frontend normally
npm run dev
```

---

## 🔍 Verifying the Crawl

### Check Output File
```bash
# File exists?
ls -lh public/data.json

# View summary
cat public/data.json | grep -E '"subsiteCount"|"crawlTimestamp"'

# Pretty print
cat public/data.json | head -50
```

### Expected Output Structure
```json
{
  "crawlTimestamp": "2025-10-22T...",
  "root": "https://education.ufl.edu/",
  "subsiteCount": 3,
  "subsites": [...]
}
```

---

## 🚨 Troubleshooting

### Crawler Fails

**Network errors:**
```bash
# Test connectivity
curl -I https://education.ufl.edu/

# Check DNS
nslookup education.ufl.edu
```

**Permission errors:**
```bash
# Ensure output directory exists
mkdir -p public

# Check write permissions
touch public/test.txt && rm public/test.txt
```

### Frontend Shows "No Data Available"

```bash
# Verify data.json exists
ls -l public/data.json

# Check data.json is valid JSON
cat public/data.json | python3 -m json.tool > /dev/null
```

### TypeScript Errors

```bash
# Clean build
cd crawler
rm -rf dist node_modules
npm install
npm run build
cd ..
```

### React Flow Not Rendering

```bash
# Ensure reactflow is installed
npm list reactflow

# If not installed
npm install reactflow

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📊 Understanding the Output

### Subsite Detection Confidence

- **High:** Detected via `/wp-json/` REST API
- **Medium:** Detected via `/wp-content/` assets or meta tag
- **Low:** Not detected (excluded from output)

### Detection Methods

1. **wp-json** (Priority 1): WordPress REST API endpoint exists
2. **wp-content** (Priority 2): WordPress assets found in HTML
3. **meta** (Priority 3): WordPress generator meta tag found

---

## ⏱️ Performance Notes

- **Crawler runtime:** ~2-5 minutes (depends on site size)
- **Rate limiting:** 250ms delay between requests, max 5 concurrent
- **Page limit:** 20 pages per subsite (configurable)
- **Frontend build:** ~10-30 seconds
- **Frontend dev mode:** Instant hot reload

---

## 🎯 Next Steps

### After First Successful Run

1. ✅ Verify visualization at `/map`
2. ✅ Click nodes to see details
3. ✅ Test search functionality
4. ✅ Review `data.json` structure

### For Production

1. Deploy frontend to Vercel
2. (Optional) Enable GitHub Actions for scheduled crawls
3. Set up monitoring/alerts
4. Document custom subsite patterns if found

---

## 📞 Need Help?

**Crawler issues:** Check logs in terminal  
**Frontend issues:** Check browser console (F12)  
**Docker issues:** Verify Docker daemon is running  
**Data issues:** Validate JSON structure  

**Contact:** phamkhoi@ufl.edu

