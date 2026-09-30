"use strict";
/* Buttons, input, the frame loop and start-up */
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
    const q=LS.qs[LS.qi];if(e.key===' '||e.key==='Enter'){e.preventDefault();sayQ(q);return;}
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
  const ms=now-lastT,dt=Math.min(0.05,ms/1000);lastT=now;
  gfxSample(ms,lastFrameFull);
  update(dt);
  if(G.screen!=='map')render();
  requestAnimationFrame(frame);
}
fit();initVoices();
recPreload(COURSE.PHRASES.map(p=>({ph:p.f})));   // find out early which praise lines are recorded
setupLevel(TITLE_SCENE,'scene');refreshTitle();
if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('700 40px Andika'),document.fonts.load('800 40px "Baloo 2"')]).catch(()=>{});}
requestAnimationFrame(frame);
window.__G=G;
