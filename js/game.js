"use strict";
/* ============================== LEVELS & QUESTIONS ============================== */
const {DESTS,CHAPTERS,LEVELS}=COURSE;
const ROWS=10;
const PRAISE=['Great!','Yes!','Super!','Nice!','Perfect!','Good ear!'];
const CHIPS={first:['First sound?','はじめの音は？'],last:['Last sound?','おわりの音は？'],word:['Which word?','どのことば？'],sound:['Which sound?','どの音？']};
function lv(id){return LEVELS.find(L=>L.id===id);}

/* Make one question. n = how many choices; say = force the spoken word (for review);
   sound = allow 'hear the sound, pick the letter' questions. */
function genOne(L,used,last,n,say,sound){
  n=n||L.n||4;const force=!!say;
  if(L.type==='first'||L.type==='last'){
    const letters=Object.keys(L.letters);
    const ans=say?letters.find(k=>L.letters[k].indexOf(say)>=0):pick(letters);
    if(!ans||ans===last.ans&&!say)return null;
    const words=L.letters[ans].filter(w=>!used.has(w));if(!words.length)return null;
    say=say||pick(words);
    const pool=letters.filter(x=>x!==ans&&!(L.conflict||[]).some(p=>p.indexOf(ans)>=0&&p.indexOf(x)>=0));
    const opts=shuffle([ans].concat(shuffle(pool).slice(0,n-1)));
    // some first-sound questions play the letter sound itself ("sss") instead of a word
    const snd=COURSE.soundId(ans);
    if(sound&&!force&&L.type==='first'&&L.sound&&snd&&!used.has('/'+snd)&&recHas({snd})!==false&&Math.random()<L.sound)
      return{type:'sound',say,snd,ans,opts,letter:true,lv:L.id};
    return{type:L.type,say,ans,opts,letter:true,lv:L.id};
  }
  let si;
  if(say){si=L.sets.findIndex(s=>s.t.indexOf(say)>=0);if(si<0)return null;}
  else{si=Math.random()*L.sets.length|0;if(si===last.set&&last.lv===L.id&&L.sets.length>1)return null;}
  const set=L.sets[si];
  if(!say){const targets=set.t.filter(w=>!used.has(w));if(!targets.length)return null;say=pick(targets);}
  const pool=set.t.concat(set.o).filter(w=>w!==say);
  return{type:'word',say,ans:say,opts:shuffle([say].concat(shuffle(pool).slice(0,n-1))),set:si,lv:L.id};
}
function srcFor(L){while(L.type==='mix')L=lv(pick(L.from));return L;}
function nextQuestion(L,used,last,n){
  let q=null;
  // words the player missed before come back now and then
  const rv=reviewPick(L);
  if(rv&&Math.random()<0.3&&!used.has(rv.w))q=genOne(lv(rv.lv),used,last,n,rv.w);
  for(let t=0;t<60&&!q;t++)q=genOne(srcFor(L),used,last,n,undefined,true);
  if(!q){used.clear();q=genOne(srcFor(L),used,{},n,undefined,true);}
  used.add(q.snd?'/'+q.snd:q.say);return q;
}
function makeQuestions(L,count,n){
  const qs=[],used=new Set();let last={};
  for(let r=0;r<count;r++){const q=nextQuestion(L,used,last,n);last={ans:q.ans,set:q.set,lv:q.lv};qs.push(q);}
  return qs;
}
/* ---- review list: missed words, kept per level ---- */
function reviewAdd(lvId,w){const a=save.review[lvId]||(save.review[lvId]=[]);if(a.indexOf(w)<0)a.push(w);if(a.length>12)a.shift();}
function reviewDrop(lvId,w){const a=save.review[lvId];if(!a)return;const i=a.indexOf(w);if(i>=0)a.splice(i,1);}
function reviewPick(L){
  const ids=L.type==='mix'?L.from:[L.id];const all=[];
  ids.forEach(id=>(save.review[id]||[]).forEach(w=>all.push({lv:id,w})));
  return all.length?pick(all):null;
}
/* ============================== GAME STATE ============================== */
const G={screen:'title',mode:'level',level:LEVELS[0],T:THEMES.morning,sp:null,dest:'mega',rows:[],rowIdx:-1,q:null,accept:false,racing:false,paused:false,
  misses:0,rowMiss:0,missed:[],firstTry:0,player:null,rivals:[],finished:false,place:0,finishOrder:[],time:0,lives:3,runCount:0,used:null,lastQ:{},
  sceneId:0,scenery:[],koi:[],streaks:[],parts:[],sparts:[],rings:[],timers:[],starts:[],hover:null,heartHit:null,camMode:'play'};
