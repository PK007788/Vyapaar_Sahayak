# Frontend Task Map (Vyapaar Sahayak)

This guide tells you where to edit the frontend based on what you want to change.

## 1) App Flow and Routing

- Change routes (`/`, `/about`, `/login`, `/register`, `/app`): `src/App.jsx`
- App startup (React root, router, providers): `src/main.jsx`
- Protect dashboard route for logged-in users: `src/components/ProtectedRoute.jsx`

## 2) Authentication

- Login UI and submit behavior: `src/pages/Login.jsx`
- Register UI and submit behavior: `src/pages/Register.jsx`
- Auth state (`token`, `isLoggedIn`, `logout`): `src/context/AuthContext.jsx`
- Token read/write in localStorage: `src/lib/authToken.js`
- Login/Register API calls and headers: `src/lib/api.js`

## 3) Dashboard (Main App)

- Dashboard layout, card data, customer ledger, invoice detail/edit logic: `src/pages/Dashboard.jsx`
- Add customer form modal: `src/components/CustomerModal.jsx`
- Record payment form modal: `src/components/PaymentModal.jsx`
- Create invoice form modal: `src/components/InvoiceModal.jsx`
- Shared modal wrapper (portal + overlay): `src/components/Modal.jsx`

## 4) Voice Commands

- Voice capture, speech recognition, TTS, silence timers: `src/components/VoiceCommand.jsx`
- Voice command backend endpoints are called from this component (`/ai-command`, `/ai-command/silence-timeout`)

## 5) Landing Page Content

- Landing page section order: `src/pages/Landing.jsx`
- Hero section and language picker step: `src/components/Hero.jsx`
- How-it-works section: `src/components/HowItWorks.jsx`
- Product/dashboard showcase section: `src/components/ProductShowcase.jsx`
- Feature highlights section: `src/components/FeatureSection.jsx`
- Trust section: `src/components/TrustBar.jsx`
- Bottom CTA section: `src/components/CTA.jsx`
- Top navbar and auto-hide on scroll: `src/components/Navbar.jsx`
- Footer links/social/contact: `src/components/Footer.jsx`

## 6) Language and Translations

- Current language state and persistence (`en` / `hi`): `src/context/LanguageContext.jsx`
- EN/HI toggle button UI: `src/components/LanguageToggle.jsx`
- Language picker modal UI: `src/components/LanguagePickerModal.jsx`
- Translation strings and lookup helper: `src/lib/i18n.js`

## 7) About Page

- Active About route page: `src/pages/About.jsx`
- Note: there is also `src/components/About.jsx` (alternate/older About component, currently not used by route)

## 8) API Integration

- Central fetch wrapper, auth header handling, endpoint methods: `src/lib/api.js`
- To add a new backend call, add method in `api` object here first.

## 9) Styling

- Main global styles, fonts, utility classes: `src/index.css`
- Tailwind + utility classes are used across components/pages
- `src/App.css` exists but appears to be leftover Vite starter styles and is not used in main flow

## 10) Reusable Visuals

- Shared SVG illustrations/icons: `src/components/Illustrations.jsx`

## 11) Quick "If You Want To..." Cheatsheet

- Change homepage text/layout: `src/pages/Landing.jsx` + relevant section component in `src/components/`
- Change navbar links/behavior: `src/components/Navbar.jsx`
- Change login/register validations/messages: `src/pages/Login.jsx`, `src/pages/Register.jsx`
- Change dashboard data cards/tables/actions: `src/pages/Dashboard.jsx`
- Change modal form fields for customer/payment/invoice: `src/components/CustomerModal.jsx`, `src/components/PaymentModal.jsx`, `src/components/InvoiceModal.jsx`
- Change API base URL behavior or error parsing: `src/lib/api.js`
- Add or edit EN/HI text keys: `src/lib/i18n.js`
- Change language persistence logic: `src/context/LanguageContext.jsx`
- Change token/session behavior: `src/context/AuthContext.jsx`, `src/lib/authToken.js`
- Change global app look (fonts/colors/util classes): `src/index.css`

---

If you want, I can also create a second version grouped by roles:
- UI designer (look and feel)
- frontend developer (logic and API)
- QA tester (what to test after each change)
