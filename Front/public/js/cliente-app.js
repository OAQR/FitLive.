const API_BASE = ''; // Asegúrate que este es el puerto de tu backend
const qs = (s,el=document)=>el.querySelector(s);
const qsa = (s,el=document)=>[...el.querySelectorAll(s)];
const modal = id => ({open(){qs(id).classList.add('show')}, close(){qs(id).classList.remove('show')}});

/* ---------- Tabs ---------- */
function setView(name){
  qsa('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===name));
  qsa('.view').forEach(v=>v.classList.toggle('hide', v.id!==`view-${name}`));
}

qs('#tabs').addEventListener('click', e => {
  if(e.target.classList.contains('tab')) {
    const view = e.target.dataset.view;
    setView(view);

    if (view === 'gyms') {
        setTimeout(() => {
            if (typeof mapInstance !== 'undefined' && mapInstance) {
                mapInstance.invalidateSize();
            } else {
                loadGyms();
            }
        }, 100);
    }
  } // <--- ¡ESTA LLAVE FALTABA!
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

/* ---------- GYMS (Mapa Interactivo con Leaflet + Google Híbrido) ---------- */
let gyms = [];
let mapInstance = null;
let markersGroup = null;
let lastUserPos = null;

function initMap() {
  mapInstance = L.map('map').setView([-12.0464, -77.0428], 12);

  // Capa Base: CartoDB Voyager (Limpio y bonito)
  const streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  });

  // Capa Satélite (Esri)
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  });

  streetLayer.addTo(mapInstance);

  L.control.layers({
    "Mapa": streetLayer,
    "Satélite": satelliteLayer
  }).addTo(mapInstance);

  markersGroup = L.layerGroup().addTo(mapInstance);
}

function toRad(d){ return d*Math.PI/180 }
function haversine(lat1,lon1,lat2,lon2){
  const R=6371;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  return R*c;
}
function fmtDist(km){
  return km<1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`;
}

function renderGymsList(dataToRender){
  const list = qs('#gym-list');
  list.innerHTML = '';

  dataToRender.forEach(g => {
    const free = Math.max(0, (g.totalMachines || 0) - (g.busyMachines || 0));
    const dist = (lastUserPos && g.lat && g.lng)
      ? fmtDist(haversine(lastUserPos.lat, lastUserPos.lng, g.lat, g.lng))
      : null;

    const brandDisplay = g.brand
      ? `<span class="badge" style="background:#42d392;color:#000;padding:2px 6px;font-size:10px">${g.brand}</span>`
      : '';
    const distText = dist ? ` • 📍 ${dist}` : '';

    const item = document.createElement('div');
    item.className = 'gym-item';
    item.innerHTML = `
      <div style="cursor:pointer">
        <div style="font-weight:700; display:flex; align-items:center; gap:6px; margin-bottom:4px">
          ${g.name} ${brandDisplay}
        </div>
        <div class="muted" style="font-size:12px; margin-bottom:2px">
          ${g.address || ''}${distText}
        </div>
        <div class="muted" style="font-size:12px">
          Libres: ${free} / Total: ${(g.totalMachines != null ? g.totalMachines : '—')}
        </div>
      </div>
    `;
    item.addEventListener('click', () => focusOnGym(g));
    list.appendChild(item);
  });
}

function updateMapMarkers(dataToRender) {
  if(!mapInstance) return;
  markersGroup.clearLayers();
  const bounds = L.latLngBounds();
  let validPoints = 0;

  dataToRender.forEach(g => {
    if(g.lat && g.lng) {
      // ... (código del popup y googleLink igual que antes) ...
      // No hace falta cambiar el contenido del popup, solo el evento click abajo:

      const marker = L.marker([g.lat, g.lng])
        .bindPopup(`<b>${g.name}</b><br>${g.address}`); // Popup simple

      // --- AQUÍ ESTÁ EL CAMBIO ---
      // Antes decía: selectGymKPIs(g)
      // Ahora dice: focusOnGym(g)
      // Esto hace que al tocar el pin, se actualice el mapa de abajo también.
      marker.on('click', () => {
          focusOnGym(g);
      });

      markersGroup.addLayer(marker);
      bounds.extend([g.lat, g.lng]);
      validPoints++;
    }
  });

  if(validPoints > 0) {
    mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }
}

function focusOnGym(g){
  // 1. Centrar Leaflet
  if(g.lat && g.lng) {
    mapInstance.flyTo([g.lat, g.lng], 17);
    markersGroup.eachLayer(layer => {
        const latLng = layer.getLatLng();
        if(Math.abs(latLng.lat - g.lat) < 0.0001 && Math.abs(latLng.lng - g.lng) < 0.0001){
            layer.openPopup();
        }
    });
  }

  selectGymKPIs(g);

  // 2. Actualizar Google Maps
  const query = g.name ? encodeURIComponent(`${g.name}, ${g.address||''}`) : `${g.lat},${g.lng}`;
  const googleUrl = `https://maps.google.com/maps?q=${query}&z=18&output=embed`; // z=18 para ver detalle edificio
  const iframe = qs('#google-frame');
  iframe.src = googleUrl;

  // 3. NUEVO: Scroll suave hacia el mapa de Google para llamar la atención
  // (Solo si no estamos ya viendo el mapa de abajo)
  const bottomRow = qs('.gym-bottom-row');
  if(bottomRow) {
      bottomRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function selectGymKPIs(g){
  const free = Math.max(0,(g.totalMachines||0)-(g.busyMachines||0));
  qs('#kpi-clients').textContent = g.currentClients ?? '—';
  qs('#kpi-free').textContent    = free;
  qs('#kpi-total').textContent   = g.totalMachines ?? '—';
}

function populateDistricts(){
    const sel = qs('#district-filter');
    // Limpiar opciones excepto la primera
    while(sel.options.length > 1) { sel.remove(1); }

    // Extraer "posibles distritos" de las direcciones o usar una lista fija
    // Para hacerlo fácil y robusto, usaremos una lista de distritos comunes de Lima/Perú
    // y verificaremos si hay gimnasios ahí.
    const commonDistricts = ['Miraflores', 'San Isidro', 'Surco', 'Lima', 'San Borja', 'La Molina', 'San Miguel', 'Los Olivos', 'Callao'];

    const available = new Set();

    gyms.forEach(g => {
        const addr = (g.address || '').toLowerCase();
        commonDistricts.forEach(d => {
            if(addr.includes(d.toLowerCase())) available.add(d);
        });
    });

    available.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.toLowerCase();
        opt.textContent = d;
        sel.appendChild(opt);
    });

    // Evento de cambio
    sel.addEventListener('change', filterGymsCombined);
}

