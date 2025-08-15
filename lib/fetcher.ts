export default async function fetcher(url: string, data = undefined) {
  const res = await fetch(`${window.location.origin}/api${url}`, {
    method: data ? 'POST' : 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (res.status >= 200 && res.status < 300) {
    return result
  } else {
    throw result.error
  }
}
