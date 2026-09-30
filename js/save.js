"use strict";
/* ============================== SAVE ==============================
   v3 = the 23-level course. Older saves (v2: 13 levels, v1: 11 levels)
   are carried over: stars and lessons move to the matching new levels. */
const SAVE_KEY='megane-hop-v3',V2_KEY='megane-hop-v2',V1_KEY='megane-hop-v1';
const DEFAULT_LOOK={coat:'chatora',tail:'hook',hat:'none',neck:'none',face:'none',eyes:'auto'};
let save={stars:{},best:{},lessons:{},review:{},fish:0,owned:{},look:Object.assign({},DEFAULT_LOOK),heart:false,
  runBest:0,lastDay:'',open:{},rivals:true,sfx:true,voice:'',unlockAll:false,slow:false,useRec:true,gfx:'auto',gfxBudget:0};

/* old v2 level id -> new level ids covering the same content */
const V2_TO_V3={1:[1,2],2:[3,4],3:[5],4:[6],5:[7],6:[8],7:[9],8:[11],9:[12,13,14],10:[15,16],11:[17,18],12:[21,22],13:[23]};
function fromV1(o){
  // v1 -> v2 (levels were renumbered when new ones were added)
  const s={stars:{},best:{},lessons:{},owned:{},look:{}};
  const MAP={1:1,2:2,3:5,4:6,5:7,6:8,7:9,8:10,9:11,10:12,11:13},OLD_NEED={saba:6,kuro:12,sabi:18,shiro:24,kijitora:30};
  let tot=0;for(const k in o.stars||{}){if(MAP[k]){s.stars[MAP[k]]=o.stars[k];s.lessons[MAP[k]]=true;tot+=o.stars[k]|0;}}
  for(const k in o.best||{})if(MAP[k])s.best[MAP[k]]=o.best[k];
  for(const k in OLD_NEED)if(tot>=OLD_NEED[k])s.owned['coat:'+k]=true;
  ['heart','rivals','sfx','voice','unlockAll','slow'].forEach(k=>{if(k in o)s[k]=o[k];});
  if(o.coat)s.look.coat=o.coat;
  if(o.heart)s.look.neck='bell';
  s.fish=tot*5;
  return s;
}
function fromV2(o){
  const s=Object.assign({},o,{stars:{},best:{},lessons:{},review:{},open:{}});
  for(const k in V2_TO_V3){
    const ids=V2_TO_V3[k];
    ids.forEach(id=>{
      if(o.stars&&o.stars[k])s.stars[id]=o.stars[k];
      if(o.best&&o.best[k])s.best[id]=o.best[k];
      if(o.lessons&&o.lessons[k])s.lessons[id]=true;
    });
    // missed words go to whichever new level uses them
    ((o.review||{})[k]||[]).forEach(w=>{
      const id=ids.find(id=>COURSE.spokenWords(COURSE.LEVELS[id-1]).indexOf(w)>=0);
      if(id)(s.review[id]=s.review[id]||[]).push(w);
    });
  }
  // levels that are new in the course (10, 19, 20) open up if the player has already
  // finished something after them, so the map never has a locked gap
  const top=Math.max(0,...Object.keys(s.stars).map(Number));
  COURSE.LEVELS.forEach(L=>{if(L.id<top&&!s.stars[L.id])s.open[L.id]=true;});
  return s;
}
try{
  const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
  if(s&&typeof s==='object')save=Object.assign(save,s);
  else{
    let o=JSON.parse(localStorage.getItem(V2_KEY)||'null');
    if(!o){const o1=JSON.parse(localStorage.getItem(V1_KEY)||'null');if(o1&&typeof o1==='object')o=fromV1(o1);}
    if(o&&typeof o==='object')save=Object.assign(save,fromV2(o));
  }
}catch(e){}
save.look=Object.assign({},DEFAULT_LOOK,save.look||{});
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));}catch(e){}}
function totalStars(){return Object.values(save.stars).reduce((a,b)=>a+(b|0),0);}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
