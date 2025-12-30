window.BRDNJ4J = window.BRDNJ4J || {};

const STORE_KEY = "brdnj4j_servers_v1";

function loadServers(){
  const raw = localStorage.getItem(STORE_KEY);
  if(raw){
    try { return JSON.parse(raw); } catch { /* ignore */ }
  }
  // İlk açılışta seed ile başla
  localStorage.setItem(STORE_KEY, JSON.stringify(BRDNJ4J.seedServers));
  return [...BRDNJ4J.seedServers];
}

function saveServers(list){
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

function escapeHtml(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;")
    .replaceAll(">","&gt;").replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function renderCategoryOptions(selectEl){
  selectEl.innerHTML = BRDNJ4J.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
}

function renderServers(list, targetEl){
  if(!list.length){
    targetEl.innerHTML = `<div class="card"><b>Sonuç bulunamadı.</b><div class="small">Aramanı/kategoriyi değiştir.</div></div>`;
    return;
  }

  targetEl.innerHTML = list.map(s => {
    const tags = (s.tags || []).slice(0,6).map(t => `<span class="badge">#${escapeHtml(t)}</span>`).join(" ");
    return `
      <div class="card">
        <div class="server">
          <div class="left">
            <h3>${escapeHtml(s.name)}</h3>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
              <span class="badge">${escapeHtml(s.category || "Diğer")}</span>
              ${tags}
            </div>
            <p>${escapeHtml(s.desc)}</p>
          </div>
          <div class="right">
            <a class="btn primary" href="${escapeHtml(s.invite)}" target="_blank" rel="noopener">Discord'a Katıl</a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function filterServers(all, q, category){
  const query = (q || "").trim().toLowerCase();
  const cat = category || "Hepsi";

  return all.filter(s => {
    const matchCat = (cat === "Hepsi") || (s.category === cat);
    if(!matchCat) return false;

    if(!query) return true;

    const hay = [
      s.name, s.category, s.desc,
      ...(s.tags || [])
    ].join(" ").toLowerCase();

    return hay.includes(query);
  });
}

// Servers page init
BRDNJ4J.initServersPage = function(){
  const listEl = document.getElementById("serversList");
  const qEl = document.getElementById("q");
  const catEl = document.getElementById("cat");

  const all = loadServers();
  renderCategoryOptions(catEl);

  const paint = () => {
    const filtered = filterServers(all, qEl.value, catEl.value);
    renderServers(filtered, listEl);
  };

  qEl.addEventListener("input", paint);
  catEl.addEventListener("change", paint);

  paint();
};

// Add page init
BRDNJ4J.initAddPage = function(){
  const form = document.getElementById("addForm");
  const catEl = document.getElementById("addCat");
  renderCategoryOptions(catEl);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const name = (fd.get("name") || "").toString().trim();
    const category = (fd.get("category") || "Diğer").toString();
    const invite = (fd.get("invite") || "").toString().trim();
    const desc = (fd.get("desc") || "").toString().trim();
    const tagsRaw = (fd.get("tags") || "").toString().trim();

    if(!name || !invite || !desc){
      alert("Lütfen: Sunucu adı, davet linki ve açıklamayı doldur.");
      return;
    }

    // Basit link kontrolü
    if(!invite.startsWith("https://discord.gg/") && !invite.startsWith("https://discord.com/invite/")){
      const ok = confirm("Davet linki Discord invite gibi görünmüyor. Yine de eklemek istiyor musun?");
      if(!ok) return;
    }

    const tags = tagsRaw
      ? tagsRaw.split(",").map(x => x.trim()).filter(Boolean).slice(0,10)
      : [];

    const all = loadServers();
    all.unshift({ name, category, invite, desc, tags });
    saveServers(all);

    alert("Sunucun eklendi! (Şimdilik bu cihazda kayıtlı — sonraki aşamada admin onay + gerçek veritabanı ekleriz.)");
    location.href = "servers.html";
  });
};

