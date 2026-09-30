"use strict";
/* ============================== AUDIO ============================== */
let AC=null,master=null,riverGain=null,noiseBuf=null;
function ensureAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=0.6;master.connect(AC.destination);startRiver();}catch(e){AC=null;}
}
function getNoise(){if(noiseBuf)return noiseBuf;const len=AC.sampleRate*2;noiseBuf=AC.createBuffer(1,len,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;return noiseBuf;}
function tone(f0,f1,dur,type,vol,delay){
  if(!AC||!save.sfx)return;const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.15,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);
}
function noise(dur,freq,q,vol,delay,sweep){
  if(!AC||!save.sfx)return;const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=getNoise();
  const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(freq,t);if(sweep)f.frequency.exponentialRampToValueAtTime(sweep,t+dur);f.Q.value=q;
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+dur+0.05);
}
function startRiver(){
  try{const s=AC.createBufferSource();s.buffer=getNoise();s.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=650;
  riverGain=AC.createGain();riverGain.gain.value=save.sfx?0.03:0;s.connect(f);f.connect(riverGain);riverGain.connect(master);s.start();}catch(e){}
}
function syncRiver(){if(riverGain)riverGain.gain.value=save.sfx?0.03:0;}
const SFX={
  click(){tone(660,900,0.07,'triangle',0.1);},
  hop(v){tone(300,720,0.16,'sine',0.13*(v||1));},
  land(v){tone(190,90,0.12,'sine',0.2*(v||1));noise(0.05,1300,1.2,0.05*(v||1));},
  good(){[784,988,1319].forEach((f,i)=>tone(f,f,0.2,'triangle',0.12,i*0.07));},
  bad(){tone(330,200,0.25,'square',0.045);},
  splash(v){v=v||1;noise(0.55,900,0.7,0.32*v,0,260);noise(0.25,2600,1,0.1*v,0.05);},
  beep(hi){tone(hi?988:660,hi?988:660,hi?0.35:0.13,'square',0.06);},
  fanfare(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,f,i===5?0.55:0.16,'triangle',0.13,i*0.12));},
  star(i){tone(880+i*240,1320+i*240,0.28,'triangle',0.12);},
  mew(){
    if(!AC||!save.sfx)return;const t=AC.currentTime;const o=AC.createOscillator();o.type='sawtooth';
    o.frequency.setValueAtTime(620,t);o.frequency.linearRampToValueAtTime(880,t+0.12);o.frequency.linearRampToValueAtTime(500,t+0.4);
    const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(1200,t);f.frequency.linearRampToValueAtTime(2300,t+0.12);f.frequency.linearRampToValueAtTime(900,t+0.4);
    const g=AC.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.11,t+0.04);g.gain.exponentialRampToValueAtTime(0.0001,t+0.44);
    o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+0.46);
  }
};

/* ============================== VOICE ==============================
   Recordings first: voices/<word>.mp3, sounds/<sound>.mp3, phrases/<id>.mp3.
   The computer voice (speechSynthesis) is only the backup for a missing file.
   HTMLAudio (not fetch/WebAudio) so it also works when index.html is opened
   straight from disk, and so slow playback keeps the natural pitch.
   Voice items: {w:'sun'} word · {snd:'s',fb:'sun'} sound (fb = backup word)
                {ph:'great'} phrase (recording only) · {tts:'at'} computer voice only */
