const API_BASE = ''; // ajusta si tu backend está en otro host/puerto
const qs = (s,el=document)=>el.querySelector(s);
const qsa = (s,el=document)=>[...el.querySelectorAll(s)];
const modal = id => ({open(){qs(id).classList.add('show')}, close(){qs(id).classList.remove('show')}});

/* ---------- Tabs ---------- */
function setView(name){
  qsa('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===name));
  qsa('.view').forEach(v=>v.classList.toggle('hide', v.id!==`view-${name}`));
}
qs('#tabs').addEventListener('click', e=>{
  if(e.target.classList.contains('tab')) setView(e.target.dataset.view);
});
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- API helper (tolerante) ---------- */
async function api(path){
  const res = await fetch(API_BASE+path);
  if(!res.ok) throw new Error(res.status+' '+res.statusText);
  return res.json();
}

/* ---------- RUTINAS ---------- */
async function loadRoutines(){
  const list=qs('#rt-list'); list.innerHTML='';
  let data = await api('/api/routines').catch(()=>[]);
  const q = (qs('#rt-search').value||'').toLowerCase();
  if(q) data = data.filter(r => ((r.title||r.name||'').toLowerCase().includes(q)));
  if(!data.length){ qs('#rt-empty').hidden=false; return } qs('#rt-empty').hidden=true;

  data.forEach(r=>{
    const name = r.title ?? r.name ?? '—';
    const lvl  = r.level ?? r.goal ?? '—';
    const dur  = r.duration ?? r.duration_minutes ?? r.durationMinutes ?? '—';
    const el = document.createElement('div');
    el.className='routine-item';
    el.innerHTML = `
      <div>
        <div class="name">${name}</div>
        <div class="meta">Nivel: ${lvl} • Duración: ${dur} min</div>
      </div>
      <button class="btn">Seleccionar</button>`;
    el.querySelector('.btn').addEventListener('click', ()=> alert('Has seleccionado: '+name));
    list.appendChild(el);
  });
}
qs('#rt-search-btn').addEventListener('click', loadRoutines);
qs('#rt-reco').addEventListener('click', async()=>{
  const ex=await api('/api/exercises').catch(()=>[]);
  const total=ex.length||0;
  const msg = total>=8 ? 'Te recomiendo una rutina de cuerpo completo 3x/semana con 8–10 ejercicios.'
            : total>=4 ? 'Te recomiendo una rutina de full-body 2x/semana con 6–8 ejercicios.'
                       : 'Aún hay pocos ejercicios; comienza con 4–6 básicos.';
  alert(msg);
});

/* ---------- EJERCICIOS + modal detallado ---------- */
const exDlg = modal('#ex-modal');
function recForGoal(goal, ex){
  if(goal==='hipertrofia') return {sets:3,reps:'8–12',desc:'Ritmo controlado, 60–90s descanso'};
  if(goal==='fuerza') return {sets:5,reps:'3–5',desc:'Alta carga, 120–180s descanso'};
  if(goal==='resistencia') return {sets:3,reps:'15–20',desc:'Pausas cortas, 30–45s'};
  if(goal==='grasa') return {sets:4,reps:'12–15',desc:'Circuito, 30–60s entre ejercicios'};
  return {sets:3,reps:'10–12',desc:'Descanso 60–90s'};
}
async function loadExercises(){
  const grid=qs('#ex-grid'); grid.innerHTML='';
  let data = await api('/api/exercises').catch(()=>[]);
  const q = (qs('#ex-search').value||'').toLowerCase();
  if(q) data = data.filter(x => (x.name||'').toLowerCase().includes(q));
  if(!data.length){ qs('#ex-empty').hidden=false; return } qs('#ex-empty').hidden=true;

  data.forEach(x=>{
    const name=x.name??'—', type=x.type??x.muscleGroup??'—', level=x.level??'—';
    const card=document.createElement('div'); card.className='ex-card';
    card.innerHTML = `<div class="ex-title">${name}</div><div class="ex-meta">${type} • ${level}</div><div class="muted">${x.description??''}</div>`;
    card.addEventListener('click', ()=>{
      const goal = qs('#ex-goal').value;
      const rec = recForGoal(goal,x);
      qs('#exm-title').textContent = name;
      qs('#exm-sub').textContent   = `${type} • ${level}`;
      qs('#exm-body').innerHTML = `
        <p>${x.description??'Sin descripción'}</p>
        <div class="grid-3">
          <div class="kpi"><div class="n">${rec.sets}</div><div class="l">Series</div></div>
          <div class="kpi"><div class="n">${rec.reps}</div><div class="l">Repeticiones</div></div>
          <div class="kpi"><div class="n">${x.estCalories??x.est_calories??'—'}</div><div class="l">Calorías (est.)</div></div>
        </div>
        <p class="muted" style="margin-top:8px">${rec.desc}</p>`;
      exDlg.open();
    });
    grid.appendChild(card);
  });
}
qs('#ex-refresh').addEventListener('click', loadExercises);
qs('#exm-close').addEventListener('click', ()=> exDlg.close());

/* ---------- ENTRENADORES ---------- */
const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
 <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#42d392"/><stop offset="1" stop-color="#2bc4ad"/></linearGradient></defs>
 <rect width="100%" height="100%" fill="#0f1730"/>
 <circle cx="100" cy="70" r="40" fill="url(#g)"/>
 <rect x="45" y="120" width="110" height="50" rx="25" fill="url(#g)"/>
</svg>`);
function coachPhoto(c){
  return c.photoUrl || c.avatarUrl || c.imageUrl || c.pictureUrl || c.photo || c.avatar || PLACEHOLDER_AVATAR;
}
async function loadCoaches(){
  const grid=qs('#co-grid'); grid.innerHTML='';
  let data = await api('/api/coaches').catch(()=>[]);
  if(!data.length){ qs('#co-empty').hidden=false; return } qs('#co-empty').hidden=true;
  data.forEach(c=>{
    const name = c.fullName??c.full_name??c.name??c.user?.fullName??'—';
    const email = c.email??c.user?.email??'';
    const bio = c.bio??c.profile?.bio??'';
    const card=document.createElement('div'); card.className='co-card';
    card.innerHTML = `
      <img src="${coachPhoto(c)}" alt="${name}">
      <div>
        <div class="co-name">${name}</div>
        <div class="co-bio">${bio}</div>
        <div class="muted" style="margin-top:6px">${email}</div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ---------- GYMS (oficiales + cercanos con simulación) ---------- */
let gyms = [];
let selectedGym = null;
let lastUserPos = null; // {lat,lng}

function gmSrcFromLatLng(lat,lng){
  return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}
function toRad(d){ return d*Math.PI/180 }
function haversine(lat1,lon1,lat2,lon2){
  const R=6371; // km
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return R*c; // km
}
function fmtDist(km){
  return km<1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
}

function renderGymsList(){
  const list=qs('#gym-list'); list.innerHTML='';
  gyms.forEach(g=>{
    const free = Math.max(0,(g.totalMachines||0)-(g.busyMachines||0));
    const dist = (lastUserPos? fmtDist(haversine(lastUserPos.lat,lastUserPos.lng,g.lat,g.lng)) : null);
    const simBadge = g.simulated ? `<span class="badge">Simulado</span>` : '';
    const distText = dist? ` • ${dist}` : '';
    const item=document.createElement('div'); item.className='gym-item';
    item.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <div>
          <div style="font-weight:700">${g.name} ${simBadge}</div>
          <div class="muted" style="font-size:12px">${g.address||''}${distText}</div>
          <div class="muted" style="font-size:12px">Clientes: ${g.currentClients??'—'} • Libres: ${free} / Total: ${g.totalMachines??'—'}</div>
        </div>
      </div>`;
    item.addEventListener('click', ()=> selectGym(g));
    list.appendChild(item);
  });
}

function updateGymKPIs(){
  if(!selectedGym){ qs('#kpi-clients').textContent='–'; qs('#kpi-free').textContent='–'; qs('#kpi-total').textContent='–'; return; }
  const free = Math.max(0,(selectedGym.totalMachines||0)-(selectedGym.busyMachines||0));
  qs('#kpi-clients').textContent = selectedGym.currentClients ?? '—';
  qs('#kpi-free').textContent    = free;
  qs('#kpi-total').textContent   = selectedGym.totalMachines ?? '—';
}
function selectGym(g){
  selectedGym = g;
  qs('#map').src = gmSrcFromLatLng(g.lat,g.lng);
  updateGymKPIs();
}

async function loadGyms(){
  gyms = await api('/api/gyms').catch(()=>null);
  if(!Array.isArray(gyms) || gyms.length===0){
    // Fallback local (borra si tienes API real)
    gyms = [
      {id:1,name:'FitLife Centro',lat:-12.0464,lng:-77.0428,address:'Av. Principal 123',totalMachines:60,busyMachines:25,currentClients:80},
      {id:2,name:'FitLife Norte', lat:-12.0010,lng:-77.0590,address:'Calle Norte 456', totalMachines:40,busyMachines:10,currentClients:35},
      {id:3,name:'FitLife Sur',   lat:-12.1200,lng:-77.0300,address:'Av. Sur 789',      totalMachines:55,busyMachines:32,currentClients:60},
    ];
  }
  gyms.forEach(g=> g.simulated = false);
  renderGymsList();
  selectGym(gyms[0]);
}

/* Genera gyms simulados alrededor de una coordenada */
function simulateGymsAround(lat,lng, area='tu zona'){
  const templates = [
    name => `FitLife ${name} · Express`,
    name => `Powerhouse ${name}`,
    name => `Box ${name} Cross`,
    name => `${name} Fitness Lab`,
    name => `Core & Cardio ${name}`
  ];
  const sim = [];
  for(let i=0;i<5;i++){
    const dlat = (Math.random()-0.5) * 0.02; // ~1–2 km
    const dlng = (Math.random()-0.5) * 0.02;
    const total = 30 + Math.floor(Math.random()*50); // 30–79
    const busy = Math.floor(Math.random()*total);
    const clients = 20 + Math.floor(Math.random()*120);
    const name = templates[i%templates.length](area);
    sim.push({
      id: 'sim-'+i, simulated:true,
      name, address: `${area} · Simulado`,
      lat: lat + dlat, lng: lng + dlng,
      totalMachines: total, busyMachines: busy, currentClients: clients
    });
  }
  return sim;
}

/* Buscar cercanos (simulación con geolocalización si es posible) */
async function findNearby(){
  const area = (qs('#gym-query').value || 'tu zona').trim();
  const fallback = selectedGym || gyms[0] || {lat:-12.0464,lng:-77.0428};
  const doSim = (lat,lng)=>{
    gyms = simulateGymsAround(lat,lng, area);
    renderGymsList();
    selectGym(gyms[0]);
  };
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      lastUserPos = {lat:pos.coords.latitude, lng:pos.coords.longitude};
      doSim(lastUserPos.lat, lastUserPos.lng);
    }, _err=>{
      // sin GPS: usar fallback
      doSim(fallback.lat, fallback.lng);
      alert('No se pudo obtener tu ubicación. Mostrando cercanos simulados alrededor de '+(area||'tu zona')+'.');
    });
  }else{
    doSim(fallback.lat, fallback.lng);
  }
}

/* Cerca de mí: seleccionar el más cercano de la lista actual */
qs('#near-me').addEventListener('click', ()=>{
  if(!navigator.geolocation) return alert('Tu navegador no soporta geolocalización.');
  navigator.geolocation.getCurrentPosition(pos=>{
    lastUserPos = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    let best=null, bestD=Infinity;
    gyms.forEach(g=>{
      const d = haversine(lastUserPos.lat,lastUserPos.lng,g.lat,g.lng);
      if(d<bestD){bestD=d;best=g;}
    });
    if(best) selectGym(best);
    renderGymsList(); // para que muestre distancias
  }, err=> alert('No fue posible obtener tu ubicación.'));
});
qs('#find-nearby').addEventListener('click', findNearby);
qs('#show-official').addEventListener('click', ()=>{
  loadGyms();
});

/* ---------- PAGOS ---------- */
const PLANS = [
  {id:'basic', name:'Básico', price:29.90, feats:['Acceso a máquinas','1 asesoría inicial','App móvil básica']},
  {id:'pro', name:'Pro', price:49.90, feats:['Clases grupales','Evaluación mensual','App con rutinas personalizadas']},
  {id:'elite', name:'Elite', price:79.90, feats:['Entrenador personal','Nutrición mensual','Acceso a todas las sedes']}
];
let selectedPlan = null;

function renderPlans(){
  const grid=qs('#plans-grid'); grid.innerHTML='';
  PLANS.forEach(p=>{
    const card=document.createElement('div'); card.className='plan-card';
    card.innerHTML = `
      <div class="plan-name">${p.name}</div>
      <div class="price">$${p.price.toFixed(2)}/mes</div>
      <ul class="feats">${p.feats.map(f=>`<li>${f}</li>`).join('')}</ul>
      <button class="btn" data-id="${p.id}">Elegir</button>`;
    card.querySelector('button').addEventListener('click', ()=>{
      selectedPlan = p;
      qsa('#plans-grid .plan-card').forEach(c=>c.style.borderColor='var(--line)');
      card.style.borderColor = '#2a3c66';
      qs('#to-checkout').disabled = false;
    });
    grid.appendChild(card);
  });
}
qs('#to-checkout').addEventListener('click', ()=>{
  if(!selectedPlan) return;
  qs('#step-plans').classList.remove('show');
  qs('#step-pay').classList.add('show');
  qs('#pay-amount').value = `$${selectedPlan.price.toFixed(2)}`;
  qs('#summary-plan').textContent = `${selectedPlan.name} · $${selectedPlan.price.toFixed(2)}/mes`;
  qs('#summary-feats').innerHTML = `<ul class="feats">${selectedPlan.feats.map(f=>`<li>${f}</li>`).join('')}</ul>`;
});
qs('#back-to-plans').addEventListener('click', ()=>{
  qs('#step-pay').classList.remove('show');
  qs('#step-plans').classList.add('show');
});

function generatePDFReceipt(name,email,plan){
  try{
    const { jsPDF } = window.jspdf || {};
    if(!jsPDF) throw new Error('jsPDF no disponible');
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text('FitLife - Boleta de pago', 20, 20);
    doc.setFontSize(12);
    doc.text(`Cliente: ${name}`, 20, 35);
    doc.text(`Email: ${email}`, 20, 42);
    doc.text(`Plan: ${plan.name}`, 20, 56);
    doc.text(`Monto: $${plan.price.toFixed(2)}`, 20, 63);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 77);
    doc.save(`boleta_${plan.id}.pdf`);
  }catch(e){
    const w = window.open('', '_blank');
    w.document.write(`<pre>FitLife - Boleta de pago\n\nCliente: ${name}\nEmail: ${email}\nPlan: ${plan.name}\nMonto: $${plan.price.toFixed(2)}\nFecha: ${new Date().toLocaleString()}</pre>`);
    w.document.close(); w.print();
  }
}
qs('#pay-now').addEventListener('click', ()=>{
  const name=qs('#pay-name').value.trim();
  const email=qs('#pay-email').value.trim();
  const card=qs('#pay-card').value.trim();
  const exp=qs('#pay-exp').value.trim();
  const cvv=qs('#pay-cvv').value.trim();
  if(!name||!email||!card||!exp||!cvv||!selectedPlan) return alert('Completa todos los campos.');
  alert('Pago realizado con éxito.');
  generatePDFReceipt(name,email,selectedPlan);
  qs('#pay-card').value=''; qs('#pay-exp').value=''; qs('#pay-cvv').value='';
});

/* ---------- Init ---------- */
(async function init(){
  await Promise.all([
    loadRoutines().catch(()=>{}),
    loadExercises().catch(()=>{}),
    loadCoaches().catch(()=>{}),
    loadGyms().catch(()=>{})
  ]);
  renderPlans();
})();