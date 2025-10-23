# Accessibility Quick Test Guide

Quick reference for testing WCAG 2.1 AA compliance after making changes.

## ⚡ 5-Minute Test

### 1. Keyboard Navigation (2 minutes)
```
✓ Press Tab - Skip link appears
✓ Continue Tab - All interactive elements focusable
✓ Press Enter on cards - Opens details
✓ Press Escape in panel - Closes panel
✓ Tab in panel - Focus stays trapped
✓ Shift+Tab - Reverse navigation works
```

### 2. Screen Reader Headlines (1 minute)
```
With NVDA (Win) or VoiceOver (Mac):
✓ H key - Navigate headings
✓ Verify heading order: H1 → H2 → H3
✓ No skipped heading levels
```

### 3. Visual Check (1 minute)
```
✓ Zoom to 200% (Cmd/Ctrl + "+")
✓ All content visible
✓ No horizontal scroll
✓ Focus indicators visible
```

### 4. Automated Scan (1 minute)
```bash
# Run in Chrome DevTools
Lighthouse → Accessibility → Generate Report
Expected Score: 95-100
```

## 🔍 Full Manual Test (15 minutes)

### Keyboard Test
- [ ] Tab through entire page
- [ ] All interactive elements reachable
- [ ] Focus order logical
- [ ] No keyboard traps
- [ ] Enter/Space activate buttons
- [ ] Escape closes modal
- [ ] Arrow keys work in dropdown

### Screen Reader Test
- [ ] All text announced
- [ ] Links descriptive
- [ ] Buttons labeled
- [ ] Form inputs labeled
- [ ] Status changes announced
- [ ] ARIA attributes working

### Visual Test
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Works at 200% zoom
- [ ] Responsive at all sizes
- [ ] No text truncation

## 🤖 Automated Tools

### Browser Extensions
1. **axe DevTools** - Install in Chrome/Firefox
   - Click extension icon
   - Run "Scan All of My Page"
   - Expected: 0 violations

2. **WAVE** - Install in Chrome/Firefox
   - Click extension icon
   - Review errors (should be 0)
   - Check structure

### Command Line
```bash
# Lint check
npm run lint

# Build check
npm run build
```

## 🚨 Common Issues to Watch

### ❌ Bad
```tsx
// Missing label
<input type="text" placeholder="Search..." />

// Icon without label
<button><X /></button>

// Div as button
<div onClick={...}>Click</div>

// Hardcoded colors
style={{ color: '#666' }}
```

### ✅ Good
```tsx
// Proper label
<label htmlFor="search">Search</label>
<input id="search" type="text" />

// Icon with label
<button aria-label="Close">
  <X aria-hidden="true" />
</button>

// Button element
<button onClick={...}>Click</button>

// CSS variables
style={{ color: 'var(--text-primary)' }}
```

## 📋 Quick Checklist

Before committing changes:
- [ ] No new lint errors
- [ ] Keyboard navigation works
- [ ] Focus visible on all elements
- [ ] New colors meet 4.5:1 ratio
- [ ] All buttons labeled
- [ ] All icons have aria-hidden or aria-label
- [ ] Forms have labels
- [ ] Tested at 200% zoom

## 🔗 Quick Resources

- **Color Contrast:** https://webaim.org/resources/contrastchecker/
- **ARIA Patterns:** https://www.w3.org/WAI/ARIA/apg/patterns/
- **WCAG Quick Ref:** https://www.w3.org/WAI/WCAG21/quickref/

## 📞 Need Help?

See full documentation:
- `WCAG-COMPLIANCE.md` - Complete compliance report
- `WCAG-CONTRAST-AUDIT.md` - Color contrast details
- `DEPENDENCIES.md` - Project dependencies

---

**Last Updated:** October 23, 2025

