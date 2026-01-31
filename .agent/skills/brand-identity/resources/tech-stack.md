# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack

- **Framework:** React (TypeScript preferred)
- **Styling Engine:** Tailwind CSS (Mandatory. Do not use plain CSS or styled-components unless explicitly asked.)
- **Component Library:** shadcn/ui (Use these primitives as the base, but customize them with our tokens.)
- **Icons:** Lucide React

## Implementation Guidelines

### 1. Tailwind Usage

- Use utility classes directly in JSX.
- Utilize the color tokens defined in `design-tokens.json` (e.g., use `bg-primary text-primary-foreground`).
- **Shadows:** Use `shadow-lg` or `shadow-xl` for cards to create a "floating" effect, typical of our modern style.

### 2. Component Patterns

- **Buttons:**
  - MUST use `rounded-2xl` or `rounded-full` (never square).
  - Primary actions use the solid Primary color.
- **Cards:**
  - Use ample padding (`p-6` or `p-8`).
  - Backgrounds should be white. Use shadows for contrast against the white background.
- **Layout:** Use Flexbox and CSS Grid via Tailwind utilities.

### 3. Forbidden Patterns

- Do NOT use jQuery.
- Do NOT use Bootstrap classes.
- Do NOT use hard corners (`rounded-none`).
