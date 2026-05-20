---
name: Elysian Noir Finance
colors:
  surface: '#191113'
  surface-dim: '#191113'
  surface-bright: '#413739'
  surface-container-lowest: '#140c0e'
  surface-container-low: '#22191b'
  surface-container: '#261d1f'
  surface-container-high: '#31282a'
  surface-container-highest: '#3c3234'
  on-surface: '#efdee1'
  on-surface-variant: '#e0bec0'
  inverse-surface: '#efdee1'
  inverse-on-surface: '#382e30'
  outline: '#a7898b'
  outline-variant: '#594142'
  surface-tint: '#ffb2b9'
  primary: '#ffb2b9'
  on-primary: '#67001e'
  primary-container: '#a61c3c'
  on-primary-container: '#ffb9bf'
  inverse-primary: '#b22644'
  secondary: '#e6c443'
  on-secondary: '#3b2f00'
  secondary-container: '#ac8e01'
  on-secondary-container: '#332900'
  tertiary: '#dac0c5'
  on-tertiary: '#3c2c30'
  tertiary-container: '#645156'
  on-tertiary-container: '#dfc5ca'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b9'
  on-primary-fixed: '#40000f'
  on-primary-fixed-variant: '#90042e'
  secondary-fixed: '#ffe179'
  secondary-fixed-dim: '#e6c443'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#554500'
  tertiary-fixed: '#f7dce1'
  tertiary-fixed-dim: '#dac0c5'
  on-tertiary-fixed: '#26181b'
  on-tertiary-fixed-variant: '#544246'
  background: '#191113'
  on-background: '#efdee1'
  surface-variant: '#3c3234'
typography:
  headline-xl:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1200px
---

## Brand & Style
The design system embodies a "Luxury Finance" aesthetic, blending the heritage of traditional banking with the sleek, high-contrast demands of modern digital interfaces. The brand personality is authoritative, exclusive, and sophisticated, designed to evoke a sense of trust and elite status.

The visual style is a fusion of **Minimalism** and **High-Contrast Dark Mode**. It relies on expansive dark surfaces, precise typography, and a "less is more" approach to UI elements. By utilizing a deep, burgundy-tinted charcoal base, the system maintains warmth and depth, avoiding the coldness of pure black. This creates a refined environment where capital and data feel secure yet accessible.

## Colors
The palette is rooted in a deep, nocturnal foundation. The primary surface is a rich, burgundy-tinted charcoal (#1A1214), providing a luxurious backdrop that feels more organic than standard greys.

- **Primary Burgundy (#A61C3C):** Adjusted for dark mode accessibility, this shade is slightly more vibrant and desaturated than a standard oxblood to ensure it "pops" without vibrating against the dark background. It is used for primary actions and key brand moments.
- **Secondary Mustard (#FFDB58):** A high-contrast accent used sparingly for success states, gold-standard highlights, and critical call-to-outs.
- **Neutral/Surface Tiering:** Tertiary tones (#2D1E22) are used for card backgrounds and input fields to create subtle separation from the base canvas.
- **Typography:** High-readability cream (#F5F1E9) is used for primary text to reduce eye strain while maintaining the warm, premium feel.

## Typography
The typographic hierarchy emphasizes contrast between serif elegance and sans-serif utility. 

**Libre Caslon Text** is reserved for headlines. Its editorial, literary character conveys history and institutional weight. Use generous line heights for headlines to allow the letterforms to breathe.

**Work Sans** is used for all functional text, including body copy, labels, and data points. It provides a grounded, neutral balance to the serif headers, ensuring that financial figures and complex information remain legible at all sizes. Label styles should utilize slight letter spacing and semi-bold weights to create a "UI-first" feel for navigation and buttons.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop and a **Fluid Grid** on mobile. The system is built on a strict 8px base unit to ensure alignment across all components.

- **Desktop:** A 12-column grid with a maximum container width of 1200px. Large margins (64px) are used to push content inward, creating an "executive" feel with significant white space (negative space).
- **Mobile:** A 4-column grid with 16px side margins. 
- **Rhythm:** Spacing between sections should be aggressive (64px or 80px) to maintain the minimalist, high-end aesthetic. Grouped elements should stay tight (8px or 16px) to signify relationship.

## Elevation & Depth
In this dark mode environment, depth is communicated through **Tonal Layers** rather than heavy shadows. 

1. **Base (Level 0):** The primary canvas color (#1A1214).
2. **Surface (Level 1):** Card and container backgrounds use a slightly lighter, desaturated burgundy-grey (#2D1E22). 
3. **Elevated (Level 2):** Hover states and active modals use a subtle, 1px low-contrast outline in a desaturated burgundy (#4A353A) to define edges.

Shadows, if used, should be extremely soft, large-radius ambient blurs with a dark burgundy tint (e.g., #000000 at 40% opacity with a 24px blur), ensuring they look like natural depth rather than "web shadows."

## Shapes
The shape language uses **Rounded (Level 2)** settings. This 8px (0.5rem) base corner radius strikes a balance between the "sturdiness" of traditional finance and the "accessibility" of modern technology.

- **Standard Components:** Buttons, input fields, and small cards use the 8px radius.
- **Large Containers:** Hero sections or main content cards may use `rounded-xl` (1.5rem / 24px) to create a softer, more modern framing.
- **Icons:** Should follow a medium-stroke weight with slightly rounded terminals to match the component corners.

## Components

### Buttons
- **Primary:** Solid Burgundy (#A61C3C) with cream text. High-contrast, bold, and authoritative.
- **Secondary:** Outlined in Mustard (#FFDB58) with mustard text. Used for secondary actions.
- **Ghost:** Cream text with no background; turns to a subtle #2D1E22 fill on hover.

### Input Fields
Inputs use the #2D1E22 surface color to recede into the UI. The bottom border should be a subtle 1px line in muted burgundy. Upon focus, the border transitions to Mustard (#FFDB58) for clear visual feedback.

### Cards
Cards are the primary container for data. They should not have heavy borders; instead, use the Tonal Layering (Level 1) to distinguish them from the background. Padding within cards should be generous (min 24px).

### Chips & Tags
Small, pill-shaped indicators. For "Success" or "Elite Status," use a Mustard background with dark text. For "Neutral" data, use a dark burgundy stroke with cream text.

### Lists & Data Tables
Maintain high contrast. Rows should have a subtle separator line (#2D1E22). Use Work Sans for all numeric data, ensuring tabular lining is used so figures align vertically for easy comparison.