const RUN_THEMES=['morning','day','afternoon','sunset','night'];

function later(t,fn){G.timers.push({t,fn});}
function makeCat(look,x,isPlayer,idx){
  return{look,x,z:0,y:TOP_Y,row:-1,state:'idle',t:0,jump:null,sq:0,tilt:0,view:isPlayer?'face':'back',pview:isPlayer?'face':'back',turn:0,expr:'idle',
    blinkT:rand(1,4),blink:0,ph:rand(0,6),earT:rand(2,6),ear:0,wet:0,isPlayer,idx,done:false,timer:0,interval:5,busy:false,stand:{x,z:0},fallFrom:TOP_Y,fallDx:0,cheer:0};
}
function stoneAt(x,z,r,extra){return Object.assign({x,z,r,top:TOP_Y,active:false,labelT:0,labelA:0,gone:false,sink:0,sinking:false,wobble:0,hint:false,good:false,hit:null,word:null,correct:false,seed:Math.random()*100},extra||{});}
function makeRow(r,q){
  const z=(r+1)*ROW_DZ,n=q.opts.length,sp=n===3?1.6:1.5;
  const stones=q.opts.map((w,i)=>stoneAt((i-(n-1)/2)*sp+(hash(r,i)-.5)*.12,z+(hash(i,r)-.5)*.18,STONE_R,{word:w,correct:w===q.ans,letter:!!q.letter}));
  const rival=[stoneAt(-RIVAL_X,z,RIVAL_R),stoneAt(RIVAL_X,z,RIVAL_R)];
  return{z,q,stones,rival};
}
/* River Run keeps a few rows ready ahead of the cat */
function ensureRows(upto){
  while(G.rows.length<=upto){const q=nextQuestion(G.level,G.used,G.lastQ);G.lastQ={ans:q.ans,set:q.set,lv:q.lv};G.rows.push(makeRow(G.rows.length,q));recPreload([qItem(q)]);}
}
function setTheme(name){G.T=THEMES[name];G.sp=getSprites(G.T);G.sceneId++;}
/* rows worth updating/drawing: a few behind the cat, several ahead */
function rowWindow(){if(G.mode!=='run')return[0,G.rows.length];const a=Math.max(0,G.rowIdx-3);return[a,Math.min(G.rows.length,Math.max(G.rowIdx,0)+9)];}
/* start loading the recordings a level will need */
function preloadLevel(L,qs){
  const items=[];
  qs.forEach(q=>items.push(qItem(q)));
  recPreload(items);
}

