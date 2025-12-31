window.BRDNAuth = (() => {
  // ✅ Worker API
  const API = "https://brdnj4j-auth.berdan-gunan0.workers.dev";

  function saveTokenFromHash() {
    const h = location.hash || "";
    if (h.includes("token=")) {
      const token = decodeURIComponent(h.split("token=")[1] || "").trim();
      if (token) localStorage.setItem("brdnj4j_token", token);
      // hash temizle
      history.replaceState(null, "", location.pathname);
    }
  }

  function token() {
    return localStorage.getItem("brdnj4j_token") || "";
  }

  function logout() {
    localStorage.removeItem("brdnj4j_token");
    location.reload();
  }

  function login() {
    location.href = `${API}/login`;
  }

  async function me() {
    const t = token();
    if (!t) return null;
    const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) return null;
    return (await r.json()).user;
  }

  return { API, saveTokenFromHash, token, logout, login, me };
})();

