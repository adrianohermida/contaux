# 📐 Design System Guide - Contaux CRM

## 1. CSS Tokens - Architecture

### 🎨 Color System
```css
/* Light Mode (Default) */
--color-interactive-default: #0094ff
--color-interactive-hover: #0079cc
--color-interactive-active: #005999
--color-background-primary: #ffffff
--color-background-secondary: #f8f9fa
--color-background-tertiary: #f0f4f8
--color-foreground-primary: #1f2937
--color-foreground-secondary: #4b5563
--color-foreground-disabled: #9ca3af
--color-foreground-muted: #6b7280
--color-border-default: #e5e7eb
--color-border-focus: #0094ff
--color-error: #dc2626
--color-success: #16a34a

/* Dark Mode */
.dark {
  --color-background-primary: #0f172a
  --color-background-secondary: #1e293b
  --color-foreground-primary: #f1f5f9
  --color-foreground-secondary: #cbd5e1
}
```

### 📏 Spacing Scale (Mobile-First + Responsive)
- Mobile: xs(8px), sm(16px), md(24px), lg(32px), xl(48px)
- Tablet: sm(20px), md(32px), lg(48px), xl(64px)
- Desktop: component-padding(40px+)

### 🔤 Typography Scale
- xs: 12px | sm: 14px | base: 16px | lg: 18px | xl: 20px
- 2xl: 24px | 3xl: 30px | 4xl: 36px | 5xl: 48px
- Responsive scaling on tablet (768px+) and desktop (1024px+)

---

## 2. Implementation Standards

### ✅ Always Use CSS Variables
```jsx
/* ❌ WRONG */
<h1 className="text-3xl text-slate-900 dark:text-slate-100">Title</h1>

/* ✅ CORRECT */
<h1 className="text-[var(--font-size-3xl)] text-[var(--color-foreground-primary)]">Title</h1>
```

### ✅ Dark Mode Support
All components must use CSS variables for dark mode:
```jsx
<div className="bg-[var(--color-background-secondary)] text-[var(--color-foreground-primary)]">
```

### ✅ Responsive Design (Mobile-First)
```jsx
<div className="p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] md:p-[var(--spacing-xl)]">
```

### ✅ Accessibility
- Focus rings: `focus:ring-2 focus:ring-[var(--color-border-focus)]`
- ARIA labels on interactive elements
- Semantic HTML (button, nav, main, section)
- Keyboard navigation: Tab, Enter, Escape

---

## 3. Validation Checklist

### CSS & Styling
- [ ] All hardcoded colors replaced with CSS variables
- [ ] All spacing uses `--spacing-*` tokens
- [ ] All typography uses `--font-size-*` tokens
- [ ] Dark mode works on all pages
- [ ] Responsive design tested (mobile/tablet/desktop)

### Accessibility (WCAG 2.1 AA)
- [ ] Color contrast: 4.5:1 (text), 3:1 (large text)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] aria-label on icon-only buttons
- [ ] Form labels associated with inputs

### Mobile-First
- [ ] Mobile layout is primary
- [ ] Tablet/desktop layouts scale appropriately
- [ ] Touch targets 44px+ minimum
- [ ] No horizontal scrolling
- [ ] Safe area insets respected

---

## 4. Component Patterns

### Button
```jsx
<button className="px-[var(--spacing-md)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] focus:ring-2 focus:ring-[var(--color-border-focus)]">
  Click me
</button>
```

### Form Input
```jsx
<input className="px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg bg-[var(--color-background-primary)] text-[var(--color-foreground-primary)] focus:ring-2 focus:ring-[var(--color-border-focus)]" />
```

### Card
```jsx
<div className="bg-[var(--color-background-secondary)] border border-[var(--color-border-default)] rounded-xl p-[var(--spacing-lg)]">
  Content
</div>
```

---

## 5. Icons & Assets

### Lucide React (Required)
```jsx
import { CheckCircle, AlertCircle } from 'lucide-react';
<CheckCircle className="w-5 h-5 text-[var(--color-success)]" aria-hidden="true" />
```

- All icons must use Lucide React
- No emoji usage
- aria-hidden="true" for decorative icons
- aria-label for icon-only buttons

---

## 6. Future Enhancements

- [ ] Animations library (Framer Motion)
- [ ] Component composition patterns
- [ ] Theme switching persistence
- [ ] Storybook integration
- [ ] Automated visual regression testing