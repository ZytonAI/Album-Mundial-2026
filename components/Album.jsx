// components/Album.jsx
const { useState: useAlbumState, useMemo: useAlbumMemo } = React;

// ── Countries Grid ───────────────────────────────────────────────────────────
function Album({ stickers, onSelectCountry }) {
  const { TEAMS, CONFS, CONF_NAMES, teamStickers, SPECIAL_STICKERS, COCACOLA_STICKERS, flagUrl } = ALBUM_DATA;
  const [search, setSearch]         = useAlbumState('');
  const [activeConf, setActiveConf] = useAlbumState('ALL');

  const teamStats = useAlbumMemo(() => {
    const m = {};
    TEAMS.forEach(t => {
      const sl = teamStickers[t.id] || [];
      const owned = sl.filter(s => (stickers[s.id]||0) >= 1).length;
      const dups  = sl.reduce((a,s) => a + Math.max(0,(stickers[s.id]||0)-1), 0);
      m[t.id] = { owned, dups, total: sl.length, pct: Math.round(owned/sl.length*100) };
    });
    return m;
  }, [stickers]);

  const specialOwned   = SPECIAL_STICKERS.filter(s => (stickers[s.id]||0) >= 1).length;
  const cocacolaOwned  = COCACOLA_STICKERS.filter(s => (stickers[s.id]||0) >= 1).length;

  const filtered = TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (activeConf === 'ALL' || t.conf === activeConf)
  );

  const grouped = CONFS.reduce((acc, c) => {
    const teams = filtered.filter(t => t.conf === c);
    if (teams.length) acc[c] = teams;
    return acc;
  }, {});

  return (
    <div style={aCSS.page} className="page-enter">
      <h2 style={aCSS.heading}>Álbum FIFA World Cup 2026™</h2>

      <div style={aCSS.controls}>
        <input style={aCSS.search} type="text" placeholder="🔍 Buscar país…" value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={aCSS.confTabs}>
          {['ALL', ...CONFS].map(c => (
            <button key={c} style={{...aCSS.confTab, ...(activeConf===c ? aCSS.confTabActive : {})}} onClick={() => setActiveConf(c)}>
              {c==='ALL' ? 'Todos' : CONF_NAMES[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Special section */}
      {activeConf === 'ALL' && !search && (
        <div style={aCSS.section}>
          <div style={aCSS.secHeader}>
            <span style={aCSS.secLabel}>⭐ FIFA / Intro</span>
          </div>
          <button style={{...aCSS.teamCard, maxWidth:300}} onClick={() => onSelectCountry('FIFA_SPECIAL')}>
            <span style={{fontSize:32}}>🏆</span>
            <div style={{flex:1}}>
              <div style={aCSS.teamName}>Láminas Especiales</div>
              <div style={aCSS.miniBarWrap}><div style={{...aCSS.miniBarFill, width:`${Math.round(specialOwned/SPECIAL_STICKERS.length*100)}%`}} /></div>
            </div>
            <TeamCount owned={specialOwned} total={SPECIAL_STICKERS.length} pct={Math.round(specialOwned/SPECIAL_STICKERS.length*100)} />
          </button>
        </div>
      )}

      {/* Coca-Cola section */}
      {activeConf === 'ALL' && !search && (
        <div style={aCSS.section}>
          <div style={aCSS.secHeader}>
            <span style={aCSS.secLabel}>🥤 Coca-Cola</span>
          </div>
          <button style={{...aCSS.teamCard, maxWidth:300}} onClick={() => onSelectCountry('COCACOLA')}>
            <span style={{fontSize:32}}>🥤</span>
            <div style={{flex:1}}>
              <div style={aCSS.teamName}>Coca-Cola</div>
              <div style={aCSS.miniBarWrap}><div style={{...aCSS.miniBarFill, width:`${Math.round(cocacolaOwned/COCACOLA_STICKERS.length*100)}%`}} /></div>
            </div>
            <TeamCount owned={cocacolaOwned} total={COCACOLA_STICKERS.length} pct={Math.round(cocacolaOwned/COCACOLA_STICKERS.length*100)} />
          </button>
        </div>
      )}

      {/* Team groups */}
      {Object.entries(grouped).map(([conf, teams]) => (
        <div key={conf} style={aCSS.section}>
          <div style={aCSS.secHeader}>
            <span style={aCSS.secLabel}>{CONF_NAMES[conf] || conf}</span>
            <span style={{color:'var(--text-dimmer)', fontSize:11}}>{teams.length} selecciones</span>
          </div>
          <div style={aCSS.grid} className="team-grid">
            {teams.map(team => {
              const s = teamStats[team.id];
              const done = s.pct === 100;
              return (
                <button key={team.id} style={{...aCSS.teamCard, ...(done ? aCSS.teamDone : {})}} onClick={() => onSelectCountry(team.id)}>
                  <img src={flagUrl(team.id)} alt={team.name} style={{width:32, height:22, objectFit:'cover', borderRadius:3, flexShrink:0, border:'1px solid rgba(128,128,128,0.2)'}} />
                  <div style={{flex:1, minWidth:0}}>
                    <div style={aCSS.teamName}>{team.name}</div>
                    <div style={aCSS.miniBarWrap}><div style={{...aCSS.miniBarFill, width:`${s.pct}%`, background: done ? 'var(--gold)' : 'var(--green)'}} /></div>
                  </div>
                  <TeamCount owned={s.owned} total={s.total} pct={s.pct} done={done} />
                  {s.dups > 0 && <span style={aCSS.dupBadge}>+{s.dups}</span>}
                  {done && <span style={{position:'absolute', top:6, right:8, color:'var(--gold)', fontSize:14}}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamCount({ owned, total, pct, done }) {
  return (
    <div style={{display:'flex', alignItems:'baseline', gap:1, flexShrink:0}}>
      <span style={{color: done ? 'var(--gold)' : 'var(--green)', fontSize:16, fontWeight:800}}>{owned}</span>
      <span style={{color:'var(--text-dimmer)', fontSize:11}}>/{total}</span>
    </div>
  );
}

// ── Country Detail with Undo/Redo ────────────────────────────────────────────
function CountryDetail({ countryId, stickers, onUpdateSticker, onBack }) {
  const { TEAMS, teamStickers, SPECIAL_STICKERS, COCACOLA_STICKERS, flagUrl } = ALBUM_DATA;
  const isSpecial  = countryId === 'FIFA_SPECIAL';
  const isCocacola = countryId === 'COCACOLA';
  const team       = TEAMS.find(t => t.id === countryId);
  const isMobile   = window.matchMedia('(pointer: coarse)').matches;
  const stickerList = isSpecial
    ? SPECIAL_STICKERS.map(s => ({ ...s, type:'special' }))
    : isCocacola
    ? COCACOLA_STICKERS.map(s => ({ ...s, type:'cocacola' }))
    : (teamStickers[countryId] || []);

  // ── Undo/Redo history ──────────────────────────────────────
  const [history, setHistory] = useAlbumState([]);  // [{id, from, to}]
  const [histIdx, setHistIdx] = useAlbumState(-1);

  function applyChange(id, newQty) {
    const from = stickers[id] || 0;
    const newHist = [...history.slice(0, histIdx + 1), { id, from, to: newQty }];
    setHistory(newHist);
    setHistIdx(newHist.length - 1);
    onUpdateSticker(id, newQty);
  }

  function undo() {
    if (histIdx < 0) return;
    const action = history[histIdx];
    onUpdateSticker(action.id, action.from);
    setHistIdx(histIdx - 1);
  }

  function redo() {
    if (histIdx >= history.length - 1) return;
    const action = history[histIdx + 1];
    onUpdateSticker(action.id, action.to);
    setHistIdx(histIdx + 1);
  }

  function handleClick(s)            { applyChange(s.id, (stickers[s.id]||0) + 1); }
  function handleRightClick(e, s)    { e.preventDefault(); const q = stickers[s.id]||0; if (q > 0) applyChange(s.id, q - 1); }

  const owned   = stickerList.filter(s => (stickers[s.id]||0) >= 1).length;
  const dups    = stickerList.reduce((a,s) => a + Math.max(0,(stickers[s.id]||0)-1), 0);
  const missing = stickerList.filter(s => (stickers[s.id]||0) === 0).length;
  const pct     = Math.round(owned / stickerList.length * 100);

  const canUndo = histIdx >= 0;
  const canRedo = histIdx < history.length - 1;

  return (
    <div style={dCSS2.page} className="page-enter">
      {/* Header */}
      <div style={dCSS2.header}>
        <div style={dCSS2.navRow}>
          <button style={dCSS2.backBtn} onClick={onBack}>← Volver al álbum</button>
          {/* Undo / Redo */}
          <div style={dCSS2.undoRow}>
            <button style={{...dCSS2.undoBtn, opacity: canUndo ? 1 : .3, cursor: canUndo ? 'pointer' : 'default'}}
              onClick={undo} disabled={!canUndo} title="Deshacer último cambio">
              ↩ Deshacer
            </button>
            <button style={{...dCSS2.undoBtn, opacity: canRedo ? 1 : .3, cursor: canRedo ? 'pointer' : 'default'}}
              onClick={redo} disabled={!canRedo} title="Rehacer">
              Rehacer ↪
            </button>
          </div>
        </div>

        <div style={dCSS2.titleRow}>
          {isSpecial
            ? <span style={{fontSize:48}}>🏆</span>
            : isCocacola
            ? <span style={{fontSize:48}}>🥤</span>
            : <img src={flagUrl(countryId)} alt={team?.name} style={{width:64, height:44, objectFit:'cover', borderRadius:6, border:'1px solid rgba(128,128,128,0.2)'}} />
          }
          <div>
            <h2 style={dCSS2.title}>{isSpecial ? 'Láminas Especiales' : isCocacola ? 'Coca-Cola' : team?.name}</h2>
            <p style={dCSS2.hint}>Click izquierdo = agregar &nbsp;·&nbsp; Click derecho = quitar</p>
          </div>
        </div>

        <div style={dCSS2.statsRow}>
          <MiniStatD label="Tengo"    val={owned}   color="var(--green)" />
          <MiniStatD label="Faltan"   val={missing} color="var(--blue)"  />
          <MiniStatD label="Repetidas" val={dups}   color="var(--gold)"  />
          <div style={{marginLeft:'auto', color:'var(--green)', fontSize:24, fontWeight:800}}>{pct}%</div>
        </div>
        <div style={dCSS2.progressBar}>
          <div style={{...dCSS2.progressFill, width:`${pct}%`, background: pct===100 ? 'var(--gold)' : 'var(--green)'}} />
        </div>
      </div>

      {/* Sticker grid */}
      <div style={dCSS2.grid} className="sticker-grid">
        {stickerList.map(s => {
          const qty   = stickers[s.id] || 0;
          const state = qty === 0 ? 'missing' : qty === 1 ? 'owned' : 'dup';
          return (
            <button key={s.id}
              style={{...dCSS2.card, ...dCSS2[state]}}
              onClick={() => handleClick(s)}
              onContextMenu={e => handleRightClick(e, s)}
              title={`${isSpecial ? 'FWC' : isCocacola ? 'CC' : countryId} ${s.num || s.id.split('-')[1]} — ${s.name}`}>
              {isSpecial
                ? <div style={dCSS2.stickerIsoBadge}>
                    <span style={dCSS2.stickerIsoCode}>FWC</span>
                  </div>
                : isCocacola
                ? <div style={dCSS2.stickerIsoBadge}>
                    <span style={dCSS2.stickerIsoCode}>CC</span>
                  </div>
                : <div style={dCSS2.stickerIsoBadge}>
                    <span style={dCSS2.stickerIsoCode}>{team?.id}</span>
                    <span style={dCSS2.stickerIsoName}>{team?.nameEn}</span>
                  </div>
              }
              <span style={dCSS2.num}>{s.num || s.id.split('-')[1]}</span>
              {qty >= 1 && <span style={dCSS2.checkMark}>{qty===1 ? '✓' : '⭐'}</span>}
              {qty >= 2 && <span style={dCSS2.qtyBadge}>×{qty}</span>}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={dCSS2.actions}>
        <button style={dCSS2.actionGreen} onClick={() => {
          stickerList.forEach(s => { if ((stickers[s.id]||0)===0) applyChange(s.id, 1); });
        }}>✅ Marcar todas</button>
        <button style={dCSS2.actionRed} onClick={() => {
          stickerList.forEach(s => { if ((stickers[s.id]||0)>0) applyChange(s.id, 0); });
        }}>🗑 Reiniciar equipo</button>
      </div>

      {/* Instructions */}
      <div style={dCSS2.instructBox}>
        <div style={dCSS2.instructTitle}>¿Cómo registrar tus láminas?</div>
        <div style={dCSS2.instructGrid}>
          <div style={dCSS2.instructItem}>
            <span style={{...dCSS2.instructIcon, background:'var(--green-bg)', borderColor:'var(--green-brd)'}}>✓</span>
            <div>
              <div style={dCSS2.instructLabel}>1 toque</div>
              <div style={dCSS2.instructDesc}>Lámina <strong>obtenida</strong> — aparece en verde</div>
            </div>
          </div>
          <div style={dCSS2.instructItem}>
            <span style={{...dCSS2.instructIcon, background:'var(--gold-bg)', borderColor:'var(--gold-brd)'}}>⭐</span>
            <div>
              <div style={dCSS2.instructLabel}>2+ toques</div>
              <div style={dCSS2.instructDesc}>Lámina <strong>repetida</strong> — se muestra ×2, ×3…</div>
            </div>
          </div>
          <div style={dCSS2.instructItem}>
            <span style={{...dCSS2.instructIcon, background:'var(--miss-bg)', borderColor:'var(--miss-brd)'}}>−</span>
            <div>
              <div style={dCSS2.instructLabel}>{isMobile ? 'Botón Deshacer' : 'Click derecho / mantener'}</div>
              <div style={dCSS2.instructDesc}>{isMobile
                ? <>Toca <strong>Deshacer</strong> para revertir la última acción</>
                : <><strong>Quita</strong> una lámina con click derecho</>
              }</div>
            </div>
          </div>
        </div>
        <div style={dCSS2.instructNote}>Aplica igual para todos los países, láminas especiales y Coca-Cola.</div>
      </div>
    </div>
  );
}

function MiniStatD({ label, val, color }) {
  return (
    <div style={{textAlign:'center'}}>
      <div style={{color, fontSize:20, fontWeight:800}}>{val}</div>
      <div style={{color:'var(--text-dim)', fontSize:11}}>{label}</div>
    </div>
  );
}

const aCSS = {
  page:       { padding:'28px 24px', maxWidth:960, margin:'0 auto' },
  heading:    { fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:20 },
  controls:   { marginBottom:24, display:'flex', flexDirection:'column', gap:12 },
  search:     { padding:'10px 14px', background:'var(--surface)', border:'1px solid var(--border-md)', borderRadius:10, color:'var(--text)', fontSize:14, outline:'none' },
  confTabs:   { display:'flex', gap:8, flexWrap:'wrap' },
  confTab:    { padding:'6px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:99, color:'var(--text-muted)', fontSize:12, cursor:'pointer', fontWeight:500 },
  confTabActive:{ background:'var(--green)', color:'#fff', borderColor:'var(--green)' },
  section:    { marginBottom:28 },
  secHeader:  { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  secLabel:   { fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 },
  teamCard:   { display:'flex', alignItems:'center', gap:12, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'13px 14px', cursor:'pointer', textAlign:'left', position:'relative', overflow:'hidden' },
  teamDone:   { borderColor:'var(--gold-brd)', background:'var(--gold-bg)' },
  teamName:   { color:'var(--text)', fontSize:13, fontWeight:600, marginBottom:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  miniBarWrap:{ height:3, background:'var(--border)', borderRadius:99, overflow:'hidden' },
  miniBarFill:{ height:'100%', background:'var(--green)', borderRadius:99, transition:'width .4s' },
  dupBadge:   { position:'absolute', top:6, right:28, background:'var(--gold)', color:'#000', fontSize:10, fontWeight:700, borderRadius:99, padding:'1px 6px' },
};

const dCSS2 = {
  page:       { padding:'20px 24px', maxWidth:960, margin:'0 auto' },
  header:     { marginBottom:24 },
  navRow:     { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  backBtn:    { background:'none', border:'none', color:'var(--text-muted)', fontSize:14, cursor:'pointer', padding:0 },
  undoRow:    { display:'flex', gap:8 },
  undoBtn:    { padding:'6px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', fontSize:12, cursor:'pointer', fontWeight:600, transition:'opacity .2s' },
  titleRow:   { display:'flex', alignItems:'center', gap:16, marginBottom:16 },
  flag:       { fontSize:48 },
  title:      { color:'var(--text)', fontSize:24, fontWeight:800, margin:0 },
  hint:       { color:'var(--text-dimmer)', fontSize:12, margin:'4px 0 0' },
  statsRow:   { display:'flex', gap:32, alignItems:'center', marginBottom:10 },
  progressBar:{ height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' },
  progressFill:{ height:'100%', borderRadius:99, transition:'width .4s' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))', gap:8, marginBottom:24 },
  card:       { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'10px 6px', borderRadius:10, border:'1px solid', cursor:'pointer', transition:'all .15s', position:'relative', minHeight:80, gap:4 },
  missing:    { background:'var(--miss-bg)', borderColor:'var(--miss-brd)', color:'var(--miss-color)' },
  owned:      { background:'var(--green-bg)', borderColor:'var(--green-brd)', color:'var(--text)' },
  dup:        { background:'var(--gold-bg)', borderColor:'var(--gold-brd)', color:'var(--text)' },
  isoLabel:   { fontSize:14, lineHeight:1 },
  num:        { fontSize:16, fontWeight:800, lineHeight:1 },
  sname:      { fontSize:9, textAlign:'center', lineHeight:1.3, overflow:'hidden', maxHeight:24, opacity:.7 },
  checkMark:  { position:'absolute', top:4, left:4, fontSize:10 },
  qtyBadge:   { position:'absolute', top:4, right:4, background:'var(--gold)', color:'#000', fontSize:9, fontWeight:700, borderRadius:99, padding:'1px 4px' },
  actions:    { display:'flex', gap:10, flexWrap:'wrap' },
  actionGreen:{ padding:'10px 18px', background:'var(--green-bg)', border:'1px solid var(--green-brd)', borderRadius:8, color:'var(--green)', fontSize:13, fontWeight:600, cursor:'pointer' },
  actionRed:  { padding:'10px 18px', background:'var(--red-bg)', border:'1px solid var(--red-brd)', borderRadius:8, color:'var(--red)', fontSize:13, fontWeight:600, cursor:'pointer' },
  stickerIsoBadge: { display:'flex', flexDirection:'column', alignItems:'center', gap:1 },
  stickerIsoCode:  { fontSize:10, fontWeight:800, letterSpacing:'0.06em', lineHeight:1 },
  stickerIsoName:  { fontSize:7, lineHeight:1.2, textAlign:'center', opacity:0.7, maxWidth:72, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  instructBox:     { marginTop:28, padding:'18px 20px', background:'var(--surface)', border:'1px solid var(--border-md)', borderRadius:14, display:'flex', flexDirection:'column', gap:14 },
  instructTitle:   { fontSize:13, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' },
  instructGrid:    { display:'flex', flexDirection:'column', gap:12 },
  instructItem:    { display:'flex', alignItems:'center', gap:14 },
  instructIcon:    { width:36, height:36, borderRadius:9, border:'1px solid', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 },
  instructLabel:   { fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 },
  instructDesc:    { fontSize:12, color:'var(--text-dim)', lineHeight:1.4 },
  instructNote:    { fontSize:11, color:'var(--text-dimmer)', borderTop:'1px solid var(--border)', paddingTop:12, marginTop:2 },
};

Object.assign(window, { Album, CountryDetail });
