const KEY="runs-counter-v1";
const labels={freeWin:"FREE WIN",goodWin:"GOOD WIN",luckyWin:"LUCKY WIN",badLuckLoose:"BAD LUCK LOOSE",hardLoose:"HARD LOOSE",freeLoose:"FREE LOOSE"};
const typeClass={freeWin:"win",goodWin:"win",luckyWin:"lucky",badLuckLoose:"loss",hardLoose:"loss",freeLoose:"loss"};
let state=JSON.parse(localStorage.getItem(KEY)||'{"runs":[],"active":null}');
let deferredPrompt=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dateLabel(iso){return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(iso))}
function nextNumber(){return state.runs.reduce((m,r)=>Math.max(m,r.number||0),0)+1}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden")}
function stats(run){const parts=run.parts||[];let wins=parts.filter(p=>typeClass[p.result]==="win"||typeClass[p.result]==="lucky").length;let losses=parts.length-wins;return {parts,wins,losses}}
function renderHome(){
  const a=$("activeCard");
  if(state.active){let s=stats(state.active);a.innerHTML=`<div class="active-card"><div class="active-label">Run en cours</div><div class="active-run"><strong>Run #${state.active.number}</strong><span class="pill">${s.parts.length} partie${s.parts.length>1?"s":""}</span></div></div>`}
  else a.innerHTML="";
  const h=$("history");
  if(!state.runs.length){h.innerHTML=`<div class="empty">Aucun Run terminé pour le moment.</div>`;return}
  h.innerHTML=state.runs.slice().reverse().map(r=>{let s=stats(r);return `<div class="history-card"><button data-open="${r.id}"><strong>Run #${r.number}</strong><div class="date">${dateLabel(r.startedAt)}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span></div></div>`}).join("");
  h.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>detail(b.dataset.open));
}
function renderRun(){
  const r=state.active;if(!r)return;
  const s=stats(r);$("runNumber").textContent=`Run #${r.number}`;$("partCount").textContent=s.parts.length;
  $("partCount").nextElementSibling.textContent=`partie${s.parts.length>1?"s":""}`;
  $("partCount").parentElement.nextElementSibling.innerHTML=`<span class="win">${s.wins} wins</span><span class="loss">${s.losses} losses</span>`;
  $("parts").innerHTML=s.parts.length?s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}</span></div>`).join(""):`<div class="empty">Aucune partie. Ajoute ta première partie.</div>`;
}
function startRun(){if(state.active && !confirm("Un Run est déjà en cours. Le remplacer ?"))return;state.active={id:crypto.randomUUID(),number:nextNumber(),startedAt:new Date().toISOString(),parts:[]};save();renderRun();show("runView")}
function finishRun(){if(!state.active)return;if(!state.active.parts.length&&!confirm("Ce Run ne contient aucune partie. Le terminer quand même ?"))return;state.active.finishedAt=new Date().toISOString();state.runs.push(state.active);state.active=null;save();renderHome();show("homeView")}
function addPart(result){state.active.parts.push({result,at:new Date().toISOString()});save();renderRun();show("runView")}
function detail(id){const r=state.runs.find(x=>x.id===id);if(!r)return;const s=stats(r);$("detailTitle").textContent=`Run #${r.number}`;let counts={};s.parts.forEach(p=>counts[p.result]=(counts[p.result]||0)+1);let winRate=s.parts.length?Math.round(s.wins/s.parts.length*100):0;
$("detailContent").innerHTML=`<div class="stat-card"><div class="stat-title">Résultat</div><div class="stat-value">${s.wins} W · ${s.losses} L</div><div class="bar"><i style="width:${winRate}%;background:#10b981"></i></div><div style="margin-top:8px;font-weight:700">${winRate}% de wins · ${s.parts.length} parties</div></div><div class="stat-card"><div class="stat-title">Répartition</div><div class="legend">${Object.keys(labels).map(k=>`<div><span style="background:${k.includes("Win")&&k!=="luckyWin"?"#10b981":k==="luckyWin"?"#f59e0b":"#ef4444"}"></span>${labels[k]} · ${counts[k]||0}</div>`).join("")}</div></div><div class="section-head"><h2>Parties</h2></div><div class="detail-list">${s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}</span></div>`).join("")}</div>`;
show("detailView")}
$("newRunBtn").onclick=startRun;$("addPartBtn").onclick=()=>{if(state.active){$("partTitle").textContent=`Partie #${state.active.parts.length+1}`;show("partView")}};$("finishBtn").onclick=finishRun;$("backBtn").onclick=()=>{renderHome();show("homeView")};$("cancelPartBtn").onclick=()=>show("runView");$("detailBackBtn").onclick=()=>{renderHome();show("homeView")};
document.querySelectorAll(".result").forEach(b=>b.onclick=()=>addPart(b.dataset.result));
$("clearBtn").onclick=()=>{if(confirm("Effacer tout l'historique ?")){state.runs=[];save();renderHome()}};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
renderHome();
