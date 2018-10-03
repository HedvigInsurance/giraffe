import fetch from 'node-fetch'

const register = (baseUrl: string) => async () => {
  const data = await fetch(`${baseUrl}/helloHedvig`, { method: 'POST' })
  return data.text()
}

const getInsurance = (baseUrl: string) => async (token: string) => {
  const data = await fetch(`${baseUrl}/insurance`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.json()
}

const getUser = (baseUrl: string) => async (token: string) => {
  const data = await fetch(`${baseUrl}/member/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.json()
}

const logoutUser = (baseUrl: string) => async (token: string) => {
  await fetch(`${baseUrl}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export { getInsurance, getUser, logoutUser, register }
