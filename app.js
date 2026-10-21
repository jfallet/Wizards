const KEY="wizards-run-v2";
const labels={freeWin:"FREE WIN",goodWin:"GOOD WIN",luckyWin:"LUCKY WIN",badLuckLoose:"BAD LUCK LOOSE",hardLoose:"HARD LOOSE",freeLoose:"FREE LOOSE"};
const typeClass={freeWin:"win",goodWin:"win",luckyWin:"lucky",badLuckLoose:"loss",hardLoose:"loss",freeLoose:"loss"};
let state=JSON.parse(localStorage.getItem(KEY)||'{"runs":[],"active":null}'); state.decks=state.decks||[]; let selectedRank="Platine"; let deferredPrompt=null; let editingPartIndex=null; let selectedStatsDeck="__all__";
const $=id=>document.getElementById(id); function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function dateLabel(iso){const d=new Date(iso);const days=["D","L","M","M","J","V","S"];return `${days[d.getDay()]}.${d.getDate()}/${d.getMonth()+1} ${d.getHours()}h`;}
function nextNumber(){return state.runs.reduce((m,r)=>Math.max(m,r.number||0),0)+1}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(id).classList.remove("hidden")}
function stats(run){const parts=run.parts||[];let wins=parts.filter(p=>typeClass[p.result]==="win"||typeClass[p.result]==="lucky").length;return {parts,wins,losses:parts.length-wins}}
function allParts(deckFilter="__all__"){const parts=[];state.runs.forEach(r=>{if(deckFilter==="__all__"||r.deck===deckFilter)(r.parts||[]).forEach(p=>parts.push(p))});if(state.active&&(deckFilter==="__all__"||state.active.deck===deckFilter))(state.active.parts||[]).forEach(p=>parts.push(p));return parts}
function winRateFor(parts){const wins=parts.filter(p=>typeClass[p.result]==="win"||typeClass[p.result]==="lucky").length;return {wins,total:parts.length,rate:parts.length?Math.round(wins/parts.length*100):0}}
function statRow(label,parts){const s=winRateFor(parts);return `<div class="global-stat-row"><div><strong>${label}</strong><small>${s.wins} victoire${s.wins>1?"s":""} · ${s.total} partie${s.total>1?"s":""}</small></div><b>${s.rate}%</b></div>`}
function distributionGroup(title,items,valueMode="none",winRateItems=[],edgeLabels=null,nested=false){
  const total=items.reduce((sum,item)=>sum+item.count,0);
  const showValues=valueMode!=="none";
  const segments=items.filter(item=>item.count>0).map(item=>{const share=total?item.count/total*100:0;const value=valueMode==="percent"?`${Math.round(share)}`:item.count;return `<i class="distribution-segment${showValues?" distribution-segment-values":""}" style="width:${share}%;background:${item.color}" title="${item.label} : ${item.count} partie(s) (${Math.round(share)} % des parties)" aria-label="${item.label} : ${item.count} partie(s)">${showValues?`<span>${value}</span>`:""}</i>`}).join("");
  const edgeMarkup=edgeLabels?`<div class="distribution-edge-labels"><span>${edgeLabels.left||""}</span><span>${edgeLabels.right||""}</span></div>`:"";
  const winRates=winRateItems.length?`<div class="distribution-winrates">${winRateItems.map(item=>`<div><span>${item.label}</span><strong>${winRateFor(item.parts).rate}%</strong></div>`).join("")}</div>`:"";
  const wrapperClass=nested?"distribution-subgroup":"global-group";
  const titleMarkup=title?`<div class="${nested?"distribution-subtitle":"stat-title"}">${title}</div>`:"";
  return `<div class="${wrapperClass}">${titleMarkup}<div class="distribution-bar-wrap"><div class="distribution-bar${showValues?" distribution-bar-values":""}" role="img" aria-label="${title||"Répartition"} : ${items.map(item=>`${item.label} ${item.count}`).join(", ")}">${segments}</div>${edgeMarkup}</div>${winRates}</div>`;
}
function renderGlobalStats(){
  const all=allParts();
  const deckNames=[...new Set([...state.runs.map(r=>r.deck),...(state.active?[state.active.deck]:[])].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(selectedStatsDeck!=="__all__"&&!deckNames.includes(selectedStatsDeck))selectedStatsDeck="__all__";
  const parts=selectedStatsDeck==="__all__"?all:allParts(selectedStatsDeck);
  const playParts=parts.filter(p=>p.mode!=="draw"), drawParts=parts.filter(p=>p.mode==="draw");
  const play=playParts.length, draw=drawParts.length, totalMode=play+draw;
  const playPct=totalMode?Math.round(play/totalMode*100):0, drawPct=totalMode?Math.round(draw/totalMode*100):0;
  const death=parts.filter(p=>(p.mana||"ok")==="death").length, ok=parts.filter(p=>(p.mana||"ok")==="ok").length, flood=parts.filter(p=>(p.mana||"ok")==="flood").length;
  const t3yesParts=parts.filter(p=>p.landT3!==false), t3noParts=parts.filter(p=>p.landT3===false);
  const t3yes=t3yesParts.length, t3no=t3noParts.length, totalT3=t3yes+t3no, t3yesPct=totalT3?Math.round(t3yes/totalT3*100):0, t3noPct=totalT3?Math.round(t3no/totalT3*100):0;
  const overall=winRateFor(parts);
  const resultColors={freeLoose:"#7f1d1d",hardLoose:"#dc2626",badLuckLoose:"#f97316",luckyWin:"#2563eb",goodWin:"#16a34a",freeWin:"#166534"};
  const resultKeys=["freeLoose","hardLoose","badLuckLoose","luckyWin","goodWin","freeWin"];
  const resultItems=resultKeys.map(key=>({label:labels[key],count:parts.filter(p=>p.result===key).length,color:resultColors[key]}));
  const resultItemsFor=xs=>resultKeys.map(key=>({label:labels[key],count:xs.filter(p=>p.result===key).length,color:resultColors[key]}));
  const manaOkParts=parts.filter(p=>(p.mana||"ok")==="ok"), manaFloodParts=parts.filter(p=>(p.mana||"ok")==="flood");
  const colorGroups={};
  parts.forEach(p=>{const key=colorCombo(p);(colorGroups[key]||(colorGroups[key]=[])).push(p)});
  const totalColorParts=parts.length;
  const visibleColors=Object.entries(colorGroups).filter(([key,ps])=>ps.length/Math.max(1,totalColorParts)>0.06).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]));
  const otherColorEntries=Object.entries(colorGroups).filter(([key,ps])=>ps.length/Math.max(1,totalColorParts)<=0.06);
  const otherColorParts=otherColorEntries.flatMap(([key,ps])=>ps);
  const allColorGroups={}; all.forEach(p=>{const key=colorCombo(p);(allColorGroups[key]||(allColorGroups[key]=[])).push(p)});
  const colorRows=visibleColors.map(([key,ps])=>{const fieldCount=(allColorGroups[key]||[]).length;const fieldPct=all.length?Math.round(fieldCount/all.length*100):0;return `<div class="global-stat-row"><div><strong>${key} ${colorSymbols(key.split("").filter(c=>["R","U","B","W","G"].includes(c)))}</strong><small>${winRateFor(ps).wins} victoire(s) · ${ps.length} partie(s)</small></div><b>${winRateFor(ps).rate}% <small class="field-share">(${fieldPct}%)</small></b></div>`}).join("");
  const othersRow=otherColorParts.length?`<div class="global-stat-row"><div><strong>Others</strong><small>Combinaisons ne dépassant pas 6 % · ${otherColorParts.length} partie(s)</small></div><b>${winRateFor(otherColorParts).rate}% <small class="field-share">(${all.length?Math.round(otherColorEntries.reduce((n,[key])=>n+(allColorGroups[key]||[]).length,0)/all.length*100):0}%)</small></b></div>`:"";
  const archetypeGroups={};
  parts.forEach(p=>[...new Set(p.archetypes||[])].forEach(archetype=>{(archetypeGroups[archetype]||(archetypeGroups[archetype]=[])).push(p)}));
  const archetypeRows=Object.entries(archetypeGroups).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0])).map(([archetype,ps])=>`<div class="global-stat-row"><div><strong>${archetype}</strong><small>${winRateFor(ps).wins} victoire(s) · ${ps.length} partie(s)</small></div><b>${winRateFor(ps).rate}%</b></div>`).join("");
  const deckOptions=`<option value="__all__" ${selectedStatsDeck==="__all__"?"selected":""}>Toutes les données</option>${deckNames.map(name=>`<option value="${name.replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" ${selectedStatsDeck===name?"selected":""}>${name.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</option>`).join("")}`;
  $("globalStats").innerHTML=`<label class="stats-filter-label" for="statsDeckFilter">Filtrer par deck</label><select id="statsDeckFilter" class="deck-select stats-deck-filter">${deckOptions}</select>
  <div class="global-summary"><div><span>WR global</span><strong>${overall.rate}%</strong><small>${overall.wins} W · ${overall.total-overall.wins} L · ${overall.total} parties</small></div></div>
  ${distributionGroup("Répartition des résultats",resultItems,"percent")}
  <div class="global-group play-draw-group">
    ${distributionGroup("",[{label:"PLAY",count:play,color:"#374151"},{label:"DRAW",count:draw,color:"#9ca3af"}],"none",[{label:"WR Play",parts:playParts},{label:"WR Draw",parts:drawParts}],{left:`PLAY ${playPct}`,right:`DRAW ${drawPct}`},true)}
    ${distributionGroup("",resultItemsFor(playParts),"percent",[],null,true)}
    ${distributionGroup("",resultItemsFor(drawParts),"percent",[],null,true)}
  </div>
  ${distributionGroup("",[{label:"DEATH",count:death,color:"#111827"},{label:"OK",count:ok,color:"#16a34a"},{label:"FLOOD",count:flood,color:"#2563eb"}],"percent",[{label:"WR Mana OK",parts:manaOkParts},{label:"WR Mana Flood",parts:manaFloodParts}])}
  ${distributionGroup("",[{label:"OUI",count:t3yes,color:"#16a34a"},{label:"NON",count:t3no,color:"#dc2626"}],"none",[{label:"WR 3 lands OK",parts:t3yesParts},{label:"WR 3 lands NON",parts:t3noParts}],{left:`${t3yesPct}`,right:`${t3noPct}`})}
  <div class="global-group"><div class="stat-title">WR par combinaison de couleurs adverse</div>${colorRows}${othersRow||""}${!colorRows&&!othersRow?"<div class=\"empty\">Aucune partie à afficher.</div>":""}</div>
  <div class="global-group"><div class="stat-title">WR par archétype adverse</div>${archetypeRows||"<div class=\"empty\">Aucune partie avec un archétype renseigné.</div>"}</div>`;
  $("statsDeckFilter").onchange=e=>{selectedStatsDeck=e.target.value;renderGlobalStats()};
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
  cards.push(...state.runs.slice().reverse().map(r=>{const s=stats(r);const title=r.isArchive?`Run archive <span class="archive-badge">ARCHIVE</span>`:`Run #${r.number} · ${r.rank}`;return `<div class="history-card"><button data-open="${r.id}"><strong>${title}</strong><div class="date">${dateLabel(r.startedAt)} · ${r.deck||"Deck non renseigné"}</div></button><div class="mini-score"><span class="win">${s.wins} W</span> · <span class="loss">${s.losses} L</span></div></div>`}));
  h.innerHTML=cards.length?cards.join(""):"<div class=\"empty\">Aucun Run pour le moment.</div>";
  h.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>detail(b.dataset.open));
  h.querySelectorAll("[data-resume-history]").forEach(b=>b.onclick=openActiveRun);
  renderGlobalStats();
}
function selectedValues(name){return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(el=>el.value)}
function canonicalColors(colors){const order=["W","U","B","R","G"];return [...new Set(colors||[])].sort((a,b)=>order.indexOf(a)-order.indexOf(b))}
function colorCombo(p){const c=canonicalColors(p.colors);return c.length?c.join(""):"Non renseigné"}
function colorSymbols(colors){const symbols={R:"🔥",U:"💧",B:"☠",W:"☀",G:"🌳"};return canonicalColors(colors).map(c=>`<span class="mana-symbol mana-${c}" title="${c}">${symbols[c]}</span>`).join("")||"—"}
function renderDeckOptions(selected=""){const el=$("deckSelect");el.innerHTML=state.decks.length?state.decks.map((d,i)=>`<option value="${i}" ${String(i)===String(selected)?"selected":""}>${d.name} · ${canonicalColors(d.colors).join("")||"Sans couleur"}</option>`).join(""):`<option value="">Aucun deck — ajoute-en un ci-dessous</option>`;}
function addDeck(){const name=$("newDeckName").value.trim();if(!name){alert("Donne un nom à ce deck.");return}const colors=canonicalColors([...document.querySelectorAll('input[name="myDeckColor"]:checked')].map(x=>x.value));const existing=state.decks.findIndex(d=>d.name.toLowerCase()===name.toLowerCase());const deck={name,colors};if(existing>=0){state.decks[existing]=deck;renderDeckOptions(existing)}else{state.decks.push(deck);renderDeckOptions(state.decks.length-1)}save();$("newDeckName").value="";document.querySelectorAll('input[name="myDeckColor"]').forEach(x=>x.checked=false)}
function partMetaText(p){const mode=p.mode==="draw"?"DRAW":"PLAY";const archetypes=(p.archetypes||[]).join(" / ")||"Archétype non renseigné";const colors=`${canonicalColors(p.colors).join("")} ${colorSymbols(p.colors)}`;const mana={death:"DEATH",ok:"OK",flood:"FLOOD"}[p.mana]||"OK";const t3=p.landT3===false?"3L T3 NON":"3L T3 OUI";return `${mode} · ${archetypes} · ${colors} · ${mana} · ${t3}`}

