"use strict";
/* ============================== THEMES ============================== */
const THEMES={
  morning:{sky:['#8ccbea','#cfe9ef','#f7efd9'],sun:{x:.8,y:86,r:34,c:'#fff3c4'},hillFar:'#a8c8c6',hillNear:'#86b4a2',
    houses:['#f4ece2','#e9ddd0','#dde6ec','#f1e0cc','#e8e2f0'],roofs:['#7d6a60','#65788a','#9b5f50','#6e6a82'],
    water:['#b3dcd6','#5fa7a3','#2f7c80'],streak:'#eafaf7',wall:'#a39888',wallDark:'#6e6558',coping:'#c7bdad',moss:'#6f8757',
    stoneTop:'#dcd5c8',stoneSide:'#9a9185',stoneDark:'#5e574e',bridge:'#a9a093',fog:'#cfe6ea',fogAmt:.75,leaf:'#8cbf5a',leafDark:'#5e9a45',clouds:true},
  day:{sky:['#5fb4e6','#a9daf2','#e6f5f5'],sun:{x:.64,y:58,r:30,c:'#fffbe0'},hillFar:'#9cc3b8',hillNear:'#6fa98b',
    houses:['#f6f1ea','#ece2d6','#dfe9ef','#f4e4cf','#ebe5f2'],roofs:['#6e5d55','#5a6f84','#9b5f50','#5f5b76'],
    water:['#9fd8d0','#3f9c98','#1f6f75'],streak:'#effcfa',wall:'#ab9f8f',wallDark:'#6f6659',coping:'#cfc5b5',moss:'#6a8a52',
    stoneTop:'#e2dccf',stoneSide:'#9f968a',stoneDark:'#5e574e',bridge:'#b0a699',fog:'#c8e6ee',fogAmt:.7,leaf:'#7fbf4f',leafDark:'#4f9140',clouds:true},
  afternoon:{sky:['#79b3d9','#cfe3e6','#fbe7c2'],sun:{x:.2,y:112,r:38,c:'#ffe7a6'},hillFar:'#b3c1b4',hillNear:'#8aa991',
    houses:['#f5eadb','#ecdcc6','#e2e6e2','#f3dcc2','#e9e0ea'],roofs:['#7d624f','#5f6f7d','#a15c46','#6c6178'],
    water:['#cfe0cf','#6aa39b','#3a7676'],streak:'#fff6e2',wall:'#ad9f89',wallDark:'#6f6456',coping:'#d4c7b1',moss:'#71844f',
    stoneTop:'#e6dccb',stoneSide:'#a59884',stoneDark:'#62584b',bridge:'#b3a791',fog:'#efe5cc',fogAmt:.72,leaf:'#93b957',leafDark:'#65903f',clouds:true},
  sunset:{sky:['#4d5aa8','#e98f7a','#ffd29a'],sun:{x:.5,y:186,r:48,c:'#ffcf80'},hillFar:'#8f7aa3',hillNear:'#6b5f86',
    houses:['#e9c9b8','#dcb8b0','#c9b7c9','#e8c2a4','#d4bfd0'],roofs:['#5b4450','#4a4d6a','#7a4040','#51466a'],
    water:['#f3bf9e','#9a85a6','#4e517f'],streak:'#ffe2c6',wall:'#9d8a86',wallDark:'#5f5055',coping:'#bfa8a0',moss:'#6d6f55',
    stoneTop:'#dcc4b6',stoneSide:'#957f7a',stoneDark:'#54464a',bridge:'#a38f8a',fog:'#f2b797',fogAmt:.7,leaf:'#7a9a55',leafDark:'#556f3f',vignette:.25,lamps:true},
  night:{sky:['#0f1638','#26306a','#4a4282'],moon:{x:.8,y:78,r:26},stars:true,hillFar:'#2d3566',hillNear:'#212a52',
    houses:['#3a3f6a','#343962','#40406e'],roofs:['#1c2040','#232748'],windows:true,
    water:['#4a4f8a','#1e2b52','#101a36'],streak:'#ffd79a',wall:'#5d5a6e',wallDark:'#34324a',coping:'#76738b',moss:'#3f4a4c',
    stoneTop:'#b2afc2',stoneSide:'#6d6a80',stoneDark:'#3a3850',bridge:'#7d7a90',fog:'#2c3468',fogAmt:.78,leaf:'#3f5f4a',leafDark:'#2d4639',vignette:.4,lanterns:true,lamps:true}
};
for(const k in THEMES){const T=THEMES[k];T.name=k;T.c={};['wall','wallDark','coping','moss','stoneTop','stoneSide','stoneDark','bridge','fog','streak'].forEach(n=>T.c[n]=hex(T[n]));}

/* ============================== WORLD CONSTANTS ============================== */
const W=1280,H=720,HY=212,F=539,CAM_BACK=3.5,CAM_Y=2.8;
const ROW_DZ=2.3,TOP_Y=0.28,STONE_R=0.56,RIVAL_R=0.46,RIVAL_X=3.6;
const RH=4.8,WALL_H=3.5,SLAB_TOP=0.22,CAT_H=0.92;
const ROWS=10;            // stones per level
let FZ=(ROWS+1)*ROW_DZ,ZB=FZ+2.7;   // finish slab and landmark; pushed far away in River Run
const ARCH_X=2.45,ARCH_R=2.05,ARCH_CY=0.15;
const cam={x:0,y:CAM_Y,z:-CAM_BACK};
function P(x,y,z){const dz=z-cam.z;if(dz<0.12)return null;const s=F/dz;return{x:W/2+(x-cam.x)*s,y:HY+(cam.y-y)*s,s,dz};}
function gEll(x,y,z,rx,rz){const c=P(x,y,z),n=P(x,y,z-rz),f=P(x,y,z+rz);if(!c||!n||!f)return null;return{x:c.x,y:(n.y+f.y)/2,rx:rx*c.s,ry:Math.max(0.4,(n.y-f.y)/2),s:c.s,dz:c.dz};}
function fogF(dz,T){return clamp((dz-7)/55,0,1)*T.fogAmt;}
function poly(pts,fill){const p=[];for(const a of pts){const q=P(a[0],a[1],a[2]);if(!q)return false;p.push(q);}ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}return true;}

/* ============================== CANVAS ============================== */
const cv=$('#cv');
let ctx=cv.getContext('2d');          // pointed at the scenery cache while that is being drawn
const stage=$('#stage');
let viewScale=1;
/* Picture quality. The canvas is drawn at one of these pixel scales (1 = one canvas
   pixel per screen pixel of the 1280x720 stage). 'auto' starts sharp and steps down
   on computers that can't keep up, and remembers the step for next time. */
function gfxLevels(){
  const dpr=Math.min(2,window.devicePixelRatio||1),l=[dpr];
  if(dpr>1.01)l.push(1);
  [0.85,0.72,0.6].forEach(v=>{if(v<l[l.length-1]-0.01)l.push(v);});
  return l;
}
const GFX={i:0,n:0,sum:0,bad:0,good:0,floor:0,fn:0};
function gfxIndex(){
  const L=gfxLevels();
  if(save.gfx==='high')return 0;
  if(save.gfx==='fast')return L.length-1;
  return clamp(GFX.i,0,L.length-1);
}
function fit(){
  const vw=window.innerWidth||1280,vh=window.innerHeight||720;
  const s=Math.min(vw/W,vh/H);viewScale=s;
  stage.style.transform=`translate(${(vw-W*s)/2}px,${(vh-H*s)/2}px) scale(${s})`;
  const q=gfxLevels()[gfxIndex()];
  const bw=Math.round(Math.min(2560,W*s*q)),bh=Math.round(bw*H/W);
  if(cv.width!==bw||cv.height!==bh){cv.width=bw;cv.height=bh;}
}
/* start one step sharper than last time, so a computer that got faster (or a
   one-off slow moment) doesn't stay blurry forever */
