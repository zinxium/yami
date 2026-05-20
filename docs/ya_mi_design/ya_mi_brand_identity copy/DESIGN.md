---
name: Ya Mi Brand Identity
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#584141'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#8c7071'
  outline-variant: '#e0bfbf'
  surface-tint: '#af2b3e'
  primary: '#570013'
  on-primary: '#ffffff'
  primary-container: '#800020'
  on-primary-container: '#ff828a'
  inverse-primary: '#ffb3b5'
  secondary: '#715c00'
  on-secondary: '#ffffff'
  secondary-container: '#feda57'
  on-secondary-container: '#745f00'
  tertiary: '#540518'
  on-tertiary: '#ffffff'
  tertiary-container: '#731e2c'
  on-tertiary-container: '#f98691'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b5'
  on-primary-fixed: '#40000b'
  on-primary-fixed-variant: '#8e0f28'
  secondary-fixed: '#ffe179'
  secondary-fixed-dim: '#e6c443'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#554500'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#40000e'
  on-tertiary-fixed-variant: '#7f2735'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
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
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 24px
  margin-desktop: 64px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

The brand personality is rooted in "Dignified Accessibility." It avoids the cold, clinical aesthetic of traditional banking in favor of a warm, human-centric approach that feels both premium and culturally resonant. The design style is a sophisticated blend of **Minimalism** and **Modern Corporate**, utilizing a "Warm Minimalist" filter. 

Key pillars include:
- **African-inspired Elegance:** Subtle use of geometric patterns and a palette that evokes rich textiles and natural earth tones.
- **Human Connection:** Generous whitespace and soft edges that reduce the anxiety often associated with personal loans.
- **Premium Reliability:** A high-contrast interplay between deep burgundy and cream that signals maturity and stability.

## Colors

The palette is designed to evoke warmth and prestige. 

- **Primary Burgundy:** Used for key brand moments, primary actions, and headers. It represents strength and heritage.
- **Dark Burgundy UI:** Reserved for high-contrast backgrounds or deep-layered surfaces where text needs to pop in gold.
- **Accent Mustard:** A tactical "utility gold." Used sparingly for high-attention callouts, active states, or celebratory milestones (e.g., "Loan Approved").
- **Background Cream:** The foundation of the UI. It provides a softer, more organic feel than pure white, reducing eye strain and feeling more "boutique."
- **UI Gray:** Used strictly for borders, disabled states, and secondary iconography to maintain the minimalist structure.

## Typography

This design system employs a dual-font strategy to balance tradition with modernity. 

- **Headlines (Libre Caslon Text):** This serif font provides an authoritative, editorial feel. It should be used for large titles, loan amounts, and greeting messages. It carries the "African-inspired elegance" through its classic, high-contrast strokes.
- **UI & Body (Plus Jakarta Sans):** A modern, soft sans-serif that ensures maximum legibility for functional data. Its slightly rounded terminals complement the "human" aspect of the brand.
- **Hierarchy:** Ensure a clear distinction between the serif storytelling elements and the sans-serif functional data. Financial figures in tables should use the Sans-serif for clarity, while hero balances can use the Serif.

## Layout & Spacing

The layout philosophy emphasizes **Generous Whitespace** to prevent the "claustrophobic" feeling of debt. 

- **Grid:** A 4-column fluid grid for mobile and a 12-column fixed grid for tablet/desktop. 
- **Rhythm:** An 8px base unit drives all spacing. 
- **Margins:** 24px side margins are mandatory on mobile to create a "contained," premium frame for content.
- **Vertical Rhythm:** Use larger gaps (40px+) between major sections to allow the eye to rest. Card internal padding should be consistent at 20px or 24px.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Surface Strategy:** The Cream background is the base. Cards and containers use pure white or a very slight tint of the cream to sit "above" the base.
- **Shadows:** Use extremely soft, diffused shadows with a slight Burgundy tint (e.g., `rgba(77, 0, 19, 0.05)`) rather than pure black. This maintains the warmth of the palette.
- **Interaction:** On tap/hover, cards should subtly lift (increase shadow spread) rather than change color, mimicking a physical piece of high-quality stationery.

## Shapes

The shape language is "Approachable Geometric." 

- **Standard Radius:** 12px to 16px (0.75rem to 1rem) for all primary containers and cards.
- **Buttons:** Fully rounded (pill-shaped) for primary actions to contrast against the more structured cards.
- **Inputs:** 12px radius to match the card language, creating a cohesive internal alignment.
- **Icons:** Icons must be monoline and geometric, avoiding heavy fills. Use a 2px stroke weight to maintain a delicate, premium feel.

## Components

- **Buttons:** Primary buttons use the Burgundy background with Cream text. Secondary buttons use a Mustard border or subtle Cream fill.
- **Cards:** White or very pale cream surfaces with 16px radius and the signature soft burgundy-tinted shadow. Cards should never have harsh borders.
- **Input Fields:** Use a subtle `ui_gray` border that shifts to Burgundy on focus. Floating labels are preferred using `label-sm` typography.
- **Chips:** Small, pill-shaped tags used for loan status (e.g., "Pending", "Active"). Use Mustard background with Dark Burgundy text for high-importance statuses.
- **Lists:** Clean rows with 1px `ui_gray` dividers that do not touch the screen edges (inset by 24px).
- **Loan Progress Bar:** A custom component using Mustard for the progress fill and Dark Burgundy for the track, reflecting the premium color story.