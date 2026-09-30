"use strict";
/* ============================== CATS ============================== */
const COATS={
  chatora:{name:'Chatora',en:'Orange tabby',base:'#f4a259',dark:'#d0692f',muzzle:'#fff1df',bib:'#fff1df',pattern:'tabby',line:'#5a3422'},
  mike:{name:'Mike',en:'Calico',base:'#fbf6ee',p1:'#f0a45c',p2:'#3d3533',pattern:'calico',line:'#4a3a33'},
  hachiware:{name:'Hachiware',en:'Black and white',base:'#34313b',light:'#fbf8f3',feet:'#fbf8f3',pattern:'tuxedo',line:'#16151b',eye:'#9ad16a',darkFur:true},
  saba:{name:'Sabatora',en:'Grey tabby',base:'#a6afb8',dark:'#606b78',muzzle:'#eef1f4',bib:'#eef1f4',pattern:'tabby',line:'#39414b'},
  kuro:{name:'Kuro',en:'Black cat',base:'#2e2c35',pattern:'solid',line:'#121117',eye:'#f2c230',darkFur:true},
  kijitora:{name:'Kijitora',en:'Brown tabby',base:'#a8865f',dark:'#5a4230',muzzle:'#efe4d4',bib:'#efe4d4',pattern:'tabby',line:'#3a2a1d'},
  sabi:{name:'Sabi',en:'Tortoiseshell',base:'#3b2d2a',p1:'#c06d32',p2:'#6b4431',pattern:'tortie',line:'#1c1412',eye:'#e0b040',darkFur:true},
  shiro:{name:'Shiro',en:'White cat',base:'#fdfcf9',pattern:'solid',line:'#5b5f6b',eye:'#79c2ea'},
  siam:{name:'Shamu',en:'Siamese',base:'#f4e8d6',point:'#5b4136',feet:'#5b4136',pattern:'points',line:'#4a352b',eye:'#6fb6ec'},
  sakura:{name:'Sakura',en:'Cherry blossom',base:'#f8c6d6',dark:'#e58fae',muzzle:'#fff0f5',bib:'#fff0f5',pattern:'tabby',line:'#8a4460',eye:'#9a6bd6'}
};
const COAT_KEYS=Object.keys(COATS);

/* ---- wardrobe catalogue (price in fish; -1 = secret, found in the world) ---- */
const it=(id,name,price)=>({id,name,price});
const ITEMS={
  coat:{label:'Coat',jp:'け',list:[it('chatora','Chatora',0),it('mike','Mike',0),it('hachiware','Hachiware',0),it('saba','Sabatora',60),it('kuro','Kuro',80),
    it('kijitora','Kijitora',90),it('sabi','Sabi',110),it('shiro','Shiro',110),it('siam','Shamu',150),it('sakura','Sakura',220)]},
  tail:{label:'Tail',jp:'しっぽ',list:[it('hook','Lucky hook',0),it('long','Long',40),it('bob','Pom-pom',50),it('curl','Curly',60),it('fluffy','Fluffy',90),it('twin','Twin tails',180)]},
  hat:{label:'Hat',jp:'ぼうし',list:[it('none','No hat',0),it('ribbon','Ribbon',30),it('party','Party hat',40),it('straw','Straw hat',50),it('beanie','Beanie',60),
    it('beret','Beret',70),it('flower','Flowers',80),it('kasa','Kasa hat',100),it('crown','Crown',200)]},
  neck:{label:'Neck',jp:'くび',list:[it('none','Nothing',0),it('bandana','Bandana',30),it('bowtie','Bow tie',40),it('scarf','Scarf',60),it('bell','Bell collar',-1)]},
  face:{label:'Glasses',jp:'めがね',list:[it('none','No glasses',0),it('megane','Round glasses',80),it('shades','Sunglasses',100)]},
  eyes:{label:'Eyes',jp:'め',list:[it('auto','Natural',0),it('gold','Gold',20),it('green','Green',20),it('blue','Blue',20),it('odd','Odd eyes',80)]}
};
const SLOTS=Object.keys(ITEMS);
function itemOf(slot,id){return ITEMS[slot].list.find(i=>i.id===id);}
function owns(slot,id){const i=itemOf(slot,id);if(!i)return false;if(i.price===0)return true;if(i.price<0)return slot==='neck'&&id==='bell'&&save.heart;return !!save.owned[slot+':'+id];}
const EYE_COL={gold:'#f2c230',green:'#9ad16a',blue:'#79c2ea'};
function randomLook(avoidCoat){
  const r=a=>a[Math.random()*a.length|0].id;
  return{coat:pick(COAT_KEYS.filter(k=>k!==avoidCoat)),tail:r(ITEMS.tail.list),hat:Math.random()<.5?'none':r(ITEMS.hat.list),
    neck:Math.random()<.5?'none':r(ITEMS.neck.list.filter(i=>i.id!=='bell')),face:Math.random()<.15?r(ITEMS.face.list):'none',eyes:'auto'};
}

