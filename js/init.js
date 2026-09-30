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
$('#voiceSel').addEventListener('change',e=>{save.voice=e.target.value;persist();loadVoices();speak('cat');});
$('#spdNormal').addEventListener('click',()=>{save.slow=false;persist();syncSettings();speak('ship');});
$('#spdSlow').addEventListener('click',()=>{save.slow=true;persist();syncSettings();speak('ship');});
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

/* ---- buttons ---- */
$('#btnPlay').addEventListener('click',()=>{ensureAudio();SFX.click();goMap();});
$('#btnCats').addEventListener('click',()=>{ensureAudio();SFX.click();openCats();});
$('#btnRun').addEventListener('click',()=>{ensureAudio();SFX.click();startRun();});
$('#btnSettings1').addEventListener('click',()=>{ensureAudio();SFX.click();openSettings();});
$('#btnSettings2').addEventListener('click',()=>{SFX.click();openSettings();});
$('#btnMapBack').addEventListener('click',()=>{SFX.click();goTitle();});
$('#btnPause').addEventListener('click',()=>{SFX.click();pauseGame(true);});
$('#btnResume').addEventListener('click',()=>{SFX.click();pauseGame(false);});
$('#btnRestart').addEventListener('click',()=>{SFX.click();if(G.mode==='run')startRun();else startLevel(G.level);});
$('#btnToMap').addEventListener('click',()=>{SFX.click();if(G.mode==='run')goTitle();else goMap(G.level.id);});
$('#btnListen').addEventListener('click',()=>{ensureAudio();speakQ();});
$('#btnSlow').addEventListener('click',()=>{ensureAudio();speakQ(true);});
function pauseGame(on){if(G.screen!=='play'||G.finished&&on)return;G.paused=on;show('#pause',on);$('#btnToMap').textContent=G.mode==='run'?'Title screen':'River map';if(on){stopSpeech();}else if(G.accept)speakQ();}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.screen==='play'&&!G.paused&&!G.finished)pauseGame(true);});

/* ---- canvas input ---- */
function toStage(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
function stoneAtPoint(pt){
  if(G.screen!=='play'||G.rowIdx<0)return null;const row=G.rows[G.rowIdx];let best=null,bd=1e9;
  for(const s of row.stones){if(!s.active||s.gone||!s.hit)continue;const h=s.hit;
    if(pt.x>=h.x0&&pt.x<=h.x1&&pt.y>=h.y0&&pt.y<=h.y1){const d=Math.abs(pt.x-(h.x0+h.x1)/2);if(d<bd){bd=d;best=s;}}}
  return best;
}
cv.addEventListener('pointermove',e=>{const pt=toStage(e);G.hover=stoneAtPoint(pt);cv.style.cursor=G.hover&&G.accept?'pointer':(heartAt(pt)?'pointer':'default');});
cv.addEventListener('pointerdown',e=>{
  const pt=toStage(e);ensureAudio();
  if(heartAt(pt)&&!save.heart){save.heart=true;save.look.neck='bell';persist();SFX.fanfare();
    toast('You found the heart stone! Your cat got a bell collar.<span class="jp">ハートの石を見つけた！すずのくびわをゲット！</span>',4200);buildTrack();return;}
  const s=stoneAtPoint(pt);if(s)choose(s);
  else if(G.screen==='title'){G.player.expr='happy';SFX.mew();later(0.7,()=>{G.player.expr='idle';});}
});
function heartAt(pt){const h=G.heartHit;return h&&G.screen==='play'&&pt.x>=h.x0&&pt.x<=h.x1&&pt.y>=h.y0&&pt.y<=h.y1;}
window.addEventListener('keydown',e=>{
  if(G.screen==='lesson'&&LS.phase==='practice'){
    const q=LS.qs[LS.qi];if(e.key===' '||e.key==='Enter'){e.preventDefault();speak(q.say);return;}
    const n=parseInt(e.key,10);if(n>=1&&n<=q.opts.length){const b=$('#lsCard').querySelectorAll('.optbtn')[n-1];if(b)practiceAnswer(b);}
    return;
  }
  if(G.screen!=='play'||G.paused)return;
  if(e.key===' '||e.key==='Enter'){e.preventDefault();speakQ();return;}
  if(e.key==='s'||e.key==='S'){speakQ(true);return;}
  if(e.key==='Escape'){pauseGame(true);return;}
  const n=parseInt(e.key,10);
  if(n>=1&&n<=4&&G.rowIdx>=0){const opts=G.rows[G.rowIdx].stones.filter(s=>s.active&&!s.gone).sort((a,b)=>a.x-b.x);if(opts[n-1])choose(opts[n-1]);}
});

/* ============================== LOOP ============================== */
let lastT=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-lastT)/1000);lastT=now;
  update(dt);
  if(G.screen!=='map')render();
  requestAnimationFrame(frame);
}
fit();
setupLevel(TITLE_SCENE);refreshTitle();
if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('700 40px Andika'),document.fonts.load('800 40px "Baloo 2"')]).catch(()=>{});}
requestAnimationFrame(frame);
window.__G=G;
