import { getToken } from "./authToken"

function normalizeBase(base) {
  if (!base) return ""
  return base.endsWith("/") ? base.slice(0, -1) : base
}

const API_BASE = normalizeBase(import.meta.env.VITE_API_BASE_URL || "/api")

async function readJsonSafe(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  headers.set("Accept", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await readJsonSafe(res)

  if (!res.ok) {
    const detail = data?.detail || data?.message || data?.error || `Request failed (${res.status})`
    const err = new Error(detail)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  login: (phone, password) =>
    apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),

  register: ({ shop_name, owner_name, phone, password }) =>
    apiFetch("/register", {
      method: "POST",
      body: JSON.stringify({ shop_name, owner_name, phone, password }),
    }),

  dashboard: () => apiFetch("/dashboard"),

  customers: () => apiFetch("/customers"),

  createCustomer: ({ name, phone }) =>
    apiFetch("/customers", {
      method: "POST",
      body: JSON.stringify({ name, phone: phone || null }),
    }),

  createInvoice: ({ customer_id, items }) =>
    apiFetch("/invoice", {
      method: "POST",
      body: JSON.stringify({ customer_id, items }),
    }),

  recordPayment: ({ customer_id, amount, description }) =>
    apiFetch("/payment", {
      method: "POST",
      body: JSON.stringify({ customer_id, amount, description: description || null }),
    }),

  statement: (customer_id) => apiFetch(`/statement/${customer_id}`),

  getInvoiceDetails: (invoice_id) => apiFetch(`/invoice/${invoice_id}`),

  updateInvoice: (invoice_id, { items }) =>
    apiFetch(`/invoice/${invoice_id}`, {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
}