function E(g,cx,cy,rx,ry,rot){rot=rot||0;g.moveTo(cx+rx*Math.cos(rot),cy+rx*Math.sin(rot));g.ellipse(cx,cy,rx,ry,rot,0,TAU);}
const INK='#2a2230';

/* ---- back view body: round back, spine, the tail curls over the front ---- */
function backSil(g){g.beginPath();E(g,-16,-15,18,15.5);E(g,16,-15,18,15.5);E(g,0,-34,21.5,26);E(g,-20,-1.5,10,5);E(g,20,-1.5,10,5);}
function backBody(g){g.beginPath();E(g,-16,-15,18,15.5);E(g,16,-15,18,15.5);E(g,0,-34,21.5,26);}
function backFeet(g){g.beginPath();E(g,-20,-1.5,10,5);E(g,20,-1.5,10,5);}
function drawBodyBack(g,C,ow){
  backSil(g);g.strokeStyle=C.line;g.lineWidth=ow*2;g.stroke();
  backFeet(g);g.fillStyle=C.feet||C.base;g.fill();
  backBody(g);g.fillStyle=C.base;g.fill();
  g.save();backBody(g);g.clip();
  backPattern(g,C);
  const sh=g.createRadialGradient(-10,-46,4,0,-26,46);sh.addColorStop(0,'rgba(255,255,255,.22)');sh.addColorStop(0.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.16)');
  g.fillStyle=sh;g.fillRect(-40,-64,80,70);
  g.restore();
}
function backPattern(g,C){
  g.lineCap='round';
  if(C.pattern==='tabby'){
    g.strokeStyle=C.dark;g.lineWidth=5;g.beginPath();g.moveTo(0,-60);g.quadraticCurveTo(1.5,-36,0,-12);g.stroke();
    g.lineWidth=3.6;
    for(const y of[-50,-40,-30,-21]){for(const s of[-1,1]){g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(s*12,y-3,s*22,y+4);g.stroke();}}
    for(const s of[-1,1]){g.beginPath();g.moveTo(s*30,-17);g.quadraticCurveTo(s*22,-27,s*11,-22);g.stroke();g.beginPath();g.moveTo(s*31,-8);g.quadraticCurveTo(s*23,-14,s*14,-11);g.stroke();}
  }else if(C.pattern==='calico'){
    g.fillStyle=C.p1;g.beginPath();E(g,-12,-43,14,12,-0.3);E(g,-21,-13,11,10);g.fill();
    g.fillStyle=C.p2;g.beginPath();E(g,15,-23,12,12);E(g,9,-52,8,6.5,0.4);g.fill();
  }else if(C.pattern==='tortie'){
    g.fillStyle=C.p1;g.beginPath();
    [[-12,-45,9,7],[10,-33,8,6],[-18,-18,9,8],[16,-12,7,6],[2,-20,6,5],[-4,-56,6,4]].forEach(a=>E(g,a[0],a[1],a[2],a[3],0.5));g.fill();
    g.fillStyle=C.p2;g.beginPath();[[8,-50,7,5],[-8,-30,7,5],[20,-24,6,5]].forEach(a=>E(g,a[0],a[1],a[2],a[3]));g.fill();
  }else if(C.pattern==='points'){
    const pg=g.createLinearGradient(0,-60,0,0);pg.addColorStop(0,'rgba(91,65,54,0)');pg.addColorStop(1,'rgba(91,65,54,.28)');g.fillStyle=pg;g.fillRect(-40,-64,80,70);
  }
}

/* ---- front view body: chest, front legs and paws, haunches at the sides, tail peeking out behind ---- */
function frontSil(g){g.beginPath();E(g,-17,-15,15,14);E(g,17,-15,15,14);E(g,0,-31,19.5,25);E(g,-8,-14,6.8,12);E(g,8,-14,6.8,12);
  E(g,-25,-2.5,9,4.6);E(g,25,-2.5,9,4.6);E(g,-8,-3,7.4,4.8);E(g,8,-3,7.4,4.8);}
