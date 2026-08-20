const PALETTE = ["#5b48d1", "#c0392b", "#1f7a4d", "#b3901f", "#2f7f8f", "#a34fa1", "#3a5fc4", "#c46a2f"];

const els = {
  grid: document.getElementById("site-grid"),
  empty: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptySub: document.getElementById("empty-sub"),
  search: document.getElementById("search-input"),
  viewModal: document.getElementById("view-modal"),
  viewAvatar: document.getElementById("view-avatar"),
  viewName: document.getElementById("view-name"),
  viewPassword: document.getElementById("view-password"),
  copyStatus: document.getElementById("copy-status"),
  editModal: document.getElementById("edit-modal"),
  editTitle: document.getElementById("edit-title"),
  editForm: document.getElementById("edit-form"),
  editName: document.getElementById("edit-name"),
  editPassword: document.getElementById("edit-password"),
};

let sites = loadSites();
let activeId = null; // site currently open in the view modal
let editingId = null; // null = adding a new site

function colorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initials(name) {
  return name.trim().slice(0, 2).toUpperCase();
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---------------- Render ---------------- */

function render() {
  els.grid.innerHTML = "";

  const query = els.search.value.trim().toLowerCase();
  const visible = query ? sites.filter((s) => s.name.toLowerCase().includes(query)) : sites;

  if (sites.length === 0) {
    els.empty.classList.add("is-visible");
    els.emptyTitle.textContent = "Todavía no agregaste ninguna contraseña.";
    els.emptySub.textContent = "Tocá el botón + para agregar la primera.";
  } else if (visible.length === 0) {
    els.empty.classList.add("is-visible");
    els.emptyTitle.textContent = "No se encontraron resultados.";
    els.emptySub.textContent = "Probá con otro nombre.";
  } else {
    els.empty.classList.remove("is-visible");
  }

  visible.forEach((site) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "site-tile";
    tile.dataset.id = site.id;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.background = colorFor(site.id);
    avatar.textContent = initials(site.name);

    const name = document.createElement("span");
    name.className = "site-tile-name";
    name.textContent = site.name;

    tile.appendChild(avatar);
    tile.appendChild(name);
    tile.addEventListener("click", () => openView(site.id));
    els.grid.appendChild(tile);
  });
}

/* ---------------- Ver contraseña ---------------- */

function openView(id) {
  const site = sites.find((s) => s.id === id);
  if (!site) return;
  activeId = id;
  els.viewAvatar.style.background = colorFor(site.id);
  els.viewAvatar.textContent = initials(site.name);
  els.viewName.textContent = site.name;
  els.viewPassword.textContent = site.password;
  els.copyStatus.textContent = "";
  els.viewModal.classList.add("is-open");
}

function closeView() {
  els.viewModal.classList.remove("is-open");
  activeId = null;
}

document.getElementById("btn-close-view").addEventListener("click", closeView);
document.getElementById("btn-close-view-x").addEventListener("click", closeView);
els.viewModal.addEventListener("click", (e) => {
  if (e.target === els.viewModal) closeView();
});

document.getElementById("btn-copy").addEventListener("click", async () => {
  const site = sites.find((s) => s.id === activeId);
  if (!site) return;
  try {
    await navigator.clipboard.writeText(site.password);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = site.password;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  els.copyStatus.textContent = "Copiado";
  setTimeout(() => {
    if (els.copyStatus) els.copyStatus.textContent = "";
  }, 1500);
});

document.getElementById("btn-delete").addEventListener("click", () => {
  const site = sites.find((s) => s.id === activeId);
  if (!site) return;
  if (!confirm('¿Eliminar "' + site.name + '"?')) return;
  sites = sites.filter((s) => s.id !== activeId);
  saveSites(sites);
  render();
  closeView();
});

document.getElementById("btn-edit").addEventListener("click", () => {
  const site = sites.find((s) => s.id === activeId);
  if (!site) return;
  closeView();
  openEdit(site);
});

/* ---------------- Agregar / editar ---------------- */

function openEdit(site) {
  editingId = site ? site.id : null;
  els.editTitle.textContent = site ? "Editar contraseña" : "Agregar contraseña";
  els.editName.value = site ? site.name : "";
  els.editPassword.value = site ? site.password : "";
  els.editModal.classList.add("is-open");
  els.editName.focus();
}

function closeEdit() {
  els.editModal.classList.remove("is-open");
  els.editForm.reset();
  editingId = null;
}

document.getElementById("btn-add").addEventListener("click", () => openEdit(null));
document.getElementById("btn-cancel-edit").addEventListener("click", closeEdit);
document.getElementById("btn-close-edit-x").addEventListener("click", closeEdit);
els.editModal.addEventListener("click", (e) => {
  if (e.target === els.editModal) closeEdit();
});

document.getElementById("btn-generate").addEventListener("click", () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let pass = "";
  for (let i = 0; i < 16; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  els.editPassword.value = pass;
});

els.editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = els.editName.value.trim();
  const password = els.editPassword.value;
  if (!name || !password) return;

  if (editingId) {
    const site = sites.find((s) => s.id === editingId);
    if (site) {
      site.name = name;
      site.password = password;
    }
  } else {
    sites.push({ id: makeId(), name, password });
  }
  saveSites(sites);
  render();
  closeEdit();
});

/* ---------------- Tema ---------------- */

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
}

document.getElementById("btn-theme").addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  saveTheme(next);
});

els.search.addEventListener("input", render);

/* ---------------- Importar / exportar ---------------- */

