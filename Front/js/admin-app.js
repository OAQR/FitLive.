/* ===== Config de subida (elige si tu API tiene endpoint de archivos) =====
   - 'multipart': sube con FormData a /api/coaches/{id}/photo (PUT/POST)
   - 'inline': guarda la imagen en base64 como photoUrl (y sinónimos) */
const COACH_UPLOAD_MODE = 'inline'; // 'multipart' | 'inline'
const multipartEndpoint = id => `/api/coaches/${id}/photo`; // ajústalo a tu API
/* ====================================================================== */

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
 <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
 <stop offset="0" stop-color="#42d392"/><stop offset="1" stop-color="#2bc4ad"/></linearGradient></defs>
 <rect width="100%" height="100%" fill="#0f1730"/>
 <circle cx="100" cy="70" r="40" fill="url(#g)"/>
 <rect x="45" y="120" width="110" height="50" rx="25" fill="url(#g)"/>
</svg>`);

/* ===== Helpers ===== */
const API_BASE = '';
const qs = (s,el=document)=>el.querySelector(s);
const qsa = (s,el=document)=>[...el.querySelectorAll(s)];
const modal = id => ({open(){qs(id).classList.add('show')}, close(){qs(id).classList.remove('show')}});

async function api(path, opts={}){
  const headers = {'Content-Type':'application/json', ...(opts.headers||{})};
  const res = await fetch(API_BASE+path, {...opts, headers});
  if(!res.ok) throw new Error(res.status+' '+res.statusText);
  return res.status===204 ? null : res.json();
}
function setView(name){
  qsa('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===name));
  qsa('.view').forEach(v=>v.classList.toggle('hide', v.id!==`view-${name}`));
}

/* ===== Dashboard ===== */
async function loadKPIs(){
  const [ex, rt, re] = await Promise.all([
    api('/api/exercises').catch(()=>[]),
    api('/api/routines').catch(()=>[]),
    api('/api/routine-exercises').catch(()=>[])
  ]);
  qs('#kpi-ex').textContent = Array.isArray(ex)? ex.length : '–';
  qs('#kpi-rt').textContent = Array.isArray(rt)? rt.length : '–';
  qs('#kpi-re').textContent = Array.isArray(re)? re.length : '–';
}
qs('#probe-btn').addEventListener('click', async()=>{
  const ep=qs('#probe-endpoint').value; const out=qs('#probe-output');
  try{ const data=await api(ep); out.textContent=JSON.stringify(data,null,2) }catch(e){ out.textContent='Error: '+e.message }
});
qs('#probe-clear').addEventListener('click', ()=> qs('#probe-output').textContent='Resultado aquí…');

/* ===== Ejercicios (CRUD) ===== */
let exEditingId = null; const exDlg = modal('#ex-modal');
function mapExerciseRow(x){
  return { id:x.id??x.exerciseId??null, name:x.name??'—', type:x.type??x.muscleGroup??'—',
           level:x.level??'—', desc:x.description??'—', cal:x.estCalories??x.est_calories??'—' };
}
async function loadExercises(){
  const tb=qs('#ex-table'); tb.innerHTML='';
  let data=await api('/api/exercises').catch(()=>[]);
  const q=(qs('#ex-search').value||'').toLowerCase();
  if(q) data=data.filter(x=>(x.name||'').toLowerCase().includes(q));
  if(!data.length){ qs('#ex-empty').hidden=false; return } qs('#ex-empty').hidden=true;
  data.forEach(x=>{
    const {id,name,type,level,desc,cal}=mapExerciseRow(x);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${name}</td><td>${type}</td><td>${level}</td><td>${desc}</td><td>${cal}</td>
      <td class="actions"><button class="btn ghost" data-act="edit">Editar</button>
      <button class="btn danger" data-act="del">Borrar</button></td>`;
    tr.querySelector('[data-act="edit"]').addEventListener('click', ()=>{
      exEditingId=id??null; qs('#exm-title').textContent=exEditingId?'Editar ejercicio':'Nuevo ejercicio';
      qs('#exm-name').value=x.name??''; qs('#exm-type').value=x.type??x.muscleGroup??'';
      qs('#exm-level').value=x.level??''; qs('#exm-desc').value=x.description??''; qs('#exm-cal').value=x.estCalories??x.est_calories??'';
      exDlg.open();
    });
    tr.querySelector('[data-act="del"]').addEventListener('click', async()=>{
      if(!id) return alert('No se puede borrar sin ID');
      if(!confirm('¿Borrar ejercicio "'+name+'"?')) return;
      try{ await api(`/api/exercises/${id}`,{method:'DELETE'}).catch(()=>{throw new Error('DELETE no disponible')});
        loadExercises(); loadKPIs(); }catch(e){ alert('No se pudo borrar: '+e.message); }
    });
    tb.appendChild(tr);
  });
}
qs('#ex-search-btn').addEventListener('click', loadExercises);
qs('#ex-search').addEventListener('keydown', e=>{ if(e.key==='Enter') loadExercises(); });
qs('#ex-new').addEventListener('click', ()=>{ exEditingId=null;
  ['#exm-name','#exm-type','#exm-level','#exm-desc','#exm-cal'].forEach(s=>qs(s).value='');
  qs('#exm-title').textContent='Nuevo ejercicio'; exDlg.open();
});
qs('#exm-cancel').addEventListener('click', ()=> exDlg.close());
qs('#exm-save').addEventListener('click', async()=>{
  const payload={ name:qs('#exm-name').value.trim(), description:qs('#exm-desc').value.trim(),
    type:qs('#exm-type').value.trim(), level:qs('#exm-level').value.trim(), estCalories:+qs('#exm-cal').value||0 };
  if(!payload.name) return alert('Nombre requerido');
  try{
    if(exEditingId){
      await api(`/api/exercises/${exEditingId}`,{method:'PUT',body:JSON.stringify(payload)})
        .catch(()=>{throw new Error('PUT no disponible')});
    }else{ await api('/api/exercises',{method:'POST',body:JSON.stringify(payload)}); }
    exDlg.close(); loadExercises(); loadKPIs();
  }catch(e){ alert('No se pudo guardar: '+e.message); }
});

