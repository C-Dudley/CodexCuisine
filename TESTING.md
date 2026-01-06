# Phase 9 - Testing Checklist

Comprehensive testing checklist to verify all Phase 9 improvements are working correctly.

## Pre-Testing Setup

- [ ] Ensure backend is running: `npm run dev --workspace=backend`
- [ ] Ensure frontend is running: `npm run dev --workspace=web`
- [ ] Ensure database is running
- [ ] Clear browser cache and cookies
- [ ] Open browser DevTools (F12) for error monitoring

## 1. Responsive Design Testing ✓

### Desktop (1920x1080)

- [ ] Header displays full logo text and desktop navigation
- [ ] HomePage grid shows 4 columns on xl screens
- [ ] Search bar visible and functional
- [ ] Recipe cards have proper spacing
- [ ] Meal Plan Chart shows 7 columns (full week)
- [ ] All buttons are properly sized and centered

### Tablet (768x1024)

- [ ] Header logo hides text, shows icon only
- [ ] Navigation switches to hamburger menu
- [ ] HomePage grid shows 2-3 columns
- [ ] Recipe cards responsive and readable
- [ ] Meal Plan Chart shows 2 columns (2 days per row)
- [ ] Touch targets are at least 48x48px

### Mobile (375x667)

- [ ] Full mobile menu opens/closes with hamburger icon
- [ ] Escape key closes mobile menu
- [ ] HomePage grid shows 1 column
- [ ] Search bar stacks above button
- [ ] Meal Plan modal fits screen
- [ ] Form inputs have proper padding for touch
- [ ] No horizontal scrolling (except intentional)

**Test Tool**: Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)

---

## 2. Database Optimization Testing ✓

### Query Performance

- [ ] HomePage loads quickly (< 2 seconds)
- [ ] Recipe details load instantly
- [ ] Meal plans load in < 1 second
- [ ] No N+1 query warnings in console
- [ ] Ingredient counts show correctly

### Database Integrity

- [ ] Run migrations: `npm run migrate` (shows "Your database is in sync")
- [ ] Verify indexes exist: Check `backend/prisma/schema.prisma` for @@index
- [ ] No duplicate data in tables
- [ ] Foreign key relationships intact

**Check**: `npm run studio` opens Prisma Studio showing all data

---

## 3. Error Handling Testing ✓

### Backend Error Responses

- [ ] Invalid recipe ID returns 404 with message
- [ ] Missing required fields returns 400 with validation errors
- [ ] Unauthorized requests return 401
- [ ] Detailed error messages in response

### Frontend Error Display

- [ ] HomePage shows error message on API failure
- [ ] MealPlanChart shows dismissible error message
- [ ] RecipePage modal shows error with retry option
- [ ] Form validation errors display inline

**Test**: Disable network in DevTools and observe error messages

---

## 4. Frontend Optimization Testing ✓

### React Query Caching

- [ ] HomePage data is cached after first load
- [ ] Navigating back shows cached data instantly
- [ ] Manual refresh triggers new request
- [ ] Stale data refetches in background
- [ ] Error retry logic works on failures

### Performance

- [ ] No unnecessary re-renders (check React DevTools)
- [ ] Scroll performance smooth on large lists
- [ ] Memory usage stable (no leaks)
- [ ] Network tab shows reasonable payload sizes

**Check**: Open React Query DevTools (Chrome extension) to see cache status

---

## 5. Form Validations & Feedback Testing ✓

### Auth Forms (Login/Register)

- [ ] Empty email shows "Email is required"
- [ ] Invalid email format shows "Please enter a valid email address"
- [ ] Short password shows "Password must be at least X characters"
- [ ] Password mismatch shows "Passwords do not match"
- [ ] Submit button disabled during request
- [ ] Loading spinner shows while processing
- [ ] Success redirects to home page
- [ ] Error message displays on failure

### Meal Plan Modal (RecipePage)

- [ ] Modal opens when clicking "Add to Breakfast/Lunch/Dinner"
- [ ] Escape key closes modal
- [ ] Click outside modal closes it
- [ ] Date picker allows selecting any date
- [ ] Meal type dropdown works correctly
- [ ] Submit button disabled during save
- [ ] Loading state shows "Adding..."
- [ ] Error displays if add fails
- [ ] Success message would appear (test with console)
- [ ] Modal closes on successful add

---

## 6. Accessibility Testing ✓

### Keyboard Navigation

- [ ] Tab navigation moves through all buttons and links
- [ ] Enter activates buttons
- [ ] Space activates buttons
- [ ] Escape closes modals and dropdowns
- [ ] Tab order makes logical sense
- [ ] No keyboard traps

### Screen Reader Support (NVDA, JAWS, or built-in)

- [ ] All buttons have aria-labels
- [ ] Icon buttons describe their purpose
- [ ] Form labels associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Modal role="dialog" announced
- [ ] Menu items have role="menuitem"

### Visual Indicators

- [ ] Focus states are visible (purple ring around buttons)
- [ ] Active/current page links highlighted
- [ ] Color not sole indicator (all text/labels present)
- [ ] Contrast meets 4.5:1 ratio
- [ ] Text is readable (not too small, not compressed)

