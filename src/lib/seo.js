export const SITE_URL = 'https://www.alvaradobitservice.com'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const DEFAULT_SEO = {
  title: 'Alvarado Bit Service | American-Made Water Well Drill Bits',
  description:
    'Family-owned excellence in drilling since 1976. Specialized in manufacturing, selling, and repairing water well drill bits with nationwide 24/7 service.',
  keywords:
    'water well drill bits, PDC bits, tri-cone bits, drilling equipment, Asteroid PDC, drill bit repair, water well drilling, American-made drill bits',
}

export const ROUTE_SEO = {
  home: {
    title: 'Alvarado Bit Service | American-Made Water Well Drill Bits',
    description:
      'Family-owned excellence in drilling since 1976. Specialized in manufacturing, selling, and repairing water well drill bits with nationwide 24/7 service.',
    keywords:
      'water well drill bits, American-made drill bits, asteroid pdc, tri-cone bits, pdc repairs',
  },
  about: {
    title: 'About Alvarado Bit Service | Legacy Since 1976',
    description:
      'Learn how our family-owned team has served drilling operations nationwide for nearly five decades with trusted products, repairs, and 24/7 support.',
    keywords:
      'about alvarado bit service, drilling legacy, family owned drill bit company, water well drilling expertise',
  },
  contact: {
    title: 'Contact Alvarado Bit Service | 24/7 Nationwide Service',
    description:
      'Reach our family-owned team 24/7 for water well drill bits, repairs, and field support. Headquartered in Texas with a Georgia-based service representative.',
    keywords:
      'contact alvarado bit service, drill bit repair contact, texas drill bits, georgia service representative',
  },
  adminLogin: {
    title: 'Admin Login | Alvarado Bit Service',
    description: 'Secure login for Alvarado Bit Service administrators.',
  },
  admin: {
    title: 'Admin Dashboard | Alvarado Bit Service',
    description: 'Administrative dashboard for Alvarado Bit Service.',
  },
}

export function getCanonicalUrl(path = '/') {
  if (!path || path === '/') {
    return `${SITE_URL}/`
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath.replace(/\/+$/, '')}`
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Alvarado Bit Service',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/apple-touch-icon.png`,
    email: 'Mark.turner6987@gmail.com',
    telephone: '+1-817-240-4996',
    foundingDate: '1976',
    areaServed: 'US',
  }
}

export function createServiceAreaBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#service-area-business`,
    name: 'Alvarado Bit Service',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/og-image.jpg`,
    description:
      'Family-owned manufacturer and service provider for water well drill bits, including PDC and tri-cone bits, repairs, and 24/7 support.',
    telephone: '+1-817-240-4996',
    email: 'Mark.turner6987@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '841 Hill County Road 1136',
      addressLocality: 'Rio Vista',
      addressRegion: 'TX',
      postalCode: '76093',
      addressCountry: 'US',
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'United States',
      },
      {
        '@type': 'State',
        name: 'Texas',
      },
      {
        '@type': 'State',
        name: 'Georgia',
      },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+1-817-240-4996',
        areaServed: 'US',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: '+1-817-205-1672',
        areaServed: 'GA',
        availableLanguage: 'English',
      },
    ],
  }
}

export function createWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: 'Alvarado Bit Service',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  }
}

export function createContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact#webpage`,
    url: `${SITE_URL}/contact`,
    name: 'Contact Alvarado Bit Service',
    mainEntity: {
      '@id': `${SITE_URL}/#service-area-business`,
    },
  }
}

export function createCommonSchemas() {
  return [createOrganizationSchema(), createServiceAreaBusinessSchema()]
}

export function createHomeSchemas() {
  return [...createCommonSchemas(), createWebsiteSchema()]
}

export function createContactSchemas() {
  return [...createCommonSchemas(), createContactPageSchema()]
}