const REC={ok:new Set(),missing:new Set(),pool:new Map(),MAX:48};
let vId=0,curAudio=null,stopHook=null;
function recPath(kind,id){return (kind==='word'?'voices/':kind==='sound'?'sounds/':'phrases/')+encodeURIComponent(String(id).toLowerCase())+'.mp3';}
function itemPath(it){return it.w?recPath('word',it.w):it.snd?recPath('sound',it.snd):it.ph?recPath('phrase',it.ph):null;}
function recGet(path){
  if(!path||!save.useRec||REC.missing.has(path))return null;
  let a=REC.pool.get(path);
  if(a){REC.pool.delete(path);REC.pool.set(path,a);return a;}
  a=new Audio();a.preload='auto';
  a.addEventListener('canplaythrough',()=>REC.ok.add(path),{once:true});
  a.addEventListener('error',()=>{REC.missing.add(path);if(REC.pool.get(path)===a)REC.pool.delete(path);},{once:true});
  a.src=path;
  REC.pool.set(path,a);
  // keep only a few dozen media elements alive (browsers limit how many can exist)
  while(REC.pool.size>REC.MAX){
    const [k,old]=REC.pool.entries().next().value;REC.pool.delete(k);
    if(old!==curAudio){old.removeAttribute('src');try{old.load();}catch(e){}}
  }
  return a;
}
/* start loading clips in the background so the first play is instant */
function recPreload(items){items.slice(0,REC.MAX-8).forEach(it=>recGet(itemPath(it)));}
/* is there a recording? true / false / null (don't know yet) */
function recHas(it){const p=itemPath(it);if(!save.useRec)return false;return REC.missing.has(p)?false:REC.ok.has(p)?true:null;}

