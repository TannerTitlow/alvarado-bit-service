export default async function adminNoindex(request, context) {
  const url = new URL(request.url)

  if (url.hostname !== 'admin.alvaradobitservice.com') {
    return context.next()
  }

  const response = await context.next()
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')

  return response
}
