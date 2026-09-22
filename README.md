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
├── robots.txt          # Crawler rules + sitemap location
├── sitemap.xml         # Every public page and document, for search engines
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

## Search Engine Files

`robots.txt` and `sitemap.xml` sit at the repo root, so a branch deploy serves them as they are. The Vite build copies them into `dist/` too (see `vite.config.js`).

- `robots.txt` allows every crawler and points to `https://copecsa.org.za/sitemap.xml`.
- `sitemap.xml` lists every page, plus the bylaws PDF. The homepage is listed as `https://copecsa.org.za/`, the other pages as `/<page>.html`. Each `<lastmod>` is the date of the file's last commit.

**When you add, rename or remove a page**, update the `pages` list in `vite.config.js` and `sitemap.xml` together. When you change a page's content substantially, update its `<lastmod>`. `npm run test:seo` fails if the two files fall out of step. It also fails if any page links to an `.html` or `.pdf` file that is missing from the sitemap, if a sitemap entry points to a file that doesn't exist, or if the build stops copying the files.

After deploying, submit the sitemap once in Google Search Console (Sitemaps, then `sitemap.xml`), or ask Claude to run `gsc_submit_sitemap` through the SEOMonster server below.

## SEO Tooling (SEOMonster MCP)

The repo ships a project-scoped [SEOMonster](https://seomonster.avansaber.com) MCP server so Claude Code can audit and monitor the site's SEO using Search Console, GA4, PageSpeed Insights, Cloudflare and IndexNow data.

| File | Purpose |
|------|---------|
| `.mcp.json` | Registers `seo-monster`, launched with `uvx seo-monster@0.9.3` (the version is pinned so every session runs the same code) |
| `.claude/settings.json` | Approves the server ahead of time, so it loads without asking once the workspace is trusted |
| `tests/seo-monster-mcp.test.mjs` | Smoke test: starts the server the same way Claude Code does, then checks the MCP handshake, the tools, the prompts and the `system_status` envelope |

This is the committed version of:

```bash
claude mcp add --scope project seo-monster \
  -e 'SEO_MCP_GSC_DEFAULT_SITE=${SEO_MCP_GSC_DEFAULT_SITE:-sc-domain:copecsa.org.za}' \
  -e 'CF_ZONE=${CF_ZONE:-copecsa.org.za}' \
  -- uvx seo-monster@0.9.3
```

**Requirements:** [`uv`](https://docs.astral.sh/uv/) (it provides `uvx`) and Python 3.11+. `uvx` fetches the package from PyPI on first use.

**Verify:** run `npm run test:mcp` (or `npm test` for every check), or run `claude mcp list` and look for `seo-monster … ✓ Connected`. In a session, ask Claude to *"call seo-monster system_status"*.

### Credentials

The server works without credentials: the technical checks (`inspect_meta`, `robots_txt_validate`, `sitemap_health`, `validate_schema` and others) need none. The Google, Cloudflare and IndexNow tools return `AUTH_MISSING` with a fix-it hint until you configure them. **Never commit credentials.** Put them in your shell environment or in `~/.config/seo-mcp/config.toml` (mode `0600`).

1. `uvx --from seo-monster@0.9.3 seo-monster setup` collects the Cloudflare token, PSI key, IndexNow key and default properties interactively, and writes the config file.
2. `uvx --from seo-monster@0.9.3 seo-monster auth` does the one-time Google OAuth consent in the browser (Search Console, Indexing API and GA4). It needs a *Desktop app* OAuth client; see the [upstream auth guide](https://pypi.org/project/seo-monster/).

| Variable | Default in `.mcp.json` | Purpose |
|----------|------------------------|---------|
| `SEO_MCP_GSC_DEFAULT_SITE` | `sc-domain:copecsa.org.za` | Default Search Console property. Set it to `https://copecsa.org.za/` if the site is a URL-prefix property |
| `CF_ZONE` | `copecsa.org.za` | Default Cloudflare zone |
| `SEO_MCP_GA4_PROPERTY_ID` | none | GA4 property, e.g. `properties/123456789` |
| `PSI_API_KEY`, `CF_API_TOKEN`, `SEO_MCP_INDEXNOW_KEY` | none | Service keys. Read from your environment or the config file |

Cloudflare write tools (cache purge, redirects, settings) stay off unless `SEO_MCP_ALLOW_DESTRUCTIVE=true`.

**Claude Code on the web:** add the variables above in the environment settings. Those sessions can only reach hosts allowed by the environment's network policy. Google, Cloudflare and the live site must be reachable for the corresponding tools to work.

### Useful workflows

The server publishes MCP prompts that chain its tools together:

- `technical_seo_audit` (url): meta tags, canonicals, redirects, mixed content, robots.txt and sitemap, ranked by severity
- `pre_deploy_check` (urls): a go/no-go check before pushing to `main`
- `structured_data_audit` (urls): JSON-LD validation, useful for `EducationalOrganization` markup
- `weekly_review`: Search Console gainers and losers plus GA4 organic traffic (needs Google auth)

To upgrade, change the pinned version in `.mcp.json` (the test checks that it stays pinned), then run `npm run test:mcp`.

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
