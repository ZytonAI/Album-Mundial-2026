// db.js - Abstracción de base de datos (localStorage o Supabase)
window.DB = (() => {
  let _supabase = null;
  let _user = null;
  let _pendingUpdates = {};
  let _flushTimer = null;

  const _DEFAULT_URL = 'https://liquqsfnooegfioqkfvt.supabase.co';
  const _DEFAULT_KEY = 'sb_publishable_aGl6sPl-n4oPgmNuzTEXFg_QTfQex7L';

  // ── Config ──────────────────────────────────────────────────────────────────
  function getConfig() {
    try {
      const stored = JSON.parse(localStorage.getItem('mona26_config') || '{}');
      return { supabaseUrl: _DEFAULT_URL, supabaseKey: _DEFAULT_KEY, ...stored };
    }
    catch { return { supabaseUrl: _DEFAULT_URL, supabaseKey: _DEFAULT_KEY }; }
  }
  function saveConfig(cfg) {
    localStorage.setItem('mona26_config', JSON.stringify(cfg));
    _supabase = null; // reset client so it re-initialises
  }
  function isSupabaseMode() {
    const c = getConfig();
    return !!(c.supabaseUrl && c.supabaseKey);
  }
  function getClient() {
    if (_supabase) return _supabase;
    const c = getConfig();
    if (c.supabaseUrl && c.supabaseKey) {
      _supabase = window.supabase.createClient(c.supabaseUrl, c.supabaseKey);
    }
    return _supabase;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────
  async function register(email, password, name) {
    if (isSupabaseMode()) {
      const sb = getClient();
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { name } } });
      if (error) throw error;
      _user = { id: data.user.id, email, name };
      return _user;
    }
    const users = _getLocalUsers();
    if (users.find(u => u.email === email)) throw new Error('Ya existe una cuenta con ese correo');
    const user = { id: `local_${Date.now()}`, email, password, name };
    users.push(user);
    localStorage.setItem('mona26_users', JSON.stringify(users));
    _user = { id: user.id, email, name };
    localStorage.setItem('mona26_session', JSON.stringify(_user));
    return _user;
  }

  async function login(email, password) {
    if (isSupabaseMode()) {
      const sb = getClient();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const meta = data.user.user_metadata || {};
      _user = { id: data.user.id, email: data.user.email, name: meta.name || email.split('@')[0] };
      return _user;
    }
    const users = _getLocalUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Correo o contraseña incorrectos');
    _user = { id: found.id, email: found.email, name: found.name };
    localStorage.setItem('mona26_session', JSON.stringify(_user));
    return _user;
  }

  async function logout() {
    if (isSupabaseMode()) { try { await getClient().auth.signOut(); } catch {} }
    else { localStorage.removeItem('mona26_session'); }
    _user = null;
    _pendingUpdates = {};
  }

  async function getCurrentUser() {
    if (isSupabaseMode()) {
      const sb = getClient();
      if (!sb) return null;
      const { data } = await sb.auth.getUser();
      if (!data?.user) return null;
      const meta = data.user.user_metadata || {};
      _user = { id: data.user.id, email: data.user.email, name: meta.name || data.user.email.split('@')[0] };
      return _user;
    }
    try {
      _user = JSON.parse(localStorage.getItem('mona26_session') || 'null');
      return _user;
    } catch { return null; }
  }

  // ── Stickers ─────────────────────────────────────────────────────────────────
  async function getStickers() {
    if (isSupabaseMode()) {
      const sb = getClient();
      const { data, error } = await sb.from('user_stickers').select('sticker_id, quantity');
      if (error) throw error;
      const result = {};
      (data || []).forEach(r => { result[r.sticker_id] = r.quantity; });
      return result;
    }
    try { return JSON.parse(localStorage.getItem(`mona26_stickers_${_user?.id}`) || '{}'); }
    catch { return {}; }
  }

  function updateStickerLocal(stickerId, quantity) {
    const key = `mona26_stickers_${_user?.id}`;
    const s = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } })();
    s[stickerId] = quantity;
    localStorage.setItem(key, JSON.stringify(s));
  }

  // Debounced flush to Supabase
  function scheduleFlush() {
    if (_flushTimer) clearTimeout(_flushTimer);
    _flushTimer = setTimeout(flushPending, 800);
  }

  async function flushPending() {
    if (!isSupabaseMode() || Object.keys(_pendingUpdates).length === 0) return;
    const sb = getClient();
    const uid = _user?.id;
    const snapshot = { ..._pendingUpdates };
    _pendingUpdates = {};
    const rows = Object.entries(snapshot).map(([sticker_id, quantity]) => ({
      user_id: uid, sticker_id, quantity, updated_at: new Date().toISOString(),
    }));
    const { error } = await sb.from('user_stickers').upsert(rows, { onConflict: 'user_id,sticker_id' });
    if (error) {
      // Restore failed updates so next flush retries them
      Object.assign(_pendingUpdates, snapshot);
    }
  }

  function updateSticker(stickerId, quantity) {
    if (!isSupabaseMode()) {
      updateStickerLocal(stickerId, quantity);
    } else {
      _pendingUpdates[stickerId] = quantity;
      scheduleFlush();
    }
  }

  function _getLocalUsers() {
    try { return JSON.parse(localStorage.getItem('mona26_users') || '[]'); }
    catch { return []; }
  }

  // SQL to show users in setup
  const SETUP_SQL = `-- Ejecuta esto en el SQL Editor de Supabase:

create table if not exists user_stickers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  sticker_id text not null,
  quantity integer default 0 not null,
  updated_at timestamptz default now(),
  unique(user_id, sticker_id)
);

alter table user_stickers enable row level security;

create policy "Solo mis laminas"
  on user_stickers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

  // Flush on tab hide / page close so no pending writes are lost
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPending();
  });
  window.addEventListener('pagehide', () => flushPending());

  return { getConfig, saveConfig, isSupabaseMode, register, login, logout, getCurrentUser, getStickers, updateSticker, flushPending, SETUP_SQL };
})();