function frontFur(g){g.beginPath();E(g,-17,-15,15,14);E(g,17,-15,15,14);E(g,0,-31,19.5,25);E(g,-8,-14,6.8,12);E(g,8,-14,6.8,12);}
function drawBodyFront(g,C,ow){
  frontSil(g);g.strokeStyle=C.line;g.lineWidth=ow*2;g.stroke();
  g.fillStyle=C.feet||C.base;g.beginPath();E(g,-25,-2.5,9,4.6);E(g,25,-2.5,9,4.6);g.fill();
  frontFur(g);g.fillStyle=C.base;g.fill();
  g.save();frontFur(g);g.clip();
  frontPattern(g,C);
  const sh=g.createRadialGradient(-6,-44,4,0,-24,44);sh.addColorStop(0,'rgba(255,255,255,.2)');sh.addColorStop(0.55,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.15)');
  g.fillStyle=sh;g.fillRect(-40,-64,80,70);
  g.restore();
  // front paws sit on top of everything
  g.beginPath();E(g,-8,-3,7.4,4.8);E(g,8,-3,7.4,4.8);g.strokeStyle=C.line;g.lineWidth=2.4;g.stroke();g.fillStyle=C.feet||C.base;g.fill();
  // contour lines: haunch edges, leg edges, toes
  g.strokeStyle=C.line;g.globalAlpha=.55;g.lineWidth=2.2;
  g.beginPath();
  for(const s of[-1,1]){
    g.moveTo(s*16.5,-34);g.quadraticCurveTo(s*18.5,-22,s*15.2,-9);       // chest meets haunch
    g.moveTo(s*1.3,-22);g.quadraticCurveTo(s*0.6,-12,s*1,-6);            // between the front legs
    g.moveTo(s*(8-2.6),-4.6);g.lineTo(s*(8-2.4),-1.2);g.moveTo(s*(8+2.6),-4.6);g.lineTo(s*(8+2.4),-1.2);
  }
  g.stroke();g.globalAlpha=1;
}
function frontPattern(g,C){
  g.lineCap='round';
  if(C.bib){g.fillStyle=C.bib;g.beginPath();E(g,0,-37,11,13);g.fill();}
  if(C.pattern==='tabby'){
    g.strokeStyle=C.dark;g.lineWidth=3.6;
    for(const s of[-1,1]){
      for(const y of[-24,-16,-8]){g.beginPath();g.moveTo(s*32,y);g.quadraticCurveTo(s*26,y-4,s*21,y+1);g.stroke();}
      for(const y of[-19,-12]){g.beginPath();g.moveTo(s*3.5,y);g.lineTo(s*13,y+0.8);g.stroke();}
      g.beginPath();g.moveTo(s*19,-44);g.quadraticCurveTo(s*15,-38,s*18,-30);g.stroke();
    }
    g.lineWidth=3;g.beginPath();g.moveTo(-10,-47);g.quadraticCurveTo(0,-41,10,-47);g.stroke();
  }else if(C.pattern==='calico'){
    g.fillStyle=C.p1;g.beginPath();E(g,-22,-18,11,11);E(g,-15,-46,7,6);g.fill();
    g.fillStyle=C.p2;g.beginPath();E(g,20,-14,10,9);E(g,15,-42,6,5,0.4);g.fill();
  }else if(C.pattern==='tortie'){
    g.fillStyle=C.p1;g.beginPath();[[-14,-40,7,6],[12,-28,6,5],[-22,-14,8,7],[20,-18,7,6],[-4,-22,5,4]].forEach(a=>E(g,a[0],a[1],a[2],a[3],0.5));g.fill();
    g.fillStyle=C.p2;g.beginPath();[[10,-46,6,4],[-10,-26,5,4],[24,-8,5,4]].forEach(a=>E(g,a[0],a[1],a[2],a[3]));g.fill();
  }else if(C.pattern==='tuxedo'){
    g.fillStyle=C.light;g.beginPath();E(g,0,-33,11,17);E(g,-8,-6,6,7);E(g,8,-6,6,7);g.fill();
  }else if(C.pattern==='points'){
    g.fillStyle=C.point;g.globalAlpha=.55;g.beginPath();E(g,-8,-4,7,9);E(g,8,-4,7,9);E(g,-25,-8,9,8);E(g,25,-8,9,8);g.fill();g.globalAlpha=1;
  }
}

