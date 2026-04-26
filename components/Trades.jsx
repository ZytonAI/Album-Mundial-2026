// components/Trades.jsx
const { useMemo: useMemoTr, useState: useStateTr, useEffect: useEffectTr } = React;

// ── Helpers ──────────────────────────────────────────────────────────────────
function getStickerLabel(id) {
  const { TEAMS, teamStickers, SPECIAL_STICKERS } = ALBUM_DATA;
  const spec = SPECIAL_STICKERS.find(s => s.id === id);
  if (spec) return { num: `FWC ${spec.num}`, name: spec.name, team: 'FIFA / Intro', teamId: 'FIFA' };
  for (const t of TEAMS) {
    const found = (teamStickers[t.id]||[]).find(s => s.id === id);
    if (found) return { num: `${t.id} ${found.num}`, name: found.name, team: t.name, teamId: t.id };
  }
  return { num: '??', name: id, team: '', teamId: '' };
}

// ── Main Component ───────────────────────────────────────────────────────────
function Trades({ stickers, onUpdateSticker }) {
  const { TEAMS, teamStickers, SPECIAL_STICKERS } = ALBUM_DATA;
  const [tab, setTab] = useStateTr('log'); // log | suggestions | offer | want

  // ── Computed analysis ─────────────────────────────────────
  const analysis = useMemoTr(() => {
    const offer = [], want = [];
    SPECIAL_STICKERS.forEach(s => {
      const q = stickers[s.id]||0;
      if (q >= 2) offer.push({ ...s, qty:q, extras:q-1, section:'FIFA / Intro', teamId:'FIFA' });
      if (q === 0) want.push({  ...s, section:'FIFA / Intro', teamId:'FIFA' });
    });
    TEAMS.forEach(team => {
      (teamStickers[team.id]||[]).forEach(s => {
        const q = stickers[s.id]||0;
        if (q >= 2) offer.push({ ...s, qty:q, extras:q-1, section:team.name, teamId:team.id });
        if (q === 0) want.push({ ...s, section:team.name, teamId:team.id });
      });
    });

    // Build suggestions per team
    const suggestions = [];
    TEAMS.forEach(wantTeam => {
      const missing = (teamStickers[wantTeam.id]||[]).filter(s => (stickers[s.id]||0)===0);
      if (!missing.length) return;
      const offerFrom = TEAMS
        .filter(t => t.id !== wantTeam.id)
        .map(t => ({ team:t, extras:(teamStickers[t.id]||[]).filter(s=>(stickers[s.id]||0)>=2) }))
        .filter(x => x.extras.length > 0)
        .slice(0,3);
      if (offerFrom.length)
        suggestions.push({ want:{team:wantTeam, count:missing.length, examples:missing.slice(0,3)}, offer:offerFrom.map(({team,extras})=>({team,count:extras.length,nums:extras.slice(0,6)})) });
    });
    return { offer, want, suggestions: suggestions.slice(0,10) };
  }, [stickers]);

  const totalOffer = analysis.offer.reduce((a,s) => a+s.extras, 0);

  function groupBySection(list) {
    const g = {};
    list.forEach(s => {
      if (!g[s.section]) g[s.section] = { teamId:s.teamId, items:[] };
      g[s.section].items.push(s);
    });
    return g;
  }

  return (
    <div style={tCSS.page} className="page-enter">
      <h2 style={tCSS.heading}>Intercambios</h2>

      {/* Summary */}
      <div style={tCSS.summaryRow}>
        <div style={tCSS.sumCard}>
          <div style={{color:'var(--gold)', fontSize:28, fontWeight:800}}>{totalOffer}</div>
          <div style={tCSS.sumLabel}>láminas para ofrecer</div>
        </div>
        <div style={tCSS.sumCard}>
          <div style={{color:'var(--blue)', fontSize:28, fontWeight:800}}>{analysis.want.length}</div>
          <div style={tCSS.sumLabel}>láminas que necesitas</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={tCSS.tabs}>
        {[['log','📝 Registrar'],['suggestions','💡 Sugerencias'],['offer','🟡 Mis repetidas'],['want','🔵 Me faltan']].map(([v,l]) => (
          <button key={v} style={{...tCSS.tab, ...(tab===v?tCSS.tabActive:{})}} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* Suggestions */}
      {tab==='suggestions' && (
        analysis.suggestions.length === 0
          ? <EmptyTr msg={analysis.offer.length===0 ? 'Aún no tienes láminas repetidas.' : 'No hay sugerencias todavía.'} />
          : <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {analysis.suggestions.map((sug,i) => (
                <div key={i} style={tCSS.sugCard}>
                  <div style={tCSS.sugRow}>
                    <div style={tCSS.sugSide}>
                      <div style={tCSS.sugLabel}>🔵 Necesitas</div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:20}}>{sug.want.team.flag}</span>
                        <span style={{color:'var(--text)',fontWeight:700,fontSize:15}}>{sug.want.team.name}</span>
                      </div>
                      <div style={{color:'var(--blue)',fontWeight:700,fontSize:13}}>{sug.want.count} lámina{sug.want.count!==1?'s':''}</div>
                      <div style={tCSS.exNames}>
                        {sug.want.examples.map(s => `#${String(s.num).padStart(2,'0')} ${s.name}`).join(' · ')}{sug.want.count>3?'…':''}
                      </div>
                    </div>
                    <div style={tCSS.arrow}>⇄</div>
                    <div style={tCSS.sugSide}>
                      <div style={tCSS.sugLabel}>🟡 Puedes dar</div>
                      {sug.offer.map(({team,count,nums}) => (
                        <div key={team.id} style={{...tCSS.offerItem, flexWrap:'wrap', marginBottom:10}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,width:'100%'}}>
                            <span style={{fontSize:16}}>{team.flag}</span>
                            <span style={{color:'var(--text)',fontSize:13,flex:1}}>{team.name}</span>
                            <span style={tCSS.offerBadge}>×{count}</span>
                          </div>
                          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:5}}>
                            {nums.map(s => (
                              <span key={s.id} style={tCSS.numChip}>#{String(s.num).padStart(2,'0')}</span>
                            ))}
                            {count > 6 && <span style={tCSS.numChip}>…</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Offer list */}
      {tab==='offer' && <StickerGroupList groups={groupBySection(analysis.offer)} type="offer" emptyMsg="No tienes láminas repetidas aún." />}

      {/* Want list */}
      {tab==='want' && <StickerGroupList groups={groupBySection(analysis.want)} type="want" emptyMsg="¡Álbum completo! No te falta ninguna." />}

      {/* Trade Log */}
      {tab==='log' && <TradeLog stickers={stickers} onUpdateSticker={onUpdateSticker} />}
    </div>
  );
}

// ── Sticker Group List ────────────────────────────────────────────────────────
function StickerGroupList({ groups, type, emptyMsg }) {
  const entries = Object.entries(groups);
  if (!entries.length) return <EmptyTr msg={emptyMsg} />;
  return (
    <div>
      {entries.map(([section,{flag,items}]) => (
        <div key={section} style={tCSS.group}>
          <div style={tCSS.groupHeader}>
            <span style={{fontSize:18}}>{flag}</span>
            <span style={{color:'var(--text)',fontWeight:700,fontSize:14,flex:1}}>{section}</span>
            <span style={{color:'var(--text-dim)',fontSize:12}}>{items.length} láminas</span>
          </div>
          <div style={tCSS.chipList}>
            {items.map(s => (
              <span key={s.id} style={{...tCSS.chip, ...(type==='offer'?tCSS.chipOffer:tCSS.chipWant)}}>
                <span style={{fontWeight:800, fontSize:12}}>#{String(s.num||s.id.split('-')[1]).padStart(2,'0')}</span>
                <span style={{opacity:.85, fontSize:11}}>{s.name}</span>
                {s.extras>0 && <span style={tCSS.chipExtra}>×{s.extras+1}</span>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Trade Log ─────────────────────────────────────────────────────────────────
function TradeLog({ stickers, onUpdateSticker }) {
  const { TEAMS, teamStickers, SPECIAL_STICKERS } = ALBUM_DATA;
  const [giveTeam,   setGiveTeam]   = useStateTr('');
  const [giveNum,    setGiveNum]    = useStateTr('');
  const [recvTeam,   setRecvTeam]   = useStateTr('');
  const [recvNum,    setRecvNum]    = useStateTr('');
  const [partner,    setPartner]    = useStateTr('');
  const [logs, setLogs] = useStateTr(() => {
    try { return JSON.parse(localStorage.getItem('mona26_trade_log')||'[]'); } catch { return []; }
  });
  const [flash, setFlash] = useStateTr('');

  function getTeamStickers(teamId) {
    if (teamId === 'FIFA') return SPECIAL_STICKERS.map(s=>({...s,type:'special'}));
    return teamStickers[teamId] || [];
  }

  // Solo láminas con repetidas (qty >= 2) para el lado "di"
  const giveStickers = giveTeam
    ? getTeamStickers(giveTeam).filter(s => (stickers[s.id]||0) >= 2)
    : [];
  // Solo láminas que faltan (qty === 0) para el lado "recibí"
  const recvStickers = recvTeam
    ? getTeamStickers(recvTeam).filter(s => (stickers[s.id]||0) === 0)
    : [];

  // Solo equipos que tienen al menos una lámina faltante
  const teamsWithMissing = [
    { id:'FIFA', name:'FIFA / Intro', flag:'🏆' },
    ...TEAMS,
  ].filter(t => {
    const sl = t.id === 'FIFA'
      ? SPECIAL_STICKERS.map(s=>({...s,type:'special'}))
      : (teamStickers[t.id]||[]);
    return sl.some(s => (stickers[s.id]||0) === 0);
  });

  // Solo equipos que tienen al menos una repetida
  const teamsWithDups = [
    { id:'FIFA', name:'FIFA / Intro', flag:'🏆' },
    ...TEAMS,
  ].filter(t => {
    const sl = t.id === 'FIFA'
      ? SPECIAL_STICKERS.map(s=>({...s,type:'special'}))
      : (teamStickers[t.id]||[]);
    return sl.some(s => (stickers[s.id]||0) >= 2);
  });

  const giveSticker = giveTeam ? getTeamStickers(giveTeam).find(s => s.id === giveNum) : null;
  const recvSticker = recvStickers.find(s => s.id === recvNum);

  function canRegister() {
    return giveNum && recvNum && giveNum !== recvNum;
  }

  function registerTrade() {
    if (!canRegister()) return;
    const giveQty = stickers[giveNum]||0;
    const recvQty = stickers[recvNum]||0;

    // Update collection
    if (giveQty > 0) onUpdateSticker(giveNum, giveQty - 1);
    onUpdateSticker(recvNum, recvQty + 1);

    // Log
    const entry = {
      id: Date.now(),
      gave: { id: giveNum, label: getStickerLabel(giveNum) },
      received: { id: recvNum, label: getStickerLabel(recvNum) },
      partner: partner.trim() || null,
      date: new Date().toLocaleDateString('es-CO', { day:'numeric', month:'short' }),
    };
    const newLogs = [entry, ...logs].slice(0, 100);
    setLogs(newLogs);
    localStorage.setItem('mona26_trade_log', JSON.stringify(newLogs));
    setGiveTeam(''); setGiveNum(''); setRecvTeam(''); setRecvNum(''); setPartner('');
    setFlash('✅ Intercambio registrado y colección actualizada');
    setTimeout(() => setFlash(''), 3000);
  }

  function deleteLog(id) {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    localStorage.setItem('mona26_trade_log', JSON.stringify(updated));
  }

  const sel = { ...tCSS.select };

  return (
    <div>
      {/* Form */}
      <div style={tCSS.logCard}>
        <h3 style={tCSS.logTitle}>📝 Registrar un intercambio</h3>
        <p style={tCSS.logHint}>Al registrar, tu colección se actualiza automáticamente: se quita la lámina que diste y se agrega la que recibiste.</p>

        <div style={tCSS.logGrid} className="trade-grid">
          {/* GIVE */}
          <div style={tCSS.logCol}>
            <div style={{...tCSS.colHeader, color:'var(--gold)'}}>🟡 Lámina que di</div>
            {teamsWithDups.length === 0
              ? <div style={{color:'var(--text-dim)', fontSize:13, padding:'10px 0'}}>No tienes láminas repetidas aún.</div>
              : <select style={{...sel, borderColor:'var(--gold-brd)'}} value={giveTeam} onChange={e=>{setGiveTeam(e.target.value); setGiveNum('');}}>  
                  <option value="">— Selecciona país —</option>
                  {teamsWithDups.map(t => (
                    <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
                  ))}
                </select>
            }
            {giveTeam && (
              <select style={{...sel, borderColor:'var(--gold-brd)', marginTop:8}} value={giveNum} onChange={e=>setGiveNum(e.target.value)}>
                <option value="">— Selecciona lámina —</option>
                {giveStickers.map(s => (
                  <option key={s.id} value={s.id}>
                    {giveTeam === 'FIFA' ? `FWC ${s.num}` : `${giveTeam} ${s.num}`} — {s.name} (×{stickers[s.id]||0})
                  </option>
                ))}
              </select>
            )}
            {giveSticker && (
              <div style={{...tCSS.preview, borderColor:'var(--gold-brd)'}}>
                <span style={tCSS.previewNum}>#{String(giveSticker.num).padStart(2,'0')}</span>
                <span style={tCSS.previewName}>{giveSticker.name}</span>
                <span style={{...tCSS.previewQty, color:'var(--gold)'}}>Tienes ×{stickers[giveNum]||0}</span>
              </div>
            )}
          </div>

          <div style={tCSS.logArrow} className="trade-arrow">⇄</div>

          {/* RECEIVE */}
          <div style={tCSS.logCol}>
            <div style={{...tCSS.colHeader, color:'var(--blue)'}}>🔵 Lámina que recibí</div>
            <select style={{...sel, borderColor:'var(--blue-brd)'}} value={recvTeam} onChange={e=>{setRecvTeam(e.target.value); setRecvNum('');}}>
              <option value="">— Selecciona país —</option>
              {teamsWithMissing.map(t => (
                <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
              ))}
            </select>
            {recvTeam && recvStickers.length === 0 && (
              <div style={{color:'var(--green)', fontSize:13, marginTop:8}}>✅ ¡Equipo completo! No te falta ninguna.</div>
            )}
            {recvTeam && recvStickers.length > 0 && (
              <select style={{...sel, borderColor:'var(--blue-brd)', marginTop:8}} value={recvNum} onChange={e=>setRecvNum(e.target.value)}>
                <option value="">— Selecciona lámina —</option>
                {recvStickers.map(s => (
                  <option key={s.id} value={s.id}>
                    {recvTeam === 'FIFA' ? `FWC ${s.num}` : `${recvTeam} ${s.num}`} — {s.name}
                  </option>
                ))}
              </select>
            )}
            {recvSticker && (
              <div style={{...tCSS.preview, borderColor:'var(--blue-brd)'}}>
                <span style={tCSS.previewNum}>#{String(recvSticker.num).padStart(2,'0')}</span>
                <span style={tCSS.previewName}>{recvSticker.name}</span>
                <span style={{...tCSS.previewQty, color:'var(--blue)'}}>Te falta</span>
              </div>
            )}
          </div>
        </div>

        {/* Partner (optional) */}
        <div style={{marginTop:16}}>
          <label style={tCSS.partnerLabel}>👤 Persona con quien intercambiaste (opcional)</label>
          <input style={tCSS.partnerInput} type="text" placeholder="Ej: Juan, mi vecino…" value={partner} onChange={e=>setPartner(e.target.value)} />
        </div>

        {flash && <div style={tCSS.flash}>{flash}</div>}

        <button
          style={{...tCSS.registerBtn, opacity: canRegister()?1:.4, cursor: canRegister()?'pointer':'default'}}
          disabled={!canRegister()}
          onClick={registerTrade}>
          Registrar intercambio →
        </button>
      </div>

      {/* Log history */}
      {logs.length > 0 && (
        <div>
          <h3 style={tCSS.histTitle}>📋 Historial de intercambios</h3>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {logs.map(entry => (
              <div key={entry.id} style={tCSS.logEntry}>
                <div style={tCSS.logEntryMain}>
                  <div style={tCSS.logChipGave}>
                    <span style={{fontWeight:800}}>#{entry.gave.label.num}</span>
                    <span>{entry.gave.label.flag} {entry.gave.label.name}</span>
                  </div>
                  <span style={{color:'var(--text-dimmer)', fontSize:16}}>⇄</span>
                  <div style={tCSS.logChipRecv}>
                    <span style={{fontWeight:800}}>#{entry.received.label.num}</span>
                    <span>{entry.received.label.flag} {entry.received.label.name}</span>
                  </div>
                  {entry.partner && (
                    <span style={tCSS.logPartner}>👤 {entry.partner}</span>
                  )}
                  <span style={tCSS.logDate}>{entry.date}</span>
                </div>
                <button style={tCSS.deleteBtn} onClick={() => deleteLog(entry.id)} title="Eliminar registro">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length === 0 && <EmptyTr msg="Aún no has registrado intercambios." />}
    </div>
  );
}

function EmptyTr({ msg }) {
  return (
    <div style={{textAlign:'center', padding:'48px 20px', color:'var(--text-dim)'}}>
      <div style={{fontSize:40, marginBottom:12}}>🃏</div>
      <p>{msg}</p>
    </div>
  );
}

const tCSS = {
  page:       { padding:'28px 24px', maxWidth:900, margin:'0 auto' },
  heading:    { fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:20 },
  summaryRow: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24 },
  sumCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:20, textAlign:'center' },
  sumLabel:   { color:'var(--text-muted)', fontSize:13, marginTop:4 },
  tabs:       { display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' },
  tab:        { padding:'8px 16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:99, color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontWeight:500 },
  tabActive:  { background:'var(--surface2)', borderColor:'var(--green)', color:'var(--text)' },
  sugCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:20 },
  sugRow:     { display:'flex', alignItems:'flex-start', gap:16 },
  sugSide:    { flex:1 },
  sugLabel:   { fontSize:11, fontWeight:700, color:'var(--text-dim)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 },
  arrow:      { fontSize:24, color:'var(--text-dimmer)', alignSelf:'center', flexShrink:0 },
  exNames:    { color:'var(--text-dim)', fontSize:11, marginTop:4, lineHeight:1.5 },
  offerItem:  { display:'flex', alignItems:'center', gap:8, marginBottom:6 },
  offerBadge: { background:'var(--gold-bg)', color:'var(--gold)', fontSize:11, fontWeight:700, borderRadius:99, padding:'2px 8px', border:'1px solid var(--gold-brd)' },
  numChip:    { background:'var(--surface2)', color:'var(--gold)', fontSize:11, fontWeight:700, borderRadius:6, padding:'2px 6px', border:'1px solid var(--gold-brd)' },
  group:      { marginBottom:20 },
  groupHeader:{ display:'flex', alignItems:'center', gap:10, marginBottom:10, paddingBottom:8, borderBottom:'1px solid var(--border)' },
  chipList:   { display:'flex', flexWrap:'wrap', gap:6 },
  chip:       { display:'flex', alignItems:'center', gap:5, borderRadius:99, padding:'5px 10px', border:'1px solid' },
  chipOffer:  { background:'var(--gold-bg)', borderColor:'var(--gold-brd)', color:'var(--gold)' },
  chipWant:   { background:'var(--blue-bg)', borderColor:'var(--blue-brd)', color:'var(--blue)' },
  chipExtra:  { background:'var(--gold-bg)', borderRadius:99, padding:'1px 5px', fontSize:10, fontWeight:700, color:'var(--gold)' },

  // Log
  logCard:    { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24, marginBottom:28 },
  logTitle:   { color:'var(--text)', fontSize:16, fontWeight:700, marginBottom:8 },
  logHint:    { color:'var(--text-dim)', fontSize:13, lineHeight:1.5, marginBottom:20 },
  logGrid:    { display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16, alignItems:'start' },
  logCol:     { display:'flex', flexDirection:'column' },
  colHeader:  { fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 },
  logArrow:   { fontSize:28, color:'var(--text-dimmer)', alignSelf:'center', paddingTop:24 },
  select:     { padding:'10px 12px', background:'var(--input-bg)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, outline:'none', width:'100%', cursor:'pointer' },
  preview:    { marginTop:10, display:'flex', alignItems:'center', gap:8, background:'var(--surface2)', border:'1px solid', borderRadius:8, padding:'10px 12px' },
  previewNum: { fontWeight:800, fontSize:16, flexShrink:0 },
  previewName:{ color:'var(--text)', fontSize:13, flex:1 },
  previewQty: { fontWeight:700, fontSize:13, flexShrink:0 },
  partnerLabel:{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 },
  partnerInput:{ width:'100%', padding:'10px 12px', background:'var(--input-bg)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, outline:'none' },
  flash:      { marginTop:14, padding:'10px 14px', background:'var(--green-bg)', border:'1px solid var(--green-brd)', borderRadius:8, color:'var(--green)', fontSize:13, fontWeight:600 },
  registerBtn:{ marginTop:16, padding:'12px 24px', background:'var(--green)', border:'none', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', transition:'opacity .2s' },

  histTitle:  { fontSize:15, fontWeight:700, color:'var(--text-muted)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em' },
  logEntry:   { display:'flex', alignItems:'center', gap:10, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 16px' },
  logEntryMain:{ flex:1, display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' },
  logChipGave:{ display:'flex', gap:6, alignItems:'center', background:'var(--gold-bg)', border:'1px solid var(--gold-brd)', borderRadius:99, padding:'4px 10px', color:'var(--gold)', fontSize:12 },
  logChipRecv:{ display:'flex', gap:6, alignItems:'center', background:'var(--blue-bg)', border:'1px solid var(--blue-brd)', borderRadius:99, padding:'4px 10px', color:'var(--blue)', fontSize:12 },
  logPartner: { color:'var(--text-dim)', fontSize:12 },
  logDate:    { color:'var(--text-dimmer)', fontSize:11, marginLeft:'auto' },
  deleteBtn:  { background:'none', border:'none', color:'var(--text-dimmer)', cursor:'pointer', fontSize:14, padding:'4px 6px', borderRadius:6, flexShrink:0 },
};

Object.assign(window, { Trades });
