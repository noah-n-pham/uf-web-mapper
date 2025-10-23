# Security Policy

## Responsible Web Crawling

This project includes a web crawler that follows ethical crawling practices:

### Our Commitments

1. **robots.txt Compliance**: The crawler automatically respects robots.txt rules
2. **Rate Limiting**: Default 250ms delay between requests, max 5 concurrent requests
3. **Proper Identification**: Uses a descriptive User-Agent with contact information
4. **Graceful Handling**: Implements proper error handling and backoff strategies

### Required Configuration

⚠️ **IMPORTANT**: Before running the crawler, you MUST configure your contact information:

1. Copy `env.example` to `.env`
2. Set `CRAWLER_CONTACT_EMAIL` to a valid email you monitor
3. This allows website administrators to contact you if issues arise

```bash
# Example .env file
CRAWLER_CONTACT_EMAIL=your-email@example.com
```

### Best Practices for Users

If you use or modify this crawler:

- ✅ **DO** set a valid contact email in your User-Agent
- ✅ **DO** respect robots.txt and server response codes
- ✅ **DO** use reasonable rate limits (250ms+ delay recommended)
- ✅ **DO** monitor your crawler's impact on target servers
- ✅ **DO** stop crawling if you receive complaints or rate limiting
- ❌ **DON'T** increase concurrency or decrease delays without good reason
- ❌ **DON'T** ignore 429 (Too Many Requests) or 503 (Service Unavailable) responses
- ❌ **DON'T** crawl sites that explicitly prohibit automated access
- ❌ **DON'T** use someone else's email in the User-Agent

### Reporting Security Issues

If you discover a security vulnerability in this project, please report it by:

1. **DO NOT** open a public GitHub issue
2. Contact the repository owner through GitHub's private security advisory feature
3. Or email a detailed description of the vulnerability

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies by severity, typically within 30 days

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

### Security Updates

Security updates will be released as patches. Users should:
- Watch this repository for security announcements
- Update dependencies regularly (`npm audit` and `npm update`)
- Review and test security patches before deploying

### Privacy Considerations

This project:
- Does **NOT** collect personal data from crawled sites
- Does **NOT** store authentication credentials
- Does **NOT** attempt to bypass security measures
- Focuses on publicly accessible information only

### Compliance

Users are responsible for ensuring their use of this crawler complies with:
- Local and international laws (CFAA, GDPR, etc.)
- Target website's Terms of Service
- Any applicable institutional policies
- Ethical crawling standards

### Acknowledgments

We follow the principles outlined in:
- [robots.txt specification](https://www.robotstxt.org/)
- [Responsible Web Scraping best practices](https://www.searchenginejournal.com/ethical-web-scraping-best-practices/)
- Google's [Webmaster Guidelines](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)

---

**Last Updated**: October 2025