GFX.i=Math.max(0,(save.gfxBudget|0)-1);
/* Called every frame with the time since the last frame.
   - Cheap frames (scenery copied from the cache) show how fast the screen/browser lets
     us go at best: 16.7 ms on a normal 60 Hz screen, 33 ms with a 30 Hz screen or
     Chrome's battery saver. That is the "floor".
   - Full frames (camera moving) are the slow ones. Only if they are well above the
     floor is the computer struggling, and the resolution steps down.
   - A level that has run well for a while is remembered, so the sharper start sticks. */
function gfxSample(ms,full){
  if(save.gfx!=='auto'||document.hidden||ms>200)return;
  if(G.screen!=='play'){GFX.n=0;GFX.sum=0;return;}
  // floor = the low end of cheap-frame times (follows fast frames quickly, slow ones slowly)
  if(!full){GFX.fn++;GFX.floor=GFX.fn===1?ms:GFX.floor+(ms-GFX.floor)*(ms<GFX.floor?0.3:0.01);return;}
  if(GFX.fn<30)return;                             // don't judge until the floor is known
  GFX.n++;GFX.sum+=ms;
  if(GFX.n<45)return;
  const avg=GFX.sum/GFX.n;GFX.n=0;GFX.sum=0;
  const limit=Math.max(24,GFX.floor*1.4);         // ~40 fps on a 60 Hz screen
  if(avg>limit){GFX.bad++;GFX.good=0;}else{GFX.bad=0;GFX.good++;}
  if(GFX.bad>=2&&GFX.i<gfxLevels().length-1){
    GFX.i++;GFX.bad=0;save.gfxBudget=GFX.i;persist();fit();
  }else if(GFX.good>=4&&(save.gfxBudget|0)>GFX.i){
    save.gfxBudget=GFX.i;persist();              // this sharper level is fine here: keep it
  }
}
window.addEventListener('resize',fit);

/* ============================== SPRITES ============================== */
const spriteCache={};
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function willowSprite(T,seed){
  const c=makeCanvas(300,420),g=c.getContext('2d'),R=mulberry(seed);
  g.lineCap='round';g.strokeStyle='#5b4636';g.lineWidth=18;g.beginPath();g.moveTo(150,420);g.quadraticCurveTo(138,300,158,185);g.stroke();
  g.lineWidth=9;g.beginPath();g.moveTo(154,250);g.quadraticCurveTo(110,200,86,150);g.moveTo(157,212);g.quadraticCurveTo(200,170,218,128);g.stroke();
  for(let i=0;i<16;i++){g.fillStyle=i%3?T.leaf:T.leafDark;g.globalAlpha=.9;g.beginPath();g.ellipse(150+(R()-.5)*190,105+(R()-.5)*80,38+R()*28,24+R()*12,0,0,TAU);g.fill();}
  for(let i=0;i<110;i++){
    const x0=150+(R()-.5)*240,y0=85+R()*70,len=130+R()*200;
    g.strokeStyle=R()<.5?T.leaf:T.leafDark;g.globalAlpha=.9;g.lineWidth=2+R()*2.4;
    g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x0+(R()-.5)*16,y0+len*.5,x0+(x0-150)*.12+(R()-.5)*10,Math.min(410,y0+len));g.stroke();
  }
  g.globalAlpha=1;return c;
}
function roundTreeSprite(T,seed){
  const c=makeCanvas(300,360),g=c.getContext('2d'),R=mulberry(seed);
  g.fillStyle='#5b4636';g.fillRect(138,220,24,140);
  for(let i=0;i<26;i++){const a=R()*TAU,r=R()*85;g.fillStyle=i<10?T.leafDark:T.leaf;g.beginPath();g.arc(150+Math.cos(a)*r*1.1,150+Math.sin(a)*r*.8,40+R()*26,0,TAU);g.fill();}
  for(let i=0;i<12;i++){const a=R()*TAU,r=R()*70;g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.arc(130+Math.cos(a)*r,120+Math.sin(a)*r*.7,16+R()*12,0,TAU);g.fill();}
  return c;
}
function hydSprite(T,seed,cols){
  const c=makeCanvas(240,160),g=c.getContext('2d'),R=mulberry(seed);
  for(let i=0;i<14;i++){g.fillStyle=i%2?T.leafDark:T.leaf;g.beginPath();g.ellipse(30+R()*180,95+R()*55,26,15,(R()-.5)*1.4,0,TAU);g.fill();}
  const balls=5+(R()*3|0);
  for(let b=0;b<balls;b++){
    const bx=35+R()*170,by=55+R()*55,br=22+R()*10,col=cols[b%cols.length];
    g.fillStyle=col;g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();
    for(let f=0;f<22;f++){const a=R()*TAU,r=R()*br*.85;const fx=bx+Math.cos(a)*r,fy=by+Math.sin(a)*r;
      g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(fx,fy,4.5,0,TAU);g.fill();
      g.fillStyle=col;g.beginPath();g.arc(fx+.6,fy+.6,3.4,0,TAU);g.fill();}
    g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.arc(bx+4,by+6,br*.8,0,Math.PI);g.fill();
  }
  return c;
}
function hillsSprite(T){
  const c=makeCanvas(W+360,230),g=c.getContext('2d'),R=mulberry(7);
  const base=230;
  function ridge(amp,yb,col,seed){const r=mulberry(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,base);
    for(let x=0;x<=c.width;x+=20){const y=yb-amp*(0.55+0.45*Math.sin(x*0.004+r()*0.2+seed))-18*Math.sin(x*0.013+seed*2);g.lineTo(x,y);}
    g.lineTo(c.width,base);g.closePath();g.fill();}
  ridge(90,150,T.hillFar,3);
  ridge(60,196,T.hillNear,9);
  // hillside houses (Nagasaki climbs its hills)
  for(let i=0;i<150;i++){
    const x=R()*c.width,y=150+R()*70;
    const w=7+R()*9,h=5+R()*6;
    g.fillStyle=pick.call(null,T.houses);g.fillRect(x,y,w,h);
    g.fillStyle=T.roofs[(R()*T.roofs.length)|0];g.fillRect(x-1,y-3,w+2,3.5);
    if(T.windows&&R()<.6){g.fillStyle='#ffd77a';g.fillRect(x+w*.3,y+h*.35,2.2,2.2);}
  }
  for(let i=0;i<40;i++){g.fillStyle=T.leafDark;g.globalAlpha=.55;g.beginPath();g.arc(R()*c.width,165+R()*55,4+R()*6,0,TAU);g.fill();}
  g.globalAlpha=1;
  return c;
}
function getSprites(T){
  if(spriteCache[T.name])return spriteCache[T.name];
  const hydCols=[['#6f8ee0','#8aa3ea','#a07ad6'],['#a07ad6','#c29be6','#e79bc0'],['#e79bc0','#f2b6d2','#b9c9f0']];
  const s={willow:[willowSprite(T,11),willowSprite(T,23)],round:[roundTreeSprite(T,5),roundTreeSprite(T,17)],hyd:hydCols.map((c,i)=>hydSprite(T,31+i,c)),hills:hillsSprite(T)};
  return spriteCache[T.name]=s;
}
/* ============================== RENDER ============================== */
/* Everything behind the stones that only changes when the camera moves: hills, trees,
   walls, water, the landmark. While the camera is still (most of the time a child is
   thinking) it is drawn once into an off-screen canvas and then copied each frame. */
