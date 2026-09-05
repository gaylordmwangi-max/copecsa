# COPECSA Website

**College of Pathologists of East, Central and Southern Africa**

A modern, responsive institutional website for COPECSA — promoting excellence in the practice of Pathology across East, Central and Southern Africa.

## About

COPECSA (College of Pathologists of East, Central and Southern Africa) was established in 2012 to promote excellence in the practice of Pathology and maintain standards through training, examinations, and professional development.

## Website Structure

```
/
├── index.html          # Homepage
├── about.html          # About COPECSA — History, Mission, Vision
├── leadership.html     # Council Members & Leadership Team
├── programmes.html     # Programmes & Activities
├── examinations.html   # Collegiate Examinations
├── partners.html       # Partners & Collaborators
├── resources.html      # Publications & Resources
├── contact.html        # Contact Information & Form
└── assets/
    ├── css/style.css   # Design system & styles
    ├── js/main.js      # Navigation & interactivity
    └── images/         # Logo, photos, flags
        ├── logo-colour.png
        ├── logo-white.png
        ├── hero-bg.jpg
        ├── laboratory-1.jpg
        ├── laboratory-2.jpg
        ├── portrait-president.png
        └── flags/      # Country flag icons
```

## Technology

- **Pure HTML5 + CSS3 + Vanilla JavaScript** — Zero dependencies
- **Google Fonts**: Space Grotesk (headings) + DM Sans (body)
- **CSS Custom Properties** for theming
- **Responsive design** with mobile-first approach
- **Semantic HTML** for accessibility and SEO

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to Repository Settings → Pages
3. Select "Deploy from a branch" → Main branch
4. Your site will be live at `https://username.github.io/repository-name/`

### Custom Domain

1. Add a `CNAME` file with your domain (e.g., `www.copecsa.org`)
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

## Local Development

No build tools required. Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Design System

### Colours
- **Navy**: `#1a2a5c` (primary)
- **Gold**: `#f0b429` (accent)
- **Red**: `#c0392b` (shield accent, used sparingly)

### Typography
- **Headings**: Space Grotesk (400-700)
- **Body**: DM Sans (300-700)

## Content Notes

Sections marked with `[CONTENT REQUIRED]` indicate areas where additional content is needed from COPECSA. These placeholders should be replaced with actual content before the final launch.

## Future Enhancements

This MVP is architected to support future expansion:
- CMS integration for news/blog publishing
- Events calendar
- Newsletter subscription
- Search functionality
- Multiple languages
- Analytics integration
- Advanced project/impact pages

## Contact

**COPECSA** — College of Pathologists of East, Central and Southern Africa
- Email: info@copecsa.org
- Location: Arusha, Tanzania

## License

© 2024 COPECSA. All rights reserved.
