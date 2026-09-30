"use strict";
/* Screens: title, river map, lessons, race HUD, results, settings, wardrobe */
/* ============================== UI ============================== */
const ICON={
  gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.4"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  turtle:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="27" rx="13" ry="9" fill="#3fb068" stroke="#1f2a44" stroke-width="2.6"/><path d="M15 26 Q24 16 33 26" fill="none" stroke="#257a45" stroke-width="2.4"/><path d="M24 18v17M16 30h16" stroke="#257a45" stroke-width="2"/><circle cx="40" cy="25" r="4.6" fill="#8fd08f" stroke="#1f2a44" stroke-width="2.4"/><circle cx="41.2" cy="24" r="1" fill="#1f2a44"/><path d="M15 35l-2 5M33 35l2 5M10 27l-4 1" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/></svg>',
  star:(on)=>`<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.3 6.5L12 17.2l-5.9 3.2 1.3-6.5L2.6 9.4l6.5-.8z" fill="${on?'#ffc83d':'#dfe5ec'}" stroke="#1f2a44" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
  retry:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/></svg>',
  map:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>'
};
$('#btnSettings1').innerHTML=ICON.gear;$('#btnMapBack').innerHTML=ICON.back;$('#btnPause').innerHTML=ICON.pause;
$('#btnSetClose').innerHTML=ICON.close;$('#btnCatsClose').innerHTML=ICON.close;
$('#btnListen .spk').innerHTML=ICON.speaker;$('#btnSlow').innerHTML=ICON.turtle;

function show(id,on){const el=$(id);if(el)el.hidden=!on;}
function toast(html,ms){const t=$('#toast');t.innerHTML=html;t.hidden=false;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true;},ms||2600);}
function isUnlocked(id){return save.unlockAll||id===1||(save.stars[id-1]|0)>0||(save.stars[id]|0)>0;}

ICON.fish='<svg viewBox="0 0 38 26" aria-hidden="true"><path d="M3 13c5-9 17-10 25-3l6-6v18l-6-6c-8 7-20 6-25-3z" fill="#a9c3da" stroke="#1f2a44" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 15c5 3 12 3 18-1" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><circle cx="10" cy="11" r="2.1" fill="#1f2a44"/><path d="M15 8.5q3 4.5 0 9" stroke="#1f2a44" stroke-width="1.8" fill="none"/></svg>';
ICON.heart=on=>`<svg viewBox="0 0 24 24"><path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8 2.7c0 5.7-8 10.6-8 10.6z" fill="${on?'#e5544a':'#dfe5ec'}" stroke="#1f2a44" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
ICON.book='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 5.5c3-1.5 6-1.5 9 .5v14c-3-2-6-2-9-.5zM21 5.5c-3-1.5-6-1.5-9 .5v14c3-2 6-2 9-.5z"/></svg>';
const GOAL_SVG={
  mega:'<rect x="0" y="12" width="44" height="24" rx="4" fill="#a79d90"/><path d="M0 12 Q22 6 44 12" stroke="#1f2a44" stroke-width="3" fill="none"/><path d="M3 36 V26 a8 8 0 0 1 16 0 V36 z M25 36 V26 a8 8 0 0 1 16 0 V36 z" fill="#2f5d6a"/><rect x="0" y="12" width="44" height="24" rx="4" fill="none" stroke="#1f2a44" stroke-width="3"/>',
  arch:'<path d="M0 36V12Q22 4 44 12V36Z" fill="#c2b08f"/><path d="M8 36V27a14 14 0 0 1 28 0V36z" fill="#2f5d6a"/><path d="M0 36V12Q22 4 44 12V36" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linejoin="round"/>',
  wood:'<path d="M12 22V36M32 22V36" stroke="#5a3b2a" stroke-width="4"/><path d="M3 15V5M13 15V6M23 15V6M33 15V6M41 15V5M1 6H43" stroke="#c8423a" stroke-width="3" stroke-linecap="round"/><rect x="0" y="14" width="44" height="8" rx="2" fill="#c8423a" stroke="#1f2a44" stroke-width="2.5"/>',
  steps:'<path d="M2 36V30H12V24H22V18H32V12H42V36Z" fill="#b9ae9f" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/><path d="M2 5Q22 16 42 5" stroke="#1f2a44" stroke-width="2" fill="none"/><path d="M8 7.5l3 8 3-7z" fill="#e5544a"/><path d="M18 10l3 8 3-8z" fill="#ffc83d"/><path d="M29 9l3 8 3-8.5z" fill="#56b7e6"/>'
};
function fishChip(n){return `${ICON.fish}<span>${n}</span>`;}
function runUnlocked(){return save.unlockAll||LEVELS.some(L=>L.id>=3&&(save.stars[L.id]|0)>0);}
function hideAll(){['#title','#map','#hud','#results','#pause','#lesson'].forEach(id=>show(id,0));}
function stopSpeech(){voiceStop();}

function goTitle(){
  stopSpeech();G.screen='title';hideAll();show('#title',1);
  setupLevel(TITLE_SCENE,'scene');refreshTitle();
}
const TITLE_SCENE=Object.assign({},LEVELS[0],{dest:'mega'});
function refreshTitle(){
  $('#titleFish').innerHTML=fishChip(save.fish);
  $('#btnRun').classList.toggle('locked',!runUnlocked());
}
function goMap(sel){
  stopSpeech();
  G.screen='map';G.paused=false;hideAll();show('#map',1);
  buildMap(sel);
}
/* Level button: the first time through, a lesson and a practice come before the race */
function openLevel(L){if(save.lessons[L.id])startLevel(L);else startLesson(L);}
function prepHud(run){
  hideAll();show('#hud',1);
  show('#raceBox',!run);show('#runBox',run);
  if(!run){const d=DESTS[G.dest];$('#destName').textContent=d.name;$('#goalIcon').innerHTML=GOAL_SVG[G.dest];}
}
function countdown(){
  $('#chip').innerHTML='Get ready!';
  const c=$('#count');const steps=['3','2','1','Hop!'];
  steps.forEach((s,i)=>later(0.2+i*0.62,()=>{c.textContent=s;c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');SFX.beep(i===3);}));
  later(0.2+3*0.62+0.55,()=>{c.textContent='';activateRow(0);});
}
function startLevel(L){
  ensureAudio();stopSpeech();
  setupLevel(L);G.screen='play';
  prepHud(false);buildTrack();countdown();
}
function runLevel(){
  const from=LEVELS.filter(L=>save.unlockAll||(save.stars[L.id]|0)>0).map(L=>L.id);
  return{id:'run',title:'River Run',type:'mix',theme:'morning',rival:5,from:from.length?from:[1]};
}
function startRun(){
  if(!runUnlocked()){toast('Finish level 3 to open River Run!<span class="jp">レベル3をクリアすると あそべるよ</span>',3200);return;}
  ensureAudio();stopSpeech();
  setupLevel(runLevel(),'run');G.screen='play';
  prepHud(true);updateRunHud();countdown();
  toast('River Run: how far can you hop? 3 splashes and you are out!<span class="jp">どこまで いけるかな？ 3回おちたら おしまい</span>',3000);
}
function updateRunHud(){
  $('#runNum').textContent=G.runCount;$('#runBest').textContent=Math.max(save.runBest,G.runCount);
  let h='';for(let i=0;i<3;i++)h+=ICON.heart(i<G.lives);$('#runLives').innerHTML=h;
}

/* ---- map ---- */
let mapSel=1;
const GROUP_COL={morning:'#ffc83d',day:'#56b7e6',afternoon:'#f2a65a',sunset:'#e0719a',night:'#6c63c7'};
function currentLevelId(){for(const L of LEVELS){if(isUnlocked(L.id)&&!(save.stars[L.id]>0))return L.id;}return LEVELS.length;}
function buildMap(sel){
  const svg=$('#mapSvg');
  const R=mulberry(12);
  let deco='';
  deco+=`<rect width="800" height="720" fill="#dcefe3"/>`;
  deco+=`<path d="M0 0 H800 V170 Q600 120 470 170 T180 150 T0 190 Z" fill="#c4e0c9"/>`;
  deco+=`<path d="M0 0 H800 V100 Q650 60 520 110 T220 80 T0 120 Z" fill="#aed3b6"/>`;
  for(let i=0;i<70;i++){const x=R()*800,y=200+R()*500;const w=14+R()*22,h=10+R()*14;
    deco+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${pick(['#f6efe4','#efe3d3','#e4ebef','#f3e6ef'])}" stroke="#c9d7cf" stroke-width="1.5"/>`;}
  for(let i=0;i<34;i++){const x=R()*800,y=120+R()*600;deco+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(6+R()*8).toFixed(1)}" fill="${R()<.5?'#8fc27a':'#76b06a'}"/>`;}
  for(let i=0;i<26;i++){const x=R()*800,y=200+R()*500;deco+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${pick(['#7f9be6','#a784dc','#e79bc0'])}"/>`;}
  // the river zig-zags up the map: one stretch per chapter, Dejima at the bottom, Meganebashi at the top
  const ROW_Y=[640,520,400,280,160],XL=110,XR=690;
  const d=`M8 720 Q30 ${ROW_Y[0]} ${XL} ${ROW_Y[0]} H${XR} A60 60 0 0 0 ${XR} ${ROW_Y[1]} H${XL} A60 60 0 0 1 ${XL} ${ROW_Y[2]} H${XR} A60 60 0 0 0 ${XR} ${ROW_Y[3]} H${XL} A60 60 0 0 1 ${XL} ${ROW_Y[4]} H600 Q672 ${ROW_Y[4]} 690 118`;
  deco+=`<path d="${d}" fill="none" stroke="#3f8f8a" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>`;
  deco+=`<path d="${d}" fill="none" stroke="#7fcac2" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>`;
  deco+=`<path d="${d}" fill="none" stroke="#e8fbf8" stroke-width="3" stroke-dasharray="10 18" stroke-linecap="round" opacity=".8"/>`;
  deco+=`<g transform="translate(690 100)"><rect x="-52" y="-18" width="104" height="30" rx="6" fill="#a9a093" stroke="#1f2a44" stroke-width="4"/><path d="M-46 12 v-6 a18 18 0 0 1 36 0 v6z M10 12 v-6 a18 18 0 0 1 36 0 v6z" fill="#2f5d6a"/><path d="M-46 12 v6 a18 18 0 0 0 36 0 v-6z M10 12 v6 a18 18 0 0 0 36 0 v-6z" fill="#2f5d6a" opacity=".45"/></g>`;
  deco+=`<g font-family="Baloo 2, sans-serif" font-weight="800"><text x="690" y="58" text-anchor="middle" font-size="24" fill="#1f2a44">Meganebashi</text><text x="690" y="148" text-anchor="middle" font-size="15" fill="#43537a" font-family="M PLUS Rounded 1c, sans-serif">眼鏡橋</text>`;
  deco+=`<text x="78" y="708" font-size="20" fill="#1f2a44" stroke="#dcefe3" stroke-width="5" paint-order="stroke">Dejima <tspan font-size="14" fill="#43537a" font-family="M PLUS Rounded 1c, sans-serif">出島</tspan></text></g>`;
  svg.innerHTML=deco+'<g id="nodes"></g>';
  const cur=currentLevelId();
  mapSel=sel||mapSel||cur;if(!isUnlocked(mapSel))mapSel=cur;
  let marks='',html='';
  CHAPTERS.forEach((ch,ci)=>{
    const y=ROW_Y[ci],ltr=ci%2===0,ids=ch.levels,n=ids.length,last=ci===CHAPTERS.length-1;
    const x0=ltr?XL+70:XR-70,x1=ltr?(last?560:XR-70):XL+70;
    const xs=ids.map((id,k)=>n===1?x0:x0+(x1-x0)*k/(n-1));
    // chapter name, above the start of its stretch
    const done=ids.every(id=>(save.stars[id]|0)>0),open=isUnlocked(ids[0]);
    const lx=ltr?XL-26:XR+26,anchor=ltr?'start':'end';
    marks+=`<g font-family="Baloo 2, sans-serif" font-weight="800" opacity="${open?1:.55}"><text x="${lx}" y="${y-38}" text-anchor="${anchor}" font-size="17" fill="#1f2a44" stroke="#dcefe3" stroke-width="5" paint-order="stroke">${ch.id} · ${ch.title}${done?' ✓':''}</text></g>`;
    ids.forEach((id,k)=>{
      const L=lv(id),x=xs[k];
      // a little landmark across the river between stones: where this level finishes
      if(k<n-1&&L.dest!=='mega'){const mx=(x+xs[k+1])/2,col={wood:'#c8423a',arch:'#b9a88c',steps:'#9a9185'}[L.dest];
        marks+=`<rect x="${(mx-4).toFixed(1)}" y="${y-27}" width="8" height="54" rx="3" fill="${col}" stroke="#1f2a44" stroke-width="2.5"/>`;}
      const un=isUnlocked(id),st=save.stars[id]|0,col=un?GROUP_COL[L.theme]:'#b9c3cc';
      const selR=id===mapSel?`<circle r="31" fill="none" stroke="#ff7a3d" stroke-width="6"/>`:'';
      let stars='';for(let q=0;q<3;q++){stars+=`<path transform="translate(${-15+q*15} 31) scale(.58)" d="M0 -10l2.9 6 6.5.8-4.8 4.5 1.3 6.5L0 4.6l-5.9 3.2 1.3-6.5-4.8-4.5 6.5-.8z" fill="${q<st?'#ffc83d':'#ffffff'}" stroke="#1f2a44" stroke-width="2"/>`;}
      const label=un?`<text y="8" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="22" fill="#fff" stroke="#1f2a44" stroke-width="5" paint-order="stroke">${id}</text>`:
        `<g transform="translate(-11 -12)" color="#6b7684">${ICON.lock.replace('<svg ','<svg width="22" height="22" ')}</g>`;
      const catMark=id===cur&&un?`<image href="${catIcon(save.look,32)}" x="-22" y="-78" width="44" height="44"><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.2s" repeatCount="indefinite"/></image>`:'';
      html+=`<g class="node" data-id="${id}" transform="translate(${x.toFixed(1)} ${y})" tabindex="0" role="button" aria-label="Level ${id} ${esc(L.title)}${un?'':' locked'}">
        ${selR}<circle class="nd" r="22" fill="${col}" stroke="#1f2a44" stroke-width="4"/>${label}${stars}${catMark}</g>`;
    });
  });
  svg.querySelector('#nodes').innerHTML=marks+html;
  svg.querySelectorAll('.node').forEach(n=>{
    const f=()=>{SFX.click();mapSel=+n.dataset.id;buildMap(mapSel);};
    n.addEventListener('click',f);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();}});
  });
  renderCard();
}
function renderCard(){
  const L=lv(mapSel),un=isUnlocked(L.id),st=save.stars[L.id]|0,learned=!!save.lessons[L.id];
  const samples=L.sample||Object.keys(L.letters||{});
  let stars='';for(let k=0;k<3;k++)stars+=ICON.star(k<st);
  const best=save.best[L.id];const bestTxt=best===1?'<span class="crown">Won the race!</span>':best?`Best: ${ordinal(best)} place`:'';
  const d=DESTS[L.dest];
  const ch=CHAPTERS.find(c=>c.id===L.ch);
  $('#lvCard').innerHTML=`<div class="lv-head"><span class="lv-num">Level ${L.id}</span><span class="lv-ch" style="--chc:${GROUP_COL[L.theme]}">Chapter ${ch.id} · ${ch.title}</span></div>
    <h2>${L.title}</h2><div class="jp">${L.jp}</div>
    <p class="how">${L.how}</p>
    <div class="samples">${samples.map(w=>`<span>${w}</span>`).join('')}</div>
    <div class="dest"><svg viewBox="0 0 44 36" width="40" height="33">${GOAL_SVG[L.dest]}</svg>Finish: <b>${d.name}</b><span class="jp" style="font-size:16px">${d.jp}</span></div>
    ${un?`<div class="lv-stars">${stars}<span class="lv-best">${bestTxt}</span></div>
      ${learned?`<div class="row2"><button class="btn ghost" id="btnLesson">${ICON.book}Lesson</button></div><button class="btn big" id="btnGo">${ICON.play}Race!</button>`
        :`<button class="btn big" id="btnGo">${ICON.book}Learn &amp; hop</button>`}`:
      `<div class="lock-msg">Finish level ${L.id-1} to open this one.<br><span class="jp" style="font-size:16px">レベル${L.id-1}をクリアしよう</span></div>`}`;
  const go=$('#btnGo');if(go)go.addEventListener('click',()=>{SFX.click();openLevel(L);});
  const ls=$('#btnLesson');if(ls)ls.addEventListener('click',()=>{SFX.click();startLesson(L);});
}
function ordinal(n){return n+(n===1?'st':n===2?'nd':n===3?'rd':'th');}

/* ---- lesson: learn cards → practice → race ---- */
const LS={L:null,phase:'learn',card:0,qs:[],qi:0,miss:0,busy:false,expr:'idle'};
function startLesson(L){
  ensureAudio();stopSpeech();
  setupLevel(L);G.screen='lesson';hideAll();show('#lesson',1);
  Object.assign(LS,{L,phase:'learn',card:0,qs:[],qi:0,miss:0,busy:false,expr:'idle'});
  renderLesson();
}
function hl(w,g,at){
  if(g.indexOf('_')>0&&w.endsWith('e')){const v=g[0],j=w.lastIndexOf(v,w.length-2);
    if(j>=0)return esc(w.slice(0,j))+'<b>'+v+'</b>'+esc(w.slice(j+1,-1))+'<b>e</b>';}
  let i,len=g.length;
  if(g[0]==='-'){g=g.slice(1);len=g.length;i=w.endsWith(g)?w.length-len:-1;}
  else if(at==='last')i=w.lastIndexOf(g);
  else if(at==='mid')i=w.indexOf(g,1);
  else i=w.indexOf(g);
  if(i<0)return esc(w);
  return esc(w.slice(0,i))+'<b>'+esc(w.slice(i,i+len))+'</b>'+esc(w.slice(i+len));
}
function wordBtn(w,inner){return `<button class="wbtn" data-w="${esc(w)}">${ICON.speaker}<span>${inner}</span></button>`;}
/* a lesson card, out loud: each letter's sound (if recorded), then its words */
function sayCard(c){
  const items=[];
  c.rows.forEach(r=>{
    if(r.pair){items.push({w:r.pair[0]},{w:r.pair[1]});return;}
    const snd=COURSE.soundId(r.s||r.g);
    if(snd&&recHas({snd})!==false)items.push({snd});   // no recording: skip it (a computer voice can't say a lone sound)
    r.w.forEach(w=>items.push({w}));
  });
  return say(items,{ttsRate:0.8,gap:300});
}
function cardWords(c){const out=[];c.rows.forEach(r=>{if(r.pair)out.push(...r.pair);else out.push(...r.w);});return out;}
function lessonTop(phase){
  const n=LS.L.teach.length;let dots='';
  for(let i=0;i<n;i++)dots+=`<i class="${LS.phase==='learn'&&i===LS.card?'on':LS.phase!=='learn'||i<LS.card?'done':''}"></i>`;
  dots+=`<i class="${LS.phase==='practice'?'on':LS.phase==='ready'?'done':''}"></i>`;
  return `<div class="ls-top"><span class="lv-num">Level ${LS.L.id}</span><span class="phase">${phase}</span><div class="dots">${dots}</div></div>
    <button class="icon-btn close-x" id="lsClose" aria-label="Close">${ICON.close}</button>`;
}
function renderLesson(){
  const L=LS.L,card=$('#lsCard');
  if(LS.phase==='learn'){
    const c=L.teach[LS.card];
    const many=c.rows.length>2;
    const rows=c.rows.map(r=>{
      if(r.pair){const magic=r.g[1].indexOf('_')>0;
        return `<div class="ls-row"><div class="gtile pair">${esc(r.g[0])}<span style="font-size:.5em;color:var(--ink2);margin:0 .2em">${magic?'→':'/'}</span>${esc(r.g[1])}</div>
          <div class="ls-words">${wordBtn(r.pair[0],hl(r.pair[0],r.g[0]))}<span class="wbtn" style="border:0;box-shadow:none;background:none;padding:0">${magic?'→':'or'}</span>${wordBtn(r.pair[1],hl(r.pair[1],r.g[1]))}</div></div>`;}
      const snd=COURSE.soundId(r.s||r.g);
      return `<div class="ls-row">${snd?`<button class="gtile" data-snd="${snd}" data-fb="${esc(r.w[0])}" aria-label="Hear the sound ${esc(r.g)}">${esc(r.g)}</button>`:`<div class="gtile">${esc(r.g)}</div>`}<div class="ls-words">${r.w.map(w=>wordBtn(w,hl(w,r.g,r.at))).join('')}</div></div>`;
    }).join('');
    card.innerHTML=lessonTop('Learn · まなぼう')+`
      <div class="ls-body"><div class="ls-tip">${esc(c.tip)}<span class="jp">${c.jp}</span></div>
        <div class="ls-rows${many?' many':''}">${rows}</div></div>
      <div class="ls-foot"><button class="skip" id="lsSkip">Skip to the race</button><canvas id="lsCat" width="300" height="320"></canvas>
        <div style="display:flex;gap:12px">${LS.card>0?`<button class="btn ghost" id="lsBack">${ICON.back}Back</button>`:''}
        <button class="btn teal" id="lsHear">${ICON.speaker}Hear all</button>
        <button class="btn" id="lsNext">${LS.card<L.teach.length-1?'Next':'Practice'}${ICON.play}</button></div></div>`;
    card.querySelectorAll('.wbtn[data-w]').forEach(b=>b.addEventListener('click',()=>{ensureAudio();say({w:b.dataset.w},{ttsRate:0.8});LS.expr='happy';drawLessonCat();}));
    card.querySelectorAll('.gtile[data-snd]').forEach(b=>b.addEventListener('click',()=>{ensureAudio();say({snd:b.dataset.snd,fb:b.dataset.fb},{ttsRate:0.8});LS.expr='happy';drawLessonCat();}));
    $('#lsHear').addEventListener('click',()=>{ensureAudio();sayCard(c);});
    $('#lsNext').addEventListener('click',()=>{SFX.click();if(LS.card<L.teach.length-1){LS.card++;renderLesson();}else startPractice();});
    const bk=$('#lsBack');if(bk)bk.addEventListener('click',()=>{SFX.click();LS.card--;renderLesson();});
    setTimeout(()=>{if(G.screen==='lesson'&&LS.phase==='learn')sayCard(c);},350);
  }else if(LS.phase==='practice'){
    const q=LS.qs[LS.qi],chip=chipFor(q);
    card.innerHTML=lessonTop('Practice · れんしゅう')+`
      <div class="ls-body"><div class="ls-tip">${chip[0]}<span class="jp">${chip[1]}</span></div>
        <div class="pr-say"><button class="listen-btn" id="prListen"><span class="spk">${ICON.speaker}</span>Listen</button><button class="slow-btn" id="prSlow" aria-label="Listen slowly">${ICON.turtle}</button></div>
        <div class="pr-opts">${q.opts.map((o,i)=>`<button class="optbtn" data-i="${i}">${esc(o)}</button>`).join('')}</div>
        <div class="pr-fb" id="prFb"></div></div>
      <div class="ls-foot"><button class="skip" id="lsSkip">Skip to the race</button><canvas id="lsCat" width="300" height="320"></canvas>
        <div style="font-weight:800;font-size:24px;color:var(--ink2)">Question ${LS.qi+1} / ${LS.qs.length}</div></div>`;
    $('#prListen').addEventListener('click',()=>{ensureAudio();sayQ(q);});
    $('#prSlow').addEventListener('click',()=>{ensureAudio();sayQ(q,{turtle:true});});
    card.querySelectorAll('.optbtn').forEach(b=>b.addEventListener('click',()=>practiceAnswer(b)));
    setTimeout(()=>{if(G.screen==='lesson'&&LS.phase==='practice'&&LS.qs[LS.qi]===q)sayQ(q);},300);
  }else{
    const d=DESTS[L.dest],first=!save.lessons[L.id];
    if(first){save.lessons[L.id]=true;save.fish+=5;persist();}
    card.innerHTML=lessonTop('Ready! · じゅんびOK')+`
      <div class="ls-body"><canvas id="lsCat" width="300" height="320" style="width:200px;height:213px"></canvas>
        <div class="ls-tip" style="font-size:44px">Great practice!<span class="jp">よくできました！</span></div>
        <div class="ls-tip" style="font-size:26px;color:var(--ink2)">Now race the other cats to the ${d.name}.<span class="jp">${d.jp}まで きょうそうだ！</span></div>
        ${first?`<div class="fishchip">${ICON.fish}<span>+5 for finishing the lesson</span></div>`:''}</div>
      <div class="ls-foot"><span></span><div style="display:flex;gap:12px"><button class="btn ghost" id="lsAgain">${ICON.retry}Practice again</button>
        <button class="btn big" id="lsRace">${ICON.play}Race!</button></div></div>`;
    LS.expr='happy';
    $('#lsAgain').addEventListener('click',()=>{SFX.click();startPractice();});
    $('#lsRace').addEventListener('click',()=>{SFX.click();startLevel(L);});
    SFX.fanfare();
  }
  $('#lsClose').addEventListener('click',()=>{SFX.click();goMap(L.id);});
  const sk=$('#lsSkip');if(sk)sk.addEventListener('click',()=>{SFX.click();save.lessons[L.id]=true;persist();startLevel(L);});
  drawLessonCat();
}
function drawLessonCat(){
  const c=$('#lsCat');if(!c)return;const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  drawCat(g,150,300,2.25,{look:save.look,view:'face',expr:LS.expr,sway:0.1});
  if(LS.expr!=='idle'){clearTimeout(drawLessonCat._t);drawLessonCat._t=setTimeout(()=>{LS.expr='idle';const c2=$('#lsCat');if(c2&&LS.phase!=='ready')drawLessonCat();},900);}
}
function startPractice(){
  const L=LS.L,used=new Set();let last={};LS.qs=[];
  // start with two choices, then three
  for(let i=0;i<6;i++){const n=i<3?2:3;const q=nextQuestion(L,used,last,n);last={ans:q.ans,set:q.set,lv:q.lv};LS.qs.push(q);}
  LS.phase='practice';LS.qi=0;LS.miss=0;LS.busy=false;renderLesson();
}
function practiceAnswer(b){
  if(LS.busy||b.classList.contains('bad'))return;
  const q=LS.qs[LS.qi],o=q.opts[+b.dataset.i],fb=$('#prFb');
  if(o===q.ans){
    LS.busy=true;b.classList.add('good');SFX.good();LS.expr='happy';drawLessonCat();
    if(LS.miss===0)reviewDrop(q.lv,q.say);
    fb.innerHTML=`${pick(PRAISE)} <span style="color:var(--ink2)">“${esc(q.type==='sound'?q.ans:q.say)}”</span>`;fb.style.color='var(--goodD)';
    setTimeout(()=>{if(LS.phase!=='practice')return;LS.qi++;LS.miss=0;LS.busy=false;if(LS.qi>=LS.qs.length)LS.phase='ready';renderLesson();},1100);
  }else{
    LS.miss++;b.classList.add('bad');SFX.bad();LS.expr='oops';drawLessonCat();
    reviewAdd(q.lv,q.say);persist();
    fb.textContent='Not quite. Listen again!';fb.style.color='var(--bad)';
    if(LS.miss>=2||q.opts.length===2)$('#lsCard').querySelectorAll('.optbtn').forEach(x=>{if(q.opts[+x.dataset.i]===q.ans)x.classList.add('hint');});
    setTimeout(()=>{if(LS.phase==='practice'&&LS.qs[LS.qi]===q)sayQ(q,{ttsRate:0.75});},500);
  }
}

/* ---- HUD ---- */
let trackImgs=[];
function buildTrack(){
  const tr=$('#track');tr.querySelectorAll('img').forEach(i=>i.remove());trackImgs=[];
  G.rivals.forEach(rv=>{const im=document.createElement('img');im.src=catIcon(rv.look,22);im.alt='';tr.appendChild(im);trackImgs.push([rv,im]);});
  const me=document.createElement('img');me.src=catIcon(save.look,24);me.alt='You';me.className='me';tr.appendChild(me);trackImgs.push([G.player,me]);
}
function updateHud(){
  if(G.screen!=='play'||G.mode==='run')return;
  const w=356-32-44;
  for(const[c,im]of trackImgs){const f=clamp(c.z/FZ,0,1);im.style.left=(4+f*w)+'px';}
  const n=G.finished?ROWS:Math.max(0,G.player.row+1);const el=$('#rowNum');if(el.textContent!==String(n))el.textContent=n;
}

/* ---- results ---- */
function dailyBonus(){if(save.lastDay===todayKey())return 0;save.lastDay=todayKey();return 10;}
function practiceBlock(){
  return G.missed.length?`<div class="practice"><h3>Practice these words. Tap to listen.</h3><div class="words">${G.missed.map(w=>`<button class="wchip" data-w="${esc(w)}">${ICON.speaker}${esc(w)}</button>`).join('')}</div></div>`:
    `<div class="practice"><h3>No mistakes. Great listening!</h3></div>`;
}
function earnChip(n,parts){return `<div class="earn">${ICON.fish}+${n} fish</div><div class="earn-why">${parts.join(' · ')}</div>`;}
function showResults(){
  const L=G.level;
  const stars=G.misses<=1?3:G.misses<=3?2:1;
  const prev=save.stars[L.id]|0;
  if(stars>prev)save.stars[L.id]=stars;
  if(G.place&&(!save.best[L.id]||G.place<save.best[L.id]))save.best[L.id]=G.place;
  // fish: one per first-try answer, plus finishing, placing and new stars
  const parts=[];let fish=G.firstTry;parts.push(`${G.firstTry} first try`);
  fish+=5;parts.push('5 finish');
  const pb=G.place===1?5:G.place===2?2:0;if(pb){fish+=pb;parts.push(`${pb} ${ordinal(G.place)} place`);}
  const ns=Math.max(0,stars-prev)*3;if(ns){fish+=ns;parts.push(`${ns} new stars`);}
  const db=dailyBonus();if(db){fish+=db;parts.push(`${db} daily treat`);}
  save.fish+=fish;persist();
  const nextL=lv(L.id+1);const nextOpen=nextL&&isUnlocked(nextL.id);
  const d=DESTS[L.dest];
  const medal=G.place?`<div class="medal p${Math.min(G.place,3)}">${ordinal(G.place)}</div>`:`<div class="medal p0">Done!</div>`;
  const title=G.place===1?'You won the race!':`You reached the ${d.name}!`;
  $('#resCard').innerHTML=`<h2>${title}</h2><div class="jp">${G.place===1?'1いだよ！':d.jp+'に ついた！'}</div>
    <div class="res-top">${medal}<div class="stars" id="resStars">${ICON.star(true)}${ICON.star(true)}${ICON.star(true)}</div></div>
    <div class="stats">First try: <b>${G.firstTry} / ${ROWS}</b></div>
    ${earnChip(fish,parts)}
    ${practiceBlock()}
    <div class="btns">
      <button class="btn ghost" id="rMap">${ICON.map}Map</button>
      <button class="btn teal" id="rAgain">${ICON.retry}Again</button>
      ${nextL?`<button class="btn" id="rNext" ${nextOpen?'':'disabled'}>Next${ICON.play}</button>`:''}
    </div>`;
  show('#results',1);
  const svgs=$('#resStars').querySelectorAll('svg');
  svgs.forEach((s,i)=>{if(i<stars)setTimeout(()=>{s.classList.add('on');SFX.star(i);},350+i*380);});
  bindResultWords();
  $('#rMap').addEventListener('click',()=>{SFX.click();goMap(nextOpen&&nextL?nextL.id:L.id);});
  $('#rAgain').addEventListener('click',()=>{SFX.click();startLevel(L);});
  const rn=$('#rNext');if(rn)rn.addEventListener('click',()=>{SFX.click();openLevel(nextL);});
  const ch=CHAPTERS.find(c=>c.id===L.ch);
  if(prev===0&&ch&&ch.levels[ch.levels.length-1]===L.id&&L.id!==LEVELS.length)
    setTimeout(()=>toast(`Chapter ${ch.id} complete: ${ch.title}!<span class="jp">チャプター${ch.id} クリア！</span>`,3600),1400);
  if(L.id===3&&prev===0)setTimeout(()=>toast('River Run is open! Find it on the title screen.<span class="jp">リバーランが あそべるよ！</span>',4200),1800);
}
function showRunResults(){
  const n=G.runCount,isBest=n>save.runBest&&n>0;if(isBest)save.runBest=n;
  const parts=[`${n} stones`];let fish=n;
  if(isBest){fish+=10;parts.push('10 new record');}
  const db=dailyBonus();if(db){fish+=db;parts.push(`${db} daily treat`);}
  save.fish+=fish;persist();
  $('#resCard').innerHTML=`<h2>${isBest?'New record!':'River Run over!'}</h2><div class="jp">${isBest?'しんきろく！':'おつかれさま！'}</div>
    <div class="res-top"><div class="medal p0" style="font-size:52px">${n}</div><div class="stats" style="text-align:left">stones hopped<br>Best: <b>${save.runBest}</b></div></div>
    ${earnChip(fish,parts)}
    ${practiceBlock()}
    <div class="btns"><button class="btn ghost" id="rHome">Title</button><button class="btn" id="rAgain">${ICON.retry}Run again</button></div>`;
  show('#results',1);
  if(isBest){SFX.fanfare();confetti();}
  bindResultWords();
  $('#rHome').addEventListener('click',()=>{SFX.click();goTitle();});
  $('#rAgain').addEventListener('click',()=>{SFX.click();startRun();});
}
function bindResultWords(){$('#resCard').querySelectorAll('.wchip').forEach(b=>b.addEventListener('click',()=>sayWord(b.dataset.w)));}

/* ---- settings ---- */
function fillVoiceSelect(){
  const sel=$('#voiceSel');if(!sel)return;
  sel.innerHTML=voices.length?voices.map(v=>`<option value="${v.name.replace(/"/g,'&quot;')}">${v.name} (${v.lang})${v.localService===false?' — network':''}</option>`).join(''):'<option>No English voice</option>';
  if(voice)sel.value=voice.name;
  $('#voiceNote').hidden=!!voices.length||!synth?!!voices.length:false;
  if(!synth)$('#voiceNote').hidden=false;
}
function syncSettings(){
  $('#swRivals').setAttribute('aria-pressed',save.rivals);$('#swSfx').setAttribute('aria-pressed',save.sfx);$('#swUnlock').setAttribute('aria-pressed',save.unlockAll);
  $('#spdNormal').setAttribute('aria-pressed',!save.slow);$('#spdSlow').setAttribute('aria-pressed',save.slow);
  const r=$('#btnReset');r.classList.remove('armed');r.textContent='Reset';
}
function openSettings(){syncSettings();fillVoiceSelect();show('#settings',1);}
$('#voiceSel').addEventListener('change',e=>{save.voice=e.target.value;persist();loadVoices();say({tts:'cat'});});   // test the computer voice itself
$('#spdNormal').addEventListener('click',()=>{save.slow=false;persist();syncSettings();sayWord('ship');});
$('#spdSlow').addEventListener('click',()=>{save.slow=true;persist();syncSettings();sayWord('ship');});
$('#swRivals').addEventListener('click',()=>{save.rivals=!save.rivals;persist();syncSettings();});
$('#swSfx').addEventListener('click',()=>{save.sfx=!save.sfx;persist();syncSettings();syncRiver();ensureAudio();SFX.click();});
$('#swUnlock').addEventListener('click',()=>{save.unlockAll=!save.unlockAll;persist();syncSettings();if(G.screen==='map')buildMap(mapSel);if(G.screen==='title')refreshTitle();});
$('#btnReset').addEventListener('click',e=>{const b=e.currentTarget;
  if(!b.classList.contains('armed')){b.classList.add('armed');b.textContent='Tap again to reset';return;}
  Object.assign(save,{stars:{},best:{},lessons:{},review:{},fish:0,owned:{},look:Object.assign({},DEFAULT_LOOK),heart:false,runBest:0,lastDay:''});persist();
  for(const k in iconCache)delete iconCache[k];syncSettings();
  toast('Progress reset.');if(G.screen==='map')buildMap(1);if(G.screen==='title')goTitle();});
$('#btnSetClose').addEventListener('click',()=>{SFX.click();show('#settings',0);});

/* ---- wardrobe ---- */
let wrTab='coat',wrFocus=null,wrView='face';
function openCats(){wrFocus=null;wrView='face';renderWardrobe();show('#cats',1);}
function tryLook(slot,id){const L=Object.assign({},save.look);L[slot]=id;return L;}
function drawPreview(){
  const c=$('#wrPreview'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
  const L=wrFocus?tryLook(wrTab,wrFocus):save.look;
  g.fillStyle='rgba(31,42,68,.12)';g.beginPath();g.ellipse(300,628,150,20,0,0,TAU);g.fill();
  drawCat(g,300,625,4.5,{look:L,view:wrView,expr:wrFocus?'happy':'idle',sway:0.12});
}
function renderWardrobe(){
  $('#wrFish').innerHTML=fishChip(save.fish);
  $('#wrTabs').innerHTML=SLOTS.map(k=>`<button data-k="${k}" aria-pressed="${k===wrTab}">${ITEMS[k].label}</button>`).join('');
  $('#wrTabs').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{SFX.click();wrTab=b.dataset.k;wrFocus=null;wrView=wrTab==='tail'?'back':'face';renderWardrobe();}));
  const grid=$('#wrGrid');grid.innerHTML='';
  const headOnly=wrTab==='hat'||wrTab==='face'||wrTab==='eyes';
  for(const item of ITEMS[wrTab].list){
    const own=owns(wrTab,item.id),on=save.look[wrTab]===item.id;
    const b=document.createElement('button');
    b.className='item'+(on?' sel':'')+(wrFocus===item.id?' focus':'')+(own?'':' locked');
    const c=document.createElement('canvas');c.width=260;c.height=240;const g=c.getContext('2d');
    const L=tryLook(wrTab,item.id);
    if(headOnly)drawCat(g,130,150+66*2.6,2.6,{look:L,view:'face',expr:'idle',headOnly:true});
    else drawCat(g,130,234,1.95,{look:L,view:wrTab==='tail'?'back':'face',expr:'idle',sway:0.1});
    b.appendChild(c);
    const tag=on?'<span class="tag">Wearing</span>':own?'':item.price<0?'<span class="price">Secret!</span>':`<span class="price">${ICON.fish}${item.price}</span>`;
    b.insertAdjacentHTML('beforeend',`<span class="nm">${item.name}</span>${tag}`);
    b.setAttribute('aria-label',`${item.name}${on?', wearing':own?'':item.price<0?', secret':', costs '+item.price+' fish'}`);
    b.addEventListener('click',()=>{
      if(own){save.look[wrTab]=item.id;persist();wrFocus=null;SFX.mew();refreshLook();}
      else{wrFocus=item.id;SFX.click();}
      renderWardrobe();
    });
    grid.appendChild(b);
  }
  renderBuyBar();drawPreview();
}
function renderBuyBar(){
  const bar=$('#wrBuy');
  if(!wrFocus){const cur=itemOf(wrTab,save.look[wrTab]);bar.innerHTML=`<div class="msg">Wearing: ${cur?cur.name:'—'}<small>Tap something to try it on. Earn fish by racing and learning!</small></div>`;return;}
  const item=itemOf(wrTab,wrFocus);
  if(item.price<0){bar.innerHTML=`<div class="msg">${item.name}: secret!<small>Look for the heart-shaped stone in the wall near Meganebashi and tap it.<br>めがねばしの ちかくの ハートの石を さがそう</small></div>`;return;}
  const short=item.price-save.fish;
  bar.innerHTML=`<div class="msg">${item.name}<small>${short>0?`You need ${short} more fish. Race, practise and try River Run to earn them!`:'Buy it to keep it forever.'}</small></div>
    <button class="btn" id="wrBuyBtn" ${short>0?'disabled':''}>${ICON.fish}Buy for ${item.price}</button>`;
  const bb=$('#wrBuyBtn');if(bb)bb.addEventListener('click',()=>{
    save.fish-=item.price;save.owned[wrTab+':'+item.id]=true;save.look[wrTab]=item.id;persist();wrFocus=null;
    SFX.fanfare();setTimeout(()=>SFX.mew(),450);toast(`New ${ITEMS[wrTab].label.toLowerCase()}: ${item.name}!`);refreshLook();renderWardrobe();
  });
}
function refreshLook(){if(G.player&&G.screen==='title'){G.player.look=save.look;G.player.expr='happy';later(0.8,()=>{G.player.expr='idle';});}refreshTitle();}
$('#wrTurn').addEventListener('click',()=>{SFX.click();wrView=wrView==='face'?'back':'face';drawPreview();});
$('#btnCatsClose').addEventListener('click',()=>{SFX.click();show('#cats',0);refreshTitle();});

