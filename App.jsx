// App.jsx
const { useState: useAppState, useEffect: useAppEffect, useCallback: useAppCallback, useRef: useAppRef } = React;

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
  const [mobileOpen,      setMobileOpen]      = useAppState(false);
  const [theme,           setTheme]           = useAppState(getStoredTheme);
  const [showPaywall,     setShowPaywall]     = useAppState(false);
  const [successToast,    setSuccessToast]    = useAppState(false);
  const userRef = useAppRef(user);
  userRef.current = user;

  // Apply theme on mount and change
  useAppEffect(() => { applyTheme(theme); }, [theme]);

  function toggleTheme() {
    setTheme(t => { const n = t==='dark'?'light':'dark'; applyTheme(n); return n; });
  }

  useAppEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('success') === '1';

    DB.getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        DB.getStickers().then(s => setStickers(s));
        setView('dashboard');
        if (isSuccess) {
          window.history.replaceState({}, '', window.location.pathname);
          setSuccessToast(true);
          setTimeout(() => setSuccessToast(false), 5000);
        }
      } else {
        setView('auth');
      }
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
    if (!userRef.current?.isPremium) {
      setShowPaywall(true);
      return;
    }
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
            <div style={{color:'var(--text-dimmer)', fontSize:10, marginTop:2}}>
              {user?.isPremium ? '⭐ Premium' : DB.isSupabaseMode() ? '☁️ Supabase' : '💾 Local'}
            </div>
          </div>
          {!user?.isPremium && (
            <button
              onClick={() => setShowPaywall(true)}
              style={{marginLeft:'auto', padding:'3px 8px', background:'var(--gold)', border:'none', borderRadius:6, color:'#000', fontSize:10, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0}}
              title="Desbloquear álbum completo">
              $7.000
            </button>
          )}
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

        {/* Badge premium */}
        {user?.isPremium && (
          <div style={{padding:'0 16px 16px'}}>
            <div style={{background:'var(--gold-bg)', border:'1px solid var(--gold-brd)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:22}}>⭐</span>
              <div>
                <div style={{fontWeight:800, color:'var(--gold)', fontSize:13}}>Premium</div>
                <div style={{fontSize:10, color:'var(--text-muted)', marginTop:1}}>Álbum completo desbloqueado</div>
              </div>
            </div>
          </div>
        )}

        {/* Promo box — solo para no-premium */}
        {!user?.isPremium && (
          <div style={{padding:'0 16px 16px'}}>
            <div style={{background:'var(--gold-bg)', border:'1px solid var(--gold-brd)', borderRadius:12, padding:'14px'}}>
              <div style={{fontWeight:800, color:'var(--text)', fontSize:13, marginBottom:8}}>🏆 Desbloquea el álbum</div>
              <div style={{display:'flex', flexDirection:'column', gap:5, marginBottom:12}}>
                {['✅ Guarda tus láminas','✅ Los 48 equipos completos','✅ Sistema de intercambios','✅ Progreso sincronizado'].map(f => (
                  <div key={f} style={{fontSize:11, color:'var(--text-muted)'}}>{f}</div>
                ))}
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                style={{width:'100%', padding:'10px', background:'var(--gold)', border:'none', borderRadius:8, color:'#000', fontSize:13, fontWeight:800, cursor:'pointer'}}>
                💳 Pagar $7.000 COP
              </button>
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{padding:'0 16px', display:'flex', flexDirection:'column', gap:6}}>
          <button style={sCSS.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
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

      {/* ── Paywall modal ─────────────────────────────────── */}
      {showPaywall && <PaywallModal user={user} onClose={() => setShowPaywall(false)} />}

      {/* ── Success toast ─────────────────────────────────── */}
      {successToast && (
        <div style={sCSS.toast}>
          🎉 ¡Pago confirmado! Tu álbum está desbloqueado.
        </div>
      )}

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

const sCSS = {
  sidebar:    { width:240, background:'var(--surface2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, height:'100vh', zIndex:100, padding:'20px 0', transition:'transform .3s', overflowY:'auto' },
  brand:      { display:'flex', alignItems:'center', gap:10, padding:'0 16px 16px', borderBottom:'1px solid var(--border)', marginBottom:12 },
  themeBtn:   { marginLeft:'auto', background:'none', border:'none', fontSize:18, cursor:'pointer', padding:'4px 6px', borderRadius:8 },
  userChip:   { display:'flex', alignItems:'center', gap:10, background:'var(--surface)', borderRadius:10, padding:'10px 12px', margin:'0 16px 4px' },
  avatar:     { width:32, height:32, borderRadius:'50%', background:'var(--green)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 },
  navBtn:     { display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 12px', background:'none', border:'none', borderRadius:10, color:'var(--text-muted)', fontSize:14, cursor:'pointer', marginBottom:2, fontWeight:500 },
  navActive:  { background:'var(--green-bg)', color:'var(--green)', fontWeight:700 },
  logoutBtn:  { padding:'9px 12px', background:'none', border:'none', borderRadius:8, color:'var(--text-dimmer)', fontSize:13, cursor:'pointer', textAlign:'left', marginBottom:8 },
  topBar:     { display:'none', position:'fixed', top:0, left:0, right:0, height:52, background:'var(--surface2)', borderBottom:'1px solid var(--border)', zIndex:99, alignItems:'center', justifyContent:'space-between', padding:'0 16px' },
  menuBtn:    { background:'none', border:'none', color:'var(--text)', fontSize:20, cursor:'pointer', width:36 },
  overlay:    { position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:99 },
  main:       { marginLeft:240, flex:1, minHeight:'100vh', background:'var(--bg)' },
  toast:      { position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--green)', color:'#fff', padding:'13px 22px', borderRadius:12, fontWeight:700, fontSize:14, zIndex:200, boxShadow:'0 4px 20px rgba(0,0,0,.25)', whiteSpace:'nowrap' },
};

// ── Paywall Modal ─────────────────────────────────────────────────────────────
function PaywallModal({ user, onClose }) {
  const [loading, setLoading] = useAppState(false);
  const [error, setError]     = useAppState('');

  async function handleCheckout() {
    if (!DB.isSupabaseMode()) {
      setError('Necesitas una cuenta de Supabase para procesar pagos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: fnErr } = await DB.getClient().functions.invoke('create-preference', {
        body: { user_id: user.id, email: user.email },
      });
      if (fnErr) {
        let msg = fnErr.message;
        try { const b = await fnErr.context.json(); msg = b?.error || msg; } catch {}
        throw new Error(msg);
      }
      if (!data?.init_point) throw new Error(data?.error || 'No se pudo generar el enlace de pago.');
      window.location.href = data.init_point;
    } catch (err) {
      setError(err.message || 'Error al conectar con MercadoPago.');
      setLoading(false);
    }
  }

  return (
    <div style={pwCSS.overlay} onClick={onClose}>
      <div style={pwCSS.card} onClick={e => e.stopPropagation()}>
        <button style={pwCSS.closeBtn} onClick={onClose}>✕</button>

        <div style={pwCSS.emoji}>🏆</div>
        <h2 style={pwCSS.title}>Desbloquea tu álbum</h2>
        <p style={pwCSS.sub}>Guarda tu colección completa en la nube y accede desde cualquier dispositivo.</p>

        <div style={pwCSS.features}>
          {['✅ Guardar tus láminas', '✅ Los 48 equipos completos', '✅ Sistema de intercambios', '✅ Progreso sincronizado'].map(f => (
            <div key={f} style={pwCSS.feature}>{f}</div>
          ))}
        </div>

        <div style={pwCSS.priceRow}>
          <span style={pwCSS.price}>$7.000 COP</span>
          <span style={pwCSS.priceNote}>pago único, para siempre</span>
        </div>

        {error && <div style={pwCSS.error}>{error}</div>}

        <button style={{...pwCSS.payBtn, opacity: loading ? .7 : 1}} onClick={handleCheckout} disabled={loading}>
          {loading ? 'Redirigiendo…' : '💳 Pagar con MercadoPago'}
        </button>

        <button style={pwCSS.skipBtn} onClick={onClose}>Quizás después</button>
      </div>
    </div>
  );
}

const pwCSS = {
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card:      { background:'var(--surface)', borderRadius:20, padding:'36px 32px', maxWidth:400, width:'100%', position:'relative', border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,.4)' },
  closeBtn:  { position:'absolute', top:14, right:16, background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer', lineHeight:1 },
  emoji:     { fontSize:52, textAlign:'center', display:'block', marginBottom:12 },
  title:     { fontSize:22, fontWeight:800, color:'var(--text)', textAlign:'center', margin:'0 0 8px' },
  sub:       { fontSize:13, color:'var(--text-muted)', textAlign:'center', margin:'0 0 20px', lineHeight:1.6 },
  features:  { display:'flex', flexDirection:'column', gap:8, marginBottom:24, background:'var(--bg)', borderRadius:12, padding:'14px 16px' },
  feature:   { fontSize:13, color:'var(--text)', fontWeight:500 },
  priceRow:  { display:'flex', alignItems:'baseline', justifyContent:'center', gap:8, marginBottom:20 },
  price:     { fontSize:32, fontWeight:800, color:'var(--green)' },
  priceNote: { fontSize:12, color:'var(--text-muted)' },
  error:     { background:'var(--red-bg)', border:'1px solid var(--red-brd)', borderRadius:8, padding:'10px 14px', color:'var(--red)', fontSize:13, marginBottom:14 },
  payBtn:    { width:'100%', padding:'14px', background:'#009ee3', border:'none', borderRadius:12, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10, transition:'opacity .2s' },
  skipBtn:   { width:'100%', padding:'10px', background:'none', border:'none', color:'var(--text-dimmer)', fontSize:13, cursor:'pointer' },
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
