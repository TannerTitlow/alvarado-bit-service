import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SITE_URL = 'https://alvaradobitservice.com'

const routes = [
  { path: '/' },
  { path: '/about/' },
  { path: '/contact/' },
]

const urls = routes
  .map(
    route => `  <url>
    <loc>${SITE_URL}${route.path}</loc>
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
