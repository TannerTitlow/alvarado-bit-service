import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://www.alvaradobitservice.com'
const lastmod = new Date().toISOString().slice(0, 10)

const routes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.9' },
]

const urls = routes
  .map(
    route => `  <url>
    <loc>${SITE_URL}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

const outputPath = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url))
writeFileSync(outputPath, sitemap)

console.log(`Sitemap generated at ${outputPath}`)