/* ---- tails: each type is a path starting at its root (0,0) ---- */
const TAILS={
  hook:{w:9,tip:[14,-36],path(g){g.moveTo(0,0);g.bezierCurveTo(24,3,31,-14,27,-29);g.quadraticCurveTo(25,-38,14,-36);}},
  long:{w:8,tip:[28,-58],path(g){g.moveTo(0,0);g.bezierCurveTo(22,2,30,-18,24,-36);g.quadraticCurveTo(19,-50,28,-58);}},
  curl:{w:8.5,tip:[20,-25],path(g){g.moveTo(0,0);g.bezierCurveTo(22,2,34,-16,28,-30);g.bezierCurveTo(24,-40,11,-38,12,-29);g.quadraticCurveTo(13,-23,20,-25);}},
  fluffy:{w:15,tip:[26,-50],path(g){g.moveTo(0,0);g.bezierCurveTo(22,2,31,-16,26,-32);g.quadraticCurveTo(22,-44,26,-50);}}
};
function tailColour(C){return C.pattern==='points'?C.point:(C.tail||C.base);}
function strokeTail(g,C,T,ow){
  g.beginPath();T.path(g);g.strokeStyle=C.line;g.lineWidth=T.w+ow*2;g.stroke();
  g.beginPath();T.path(g);g.strokeStyle=tailColour(C);g.lineWidth=T.w;g.stroke();
  if(C.pattern==='tabby'){g.save();g.lineCap='butt';g.setLineDash([4.5,5.5]);g.beginPath();T.path(g);g.strokeStyle=C.dark;g.lineWidth=T.w;g.stroke();g.restore();}
  const tipC=T===TAILS.fluffy?(C.bib||C.light||shadeHex(C.base,.35)):C.pattern==='calico'?C.p2:C.pattern==='tortie'?C.p1:null;
  if(tipC){g.save();g.beginPath();g.arc(T.tip[0],T.tip[1],T.w*1.25,0,TAU);g.clip();g.beginPath();T.path(g);g.strokeStyle=tipC;g.lineWidth=T.w;g.stroke();g.restore();}
  g.beginPath();T.path(g);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=T.w*0.25;g.save();g.translate(-T.w*0.15,-T.w*0.15);g.stroke();g.restore();
}
function drawTail(g,C,L,ow){
  const t=L.tail||'hook';
  if(t==='bob'){
    const puff=()=>{g.beginPath();E(g,7,-5,9,8);for(let i=0;i<8;i++){const a=i/8*TAU;E(g,7+Math.cos(a)*7.5,-5+Math.sin(a)*6.5,4.4,4.4);}};
    puff();g.strokeStyle=C.line;g.lineWidth=ow*2;g.stroke();puff();g.fillStyle=tailColour(C);g.fill();
    if(C.pattern==='tabby'){g.strokeStyle=C.dark;g.lineWidth=3;g.beginPath();g.arc(7,-5,6,-2.4,-0.7);g.stroke();}
    if(C.pattern==='calico'||C.pattern==='tortie'){g.fillStyle=C.pattern==='calico'?C.p2:C.p1;g.beginPath();E(g,10,-8,5,4);g.fill();}
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();E(g,4,-9,3.5,2.5);g.fill();
    return;
  }
  if(t==='twin'){
    g.save();g.rotate(-0.42);strokeTail(g,C,TAILS.long,ow);g.restore();
    g.save();g.rotate(0.12);strokeTail(g,C,TAILS.long,ow);g.restore();
    return;
  }
  const T=TAILS[t]||TAILS.hook;
  strokeTail(g,C,T,ow);
  if(t==='hook'){g.beginPath();g.moveTo(25,-31);g.quadraticCurveTo(24,-35,19,-35);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2.4;g.stroke();}
}
function shadeHex(h,f){return rgb(shade(hex(h),f));}