function voiceStop(){
  vId++;
  if(curAudio){try{curAudio.pause();}catch(e){}curAudio=null;}
  try{if(synth)synth.cancel();}catch(e){}
  const h=stopHook;stopHook=null;if(h)h();
  setSpeaking(false);
}
function speedOf(opt,tts){
  if(opt.turtle)return tts?0.55:0.72;
  if(save.slow)return tts?0.72:0.86;
  return tts?(opt.ttsRate||0.9):1;
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
/* say one or more items in order; resolves when finished (or interrupted) */
function say(items,opt){
  items=[].concat(items).filter(Boolean);opt=opt||{};
  voiceStop();const id=vId;
  if(!items.length)return Promise.resolve();
  setSpeaking(true);
  let p=Promise.resolve();
  items.forEach((it,i)=>{p=p.then(()=>{
    if(id!==vId)return;
    return playOne(it,opt,id).then(()=>{if(id===vId&&i<items.length-1)return wait(opt.gap||260);});
  });});
  return p.then(()=>{if(id===vId)setSpeaking(false);});
}
function playOne(it,opt,id){
  return new Promise(res=>{
    let done=false;const fin=()=>{if(done)return;done=true;if(stopHook===fin)stopHook=null;res();};
    stopHook=fin;
    const fallback=()=>{
      if(id!==vId||it.ph)return fin();
      const t=it.w||it.fb||it.tts;if(!t)return fin();
      tts(t,speedOf(opt,true),id).then(fin);
    };
    const path=itemPath(it),a=recGet(path);
    if(!a)return fallback();
    let to=0,settled=false;
    const cleanup=()=>{settled=true;a.removeEventListener('ended',onEnd);a.removeEventListener('error',onErr);clearTimeout(to);};
    const onEnd=()=>{if(settled)return;cleanup();if(curAudio===a)curAudio=null;fin();};
    // a missing file reports twice (the 'error' event and the rejected play()): react once
    const onErr=()=>{if(settled)return;cleanup();if(curAudio===a)curAudio=null;REC.missing.add(path);if(it.snd&&typeof onSoundMissing==='function')onSoundMissing(it.snd);fallback();};
    a.addEventListener('ended',onEnd);a.addEventListener('error',onErr);
    // a file that never loads (slow disk / blocked) counts as missing after a while
    to=setTimeout(()=>{if(settled)return;cleanup();if(!REC.ok.has(path)&&a.readyState<2){REC.missing.add(path);try{a.pause();}catch(e){}fallback();}else fin();},5000);
    try{if(!a.paused)a.pause();if(a.readyState>0)a.currentTime=0;}catch(e){}
    a.playbackRate=speedOf(opt,false);a.preservesPitch=true;a.mozPreservesPitch=true;a.webkitPreservesPitch=true;
    curAudio=a;
    const pr=a.play();
    if(pr&&pr.catch)pr.catch(err=>{if(err&&err.name==='AbortError')return;onErr();});
  });
}

/* ---- the computer voice (backup) ---- */
const synth=('speechSynthesis' in window)?window.speechSynthesis:null;
let voices=[],voice=null;
function isRemoteGoogleVoice(v){return !!v&&/google/i.test(v.name||'')&&v.localService===false;}
function loadVoices(){
  if(!synth)return;
  const all=synth.getVoices()||[];
  voices=all.filter(v=>/^en/i.test(v.lang));
  // Prefer on-device (local) English voices. Google's network voices are
  // known to go silent/hang in Chrome, so only use them if no local voice exists.
  const local=voices.filter(v=>v.localService!==false);
  const pool=local.length?local:voices;
  voice=null;
  const pref=[save.voice,'Microsoft Aria','Microsoft Jenny','Microsoft Zira','Microsoft Mark','Microsoft David','Samantha','Karen','Daniel','Moira','Tessa'];
  for(const p of pref){if(!p)continue;const v=pool.find(v=>v.name===p)||pool.find(v=>v.name.indexOf(p)===0);if(v){voice=v;break;}}
  if(!voice)voice=pool.find(v=>/en[-_]US/i.test(v.lang))||pool[0]||null;
  // Auto-heal: if the saved voice is a remote Google voice (or gone) but we picked a local one, store the working one.
  if(voice&&save.voice!==voice.name){
    const saved=all.find(v=>v.name===save.voice);
    if(!saved||isRemoteGoogleVoice(saved)){save.voice=voice.name;persist();}
  }
  if(typeof fillVoiceSelect==='function')fillVoiceSelect();
}
function initVoices(){if(synth){loadVoices();if(synth.addEventListener)synth.addEventListener('voiceschanged',loadVoices);else synth.onvoiceschanged=loadVoices;}}
function tts(text,rate,id,retried){
  return new Promise(res=>{
    if(!synth){res();return;}
    try{synth.cancel();if(synth.resume)synth.resume();}catch(e){}
    setTimeout(()=>{
      if(id!==vId){res();return;}
      let done=false,to=0;const fin=()=>{if(done)return;done=true;clearTimeout(to);res();};
      const u=new SpeechSynthesisUtterance(text);
      if(voice){u.voice=voice;u.lang=voice.lang;}else u.lang='en-US';
      u.rate=rate;u.pitch=1;u.volume=1;
      u.onend=fin;
      u.onerror=()=>{
        // Broken (usually Google network) voices fail silently: retry once with the browser default voice.
        if(!retried&&isRemoteGoogleVoice(voice)&&id===vId){voice=null;try{save.voice='';persist();}catch(_){}tts(text,rate,id,true).then(fin);return;}
        fin();
      };
      to=setTimeout(fin,2500+text.length*160);   // Chrome sometimes never fires onend
      try{synth.speak(u);}catch(e){fin();}
    },60);
  });
}
function setSpeaking(on){document.querySelectorAll('.listen-btn').forEach(b=>b.classList.toggle('speaking',!!on));}

/* ---- convenience ---- */
function sayWord(w,opt){return say({w},opt);}
function soundItem(g,fb){const id=COURSE.soundId(g);return id?{snd:id,fb}:(fb?{tts:fb}:null);}
function qItem(q){return q.snd?{snd:q.snd,fb:q.say}:{w:q.say};}
function sayQ(q,opt){return q?say(qItem(q),opt):Promise.resolve();}
/* a recorded praise line, only if the recording exists (never the computer voice) */
function withPhrase(id,items){return recHas({ph:id})===false?[].concat(items):[{ph:id}].concat(items);}
function sayPhrase(id){if(recHas({ph:id})===false)return Promise.resolve();return say({ph:id});}