function setupLevel(L,mode){
  G.mode=mode==='run'?'run':'level';G.level=L;setTheme(L.theme);
  const run=G.mode==='run';
  G.dest=run?null:L.dest;
  FZ=run?1e4:(ROWS+1)*ROW_DZ;ZB=FZ+2.7;
  G.used=new Set();G.lastQ={};
  if(run){G.rows=[];ensureRows(10);}
  else{const qs=makeQuestions(L,ROWS);G.rows=qs.map((q,r)=>makeRow(r,q));if(mode!=='scene')preloadLevel(L,qs);}
  G.starts=[stoneAt(0,0,0.66),stoneAt(-RIVAL_X,0,0.52),stoneAt(RIVAL_X,0,0.52)];
  G.rowIdx=-1;G.q=null;G.accept=false;G.racing=false;G.paused=false;G.misses=0;G.rowMiss=0;G.missed=[];G.firstTry=0;G.lives=3;G.runCount=0;
  G.finished=false;G.place=0;G.finishOrder=[];G.parts=[];G.sparts=[];G.rings=[];G.timers=[];G.hover=null;G.camMode='play';
  G.player=makeCat(save.look,0,true,-1);
  const r1=randomLook(save.look.coat),r2=randomLook(r1.coat);
  G.rivals=save.rivals&&!run?[makeCat(r1,-RIVAL_X,false,0),makeCat(r2,RIVAL_X,false,1)]:[];
  G.rivals.forEach(r=>{r.interval=L.rival*rand(.85,1.15);});
  // scenery: each stretch of river is seeded differently
  const R=mulberry((typeof L.id==='number'?L.id:77)*97+3);const sc=[];
  const zEnd=run?1400:ZB+60,near=z=>!run&&Math.abs(z-ZB)<5;
  for(const side of[-1,1]){
    for(let z=-6;z<zEnd-20;z+=2.5){if(!run&&Math.abs(z-ZB)<1.2&&G.dest!=='steps')continue;sc.push({k:'post',x:side*(RH+0.14),z});}
    for(let z=-6+R()*3;z<zEnd-15;z+=3+R()*1.6){if(near(z))continue;if(R()<.82)sc.push({k:'img',x:side*(RH+0.5),y:WALL_H-0.1,z,img:'hyd',i:(R()*3)|0,w:1.55,h:1.03});}
    for(let z=-5+R()*6;z<zEnd;z+=6.5+R()*5){if(near(z))continue;const wil=R()<.6;
      sc.push({k:'img',x:side*(RH+2.3+R()*2),y:WALL_H,z,img:wil?'willow':'round',i:(R()*2)|0,w:wil?4.4:4.2,h:wil?6.2:5.0});}
    for(let z=3+R()*4;z<(run?zEnd:ZB-2);z+=9)sc.push({k:'lamp',x:side*(RH+0.8),z});
  }
  if(G.dest)sc.push({k:'dest',z:ZB});
  sc.sort((a,b)=>b.z-a.z);G.scenery=sc;G.sceneId++;
  G.koi=[];const kc=['#ff8a3d','#fff4e8','#e2442f','#ffd7b0'];
  for(let i=0;i<6;i++)G.koi.push({x:rand(-3.5,3.5),z:rand(2,run?20:ZB-3),h:rand(0,TAU),v:rand(.25,.45),c:kc[i%4],c2:kc[(i+1)%4],ph:rand(0,6)});
  G.streaks=[];for(let i=0;i<90;i++)G.streaks.push({x:rand(-RH+.3,RH-.3),z:rand(0,60),len:rand(.3,.9),a:rand(.3,1)});
  cam.x=0;cam.y=CAM_Y;cam.z=-CAM_BACK;
}

/* ---------- cat motion ---------- */
function jumpCat(c,tx,tz,ty,opt,onLand){
  opt=opt||{};
  c.jump={fx:c.x,fz:c.z,fy:c.y,tx,tz,ty,h:opt.h==null?0.85:opt.h,dur:opt.dur||0.5,onLand};
  c.state='crouch';c.t=0;c.expr='idle';
}
function catVisible(c){const p=P(c.x,c.y,c.z);return p&&p.dz<30;}
function updateCat(c,dt){
  c.t+=dt;
  // idle life
  c.blinkT-=dt;if(c.blinkT<0){c.blink=1;if(c.blinkT<-0.12){c.blinkT=rand(2,5);c.blink=0;}}
  c.earT-=dt;c.ear=c.earT<0?0.28:0;if(c.earT<-0.14)c.earT=rand(2.5,6);
  if(c.wet>0)c.wet=Math.max(0,c.wet-dt*0.45);
  if(c.turn>0)c.turn=Math.max(0,c.turn-dt/0.18);
  switch(c.state){
    case 'crouch':{c.sq=0.2*clamp(c.t/0.09,0,1);c.view='back';if(c.t>=0.09){c.state='air';c.t=0;if(catVisible(c))SFX.hop(c.isPlayer?1:0.4);}break;}
    case 'air':{
      const j=c.jump,u=clamp(c.t/j.dur,0,1);
      c.x=lerp(j.fx,j.tx,u);c.z=lerp(j.fz,j.tz,u);c.y=lerp(j.fy,j.ty,u)+j.h*4*u*(1-u);
      c.sq=u<0.3?-0.13*(1-u/0.3):0;c.tilt=(j.tx-j.fx)*0.06*(1-2*u);
      if(u>=1){c.x=j.tx;c.z=j.tz;c.y=j.ty;c.tilt=0;c.state='land';c.t=0;if(catVisible(c))SFX.land(c.isPlayer?1:0.4);
        spawnRing(c.x,c.z,0.45);}
      break;}
    case 'land':{
      const u=clamp(c.t/0.16,0,1);c.sq=0.22*(1-u)*Math.cos(u*Math.PI*0.5);
      if(u>=1){c.sq=0;c.state='idle';c.t=0;const cb=c.jump&&c.jump.onLand;c.jump=null;if(cb)cb();}
      break;}
    case 'fall':{const u=clamp(c.t/0.32,0,1);c.y=lerp(c.fallFrom,-0.44,u*u);c.x+=c.fallDx*dt;c.tilt=Math.sin(u*3)*0.2;c.view='face';c.expr='oops';break;}
    case 'swim':{c.y=-0.44+Math.sin(c.t*9)*0.035;c.tilt=Math.sin(c.t*7)*0.08;c.wet=1;break;}
    case 'shake':{const u=clamp(c.t/0.45,0,1);c.tilt=Math.sin(c.t*42)*0.14*(1-u);c.sq=0;if(Math.random()<0.6)spawnDrop(c.x,c.y+0.5,c.z);break;}
    case 'cheer':{const ph=(c.t*2.2)%1;c.y=SLAB_TOP+Math.sin(ph*Math.PI)*0.35;c.sq=ph<0.1?0.15:ph>0.9?0.12:-0.05;break;}
    default:{c.sq*=Math.pow(0.001,dt);c.tilt*=Math.pow(0.001,dt);}
  }
  // a quick squash whenever the cat turns round, so front/back swaps read as a turn
  if(c.view!==c.pview){c.pview=c.view;c.turn=1;}
}