/* ---- head ---- */
function headPath(g){
  // all three shapes wind the same way so the cheek tufts fill solid on both sides
  g.beginPath();E(g,0,-66,28,23);
  g.moveTo(-23,-72);g.lineTo(-22,-50);g.lineTo(-34,-58);g.closePath();
  g.moveTo(23,-72);g.lineTo(34,-58);g.lineTo(22,-50);g.closePath();
}
function earPath(g,side,rot){
  g.save();g.translate(side*17,-78);g.rotate(side*rot);
  g.beginPath();g.moveTo(side*10,10);g.lineTo(side*6,-21);g.lineTo(-side*12,-6);g.closePath();
  g.restore();
}
function earInner(g,side,rot){
  g.save();g.translate(side*17,-78);g.rotate(side*rot);
  g.beginPath();g.moveTo(side*6,5);g.lineTo(side*4,-14);g.lineTo(-side*6,-4);g.closePath();
  g.restore();
}
function earColor(C,side){
  if(C.pattern==='calico')return side<0?C.p1:C.p2;
  if(C.pattern==='tortie')return side<0?C.p1:C.base;
  if(C.pattern==='points')return C.point;
  return C.base;
}
function drawHead(g,C,L,o,face,earRot,ow){
  const line=C.line;
  earPath(g,-1,earRot);g.strokeStyle=line;g.lineWidth=ow*2;g.stroke();
  earPath(g,1,earRot);g.stroke();
  headPath(g);g.stroke();
  for(const s of[-1,1]){earPath(g,s,earRot);g.fillStyle=face?earColor(C,s):shadeHex(earColor(C,s),-.08);g.fill();}
  if(face){
    g.fillStyle=C.darkFur?'#d98c9b':'#f4a7b4';earInner(g,-1,earRot);g.fill();earInner(g,1,earRot);g.fill();
  }
  headPath(g);g.fillStyle=C.base;g.fill();
  g.save();headPath(g);g.clip();
  headPattern(g,C,face);
  const hs=g.createRadialGradient(-10,-78,3,0,-66,34);hs.addColorStop(0,'rgba(255,255,255,.25)');hs.addColorStop(0.6,'rgba(255,255,255,0)');hs.addColorStop(1,'rgba(0,0,0,.12)');
  g.fillStyle=hs;g.fillRect(-40,-96,80,56);
  g.restore();
  if(face){drawFace(g,C,L,o);drawGlasses(g,L.face);}
  else{
    // from behind: whisker tips poke out past the cheeks, and the glasses' arms show
    g.strokeStyle=C.darkFur?'rgba(255,255,255,.7)':'rgba(40,30,30,.45)';g.lineWidth=1.1;g.beginPath();
    for(const s of[-1,1]){g.moveTo(s*31,-60);g.lineTo(s*37,-62);g.moveTo(s*32,-57);g.lineTo(s*37.5,-56.5);}g.stroke();
    if(L.face&&L.face!=='none'){g.strokeStyle=INK;g.lineWidth=2.2;g.beginPath();g.moveTo(-28,-70);g.quadraticCurveTo(-22,-73,-17,-77);g.moveTo(28,-70);g.quadraticCurveTo(22,-73,17,-77);g.stroke();}
  }
}
function headPattern(g,C,face){
  g.lineCap='round';
  if(C.pattern==='tabby'){
    g.strokeStyle=C.dark;g.lineWidth=3.6;
    if(face){
      [[-7,-86,-5,-77],[0,-88,0,-78],[7,-86,5,-77],[-28,-64,-20,-63],[-28,-58,-21,-58],[28,-64,20,-63],[28,-58,21,-58]].forEach(a=>{g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[2],a[3]);g.stroke();});
    }else{
      [[-10,-86,-8,-68],[0,-89,0,-66],[10,-86,8,-68],[-24,-66,-16,-64],[24,-66,16,-64]].forEach(a=>{g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(a[2],a[3]);g.stroke();});
    }
  }else if(C.pattern==='calico'){
    g.fillStyle=C.p1;g.beginPath();E(g,-17,-81,15,13);g.fill();
    g.fillStyle=C.p2;g.beginPath();E(g,18,-80,14,12);g.fill();
  }else if(C.pattern==='tortie'){
    g.fillStyle=C.p1;g.beginPath();E(g,-14,-80,12,10);E(g,12,-58,8,6);g.fill();
  }else if(C.pattern==='tuxedo'&&face){
    g.fillStyle=C.light;g.beginPath();g.moveTo(0,-80);g.lineTo(-15,-52);g.quadraticCurveTo(0,-40,15,-52);g.closePath();g.fill();
    g.beginPath();E(g,0,-55,16,10);g.fill();
  }else if(C.pattern==='points'){
    if(face){g.fillStyle=C.point;g.globalAlpha=.7;g.beginPath();E(g,0,-58.5,15,11);g.fill();g.globalAlpha=1;}
  }
  if(face&&C.muzzle){g.fillStyle=C.muzzle;g.beginPath();E(g,0,-56.5,12.5,8.5);g.fill();}
}
function eyeColour(C,L,side){
  const e=L.eyes||'auto';
  if(e==='odd')return side<0?EYE_COL.blue:EYE_COL.gold;
  if(EYE_COL[e])return EYE_COL[e];
  return C.eye||null;
}
function drawFace(g,C,L,o){
  const ink=INK,ex=10.5,ey=-67;
  const expr=o.expr||'idle';
  g.lineCap='round';
  if(expr==='happy'){
    g.strokeStyle=C.darkFur?'#f3eee6':ink;g.lineWidth=3;
    for(const s of[-1,1]){g.beginPath();g.moveTo(s*ex-5,ey+2);g.quadraticCurveTo(s*ex,ey-6,s*ex+5,ey+2);g.stroke();}
  }else if(expr==='oops'){
    for(const s of[-1,1]){g.fillStyle='#fff';g.beginPath();E(g,s*ex,ey,6.5,7);g.fill();g.strokeStyle=ink;g.lineWidth=1.6;g.stroke();g.fillStyle=ink;g.beginPath();E(g,s*ex,ey+1,2.6,2.8);g.fill();}
  }else{
    const bl=o.blink||0;const ry=7.2*(1-bl*0.9);
    for(const s of[-1,1]){
      if(bl>0.8){g.strokeStyle=C.darkFur?'#f3eee6':ink;g.lineWidth=2.6;g.beginPath();g.moveTo(s*ex-5,ey+1);g.quadraticCurveTo(s*ex,ey+4,s*ex+5,ey+1);g.stroke();continue;}
      const ec=eyeColour(C,L,s);
      if(ec){
        g.fillStyle=ec;g.beginPath();E(g,s*ex,ey,6,ry);g.fill();g.strokeStyle=ink;g.lineWidth=1.6;g.stroke();
        g.fillStyle=ink;g.beginPath();E(g,s*ex,ey,2.2,ry*0.8);g.fill();
      }else{
        g.fillStyle=ink;g.beginPath();E(g,s*ex,ey,5.6,ry);g.fill();
      }
      g.fillStyle='#fff';g.beginPath();E(g,s*ex-1.8,ey-2.6*(ry/7.2),2.1,2.1*(ry/7.2));E(g,s*ex+1.9,ey+2.2*(ry/7.2),1,1*(ry/7.2));g.fill();
    }
  }
  // blush
  g.fillStyle='rgba(255,110,140,.32)';g.beginPath();E(g,-18,-56.5,5,3);E(g,18,-56.5,5,3);g.fill();
  // nose
  g.fillStyle='#ef8898';g.beginPath();g.moveTo(-3.4,-62);g.lineTo(3.4,-62);g.lineTo(0,-58.6);g.closePath();g.fill();
  // mouth
  g.strokeStyle=C.darkFur&&!C.muzzle&&C.pattern!=='tuxedo'?'#b9aeb8':C.line;g.lineWidth=1.7;
  if(expr==='happy'){
    g.fillStyle='#b8434f';g.beginPath();g.moveTo(-4.5,-56.5);g.quadraticCurveTo(0,-49,4.5,-56.5);g.closePath();g.fill();
    g.fillStyle='#f58a9a';g.beginPath();E(g,0,-53.4,2.2,1.5);g.fill();
  }else if(expr==='oops'){
    g.fillStyle='#8a2d38';g.beginPath();E(g,0,-53.5,2.6,3.3);g.fill();
  }else{
    g.beginPath();g.moveTo(0,-58.6);g.quadraticCurveTo(-1.5,-55,-5,-56.5);g.moveTo(0,-58.6);g.quadraticCurveTo(1.5,-55,5,-56.5);g.stroke();
  }
  // whiskers
  g.strokeStyle=C.darkFur?'rgba(255,255,255,.75)':'rgba(40,30,30,.55)';
  g.lineWidth=1.1;
  for(const s of[-1,1]){[[-61,-3],[-57,0],[-53,3]].forEach(w=>{g.beginPath();g.moveTo(s*14,w[0]+3);g.lineTo(s*31,w[0]+w[1]);g.stroke();});}
}
function drawGlasses(g,id){
  if(!id||id==='none')return;
  g.lineWidth=2.3;g.strokeStyle=INK;
  if(id==='megane'){
    g.fillStyle='rgba(215,240,255,.3)';
    for(const s of[-1,1]){g.beginPath();g.arc(s*10.5,-67,8.4,0,TAU);g.fill();g.stroke();}
    g.beginPath();g.moveTo(-2.2,-68.5);g.quadraticCurveTo(0,-71,2.2,-68.5);g.moveTo(-18.8,-68.5);g.lineTo(-27.8,-70.5);g.moveTo(18.8,-68.5);g.lineTo(27.8,-70.5);g.stroke();
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.6;for(const s of[-1,1]){g.beginPath();g.arc(s*10.5,-67,5.6,3.6,4.4);g.stroke();}
  }else if(id==='shades'){
    g.fillStyle='#1f2a44';
    for(const s of[-1,1]){g.beginPath();g.moveTo(s*2.5,-72);g.lineTo(s*19,-72);g.quadraticCurveTo(s*19.5,-60,s*10.5,-60.5);g.quadraticCurveTo(s*2.5,-61,s*2.5,-72);g.closePath();g.fill();g.stroke();}
    g.beginPath();g.moveTo(-19,-72);g.lineTo(-28,-72.5);g.moveTo(19,-72);g.lineTo(28,-72.5);g.moveTo(-2.5,-71);g.lineTo(2.5,-71);g.stroke();
    g.strokeStyle='rgba(255,255,255,.65)';g.lineWidth=1.8;for(const s of[-1,1]){g.beginPath();g.moveTo(s*6,-69.5);g.lineTo(s*9,-66);g.stroke();}
  }
}

