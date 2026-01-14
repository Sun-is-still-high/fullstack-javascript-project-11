const parse = data => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(data, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    const error = new Error(parseError.textContent)
    error.isParsingError = true
    throw error
  }

  const channel = doc.querySelector('channel')
  const title = channel.querySelector('title').textContent
  const description = channel.querySelector('description').textContent

  const items = channel.querySelectorAll('item')
  const posts = Array.from(items).map(item => ({
    title: item.querySelector('title').textContent,
    link: item.querySelector('link').textContent,
    description: item.querySelector('description').textContent,
  }))

  return {
    feed: { title, description },
    posts,
  }
}

export default parse