const SC={cv:null,g:null,key:'',still:0,lx:NaN,ly:NaN,lz:NaN};
function drawScenery(T){
  drawHills(T);
  drawOutside(T);
  drawWater(T);
  drawWallReflections(T);
  drawDest(T,'reflect');
  drawWalls(T);
  drawDest(T,'inner');
}
function sceneryCached(T,k){
  const key=[cam.x,cam.y,cam.z,G.sceneId,T.name,cv.width,cv.height,G.dest,FZ].join('|');
  if(!SC.cv||SC.cv.width!==cv.width||SC.cv.height!==cv.height){SC.cv=makeCanvas(cv.width,cv.height);SC.g=SC.cv.getContext('2d');SC.key='';}
  if(key!==SC.key){
    const g=SC.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,SC.cv.width,SC.cv.height);g.setTransform(k,0,0,k,0,0);
    const main=ctx;ctx=g;
    try{drawScenery(T);}finally{ctx=main;}
    SC.key=key;
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(SC.cv,0,0);ctx.setTransform(k,0,0,k,0,0);
}
let lastFrameFull=true;
function render(){
  const k=cv.width/W;ctx.setTransform(k,0,0,k,0,0);
  const T=G.T;
  drawSky(T);
  const still=cam.x===SC.lx&&cam.y===SC.ly&&cam.z===SC.lz;
  SC.lx=cam.x;SC.ly=cam.y;SC.lz=cam.z;SC.still=still?SC.still+1:0;
  if(SC.still>=2){sceneryCached(T,k);lastFrameFull=false;}
  else{drawScenery(T);lastFrameFull=true;}
  // moving things on the water, drawn over the scenery
  drawWaterLife(T);
  if(G.dest==='steps')drawBunting(T);
  if(T.lanterns)drawLanternStrings(T);
  drawHeartTwinkle();
  // sorted world drawables
  const D=[];
  const zmin=cam.z+0.25,zmax=cam.z+42;
  const addStone=s=>{if(s.z>zmin&&s.z<zmax&&!(s.gone&&s.sink>=1))D.push({z:s.z,f:()=>drawStone(s,T)});};
  G.starts.forEach((s,i)=>{if(i===0||G.rivals.length)addStone(s);});
  G.rows.forEach(r=>{r.stones.forEach(addStone);if(G.rivals.length)r.rival.forEach(addStone);});
  if(G.mode!=='run')D.push({z:FZ,f:()=>drawSlab(T)});
  const cats=[G.player].concat(G.rivals);
  cats.forEach(c=>{if(c.z>zmin-0.2)D.push({z:c.z-0.06,f:()=>drawCatWorld(c,T)});});
  G.parts.forEach(p=>{if(p.z>zmin)D.push({z:p.z-0.07,f:()=>drawDrop(p)});});
  D.sort((a,b)=>b.z-a.z);
  for(const d of D)d.f();
  // labels on top of the sorted scene would ignore occlusion; they are drawn inside drawStone instead
  drawScreenParts();
}
/* The darker edges at sunset and night. Blending a full-screen gradient over the canvas
   every frame was the most expensive single draw, so it is a CSS layer over the canvas
   instead (same centre and radii), which the browser composites almost for free. */
function syncVignette(T){
  const v=$('#vig');if(!v)return;
  v.style.background=T.vignette?`radial-gradient(circle at ${W/2}px ${H*.55}px, rgba(10,10,40,0) ${H*.35}px, rgba(10,10,40,${T.vignette}) ${H*.95}px)`:'none';
}
function drawSky(T){
  const g=ctx.createLinearGradient(0,0,0,HY+20);g.addColorStop(0,T.sky[0]);g.addColorStop(0.6,T.sky[1]);g.addColorStop(1,T.sky[2]);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,HY+30);
  if(T.stars){const R=mulberry(3);for(let i=0;i<90;i++){const a=.35+.65*Math.abs(Math.sin(G.time*1.3+i));ctx.fillStyle=`rgba(255,255,240,${a*.8})`;ctx.fillRect(R()*W,R()*HY*.8,R()<.2?2.4:1.5,R()<.2?2.4:1.5);}}
  if(T.sun){const sx=T.sun.x*W,sy=T.sun.y;const h=ctx.createRadialGradient(sx,sy,T.sun.r*.6,sx,sy,T.sun.r*3.4);h.addColorStop(0,'rgba(255,248,210,.75)');h.addColorStop(1,'rgba(255,248,210,0)');ctx.fillStyle=h;ctx.fillRect(sx-T.sun.r*3.5,sy-T.sun.r*3.5,T.sun.r*7,T.sun.r*7);
    ctx.fillStyle=T.sun.c;ctx.beginPath();ctx.arc(sx,sy,T.sun.r,0,TAU);ctx.fill();}
  if(T.moon){const mx=T.moon.x*W,my=T.moon.y;const h=ctx.createRadialGradient(mx,my,10,mx,my,90);h.addColorStop(0,'rgba(255,240,200,.35)');h.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=h;ctx.fillRect(mx-90,my-90,180,180);
    ctx.fillStyle='#fff3cf';ctx.beginPath();ctx.arc(mx,my,T.moon.r,0,TAU);ctx.fill();ctx.fillStyle=T.sky[0];ctx.beginPath();ctx.arc(mx+11,my-7,T.moon.r*.85,0,TAU);ctx.fill();}
  if(T.clouds){for(let i=0;i<5;i++){const cx=((G.time*(5+i*1.7)+i*330)%(W+360))-180,cy=38+i*27;ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();
    ctx.ellipse(cx,cy,56,15,0,0,TAU);ctx.ellipse(cx-28,cy+4,32,12,0,0,TAU);ctx.ellipse(cx+26,cy-6,34,15,0,0,TAU);ctx.fill();}}
}
function drawHills(T){const img=G.sp.hills;ctx.drawImage(img,-180-cam.x*6,HY-img.height+14);}
function drawOutside(T){
  // rails along the wall tops
  for(const side of[-1,1]){
    const xr=side*(RH+0.14);
    for(const yy of[WALL_H+0.62,WALL_H+0.3]){
      poly([[xr,yy,cam.z+0.4],[xr,yy,cam.z+80],[xr,yy+0.07,cam.z+80],[xr,yy+0.07,cam.z+0.4]],rgb(shade(T.c.coping,-.25)));
    }
  }
  for(const o of G.scenery){
    const dz=o.z-cam.z;if(dz<0.5||dz>75)continue;
    if(o.k==='dest'){drawDest(T,'outer');continue;}
    if(o.k==='post'){const p=P(o.x,WALL_H,o.z);if(!p)continue;const w=0.2*p.s,h=0.82*p.s;const f=fogF(dz,T);
      ctx.fillStyle=rgb(mix(T.c.coping,T.c.fog,f));ctx.fillRect(p.x-w/2,p.y-h,w,h);ctx.fillStyle=rgb(mix(shade(T.c.coping,-.3),T.c.fog,f));ctx.fillRect(p.x-w/2,p.y-h,w,Math.max(1,h*.12));continue;}
    if(o.k==='lamp'){if(!T.lamps)continue;const p=P(o.x,WALL_H,o.z);if(!p)continue;const s=p.s;
      ctx.strokeStyle='#2b2d3a';ctx.lineWidth=Math.max(1,0.1*s);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-2.5*s);ctx.stroke();
      ctx.fillStyle='#2b2d3a';ctx.fillRect(p.x-0.2*s,p.y-2.95*s,0.4*s,0.08*s);
      ctx.fillStyle='#ffe2a0';ctx.fillRect(p.x-0.15*s,p.y-2.88*s,0.3*s,0.38*s);
      const g=ctx.createRadialGradient(p.x,p.y-2.7*s,1,p.x,p.y-2.7*s,1.4*s);g.addColorStop(0,'rgba(255,214,140,.55)');g.addColorStop(1,'rgba(255,214,140,0)');
      ctx.fillStyle=g;ctx.fillRect(p.x-1.4*s,p.y-4.1*s,2.8*s,2.8*s);continue;}
    if(o.k==='img'){const p=P(o.x,o.y,o.z);if(!p)continue;const w=o.w*p.s,h=o.h*p.s;
      ctx.drawImage(G.sp[o.img][o.i],p.x-w/2,p.y-h,w,h);
    }
  }
}
function drawWater(T){
  const zn=cam.z+0.15,zf=cam.z+140;
  const a=P(-RH,0,zn),b=P(-RH,0,zf),c=P(RH,0,zf),d=P(RH,0,zn);
  const g=ctx.createLinearGradient(0,HY,0,H);g.addColorStop(0,T.water[0]);g.addColorStop(0.18,T.water[1]);g.addColorStop(1,T.water[2]);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fill();
}
function drawWallReflections(T){
  for(const side of[-1,1]){const x=side*RH;poly([[x,0,cam.z+0.15],[x,0,cam.z+140],[x,-WALL_H*0.9,cam.z+140],[x,-WALL_H*0.9,cam.z+0.15]],rgb(T.c.wallDark,0.22));}
}
/* The open water: between the walls, in front of a bridge, and between the stone steps.
   Moving things on the water are clipped to it, because they are now drawn after the
   walls and the landmark and must not paint over them. */