/* ===== Rutinas (CRUD + Builder) ===== */
let rtEditingId=null; const rtDlg=modal('#rt-modal'); let builderItems=[]; let originalReMap=new Map();
function mapRoutineRow(r){
  return { id:r.id, title:r.title??r.name??'—', level:r.level??r.goal??'—',
           dur:r.duration??r.duration_minutes??r.durationMinutes??'—', desc:r.description??'—' };
}
async function loadRoutines(){
  const tb=qs('#rt-table'); tb.innerHTML='';
  let data=await api('/api/routines').catch(()=>[]);
  const q=(qs('#rt-search').value||'').toLowerCase();
  if(q) data=data.filter(r=>((r.title||r.name||'').toLowerCase().includes(q)));
  if(!data.length){ qs('#rt-empty').hidden=false; return } qs('#rt-empty').hidden=true;
  data.forEach(r=>{
    const {id,title,level,dur,desc}=mapRoutineRow(r);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${title}</td><td>${level}</td><td>${dur}</td><td>${desc}</td>
      <td class="actions"><button class="btn ghost" data-act="edit">Editar</button>
      <button class="btn danger" data-act="del">Borrar</button></td>`;
    tr.querySelector('[data-act="edit"]').addEventListener('click', ()=> openRoutineEditor(r));
    tr.querySelector('[data-act="del"]').addEventListener('click', async()=>{
      if(!id) return alert('No se puede borrar sin ID');
      if(!confirm('¿Borrar rutina "'+title+'"?')) return;
      try{ await api(`/api/routines/${id}`,{method:'DELETE'}).catch(()=>{}); loadRoutines(); loadKPIs(); }
      catch(e){ alert('No se pudo borrar: '+e.message); }
    });
    tb.appendChild(tr);
  });
}
qs('#rt-search-btn').addEventListener('click', loadRoutines);
qs('#rt-search').addEventListener('keydown', e=>{ if(e.key==='Enter') loadRoutines(); });
qs('#rt-new').addEventListener('click', ()=> openRoutineEditor(null));

async function openRoutineEditor(r){
  rtEditingId=r?.id??null;
  qs('#rtm-title').textContent=rtEditingId?'Editar rutina':'Nueva rutina';
  qs('#rtm-name').value=r?.title??r?.name??''; qs('#rtm-level').value=r?.level??r?.goal??'';
  qs('#rtm-dur').value=r?.duration??r?.duration_minutes??r?.durationMinutes??''; qs('#rtm-desc').value=r?.description??'';
  qs('#rtm-note').style.display='none';

  const ex=await api('/api/exercises').catch(()=>[]);
  qs('#b-ex').innerHTML=ex.map(x=>`<option value="${x.id}">${x.name??('Ejercicio '+x.id)}</option>`).join('')||'<option value="">No hay ejercicios</option>';

  builderItems=[]; originalReMap.clear();
  if(rtEditingId){
    const current=await api(`/api/routine-exercises?routineId=${rtEditingId}`).catch(()=>[]);
    current.forEach((re,idx)=>{
      const it={exerciseId:re.exercise?.id??re.exerciseId??null,name:re.exercise?.name??`Ejercicio ${re.exercise?.id??''}`,
        sets:re.sets??0,reps:re.reps??0,seconds:re.seconds??0,ord:re.ord??(idx+1),reId:re.id};
      builderItems.push(it); if(re.id) originalReMap.set(re.id,it);
    });
  }
  renderBuilder(); rtDlg.open();
}
function renderBuilder(){
  const list=qs('#b-list'); list.innerHTML=''; if(!builderItems.length){qs('#b-empty').style.display='block';return}
  qs('#b-empty').style.display='none';
  builderItems.sort((a,b)=>(a.ord||0)-(b.ord||0)).forEach((it,idx)=>{
    const row=document.createElement('div'); row.className='builder-row';
    row.innerHTML=`<div class="tag"><span class="tag-ord">${it.ord||idx+1}</span>&nbsp; ${it.name}</div>
      <input class="input" type="number" min="1" value="${it.sets||0}" data-f="sets">
      <input class="input" type="number" min="1" value="${it.reps||0}" data-f="reps">
      <input class="input" type="number" min="0" value="${it.seconds||0}" data-f="seconds">
      <input class="input" type="number" min="1" value="${it.ord||idx+1}" data-f="ord">
      <div class="row" style="justify-content:flex-end">
        <button class="btn ghost" data-act="up">↑</button>
        <button class="btn ghost" data-act="down">↓</button>
        <button class="btn danger" data-act="rm">Quitar</button>
      </div>`;
    row.querySelectorAll('input[data-f]').forEach(inp=>inp.addEventListener('input',e=>{it[e.target.dataset.f]=+e.target.value||0}));
    row.querySelector('[data-act="rm"]').addEventListener('click',()=>{builderItems=builderItems.filter(x=>x!==it);renderBuilder()});
    row.querySelector('[data-act="up"]').addEventListener('click',()=>{it.ord=Math.max(1,(it.ord||1)-1);renderBuilder()});
    row.querySelector('[data-act="down"]').addEventListener('click',()=>{it.ord=(it.ord||1)+1;renderBuilder()});
    list.appendChild(row);
  });
}
qs('#b-add').addEventListener('click', ()=>{
  const exSel=qs('#b-ex'); if(!exSel.value) return;
  const item={exerciseId:+exSel.value,name:exSel.options[exSel.selectedIndex].textContent,
    sets:+qs('#b-sets').value||0,reps:+qs('#b-reps').value||0,seconds:+qs('#b-sec').value||0,ord:+qs('#b-ord').value||(builderItems.length+1)};
  builderItems.push(item); ['#b-sets','#b-reps','#b-sec','#b-ord'].forEach(s=>qs(s).value=''); renderBuilder();
});
qs('#rtm-cancel').addEventListener('click', ()=> rtDlg.close());
qs('#rtm-save').addEventListener('click', async()=>{
  const name=qs('#rtm-name').value.trim(), level=qs('#rtm-level').value.trim(), dur=+qs('#rtm-dur').value||0, desc=qs('#rtm-desc').value.trim();
  if(!name||!dur) return alert('Nombre y duración requeridos');
  const payload={name,title:name,level,goal:level,duration:dur,durationMinutes:dur,duration_minutes:dur,description:desc};
  let rid=rtEditingId;
  try{
    if(rid){ await api(`/api/routines/${rid}`,{method:'PUT',body:JSON.stringify(payload)}).catch(()=>{throw new Error('PUT no disponible')}); }
    else { const created=await api('/api/routines',{method:'POST',body:JSON.stringify(payload)}); rid=created?.id; if(!rid) throw new Error('La API no devolvió id'); }
    for(const it of builderItems.filter(x=>!x.reId)){
      const body={routineId:rid,exerciseId:it.exerciseId,sets:it.sets,reps:it.reps,seconds:it.seconds,ord:it.ord};
      await api('/api/routine-exercises',{method:'POST',body:JSON.stringify(body)}).catch(()=>{throw new Error('POST /routine-exercises falló')});
    }
    const keep=new Set(builderItems.filter(x=>x.reId).map(x=>x.reId));
    for(const reId of originalReMap.keys()){ if(!keep.has(reId)){ await api(`/api/routine-exercises/${reId}`,{method:'DELETE'}).catch(()=>{}); } }
    rtDlg.close(); loadRoutines(); loadKPIs();
  }catch(e){ qs('#rtm-note').style.display='block'; qs('#rtm-note').textContent='No se pudo guardar: '+e.message; alert('No se pudo guardar: '+e.message); }
});

/* ===== Usuarios ===== */
let usEditingId=null; const usDlg=modal('#us-modal');
function roleNamesFromAny(u){
  let roles=[];
  if(Array.isArray(u.roles)) roles = u.roles.map(r=> typeof r==='string'? r : (r.name||r.role||''));
  else if(Array.isArray(u.userRoles)) roles = u.userRoles.map(r=>r.name||r.role||'');
  return roles.filter(Boolean);
}
function parseUser(u){
  const roles=roleNamesFromAny(u);
  return { id:u.id, username:u.username??'', email:u.email??'', name:u.fullName??u.full_name??u.name??'',
           enabled:u.enabled??true, roles, rolesText: roles.length? roles.join(', ') : '—' };
}
async function loadUsers(){
  const tb=qs('#us-table'); tb.innerHTML='';
  let data=await api('/api/users').catch(()=>[]);
  const q=(qs('#us-search').value||'').toLowerCase();
  if(q) data=data.filter(u=> ((u.fullName||u.full_name||u.name||'').toLowerCase().includes(q) ||
                              (u.username||'').toLowerCase().includes(q) ||
                              (u.email||'').toLowerCase().includes(q)));
  if(!data.length){ qs('#us-empty').hidden=false; return } qs('#us-empty').hidden=true;

  data.forEach(u=>{
    const M=parseUser(u);
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${M.name||'—'}</td><td>${M.username||'—'}</td><td>${M.email||'—'}</td>
      <td>${M.rolesText}</td><td>${M.enabled? 'Activo':'Inactivo'}</td>
      <td class="actions">
        <button class="btn ghost" data-act="edit">Editar</button>
        <button class="btn danger" data-act="del">Borrar</button>
      </td>`;
    tr.querySelector('[data-act="edit"]').addEventListener('click', ()=>{
      usEditingId=M.id??null; qs('#usm-title').textContent=usEditingId?'Editar usuario':'Nuevo usuario';
      qs('#usm-name').value=M.name; qs('#usm-username').value=M.username; qs('#usm-email').value=M.email;
      qs('#usm-enabled').value=String(!!M.enabled);
      qs('#role-admin').checked=M.roles.includes('ADMIN');
      qs('#role-client').checked=M.roles.includes('USER')||(!M.roles.length);
      qs('#usm-pass').value=''; qs('#usm-pass-row').style.display = usEditingId? 'none':'block';
      qs('#usm-note').style.display='none'; usDlg.open();
    });
    tr.querySelector('[data-act="del"]').addEventListener('click', async()=>{
      if(!M.id) return alert('No se puede borrar sin ID');
      if(!confirm('¿Borrar usuario "'+(M.username||M.email||M.name)+'"?')) return;
      try{ await api(`/api/users/${M.id}`,{method:'DELETE'}).catch(()=>{throw new Error('DELETE no disponible')});
        loadUsers(); }catch(e){ alert('No se pudo borrar: '+e.message); }
    });
    tb.appendChild(tr);
  });
}
qs('#us-search-btn').addEventListener('click', loadUsers);
qs('#us-search').addEventListener('keydown', e=>{ if(e.key==='Enter') loadUsers(); });
qs('#us-new').addEventListener('click', ()=>{
  usEditingId=null; ['#usm-name','#usm-username','#usm-email','#usm-pass'].forEach(s=>qs(s).value='');
  qs('#usm-enabled').value='true'; qs('#role-admin').checked=false; qs('#role-client').checked=true;
  qs('#usm-title').textContent='Nuevo usuario'; qs('#usm-pass-row').style.display='block'; qs('#usm-note').style.display='none';
  usDlg.open();
});
qs('#usm-cancel').addEventListener('click', ()=> usDlg.close());
qs('#usm-save').addEventListener('click', async()=>{
  const name=qs('#usm-name').value.trim(), username=qs('#usm-username').value.trim(), email=qs('#usm-email').value.trim();
  const enabled=qs('#usm-enabled').value==='true'; const pass=qs('#usm-pass').value;
  const roles=[qs('#role-admin').checked?'ADMIN':null, qs('#role-client').checked?'USER':null].filter(Boolean);
  if(!username || !email) return alert('Usuario y email requeridos');
  const payload={ username,email,enabled, fullName:name,full_name:name,name, password:usEditingId?undefined:pass,
    roles, roleNames:roles, userRoles:roles.map(r=>({name:r})) };
  try{
    if(usEditingId){
      await api(`/api/users/${usEditingId}`,{method:'PUT',body:JSON.stringify(payload)})
        .catch(()=>{ throw new Error('PUT /api/users/{id} no disponible')});
    }else{
      const created=await api('/api/users',{method:'POST',body:JSON.stringify(payload)});
      usEditingId=created?.id??usEditingId;
    }
    usDlg.close(); loadUsers();
  }catch(e){ qs('#usm-note').style.display='block'; qs('#usm-note').textContent='No se pudo guardar: '+e.message; alert('No se pudo guardar: '+e.message); }
});

