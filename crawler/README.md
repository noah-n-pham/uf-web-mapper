# UF COE Web Mapper - Crawler

TypeScript-based web crawler for discovering and mapping WordPress subsites under the UF College of Education domain.

## Features

- Respects `robots.txt`
- Rate limiting (250ms delay, 5 concurrent requests)
- Three-tier WordPress detection (wp-json → wp-content → meta)
- Outputs structured JSON for frontend consumption

## Installation

```bash
npm install
```

## ⚠️ Required Configuration

**IMPORTANT**: Before running the crawler, you MUST set your contact email:

```bash
# Copy the example environment file
cp env.example .env

# Edit .env and set:
CRAWLER_CONTACT_EMAIL=your-email@example.com
```

This is required for ethical crawling and allows website administrators to contact you.

## Usage

### Build and Run
```bash
npm run build
npm start
```

### Development (build + run)
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Configuration

### Required Environment Variables

Set these in a `.env` file:

- **`CRAWLER_CONTACT_EMAIL`** (REQUIRED): Your contact email for the User-Agent
  - Example: `your-email@example.com`
  - This is included in the User-Agent string for transparency

### Optional Environment Variables

- `CRAWLER_USER_AGENT`: Custom User-Agent string (default: auto-generated with email)
- `SEED_URL`: Starting URL for crawl (default: `https://education.ufl.edu/`)
- `MAX_CONCURRENCY`: Concurrent requests (default: `5`)
- `DELAY_MS`: Delay between requests in ms (default: `250`)
- `OUTPUT_PATH`: Output file location (default: `../public/data.json`)

### Security Best Practices

⚠️ **Never commit your `.env` file** - it's already in `.gitignore`

For ethical crawling:
- Use a valid, monitored email in `CRAWLER_CONTACT_EMAIL`
- Increase `DELAY_MS` to 500-1000ms for public/production use
- Monitor server responses and adjust rate limits if needed
- Stop crawling if you receive complaints or 429/503 errors

See the root `SECURITY.md` for complete guidelines.

## Docker

```bash
# Build
docker build -t uf-coe-crawler .

# Run with volume mount and environment variables
docker run --rm \
  -v "$(pwd)/../public:/output" \
  -e CRAWLER_CONTACT_EMAIL=your-email@example.com \
  uf-coe-crawler
```

**Note**: You must provide `CRAWLER_CONTACT_EMAIL` when running the container.

## Output Format

See `src/types.ts` for full type definitions. Output includes:
- Crawl timestamp
- Root URL
- Subsite count
- Array of subsites with pages, detection method, and confidence level

## WordPress Detection

1. **wp-json** (high confidence): REST API endpoint test
2. **wp-content** (medium confidence): Asset URL pattern matching
3. **meta** (medium confidence): HTML meta generator tag

## Rate Limiting

- Maximum 5 concurrent requests
- 250ms delay between requests per host
- Respects robots.txt disallow rules

## Troubleshooting

**Build fails:**
```bash
rm -rf dist node_modules
npm install
npm run build
```

**Network errors:**
- Check internet connectivity
- Verify seed URL is accessible
- Review robots.txt restrictions

**Output not created:**
- Check file permissions
- Verify output directory exists
- Review error logs

## Security

See `SECURITY.md` in the root directory for:
- Responsible crawling guidelines
- Security best practices
- Vulnerability reporting

## License

MIT License - see LICENSE file in root directory