**Test Tools**:

- Chrome DevTools → Accessibility panel
- axe DevTools extension
- WAVE extension
- Keyboard-only testing (unplug mouse or use only Tab/Enter)

---

## 7. Documentation & Setup Testing ✓

### Setup Guide (SETUP.md)

- [ ] Step-by-step instructions are clear
- [ ] All commands are correct and tested
- [ ] Troubleshooting section resolves common issues
- [ ] Environment variables are properly documented
- [ ] Docker instructions work
- [ ] Manual setup works without Docker

### API Documentation (API_DOCUMENTATION.md)

- [ ] All endpoints are documented
- [ ] Request/response examples are accurate
- [ ] Error codes and messages match implementation
- [ ] Parameter documentation is complete
- [ ] Authentication requirements are clear

### Contributing Guide (CONTRIBUTING.md)

- [ ] Code style guide matches codebase
- [ ] Branch naming conventions are clear
- [ ] Commit message format is explained
- [ ] Pull request process is documented
- [ ] Test instructions are provided

**Test**: New developer should be able to get app running using only SETUP.md

---

## 8. End-to-End User Flows

### Complete User Journey (Happy Path)

1. [ ] User visits app at http://localhost:3000
2. [ ] HomePage loads with recipe grid
3. [ ] User clicks recipe to view details
4. [ ] RecipePage shows full recipe with ingredients and steps
5. [ ] User clicks "Add to Breakfast" button
6. [ ] Modal opens with date picker
7. [ ] User selects date and submits
8. [ ] Modal closes and success confirmed
9. [ ] User navigates to Meal Plan
10. [ ] New recipe appears in meal plan

### Error Handling Flow

1. [ ] User searches for recipes
2. [ ] User attempts to add invalid recipe (test with console error injection)
3. [ ] Error message displays in modal
4. [ ] User can dismiss error and try again
5. [ ] Retry successfully adds recipe

### Mobile Flow

1. [ ] User opens app on mobile (use DevTools mobile emulation)
2. [ ] Hamburger menu opens/closes smoothly
3. [ ] Navigation works with touch
4. [ ] Recipe cards stack single column
5. [ ] Meal plan modal fits screen without scrolling
6. [ ] Form inputs are touch-friendly
7. [ ] All buttons are easily tappable (48x48px minimum)

---

## 9. Performance Validation

### Load Times

- [ ] HomePage initial load: < 3 seconds
- [ ] Recipe detail: < 1 second (cached)
- [ ] Meal plan navigation: instant (cached)
- [ ] Modal open: < 100ms

### Network Analysis (Chrome DevTools → Network)

- [ ] Main bundle < 500KB (gzipped)
- [ ] API responses < 100KB
- [ ] CSS properly minified
- [ ] Images optimized
- [ ] No unused JavaScript

### Rendering Performance

- [ ] Recipe grid scrolls smoothly (60 FPS)
- [ ] Drag-drop in meal plan is responsive
- [ ] No layout thrashing or jank
- [ ] Animations are smooth

**Check**: DevTools → Lighthouse for performance score (target: 80+)

---

## 10. Cross-Browser Testing

### Chrome/Chromium

- [ ] All features work correctly
- [ ] Responsive design at all breakpoints
- [ ] DevTools shows no console errors

### Firefox

- [ ] All features work correctly
- [ ] Focus states visible
- [ ] Form inputs functional

### Safari (if available)

- [ ] All features work correctly
- [ ] Touch gestures work on iOS
- [ ] Responsive design responsive

### Edge

- [ ] All features work correctly
- [ ] Styling renders properly

---

## 11. Security Testing

### Authentication

- [ ] JWT token stored securely
- [ ] Login credentials not logged
- [ ] Session persists correctly
- [ ] Logout clears session

### Data Privacy

- [ ] Passwords never shown in network requests
- [ ] API endpoints validate user ownership
- [ ] No sensitive data in URL parameters
- [ ] CORS properly configured

**Check**: Network tab shows no secrets transmitted

---

## 12. Database Consistency

### Data Integrity

- [ ] Recipes display correct ingredients
- [ ] Ingredient quantities preserved
- [ ] Meal plans reference correct recipes
- [ ] Deleted items don't leave orphaned records
- [ ] No duplicate data created

**Test**:

```bash
npm run studio  # Inspect data visually
```

---

## Test Results Summary

**Mark test date and environment:**

- **Date Tested**: ******\_\_\_******
- **Tester**: ******\_\_\_******
- **Environment**: Local / Docker / Production
- **Browser**: ******\_\_\_******
- **Device**: Desktop / Tablet / Mobile

### Results

- [ ] All tests passed ✅
- [ ] Minor issues found (document below)
- [ ] Major issues found (document below)

**Issues Found**:

```
1. [Priority] Issue description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
```

---

## Sign-Off

**Phase 9 Testing Status**: ******\_\_\_******

- [ ] Ready for merge to main
- [ ] Needs fixes before merge
- [ ] Blocked on external dependencies

**Tester Signature**: ************\_\_\_************

---

## Notes

- All Phase 9 improvements should be working
- No new bugs introduced
- Performance targets met
- Accessibility requirements satisfied
- Documentation accurate and helpful