function renderRun(){const r=state.active;if(!r)return;const s=stats(r);$("runNumber").textContent=`Run #${r.number}`;$("runMeta").innerHTML=`<div class="run-info"><span class="rank-badge">${r.rank}</span><span>${r.deck||"Deck non renseigné"}</span></div>`;$("partCount").textContent=s.parts.length;$("partCount").nextElementSibling.textContent=`partie${s.parts.length>1?"s":""}`;$("wins").textContent=`${s.wins} wins`;$("losses").textContent=`${s.losses} losses`;$("parts").innerHTML=s.parts.length?s.parts.map((p,i)=>`<div class="part-row ${i===editingPartIndex?"editing":""}"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${partMetaText(p)}</small></span>${state.active?`<button class="edit-part" data-edit-part="${i}" aria-label="Modifier la partie ${i+1}">✎</button>`:""}</div>`).join(""):'<div class="empty">Aucune partie. Ajoute ta première partie.</div>'}
function openActiveRun(){if(!state.active)return;editingPartIndex=null;renderRun();show("runView")}
function openStart(){if(state.active){openActiveRun();return}selectedRank="Platine";document.querySelectorAll(".rank").forEach(b=>b.classList.toggle("selected",b.dataset.rank===selectedRank));renderDeckOptions(state.decks.length?state.decks.length-1:"");show("startView")}
function startRun(){const d=state.decks[Number($("deckSelect").value)];if(!d){alert("Ajoute ou sélectionne un deck avant de démarrer le Run.");return}state.active={id:crypto.randomUUID(),number:nextNumber(),rank:selectedRank,deck:d.name,deckColors:d.colors||[],deckId:d.id||null,startedAt:new Date().toISOString(),parts:[]};save();renderRun();show("runView")}
function editPart(index){if(!state.active||!state.active.parts[index])return;editingPartIndex=index;const p=state.active.parts[index];$("partTitle").textContent=`Modifier la partie #${index+1}`;resetPartForm();document.querySelector(`input[name="mode"][value="${p.mode||"play"}"]`).checked=true;(p.archetypes||[]).forEach(v=>{const el=document.querySelector(`input[name="archetype"][value="${v}"]`);if(el)el.checked=true});(p.colors||[]).forEach(v=>{const el=document.querySelector(`input[name="opponentColor"][value="${v}"]`);if(el)el.checked=true});document.querySelector(`input[name="mana"][value="${p.mana||"ok"}"]`).checked=true;document.querySelector(`input[name="landT3"][value="${p.landT3===false?"no":"yes"}"]`).checked=true;document.querySelectorAll(".result").forEach(b=>b.classList.toggle("selected-result",b.dataset.result===p.result));show("partView")}
function finishRun(){if(!state.active)return;if(!state.active.parts.length&&!confirm("Ce Run ne contient aucune partie. Le terminer quand même ?"))return;state.active.finishedAt=new Date().toISOString();state.runs.push(state.active);state.active=null;save();renderHome();show("homeView")}
function selectedValue(name,fallback){const el=document.querySelector(`input[name="${name}"]:checked`);return el?el.value:fallback}
function resetPartForm(){document.querySelectorAll(".result").forEach(b=>b.classList.remove("selected-result"));document.querySelector('input[name="mode"][value="play"]').checked=true;document.querySelectorAll('input[name="archetype"]').forEach(i=>i.checked=false);document.querySelectorAll('input[name="opponentColor"]').forEach(i=>i.checked=false);document.querySelector('input[name="mana"][value="ok"]').checked=true;document.querySelector('input[name="landT3"][value="yes"]').checked=true}
function addPart(result){const mode=selectedValue("mode","play");const archetypes=selectedValues("archetype");const colors=canonicalColors(selectedValues("opponentColor"));const mana=selectedValue("mana","ok");const landT3=selectedValue("landT3","yes")==="yes";if(editingPartIndex!==null){const old=state.active.parts[editingPartIndex];state.active.parts[editingPartIndex]={...old,result,mode,archetypes,colors,mana,landT3};editingPartIndex=null}else state.active.parts.push({result,mode,archetypes,colors,mana,landT3,at:new Date().toISOString()});save();renderRun();show("runView")}
function archiveRuns(){
  const pending=state.runs.filter(r=>!r.isArchive);
  if(!pending.length){alert("Aucune run à archiver. Les archives existantes sont conservées séparément.");return}
  const groups=new Map();
  pending.forEach(r=>{const deck=r.deck||"Deck non renseigné";if(!groups.has(deck))groups.set(deck,[]);groups.get(deck).push(r)});
  const summary=[...groups.entries()].map(([deck,runs])=>`${deck} : ${runs.length} run(s)`).join("\n");
  if(!confirm(`Créer une archive par deck à partir des runs non archivées ?\n\n${summary}\n\nLes archives déjà existantes ne seront pas intégrées.`))return;
  const archives=[...groups.entries()].map(([deck,runs])=>{
    const ordered=runs.slice().sort((a,b)=>new Date(a.startedAt)-new Date(b.startedAt));
    const latest=ordered.reduce((best,r)=>new Date(r.finishedAt||r.startedAt)>new Date(best.finishedAt||best.startedAt)?r:best,ordered[0]);
    const allParts=ordered.flatMap(r=>(r.parts||[]).map((p,i)=>({...p,archiveSourceRunId:r.id,archiveSourceRunNumber:r.number,archiveSourcePartIndex:i})));
    return {id:crypto.randomUUID(),isArchive:true,number:Math.max(...ordered.map(r=>r.number||0)),rank:"Archive",deck,deckColors:ordered[ordered.length-1].deckColors||[],deckId:ordered[ordered.length-1].deckId||null,startedAt:latest.finishedAt||latest.startedAt,finishedAt:latest.finishedAt||latest.startedAt,archivedAt:new Date().toISOString(),sourceRunIds:ordered.map(r=>r.id),sourceRunNumbers:ordered.map(r=>r.number),parts:allParts};
  }).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  state.runs=[...state.runs.filter(r=>r.isArchive),...archives];
  save();renderHome();
}
let selectedDetailRunId=null;
function detail(id){
  const r=state.runs.find(x=>x.id===id);if(!r)return;selectedDetailRunId=id;
  const s=stats(r);
  $("detailTitle").textContent=r.isArchive?`Archive · ${r.deck||"Deck non renseigné"}`:`Run #${r.number}`;
  $("detailDeleteArchive").classList.toggle("hidden",!r.isArchive);
  if(r.isArchive){
    const parts=s.parts;
    const overall=winRateFor(parts);
    const resultColors={freeLoose:"#7f1d1d",hardLoose:"#dc2626",badLuckLoose:"#f97316",luckyWin:"#2563eb",goodWin:"#16a34a",freeWin:"#166534"};
    const resultKeys=["freeLoose","hardLoose","badLuckLoose","luckyWin","goodWin","freeWin"];
    const resultItems=resultKeys.map(key=>({label:labels[key],count:parts.filter(p=>p.result===key).length,color:resultColors[key]}));
    const manaDeath=parts.filter(p=>(p.mana||"ok")==="death").length;
    const manaOkParts=parts.filter(p=>(p.mana||"ok")==="ok");
    const manaFloodParts=parts.filter(p=>(p.mana||"ok")==="flood");
    const t3yesParts=parts.filter(p=>p.landT3!==false);
    const t3noParts=parts.filter(p=>p.landT3===false);
    const t3yesPct=parts.length?Math.round(t3yesParts.length/parts.length*100):0;
    const t3noPct=parts.length?Math.round(t3noParts.length/parts.length*100):0;
    $("detailContent").innerHTML=`
      <div class="global-summary"><div><span>WR global</span><strong>${overall.rate}%</strong><small>${overall.wins} W · ${overall.total-overall.wins} L · ${overall.total} parties</small></div></div>
      ${distributionGroup("Répartition des résultats",resultItems,"percent")}
      ${distributionGroup("",[{label:"DEATH",count:manaDeath,color:"#111827"},{label:"OK",count:manaOkParts.length,color:"#16a34a"},{label:"FLOOD",count:manaFloodParts.length,color:"#2563eb"}],"percent",[{label:"WR Mana OK",parts:manaOkParts},{label:"WR Mana Flood",parts:manaFloodParts}])}
      ${distributionGroup("",[{label:"OUI",count:t3yesParts.length,color:"#16a34a"},{label:"NON",count:t3noParts.length,color:"#dc2626"}],"none",[{label:"WR 3 lands OK",parts:t3yesParts},{label:"WR 3 lands NON",parts:t3noParts}],{left:`${t3yesPct}`,right:`${t3noPct}`})}`;
  }else{
    let counts={};s.parts.forEach(p=>counts[p.result]=(counts[p.result]||0)+1);
    let winRate=s.parts.length?Math.round(s.wins/s.parts.length*100):0;
    let manaCounts={death:0,ok:0,flood:0},t3Yes=0,t3No=0;
    s.parts.forEach(p=>{if(p.mana&&manaCounts[p.mana]!==undefined)manaCounts[p.mana]++;if(p.landT3===false)t3No++;else t3Yes++});
    const partsMarkup=`<div class="section-head"><h2>Parties</h2></div><div class="detail-list">${s.parts.map((p,i)=>`<div class="part-row ${i===editingPartIndex?"editing":""}"><span class="part-num">#${i+1}</span><i class="dot ${typeClass[p.result]}"></i><span class="part-name">${labels[p.result]}<small class="part-meta">${partMetaText(p)}</small></span></div>`).join("")}</div>`;
    $("detailContent").innerHTML=`<div class="stat-card"><div class="run-info"><span class="rank-badge">${r.rank}</span><span>${r.deck||"Deck non renseigné"}</span></div></div><div class="stat-card"><div class="stat-title">Résultat</div><div class="stat-value">${s.wins} W · ${s.losses} L</div><div class="bar"><i style="width:${winRate}%;background:#10b981"></i></div><div style="margin-top:8px;font-weight:700">${winRate}% de wins · ${s.parts.length} parties</div></div><div class="stat-card"><div class="stat-title">Mana</div><div class="opponent-stats"><span>Death · ${manaCounts.death}</span><span>OK · ${manaCounts.ok}</span><span>Flood · ${manaCounts.flood}</span></div><div class="opponent-stats"><span>3 lands T3 · ${t3Yes}</span><span>Pas 3 lands T3 · ${t3No}</span></div></div><div class="stat-card"><div class="stat-title">Répartition</div><div class="legend">${Object.keys(labels).map(k=>`<div><span style="background:${k.includes("Win")&&k!=="luckyWin"?"#10b981":k==="luckyWin"?"#2563eb":"#ef4444"}"></span>${labels[k]} · ${counts[k]||0}</div>`).join("")}</div></div>${partsMarkup}`;
  }
  show("detailView");
}
function deleteSelectedArchive(){
  const r=state.runs.find(x=>x.id===selectedDetailRunId);
  if(!r||!r.isArchive)return;
  if(!confirm(`Effacer l'archive du deck « ${r.deck||"Deck non renseigné"} » et ses ${((r.parts||[]).length)} parties ? Cette action est définitive.`))return;
  state.runs=state.runs.filter(x=>x.id!==selectedDetailRunId);selectedDetailRunId=null;save();renderHome();show("homeView");
}
$("newRunBtn").onclick=openStart;$("addDeckBtn").onclick=addDeck;$("parts").addEventListener("click",e=>{const b=e.target.closest("[data-edit-part]");if(b)editPart(Number(b.dataset.editPart))});$("confirmStartBtn").onclick=startRun;$("addPartBtn").onclick=()=>{if(state.active){$("partTitle").textContent=`Partie #${state.active.parts.length+1}`;resetPartForm();show("partView")}};$("finishBtn").onclick=finishRun;$("backBtn").onclick=()=>{save();renderHome();show("homeView")};$("cancelStartBtn").onclick=()=>show("homeView");$("cancelPartBtn").onclick=()=>{editingPartIndex=null;renderRun();show("runView")};$("detailBackBtn").onclick=()=>{selectedDetailRunId=null;renderHome();show("homeView")};$("detailDeleteArchive").onclick=deleteSelectedArchive;document.querySelectorAll(".result").forEach(b=>b.onclick=()=>addPart(b.dataset.result));document.querySelectorAll(".rank").forEach(b=>b.onclick=()=>{selectedRank=b.dataset.rank;document.querySelectorAll(".rank").forEach(x=>x.classList.toggle("selected",x===b))});$("archiveBtn").onclick=archiveRuns;$("clearBtn").onclick=()=>{if(confirm("Effacer tout l'historique ?")){state.runs=[];save();renderHome()}};window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("installBtn").classList.remove("hidden")});$("installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("installBtn").classList.add("hidden")}};if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));renderDeckOptions();renderHome();