/* ---- hats sit on the crown between the ears ---- */
function drawHat(g,id,face){
  if(!id||id==='none')return;
  g.lineWidth=2.6;g.strokeStyle=INK;g.lineJoin='round';
  const side=face?1:-1;
  if(id==='straw'){
    g.fillStyle='#f0cf7a';g.beginPath();E(g,0,-87,37,7.5);g.fill();g.stroke();
    g.strokeStyle='rgba(150,110,40,.45)';g.lineWidth=1.3;g.beginPath();E(g,0,-87,29,5.4);g.stroke();
    g.strokeStyle=INK;g.lineWidth=2.6;
    g.fillStyle='#f4d98c';g.beginPath();g.moveTo(-17,-88);g.bezierCurveTo(-16,-107,16,-107,17,-88);g.quadraticCurveTo(0,-85,-17,-88);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#d8343a';g.lineWidth=4.4;g.beginPath();g.moveTo(-16.5,-91.5);g.quadraticCurveTo(0,-88.5,16.5,-91.5);g.stroke();
  }else if(id==='party'){
    g.save();g.beginPath();g.moveTo(-12.5,-86);g.lineTo(12.5,-86);g.lineTo(3,-121);g.closePath();g.fillStyle='#56b7e6';g.fill();g.clip();
    g.strokeStyle='#ff7eb3';g.lineWidth=4.5;for(let y=-118;y<-84;y+=9){g.beginPath();g.moveTo(-16,y+8);g.lineTo(16,y-2);g.stroke();}
    g.restore();g.strokeStyle=INK;g.lineWidth=2.6;g.beginPath();g.moveTo(-12.5,-86);g.lineTo(12.5,-86);g.lineTo(3,-121);g.closePath();g.stroke();
    g.fillStyle='#ffc83d';g.beginPath();g.arc(3,-122,5.5,0,TAU);g.fill();g.stroke();
  }else if(id==='beanie'){
    g.fillStyle='#e5544a';g.beginPath();g.moveTo(-15,-86);g.bezierCurveTo(-15,-107,15,-107,15,-86);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.6;g.beginPath();for(const x of[-7,0,7]){g.moveTo(x,-90);g.lineTo(x*1.1,-102);}g.stroke();
    g.fillStyle='#f6f1ea';g.strokeStyle=INK;g.lineWidth=2.6;g.beginPath();g.roundRect?g.roundRect(-17,-91,34,7.5,3.5):g.rect(-17,-91,34,7.5);g.fill();g.stroke();
    g.fillStyle='#fff';g.beginPath();g.arc(0,-106,5.6,0,TAU);g.fill();g.stroke();
  }else if(id==='beret'){
    g.fillStyle='#3b4a8c';g.beginPath();E(g,-3*side,-91,22,7.5,-0.14*side);g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();E(g,-8*side,-93,9,2.5,-0.14*side);g.fill();
    g.beginPath();g.moveTo(-2*side,-98);g.lineTo(0,-103);g.stroke();
  }else if(id==='flower'){
    const cols=['#ff8fb8','#ffd23d','#ffffff','#b99af0'];
    for(let i=0;i<7;i++){const a=-0.95+i*(1.9/6);const x=Math.sin(a)*25,y=-66-Math.cos(a)*22.5;
      g.fillStyle='#6fb35a';g.beginPath();E(g,x+Math.cos(a)*5,y+Math.sin(a)*1,4,2,a);g.fill();}
    for(let i=0;i<7;i++){const a=-0.95+i*(1.9/6);const x=Math.sin(a)*25,y=-66-Math.cos(a)*22.5;
      g.fillStyle=cols[i%4];g.beginPath();for(let p=0;p<5;p++){const pa=p/5*TAU+i;E(g,x+Math.cos(pa)*3.4,y+Math.sin(pa)*3.4,2.9,2.9);}g.fill();
      g.strokeStyle='rgba(42,34,48,.55)';g.lineWidth=0.9;g.stroke();
      g.fillStyle='#f29a2e';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();}
  }else if(id==='kasa'){
    g.fillStyle='#d9b872';g.beginPath();g.moveTo(-42,-91);g.lineTo(0,-114);g.lineTo(42,-91);g.quadraticCurveTo(0,-86,-42,-91);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(120,85,30,.5)';g.lineWidth=1.2;g.beginPath();for(const t of[-.66,-.33,0,.33,.66]){g.moveTo(0,-114);g.lineTo(t*42,-89-Math.abs(t)*1.5);}g.stroke();
    g.fillStyle='#b8434f';g.beginPath();g.arc(0,-114,2.6,0,TAU);g.fill();
  }else if(id==='crown'){
    g.fillStyle='#f4c430';g.beginPath();g.moveTo(-15,-86);g.lineTo(-17,-104);g.lineTo(-8.5,-95);g.lineTo(0,-108);g.lineTo(8.5,-95);g.lineTo(17,-104);g.lineTo(15,-86);g.quadraticCurveTo(0,-83,-15,-86);g.closePath();g.fill();g.stroke();
    g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(-12,-89);g.lineTo(-13,-97);g.lineTo(-10,-94);g.closePath();g.fill();
    g.lineWidth=1.4;[['#e5544a',0,-91],['#56b7e6',-9,-90],['#3fb068',9,-90]].forEach(a=>{g.fillStyle=a[0];g.beginPath();g.arc(a[1],a[2],2.4,0,TAU);g.fill();g.stroke();});
  }else if(id==='ribbon'){
    const x=15*side;
    g.fillStyle='#ff7eb3';g.beginPath();g.moveTo(x,-89);g.lineTo(x-10,-95);g.lineTo(x-9,-83);g.closePath();g.moveTo(x,-89);g.lineTo(x+10,-95);g.lineTo(x+9,-83);g.closePath();g.fill();g.stroke();
    g.beginPath();g.arc(x,-89,3,0,TAU);g.fill();g.stroke();
  }
}

