const STORAGE_KEY = "vyapaar_token"

export function getToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // ignore
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