const transferEls = {
  btn: document.getElementById("btn-transfer"),
  modal: document.getElementById("transfer-modal"),
  closeBtn: document.getElementById("btn-close-transfer"),
  closeBtnX: document.getElementById("btn-close-transfer-x"),
  exportBtn: document.getElementById("btn-export"),
  importBtn: document.getElementById("btn-import"),
  fileInput: document.getElementById("import-file-input"),
  status: document.getElementById("transfer-status"),
};

transferEls.btn.addEventListener("click", () => {
  transferEls.status.textContent = "";
  transferEls.modal.classList.add("is-open");
});
transferEls.closeBtn.addEventListener("click", () => {
  transferEls.modal.classList.remove("is-open");
});
transferEls.closeBtnX.addEventListener("click", () => {
  transferEls.modal.classList.remove("is-open");
});
transferEls.modal.addEventListener("click", (e) => {
  if (e.target === transferEls.modal) transferEls.modal.classList.remove("is-open");
});

transferEls.exportBtn.addEventListener("click", () => {
  if (sites.length === 0) {
    transferEls.status.textContent = "No hay contraseñas para exportar.";
    return;
  }
  const data = sites.map((s) => ({ name: s.name, password: s.password }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = "claves-" + date + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  transferEls.status.textContent = "Se exportó " + sites.length + " contraseña" + (sites.length === 1 ? "" : "s") + ".";
});

transferEls.importBtn.addEventListener("click", () => {
  transferEls.fileInput.click();
});

transferEls.fileInput.addEventListener("change", () => {
  const file = transferEls.fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed)) throw new Error("formato inválido");
      let added = 0;
      parsed.forEach((item) => {
        if (!item || typeof item.name !== "string" || typeof item.password !== "string") return;
        const exists = sites.some((s) => s.name === item.name && s.password === item.password);
        if (exists) return;
        sites.push({ id: makeId(), name: item.name, password: item.password });
        added++;
      });
      saveSites(sites);
      render();
      transferEls.status.textContent = "Se importó " + added + " contraseña" + (added === 1 ? "" : "s") + " nueva" + (added === 1 ? "" : "s") + ".";
    } catch (e) {
      transferEls.status.textContent = "El archivo no tiene un formato válido.";
    }
    transferEls.fileInput.value = "";
  };
  reader.readAsText(file);
});

/* ---------------- Bloqueo Face ID / Touch ID ---------------- */

const lockEls = {
  screen: document.getElementById("lock-screen"),
  unlockBtn: document.getElementById("btn-unlock"),
  error: document.getElementById("lock-error"),
  resetBtn: document.getElementById("btn-reset-lock"),
  settingsBtn: document.getElementById("btn-lock-settings"),
  settingsModal: document.getElementById("lock-settings-modal"),
  statusText: document.getElementById("lock-status-text"),
  toggleBtn: document.getElementById("btn-toggle-lock"),
  closeSettings: document.getElementById("btn-close-lock-settings"),
  closeSettingsX: document.getElementById("btn-close-lock-settings-x"),
};

function showLockScreen() {
  lockEls.error.textContent = "";
  lockEls.screen.classList.add("is-open");
}

function hideLockScreen() {
  lockEls.screen.classList.remove("is-open");
}

async function attemptUnlock() {
  lockEls.error.textContent = "";
  try {
    await verifyLock();
    hideLockScreen();
  } catch (e) {
    lockEls.error.textContent = "No se pudo verificar. Intentá de nuevo.";
  }
}

lockEls.unlockBtn.addEventListener("click", attemptUnlock);

lockEls.resetBtn.addEventListener("click", () => {
  if (!confirm("Esto va a desactivar el bloqueo con Face ID / Touch ID en este dispositivo. ¿Continuar?")) return;
  disableLock();
  hideLockScreen();
});

function renderLockSettings() {
  const enabled = lockEnabled();
  lockEls.statusText.textContent = enabled ? "Activado" : "Desactivado";
  lockEls.toggleBtn.textContent = enabled ? "Desactivar bloqueo" : "Activar Face ID / Touch ID";
  lockEls.toggleBtn.className = enabled ? "btn-danger btn-block" : "btn-primary btn-block";
}

lockEls.settingsBtn.addEventListener("click", () => {
  renderLockSettings();
  lockEls.settingsModal.classList.add("is-open");
});
lockEls.closeSettings.addEventListener("click", () => {
  lockEls.settingsModal.classList.remove("is-open");
});
lockEls.closeSettingsX.addEventListener("click", () => {
  lockEls.settingsModal.classList.remove("is-open");
});
lockEls.settingsModal.addEventListener("click", (e) => {
  if (e.target === lockEls.settingsModal) lockEls.settingsModal.classList.remove("is-open");
});

lockEls.toggleBtn.addEventListener("click", async () => {
  if (lockEnabled()) {
    if (confirm("¿Desactivar el bloqueo con Face ID / Touch ID?")) {
      disableLock();
      renderLockSettings();
    }
    return;
  }
  const available = await platformAuthAvailable();
  if (!available) {
    alert("Este dispositivo o navegador no tiene Face ID / Touch ID disponible (recordá que también necesita HTTPS).");
    return;
  }
  try {
    await registerLock();
    renderLockSettings();
    alert("Bloqueo activado. La próxima vez que abras la app vas a necesitar Face ID / Touch ID.");
  } catch (e) {
    alert("No se pudo activar el bloqueo.");
  }
});

/* ---------------- Init ---------------- */

applyTheme(loadTheme());
render();
if (lockEnabled()) showLockScreen();