/* ===== Entrenadores ===== */
let coEditingId=null; const coDlg=modal('#co-modal'); let coUsersLoaded=false;
let comPreviewData = ''; // url/base64 de la foto mostrada en preview

function parseCoach(c){
  const name = c.fullName??c.full_name??c.name??c.user?.fullName??c.user?.full_name??c.user?.name??'';
  const email = c.email??c.user?.email??'';
  const phone = c.phone??c.phoneNumber??c.telefono??'';
  const bio = c.bio??c.profile?.bio??'';
  const ig = c.instagram??c.ig??'';
  const wa = c.whatsapp??c.wa??'';
  const web = c.website??c.site??c.url??'';
  const userId = c.userId??c.user_id??c.user?.id??null;
  const photo = c.photoUrl??c.avatarUrl??c.imageUrl??c.pictureUrl??c.photo??c.avatar??'';
  return { id:c.id, name,email,phone,bio,ig,wa,web,userId,photo };
}
async function loadCoaches(){
  const tb=qs('#co-table'); tb.innerHTML='';
  let data=await api('/api/coaches').catch(()=>[]);
  const q=(qs('#co-search').value||'').toLowerCase();
  if(q) data=data.filter(c=> ((c.fullName||c.full_name||c.name||c.user?.fullName||'').toLowerCase().includes(q) ||
                              (c.email||c.user?.email||'').toLowerCase().includes(q)));
  if(!data.length){ qs('#co-empty').hidden=false; return } qs('#co-empty').hidden=true;

  data.forEach(c=>{
    const M=parseCoach(c);
    const redes = [M.ig?`IG: ${M.ig}`:'', M.wa?`WA: ${M.wa}`:'', M.web?`Web: ${M.web}`:''].filter(Boolean).join(' · ') || '—';
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><img class="avatar-sm" src="${M.photo||PLACEHOLDER_AVATAR}" alt=""></td>
      <td>${M.name||'—'}</td><td>${M.email||'—'}</td><td>${M.phone||'—'}</td>
      <td>${M.bio||'—'}</td><td>${redes}</td>
      <td class="actions"><button class="btn ghost" data-act="edit">Editar</button>
      <button class="btn danger" data-act="del">Borrar</button></td>`;
    tr.querySelector('[data-act="edit"]').addEventListener('click', ()=> openCoachEditor(M));
    tr.querySelector('[data-act="del"]').addEventListener('click', async()=>{
      if(!M.id) return alert('No se puede borrar sin ID');
      if(!confirm('¿Borrar entrenador "'+(M.name||M.email)+'"?')) return;
      try{ await api(`/api/coaches/${M.id}`,{method:'DELETE'}).catch(()=>{throw new Error('DELETE no disponible')});
        loadCoaches(); }catch(e){ alert('No se pudo borrar: '+e.message); }
    });
    tb.appendChild(tr);
  });
}
qs('#co-search-btn').addEventListener('click', loadCoaches);
qs('#co-search').addEventListener('keydown', e=>{ if(e.key==='Enter') loadCoaches(); });
qs('#co-new').addEventListener('click', ()=> openCoachEditor(null));

async function openCoachEditor(M){
  coEditingId = M?.id ?? null;
  qs('#com-title').textContent = coEditingId ? 'Editar entrenador' : 'Nuevo entrenador';
  qs('#com-name').value = M?.name??'';  qs('#com-email').value = M?.email??'';  qs('#com-phone').value = M?.phone??'';
  qs('#com-bio').value = M?.bio??'';    qs('#com-ig').value   = M?.ig??'';     qs('#com-wa').value   = M?.wa??'';
  qs('#com-web').value = M?.web??'';    qs('#com-note').style.display='none';

  comPreviewData = M?.photo || '';
  qs('#com-preview').src = comPreviewData || PLACEHOLDER_AVATAR;
  qs('#com-photo').value = '';

  try{
    if(!coUsersLoaded){
      const users=await api('/api/users');
      const sel=qs('#com-user'); sel.innerHTML = `<option value="">— Sin vincular —</option>` +
        users.map(u=>`<option value="${u.id}">${u.fullName??u.full_name??u.name??u.username??u.email}</option>`).join('');
      qs('#com-user-field').style.display='block'; coUsersLoaded=true;
    }
    if(M?.userId){ qs('#com-user').value=String(M.userId); }
  }catch{ qs('#com-user-field').style.display='none'; }

  coDlg.open();
}

/* manejo de input file + preview */
qs('#com-photo').addEventListener('change', e=>{
  const f=e.target.files?.[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ comPreviewData = r.result; qs('#com-preview').src = comPreviewData; };
  r.readAsDataURL(f);
});
qs('#com-clear-photo').addEventListener('click', ()=>{
  comPreviewData=''; qs('#com-preview').src=PLACEHOLDER_AVATAR; qs('#com-photo').value='';
});

async function uploadCoachPhotoMultipart(id, file){
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(API_BASE + multipartEndpoint(id), { method:'PUT', body: fd });
  if(!res.ok) throw new Error('Subida multipart falló: ' + res.status);
  const data = await res.json().catch(()=> ({}));
  return data.photoUrl || data.url || data.location || '';
}

qs('#com-cancel').addEventListener('click', ()=> coDlg.close());
qs('#com-save').addEventListener('click', async()=>{
  const name=qs('#com-name').value.trim(), email=qs('#com-email').value.trim(), phone=qs('#com-phone').value.trim();
  const bio=qs('#com-bio').value.trim(), ig=qs('#com-ig').value.trim(), wa=qs('#com-wa').value.trim(), web=qs('#com-web').value.trim();
  const userId = qs('#com-user-field').style.display!=='none' && qs('#com-user').value ? +qs('#com-user').value : undefined;
  if(!name||!email) return alert('Nombre y email requeridos');

  const payload = {
    fullName:name, full_name:name, name,
    email,
    phone, phoneNumber:phone, telefono:phone,
    bio,
    instagram:ig, ig,
    whatsapp:wa, wa,
    website:web, site:web, url:web,
    userId, user_id:userId
  };

  try{
    // 1) crear/actualizar coach (sin foto aún)
    let id = coEditingId;
    if(id){
      await api(`/api/coaches/${id}`, {method:'PUT', body:JSON.stringify(payload)})
        .catch(()=>{ throw new Error('PUT /api/coaches/{id} no disponible')});
    }else{
      const created = await api('/api/coaches', {method:'POST', body:JSON.stringify(payload)});
      id = created?.id;
      if(!id) throw new Error('La API no devolvió id al crear entrenador');
      coEditingId = id;
    }

    // 2) si hay foto seleccionada
    const file = qs('#com-photo').files?.[0] || null;
    if(file){
      if(COACH_UPLOAD_MODE === 'multipart'){
        const url = await uploadCoachPhotoMultipart(id, file).catch(()=> '');
        if(url){
          const photoPayload = { photoUrl:url, avatarUrl:url, imageUrl:url, pictureUrl:url, photo:url, avatar:url };
          await api(`/api/coaches/${id}`, {method:'PUT', body:JSON.stringify(photoPayload)}).catch(()=>{});
        }
      }else{
        const url = comPreviewData;
        const photoPayload = { photoUrl:url, avatarUrl:url, imageUrl:url, pictureUrl:url, photo:url, avatar:url };
        await api(`/api/coaches/${id}`, {method:'PUT', body:JSON.stringify(photoPayload)}).catch(()=>{});
      }
    }else if(comPreviewData==='' && coEditingId){
      const photoPayload = { photoUrl:null, avatarUrl:null, imageUrl:null, pictureUrl:null, photo:null, avatar:null };
      await api(`/api/coaches/${coEditingId}`, {method:'PUT', body:JSON.stringify(photoPayload)}).catch(()=>{});
    }

    coDlg.close(); loadCoaches();
  }catch(e){
    qs('#com-note').style.display='block';
    qs('#com-note').textContent='No se pudo guardar: '+e.message;
    alert('No se pudo guardar: '+e.message);
  }
});

/* ===== Seguridad ===== */
function decodeJwt(token){
  try{
    const [,p]=token.split('.');
    return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
  }catch{
    return null;
  }
}
function updateSecurityUI(){
  const box=qs('#sec-token-box');
  const jwt = localStorage.getItem('fitlife.jwt') || '';
  if(!jwt){ box.textContent='No hay token guardado'; return }
  const p=decodeJwt(jwt); let info=`Token: ${jwt.slice(0,16)}… (${jwt.length} chars)`; if(p?.exp){ const dt=new Date(p.exp*1000); info+=` | expira: ${dt.toLocaleString()}` }
  box.textContent=info;
}
qs('#sec-clear').addEventListener('click', ()=>{ localStorage.removeItem('fitlife.jwt'); updateSecurityUI(); });
qs('#sec-probe').addEventListener('click', async()=>{
  const out=qs('#sec-probe-out');
  try{ const ex=await api('/api/exercises'); out.textContent='OK: '+(Array.isArray(ex)? `${ex.length} ejercicios`:'respuesta recibida'); }
  catch(e){ out.textContent='Error: '+e.message }
});

/* ===== Tabs + Init ===== */
qs('#tabs').addEventListener('click', e=>{
  if(e.target.classList.contains('tab')) setView(e.target.dataset.view);
});
(async function init(){
  await Promise.all([ loadKPIs(), loadExercises(), loadRoutines(), loadUsers().catch(()=>{}), loadCoaches().catch(()=>{}) ]);
  updateSecurityUI();
})();
document.getElementById('year').textContent = new Date().getFullYear();