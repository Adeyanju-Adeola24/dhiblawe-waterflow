const BASE = window.API_BASE || '';

async function req(method, path, body) {
  const token = localStorage.getItem('token');
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, error: data.error || `Request failed (${res.status})`, ...data };
  }
  return res.json();
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function playSound() {
  try {
    const s = new Audio(`${BASE}/sounds/success.wav`);
    s.volume = 0.3;
    s.play();
  } catch {}
}

export const API = {
  get: (p) => req('GET', p),
  post: (p, b) => req('POST', p, b),
  put: (p, b) => req('PUT', p, b),
  delete: (p) => req('DELETE', p),
  toast,
  playSound,
};