// Función de filtrado unificada
function filterGymsCombined(){
    const distSelect = qs('#district-filter');
    const dist = distSelect.value; // Valor tal cual (ej: "Miraflores")
    const distLower = dist.toLowerCase();
    const query = qs('#gym-query').value.toLowerCase().trim();

    // 1. Filtrar Leaflet (Arriba)
    const filtered = gyms.filter(g => {
        const addr = (g.address||'').toLowerCase();
        const name = (g.name||'').toLowerCase();
        const matchDist = distLower === '' || addr.includes(distLower);
        const matchQuery = query === '' || name.includes(query) || addr.includes(query);
        return matchDist && matchQuery;
    });

    renderGymsList(filtered);
    updateMapMarkers(filtered);

    // 2. Actualizar Google Maps (Abajo) - LÓGICA INTELIGENTE
    const googleFrame = qs('#google-frame');

    if (dist !== '') {
        // CASO A: Usuario seleccionó un Distrito (ej: "Miraflores")
        // Mostramos el mapa de Google centrado en ese distrito.
        // Google suele marcar el borde del distrito en rojo.
        const search = encodeURIComponent(`Distrito de ${dist}, Lima, Peru`);
        googleFrame.src = `https://maps.google.com/maps?q=${search}&z=13&output=embed`;

    } else if (query !== '' && filtered.length > 0) {
        // CASO B: Usuario escribió texto y hay resultados
        // Intentamos mostrar la zona de los resultados (o el primero si es específico)
        // Pero para no marear, si es búsqueda general, mejor mantenemos Lima o el primer resultado.

        // Si es un resultado único, lo mostramos directo
        if(filtered.length === 1) {
             const g = filtered[0];
             const search = g.name ? encodeURIComponent(`${g.name}, ${g.address||''}`) : `${g.lat},${g.lng}`;
             googleFrame.src = `https://maps.google.com/maps?q=${search}&z=17&output=embed`;
        } else {
             // Si hay varios, volvemos a vista general de Lima para no privilegiar a uno solo
             // O podríamos no hacer nada y dejar el último estado.
             // Yo prefiero mantener la vista general:
             googleFrame.src = `https://maps.google.com/maps?q=Lima,Peru&z=11&output=embed`;
        }

    } else if (dist === '' && query === '') {
        // CASO C: Limpió todo ("Ver todos")
        // Volvemos a la vista general de Lima
        googleFrame.src = `https://maps.google.com/maps?q=Lima,Peru&z=11&output=embed`;
    }
}

