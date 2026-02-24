import Script from 'next/script'

export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'bmad-todo',
        description:
          'A portfolio-grade todo application demonstrating full-stack craftsmanship with clean code and best practices.',
        url: 'https://bmad-todo.vercel.app',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Raul Saez',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5',
          ratingCount: '1',
        },
        featureList: [
          'Create and manage todos',
          'Mark todos as complete/incomplete',
          'Delete todos',
          'Data persistence across sessions',
          'Crash recovery',
          'Offline support',
          'Responsive design',
          'Accessibility compliant',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://bmad-todo.vercel.app#website',
        url: 'https://bmad-todo.vercel.app',
        name: 'bmad-todo',
        description: 'Clean, simple task management application',
        publisher: {
          '@type': 'Person',
          name: 'Raul Saez',
        },
        inLanguage: 'en-US',
      },
    ],
  }

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
