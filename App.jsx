// App.jsx
const { useState: useAppState, useEffect: useAppEffect, useCallback: useAppCallback } = React;

// ── Theme toggle helper ───────────────────────────────────────────────────────
function getStoredTheme() {
  return localStorage.getItem('mona26_theme') || 'dark';
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('mona26_theme', t);
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [view,            setView]            = useAppState('loading');
  const [user,            setUser]            = useAppState(null);
  const [stickers,        setStickers]        = useAppState({});
  const [selectedCountry, setSelectedCountry] = useAppState(null);
  const [settingsOpen,    setSettingsOpen]    = useAppState(false);
  const [mobileOpen,      setMobileOpen]      = useAppState(false);
  const [theme,           setTheme]           = useAppState(getStoredTheme);

  // Apply theme on mount and change
  useAppEffect(() => { applyTheme(theme); }, [theme]);

  function toggleTheme() {
    setTheme(t => { const n = t==='dark'?'light':'dark'; applyTheme(n); return n; });
  }

  useAppEffect(() => {
    window.__openSettings = () => setSettingsOpen(true);
    DB.getCurrentUser().then(u => {
      if (u) { setUser(u); DB.getStickers().then(s => setStickers(s)); setView('dashboard'); }
      else setView('auth');
    });
  }, []);

  function handleLogin(u) {
    setUser(u);
    DB.getStickers().then(s => setStickers(s));
    setView('dashboard');
  }

  async function handleLogout() {
    await DB.logout();
    setUser(null); setStickers({}); setView('auth');
  }

  function navigate(v, country) {
    setView(v);
    if (country) setSelectedCountry(country);
    setMobileOpen(false);
  }

  const handleUpdateSticker = useAppCallback((id, qty) => {
    setStickers(prev => ({ ...prev, [id]: qty }));
    DB.updateSticker(id, qty);
  }, []);

  if (view === 'loading') return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'var(--bg)' }}>
      <span style={{ fontSize:48, animation:'pulse 1.5s infinite' }}>🏆</span>
      <p style={{ color:'var(--text-muted)' }}>Cargando…</p>
    </div>
  );

  if (view === 'auth') return <Auth onLogin={handleLogin} />;

  const displayName = user?.name || user?.email?.split('@')[0] || 'Coleccionista';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`app-sidebar${mobileOpen?' open':''}`}
        style={sCSS.sidebar}>

        {/* Brand */}
        <div style={sCSS.brand}>
          <img
            src={theme==='dark' ? 'uploads/pasted-1777166449926-0.png' : 'uploads/pasted-1777164129052-0.png'}
            alt="FIFA 2026"
            style={{width:38, height:38, objectFit:'contain', flexShrink:0, borderRadius:4}}
          />
          <div>
            <div style={{color:'var(--text)', fontWeight:800, fontSize:15}}>Álbum 2026</div>
            <div style={{color:'var(--text-dimmer)', fontSize:10}}>FIFA World Cup™</div>
          </div>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={sCSS.themeBtn} title={theme==='dark'?'Modo claro':'Modo oscuro'}>
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
        </div>

        {/* User chip */}
        <div style={sCSS.userChip}>
          <div style={sCSS.avatar}>{displayName[0].toUpperCase()}</div>
          <div style={{minWidth:0}}>
            <div style={{color:'var(--text)', fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{displayName}</div>
            <div style={{color:'var(--text-dimmer)', fontSize:10, marginTop:2}}>{DB.isSupabaseMode() ? '☁️ Supabase' : '💾 Local'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{padding:'12px 10px', flex:1}}>
          {[
            { v:'dashboard', icon:'📊', label:'Resumen' },
            { v:'album',     icon:'📖', label:'Álbum' },
            { v:'trades',    icon:'🔁', label:'Intercambios' },
          ].map(item => (
            <button key={item.v}
              style={{...sCSS.navBtn, ...((view===item.v||(view==='country'&&item.v==='album')) ? sCSS.navActive : {})}}
              onClick={() => navigate(item.v)}>
              <span style={{fontSize:18, width:20, textAlign:'center'}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Progress widget */}
        <div style={{padding:'0 16px 16px'}}>
          <SidebarProgress stickers={stickers} />
        </div>

        {/* Bottom actions */}
        <div style={{padding:'0 16px', display:'flex', flexDirection:'column', gap:6}}>
          <button style={sCSS.settingsBtn} onClick={() => setSettingsOpen(true)}>⚙️ Configuración</button>
          <button style={sCSS.logoutBtn}   onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <div className="app-topbar" style={sCSS.topBar}>
        <button style={sCSS.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
        <span style={{color:'var(--text)', fontWeight:700, fontSize:15}}>
          {view==='dashboard'?'Resumen':view==='album'?'Álbum':view==='country'?'Láminas':view==='trades'?'Intercambios':''}
        </span>
        <button style={{...sCSS.menuBtn, fontSize:18}} onClick={toggleTheme}>{theme==='dark'?'☀️':'🌙'}</button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div style={sCSS.overlay} onClick={() => setMobileOpen(false)} />}

      {/* ── Main content ──────────────────────────────────── */}
      <main className="app-main" style={sCSS.main}>
        {view === 'dashboard' && <Dashboard stickers={stickers} onNavigate={navigate} />}
        {view === 'album'     && <Album stickers={stickers} onSelectCountry={c => navigate('country', c)} />}
        {view === 'country'   && selectedCountry && (
          <CountryDetail
            countryId={selectedCountry}
            stickers={stickers}
            onUpdateSticker={handleUpdateSticker}
            onBack={() => setView('album')}
          />
        )}
        {view === 'trades' && <Trades stickers={stickers} onUpdateSticker={handleUpdateSticker} />}
      </main>

      {/* ── Settings modal ────────────────────────────────── */}
      {settingsOpen && <SettingsModal theme={theme} toggleTheme={toggleTheme} onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

// ── Sidebar Progress Widget ───────────────────────────────────────────────────
function SidebarProgress({ stickers }) {
  const { ALL_STICKERS } = ALBUM_DATA;
  const owned = ALL_STICKERS.filter(s => (stickers[s.id]||0) >= 1).length;
  const pct   = Math.round(owned / ALL_STICKERS.length * 100);
  return (
    <div style={{ background:'var(--surface)', borderRadius:10, padding:'12px 14px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{color:'var(--text-muted)', fontSize:12}}>Progreso</span>
        <span style={{color:'var(--green)', fontWeight:700, fontSize:13}}>{pct}%</span>
      </div>
      <div style={{ height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'var(--green)', borderRadius:99, width:`${pct}%`, transition:'width .4s' }} />
      </div>
      <div style={{color:'var(--text-dimmer)', fontSize:11, marginTop:4}}>{owned} / {ALL_STICKERS.length}</div>
    </div>
  );
}

// ── Settings Modal ─────────────────────────────────────────────────────────────
function SettingsModal({ theme, toggleTheme, onClose }) {
  const [url,     setUrl]     = useAppState(DB.getConfig().supabaseUrl  || '');
  const [key,     setKey]     = useAppState(DB.getConfig().supabaseKey  || '');
  const [showSQL, setShowSQL] = useAppState(false);
  const [saved,   setSaved]   = useAppState(false);

  function save() {
    DB.saveConfig({ supabaseUrl: url.trim(), supabaseKey: key.trim() });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); window.location.reload(); }, 1300);
  }
  function clearSupa() { DB.saveConfig({}); onClose(); window.location.reload(); }

  const inp = { width:'100%', padding:'10px 12px', background:'var(--input-bg)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, outline:'none' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div style={{ background:'var(--surface)', borderRadius:16, width:'100%', maxWidth:500, border:'1px solid var(--border)', maxHeight:'90vh', overflow:'auto' }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px 16px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ color:'var(--text)', fontSize:17, fontWeight:700, margin:0 }}>⚙️ Configuración</h3>
          <button style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding:'20px 24px' }}>
          {/* Theme */}
          <div style={{ marginBottom:24, padding:'16px', background:'var(--surface2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ color:'var(--text)', fontWeight:600, fontSize:14 }}>Apariencia</div>
              <div style={{ color:'var(--text-dim)', fontSize:12, marginTop:2 }}>Modo {theme==='dark'?'oscuro':'claro'} activo</div>
            </div>
            <button onClick={toggleTheme} style={{ padding:'8px 18px', background:'var(--surface)', border:'1px solid var(--border-md)', borderRadius:99, color:'var(--text)', fontSize:13, cursor:'pointer', fontWeight:600 }}>
              {theme==='dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
            </button>
          </div>

          {/* Supabase */}
          <h4 style={{ color:'var(--text)', fontSize:14, fontWeight:700, marginBottom:8 }}>☁️ Conectar Supabase</h4>
          <p style={{ color:'var(--text-dim)', fontSize:13, marginBottom:16, lineHeight:1.5 }}>
            Sin Supabase los datos se guardan solo en este navegador. Con Supabase tu colección viaja a la nube.
          </p>

          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>URL del proyecto</label>
            <input style={inp} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>Anon Key (clave pública)</label>
            <input style={inp} value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…" />
          </div>

          <button style={{ background:'none', border:'none', color:'var(--gold)', fontSize:13, cursor:'pointer', fontWeight:600, padding:'4px 0' }} onClick={() => setShowSQL(!showSQL)}>
            {showSQL?'▲':'▶'} Ver SQL para configurar Supabase
          </button>
          {showSQL && <pre style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:10, padding:14, color:'var(--text-muted)', fontSize:11, lineHeight:1.6, overflowX:'auto', marginTop:8, whiteSpace:'pre-wrap' }}>{DB.SETUP_SQL}</pre>}

          {!showSQL && (
            <div style={{ background:'var(--input-bg)', borderRadius:10, padding:14, marginTop:12 }}>
              <p style={{color:'var(--text-muted)', fontSize:13, marginBottom:8, fontWeight:600}}>Pasos rápidos:</p>
              {['1. Crea un proyecto gratis en supabase.com','2. En SQL Editor, ejecuta el código SQL (ver arriba)','3. Copia URL y Anon Key desde Settings → API','4. Pégalas aquí y guarda'].map((s,i) => (
                <p key={i} style={{color:'var(--text-dim)', fontSize:12, marginBottom:4}}>• {s}</p>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:20, flexWrap:'wrap' }}>
            <button style={{ padding:'11px 20px', background:'var(--green)', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }} onClick={save}>
              {saved ? '✅ Guardado' : 'Guardar y reconectar'}
            </button>
            {DB.isSupabaseMode() && (
              <button style={{ padding:'11px 20px', background:'var(--red-bg)', border:'1px solid var(--red-brd)', borderRadius:8, color:'var(--red)', fontSize:14, cursor:'pointer' }} onClick={clearSupa}>
                Volver a modo local
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const sCSS = {
  sidebar:    { width:240, background:'var(--surface2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:100, padding:'20px 0', transition:'transform .3s', overflowY:'auto' },
  brand:      { display:'flex', alignItems:'center', gap:10, padding:'0 16px 16px', borderBottom:'1px solid var(--border)', marginBottom:12 },
  themeBtn:   { marginLeft:'auto', background:'none', border:'none', fontSize:18, cursor:'pointer', padding:'4px 6px', borderRadius:8 },
  userChip:   { display:'flex', alignItems:'center', gap:10, background:'var(--surface)', borderRadius:10, padding:'10px 12px', margin:'0 16px 4px' },
  avatar:     { width:32, height:32, borderRadius:'50%', background:'var(--green)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 },
  navBtn:     { display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 12px', background:'none', border:'none', borderRadius:10, color:'var(--text-muted)', fontSize:14, cursor:'pointer', marginBottom:2, fontWeight:500 },
  navActive:  { background:'var(--green-bg)', color:'var(--green)', fontWeight:700 },
  settingsBtn:{ padding:'9px 12px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', fontSize:13, cursor:'pointer', textAlign:'left' },
  logoutBtn:  { padding:'9px 12px', background:'none', border:'none', borderRadius:8, color:'var(--text-dimmer)', fontSize:13, cursor:'pointer', textAlign:'left', marginBottom:8 },
  topBar:     { display:'none', position:'fixed', top:0, left:0, right:0, height:52, background:'var(--surface2)', borderBottom:'1px solid var(--border)', zIndex:99, alignItems:'center', justifyContent:'space-between', padding:'0 16px' },
  menuBtn:    { background:'none', border:'none', color:'var(--text)', fontSize:20, cursor:'pointer', width:36 },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:99 },
  main:       { marginLeft:240, flex:1, minHeight:'100vh', background:'var(--bg)' },
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
