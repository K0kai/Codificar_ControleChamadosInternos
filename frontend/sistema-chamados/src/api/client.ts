export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5077/api'

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)

  if (!response.ok) {
    const message = await response.text()
    
    throw new Error(message || 'Não foi possível concluir a requisição.')
  }

  return response.json() as Promise<T>
}

export async function requestEmpty(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, init)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Não foi possível concluir a requisição.')
  }
}