/* ---- neckwear ---- */
function drawNeck(g,C,L,face){
  const id=L.neck;if(!id||id==='none')return;
  const y=face?-44:-45,bow=face?7:5;
  g.lineJoin='round';
  const band=(col,w)=>{g.strokeStyle=INK;g.lineWidth=w+3.4;g.beginPath();g.moveTo(-18,y-1);g.quadraticCurveTo(0,y+bow,18,y-1);g.stroke();
    g.strokeStyle=col;g.lineWidth=w;g.stroke();};
  if(id==='bell'){
    band('#d8343a',4.6);
    if(face){g.fillStyle='#f4c430';g.strokeStyle=INK;g.lineWidth=1.6;g.beginPath();E(g,0,-38.5,4.4,4.4);g.fill();g.stroke();g.beginPath();g.moveTo(-2,-37.5);g.lineTo(2,-37.5);g.stroke();}
  }else if(id==='bandana'){
    if(face){g.fillStyle='#3a78c9';g.strokeStyle=INK;g.lineWidth=2.4;g.beginPath();g.moveTo(-18,-45);g.quadraticCurveTo(0,-39,18,-45);g.lineTo(0,-26);g.closePath();g.fill();g.stroke();
      g.fillStyle='#fff';for(const d of[[-8,-40],[6,-39],[0,-33],[-3,-38.5],[9,-41.5]]){g.beginPath();g.arc(d[0],d[1],1.3,0,TAU);g.fill();}}
    else{band('#3a78c9',4.6);g.fillStyle='#3a78c9';g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.moveTo(0,y+4);g.lineTo(-6,y+13);g.lineTo(-1,y+12);g.closePath();g.moveTo(0,y+4);g.lineTo(6,y+13);g.lineTo(1,y+12);g.closePath();g.fill();g.stroke();
      g.beginPath();g.arc(0,y+4,2.6,0,TAU);g.fill();g.stroke();}
  }else if(id==='bowtie'){
    band('#e0719a',3.4);
    if(face){g.fillStyle='#e0719a';g.strokeStyle=INK;g.lineWidth=2.2;g.beginPath();g.moveTo(0,-39.5);g.lineTo(-11,-45);g.lineTo(-11,-34);g.closePath();g.moveTo(0,-39.5);g.lineTo(11,-45);g.lineTo(11,-34);g.closePath();g.fill();g.stroke();
      g.beginPath();E(g,0,-39.5,3,3.4);g.fill();g.stroke();}
  }else if(id==='scarf'){
    const draw=()=>{g.beginPath();g.moveTo(-19,y-2);g.quadraticCurveTo(0,y+bow+1,19,y-2);};
    draw();g.strokeStyle=INK;g.lineWidth=11.5;g.stroke();draw();g.strokeStyle='#3fb068';g.lineWidth=8;g.stroke();
    g.save();g.setLineDash([3,5]);draw();g.strokeStyle='#eafbe9';g.lineWidth=8;g.lineCap='butt';g.stroke();g.restore();
    const tx=face?9:-7;
    g.fillStyle='#3fb068';g.strokeStyle=INK;g.lineWidth=2.2;g.beginPath();g.moveTo(tx,y+3);g.lineTo(tx+7,y+3);g.lineTo(tx+8,y+20);g.lineTo(tx+1,y+20);g.closePath();g.fill();g.stroke();
    g.strokeStyle='#eafbe9';g.lineWidth=2;g.beginPath();g.moveTo(tx+1,y+9);g.lineTo(tx+7.4,y+9);g.moveTo(tx+1.3,y+14);g.lineTo(tx+7.7,y+14);g.stroke();
  }
}