function clipOpenWater(){
  const zn=cam.z+0.15,far=cam.z+140;
  let pts;
  if(G.dest==='steps'){const zs=FZ+0.75,xi=RH-1.25;
    pts=[[-RH,zn],[-RH,zs],[-xi,zs],[-xi,far],[xi,far],[xi,zs],[RH,zs],[RH,zn]];}
  else{const zf=G.dest?ZB-0.5:far;pts=[[-RH,zn],[-RH,zf],[RH,zf],[RH,zn]];}
  ctx.beginPath();let first=true;
  for(const[x,z]of pts){const q=P(x,0,Math.max(z,zn));if(!q)continue;if(first){ctx.moveTo(q.x,q.y);first=false;}else ctx.lineTo(q.x,q.y);}
  ctx.closePath();ctx.clip();
}
function drawWaterLife(T){
  // light moving across the bridge's reflection (the "spectacles")
  drawShimmer(T);
  ctx.save();clipOpenWater();
  // koi under the surface
  for(const k of G.koi){
    if(k.z-cam.z<1||k.z>ZB-1)continue;
    const hx=Math.cos(k.h)*.24,hz=Math.sin(k.h)*.24;
    const a=P(k.x+hx,-0.12,k.z+hz),b=P(k.x-hx,-0.12,k.z-hz);if(!a||!b)continue;
    const s=(a.s+b.s)/2;const wig=Math.sin(G.time*6+k.ph)*0.12*s;
    ctx.globalAlpha=0.55;ctx.lineCap='round';
    ctx.strokeStyle=k.c;ctx.lineWidth=0.13*s;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+wig*.3,(a.y+b.y)/2,b.x+wig,b.y);ctx.stroke();
    ctx.fillStyle=k.c2;ctx.beginPath();ctx.arc(lerp(a.x,b.x,.35),lerp(a.y,b.y,.35),0.045*s,0,TAU);ctx.fill();
    ctx.fillStyle=k.c;ctx.beginPath();ctx.moveTo(b.x+wig,b.y);ctx.lineTo(b.x+wig+(b.x-a.x)*.35+0.06*s,b.y+(b.y-a.y)*.35);ctx.lineTo(b.x+wig+(b.x-a.x)*.35-0.06*s,b.y+(b.y-a.y)*.35);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
  }
  // current streaks drifting downstream (none behind a bridge: it hides that water)
  ctx.lineCap='round';
  const zHide=G.dest&&G.dest!=='steps'?ZB-0.5:1e9;
  for(const s of G.streaks){
    const dz=s.z-cam.z;if(dz<0.6||s.z>zHide||s.z>ZB-0.5&&s.z<ZB+1.5)continue;
    const a=P(s.x-s.len/2,0,s.z),b=P(s.x+s.len/2,0,s.z);if(!a||!b)continue;
    const al=s.a*clamp(1-dz/45,0,1)*clamp(dz/2,0,1)*0.55;if(al<0.02)continue;
    ctx.strokeStyle=rgb(T.c.streak,al);ctx.lineWidth=Math.max(1,0.035*a.s);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  // rings
  for(const r of G.rings){const u=r.t/r.max;const e=gEll(r.x,0,r.z,r.r*(0.6+u*1.2),r.r*(0.6+u*1.2));if(!e)continue;
    ctx.strokeStyle=`rgba(255,255,255,${(1-u)*0.6})`;ctx.lineWidth=Math.max(1,0.04*e.s);ctx.beginPath();ctx.ellipse(e.x,e.y,e.rx,e.ry,0,0,TAU);ctx.stroke();}
  ctx.restore();
}
/* brick colour by brick and fog step, kept per theme */
const brickCache={};
function brickColor(T,side,ci,i,dz){
  const m=brickCache[T.name]||(brickCache[T.name]=new Map());
  const key=((i+4096)*8+ci)*2+(side>0?1:0);
  let e=m.get(key);
  if(!e){
    const h=hash(i*7+side*101,ci);
    let col=shade(T.c.wall,(h-0.5)*0.24);
    if(ci===0)col=mix(col,T.c.moss,0.5);else if(ci===1)col=mix(col,T.c.moss,0.2);
    if(ci===7)col=mix(T.c.coping,[255,255,255],(h-.5)*.1);
    e={col,s:[]};m.set(key,e);
  }
  const f=fogF(dz,T),step=Math.round(f*48);   // 48 fog steps: invisible banding
  return e.s[step]||(e.s[step]=rgb(mix(e.col,T.c.fog,step/48)));
}
function drawWalls(T){
  const CH=WALL_H/8,BL=1.08;
  for(const side of[-1,1]){
    const x=side*RH,zn=cam.z+0.15,zf=cam.z+140;
    const a=P(x,0,zn),b=P(x,0,zf),c=P(x,WALL_H,zf),d=P(x,WALL_H,zn);
    const p28=P(x,0,cam.z+30);
    const g=ctx.createLinearGradient(a.x,0,b.x,0);
    g.addColorStop(0,rgb(T.c.wallDark));
    const t28=clamp((p28.x-a.x)/((b.x-a.x)||1),0,1);
    g.addColorStop(Math.min(.98,t28),rgb(mix(T.c.wall,T.c.fog,fogF(30,T))));
    g.addColorStop(1,rgb(T.c.fog));
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fill();
    const zmax=cam.z+30;
    for(let ci=0;ci<8;ci++){
      const y0=ci*CH,y1=y0+CH,off=(ci%2)*BL*0.5+(ci%3)*0.21;
      const i0=Math.floor((zn-off)/BL);
      for(let i=i0;;i++){
        const z0=i*BL+off,z1=z0+BL;if(z0>zmax)break;
        const za=Math.max(z0+0.045,zn),zb=z1-0.045;if(zb<=za)continue;
        const dz=(za+zb)/2-cam.z;
        const ins=ci===7?0.02:0.045;
        poly([[x,y0+ins,za],[x,y0+ins,zb],[x,y1-ins,zb],[x,y1-ins,za]],brickColor(T,side,ci,i,dz));
      }
    }
    // wet line at the water
    poly([[x,0,zn],[x,0,zmax],[x,0.22,zmax],[x,0.22,zn]],rgb(T.c.wallDark,0.35));
  }
  // heart stone near Meganebashi (left bank)
  G.heartHit=null;G.heartTw=null;
  const hz=ZB-3.6,hy=1.25;const hc=G.dest==='mega'?P(-RH,hy,hz):null;
  if(hc&&hc.dz<26){
    ctx.beginPath();const pts=[];
    for(let i=0;i<=40;i++){const t=i/40*TAU;const hx=16*Math.pow(Math.sin(t),3),hyy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);
      const p=P(-RH,hy+hyy*0.022,hz+hx*0.024);if(!p)continue;pts.push(p);}
    if(pts.length>10){ctx.moveTo(pts[0].x,pts[0].y);pts.forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();
      ctx.fillStyle=rgb(mix(hex('#e3b2a8'),T.c.fog,fogF(hc.dz,T)*.8));ctx.fill();ctx.strokeStyle=rgb(T.c.wallDark,.8);ctx.lineWidth=Math.max(1,.03*hc.s);ctx.stroke();
      let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);});
      G.heartHit={x0:x0-8,x1:x1+8,y0:y0-8,y1:y1+8};
      G.heartTw={x:x1-4,y:y0+6};
    }
  }
}
function drawHeartTwinkle(){
  if(!G.heartTw||save.heart||G.screen!=='play')return;
  const tw=Math.sin(G.time*4)*.5+.5;ctx.fillStyle=`rgba(255,255,255,${.4+tw*.5})`;ctx.beginPath();ctx.arc(G.heartTw.x,G.heartTw.y,3+tw*3,0,TAU);ctx.fill();
}
/* ---------- landmarks at the end of each stretch ---------- */
const STONE_BRIDGES={
  mega:{arches:[[-ARCH_X,ARCH_R],[ARCH_X,ARCH_R]],deck:x=>3.55+0.35*Math.cos(x/6.9*Math.PI/2)},
  arch:{arches:[[0,3.0]],deck:x=>3.8+0.6*Math.cos(x/6.9*Math.PI/2),tint:'#c9b391'}
};
function bridgeFace(g,B){
  g.beginPath();g.moveTo(-6.9,-0.8);
  for(let i=0;i<=28;i++){const x=-6.9+13.8*i/28;g.lineTo(x,B.deck(x));}
  g.lineTo(6.9,-0.8);g.closePath();
  for(const[cx,r]of B.arches){g.moveTo(cx+r,-0.8);g.lineTo(cx+r,ARCH_CY);g.arc(cx,ARCH_CY,r,0,Math.PI,false);g.lineTo(cx-r,-0.8);g.closePath();}
}
function archHole(g,cx,r){g.beginPath();g.moveTo(cx+r,-0.8);g.lineTo(cx+r,ARCH_CY);g.arc(cx,ARCH_CY,r,0,Math.PI,false);g.lineTo(cx-r,-0.8);g.closePath();}
/* Sets up the landmark's flat drawing frame (metres, y up) on the plane z=ZB and clips it
   to the part inside the river, outside it, or its reflection. Returns false if not visible. */
