# Mandi360pro Design Guidelines

## Design Approach: Reference-Based (Agricultural Business Software)
Inspired by modern agricultural management platforms like FarmLogs and AgriWebb, but adapted for Indian mandi operations with culturally appropriate visual elements.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Brand Green: 110 45% 35% (professional mandi green)
- Success Green: 120 60% 50% (transaction confirmations)
- Background Light: 0 0% 98% (clean workspace)
- Background Dark: 210 25% 8% (dark mode primary)

**Accent Colors:**
- Warm Orange: 25 85% 55% (highlights and CTAs)
- Neutral Gray: 220 10% 60% (secondary text)
- Warning Amber: 45 90% 55% (alerts only)

**Gradients:**
- Hero gradient: Subtle blend from brand green to deeper forest tone
- Card highlights: Very subtle green-to-white fade for data cards

### Typography
- **Primary Font:** Inter (Google Fonts) - excellent readability for data-heavy interfaces
- **Display Font:** Poppins (Google Fonts) - for headers and branding
- **Scale:** Use consistent 14px, 16px, 18px, 24px, 32px hierarchy

### Layout System
**Spacing Units:** Consistently use Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
- Tight spacing (2-4) for form elements and data tables
- Medium spacing (6) for card separation and section padding
- Wide spacing (8) for major layout breaks

### Component Library

**Navigation:**
- Top navigation bar with FY selector prominently displayed
- Sidebar navigation with agricultural icons (wheat for lots, users for accounts)
- Breadcrumb navigation for deep data entry flows

**Data Components:**
- Clean data tables with alternating row colors
- Card-based layout for dashboard metrics with subtle shadows
- Form layouts optimized for rapid data entry with clear field grouping

**Agricultural Theming:**
- Subtle crop/grain icons throughout interface
- Mandi-appropriate terminology and visual cues
- Traditional Indian business color sensibilities while maintaining modern UX

### Visual Hierarchy
- Dashboard emphasizes FY-based data with prominent period selectors
- Transaction flows use progressive disclosure to handle complex lot-buyer-seller relationships
- Clear visual distinction between different account types (Buyers, Sellers, Farmers, Agents)

### Images
**Dashboard Hero Section:**
- Medium-height hero (40vh) with subtle agricultural background image or gradient
- Hero features main navigation cards and FY selector overlay
- No large promotional images needed - focus on functional dashboard layout

**Icon Strategy:**
- Use Heroicons for interface elements
- Custom placeholder comments for specialized mandi/agricultural icons
- Maintain consistent icon sizing (16px, 20px, 24px)

### Responsive Considerations
- Mobile-first approach with collapsible sidebar
- Data tables transform to card layouts on mobile
- Touch-friendly form controls for tablet data entry
- Maintain agricultural theming across all screen sizes

This design balances the professional needs of mandi management with culturally appropriate visual elements, ensuring efficient workflows while maintaining visual appeal for daily business operations.