/* ---------- flow ---------- */
function speakQ(slow){if(G.q)sayQ(G.q,{turtle:!!slow});}
function setChip(q){const c=CHIPS[q.type]||CHIPS.word;$('#chip').innerHTML=`${c[0]} <span class="jp">${c[1]}</span>`;}
function activateRow(r){
  if(G.mode==='run'){
    ensureRows(r+6);
    const ti=Math.min(RUN_THEMES.length-1,Math.floor(r/8));
    if(THEMES[RUN_THEMES[ti]]!==G.T){setTheme(RUN_THEMES[ti]);toast(['','The sun is high','Afternoon on the river','The sun is setting…','Night falls. Lanterns on!'][ti]);}
  }
  G.rowIdx=r;const row=G.rows[r];G.q=row.q;G.rowMiss=0;
  row.stones.forEach(s=>{s.active=true;s.labelT=0;});
  setChip(row.q);
  later(0.12,()=>speakQ());
  G.accept=true;
  if(!G.racing)later(1.4,()=>{if(G.screen==='play')G.racing=true;});
}
function choose(st){
  const pl=G.player;
  if(!G.accept||G.paused||G.finished||pl.state!=='idle'||!st.active||st.gone)return;
  ensureAudio();G.accept=false;G.hover=null;
  const row=G.rows[G.rowIdx],r=G.rowIdx,q=G.q;
  if(st.correct){
    if(G.rowMiss===0){G.firstTry++;reviewDrop(q.lv,q.say);}
    st.good=true;row.stones.forEach(s=>{if(s!==st)s.active=false;});
    jumpCat(pl,st.x,st.z,TOP_Y,{},()=>{
      pl.row=r;pl.stand={x:st.x,z:st.z};pl.view='face';pl.expr='happy';SFX.good();
      if(G.mode==='run'){G.runCount=r+1;updateRunHud();}
      sparkle(st);popWorldText(pick(PRAISE),st.x,st.z,'#ffc83d');
      later(0.35,()=>{st.active=false;});
      later(0.8,()=>{if(pl.expr==='happy'&&!G.finished)pl.expr='idle';});
      if(G.mode!=='run'&&r===ROWS-1)later(0.4,finalHop);else later(0.3,()=>activateRow(r+1));
    });
  }else{
    G.misses++;G.rowMiss++;if(G.missed.indexOf(q.say)<0)G.missed.push(q.say);
    reviewAdd(q.lv,q.say);persist();
    if(G.mode==='run'){G.lives--;updateRunHud();}
    st.active=false;
    const back={x:pl.stand.x,z:pl.stand.z};
    jumpCat(pl,st.x,st.z,TOP_Y,{},()=>{
      st.wobble=1;SFX.bad();pl.view='face';pl.expr='oops';
      later(0.2,()=>{st.sinking=true;pl.state='fall';pl.t=0;pl.fallFrom=pl.y;pl.fallDx=0;});
      later(0.52,()=>{pl.state='swim';pl.t=0;splash(pl.x,pl.z,1);SFX.splash(1);popWorldText(G.mode==='run'&&G.lives<=0?'Splash!':'Oops! Listen again',st.x,st.z,'#ffffff');});
      later(1.25,()=>{
        if(G.mode==='run'&&G.lives<=0){later(0.4,endRun);return;}
        jumpCat(pl,back.x,back.z,TOP_Y,{h:0.95,dur:0.55},()=>{
          pl.state='shake';pl.t=0;pl.view='face';pl.expr='idle';SFX.mew();
          later(0.45,()=>{
            if(G.finished)return;
            pl.state='idle';pl.tilt=0;st.gone=true;
            const left=row.stones.filter(s=>!s.gone&&!s.correct).length;
            if(G.rowMiss>=2||left===0)row.stones.forEach(s=>{if(s.correct)s.hint=true;});
            G.accept=true;speakQ();
          });
        });
      });
    });
  }
}
function finalHop(){
  const pl=G.player;
  jumpCat(pl,0,FZ,SLAB_TOP,{h:1.05,dur:0.6},finishLevel);
}
function finishLevel(){
  const pl=G.player;G.finished=true;G.accept=false;G.q=null;
  G.place=G.rivals.length?G.finishOrder.length+1:0;
  pl.view='face';pl.expr='happy';pl.state='cheer';pl.t=0;
  G.camMode='finish';SFX.fanfare();setTimeout(()=>SFX.mew(),500);
  confetti();
  $('#rowNum').textContent=ROWS;
  later(2.4,showResults);
}
function endRun(){
  G.finished=true;G.accept=false;G.q=null;
  SFX.mew();later(0.6,showRunResults);
}
function rivalHop(rv){
  const next=rv.row+1;
  if(next>=ROWS){
    jumpCat(rv,Math.sign(rv.x)*2.5,FZ,SLAB_TOP,{h:1.0,dur:0.6},()=>{rv.done=true;rv.row=ROWS;rv.view='face';rv.expr='happy';G.finishOrder.push(rv);});
    return;
  }
  const st=G.rows[next].rival[rv.idx];
  const slip=next>0&&Math.random()<G.level.slip;
  jumpCat(rv,st.x,st.z,TOP_Y,{},()=>{
    rv.row=next;
    if(slip){
      rv.busy=true;
      later(0.15,()=>{rv.state='fall';rv.t=0;rv.fallFrom=TOP_Y;rv.fallDx=-Math.sign(rv.x)*0.9;});
      later(0.47,()=>{rv.state='swim';rv.t=0;splash(rv.x,rv.z,0.7);if(catVisible(rv))SFX.splash(0.35);});
      later(1.35,()=>{jumpCat(rv,st.x,st.z,TOP_Y,{h:0.8,dur:0.5},()=>{rv.state='shake';rv.t=0;later(0.45,()=>{rv.state='idle';rv.busy=false;rv.tilt=0;});});});
    }
  });
}

