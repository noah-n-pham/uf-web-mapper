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

Edit `src/index.ts` to modify:
- Seed URL
- Concurrency limits
- Delay timing
- User-Agent string
- Output path

## Environment Variables

- `OUTPUT_PATH`: Override output file location (default: `../public/data.json`)

## Docker

```bash
# Build
docker build -t uf-coe-crawler .

# Run with volume mount
docker run --rm -v "$(pwd)/../public:/output" uf-coe-crawler
```

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

## License

Internal use - UF College of Education

