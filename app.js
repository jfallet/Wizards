const KEY="wizards-run-v2";
const labels={freeWin:"FREE WIN",goodWin:"GOOD WIN",luckyWin:"LUCKY WIN",badLuckLoose:"BAD LUCK LOOSE",hardLoose:"HARD LOOSE",freeLoose:"FREE LOOSE"};
const typeClass={freeWin:"win",goodWin:"win",luckyWin:"lucky",badLuckLoose:"loss",hardLoose:"loss",freeLoose:"loss"};
let state=JSON.parse(localStorage.getItem(KEY)||'{"runs":[],"active":null}'); let selectedRank="Platine"; let deferredPrompt=null;
const $=id=>document.getElementById(id); function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dateLabel(iso){const d=new Date(iso);const days=["D","L","M","M","J","V","S"];return `${days[d.getDay()]}.${d.getDate()}/${d.getMonth()+1} ${d.getHours()}h`;}
function nextNumber(){return state.runs.reduce((m,r)=>Math.max(m,r.number||0),0)+1}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden")}
function stats(run){const parts=run.parts||[];let wins=parts.filter(p=>typeClass[p.result]==="win"||typeClass[p.result]==="lucky").length;return {parts,wins,losses:parts.length-wins}}
function allParts(){const parts=[];state.runs.forEach(r=>(r.parts||[]).forEach(p=>parts.push(p)));if(state.active)(state.active.parts||[]).forEach(p=>parts.push(p));return parts}
function winRateFor(parts){const wins=parts.filter(p=>typeClass[p.result]==="win"||typeClass[p.result]==="lucky").length;return {wins,total:parts.length,rate:parts.length?Math.round(wins/parts.length*100):0}}
function statRow(label,parts){const s=winRateFor(parts);return `<div class="global-stat-row"><div><strong>${label}</strong><small>${s.wins} victoire${s.wins>1?"s":""} · ${s.total} partie${s.total>1?"s":""}</small></div><b>${s.rate}%</b></div>`}
function renderGlobalStats(){
  const filter=document.querySelector('input[name="globalFilter"]:checked')?.value||"all";
  let parts=allParts();
  if(filter==="meta") parts=parts.filter(p=>p.opponent?p.opponent==="meta":p.opponentMeta!==false);
  const play=parts.filter(p=>p.mode!=="draw"), draw=parts.filter(p=>p.mode==="draw");
  const death=parts.filter(p=>(p.mana||"ok")==="death"), ok=parts.filter(p=>(p.mana||"ok")==="ok"), flood=parts.filter(p=>(p.mana||"ok")==="flood");
  const t3yes=parts.filter(p=>p.landT3!==false), t3no=parts.filter(p=>p.landT3===false);
  const overall=winRateFor(parts);
  $("globalStats").innerHTML=`<div class="global-summary"><div><span>Win rate</span><strong>${overall.rate}%</strong><small>${overall.wins} W · ${overall.total-overall.wins} L · ${overall.total} parties</small></div></div>
  <div class="global-group"><div class="stat-title">Play / Draw</div>${statRow("PLAY",play)}${statRow("DRAW",draw)}</div>
  <div class="global-group"><div class="stat-title">Mana</div>${statRow("DEATH",death)}${statRow("OK",ok)}${statRow("FLOOD",flood)}</div>
  <div class="global-group"><div class="stat-title">3 lands au tour 3</div>${statRow("OUI",t3yes)}${statRow("NON",t3no)}</div>`;
}
function renderHome(){
  const a=$("activeCard");
  if(state.active){
    const s=stats(state.active);
    a.innerHTML=`<div class="active-card active-card-btn"><div class="active-label">Run en cours</div><div class="active-run"><strong>Run #${state.active.number}</strong><span class="pill">${state.active.rank} · ${s.parts.length} partie${s.parts.length>1?"s":""}</span></div><div class="date">${dateLabel(state.active.startedAt)} · ${state.active.deck||"Deck non renseigné"}</div><div class="resume-hint">Toucher pour poursuivre la Run →</div></div>`;
    a.querySelector(".active-card").onclick=openActiveRun;
  }else a.innerHTML="";
  const h=$("history");
  let cards=[];
  if(state.active){
    const r=state.active,s=stats(r);
    cards.push(`<div class="history-card"><button data-resume-history="1"><strong>Run #${r.number} · ${r.rank}</strong><div class="date">${dateLabel(r.startedAt)} · ${r.deck||"Deck non renseigné"}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span><div class="date" style="text-align:right">EN COURS</div></div></div>`);
  }
  cards.push(...state.runs.slice().reverse().map(r=>{const s=stats(r);return `<div class="history-card"><button data-open="${r.id}"><strong>Run #${r.number} · ${r.rank}</strong><div class="date">${dateLabel(r.startedAt)} · ${r.deck||"Deck non renseigné"}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span></div></div>`}));
  h.innerHTML=cards.length?cards.join(""):"<div class=\"empty\">Aucun Run pour le moment.</div>";
  h.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>detail(b.dataset.open));
  h.querySelectorAll("[data-resume-history]").forEach(b=>b.onclick=openActiveRun);
  renderGlobalStats();
}
function partMetaText(p){const mode=p.mode==="draw"?"DRAW":"PLAY";const opponent=p.opponent?p.opponent.toUpperCase():(p.opponentMeta===false?"ATYPIQUE":"META");const mana={death:"DEATH",ok:"OK",flood:"FLOOD"}[p.mana]||"OK";const t3=p.landT3===false?"3L T3 NON":"3L T3 OUI";return `${mode} · ${opponent} · ${mana} · ${t3}`}
function renderRun(){const r=state.active;if(!r)return;const s=stats(r);$("runNumber").textContent=`Run #${r.number}`;$("runMeta").innerHTML=`<div class="run-info"><span class="rank-badge">${r.rank}</span><span>${r.deck||"Deck non renseigné"}</span></div>`;$("partCount").textContent=s.parts.length;$("partCount").nextElementSibling.textContent=`partie${s.parts.length>1?"s":""}`;$("wins").textContent=`${s.wins} wins`;$("losses").textContent=`${s.losses} losses`;$("parts").innerHTML=s.parts.length?s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${partMetaText(p)}</small></span></div>`).join(""):'<div class="empty">Aucune partie. Ajoute ta première partie.</div>'}
function openActiveRun(){if(!state.active)return;renderRun();show("runView")}
function openStart(){if(state.active){openActiveRun();return}selectedRank="Platine";document.querySelectorAll(".rank").forEach(b=>b.classList.toggle("selected",b.dataset.rank===selectedRank));$("deckDesc").value="";show("startView")}
function startRun(){state.active={id:crypto.randomUUID(),number:nextNumber(),rank:selectedRank,deck:$("deckDesc").value.trim(),startedAt:new Date().toISOString(),parts:[]};save();renderRun();show("runView")}
function finishRun(){if(!state.active)return;if(!state.active.parts.length&&!confirm("Ce Run ne contient aucune partie. Le terminer quand même ?"))return;state.active.finishedAt=new Date().toISOString();state.runs.push(state.active);state.active=null;save();renderHome();show("homeView")}
function selectedValue(name,fallback){const el=document.querySelector(`input[name="${name}"]:checked`);return el?el.value:fallback}
function resetPartForm(){document.querySelector('input[name="mode"][value="play"]').checked=true;document.querySelector('input[name="opponent"][value="meta"]').checked=true;document.querySelector('input[name="mana"][value="ok"]').checked=true;document.querySelector('input[name="landT3"][value="yes"]').checked=true}
function addPart(result){const mode=selectedValue("mode","play");const opponent=selectedValue("opponent","meta");const mana=selectedValue("mana","ok");const landT3=selectedValue("landT3","yes")==="yes";state.active.parts.push({result,mode,opponent,opponentMeta:opponent==="meta",mana,landT3,at:new Date().toISOString()});save();renderRun();show("runView")}
function detail(id){const r=state.runs.find(x=>x.id===id);if(!r)return;const s=stats(r);$("detailTitle").textContent=`Run #${r.number}`;let counts={};s.parts.forEach(p=>counts[p.result]=(counts[p.result]||0)+1);let meta=s.parts.filter(p=>p.opponent?p.opponent==="meta":p.opponentMeta!==false).length, atyp=s.parts.length-meta, winRate=s.parts.length?Math.round(s.wins/s.parts.length*100):0;let manaCounts={death:0,ok:0,flood:0},t3Yes=0,t3No=0;s.parts.forEach(p=>{if(p.mana&&manaCounts[p.mana]!==undefined)manaCounts[p.mana]++;if(p.landT3===false)t3No++;else t3Yes++});$("detailContent").innerHTML=`<div class="stat-card"><div class="run-info"><span class="rank-badge">${r.rank}</span><span>${r.deck||"Deck non renseigné"}</span></div></div><div class="stat-card"><div class="stat-title">Résultat</div><div class="stat-value">${s.wins} W · ${s.losses} L</div><div class="bar"><i style="width:${winRate}%;background:#10b981"></i></div><div style="margin-top:8px;font-weight:700">${winRate}% de wins · ${s.parts.length} parties</div></div><div class="stat-card"><div class="stat-title">Adversaires</div><div class="opponent-stats"><span>● Meta · ${meta}</span><span>● Atypique · ${atyp}</span></div></div><div class="stat-card"><div class="stat-title">Mana</div><div class="opponent-stats"><span>Death · ${manaCounts.death}</span><span>OK · ${manaCounts.ok}</span><span>Flood · ${manaCounts.flood}</span></div><div class="opponent-stats"><span>3 lands T3 · ${t3Yes}</span><span>Pas 3 lands T3 · ${t3No}</span></div></div><div class="stat-card"><div class="stat-title">Répartition</div><div class="legend">${Object.keys(labels).map(k=>`<div><span style="background:${k.includes("Win")&&k!=="luckyWin"?"#10b981":k==="luckyWin"?"#2563eb":"#ef4444"}"></span>${labels[k]} · ${counts[k]||0}</div>`).join("")}</div></div><div class="section-head"><h2>Parties</h2></div><div class="detail-list">${s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${partMetaText(p)}</small></span></div>`).join("")}</div>`;show("detailView")}
$("newRunBtn").onclick=openStart;$("confirmStartBtn").onclick=startRun;$("addPartBtn").onclick=()=>{if(state.active){$("partTitle").textContent=`Partie #${state.active.parts.length+1}`;resetPartForm();show("partView")}};$("finishBtn").onclick=finishRun;$("backBtn").onclick=()=>{save();renderHome();show("homeView")};$("cancelStartBtn").onclick=()=>show("homeView");$("cancelPartBtn").onclick=()=>show("runView");$("detailBackBtn").onclick=()=>{renderHome();show("homeView")};document.querySelectorAll(".result").forEach(b=>b.onclick=()=>addPart(b.dataset.result));document.querySelectorAll(".rank").forEach(b=>b.onclick=()=>{selectedRank=b.dataset.rank;document.querySelectorAll(".rank").forEach(x=>x.classList.toggle("selected",x===b))});$("clearBtn").onclick=()=>{if(confirm("Effacer tout l'historique ?")){state.runs=[];save();renderHome()}};window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")}};if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));document.querySelectorAll('input[name="globalFilter"]').forEach(i=>i.onchange=renderGlobalStats);renderHome();