async function loadGyms(){
  gyms = await api('/api/gyms').catch(()=>[]);

  if(!mapInstance && qs('#map')) initMap();

  populateDistricts();

  renderGymsList(gyms);
  updateMapMarkers(gyms);

  // --- CAMBIO AQUÍ ---
  // En lugar de seleccionar el primero, mostramos una vista general de la ciudad principal.
  // Esto invita al usuario a buscar.
  const googleFrame = qs('#google-frame');
  if(googleFrame) {
      // "Lima, Peru" o la ciudad donde operes. z=11 es vista de toda la ciudad.
      googleFrame.src = `https://maps.google.com/maps?q=Lima,Peru&z=11&output=embed`;
  }
}

/* --- BUSCADOR --- */
qs('#find-nearby').addEventListener('click', ()=>{
    const query = qs('#gym-query').value.toLowerCase().trim();
    if(!query) {
        renderGymsList(gyms);
        updateMapMarkers(gyms);
        return;
    }
    const filtered = gyms.filter(g =>
        (g.name||'').toLowerCase().includes(query) ||
        (g.address||'').toLowerCase().includes(query) ||
        (g.brand||'').toLowerCase().includes(query)
    );
    if(filtered.length === 0) {
        alert('No se encontraron gimnasios con esa búsqueda.');
    } else {
        renderGymsList(filtered);
        updateMapMarkers(filtered);
    }
});
qs('#find-nearby').addEventListener('click', filterGymsCombined); // Usar la nueva función unificada
qs('#gym-query').addEventListener('keyup', filterGymsCombined); // Búsqueda en tiempo real al escribir
/* --- GPS --- */
qs('#near-me').addEventListener('click', ()=>{
  if(!navigator.geolocation) return alert('Tu navegador no soporta geolocalización.');
  navigator.geolocation.getCurrentPosition(pos=>{
    lastUserPos = {lat:pos.coords.latitude, lng:pos.coords.longitude};

    L.marker([lastUserPos.lat, lastUserPos.lng], {
       // Icono simple para el usuario
       title: "Tu ubicación"
    }).addTo(mapInstance).bindPopup("<b>Estás aquí</b>").openPopup();

    gyms.sort((a,b) => {
        const dA = haversine(lastUserPos.lat, lastUserPos.lng, a.lat, a.lng);
        const dB = haversine(lastUserPos.lat, lastUserPos.lng, b.lat, b.lng);
        return dA - dB;
    });
    renderGymsList(gyms);
    mapInstance.setView([lastUserPos.lat, lastUserPos.lng], 14);
  }, ()=> alert('No fue posible obtener tu ubicación.'));
});

qs('#show-official').addEventListener('click', ()=>{
    qs('#gym-query').value = '';
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

/* --- Lógica para Ampliar Google Maps --- */
const btnExpand = qs('#btn-expand-google');
const googleCard = qs('#google-card');

if(btnExpand && googleCard){
    btnExpand.addEventListener('click', () => {
        // Alternar clase fullscreen
        googleCard.classList.toggle('fullscreen');

        // Cambiar el ícono y texto del botón
        const isFull = googleCard.classList.contains('fullscreen');
        if(isFull){
            btnExpand.innerHTML = '<i class="bi bi-fullscreen-exit"></i> Cerrar';
            btnExpand.style.background = '#ea4335'; // Rojo para salir
            btnExpand.style.color = 'white';
        } else {
            btnExpand.innerHTML = '<i class="bi bi-arrows-fullscreen"></i> Ampliar';
            btnExpand.style.background = 'transparent';
            btnExpand.style.color = 'var(--text)';
        }
    });
}

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



