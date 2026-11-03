# SDC Website Style Guide & Design Instructions

To ensure a premium and consistent experience across the SDC website, all developers must adhere to the following design patterns and styling guidelines.

## 🎨 Color Palette
We aim for a modern, high-contrast palette with support for both light and dark modes.

- **Primary**: A vibrant, energetic blue or indigo (e.g., `#3B82F6` or `#6366F1`) for primary actions and highlights.
- **Secondary/Accent**: A complementary vibrant color (e.g., Violet or Cyan) for subtle accents.
- **Backgrounds**: 
    - **Light Mode**: Clean white (`#FFFFFF`) or very light gray (`#F9FAFB`).
    - **Dark Mode**: Deep black (`#0A0A0A`) or charcoal (`#171717`).
- **Foregrounds**: High-contrast text (Zinc-900 for light, Zinc-50 for dark).
- **Muted**: Zinc-500/600 for secondary information.

> [!IMPORTANT]
> **Use CSS Variables**: Always use the `--background`, `--foreground`, and other Tailwind-provided variables (e.g., `text-muted-foreground`) to ensure seamless theme switching.

## 🔤 Typography
- **Primary Font**: Use modern sans-serif fonts such as **Inter**, **Roboto**, or **Outfit**. 
- **Headings**: Semi-bold to Bold weights, with tight tracking (`tracking-tight`) for a premium look.
- **Body**: Regular weight, optimal line height (`leading-relaxed`) for readability.

## 🧱 Component Consistency
- **Library Recommendation**: Use [Aceternity UI](https://ui.aceternity.com/components) for complex, high-performance, and visually stunning components (e.g., hero sections, background effects, 3D cards).
- **Buttons**:
    - Rounded-full or moderate border-radius (e.g., `rounded-lg`).
    - Smooth hover transitions (`transition-all duration-200`).
    - Primary buttons should have a subtle glow or shadow on hover.
- **Cards**:
    - Glassmorphism effect for dark mode (subtle border, low-opacity background with blur).
    - Consistent padding (e.g., `p-6` or `p-8`).
- **Layout**:
    - Use a consistent container width (e.g., `max-w-7xl`) and horizontal padding for responsiveness.
    - Maintain generous whitespace between sections.

## ✨ Interactions & Animations
- **Micro-animations**: Use subtle entrance animations (e.g., `fade-in`, `slide-up`) for sections as the user scrolls.
- **Hover Effects**: All interactive elements (links, cards, buttons) MUST have a visible hover state.
- **Smooth Scrolling**: Ensure smooth scroll behavior for anchor links.

## 🛠️ Implementation Rules
1. **Don't Hardcode Colors**: Use the Tailwind configuration or CSS variables defined in `src/app/globals.css`.
2. **Modular Components**: Keep UI components small, reusable, and independent. Store them in `src/components/ui/`.
3. **Semantic HTML**: Use proper tags (`<header>`, `<footer>`, `<main>`, `<section>`, `<h1>`-`<h6>`) for SEO and accessibility.
