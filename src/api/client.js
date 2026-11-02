export async function api(path, options) {
  const response = await fetch('/api/' + path, options)
  if (!(response.headers.get('content-type') || '').includes('json')) throw new Error('API 서버에 연결되지 않았습니다. 잠시 후 다시 시도해 주세요.')
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.')
  return data
}
export const askAgent = (message, history) => api('agent', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({message, history})})
