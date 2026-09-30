/* =====================================================================
   MEGANE HOP — the phonics course
   Shared by the game (index.html) and the Voice Studio (voice-studio.html),
   so the list of words to record always matches what the game says.

   Order follows a systematic synthetic phonics sequence (in the spirit of
   Letters and Sounds / Jolly Phonics), tuned for Japanese learners:
     1 Letter Sounds       single letters, most useful first (s a t p i n …)
     2 Listening to Words  end sounds, middle vowels, CVC words, ck/ng/nk
     3 Two Letters         sh ch th, then blends (s-, l/r-, end blends)
     4 Long Vowels         magic e, vowel teams, ou/ow/oi, ar/or/er
     5 Tricky Sounds       L/R, B/V, F/H, S/TH, then a final mix
   ===================================================================== */
"use strict";
const COURSE = (() => {

const DESTS = {
  steps: {name: 'Stone Steps', jp: '石だん'},
  wood:  {name: 'Red Bridge',  jp: '赤い橋'},
  arch:  {name: 'Arch Bridge', jp: '石の橋'},
  mega:  {name: 'Meganebashi', jp: '眼鏡橋'}
};

const CHAPTERS = [
  {id: 1, title: 'Letter Sounds',      jp: 'アルファベットの音', theme: 'morning'},
  {id: 2, title: 'Listening to Words', jp: 'ことばを きこう',     theme: 'day'},
  {id: 3, title: 'Two Letters',        jp: '2文字の音',          theme: 'afternoon'},
  {id: 4, title: 'Long Vowels',        jp: 'ながい母音',          theme: 'sunset'},
  {id: 5, title: 'Tricky Sounds',      jp: 'にている音',          theme: 'night'}
];

/* ---------- sound recordings (sounds/<file>.mp3) ----------
   say = an example word, used by the backup computer voice if the
   recording is missing (a computer voice can't say a lone sound well). */
const SOUNDS = [
  ...'abcdefghijklmnopqrstuvwxyz'.split('').map(c => ({f: c, t: c})),
  {f: 'qu'}, {f: 'sh'}, {f: 'ch'},
  {f: 'th-thin', t: 'th · as in thin'}, {f: 'th-with', t: 'th · as in with'},
  {f: 'ng', t: 'ng · as in king'}, {f: 'nk', t: 'nk · as in pink'},
  {f: 'st'}, {f: 'sp'}, {f: 'sl'}, {f: 'sn'}, {f: 'sk'}, {f: 'sw'},
  {f: 'cl'}, {f: 'fl'}, {f: 'bl'}, {f: 'gl'}, {f: 'pl'},
  {f: 'cr'}, {f: 'tr'}, {f: 'br'}, {f: 'gr'}, {f: 'dr'}, {f: 'pr'},
  {f: 'nt', t: 'nt · as in tent'}, {f: 'mp', t: 'mp · as in lamp'}, {f: 'nd', t: 'nd · as in hand'},
  {f: 'ai', t: 'ai / ay / a_e · long a, as in rain'},
  {f: 'ee', t: 'ee · as in feet'},
  {f: 'ea-team', t: 'ea · as in team'}, {f: 'ea-bread', t: 'ea · as in bread'},
  {f: 'igh', t: 'igh / i_e · long i, as in light'},
  {f: 'oa', t: 'oa / o_e · long o, as in boat'},
  {f: 'u-e', t: 'u_e · long u, as in cube'},
  {f: 'oo-moon', t: 'oo · as in moon'}, {f: 'oo-foot', t: 'oo · as in foot'},
  {f: 'ow', t: 'ow / ou · as in cow, cloud'},
  {f: 'oi', t: 'oi / oy · as in coin, boy'},
  {f: 'ar', t: 'ar · as in car'}, {f: 'or', t: 'or · as in fork'},
  {f: 'er', t: 'er / ir / ur · as in her, bird, turn'}
].map(s => Object.assign({t: s.f}, s));

/* which recording each spelling uses (several spellings share one sound) */
const SOUND_OF = {
  th: 'th-thin', ck: 'k', ea: 'ea-team', oo: 'oo-moon',
  ay: 'ai', a_e: 'ai', i_e: 'igh', o_e: 'oa', u_e: 'u-e',
  ou: 'ow', oy: 'oi', ir: 'er', ur: 'er'
};
const SOUND_FILES = new Set(SOUNDS.map(s => s.f));
function soundId(g){
  if (!g) return null;
  const k = SOUND_OF[g] || g;
  return SOUND_FILES.has(k) ? k : null;
}

/* short praise / feedback lines (phrases/<file>.mp3) — optional, never
   spoken by the computer voice; played only if you record them */
const PHRASES = [
  {f: 'great', t: 'Great!'}, {f: 'yes', t: 'Yes!'}, {f: 'super', t: 'Super!'},
  {f: 'nice', t: 'Nice!'}, {f: 'perfect', t: 'Perfect!'}, {f: 'good-ear', t: 'Good ear!'},
  {f: 'listen-again', t: 'Listen again!'}, {f: 'you-did-it', t: 'You did it!'},
  {f: 'lets-practise', t: "Let's practise!"}
];

/* ---------- level helpers ---------- */
const S = (t, o) => ({t, o: o || []});                        // question set: t = words the game says, o = look-alike choices only shown
const R1 = (g, w, tip, jp, at) => ({rows: [{g, w, at}], tip, jp});
const PAIRS = (pairs, tip, jp) => ({rows: pairs.map(p => ({pair: [p[0], p[1]], g: [p[2], p[3]]})), tip, jp});

/* type: first = hear a word, pick its first letter (sound: share of
   questions that play the letter sound itself instead of a word)
   last = pick the last letter · word = pick the word · mix = from other levels */
const RAW = [
 /* ---------------- Chapter 1: Letter Sounds ---------------- */
 {ch: 1, title: 's a t p', jp: 'はじめの音 ①', type: 'first', n: 3, sound: 0.35,
  how: 'Listen to the sound. Hop to the letter that makes it.',
  letters: {s: ['sun', 'sock', 'six', 'sad'], a: ['ant', 'apple', 'alligator', 'astronaut'], t: ['top', 'ten', 'tub', 'tiger'], p: ['pig', 'pan', 'pen', 'pizza']},
  teach: [R1('s', ['sun', 'sock', 'six'], 's is a snake: sss', 'ヘビの音 スー'),
   R1('a', ['ant', 'apple', 'alligator'], 'a opens your mouth wide: a, a, apple', '口を大きく ア'),
   R1('t', ['top', 'ten', 'tiger'], 't taps your tongue: t, t, top', '舌で トッ'),
   R1('p', ['pig', 'pan', 'pen'], 'p pops your lips: p, p, pig', 'くちびるで パッ')]},
 {ch: 1, title: 'i n m d', jp: 'はじめの音 ②', type: 'first', n: 3, sound: 0.35,
  how: 'Listen to the sound. Hop to the letter that makes it.',
  letters: {i: ['igloo', 'insect', 'ink', 'itchy'], n: ['net', 'nut', 'nose', 'nine'], m: ['map', 'mop', 'moon', 'milk'], d: ['dog', 'duck', 'desk', 'dig']},
  teach: [R1('i', ['igloo', 'insect', 'ink'], 'i is short and quick: i, i, insect', 'みじかい イ'),
   R1('n', ['net', 'nut', 'nose'], 'n hums in your nose: nnn', 'はなで ンー'),
   R1('m', ['map', 'mop', 'moon'], 'm closes your lips: mmm', 'くちびるを とじて ンー'),
   R1('d', ['dog', 'duck', 'desk'], 'd taps your tongue with your voice: d, d, dog', '舌で ドッ')]},
 {ch: 1, title: 'g o c k', jp: 'はじめの音 ③', type: 'first', n: 3, sound: 0.35, conflict: [['c', 'k']],
  how: 'Listen to the sound. Hop to the letter that makes it.',
  letters: {g: ['gum', 'goat', 'gift', 'game'], o: ['octopus', 'ox', 'otter', 'olive'], c: ['cat', 'cup', 'cake', 'cow'], k: ['kite', 'king', 'key', 'kid']},
  teach: [R1('g', ['gum', 'goat', 'gift'], 'g comes from your throat: g, g, goat', 'のどで グッ'),
   R1('o', ['octopus', 'ox', 'otter'], 'o is a big round mouth: o, o, octopus', '口を まるく オ'),
   {rows: [{g: 'c', w: ['cat', 'cup', 'cake']}, {g: 'k', w: ['kite', 'king', 'key']}], tip: 'c and k make the same sound: c, c, cat', jp: 'c と k は おなじ音'}]},
 {ch: 1, title: 'e u r h', jp: 'はじめの音 ④', type: 'first', n: 3, sound: 0.35,
  how: 'Listen to the sound. Hop to the letter that makes it.',
  letters: {e: ['egg', 'elbow', 'elephant', 'envelope'], u: ['umbrella', 'up', 'uncle', 'under'], r: ['red', 'rabbit', 'run', 'rug'], h: ['hat', 'hen', 'horse', 'hug']},
  teach: [R1('e', ['egg', 'elbow', 'elephant'], 'e is a small smile: e, e, egg', '小さい エ'),
   R1('u', ['umbrella', 'up', 'uncle'], 'u is a relaxed sound: u, u, up', '力をぬいて ア'),
   R1('r', ['red', 'rabbit', 'run'], 'r rounds your lips. Tongue does not touch!', 'くちびるを まるく ゥル'),
   R1('h', ['hat', 'hen', 'horse'], 'h is a warm breath: h, h, hat', '手に いきを ハッ')]},
 {ch: 1, title: 'b f l j', jp: 'はじめの音 ⑤', type: 'first', n: 3, sound: 0.35,
  how: 'Listen to the sound. Hop to the letter that makes it.',
  letters: {b: ['bat', 'bus', 'bed', 'box'], f: ['fan', 'fox', 'fish', 'frog'], l: ['leg', 'lion', 'log', 'lemon'], j: ['jam', 'jet', 'jump', 'jelly']},
  teach: [R1('b', ['bat', 'bus', 'bed'], 'b pops your lips with voice: b, b, bus', 'くちびるで ブッ'),
   R1('f', ['fan', 'fox', 'fish'], 'f: top teeth on your lip: fff', '上の歯で 下くちびる フー'),
   R1('l', ['leg', 'lion', 'log'], 'l: tongue up behind your top teeth: lll', '舌を 上の歯のうらに'),
   R1('j', ['jam', 'jet', 'jump'], 'j: j, j, jam', 'ジュッ')]},
 {ch: 1, title: 'v w y z qu', jp: 'はじめの音 ⑥', type: 'first', n: 3, sound: 0.3,
  how: 'Listen to the sound. Hop to the letters that make it.',
  letters: {v: ['van', 'vet', 'vest', 'violin'], w: ['web', 'wet', 'wind', 'window'], y: ['yes', 'yak', 'yellow', 'yo-yo'], z: ['zoo', 'zip', 'zebra', 'zero'], qu: ['queen', 'quiz', 'quick', 'quilt']},
  teach: [R1('v', ['van', 'vet', 'vest'], 'v is like f with your voice: vvv', 'f に こえを のせて ヴー'),
   R1('w', ['web', 'wet', 'wind'], 'w: make a small round mouth: w, w, web', '口を すぼめて ウ'),
   R1('y', ['yes', 'yak', 'yellow'], 'y: y, y, yes', 'イェ'),
   R1('z', ['zoo', 'zip', 'zebra'], 'z is a buzzing bee: zzz', 'ハチの音 ズー'),
   R1('qu', ['queen', 'quiz', 'quick'], 'q and u go together. They say kw: queen', 'qu で クw')]},

 /* ---------------- Chapter 2: Listening to Words ---------------- */
 {ch: 2, title: 'Last Sounds', jp: 'おわりの音', type: 'last', n: 4, conflict: [['x', 's']],
  how: 'Listen to the word. Hop to the letter it ends with.',
  letters: {t: ['cat', 'hat', 'net', 'sit', 'nut'], p: ['cup', 'map', 'top', 'ship', 'cap'], n: ['sun', 'pen', 'pin', 'van', 'ten'], g: ['bag', 'dog', 'pig', 'bug', 'leg'], d: ['bed', 'red', 'mud', 'lid', 'sad'], x: ['box', 'fox', 'six', 'ax'], m: ['ham', 'jam', 'gum', 'drum', 'swim'], s: ['bus', 'gas', 'yes']},
  teach: [{rows: [{g: 't', w: ['cat', 'hat', 'net'], at: 'last'}, {g: 'p', w: ['cup', 'map', 'top'], at: 'last'}], tip: 'Now listen to the END of the word.', jp: 'ことばの さいごの音を きこう'},
   {rows: [{g: 'n', w: ['sun', 'pen', 'ten'], at: 'last'}, {g: 'm', w: ['ham', 'jam', 'drum'], at: 'last'}], tip: 'n hums in your nose. m closes your lips.', jp: 'n は はな、m は くちびる'},
   {rows: [{g: 'g', w: ['bag', 'dog', 'pig'], at: 'last'}, {g: 'd', w: ['bed', 'red', 'mud'], at: 'last'}], tip: 'g is in your throat. d is on your tongue.', jp: 'g は のど、d は 舌'},
   {rows: [{g: 'x', w: ['box', 'fox', 'six'], at: 'last'}, {g: 's', w: ['bus', 'gas', 'yes'], at: 'last'}], tip: 'x says ks. s says sss.', jp: 'x は クス、s は スー'}]},
 {ch: 2, title: 'Middle Sounds', jp: 'まんなかの音', type: 'word', n: 4,
  how: 'The words only change in the middle. Listen for a, e, i, o or u.', sample: ['bag', 'beg', 'big', 'bug'],
  sets: [S(['bag', 'beg', 'big', 'bug']), S(['hat', 'hit', 'hot', 'hut']), S(['pan', 'pen', 'pin']), S(['bad', 'bed', 'bud']), S(['cap', 'cop', 'cup']), S(['tap', 'tip', 'top']), S(['sat', 'set', 'sit']), S(['fan', 'fin', 'fun']), S(['ham', 'him', 'hum']), S(['dig', 'dog', 'dug']), S(['pat', 'pet', 'pit', 'pot']), S(['net', 'nut', 'not']), S(['rag', 'rig', 'rug']), S(['lap', 'lip', 'lop'])],
  teach: [{rows: [{g: 'a', w: ['bag', 'cat', 'hat'], at: 'mid'}, {g: 'e', w: ['bed', 'pen', 'net'], at: 'mid'}], tip: 'The vowel sits in the middle of the word.', jp: '母音（ぼいん）は まんなかに いる'},
   {rows: [{g: 'i', w: ['pig', 'sit', 'pin'], at: 'mid'}, {g: 'o', w: ['dog', 'top', 'hot'], at: 'mid'}, {g: 'u', w: ['bug', 'sun', 'cup'], at: 'mid'}], tip: 'i, o, u: listen to the middle!', jp: 'まんなかを よく きこう'},
   PAIRS([['bag', 'bug', 'a', 'u'], ['pen', 'pin', 'e', 'i'], ['hot', 'hat', 'o', 'a']], 'Only the middle sound changes!', 'まんなかの音だけ ちがう')]},
 {ch: 2, title: 'Word Families', jp: '3文字のことば', type: 'word', n: 4,
  how: 'Short words that look alike. Listen to every sound!', sample: ['cat', 'cap', 'can', 'hat'],
  sets: [S(['cat', 'cap', 'can', 'bat', 'hat', 'mat']), S(['pig', 'pin', 'pit', 'big', 'dig', 'wig']), S(['dog', 'dot', 'log', 'fog', 'hog']), S(['sun', 'run', 'bun', 'fun']), S(['bed', 'beg', 'red', 'fed']), S(['mop', 'top', 'hop', 'pop']), S(['bug', 'bun', 'bus', 'hug', 'mug', 'rug']), S(['hen', 'pen', 'ten', 'men', 'pet', 'peg']), S(['jam', 'ham', 'ram', 'yam']), S(['box', 'fox', 'fix', 'six', 'mix']), S(['cut', 'cub', 'cup', 'hut', 'nut'])],
  teach: [{rows: [{g: '-at', w: ['cat', 'hat', 'bat', 'mat']}, {g: '-ig', w: ['pig', 'big', 'dig', 'wig']}], tip: 'A word family has the same ending. Only the first sound changes.', jp: 'おわりが おなじ ことばの かぞく'},
   {rows: [{g: '-op', w: ['mop', 'top', 'hop', 'pop']}, {g: '-un', w: ['sun', 'run', 'bun', 'fun']}], tip: 'Listen to the first sound to find the word.', jp: 'はじめの音で みわけよう'},
   PAIRS([['cat', 'cap', 't', 'p'], ['pig', 'pin', 'g', 'n'], ['bug', 'bus', 'g', 's']], 'Careful! Sometimes the END changes.', 'おわりが かわる ことも あるよ')]},
 {ch: 2, title: 'ck · ng · nk', jp: 'おわりの ck・ng・nk', type: 'word', n: 4,
  how: 'Listen to the very end of the word: ck, ng or nk?', sample: ['duck', 'king', 'pink', 'sock'],
  sets: [S(['sock', 'song'], ['sob']), S(['sick', 'sink', 'sing'], ['sit']), S(['back', 'bank', 'bat'], ['bang']), S(['lock', 'long', 'log'], ['lot']), S(['rock', 'wrong', 'ring'], ['rod']),
   S(['king', 'kick', 'kid'], ['kin']), S(['sack', 'sank', 'sad'], ['sang']), S(['pink', 'pin', 'pig'], ['pick']), S(['wink', 'wing', 'win'], ['wig']), S(['think', 'thing', 'thin'], ['thick']),
   S(['neck', 'net'], ['nest', 'next']), S(['duck', 'dug'], ['dunk', 'dump']), S(['tank', 'tick'], ['tack', 'thank']), S(['song', 'strong', 'sock'])],
  teach: [R1('ck', ['duck', 'sock', 'back'], 'ck says k at the end of a word: duck, sock', 'ck は おわりの ク', 'last'),
   R1('ng', ['king', 'song', 'long'], 'ng hums in the back of your nose: king', 'ng は はなの おくで ング', 'last'),
   R1('nk', ['pink', 'sink', 'bank'], 'nk is ng + k: pink, bank', 'nk は ング＋ク', 'last'),
   PAIRS([['sick', 'sink', 'ck', 'nk'], ['sock', 'song', 'ck', 'ng'], ['win', 'wink', 'n', 'nk']], 'Listen to the very end!', 'さいごの音を よく きこう')]},

 /* ---------------- Chapter 3: Two Letters ---------------- */
 {ch: 3, title: 'sh · ch · th', jp: '2文字で1つの音', type: 'word', n: 4,
  how: 'Two letters, one sound. Listen for sh, ch and th.', sample: ['ship', 'chip', 'thin', 'wish'],
  sets: [S(['ship', 'chip', 'sip', 'hip']), S(['shop', 'chop', 'hop', 'top']), S(['shin', 'chin', 'thin', 'tin']), S(['chick', 'thick', 'sick', 'kick']), S(['math', 'mash', 'mat', 'match']), S(['dish', 'ditch', 'dip', 'did']), S(['wish', 'witch', 'with', 'win']), S(['chair', 'share', 'hair', 'fair']), S(['sheep', 'cheap', 'sleep', 'sweep']), S(['much', 'mush', 'mug', 'must']), S(['thank', 'tank', 'bank', 'sank']), S(['bath', 'bash', 'bat', 'bad'])],
  teach: [R1('sh', ['ship', 'shop', 'fish', 'wish'], 'sh is the quiet sound: shhh!', 'しーっ の音'),
   R1('ch', ['chip', 'chin', 'chop', 'much'], 'ch is a little sneeze: ch, ch, chip', 'くしゃみの チュッ'),
   {rows: [{g: 'th', w: ['thin', 'thank', 'math', 'bath']}, {g: 'th', s: 'th-with', w: ['with']}], tip: 'th: put your tongue between your teeth', jp: '舌を 歯で かるく はさむ'},
   PAIRS([['ship', 'chip', 'sh', 'ch'], ['sick', 'thick', 's', 'th'], ['wish', 'with', 'sh', 'th']], 'Two letters, one sound. Which one do you hear?', '2文字で 1つの音')]},
 {ch: 3, title: 's Blends', jp: 's と つながる音', type: 'word', n: 4,
  how: 'Two sounds side by side, like s + t in stop. Hear them both!', sample: ['stop', 'spin', 'snap', 'swim'],
  sets: [S(['stop', 'top', 'spot', 'shop']), S(['slip', 'lip', 'sip', 'snip']), S(['swim', 'win', 'slim', 'skim']), S(['spin', 'pin', 'skin', 'spit']), S(['snack', 'sack', 'snap', 'stack']), S(['sweep', 'sleep', 'sheep']), S(['step', 'stop'], ['sip', 'pest']), S(['skin', 'spin'], ['sin', 'kin']), S(['snap', 'sap'], ['nap', 'slap']), S(['stack', 'sack'], ['tack', 'snack'])],
  teach: [{rows: [{g: 'st', w: ['stop', 'step']}, {g: 'sp', w: ['spot', 'spin']}, {g: 'sl', w: ['slip', 'slim']}], tip: 'Blends: say BOTH sounds, fast. s + t = st', jp: '2つの音を つなげて はやく'},
   {rows: [{g: 'sn', w: ['snap', 'snack']}, {g: 'sk', w: ['skin', 'skim']}, {g: 'sw', w: ['swim', 'sweep']}], tip: 'More s blends: sn, sk, sw', jp: 's と つながる音'},
   PAIRS([['top', 'stop', 't', 'st'], ['lip', 'slip', 'l', 'sl'], ['sack', 'snack', 's', 'sn']], 'Can you hear the extra sound?', 'ふえた音が きこえるかな？')]},
 {ch: 3, title: 'l and r Blends', jp: 'l・r と つながる音', type: 'word', n: 4,
  how: 'Blends with l and r: clap, flag, crab, tree. Hear both sounds!', sample: ['clap', 'flag', 'crab', 'tree'],
  sets: [S(['clap', 'cap', 'lap', 'flap']), S(['black', 'back', 'block', 'lack']), S(['crab', 'cab', 'grab', 'crib']), S(['trip', 'tip', 'drip', 'rip']), S(['brush', 'rush', 'bush', 'blush']), S(['glass', 'gas', 'grass', 'class']), S(['play', 'pay', 'pray', 'tray']), S(['cloud', 'crowd', 'loud', 'proud']), S(['drum', 'drip', 'trip']), S(['flag', 'flap'], ['flip', 'lag']), S(['tree', 'tray'], ['free', 'three']), S(['bread', 'bed', 'red'], ['bled'])],
  teach: [{rows: [{g: 'cl', w: ['clap', 'clock']}, {g: 'fl', w: ['flap', 'flag']}, {g: 'bl', w: ['black', 'block']}], tip: 'l blends: cl, fl, bl', jp: 'l と つながる音'},
   {rows: [{g: 'cr', w: ['crab', 'crib']}, {g: 'tr', w: ['trip', 'tree']}, {g: 'br', w: ['brush', 'bread']}], tip: 'r blends: cr, tr, br', jp: 'r と つながる音'},
   {rows: [{g: 'gr', w: ['grab', 'grass']}, {g: 'dr', w: ['drum', 'drip']}, {g: 'pr', w: ['pray', 'proud']}], tip: 'More r blends: gr, dr, pr', jp: 'もっと r の音'},
   PAIRS([['cloud', 'crowd', 'cl', 'cr'], ['play', 'pray', 'pl', 'pr'], ['glass', 'grass', 'gl', 'gr']], 'l or r? Listen carefully!', 'l かな？ r かな？')]},
 {ch: 3, title: 'End Blends', jp: 'おわりの つながる音', type: 'word', n: 4,
  how: 'Some blends come at the end: tent, lamp, nest, hand.', sample: ['tent', 'lamp', 'nest', 'hand'],
  sets: [S(['nest', 'net', 'next', 'neck']), S(['lamp', 'lap', 'limp', 'lump']), S(['tent', 'ten', 'test', 'text']), S(['best', 'bet', 'bed'], ['bent']), S(['camp', 'cap', 'can'], ['cat']), S(['jump', 'jam', 'jet']), S(['must', 'mud', 'mug'], ['mist']), S(['rest', 'red', 'ramp'], ['rent']), S(['desk', 'dish', 'dig'], ['disk']), S(['milk', 'mix'], ['mill', 'silk']), S(['gift', 'gas', 'gum'], ['sift']), S(['wind', 'win', 'wig'], ['wink']), S(['hand', 'ham', 'hat'], ['had']), S(['sand', 'sad', 'sat'], ['send']), S(['pond', 'pot', 'pop'], ['pod']), S(['vest', 'vet', 'van'])],
  teach: [{rows: [{g: 'nt', w: ['tent'], at: 'last'}, {g: 'mp', w: ['lamp', 'jump', 'camp'], at: 'last'}, {g: 'st', w: ['nest', 'best', 'vest'], at: 'last'}], tip: 'Say every sound at the end: n + t = nt', jp: 'おわりの音も ぜんぶ いおう'},
   {rows: [{g: 'nd', w: ['hand', 'sand', 'pond'], at: 'last'}, {g: 'ft', w: ['gift'], at: 'last'}, {g: 'lk', w: ['milk'], at: 'last'}], tip: 'n + d = nd. Can you hear both?', jp: '2つの音が きこえるかな？'},
   PAIRS([['ten', 'tent', 'n', 'nt'], ['lap', 'lamp', 'p', 'mp'], ['net', 'nest', 't', 'st']], 'Can you hear the extra sound?', 'ふえた音が きこえるかな？')]},

 /* ---------------- Chapter 4: Long Vowels ---------------- */
 {ch: 4, title: 'Magic e: a_e i_e', jp: 'マジック e ①', type: 'word', n: 4,
  how: 'An e at the end makes the vowel say its name: cap → cape.', sample: ['cap', 'cape', 'kit', 'kite'],
  sets: [S(['cap', 'cape'], ['cop', 'cope']), S(['tap', 'tape'], ['tip', 'type']), S(['pin', 'pine', 'pan', 'pane']), S(['hat', 'hate'], ['hit', 'hot']), S(['mad', 'made'], ['mud', 'mode']), S(['rid', 'ride'], ['rod', 'red']), S(['bit', 'bite'], ['bat', 'bet']), S(['kit', 'kite'], ['kid', 'cut']), S(['game', 'gate', 'gas'], ['gap']), S(['time', 'tame'], ['tin', 'tan']), S(['side', 'sad', 'sit'], ['said'])],
  teach: [PAIRS([['cap', 'cape', 'a', 'a_e'], ['tap', 'tape', 'a', 'a_e'], ['mad', 'made', 'a', 'a_e']], 'The e is silent, but it makes a say its name: A!', 'e は 読まないけど a が エイ になる'),
   PAIRS([['kit', 'kite', 'i', 'i_e'], ['pin', 'pine', 'i', 'i_e'], ['rid', 'ride', 'i', 'i_e']], 'i says its name: I!', 'i が アイ になる'),
   {rows: [{g: 'a_e', w: ['cake', 'game', 'face']}, {g: 'i_e', w: ['kite', 'time', 'nine']}], tip: 'Magic e words say the letter name.', jp: 'マジック e で アルファベットの 名前に なる'}]},
 {ch: 4, title: 'Magic e: o_e u_e', jp: 'マジック e ②', type: 'word', n: 4,
  how: 'Magic e again: not → note, cub → cube.', sample: ['not', 'note', 'cub', 'cube'],
  sets: [S(['not', 'note'], ['nut', 'net']), S(['rob', 'robe'], ['rib', 'rub']), S(['hop', 'hope', 'hose'], ['hip']), S(['cop', 'cope'], ['cap', 'cape']), S(['cub', 'cube'], ['cab', 'cob']), S(['cut', 'cute'], ['cat', 'kit']), S(['tub', 'tube'], ['tab', 'tug']), S(['nose', 'note', 'not'], ['nut']), S(['mute', 'mud', 'mat'], ['mutt']), S(['rude', 'rid', 'red'], ['rod']), S(['woke', 'wake', 'walk'], ['wok']), S(['vote', 'vet'], ['vat', 'volt'])],
  teach: [PAIRS([['not', 'note', 'o', 'o_e'], ['hop', 'hope', 'o', 'o_e'], ['rob', 'robe', 'o', 'o_e']], 'o says its name: O!', 'o が オウ になる'),
   PAIRS([['cub', 'cube', 'u', 'u_e'], ['cut', 'cute', 'u', 'u_e'], ['tub', 'tube', 'u', 'u_e']], 'u says its name: U!', 'u が ユー になる'),
   {rows: [{g: 'o_e', w: ['note', 'hope', 'nose']}, {g: 'u_e', w: ['cube', 'cute', 'tube']}], tip: 'o_e says O. u_e says U!', jp: 'o_e は オウ、u_e は ユー'}]},
 {ch: 4, title: 'ai · ay · ee · ea', jp: 'ai・ay・ee・ea', type: 'word', n: 4,
  how: 'Two letters make one long sound: rain, play, feet, meat.', sample: ['rain', 'play', 'feet', 'meat'],
  sets: [S(['rain'], ['ran', 'run', 'rim']), S(['tail'], ['tall', 'tell', 'till']), S(['pail', 'peel'], ['pal', 'pill']), S(['play', 'pay', 'tray'], ['plan']), S(['pay', 'pan', 'pat'], ['pal']), S(['feet', 'fit'], ['fat', 'fight']), S(['seed'], ['sad', 'side', 'sod']), S(['week'], ['wake', 'walk', 'woke']), S(['meat'], ['mat', 'met', 'mute']), S(['team'], ['time', 'tame']), S(['sheep', 'ship'], ['shop']), S(['sleep', 'slip'], ['slap']), S(['beat', 'bat', 'bit'], ['bet']), S(['mean', 'man', 'men'], ['moan']), S(['cheap', 'chip', 'chop'], ['chap'])],
  teach: [{rows: [{g: 'ai', w: ['rain', 'tail', 'pail']}, {g: 'ay', w: ['play', 'pay', 'tray']}], tip: 'ai and ay both say A. ay comes at the end.', jp: 'ai と ay は エイ。ay は おわりに くるよ'},
   {rows: [{g: 'ee', w: ['feet', 'seed', 'week']}, {g: 'ea', w: ['meat', 'team', 'beat']}], tip: 'ee and ea both say E!', jp: 'ee と ea は イー'},
   PAIRS([['rain', 'ran', 'ai', 'a'], ['feet', 'fit', 'ee', 'i'], ['meat', 'mat', 'ea', 'a']], 'Long or short? Listen!', 'ながい音？ みじかい音？')]},
 {ch: 4, title: 'oa · igh · oo', jp: 'oa・igh・oo', type: 'word', n: 4,
  how: 'More vowel teams: boat, light, moon.', sample: ['boat', 'light', 'moon', 'goat'],
  sets: [S(['boat'], ['bat', 'bit', 'beat']), S(['goat'], ['gate', 'get', 'got']), S(['road'], ['red', 'rid', 'rude']), S(['soap'], ['sip', 'sap', 'soup']), S(['coat', 'coal', 'cool'], ['cot']), S(['moan', 'moon'], ['man', 'mean']), S(['light', 'lip', 'lid'], ['lit']), S(['night', 'nut', 'net'], ['knit']), S(['right', 'red', 'rid'], ['rate']), S(['fight', 'fit', 'fat'], ['feet']), S(['pool', 'pal'], ['peel', 'pill']), S(['cool', 'call', 'kill'], ['coal']), S(['foot', 'feet'], ['fat', 'fit'])],
  teach: [R1('oa', ['boat', 'goat', 'road'], 'oa says O.', 'oa は オウ'),
   R1('igh', ['light', 'night', 'right'], 'igh says I. The g and h are quiet!', 'igh は アイ。g と h は 読まない'),
   {rows: [{g: 'oo', w: ['moon', 'pool', 'cool']}, {g: 'oo', s: 'oo-foot', w: ['foot']}], tip: 'oo says oo, like the moon. Sometimes it is short: foot.', jp: 'oo は ウー。みじかい ウ も あるよ'}]},
 {ch: 4, title: 'ou · ow · oi', jp: 'ou・ow・oi・oy', type: 'word', n: 4,
  how: 'ou and ow say ow! oi and oy say oy!', sample: ['cloud', 'cow', 'coin', 'boy'],
  sets: [S(['loud'], ['load', 'lad', 'lid']), S(['house', 'horse', 'hose'], ['his']), S(['mouse', 'mouth'], ['moss', 'mess']), S(['south', 'sock', 'song'], ['such']), S(['cow', 'cat'], ['cot', 'cut']), S(['crowd', 'crab', 'crib'], ['cod']), S(['proud'], ['prod', 'pad', 'pod']), S(['cloud', 'clap', 'clock'], ['clod']), S(['down', 'dog', 'dot'], ['done']), S(['town', 'ten', 'tin'], ['tan']), S(['owl', 'ox'], ['all', 'ill']),
   S(['boil'], ['bowl', 'ball', 'bell']), S(['coin', 'cone'], ['cane', 'can']), S(['oil'], ['all', 'ill', 'owl']), S(['boy'], ['bay', 'by', 'bee']), S(['toy'], ['tie', 'tea', 'ray'])],
  teach: [{rows: [{g: 'ou', w: ['cloud', 'house', 'mouth']}, {g: 'ow', w: ['cow', 'down', 'owl']}], tip: 'ou and ow say ow, like when you bump your head. Ow!', jp: 'ou と ow は アウ（いたい！の アウ）'},
   {rows: [{g: 'oi', w: ['boil', 'coin', 'oil']}, {g: 'oy', w: ['boy', 'toy']}], tip: 'oi and oy say oy. oy comes at the end.', jp: 'oi と oy は オイ。oy は おわりに くるよ'},
   PAIRS([['house', 'hose', 'ou', 'o_e'], ['cow', 'cat', 'ow', 'a'], ['coin', 'cone', 'oi', 'o_e']], 'Which sound do you hear?', 'どの音が きこえるかな？')]},
 {ch: 4, title: 'ar · or · er', jp: 'ar・or・er（r の母音）', type: 'word', n: 4,
  how: 'An r changes the vowel: car, fork, bird, turn.', sample: ['car', 'fork', 'bird', 'turn'],
  sets: [S(['car', 'cat', 'cap'], ['can']), S(['farm', 'fan', 'fat'], ['firm']), S(['park', 'pan', 'pat'], ['perk']), S(['star', 'stop', 'step'], ['stir']), S(['arm'], ['am', 'ham', 'harm']), S(['jar', 'jam', 'jet'], ['jaw']),
   S(['fork', 'fox', 'fog'], ['folk']), S(['corn', 'cub', 'cup'], ['cone']), S(['horse', 'horn', 'hose'], ['house']), S(['storm', 'stop'], ['stem', 'stamp']),
   S(['bird', 'bed', 'bud'], ['bad']), S(['girl'], ['gal', 'gull', 'goal']), S(['shirt', 'shop', 'ship'], ['short']), S(['turn', 'ten', 'tin'], ['torn']), S(['burn', 'bun'], ['bin', 'barn']), S(['her', 'hen', 'hair'], ['hat'])],
  teach: [R1('ar', ['car', 'star', 'park', 'farm'], 'ar says ar, like a pirate: arrr!', 'ar は アー（かいぞくの こえ）'),
   R1('or', ['fork', 'corn', 'horn', 'horse'], 'or says or: fork, corn.', 'or は オー'),
   {rows: [{g: 'er', w: ['her']}, {g: 'ir', w: ['bird', 'girl']}, {g: 'ur', w: ['turn', 'burn']}], tip: 'er, ir and ur all make the same sound: er!', jp: 'er・ir・ur は おなじ音'}]},

 /* ---------------- Chapter 5: Tricky Sounds ---------------- */
 {ch: 5, title: 'L or R', jp: 'にている音 L/R', type: 'word', n: 4,
  how: 'L or R? Listen very carefully!', sample: ['light', 'right', 'lock', 'rock'],
  sets: [S(['light', 'right'], ['night', 'fight']), S(['lock', 'rock'], ['sock', 'dock']), S(['glass', 'grass'], ['gas', 'class']), S(['play', 'pray'], ['pay', 'tray']), S(['long', 'wrong'], ['song', 'strong']), S(['lamp', 'ramp'], ['camp', 'damp']), S(['lake', 'rake'], ['cake', 'make']), S(['cloud', 'crowd'], ['loud', 'proud']), S(['collect', 'correct'], ['connect', 'direct']), S(['lip', 'rip'], ['tip', 'dip']), S(['log', 'rug'], ['dog', 'lug']), S(['lid', 'rid'], ['kid', 'did'])],
  teach: [PAIRS([['light', 'right', 'l', 'r'], ['lock', 'rock', 'l', 'r'], ['glass', 'grass', 'l', 'r']], 'l: tongue touches the top. r: tongue does not touch.', 'l は 舌が つく、r は つかない'),
   PAIRS([['lake', 'rake', 'l', 'r'], ['long', 'wrong', 'l', 'r'], ['play', 'pray', 'l', 'r']], 'Tongue up for l. Round lips for r.', 'l は 舌を 上に、r は くちびるを まるく')]},
 {ch: 5, title: 'B/V · F/H · S/TH', jp: 'にている音 B/V・F/H・S/TH', type: 'word', n: 4,
  how: 'B or V? F or H? S or TH? Listen for your lips, teeth and tongue!', sample: ['best', 'vest', 'fat', 'hat'],
  sets: [S(['best', 'vest'], ['rest', 'test']), S(['boat', 'vote'], ['goat', 'coat']), S(['bet', 'vet'], ['net', 'wet']), S(['base', 'vase'], ['case', 'face']), S(['van', 'fan'], ['ban', 'pan']),
   S(['fat', 'hat'], ['cat', 'mat']), S(['fit', 'hit'], ['sit', 'kit']), S(['fog', 'hog'], ['dog', 'log']), S(['fun', 'hum'], ['sun', 'run']),
   S(['sink', 'think'], ['pink', 'wink']), S(['sick', 'thick'], ['tick', 'kick']), S(['mouse', 'mouth'], ['house', 'south']), S(['sank', 'thank'], ['tank', 'bank'])],
  teach: [PAIRS([['best', 'vest', 'b', 'v'], ['boat', 'vote', 'b', 'v'], ['bet', 'vet', 'b', 'v']], 'b: lips pop. v: top teeth on your lip.', 'b は くちびる、v は 歯と くちびる'),
   PAIRS([['fat', 'hat', 'f', 'h'], ['fit', 'hit', 'f', 'h'], ['fog', 'hog', 'f', 'h']], 'f: top teeth on your lip. h: just a breath.', 'f は 歯と くちびる、h は いきだけ'),
   PAIRS([['sink', 'think', 's', 'th'], ['sick', 'thick', 's', 'th'], ['mouse', 'mouth', 's', 'th']], 's: a snake. th: tongue between your teeth.', 's は スー、th は 舌を はさむ')]},
 {ch: 5, title: 'Lantern Festival', jp: 'ランタンフェスティバル（ぜんぶミックス）', type: 'mix', n: 4, dest: 'mega', from: 'words',
  how: 'Everything mixed together, on a lantern night. Can you win?', sample: ['ship', 'cape', 'rain', 'grass'],
  teach: [{rows: [{g: 'sh', w: ['ship', 'fish']}, {g: 'st', w: ['stop', 'nest']}, {g: 'a_e', w: ['cape', 'made']}], tip: 'Remember these?', jp: 'おぼえているかな？'},
   {rows: [{g: 'oa', w: ['boat', 'road']}, {g: 'ee', w: ['feet', 'seed']}, {g: 'ar', w: ['car', 'star']}], tip: 'Listen carefully. You can do it!', jp: 'よく きいて。きみなら できる！'}]}
];

/* number the levels, give each its theme, destination and rival speed */
const DEST_CYCLE = ['steps', 'wood', 'arch'];
const LEVELS = RAW.map((L, i) => {
  const ch = CHAPTERS.find(c => c.id === L.ch), u = i / (RAW.length - 1);
  return Object.assign({
    id: i + 1, theme: ch.theme, dest: DEST_CYCLE[i % 3],
    rival: +(6.6 - u * 2.0).toFixed(2), slip: +(0.2 - u * 0.1).toFixed(3)
  }, L);
});
LEVELS.forEach(L => {
  if (L.from === 'words') L.from = LEVELS.filter(o => o.type === 'word').map(o => o.id);
});
CHAPTERS.forEach(c => c.levels = LEVELS.filter(L => L.ch === c.id).map(L => L.id));

/* ---------- what the game can say ---------- */
function teachWords(L){ const out = []; (L.teach || []).forEach(c => c.rows.forEach(r => out.push(...(r.pair || r.w)))); return out; }
function teachGraphemes(L){ const out = []; (L.teach || []).forEach(c => c.rows.forEach(r => { if (r.pair) out.push(...r.g); else out.push(r.s || r.g); })); return out; }
function spokenWords(L){
  const s = new Set(teachWords(L));
  if (L.letters) Object.values(L.letters).forEach(a => a.forEach(w => s.add(w)));
  if (L.sets) L.sets.forEach(set => set.t.forEach(w => s.add(w)));
  return [...s];
}
function spokenSounds(L){
  const s = new Set();
  teachGraphemes(L).forEach(g => { const id = soundId(g); if (id) s.add(id); });
  if (L.letters) Object.keys(L.letters).forEach(g => { const id = soundId(g); if (id) s.add(id); });
  return [...s];
}

return {DESTS, CHAPTERS, LEVELS, SOUNDS, SOUND_OF, PHRASES, soundId, spokenWords, spokenSounds, teachWords};
})();