function destFrame(T,mode){
  const p=P(0,0,ZB);if(!p)return null;const s=p.s;
  const g=ctx;g.save();
  g.translate(W/2-cam.x*s,HY+cam.y*s);g.scale(s,-s);
  if(mode==='reflect'){g.scale(1,-1);g.globalAlpha=0.42;}
  g.beginPath();
  if(mode==='outer'){g.rect(-9,WALL_H,9-RH,4);g.rect(RH,WALL_H,9-RH,4);}
  else g.rect(-RH,mode==='reflect'?0:-0.02,2*RH,6);
  g.clip();
  return{g,f:fogF(p.dz,T)*0.8};
}
function drawDest(T,mode){
  if(!G.dest)return;
  if(G.dest==='steps'){if(mode==='inner')drawSteps(T);return;}
  const fr=destFrame(T,mode);if(!fr)return;
  if(G.dest==='wood')drawWoodBridge(T,mode,fr.g,fr.f);else drawStoneBridge(T,mode,fr.g,fr.f,STONE_BRIDGES[G.dest]);
  fr.g.restore();
}
function drawShimmer(T){
  if(!G.dest||G.dest==='steps')return;
  const fr=destFrame(T,'reflect');if(!fr)return;
  const g=fr.g;g.globalAlpha=1;
  for(let i=0;i<9;i++){const yy=0.25+i*0.42;const w=0.6+hash(i,3)*1.6;const x0=((G.time*0.25+hash(i,7)*9)%9)-4.5;
    g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=0.05;g.beginPath();g.moveTo(x0,yy);g.lineTo(x0+w,yy);g.stroke();}
  g.restore();
}
function bridgeLanterns(g,T,mode,yOf){
  if(!T.lanterns||mode==='reflect')return;
  for(let i=-4;i<=4;i++){const x=i*1.3,y=yOf(x)-0.05;
    g.save();g.globalCompositeOperation='lighter';const lg=g.createRadialGradient(x,y,0.05,x,y,0.9);lg.addColorStop(0,'rgba(255,170,90,.55)');lg.addColorStop(1,'rgba(255,120,60,0)');g.fillStyle=lg;g.fillRect(x-1,y-1,2,2);g.restore();
    g.fillStyle='#e0413a';g.beginPath();g.ellipse(x,y,0.2,0.26,0,0,TAU);g.fill();g.fillStyle='#f6c451';g.fillRect(x-0.13,y+0.22,0.26,0.07);g.fillRect(x-0.13,y-0.29,0.26,0.07);}
}
function drawStoneBridge(T,mode,g,f,B){
  const base=mix(B.tint?mix(T.c.bridge,hex(B.tint),.55):T.c.bridge,T.c.fog,f);
  bridgeFace(g,B);
  const fg=g.createLinearGradient(0,4,0,0);fg.addColorStop(0,rgb(shade(base,.1)));fg.addColorStop(1,rgb(shade(base,-.18)));
  g.fillStyle=fg;g.fill('evenodd');
  g.save();bridgeFace(g,B);g.clip('evenodd');
  const R=mulberry(41);
  for(let row=0;row<12;row++){const y0=-0.8+row*0.42;for(let i=-9;i<9;i++){const x0=i*0.86+(row%2)*0.43+(R()-.5)*.1;const t=R();
    g.fillStyle=t>.5?`rgba(255,255,255,${(t-.5)*.22})`:`rgba(0,0,0,${(.5-t)*.2})`;g.fillRect(x0+0.03,y0+0.03,0.8,0.36);}}
  g.strokeStyle=rgb(shade(base,-.35),.5);g.lineWidth=0.03;
  for(let row=0;row<12;row++){g.beginPath();g.moveTo(-7,-0.8+row*0.42);g.lineTo(7,-0.8+row*0.42);g.stroke();}
  for(const[cx,r]of B.arches){
    g.beginPath();g.arc(cx,ARCH_CY,r+0.52,0,Math.PI,false);g.lineTo(cx-r,ARCH_CY);g.arc(cx,ARCH_CY,r,Math.PI,0,true);g.closePath();
    g.fillStyle=rgb(shade(base,.12));g.fill();g.strokeStyle=rgb(shade(base,-.4),.7);g.lineWidth=0.035;g.stroke();
    const n=Math.round(15*r/ARCH_R);
    for(let a=0;a<=Math.PI+1e-6;a+=Math.PI/n){g.beginPath();g.moveTo(cx+Math.cos(a)*r,ARCH_CY+Math.sin(a)*r);g.lineTo(cx+Math.cos(a)*(r+0.52),ARCH_CY+Math.sin(a)*(r+0.52));g.stroke();}
  }
  g.restore();
  // shade inside the arches so the openings read clearly
  for(const[cx,r]of B.arches){archHole(g,cx,r);const ag=g.createLinearGradient(0,ARCH_CY+r,0,0);ag.addColorStop(0,'rgba(12,22,34,.62)');ag.addColorStop(1,'rgba(12,22,34,.22)');g.fillStyle=ag;g.fill();
    g.beginPath();g.arc(cx,ARCH_CY,r-0.12,0.08,Math.PI-0.08,false);g.strokeStyle='rgba(10,18,28,.35)';g.lineWidth=0.24;g.stroke();}
  // parapet
  g.beginPath();for(let i=0;i<=28;i++){const x=-6.9+13.8*i/28;i?g.lineTo(x,B.deck(x)+0.5):g.moveTo(x,B.deck(x)+0.5);}
  for(let i=28;i>=0;i--){const x=-6.9+13.8*i/28;g.lineTo(x,B.deck(x));}g.closePath();
  g.fillStyle=rgb(shade(base,.18));g.fill();
  g.strokeStyle=rgb(shade(base,-.4),.8);g.lineWidth=0.04;g.stroke();
  for(let x=-6.3;x<=6.4;x+=1.26){g.beginPath();g.moveTo(x,B.deck(x));g.lineTo(x,B.deck(x)+0.5);g.stroke();}
  bridgeFace(g,B);g.strokeStyle=rgb(shade(base,-.45),.6);g.lineWidth=0.05;g.stroke();
  bridgeLanterns(g,T,mode,B.deck);
}
function drawWoodBridge(T,mode,g,f){
  const red=mix(hex('#c8423a'),T.c.fog,f),dark=mix(hex('#5a3b2a'),T.c.fog,f),gold=mix(hex('#e3b23c'),T.c.fog,f);
  const deck=x=>3.75+0.25*Math.cos(x/6.9*Math.PI/2);
  // piers
  for(const px of[-2.7,2.7])for(const dx of[-0.35,0.35]){
    g.fillStyle=rgb(dark);g.fillRect(px+dx-0.13,-0.8,0.26,deck(px)+0.8);
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(px+dx+0.05,-0.8,0.08,deck(px)+0.8);
  }
  for(const px of[-2.7,2.7]){g.strokeStyle=rgb(dark);g.lineWidth=0.1;g.beginPath();g.moveTo(px-0.35,0.6);g.lineTo(px+0.35,2.2);g.moveTo(px+0.35,0.6);g.lineTo(px-0.35,2.2);g.moveTo(px-0.45,3.1);g.lineTo(px+0.45,3.1);g.stroke();}
  // deck beam
  g.beginPath();for(let i=0;i<=28;i++){const x=-6.9+13.8*i/28;i?g.lineTo(x,deck(x)+0.45):g.moveTo(x,deck(x)+0.45);}
  for(let i=28;i>=0;i--){const x=-6.9+13.8*i/28;g.lineTo(x,deck(x)-0.05);}g.closePath();
  g.fillStyle=rgb(red);g.fill();g.strokeStyle=rgb(shade(red,-.45));g.lineWidth=0.05;g.stroke();
  g.fillStyle=rgb(shade(red,-.3));g.beginPath();for(let i=0;i<=28;i++){const x=-6.9+13.8*i/28;i?g.lineTo(x,deck(x)+0.08):g.moveTo(x,deck(x)+0.08);}
  for(let i=28;i>=0;i--){const x=-6.9+13.8*i/28;g.lineTo(x,deck(x)-0.05);}g.closePath();g.fill();
  // railing
  const top=x=>deck(x)+1.15;
  g.strokeStyle=rgb(red);g.lineCap='round';
  for(let x=-6.3;x<=6.4;x+=0.9){g.lineWidth=0.14;g.beginPath();g.moveTo(x,deck(x)+0.45);g.lineTo(x,top(x));g.stroke();}
  for(const[yo,w]of[[1.15,0.16],[0.8,0.08]]){g.lineWidth=w;g.beginPath();for(let i=0;i<=28;i++){const x=-6.9+13.8*i/28;i?g.lineTo(x,deck(x)+yo):g.moveTo(x,deck(x)+yo);}g.stroke();}
  // onion-shaped caps (giboshi) on the main posts
  for(const x of[-RH+0.2,RH-0.2,-1.5,1.5]){const y=top(x);
    g.fillStyle=rgb(gold);g.beginPath();g.moveTo(x-0.16,y);g.quadraticCurveTo(x-0.2,y+0.22,x,y+0.4);g.quadraticCurveTo(x+0.2,y+0.22,x+0.16,y);g.closePath();g.fill();
    g.strokeStyle=rgb(shade(gold,-.4));g.lineWidth=0.03;g.stroke();}
  bridgeLanterns(g,T,mode,deck);
}
function drawSteps(T){
  const N=7,dep=0.42,zs=FZ+0.75,zfar=zs+N*dep+0.6,w=1.25;
  const p=P(0,0,zs);if(!p)return;
  const f=fogF(p.dz,T);
  const topC=mix(T.c.stoneTop,T.c.fog,f),sideC=mix(T.c.stoneSide,T.c.fog,f),darkC=mix(T.c.stoneDark,T.c.fog,f);
  const yt=i=>SLAB_TOP+(i+1)*(WALL_H-SLAB_TOP)/N;
  for(const s of[-1,1]){
    const xw=s*RH,xi=s*(RH-w);
    // side of the staircase, facing the middle of the river
    const prof=[[xi,0,zs]];for(let i=0;i<N;i++){prof.push([xi,yt(i),zs+i*dep]);prof.push([xi,yt(i),zs+(i+1)*dep]);}
    prof.push([xi,yt(N-1),zfar]);prof.push([xi,0,zfar]);
    poly(prof,rgb(sideC));ctx.strokeStyle=rgb(darkC,.6);ctx.lineWidth=Math.max(1,.02*p.s);ctx.stroke();
    for(let i=N-1;i>=0;i--){
      const z0=zs+i*dep,z1=z0+dep,y0=i?yt(i-1):0,y1=yt(i);
      poly([[xi,y1,z0],[xw,y1,z0],[xw,y1,z1],[xi,y1,z1]],rgb(topC));ctx.strokeStyle=rgb(darkC,.5);ctx.stroke();
      poly([[xi,y0,z0],[xw,y0,z0],[xw,y1,z0],[xi,y1,z0]],rgb(mix(sideC,topC,.35)));ctx.stroke();
    }
    // wet line
    poly([[xi,0,zs],[xi,0.18,zs],[xi,0.18,zfar],[xi,0,zfar]],rgb(darkC,.35));
  }
}
function drawBunting(T){
  const N=7,yt=i=>SLAB_TOP+(i+1)*(WALL_H-SLAB_TOP)/N;
  // finish bunting across the river
  const zb=FZ+0.95;
  for(const s of[-1,1]){const a=P(s*(RH-0.15),yt(2),zb),b=P(s*(RH-0.15),WALL_H+1.7,zb);if(!a||!b)continue;
    ctx.strokeStyle='#5a3b2a';ctx.lineWidth=Math.max(2,0.09*a.s);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.fillStyle='#e3b23c';ctx.beginPath();ctx.arc(b.x,b.y,Math.max(2,0.08*a.s),0,TAU);ctx.fill();}
  const pts=[];for(let i=0;i<=24;i++){const u=i/24;const q=P(lerp(-RH+0.15,RH-0.15,u),WALL_H+1.6-Math.sin(u*Math.PI)*0.75,zb);if(q)pts.push(q);}
  if(pts.length>2){
    ctx.strokeStyle='rgba(40,30,30,.75)';ctx.lineWidth=Math.max(1,0.025*pts[0].s);ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.stroke();
    const cols=['#e5544a','#ffffff','#ffc83d','#56b7e6','#3fb068'];
    for(let i=1;i<pts.length-1;i++){const q=pts[i],n=pts[i+1],fl=0.34*q.s,sw=Math.sin(G.time*3+i)*0.06*q.s;
      ctx.fillStyle=cols[i%cols.length];ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(n.x,n.y);ctx.lineTo((q.x+n.x)/2+sw,(q.y+n.y)/2+fl);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(40,30,30,.35)';ctx.lineWidth=1;ctx.stroke();}
  }
}
function drawLanternStrings(T){
  let zs=ZB-4;if(zs>cam.z+45)zs-=Math.ceil((zs-cam.z-45)/5.5)*5.5;
  for(let z=zs;z>cam.z+1.5;z-=5.5){
    const pts=[];for(let i=0;i<=16;i++){const u=i/16;const x=lerp(-RH,RH,u);const y=WALL_H+0.9-Math.sin(u*Math.PI)*0.9;const p=P(x,y,z);if(!p)continue;pts.push(p);}
    if(pts.length<2)continue;const s=pts[0].s;
    ctx.strokeStyle='rgba(30,20,20,.7)';ctx.lineWidth=Math.max(1,0.03*s);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
    for(let i=2;i<=14;i+=2){const p=pts[i];if(!p)continue;const r=0.2*p.s;
      ctx.save();ctx.globalCompositeOperation='lighter';const lg=ctx.createRadialGradient(p.x,p.y+r*1.4,1,p.x,p.y+r*1.4,r*5);lg.addColorStop(0,'rgba(255,170,90,.45)');lg.addColorStop(1,'rgba(255,120,60,0)');ctx.fillStyle=lg;ctx.fillRect(p.x-r*5,p.y+r*1.4-r*5,r*10,r*10);ctx.restore();
      ctx.fillStyle=(i/2)%2?'#e0413a':'#f2a93b';ctx.beginPath();ctx.ellipse(p.x,p.y+r*1.4,r,r*1.3,0,0,TAU);ctx.fill();
      ctx.fillStyle='#3a2020';ctx.fillRect(p.x-r*.6,p.y+r*0.05,r*1.2,r*.22);ctx.fillRect(p.x-r*.6,p.y+r*2.6,r*1.2,r*.22);}
  }
}
function drawSlab(T){
  const z0=FZ-0.55,z1=FZ+0.55,x0=-4.4,x1=4.4,y=SLAB_TOP;
  const p=P(0,y,FZ);if(!p)return;const f=fogF(p.dz,T);
  const top=mix(T.c.stoneTop,T.c.fog,f),side=mix(T.c.stoneSide,T.c.fog,f);
  poly([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],rgb(top));
  poly([[x0,y,z0],[x1,y,z0],[x1,-0.12,z0],[x0,-0.12,z0]],rgb(side));
  const n=18;for(let i=0;i<n;i++){const xa=lerp(x0,x1,i/n),xb=lerp(x0,x1,(i+1)/n);
    poly([[xa,y-0.02,z0],[xb,y-0.02,z0],[xb,y-0.14,z0],[xa,y-0.14,z0]],i%2?'#ffffff':'#e5544a');}
  ctx.strokeStyle=rgb(T.c.stoneDark,.6);ctx.lineWidth=Math.max(1,.02*p.s);
  poly([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]]);ctx.stroke();
}
/* stone colours by fog step, kept per theme (they were mixed afresh for every stone, every frame) */
const stoneCache={};
function stoneColors(T,f){
  const a=stoneCache[T.name]||(stoneCache[T.name]=[]),step=Math.round(f*48);
  let c=a[step];if(c)return c;
  f=step/48;
  const sideC=mix(T.c.stoneSide,T.c.fog,f),darkC=mix(T.c.stoneDark,T.c.fog,f),topC=mix(T.c.stoneTop,T.c.fog,f);
  c={side:rgb(sideC),dark:rgb(darkC),edge:rgb(shade(darkC,-.3),.8),wet:rgb(shade(darkC,-.35),.45),
     hi:rgb(shade(topC,.18)),lo:rgb(shade(topC,-.08)),rim:rgb(shade(sideC,-.2),.7),
     speck:`rgba(80,70,60,${.18*(1-f)})`,moss:rgb(mix(T.c.moss,T.c.fog,f),.7),ripple:0.35*(1-f)};
  return a[step]=c;
}
function drawStone(st,T){
  const top=st.top-st.sink*0.95+(st.wobble?Math.sin(st.wobble*30)*0.03:0);
  const Tt=gEll(st.x,top,st.z,st.r*0.9,st.r*0.9),B=gEll(st.x,0,st.z,st.r*1.06,st.r*1.06);
  if(!Tt||!B)return;
  const f=fogF(B.dz,T),C=stoneColors(T,f);
  // ripple ring (behind the stone)
  const ph=(G.time*0.55+st.seed)%1;const rr=gEll(st.x,0,st.z,st.r*(1.12+ph*0.5),st.r*(1.12+ph*0.5));
  if(rr){ctx.strokeStyle=`rgba(255,255,255,${((1-ph)*C.ripple).toFixed(3)})`;ctx.lineWidth=Math.max(1,0.03*rr.s);ctx.beginPath();ctx.ellipse(rr.x,rr.y,rr.rx,rr.ry,0,0,TAU);ctx.stroke();}
  ctx.save();
  if(st.sink>0){ctx.beginPath();ctx.rect(0,0,W,B.y+B.ry*0.35);ctx.clip();ctx.globalAlpha=1-st.sink*0.4;}
  ctx.beginPath();ctx.moveTo(Tt.x-Tt.rx,Tt.y);ctx.lineTo(B.x-B.rx,B.y);ctx.ellipse(B.x,B.y,B.rx,B.ry,0,Math.PI,0,true);ctx.lineTo(Tt.x+Tt.rx,Tt.y);ctx.ellipse(Tt.x,Tt.y,Tt.rx,Tt.ry,0,0,Math.PI,true);ctx.closePath();
  const sg=ctx.createLinearGradient(0,Tt.y,0,B.y+B.ry);sg.addColorStop(0,C.side);sg.addColorStop(1,C.dark);
  ctx.fillStyle=sg;ctx.fill();
  ctx.strokeStyle=C.edge;ctx.lineWidth=Math.max(1,0.028*B.s);ctx.stroke();
  // wet band at the waterline
  ctx.beginPath();ctx.ellipse(B.x,B.y,B.rx,B.ry,0,0.15,Math.PI-0.15);ctx.strokeStyle=C.wet;ctx.lineWidth=Math.max(1,0.06*B.s);ctx.stroke();
  // top face
  ctx.beginPath();ctx.ellipse(Tt.x,Tt.y,Tt.rx,Tt.ry,0,0,TAU);
  const tg=ctx.createRadialGradient(Tt.x-Tt.rx*.3,Tt.y-Tt.ry*.4,1,Tt.x,Tt.y,Tt.rx*1.1);tg.addColorStop(0,C.hi);tg.addColorStop(1,C.lo);
  ctx.fillStyle=tg;ctx.fill();ctx.strokeStyle=C.rim;ctx.lineWidth=Math.max(1,0.02*B.s);ctx.stroke();
  // speckles and moss
  if(B.dz<22){ctx.fillStyle=C.speck;ctx.beginPath();const ex=Math.max(.8,.04*B.s),ey=Math.max(.5,.025*B.s);
    for(let i=0;i<6;i++){const a=hash(st.seed,i)*TAU,r=hash(i,st.seed)*.75,x=Tt.x+Math.cos(a)*r*Tt.rx,y=Tt.y+Math.sin(a)*r*Tt.ry;ctx.moveTo(x+ex,y);ctx.ellipse(x,y,ex,ey,0,0,TAU);}
    ctx.fill();
    if(hash(st.seed,9)>.45){ctx.fillStyle=C.moss;ctx.beginPath();ctx.ellipse(B.x-B.rx*.45,B.y-B.ry*.2,B.rx*.28,Math.max(1,(B.y-Tt.y)*.25),0.2,0,TAU);ctx.fill();}}
  ctx.restore();
  if(st.word&&st.labelA>0.01&&!st.sinking)drawLabel(st,Tt);else st.hit=null;
}
/* text width at 100px, per word (text width grows in step with the font size) */
const labelW={};
function wordW100(w){
  let v=labelW[w];if(v!=null)return v;
  ctx.font='700 100px Andika, "Comic Sans MS", sans-serif';v=ctx.measureText(w).width;
  // don't remember widths measured before the font has loaded
  if(!document.fonts||document.fonts.check('700 100px Andika'))labelW[w]=v;
  return v;
}
function drawLabel(st,Tt){
  const s=Tt.s;
  const letter=st.letter;
  let fs=letter?clamp(0.6*s,22,74):clamp(0.42*s,16,58);
  const w100=wordW100(st.word);
  let tw=w100*fs/100;
  const maxW=(letter?1.0:1.32)*s;
  if(tw+fs*0.7>maxW){const k=maxW/(tw+fs*0.7);fs*=k;tw=w100*fs/100;}
  fs=Math.round(fs*2)/2;
  ctx.font=`700 ${fs}px Andika, "Comic Sans MS", sans-serif`;
  const ph=letter?fs*1.25:fs*1.3,pw=Math.max(tw+fs*0.75,ph*1.05);
  const cx=Tt.x,cy=Tt.y-ph*0.32-Tt.ry*0.2;
  const hov=G.hover===st&&G.accept;
  let sc=easeOutBack(clamp(st.labelT,0,1))*(hov?1.1:1);
  if(st.hint)sc*=1+Math.sin(G.time*8)*0.05;
  ctx.save();ctx.globalAlpha=clamp(st.labelA,0,1);ctx.translate(cx,cy);ctx.scale(sc,sc);
  const r=Math.min(16,ph*0.35);
  if(st.hint){ctx.shadowColor='rgba(255,200,61,.95)';ctx.shadowBlur=24;}
  rr(-pw/2,-ph/2+3,pw,ph,r);ctx.fillStyle='rgba(20,30,50,.35)';ctx.fill();ctx.shadowBlur=0;
  rr(-pw/2,-ph/2,pw,ph,r);ctx.fillStyle=st.good?'#dff6e7':'#fffdf6';ctx.fill();
  ctx.lineWidth=Math.max(2,fs*0.09);ctx.strokeStyle=st.good?'#3fb068':st.hint?'#f2a900':hov?'#ff7a3d':'#1f2a44';ctx.stroke();
  ctx.fillStyle='#1f2a44';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(st.word,0,fs*0.04);
  ctx.restore();
  const hw=Math.max(pw/2*sc,Tt.rx)+6;
  st.hit={x0:cx-hw,x1:cx+hw,y0:cy-ph/2*sc-6,y1:Tt.y+Tt.ry+(Tt.s*0.3)};
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawCatWorld(c,T){
  const p=P(c.x,c.y,c.z);if(!p||p.dz<0.5)return;
  // ground under the cat: stone top, slab, or water
  let gy=0;
  if(c.state==='air'&&c.jump){const u=clamp(c.t/c.jump.dur,0,1);gy=u<0.5?(c.jump.fy>0?c.jump.fy:0):(c.jump.ty>0?c.jump.ty:0);}
  else gy=Math.max(0,Math.min(c.y,c.state==='cheer'?SLAB_TOP:TOP_Y));
  if(c.y>-0.05){const hgt=Math.max(0,c.y-gy);const e=gEll(c.x,gy+0.005,c.z,0.3*(1-Math.min(.5,hgt*.4)),0.3*(1-Math.min(.5,hgt*.4)));
    if(e){ctx.fillStyle=`rgba(20,25,35,${0.28*(1-Math.min(.6,hgt*.5))})`;ctx.beginPath();ctx.ellipse(e.x,e.y,e.rx,e.ry,0,0,TAU);ctx.fill();}}
  const k=CAT_H*p.s/100;
  const sway=c.state==='air'?-0.3:Math.sin(G.time*2.2+c.ph)*0.14;
  ctx.save();
  if(c.y<0.02){const wy=P(c.x,0,c.z);if(wy){ctx.beginPath();ctx.rect(0,0,W,wy.y+2);ctx.clip();}}
  drawCat(ctx,p.x,p.y,k,{look:c.look,view:c.view,expr:c.expr,sq:c.sq,tilt:c.tilt,sway,ear:c.ear,blink:c.blink,wet:c.wet>0.2,turn:c.turn});
  ctx.restore();
  if(c.state==='swim'){const e=gEll(c.x,0,c.z,0.42+Math.sin(G.time*6)*0.03,0.42);if(e){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,0.04*e.s);ctx.beginPath();ctx.ellipse(e.x,e.y,e.rx,e.ry,0,0,TAU);ctx.stroke();}}
}
function drawDrop(p){const q=P(p.x,p.y,p.z);if(!q)return;ctx.fillStyle=`rgba(235,248,255,${clamp(p.life/p.max,0,1)*.9})`;ctx.beginPath();ctx.arc(q.x,q.y,Math.max(1.2,0.045*q.s),0,TAU);ctx.fill();}
function drawScreenParts(){
  for(const p of G.sparts){const a=clamp(p.life/p.max,0,1);
    if(p.k==='star'){ctx.save();ctx.globalAlpha=a;ctx.translate(p.x,p.y);ctx.rotate(p.life*6);ctx.fillStyle=p.c;starPath(ctx,0,0,p.r,p.r*.45);ctx.fill();ctx.restore();}
    else if(p.k==='conf'){ctx.save();ctx.globalAlpha=Math.min(1,a*2);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore();}
    else if(p.k==='text'){ctx.save();ctx.globalAlpha=Math.min(1,a*2);const sc=easeOutBack(clamp((p.max-p.life)/0.3,0,1));ctx.translate(p.x,p.y);ctx.scale(sc,sc);
      ctx.font='800 38px "Baloo 2", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#1f2a44';ctx.strokeText(p.text,0,0);ctx.fillStyle=p.c;ctx.fillText(p.text,0,0);ctx.restore();}
  }
}
function starPath(g,x,y,R,r){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r:R;g.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}g.closePath();}
