// components/Auth.jsx
const { useState: useAuthState } = React;

function Auth({ onLogin }) {
  const [mode, setMode] = useAuthState('login');
  const [email, setEmail] = useAuthState('');
  const [password, setPassword] = useAuthState('');
  const [name, setName] = useAuthState('');
  const [error, setError] = useAuthState('');
  const [loading, setLoading] = useAuthState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = mode === 'login'
        ? await DB.login(email, password)
        : await DB.register(email, password, name || email.split('@')[0]);
      onLogin(user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const s = authCSS;
  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.trophy}>🏆</span>
          <h1 style={s.title}>Álbum del Mundial</h1>
          <p style={s.subtitle}>FIFA World Cup 2026™</p>
        </div>

        <div style={s.tabs}>
          {[['login','Iniciar sesión'],['register','Crear cuenta']].map(([v,l]) => (
            <button key={v}
              style={{...s.tab, ...(mode===v ? s.tabActive : {})}}
              onClick={() => { setMode(v); setError(''); }}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {mode === 'register' && (
            <div style={s.field}>
              <label style={s.label}>Tu nombre</label>
              <input style={s.input} type="text" placeholder="Ej: Carlos" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input style={s.input} type="email" placeholder="correo@ejemplo.com" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input style={s.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <div style={s.error}>{error}</div>}
          <button style={{...s.btn, opacity: loading ? .6 : 1}} type="submit" disabled={loading}>
            {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {!DB.isSupabaseMode() && (
          <p style={s.localNote}>
            Modo local — datos guardados en este navegador.{' '}
            <span style={{color:'var(--gold)', cursor:'pointer', textDecoration:'underline'}}
              onClick={() => window.__openSettings && window.__openSettings()}>
              Conectar Supabase
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

const authCSS = {
  overlay: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20, background:'var(--bg)' },
  card:    { width:'100%', maxWidth:400, background:'var(--surface)', borderRadius:16, padding:'40px 36px', border:'1px solid var(--border)', boxShadow:'var(--shadow)' },
  header:  { textAlign:'center', marginBottom:28 },
  trophy:  { fontSize:48, display:'block', marginBottom:12 },
  title:   { fontSize:24, fontWeight:700, color:'var(--text)', margin:0 },
  subtitle:{ fontSize:13, color:'var(--text-muted)', marginTop:4 },
  tabs:    { display:'flex', background:'var(--bg)', borderRadius:10, padding:4, marginBottom:24, gap:4 },
  tab:     { flex:1, padding:'8px 0', background:'none', border:'none', color:'var(--text-muted)', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:500 },
  tabActive:{ background:'var(--green)', color:'#fff' },
  form:    { display:'flex', flexDirection:'column', gap:16 },
  field:   { display:'flex', flexDirection:'column', gap:6 },
  label:   { fontSize:12, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' },
  input:   { padding:'12px 14px', background:'var(--input-bg)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:15, outline:'none' },
  error:   { background:'var(--red-bg)', border:'1px solid var(--red-brd)', borderRadius:8, padding:'10px 14px', color:'var(--red)', fontSize:13 },
  btn:     { padding:13, background:'var(--green)', border:'none', borderRadius:10, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', marginTop:4 },
  localNote:{ marginTop:20, fontSize:12, color:'var(--text-dim)', textAlign:'center', lineHeight:1.5 },
};

Object.assign(window, { Auth });