/* ---------- particles ---------- */
function spawnRing(x,z,r){G.rings.push({x,z,t:0,max:0.9,r:r||0.5});}
function spawnDrop(x,y,z){G.parts.push({x:x+rand(-.25,.25),y,z:z+rand(-.1,.1),vx:rand(-1.4,1.4),vy:rand(.5,2),vz:rand(-.4,.4),life:.5,max:.5});}
function splash(x,z,v){for(let i=0;i<22*v;i++)G.parts.push({x,y:0.05,z,vx:rand(-1.3,1.3),vy:rand(1.4,3.2),vz:rand(-.8,.8),life:rand(.5,.85),max:.85});spawnRing(x,z,.4);spawnRing(x,z,.7);}
function sparkle(st){const e=gEll(st.x,TOP_Y,st.z,st.r,st.r);if(!e)return;for(let i=0;i<16;i++){const a=rand(0,TAU),sp=rand(120,320);G.sparts.push({k:'star',x:e.x,y:e.y-20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-120,life:.8,max:.8,r:rand(6,12),c:pick(['#ffc83d','#ffffff','#ff9a5a','#8fe3d6'])});}}
function popWorldText(text,x,z,color){const p=P(x,TOP_Y+1.1,z);if(!p)return;G.sparts.push({k:'text',x:p.x,y:p.y,vx:0,vy:-60,life:1.2,max:1.2,text,c:color});}
function confetti(){const cols=['#ff7a3d','#ffc83d','#3fb068','#56b7e6','#e0719a','#ffffff'];for(let i=0;i<160;i++)G.sparts.push({k:'conf',x:rand(0,W),y:rand(-300,-10),vx:rand(-40,40),vy:rand(120,260),life:4,max:4,r:rand(6,12),c:pick(cols),rot:rand(0,6),vr:rand(-6,6)});}

