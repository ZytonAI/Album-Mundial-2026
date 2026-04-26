// components/Dashboard.jsx
const { useMemo: useMemoD } = React;

function Dashboard({ stickers, onNavigate }) {
  const { ALL_STICKERS, TEAMS, teamStickers, flagUrl } = ALBUM_DATA;

  const stats = useMemoD(() => {
    let tengo = 0, repetidas = 0, faltan = 0;
    ALL_STICKERS.forEach(s => {
      const q = stickers[s.id] || 0;
      if (q >= 1) tengo++;
      if (q >= 2) repetidas += (q - 1);
      if (q === 0) faltan++;
    });
    return { tengo, repetidas, faltan, total: ALL_STICKERS.length, pct: Math.round(tengo / ALL_STICKERS.length * 100) };
  }, [stickers]);

  const teamProgress = useMemoD(() =>
    TEAMS.map(t => {
      const sl = teamStickers[t.id] || [];
      const owned = sl.filter(s => (stickers[s.id]||0) >= 1).length;
      const dups  = sl.reduce((a,s) => a + Math.max(0,(stickers[s.id]||0)-1), 0);
      return { ...t, owned, dups, total: sl.length, pct: Math.round(owned/sl.length*100) };
    }).sort((a,b) => b.pct - a.pct)
  , [stickers]);

  const nearComplete = teamProgress.filter(t => t.pct >= 50 && t.pct < 100).slice(0,4);
  const topTeams     = teamProgress.slice(0, 6);

  return (
    <div style={dCSS.page} className="page-enter">
      <h2 style={dCSS.heading}>Mi Colección</h2>

      {/* Progress bar */}
      <div style={dCSS.progressCard}>
        <div style={dCSS.pRow}>
          <span style={dCSS.pLabel}>Progreso del álbum</span>
          <span style={{...dCSS.pPct, color:'var(--green)'}}>{stats.pct}%</span>
        </div>
        <div style={dCSS.bar}>
          <div style={{...dCSS.barFill, width:`${stats.pct}%`}} />
        </div>
        <p style={dCSS.pSub}>{stats.tengo} de {stats.total} láminas</p>
      </div>

      {/* Stats */}
      <div style={dCSS.grid3} className="stats-grid">
        <StatCard label="Tengo"    value={stats.tengo}    sub={`de ${stats.total}`}    color="var(--green)" icon="✅" />
        <StatCard label="Me faltan" value={stats.faltan}   sub="láminas"               color="var(--blue)"  icon="📋" />
        <StatCard label="Repetidas" value={stats.repetidas} sub="para intercambiar"    color="var(--gold)"  icon="🔁" />
      </div>

      {nearComplete.length > 0 && (
        <section>
          <h3 style={dCSS.secTitle}>⚡ Casi completos</h3>
          <div style={dCSS.grid2}>
            {nearComplete.map(t => (
              <button key={t.id} style={dCSS.teamCard} onClick={() => onNavigate('country', t.id)}>
                <img src={flagUrl(t.id)} alt={t.name} style={{width:36, height:24, objectFit:'cover', borderRadius:3, border:'1px solid rgba(128,128,128,0.2)', flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={dCSS.teamName}>{t.name}</div>
                  <div style={dCSS.miniBarWrap}><div style={{...dCSS.miniBarFill, width:`${t.pct}%`}} /></div>
                </div>
                <span style={{color:'var(--green)', fontWeight:700, fontSize:15}}>{t.pct}%</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 style={dCSS.secTitle}>🏅 Equipos más completos</h3>
        <div style={dCSS.grid3col} className="top-grid">
          {topTeams.map(t => (
            <button key={t.id} style={dCSS.topCard} onClick={() => onNavigate('country', t.id)}>
              <img src={flagUrl(t.id)} alt={t.name} style={{width:48, height:32, objectFit:'cover', borderRadius:4, border:'1px solid rgba(128,128,128,0.2)', marginBottom:6}} />
              <div style={dCSS.topName}>{t.name}</div>
              <div style={dCSS.topCount}>{t.owned}/{t.total}</div>
              <div style={dCSS.miniBarWrap}>
                <div style={{...dCSS.miniBarFill, width:`${t.pct}%`, background: t.pct===100 ? 'var(--gold)' : 'var(--green)'}} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {stats.tengo === 0 && (
        <div style={dCSS.empty}>
          <div style={{fontSize:48, marginBottom:12}}>📖</div>
          <p style={{color:'var(--text-muted)', fontSize:15}}>¡Empieza marcando tus láminas en el álbum!</p>
          <button style={dCSS.startBtn} onClick={() => onNavigate('album')}>Abrir Álbum →</button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{...dCSS.statCard, borderTop:`3px solid ${color}`}}>
      <span style={{fontSize:22, display:'block', marginBottom:8}}>{icon}</span>
      <div style={{fontSize:32, fontWeight:800, lineHeight:1, color}}>{value}</div>
      <div style={{color:'var(--text)', fontSize:13, fontWeight:600, marginTop:4}}>{label}</div>
      <div style={{color:'var(--text-dim)', fontSize:11, marginTop:2}}>{sub}</div>
    </div>
  );
}

const dCSS = {
  page:       { padding:'28px 24px', maxWidth:900, margin:'0 auto' },
  heading:    { fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:20 },
  progressCard:{ background:'var(--surface)', borderRadius:14, padding:'20px 24px', marginBottom:20, border:'1px solid var(--border)' },
  pRow:       { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  pLabel:     { color:'var(--text-muted)', fontSize:13, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' },
  pPct:       { fontSize:22, fontWeight:800 },
  bar:        { height:10, background:'var(--border)', borderRadius:99, overflow:'hidden' },
  barFill:    { height:'100%', background:'linear-gradient(90deg, var(--green), #00d46a)', borderRadius:99, transition:'width .6s ease' },
  pSub:       { color:'var(--text-dim)', fontSize:12, marginTop:8 },
  grid3:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 },
  statCard:   { background:'var(--surface)', borderRadius:12, padding:'18px 16px', border:'1px solid var(--border)', textAlign:'center' },
  secTitle:   { fontSize:12, fontWeight:700, color:'var(--text-muted)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.07em' },
  grid2:      { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:28 },
  teamCard:   { display:'flex', alignItems:'center', gap:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 16px', cursor:'pointer', textAlign:'left' },
  teamName:   { color:'var(--text)', fontSize:14, fontWeight:600, marginBottom:6 },
  miniBarWrap:{ height:4, background:'var(--border)', borderRadius:99, overflow:'hidden' },
  miniBarFill:{ height:'100%', background:'var(--green)', borderRadius:99, transition:'width .4s' },
  grid3col:   { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:28 },
  topCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 14px', cursor:'pointer', textAlign:'center' },
  topName:    { color:'var(--text)', fontSize:12, fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  topCount:   { color:'var(--text-dim)', fontSize:11, marginBottom:6 },
  empty:      { textAlign:'center', padding:'40px 20px' },
  startBtn:   { marginTop:16, padding:'10px 24px', background:'var(--green)', border:'none', borderRadius:8, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' },
};

Object.assign(window, { Dashboard, StatCard });
