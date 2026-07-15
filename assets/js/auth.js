const DEMO_USER = { id: 1, username: 'Demo', email: 'demo@dhiblawe.local', role: 'super_admin' };

export const Auth = {
  getToken() { return localStorage.getItem('token') || 'demo-token'; },
  getUser() { try { return JSON.parse(localStorage.getItem('user')) || DEMO_USER; } catch { return DEMO_USER; } },
  isAuthenticated() { return true; },
  hasRole(...roles) {
    const u = this.getUser();
    return u && roles.includes(u.role);
  },
  setSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = 'index.html';
  },
  updateNav() {
    const user = this.getUser();
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const nameEl = sidebar.querySelector('.user-name');
    const roleEl = sidebar.querySelector('.user-role');
    if (nameEl && user) nameEl.textContent = user.username || user.email;
    if (roleEl && user) {
      const labels = { super_admin: 'Super Admin', data_entry: 'Data Entry', view_only: 'View Only' };
      roleEl.textContent = labels[user.role] || user.role;
    }
    sidebar.querySelectorAll('nav a').forEach(a => {
      a.classList.remove('hidden');
    });
  }
};
