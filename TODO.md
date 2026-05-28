# TODO - Sleek Modern UI/UX Refresh

## Step 1: Theme token groundwork (Dark + Light) ✅
- Update `src/index.css`
  - Fix default CSS variables so light mode is correct in `:root`
  - Ensure `.dark` provides matching dark palette
  - Add reusable higher-level tokens (surfaces, accents, border, focus ring)

## Step 2: Enable theme class on the app root ✅
- Update `src/App.jsx`
  - Detect system preference (and/or respect existing user preference if any)
  - Toggle `className="dark"` on a top-level wrapper element

## Step 3: Modernize core shared surfaces
- Update shared UI components to use tokens instead of hardcoded colors:
  - `src/components/Sidebar.jsx`
  - `src/components/Navbar.jsx`
  - `src/components/BottomNav.jsx`
  - `src/components/Player.jsx`

## Step 4: Modernize pages (start with Welcome)
- Update `src/pages/Welcome.jsx`
  - Replace hardcoded colors/gradients and buttons with token-based “glass” surfaces
  - Standardize font sizes/weights and spacing

## Step 5: Continue through remaining pages/components
- Replace remaining hardcoded colors across:
  - `src/pages/*.jsx`
  - `src/components/*.jsx`

## Step 6: Validate
- Run `npm run dev` and visually verify the new UI
- Run `npm run build` to confirm there are no build issues

