# 🔍 WordPress Subsite Detection - Technical Summary

This document describes how the UF COE Web Mapper detects WordPress subsites under the College of Education domain.

## Detection Strategy

The crawler uses a **three-tier fallback approach** with prioritized methods and associated confidence levels.

---

## Priority 1: wp-json REST API Endpoint

### Method
Request the WordPress REST API endpoint at `<candidateBase>/wp-json/`

### Detection Logic
```typescript
GET https://education.ufl.edu/subsite/wp-json/

If response:
  - Status: 200 OK
  - Content-Type: application/json
  → WordPress confirmed (HIGH confidence)
```

### Why This Works
- WordPress REST API (WP-JSON) is enabled by default in modern WordPress installations
- Presence of this endpoint is the most reliable signal
- Returns structured JSON with WordPress metadata

### Confidence Level
**HIGH** - This is the most reliable detection method.

### Example Response
```json
{
  "name": "Subsite Name",
  "description": "...",
  "url": "https://education.ufl.edu/subsite/",
  "namespaces": ["wp/v2", "wp/v1"]
}
```

---

## Priority 2: wp-content Asset Detection

### Method
Fetch the candidate page HTML and search for WordPress asset URLs that include the subdirectory path.

### Detection Logic
```typescript
GET https://education.ufl.edu/subsite/

Parse HTML for patterns like:
  - <link href="https://education.ufl.edu/subsite/wp-content/themes/...">
  - <script src="https://education.ufl.edu/subsite/wp-content/plugins/...">
  - <img src="https://education.ufl.edu/subsite/wp-content/uploads/...">

If found: WordPress confirmed (MEDIUM confidence)
```

### Why This Works
- WordPress serves assets from the `/wp-content/` directory
- If assets include the subdirectory path, it indicates a WordPress installation at that location
- More reliable than meta tags but less than REST API

### Confidence Level
**MEDIUM** - Reliable but not definitive (some sites may proxy assets).

### Example HTML
```html
<link rel="stylesheet" href="https://education.ufl.edu/subsite/wp-content/themes/theme-name/style.css">
```

---

## Priority 3: Meta Generator Tag

### Method
Parse HTML for the WordPress generator meta tag.

### Detection Logic
```typescript
GET https://education.ufl.edu/subsite/

Search for:
  <meta name="generator" content="WordPress 6.4" />

If found: WordPress confirmed (MEDIUM confidence)
```

### Why This Works
- WordPress adds a generator meta tag by default
- Indicates the site is powered by WordPress
- Can be removed by themes/plugins, so it's a fallback

### Confidence Level
**MEDIUM** - Indicates WordPress but can be spoofed or removed.

### Example HTML
```html
<meta name="generator" content="WordPress 6.4.2" />
```

---

## Detection Flow Diagram

```
Start: Candidate subdirectory discovered
  ↓
[1] Check /wp-json/ endpoint
  ↓
  Success? → YES → Confidence: HIGH ✅
  ↓
  NO
  ↓
[2] Check /wp-content/ in HTML
  ↓
  Found? → YES → Confidence: MEDIUM ⚠️
  ↓
  NO
  ↓
[3] Check meta generator tag
  ↓
  Found? → YES → Confidence: MEDIUM ⚠️
  ↓
  NO
  ↓
NOT WordPress → Skip ❌
```

---

## Implementation Details

### Timeout & Retries
- Each request has a **10-second timeout**
- Failed requests move to the next detection method
- No retries (to respect rate limits)

### Rate Limiting
- **250ms delay** between requests
- **5 concurrent requests** maximum
- Prevents aggressive scraping

### Robots.txt Compliance
- `robots.txt` is fetched before crawling
- Disallowed paths are skipped
- User-Agent: `UF-COE-Web-Mapper/1.0 (+mailto:phamkhoi@ufl.edu)`

---

## Confidence Levels Explained

| Level  | Method(s)           | Reliability | Notes                                  |
|--------|---------------------|-------------|----------------------------------------|
| HIGH   | wp-json             | 95%+        | REST API is definitive                 |
| MEDIUM | wp-content or meta  | 80-90%      | Strong signal but not foolproof        |
| LOW    | None matched        | N/A         | Not included in output                 |

---

## Edge Cases

### Case 1: wp-json is Blocked
**Scenario:** REST API disabled by security plugin or firewall  
**Solution:** Falls back to wp-content and meta tag detection  
**Result:** Still detects WordPress, but with MEDIUM confidence

### Case 2: Assets Served from CDN
**Scenario:** wp-content URLs point to a CDN domain  
**Solution:** Pattern matching may fail; falls back to meta tag  
**Result:** May miss some subsites; consider enhancing regex

### Case 3: Headless WordPress
**Scenario:** WordPress used as backend only, frontend is React/Vue  
**Solution:** wp-json should still be available  
**Result:** Detected with HIGH confidence

### Case 4: Meta Tag Removed
**Scenario:** Theme removes the generator meta tag for security  
**Solution:** Prior methods (wp-json, wp-content) should catch it  
**Result:** Minimal impact due to fallback chain

---

## Sample Output

### High Confidence Example
```json
{
  "id": "education-ufl-edu-educational-technology",
  "baseUrl": "https://education.ufl.edu/educational-technology/",
  "title": "Educational Technology",
  "detectionMethod": "wp-json",
  "detectionConfidence": "high",
  "isLive": true,
  "pages": [...]
}
```

### Medium Confidence Example
```json
{
  "id": "education-ufl-edu-specialeducation",
  "baseUrl": "https://education.ufl.edu/specialeducation/",
  "title": "Special Education",
  "detectionMethod": "wp-content",
  "detectionConfidence": "medium",
  "isLive": true,
  "pages": [...]
}
```

---

## Future Enhancements

Potential improvements beyond MVP:
- Check for `xmlrpc.php` endpoint
- Look for WordPress login page patterns
- Detect WordPress version from static assets
- Cache detection results to avoid re-checking
- Add custom detection rules for known themes/plugins

---

## References

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [WordPress wp-content Directory Structure](https://developer.wordpress.org/apis/content/)
- [Common WordPress Detection Techniques](https://wordpress.org/documentation/)

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-22  
**Contact:** phamkhoi@ufl.edu