/* o: {look, view:'face'|'back', expr, sq, tilt, sway, ear, blink, wet, turn, headOnly} */
function drawCat(g,sx,sy,k,o){
  const L=o.look||DEFAULT_LOOK,C=COATS[L.coat]||COATS.chatora;
  const ow=4.2;
  g.save();g.translate(sx,sy);g.rotate(o.tilt||0);
  const sq=o.sq||0,turn=o.turn?1-0.45*Math.sin(Math.PI*clamp(o.turn,0,1)):1;
  g.scale(k*(1+sq*0.9)*turn,k*(1-sq));
  g.lineJoin='round';g.lineCap='round';
  const face=o.view==='face';
  const earRot=(o.wet?0.5:0)+(o.ear||0);
  if(!o.headOnly){
    if(face){
      g.save();g.translate(L.tail==='bob'?25:13,L.tail==='bob'?-4:-7);g.rotate(-0.12+(o.sway||0)*0.6);drawTail(g,C,L,ow);g.restore();
      drawBodyFront(g,C,ow);
    }else drawBodyBack(g,C,ow);
    drawNeck(g,C,L,face);
  }
  drawHead(g,C,L,o,face,earRot,ow);
  drawHat(g,L.hat,face);
  if(!o.headOnly&&!face){g.save();g.translate(6,-9);g.rotate(o.sway||0);drawTail(g,C,L,ow);g.restore();}
  g.restore();
}
const iconCache={};
function catIcon(look,size){
  const key=JSON.stringify(look)+'|'+size;if(iconCache[key])return iconCache[key];
  const c=document.createElement('canvas');c.width=c.height=size*2;const g=c.getContext('2d');
  const k=size*2/80;
  g.beginPath();g.arc(size,size,size-2,0,TAU);g.fillStyle='#fff';g.fill();g.lineWidth=3;g.strokeStyle='#1f2a44';g.stroke();
  g.save();g.beginPath();g.arc(size,size,size-4,0,TAU);g.clip();
  drawCat(g,size,size*2*0.5+66*k*0.95,k*0.95,{look,view:'face',expr:'idle',headOnly:true});
  g.restore();
  return iconCache[key]=c.toDataURL();
}
