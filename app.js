const KEY="wizards-run-v3";
const labels={freeWin:"FREE WIN",goodWin:"GOOD WIN",luckyWin:"LUCKY WIN",badLuckLoose:"BAD LUCK LOOSE",hardLoose:"HARD LOOSE",freeLoose:"FREE LOOSE"};
const typeClass={freeWin:"win",goodWin:"win",luckyWin:"lucky",badLuckLoose:"loss",hardLoose:"loss",freeLoose:"loss"};
let state=JSON.parse(localStorage.getItem(KEY)||'{"runs":[],"active":null}');
let selectedRank="Platine";
let deferredPrompt=null;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateLabel(iso){const d=new Date(iso),dd=String(d.getDate()).padStart(2,"0"),mm=String(d.getMonth()+1).padStart(2,"0"),hh=String(d.getHours()).padStart(2,"0");return `${dd}/${mm} ${hh}h`}
function nextNumber(){return Math.max(0,...state.runs.map(r=>r.number||0),state.active?.number||0)+1}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden")}
function isWin(p){return typeClass[p.result]==="win"||typeClass[p.result]==="lucky"}
function stats(run){const parts=run?.parts||[];const wins=parts.filter(isWin).length;return {parts,wins,losses:parts.length-wins}}
function globalStats(){const runs=[...state.runs];if(state.active)runs.push(state.active);const parts=runs.flatMap(r=>r.parts||[]);const calc=mode=>{const a=parts.filter(p=>(p.mode||"play")===mode),w=a.filter(isWin).length;return {total:a.length,wins:w,rate:a.length?Math.round(w/a.length*100):0}};return {play:calc("play"),draw:calc("draw")}}
function runSummary(r){const s=stats(r);return `${dateLabel(r.startedAt)} · ${r.rank||""}${r.deck?` · ${escapeHtml(r.deck)}`:""} · ${s.wins} W / ${s.losses} L`}
function renderHome(){
  const gs=globalStats();
  $("globalStats").innerHTML=`<div class="global-stat"><div class="stat-title">PLAY</div><div class="stat-value">${gs.play.rate}%</div><div class="stat-sub">${gs.play.wins}/${gs.play.total} wins</div></div><div class="global-stat"><div class="stat-title">DRAW</div><div class="stat-value">${gs.draw.rate}%</div><div class="stat-sub">${gs.draw.wins}/${gs.draw.total} wins</div></div>`;
  $("newRunBtn").textContent=state.active?"▶ Poursuivre la Run":"＋ Démarrer un Run";
  const h=$("history");
  const activeHtml=state.active?(()=>{const s=stats(state.active);return `<div class="history-card active-history"><button id="activeHistoryBtn"><strong>Run #${state.active.number} · EN COURS</strong><div class="date">${runSummary(state.active)}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span></div></div>`})():"";
  const finished=state.runs.slice().reverse().map(r=>{const s=stats(r);return `<div class="history-card"><button data-open="${r.id}"><strong>Run #${r.number} · ${escapeHtml(r.rank||"")}</strong><div class="date">${runSummary(r)}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span></div></div>`}).join("");
  h.innerHTML=activeHtml+finished+(activeHtml||finished?"":"<div class="empty">Aucun Run pour le moment.</div>");
  if(state.active) $("activeHistoryBtn").onclick=resumeActive;
  h.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>detail(b.dataset.open));
}
function resumeActive(){if(!state.active)return;renderRun();show("runView")}
function renderRun(){const r=state.active;if(!r)return;const s=stats(r);$("runNumber").textContent=`Run #${r.number}`;$("runMeta").innerHTML=`<div class="run-info"><span class="rank-badge">${escapeHtml(r.rank||"")}</span><span>${escapeHtml(r.deck||"Deck non renseigné")}</span></div>`;$("partCount").textContent=s.parts.length;$("partCount").nextElementSibling.textContent=`partie${s.parts.length>1?"s":""}`;$("wins").textContent=`${s.wins} wins`;$("losses").textContent=`${s.losses} losses`;$("parts").innerHTML=s.parts.length?s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${(p.mode||"play").toUpperCase()} · ${p.opponentMeta?"META":"ATYPIQUE"}${p.mana?` · ${p.mana.toUpperCase()}`:""}</small></span></div>`).join(""):'<div class="empty">Aucune partie. Ajoute ta première partie.</div>'}
function openStart(){if(state.active){resumeActive();return}selectedRank=state.runs.at(-1)?.rank||"Platine";document.querySelectorAll(".rank").forEach(b=>b.classList.toggle("selected",b.dataset.rank===selectedRank));$("deckDesc").value=state.runs.at(-1)?.deck||"";show("startView")}
function startRun(){if(state.active){resumeActive();return}state.active={id:crypto.randomUUID(),number:nextNumber(),rank:selectedRank,deck:$("deckDesc").value.trim(),startedAt:new Date().toISOString(),parts:[]};save();renderHome();renderRun();show("runView")}
function finishRun(){if(!state.active)return;if(!state.active.parts.length&&!confirm("Ce Run ne contient aucune partie. Le terminer quand même ?"))return;state.active.finishedAt=new Date().toISOString();state.runs.push(state.active);state.active=null;save();renderHome();show("homeView")}
function addPart(result){const mode=$("modeDraw").checked?"draw":"play";const opponentMeta=$("opponentMeta").checked;const mana=document.querySelector('input[name="mana"]:checked')?.value||"";state.active.parts.push({result,mode,opponentMeta,mana,at:new Date().toISOString()});save();renderHome();renderRun();show("runView")}
function detail(id){const r=state.runs.find(x=>x.id===id);if(!r)return;const s=stats(r);const counts={};s.parts.forEach(p=>counts[p.result]=(counts[p.result]||0)+1);const meta=s.parts.filter(p=>p.opponentMeta).length;const atyp=s.parts.length-meta;const winRate=s.parts.length?Math.round(s.wins/s.parts.length*100):0;$("detailTitle").textContent=`Run #${r.number}`;$("detailContent").innerHTML=`<div class="stat-card"><div class="run-info"><span class="rank-badge">${escapeHtml(r.rank||"")}</span><span>${escapeHtml(r.deck||"Deck non renseigné")}</span></div></div><div class="stat-card"><div class="stat-title">Résultat</div><div class="stat-value">${s.wins} W · ${s.losses} L</div><div class="bar"><i style="width:${winRate}%;background:#10b981"></i></div><div style="margin-top:8px;font-weight:700">${winRate}% de wins · ${s.parts.length} parties</div></div><div class="stat-card"><div class="stat-title">Adversaires</div><div class="opponent-stats"><span>● Meta · ${meta}</span><span>● Atypique · ${atyp}</span></div></div><div class="stat-card"><div class="stat-title">Répartition</div><div class="legend">${Object.keys(labels).map(k=>`<div><span style="background:${k==="luckyWin"?"#2563eb":typeClass[k]==="win"?"#10b981":k==="badLuckLoose"?"#f97316":"#ef4444"}"></span>${labels[k]} · ${counts[k]||0}</div>`).join("")}</div></div><div class="section-head"><h2>Parties</h2></div><div class="detail-list">${s.parts.map((p,i)=>`<div class="part-row"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${(p.mode||"play").toUpperCase()} · ${p.opponentMeta?"META":"ATYPIQUE"}${p.mana?` · ${p.mana.toUpperCase()}`:""}</small></span></div>`).join("")}</div>`;show("detailView")}
$("newRunBtn").onclick=openStart;
$("confirmStartBtn").onclick=startRun;
$("addPartBtn").onclick=()=>{if(state.active){$("partTitle").textContent=`Partie #${state.active.parts.length+1}`;$("opponentMeta").checked=false;$("modeDraw").checked=false;document.querySelectorAll('input[name="mana"]').forEach(x=>x.checked=false);show("partView")}};
$("finishBtn").onclick=finishRun;
$("backBtn").onclick=()=>{save();renderHome();show("homeView")};
$("cancelStartBtn").onclick=()=>show("homeView");
$("cancelPartBtn").onclick=()=>show("runView");
$("detailBackBtn").onclick=()=>{renderHome();show("homeView")};
document.querySelectorAll(".result").forEach(b=>b.onclick=()=>addPart(b.dataset.result));
document.querySelectorAll(".rank").forEach(b=>b.onclick=()=>{selectedRank=b.dataset.rank;document.querySelectorAll(".rank").forEach(x=>x.classList.toggle("selected",x===b))});
$("clearBtn").onclick=()=>{if(confirm("Effacer tout l'historique ?")){state.runs=[];save();renderHome()}};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
renderHome();