/* ============================== UPDATE ============================== */
function update(dt){
  G.time+=dt;
  if(G.paused)return;
  // timers
  if(G.timers.length){const due=[];for(const t of G.timers){t.t-=dt;if(t.t<=0)due.push(t);}if(due.length){G.timers=G.timers.filter(t=>t.t>0);due.forEach(t=>t.fn());}}
  updateCat(G.player,dt);
  for(const rv of G.rivals){
    updateCat(rv,dt);
    if(G.screen!=='play'||!G.racing||rv.done||rv.busy||rv.state!=='idle')continue;
    rv.timer+=dt;
    let iv=rv.interval;const lead=rv.row-G.player.row;
    if(lead>=2)iv*=1.35;if(lead>=4)iv*=1.7;if(lead<=-2)iv*=0.8;if(G.finished)iv=0.9;
    if(rv.timer>=iv){rv.timer=0;rv.interval=G.level.rival*rand(.8,1.25);rivalHop(rv);}
  }
  // stones (only the rows near the cat: River Run keeps adding rows)
  const [ra,rb]=rowWindow();
  for(let ri=ra;ri<rb;ri++)for(const s of G.rows[ri].stones){
    const tgt=s.active?1:0;s.labelT=s.active?Math.min(1,s.labelT+dt/0.35):s.labelT;
    s.labelA+=(tgt-s.labelA)*Math.min(1,dt*10);
    if(s.wobble>0)s.wobble=Math.max(0,s.wobble-dt*3);
    if(s.sinking)s.sink=Math.min(1,s.sink+dt/0.7);
  }
  // koi
  for(const k of G.koi){k.ph+=dt;k.h+=Math.sin(k.ph*.7)*dt*.6;k.x+=Math.cos(k.h)*k.v*dt;k.z+=Math.sin(k.h)*k.v*dt;
    if(Math.abs(k.x)>RH-.8){k.h=Math.PI-k.h;k.x=clamp(k.x,-RH+.8,RH-.8);}
    if(G.mode==='run'&&k.z<cam.z+2){k.z+=rand(18,26);continue;}
    if(k.z<cam.z+2||k.z>ZB-1.5){k.h=-k.h;k.z=clamp(k.z,cam.z+2,ZB-1.5);}}
  for(const s of G.streaks){s.z-=0.55*dt;if(s.z<cam.z+0.6)s.z+=60;}
  // particles
  for(const p of G.parts){p.vy-=9*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.life-=dt;if(p.y<0&&p.vy<0){p.life=0;}}
  G.parts=G.parts.filter(p=>p.life>0);
  for(const r of G.rings)r.t+=dt;G.rings=G.rings.filter(r=>r.t<r.max);
  for(const p of G.sparts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='star'){p.vy+=500*dt;p.vx*=0.97;}if(p.k==='conf'){p.rot+=p.vr*dt;p.vx+=Math.sin(G.time*3+p.r)*20*dt;}}
  G.sparts=G.sparts.filter(p=>p.life>0);
  // camera
  const pl=G.player;let tz=pl.z-CAM_BACK,tx=pl.x*0.5,ty=CAM_Y;
  if(G.camMode==='finish'){tz=FZ-4.8;tx=0;ty=2.35;}
  if(G.screen==='title'){tz=-CAM_BACK;tx=Math.sin(G.time*0.25)*0.35;}
  if(G.screen==='lesson'){tz=-CAM_BACK;tx=0;}   // still camera behind the lesson card = cheap cached frames
  const k=1-Math.exp(-dt*(G.camMode==='finish'?1.6:5.5));
  cam.z+=(tz-cam.z)*k;cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
  // settle exactly once we're within a fraction of a pixel, so the scenery cache can kick in
  if(Math.abs(tz-cam.z)<0.003)cam.z=tz;if(Math.abs(tx-cam.x)<0.002)cam.x=tx;if(Math.abs(ty-cam.y)<0.002)cam.y=ty;
  // title idle: occasionally mew/look
  if(G.screen==='title'&&pl.state==='idle'){pl.view='face';}
  updateHud();
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
  const d='M60 740 C 110 650, 60 600, 190 560 S 390 520, 330 440 S 250 330, 400 300 S 600 330, 560 230 S 600 120, 690 104';
  deco+=`<path d="${d}" fill="none" stroke="#3f8f8a" stroke-width="58" stroke-linecap="round"/>`;
  deco+=`<path id="riverCore" d="${d}" fill="none" stroke="#7fcac2" stroke-width="44" stroke-linecap="round"/>`;
  deco+=`<path d="${d}" fill="none" stroke="#e8fbf8" stroke-width="3" stroke-dasharray="10 18" stroke-linecap="round" opacity=".8"/>`;
  deco+=`<g transform="translate(690 100)"><rect x="-52" y="-18" width="104" height="30" rx="6" fill="#a9a093" stroke="#1f2a44" stroke-width="4"/><path d="M-46 12 v-6 a18 18 0 0 1 36 0 v6z M10 12 v-6 a18 18 0 0 1 36 0 v6z" fill="#2f5d6a"/><path d="M-46 12 v6 a18 18 0 0 0 36 0 v-6z M10 12 v6 a18 18 0 0 0 36 0 v-6z" fill="#2f5d6a" opacity=".45"/></g>`;
  deco+=`<g font-family="Baloo 2, sans-serif" font-weight="800"><text x="690" y="58" text-anchor="middle" font-size="24" fill="#1f2a44">Meganebashi</text><text x="690" y="164" text-anchor="middle" font-size="15" fill="#43537a" font-family="M PLUS Rounded 1c, sans-serif">眼鏡橋</text>`;
  deco+=`<text x="160" y="700" text-anchor="middle" font-size="22" fill="#1f2a44">Dejima</text><text x="160" y="672" text-anchor="middle" font-size="15" fill="#43537a" font-family="M PLUS Rounded 1c, sans-serif">出島</text></g>`;
  svg.innerHTML=deco+'<g id="nodes"></g>';
  const path=svg.querySelector('#riverCore');let PL=1000;try{PL=path.getTotalLength();}catch(e){}
  const cur=currentLevelId();
  mapSel=sel||mapSel||cur;if(!isUnlocked(mapSel))mapSel=cur;
  const N=LEVELS.length;
  // small landmark marks across the river where each stretch ends
  let marks='',html='';
  LEVELS.forEach((L,i)=>{
    let pt={x:100+i*45,y:600-i*38},p2=pt;
    try{pt=path.getPointAtLength(PL*(0.1+i*(0.8/(N-1))));}catch(e){}
    if(L.dest!=='mega'){try{const a=path.getPointAtLength(PL*(0.1+i*(0.8/(N-1)))+34),b=path.getPointAtLength(PL*(0.1+i*(0.8/(N-1)))+38);
      const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+90;const col={wood:'#c8423a',arch:'#b9a88c',steps:'#9a9185'}[L.dest];
      marks+=`<rect x="-30" y="-4" width="60" height="8" rx="3" fill="${col}" stroke="#1f2a44" stroke-width="2.5" transform="translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`;}catch(e){}}
    const un=isUnlocked(L.id),st=save.stars[L.id]|0,col=un?GROUP_COL[L.theme]:'#b9c3cc';
    const selR=L.id===mapSel?`<circle r="36" fill="none" stroke="#ff7a3d" stroke-width="6"/>`:'';
    let stars='';for(let k=0;k<3;k++){stars+=`<path transform="translate(${-18+k*18} 36) scale(.68)" d="M0 -10l2.9 6 6.5.8-4.8 4.5 1.3 6.5L0 4.6l-5.9 3.2 1.3-6.5-4.8-4.5 6.5-.8z" fill="${k<st?'#ffc83d':'#ffffff'}" stroke="#1f2a44" stroke-width="2"/>`;}
    const label=un?`<text y="9" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="25" fill="#fff" stroke="#1f2a44" stroke-width="6" paint-order="stroke">${L.id}</text>`:
      `<g transform="translate(-12 -13) scale(1)" color="#6b7684">${ICON.lock.replace('<svg ','<svg width="24" height="24" ')}</g>`;
    const catMark=L.id===cur&&un?`<image href="${catIcon(save.look,32)}" x="-24" y="-86" width="48" height="48"><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="1.2s" repeatCount="indefinite"/></image>`:'';
    html+=`<g class="node" data-id="${L.id}" transform="translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})" tabindex="0" role="button" aria-label="Level ${L.id} ${L.title}${un?'':' locked'}">
      ${selR}<circle class="nd" r="26" fill="${col}" stroke="#1f2a44" stroke-width="4"/>${label}${stars}${catMark}</g>`;
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
  $('#lvCard').innerHTML=`<div class="lv-num">Level ${L.id}</div>
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
      return `<div class="ls-row"><div class="gtile">${esc(r.g)}</div><div class="ls-words">${r.w.map(w=>wordBtn(w,hl(w,r.g,r.at))).join('')}</div></div>`;
    }).join('');
    card.innerHTML=lessonTop('Learn · まなぼう')+`
      <div class="ls-body"><div class="ls-tip">${esc(c.tip)}<span class="jp">${c.jp}</span></div>
        <div class="ls-rows${many?' many':''}">${rows}</div></div>
      <div class="ls-foot"><button class="skip" id="lsSkip">Skip to the race</button><canvas id="lsCat" width="300" height="320"></canvas>
        <div style="display:flex;gap:12px">${LS.card>0?`<button class="btn ghost" id="lsBack">${ICON.back}Back</button>`:''}
        <button class="btn teal" id="lsHear">${ICON.speaker}Hear all</button>
        <button class="btn" id="lsNext">${LS.card<L.teach.length-1?'Next':'Practice'}${ICON.play}</button></div></div>`;
    card.querySelectorAll('.wbtn[data-w]').forEach(b=>b.addEventListener('click',()=>{ensureAudio();speak(b.dataset.w,0.8);LS.expr='happy';drawLessonCat();}));
    $('#lsHear').addEventListener('click',()=>speak(cardWords(c).join(', '),0.8));
    $('#lsNext').addEventListener('click',()=>{SFX.click();if(LS.card<L.teach.length-1){LS.card++;renderLesson();}else startPractice();});
    const bk=$('#lsBack');if(bk)bk.addEventListener('click',()=>{SFX.click();LS.card--;renderLesson();});
    setTimeout(()=>{if(G.screen==='lesson'&&LS.phase==='learn')speak(cardWords(c).join(', '),0.8);},350);
  }else if(LS.phase==='practice'){
    const q=LS.qs[LS.qi],chip=CHIPS[q.type]||CHIPS.word;
    card.innerHTML=lessonTop('Practice · れんしゅう')+`
      <div class="ls-body"><div class="ls-tip">${chip[0]}<span class="jp">${chip[1]}</span></div>
        <div class="pr-say"><button class="listen-btn" id="prListen"><span class="spk">${ICON.speaker}</span>Listen</button><button class="slow-btn" id="prSlow" aria-label="Listen slowly">${ICON.turtle}</button></div>
        <div class="pr-opts">${q.opts.map((o,i)=>`<button class="optbtn" data-i="${i}">${esc(o)}</button>`).join('')}</div>
        <div class="pr-fb" id="prFb"></div></div>
      <div class="ls-foot"><button class="skip" id="lsSkip">Skip to the race</button><canvas id="lsCat" width="300" height="320"></canvas>
        <div style="font-weight:800;font-size:24px;color:var(--ink2)">Question ${LS.qi+1} / ${LS.qs.length}</div></div>`;
    $('#prListen').addEventListener('click',()=>speak(q.say));
    $('#prSlow').addEventListener('click',()=>speak(q.say,0.55));
    card.querySelectorAll('.optbtn').forEach(b=>b.addEventListener('click',()=>practiceAnswer(b)));
    setTimeout(()=>{if(G.screen==='lesson'&&LS.phase==='practice')speak(q.say);},300);
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
    fb.innerHTML=`${pick(PRAISE)} <span style="color:var(--ink2)">“${esc(q.say)}”</span>`;fb.style.color='var(--goodD)';
    setTimeout(()=>{if(LS.phase!=='practice')return;LS.qi++;LS.miss=0;LS.busy=false;if(LS.qi>=LS.qs.length)LS.phase='ready';renderLesson();},1100);
  }else{
    LS.miss++;b.classList.add('bad');SFX.bad();LS.expr='oops';drawLessonCat();
    reviewAdd(q.lv,q.say);persist();
    fb.textContent='Not quite. Listen again!';fb.style.color='var(--bad)';
    if(LS.miss>=2||q.opts.length===2)$('#lsCard').querySelectorAll('.optbtn').forEach(x=>{if(q.opts[+x.dataset.i]===q.ans)x.classList.add('hint');});
    setTimeout(()=>speak(q.say,0.7),500);
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
