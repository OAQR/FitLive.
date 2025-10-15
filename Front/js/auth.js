const API_BASE = ''; // cambia si tu backend está en otro host/puerto
document.getElementById('year').textContent = new Date().getFullYear();

/* Tabs */
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('form-login');
const formReg   = document.getElementById('form-register');

tabLogin.addEventListener('click', ()=>{
  tabLogin.classList.add('active'); tabRegister.classList.remove('active');
  formLogin.style.display='grid'; formReg.style.display='none';
  document.getElementById('login-error').style.display='none';
});
tabRegister.addEventListener('click', ()=>{
  tabRegister.classList.add('active'); tabLogin.classList.remove('active');
  formReg.style.display='grid'; formLogin.style.display='none';
  document.getElementById('reg-msg').style.display='none';
  document.getElementById('reg-err').style.display='none';
});

/* Mostrar / ocultar password */
document.getElementById('toggle-pass').addEventListener('click', ()=>{
  const p = document.getElementById('lg-pass');
  if(p.type==='password'){ p.type='text'; event.target.textContent='Ocultar'; } else { p.type='password'; event.target.textContent='Ver'; }
});

/* Helpers JWT / roles */
function decodeJwt(token){
  try{
    const [,p] = token.split('.');
    return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
  }catch{return null}
}
function rolesFromUserObj(u){
  if(!u) return [];
  if(Array.isArray(u.roles)) return u.roles.map(r => typeof r==='string'? r : (r.name||r.role||'')).filter(Boolean);
  if(Array.isArray(u.userRoles)) return u.userRoles.map(r=> r.name||r.role||'').filter(Boolean);
  return [];
}
function extractTokenFromResponse(data){
  return data?.token || data?.jwt || data?.accessToken || data?.access_token || '';
}
function authHeader(){
  const jwt = localStorage.getItem('fitlife.jwt') || '';
  return jwt? {'Authorization': 'Bearer '+jwt} : {};
}
function goByRoles(roles){
  const r = (roles||[]).map(x=>x.toUpperCase());
  if(r.includes('ADMIN')) window.location.href = 'admin.html';
  else window.location.href = 'client.html';
}
async function fetchMeOrFind(username){
  try{
    const res = await fetch(API_BASE + '/api/users/me', {headers: authHeader()});
    if(res.ok){ return await res.json(); }
  }catch{}
  try{
    const res = await fetch(API_BASE + '/api/users');
    if(res.ok){
      const all = await res.json();
      return all.find(u => (u.username||'').toLowerCase() === (username||'').toLowerCase()
                        || (u.email||'').toLowerCase() === (username||'').toLowerCase()) || null;
    }
  }catch{}
  return null;
}

/* Login: intenta varios endpoints comunes */
async function tryLogin(username, password){
  const payload = { username, password };
  // 1) POST /api/auth/login
  try{
    const r = await fetch(API_BASE + '/api/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(r.ok){
      const data = await r.json();
      const token = extractTokenFromResponse(data);
      if(token) return { token, data };
    }
  }catch{}
  // 2) POST /auth/login
  try{
    const r = await fetch(API_BASE + '/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    if(r.ok){
      const data = await r.json();
      const token = extractTokenFromResponse(data);
      if(token) return { token, data };
    }
  }catch{}
  // 3) POST /login (form)
  try{
    const form = new URLSearchParams(); form.set('username', username); form.set('password', password);
    const r = await fetch(API_BASE + '/login', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: form
    });
    if(r.ok){
      let data=null; try{ data=await r.json(); }catch{}
      const token = data? extractTokenFromResponse(data) : '';
      return { token, data };
    }
  }catch{}
  throw new Error('No se pudo autenticar con los endpoints conocidos.');
}

/* Submit login */
formLogin.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const err = document.getElementById('login-error'); err.style.display='none'; err.textContent='';
  const username = document.getElementById('lg-user').value.trim();
  const password = document.getElementById('lg-pass').value;
  if(!username || !password){ err.textContent='Completa usuario y contraseña.'; err.style.display='block'; return; }

  try{
    const { token, data } = await tryLogin(username, password);
    if(token){ localStorage.setItem('fitlife.jwt', token); }
    // Obtener roles
    let roles = [];
    if(data?.roles){ roles = Array.isArray(data.roles)? data.roles : [data.roles]; }
    if(!roles.length && token){
      const p = decodeJwt(token);
      const claim = p?.roles || p?.authorities || p?.scope || p?.scopes;
      if(Array.isArray(claim)) roles = claim;
      else if(typeof claim === 'string') roles = claim.split(/[,\s]+/).filter(Boolean);
    }
    if(!roles.length){
      const me = await fetchMeOrFind(username);
      roles = rolesFromUserObj(me);
    }
    goByRoles(roles);
  }catch(ex){
    err.textContent = 'Error: ' + (ex.message || 'No fue posible iniciar sesión.');
    err.style.display = 'block';
  }
});

/* Registro */
document.getElementById('btn-register-cancel').addEventListener('click', ()=> tabLogin.click());
formRegister.addEventListener('submit', async(e)=>{
  e.preventDefault();
  const ok = document.getElementById('reg-msg');
  const er = document.getElementById('reg-err');
  ok.style.display='none'; er.style.display='none'; ok.textContent=''; er.textContent='';

  const name = document.getElementById('rg-name').value.trim();
  const username = document.getElementById('rg-username').value.trim();
  const email = document.getElementById('rg-email').value.trim();
  const pass = document.getElementById('rg-pass').value;
  if(!name || !username || !email || !pass){ er.textContent='Completa todos los campos.'; er.style.display='block'; return; }

  const payload = {
    fullName:name, full_name:name, name,
    username, email, password: pass, enabled: true,
    roles:['USER'], roleNames:['USER'], userRoles:[{name:'USER'}]
  };
  try{
    const r = await fetch(API_BASE + '/api/users', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    if(!r.ok) throw new Error(r.status+' '+r.statusText);
    ok.textContent='¡Cuenta creada! Iniciando sesión…'; ok.style.display='block';

    const { token } = await tryLogin(username, pass);
    if(token){ localStorage.setItem('fitlife.jwt', token); }
    goByRoles(['USER']);
  }catch(ex){
    er.textContent = 'No se pudo crear la cuenta: ' + (ex.message||'');
    er.style.display='block';
  }
});