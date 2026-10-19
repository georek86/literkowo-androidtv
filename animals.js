import { ellipse, path, line, cream, paleOutline, eye, eyes, smile } from './animal-art.js';
import { moreIllustrations } from './animals-more.js';
import { extendedIllustrations } from './animals-extended.js';
import { habitatArt } from './habitats.js';

export const animals = [
  ['a', 'alpaka', 'alpaca', '#e8d4ab'],
  ['b', 'bocian', 'stork', '#ede9d9'],
  ['b', 'bóbr', 'beaver', '#a58a6d'],
  ['b', 'biedronka', 'ladybug', '#c66e55'],
  ['c', 'cykada', 'cicada', '#93a67a'],
  ['c', 'chomik', 'hamster', '#b99d79'],
  ['ć', 'ćma', 'moth', '#b1a08a'],
  ['d', 'delfin', 'dolphin', '#7da9af'],
  ['e', 'emu', 'emu', '#a39b86'],
  ['f', 'foka', 'seal', '#a7b7af'],
  ['f', 'flaming', 'flamingo', '#d28f83'],
  ['g', 'gęś', 'goose', '#eeeadd'],
  ['h', 'hipopotam', 'hippo', '#aaa6b7'],
  ['i', 'indyk', 'turkey', '#ad8d73'],
  ['j', 'jeż', 'hedgehog', '#a18368'],
  ['k', 'kot', 'cat', '#d39860'],
  ['k', 'kaczka', 'duck', '#93a66b'],
  ['k', 'krowa', 'cow', '#f3e7cd'],
  ['k', 'królik', 'rabbit', '#b9a38d'],
  ['k', 'koza', 'goat', '#b8aa90'],
  ['k', 'koń', 'horse', '#a78366'],
  ['k', 'krab', 'crab', '#b9826a'],
  ['l', 'lis', 'fox', '#d18a47'],
  ['l', 'lew', 'lion', '#d8ad58'],
  ['ł', 'łoś', 'moose', '#a68c71'],
  ['m', 'motyl', 'butterfly', '#d8ab5c'],
  ['m', 'mysz', 'mouse', '#a5a297'],
  ['m', 'małpa', 'monkey', '#a18a70'],
  ['m', 'mucha', 'fly', '#7d8a7b'],
  ['n', 'niedźwiedź', 'bear', '#aa7c50'],
  ['o', 'owca', 'sheep', '#f4e8ce'],
  ['o', 'ośmiornica', 'octopus', '#ab91b8'],
  ['o', 'orka', 'orca', '#405e65'],
  ['p', 'pies', 'dog', '#c4965d'],
  ['p', 'panda', 'panda', '#e8e2d2'],
  ['p', 'papuga', 'parrot', '#86aa66'],
  ['p', 'pingwin', 'penguin', '#5c7778'],
  ['p', 'pszczoła', 'bee', '#dbb34f'],
  ['r', 'ryba', 'fish', '#d29863'],
  ['r', 'rak', 'crayfish', '#b4826c'],
  ['r', 'rekin', 'shark', '#8babad'],
  ['s', 'sowa', 'owl', '#a0865b'],
  ['s', 'słoń', 'elephant', '#8faaa9'],
  ['s', 'sarna', 'deer', '#bc8954'],
  ['ś', 'ślimak', 'snail', '#ae9879'],
  ['t', 'tygrys', 'tiger', '#de9f50'],
  ['u', 'uchatka', 'seaLion', '#b3a08a'],
  ['w', 'wieloryb', 'whale', '#7da7b2'],
  ['w', 'wiewiórka', 'squirrel', '#ba7846'],
  ['z', 'zebra', 'zebra', '#f2e9d6'],
  ['ź', 'źrebak', 'foal', '#b59577'],
  ['ż', 'żaba', 'frog', '#8baa5e'],
  ['ż', 'żółw', 'turtle', '#91a07a'],
  ['ż', 'żyrafa', 'giraffe', '#d5b05c'],
  ['b', 'borsuk', 'badger', '#89928a'],
  ['n', 'niedźwiedź polarny', 'polarBear', '#f4eedc'],
  ['k', 'koala', 'koala', '#98aaa7'],
  ['k', 'kangur', 'kangaroo', '#c39163'],
  ['s', 'szop', 'raccoon', '#91a09b'],
  ['w', 'wilk', 'wolf', '#8c9e9e'],
  ['w', 'wydra', 'otter', '#aa7f55'],
  ['l', 'leniwiec', 'sloth', '#ba9c76'],
  ['n', 'nietoperz', 'bat', '#8a90a3'],
  ['p', 'paw', 'peacock', '#568f9c'],
  ['ł', 'łabędź', 'swan', '#faf2dd'],
  ['d', 'dzięcioł', 'woodpecker', '#d5ccb0'],
  ['k', 'kogut', 'rooster', '#d9a054'],
  ['k', 'krokodyl', 'crocodile', '#89aa6b'],
  ['w', 'wąż', 'snake', '#8aab65'],
  ['k', 'kameleon', 'chameleon', '#8bac68'],
  ['k', 'konik morski', 'seahorse', '#d6a26d'],
  ['m', 'meduza', 'jellyfish', '#c39ba9'],
  ['w', 'wielbłąd', 'camel', '#c9a16b'],
  ['s', 'surykatka', 'meerkat', '#c49a69'],
  ['k', 'kura', 'hen', '#c89768'],
  ['a', 'antylopa', 'antelope', '#c89f64'],
  ['d', 'dziobak', 'platypus', '#a58761'],
  ['f', 'fretka', 'ferret', '#aa9374'],
  ['g', 'goryl', 'gorilla', '#66766d'],
  ['g', 'gepard', 'cheetah', '#dbb465'],
  ['h', 'hiena', 'hyena', '#bd9f71'],
  ['h', 'homar', 'lobster', '#c68f78'],
  ['j', 'jaszczurka', 'lizard', '#8eae69'],
  ['p', 'pantera', 'panther', '#52635e'],
  ['j', 'jaguar', 'jaguar', '#c9a05c'],
  ['j', 'jeleń', 'stag', '#b08960'],
  ['t', 'tapir', 'tapir', '#64766c'],
  ['t', 'tukan', 'toucan', '#405e55'],
  ['n', 'nosorożec', 'rhino', '#9aa69a'],
  ['ś', 'świnia', 'pig', '#d7aaa0'],
  ['o', 'osioł', 'donkey', '#a6aea1'],
  ['d', 'dzik', 'boar', '#978265'],
  ['k', 'kret', 'mole', '#827c6e'],
  ['o', 'orzeł', 'eagle', '#9e815f'],
  ['w', 'wróbel', 'sparrow', '#b89a74'],
  ['g', 'gołąb', 'pigeon', '#a5b5af'],
  ['m', 'mrówka', 'ant', '#aa8466'],
  ['p', 'pająk', 'spider', '#a19388'],
  ['o', 'osa', 'wasp', '#d8b353'],
  ['g', 'gąsienica', 'caterpillar', '#96b36b'],
].map(([key, name, kind, color]) => ({ key, inputKey: normalizeAnimalKey(key), name, kind, color }));

// Keep spelling on screen, but make every animal reachable without AltGr.
export function normalizeAnimalKey(key) {
  return key.toLocaleLowerCase('pl').replaceAll('ł', 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function animalForKey(key) {
  return animals.find(animal => animal.inputKey === normalizeAnimalKey(key));
}

// Each letter and the full album have independent shuffled bags. A bag is
// consumed before refilling, unless switching pools would repeat an animal.
export class AnimalAlbum {
  constructor(initial, { random = Math.random } = {}) {
    this.random = random;
    this.reset(initial);
  }
  reset(initial) {
    const choices = animals.filter(animal => animal !== this.current);
    this.current = initial ?? choices[Math.floor(this.random() * choices.length)];
    this.bags = new Map();
    this.lastByKey = new Map([[this.current.inputKey, this.current]]);
    return this.current;
  }
  shuffle(pool) {
    const bag = [...pool];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }
  next(key = ' ') {
    const letter = normalizeAnimalKey(key);
    const group = animals.filter(animal => animal.inputKey === letter);
    const pool = group.length ? group : animals;
    const bagKey = group.length ? letter : '*';
    let bag = this.bags.get(bagKey);
    if (!bag?.length) bag = this.shuffle(pool);
    const previous = group.length ? this.lastByKey.get(letter) : this.current;
    if (pool.length > 1 && bag.at(-1) === previous) {
      const alternative = bag.findIndex(animal => animal !== previous);
      if (alternative < 0) bag = this.shuffle(pool.filter(animal => animal !== previous));
      else [bag[alternative], bag[bag.length - 1]] = [bag.at(-1), bag[alternative]];
    }
    const animal = bag.pop();
    this.bags.set(bagKey, bag);
    this.current = animal;
    this.lastByKey.set(animal.inputKey, animal);
    return animal;
  }
}


function mammal(kind, c) {
  let behind = '', face = '', extras = '';
  let body = ellipse(185, 177, 54, 65, c);
  const ears = (shape) => shape === 'pointy'
    ? path('M133 86L130 36Q131 29 138 35L170 62M203 62L234 35Q241 29 240 39L237 87', c)
    : `${ellipse(143, 64, 21, 24, c)}${ellipse(227, 64, 21, 24, c)}`;
  if (['cat','tiger','fox'].includes(kind)) {
    behind = path('M221 216C294 232 300 177 274 170C249 166 272 208 230 197Z', c);
    face += (kind === 'fox' ? path('M136 101L130 39Q130 30 138 36L177 77L169 102M201 102L193 77L232 36Q240 30 240 39L234 101Z',c) : ears('pointy')) + path('M141 69L139 46L159 67M213 67L233 46L231 74', '#dcae92');
    if (kind === 'fox') {
      behind += path('M272 170C290 169 294 187 286 201L270 199Q281 180 272 170', cream);
      face += path('M133 85Q185 54 237 85L222 126L185 150L148 126Z', c);
      face += path('M135 100L185 134L235 100Q231 136 185 152Q139 136 135 100', cream);
    }
  } else if (kind === 'rabbit') {
    behind = ellipse(235, 202, 20, 20, cream);
    face += ellipse(160, 47, 15, 40, c, 'transform="rotate(-12 160 47)"') + ellipse(210, 47, 15, 40, c, 'transform="rotate(12 210 47)"');
    face += ellipse(160, 43, 7, 26, '#d6b5a3', 'transform="rotate(-12 160 43)"') + ellipse(210, 43, 7, 26, '#d6b5a3', 'transform="rotate(12 210 43)"');
  } else if (kind === 'elephant') {
    face += ellipse(132, 111, 43, 57, c) + ellipse(238, 111, 43, 57, c);
    face += ellipse(130, 112, 29, 41, '#bbc2bd') + ellipse(240, 112, 29, 41, '#bbc2bd');
  } else if (kind === 'cow') {
    behind = path('M152 66Q132 52 139 34L163 59M207 59L231 34Q239 53 218 66', '#bcad8b');
    face += ellipse(132, 86, 23, 13, c, 'transform="rotate(20 132 86)"') + ellipse(238, 86, 23, 13, c, 'transform="rotate(-20 238 86)"');
  } else if (kind === 'panda') {
    face += ellipse(145, 65, 22, 24, '#70766b') + ellipse(225, 65, 22, 24, '#70766b');
  } else if (kind === 'dog') {
    behind = line('M231 207Q279 210 273 180', c, 16);
    face += path('M143 63Q118 49 112 80L109 120Q114 140 134 123L152 87M225 63Q249 49 256 80L260 120Q256 140 236 123L218 87', '#8f765f');
  } else if (['alpaca','moose','foal','zebra','deer','goat','horse'].includes(kind)) {
    body = ellipse(188, 182, 58, 46, c) + path('M146 181L149 229Q155 236 163 229L170 187M201 187L207 229Q216 236 222 229L225 180', c);
    behind = line('M236 170Q262 184 258 199', c, 9);
    face += ellipse(162, 56, 10, 28, c, 'transform="rotate(-18 162 56)"') + ellipse(207, 56, 10, 28, c, 'transform="rotate(18 207 56)"');
    if (kind === 'moose') behind += line('M153 67Q111 61 109 28M122 52L94 44M112 39L130 26M214 66Q256 61 260 27M248 51L273 43M258 39L241 23', '#857359', 10);
    if (kind === 'zebra') face += path('M178 62L177 30L186 40L196 32L196 69', '#6c6c60');
    if (kind === 'foal' || kind === 'horse') face += path('M170 61Q179 31 203 46L221 88L200 73L195 94L180 68', '#816b58');
    if (kind === 'horse') {
      behind = path('M231 158Q278 144 270 208L257 222L249 207Q264 174 231 174', '#6e5e4e');
      face += path('M211 63Q243 108 222 155L207 146L219 132L207 120L220 105Z', '#6e5e4e');
    }
    if (kind === 'goat') behind += path('M157 64Q131 28 151 19Q148 39 173 59M199 59Q224 38 222 19Q244 28 216 64', '#827761');
  } else {
    face += ears('round');
    face += ellipse(143, 64, 11, 13, '#c5aa90') + ellipse(227, 64, 11, 13, '#c5aa90');
  }
  if (!['alpaca','moose','foal','zebra','deer','goat','horse'].includes(kind)) body += ellipse(185, 188, 34, 43, cream) + ellipse(151, 225, 23, 12, c) + ellipse(217, 225, 23, 12, c);
  if (kind === 'cow') body += ellipse(151, 177, 18, 25, '#8c8976') + ellipse(213, 205, 17, 19, '#8c8976');
  if (kind === 'panda') body += ellipse(140, 174, 16, 37, '#70766b') + ellipse(230, 174, 16, 37, '#70766b') + ellipse(151, 225, 23, 12, '#70766b') + ellipse(217, 225, 23, 12, '#70766b');
  if (kind === 'deer') body += [160,185,210].map(x => ellipse(x, 174, 4, 3, cream)).join('');
  if (kind === 'lion') {
    behind += Array.from({length:12}, (_, i) => ellipse(185 + Math.cos(i * Math.PI / 6) * 53, 101 + Math.sin(i * Math.PI / 6) * 49, 25, 27, '#99764f')).join('');
    behind += path('M226 207Q280 215 266 175', 'none', 'stroke="#99764f" stroke-width="9" stroke-linecap="round"') + ellipse(265,174,10,15,'#99764f');
  }
  if (kind === 'mouse') {
    behind = line('M223 214Q294 242 282 197Q275 178 259 190', '#b09a8c', 7);
    face = ellipse(137,61,35,34,c) + ellipse(233,61,35,34,c) + ellipse(137,61,24,23,'#c9b3a6') + ellipse(233,61,24,23,'#c9b3a6');
  }
  if (kind === 'monkey') {
    behind = line('M226 201Q298 222 285 157Q280 131 261 143Q244 159 267 164', '#87735c', 13);
    face = ellipse(126,102,27,30,c) + ellipse(244,102,27,30,c) + ellipse(126,102,17,20,cream) + ellipse(244,102,17,20,cream);
  }
  if (kind === 'beaver') behind = ellipse(258,200,30,53,'#83715a','transform="rotate(38 258 200)"') + line('M242 167l37 29m-48-13 40 32m-42-16 29 30m-4-64-17 56m30-43-15 50','#a18b6b',2);
  if (kind === 'squirrel') behind = path('M226 221Q299 221 291 143Q286 95 257 77Q221 55 210 86Q202 108 229 123Q252 139 242 179L214 192Z', '#9c704e') + line('M238 94Q282 140 260 196','#c5a27c',10);
  if (kind !== 'fox') face += ellipse(185, 99, kind === 'hippo' ? 66 : 55, 49, c, kind === 'sheep' ? paleOutline : '');
  if (kind === 'monkey') face += path('M146 105C141 78 170 74 185 94C200 74 229 78 224 105Q237 136 211 146Q185 159 159 146Q133 136 146 105Z',cream);
  if (kind === 'panda') face += ellipse(162, 110, 15, 21, '#74796e', 'transform="rotate(25 162 110)"') + ellipse(208, 110, 15, 21, '#74796e', 'transform="rotate(-25 208 110)"');
  if (kind === 'cow') face += path('M150 65Q168 50 186 57L171 89Q145 97 141 81Z', '#8c8976');
  if (['alpaca','sheep'].includes(kind)) {
    if (kind === 'sheep') body = path('M137 139C110 122 105 158 120 171C99 190 118 216 140 214C140 241 175 244 186 224C207 246 239 231 232 212C263 211 265 180 246 169C263 146 236 123 220 138C207 112 177 115 169 136C156 118 137 122 137 139Z',c,paleOutline) + ellipse(161, 228, 12, 9, '#8c806b') + ellipse(211, 228, 12, 9, '#8c806b');
    face += [145,162,183,204,223].map((x,i) => ellipse(x, 68-Math.sin(i*.8)*13, 17, 18, cream, kind === 'sheep' ? paleOutline : '')).join('');
  }
  if (kind === 'hippo') face += ellipse(185, 132, 59, 31, '#c0b6c2') + ellipse(159, 122, 5, 4, '#8f8497') + ellipse(211, 122, 5, 4, '#8f8497');
  else if (['moose','foal','zebra','alpaca','cow','deer','goat','horse'].includes(kind)) face += ellipse(185, 128, 32, 23, kind === 'cow' ? '#d2b4a1' : cream) + ellipse(174, 127, 3, 3, '#8a7962') + ellipse(196, 127, 3, 3, '#8a7962');
  else if (!['fox','elephant','monkey'].includes(kind)) face += ellipse(172, 126, 17, 13, cream) + ellipse(198, 126, 17, 13, cream);
  if (['cat','tiger'].includes(kind)) {
    extras += line('M148 126L117 120M148 135L116 138M222 126L253 120M222 135L254 138', '#9b8064', 2);
    extras += path('M178 119Q185 114 192 119L185 125Z', '#a86e62') + line('M185 125V131Q178 138 172 132M185 131Q192 138 198 132', '#8a6b55', 2);
  } else if (kind === 'elephant') {
    extras += path('M163 134Q146 150 157 170Q156 151 174 144M207 134Q225 151 215 169Q213 152 199 144Z',cream);
    extras += path('M172 123Q185 115 198 123Q193 150 199 176Q199 193 210 187Q218 175 224 183Q234 203 210 214Q176 227 172 194Q177 163 172 123Z',c);
    extras += line('M178 149q7 3 15 0m-14 12q7 3 14 0M208 196q6 1 9-4','#6f9290',2);
  } else if (!['hippo','alpaca','moose','foal','zebra','cow','deer','goat','horse'].includes(kind)) extras += ellipse(185, 123, 8, 5, '#615647') + smile();
  else extras += smile(185, 140);
  if (kind === 'tiger') extras += path('M174 55L178 81L185 62L194 82L198 56M134 95L153 100L132 109M235 95L216 100L239 109M139 173L154 182L136 188M227 176L215 188L234 189', '#877155');
  if (kind === 'zebra') extras += path('M153 68L173 79L144 82M218 68L198 79L232 82M140 97L158 106L136 113M230 96L212 106L239 113M147 153L172 180L149 174M181 140L193 176L203 148M222 150L208 185L235 169M151 204L165 210L150 216M207 202L222 210L208 217', '#75766c');
  if (kind === 'goat') extras += path('M174 147L179 173L186 165L192 173L199 147', '#827761');
  if (kind === 'horse') extras += path('M165 57Q182 36 203 55L211 80L195 70L184 88L178 69L161 77Z', '#6e5e4e');
  if (kind === 'beaver') extras += path('M177 134H193V149H177Z', cream) + line('M185 135V148','#a38c6d',1.5);
  if (kind === 'hamster') extras += ellipse(146,127,18,14,'#d3b18c') + ellipse(224,127,18,14,'#d3b18c') + ellipse(185,190,14,25,'#b59c65') + line('M185 174V207','#8d7850',2) + ellipse(164,189,14,10,c) + ellipse(206,189,14,10,c);
  if (kind === 'mouse') extras += line('M150 126L123 120M150 133L122 139M220 126L247 120M220 133L248 139','#7d796d',2);
  return behind + body + face + eyes() + extras;
}

function bird(kind, c) {
  if (kind === 'duck') return ellipse(167, 231, 22, 6, '#bb9865') + ellipse(219, 231, 22, 6, '#bb9865') + path('M111 176L91 147L135 156Q166 127 213 144Q237 121 222 111L240 100Q271 181 233 208Q208 228 165 221Q120 216 111 176', c) + ellipse(229, 104, 34, 34, c) + path('M258 101Q280 98 291 107L286 117L258 118Z', '#c3a16c') + ellipse(169, 176, 36, 23, '#c7c8a5', 'transform="rotate(-13 169 176)"') + eye(239,98) + line('M232 134l18-2', cream, 5);
  if (kind === 'penguin') return ellipse(162, 232, 25, 8, '#c1a078') + ellipse(211, 232, 25, 8, '#c1a078') + path('M139 126Q103 147 108 197L147 169M231 126Q266 147 263 197L224 169', c) + ellipse(185, 159, 57, 77, c) + ellipse(185, 89, 44, 42, c) + ellipse(185, 168, 39, 59, cream) + ellipse(169, 99, 20, 28, cream) + ellipse(201, 99, 20, 28, cream) + eyes(169,201,96) + path('M176 111L185 122L194 111Z', '#c1a078');
  if (kind === 'parrot') return path('M170 184L168 243L186 232L199 241L210 180', '#92a4a1') + line('M155 224H222', '#aa9270', 5) + ellipse(186, 151, 46, 64, c) + ellipse(183, 87, 39, 37, c) + path('M197 77Q235 76 236 107L216 128Q219 99 199 100Z', '#bda581') + ellipse(199, 86, 15, 18, cream) + eye(202,83) + path('M153 126Q129 177 175 206Q199 172 174 132Z', '#849c78') + line('M150 155q-2 25 20 36', '#bac6a0', 3);
  let behind = '', body = '', head = '', decoration = '';
  const long = ['stork','goose','emu'].includes(kind);
  if (kind === 'turkey') behind = [-60,-30,0,30,60].map((r,i) => ellipse(185, 118, 27, 88, ['#9e8065','#b39a76','#c2ac84','#b39a76','#9e8065'][i], `transform="rotate(${r} 185 179)"`)).join('');
  behind += line('M166 203V233L152 235M204 203V233L218 235', kind === 'stork' ? '#b78061' : '#a78b61', 5);
  if (long) {
    const outline = kind === 'emu' ? '' : paleOutline;
    body = ellipse(175, 172, 66, 39, c, outline) + path('M201 173Q229 137 219 80L242 80Q254 160 215 192', c, outline);
    head = ellipse(230, 77, 28, 26, c, outline) + path(kind === 'stork' ? 'M253 73L305 85L252 88Z' : 'M253 74L278 85L252 91Z', '#b48a55');
    body += ellipse(164, 171, 39, 23, kind === 'stork' ? '#686b60' : kind === 'emu' ? '#877e6a' : '#b9b79e', 'transform="rotate(-15 164 171)"');
    head += eye(237,72);
    if (kind === 'emu') decoration += path('M213 58L216 37L223 54L233 35L236 55', '#837b68');
  } else {
    body = ellipse(185, 156, 64, 67, c) + ellipse(185, 176, 41, 40, cream);
    head = kind === 'owl' ? path('M126 133L126 58L151 72Q185 56 219 72L244 58L244 137Z', c) : ellipse(185, 98, 32, 41, c);
    if (kind === 'owl') head += ellipse(158, 112, 30, 33, cream) + ellipse(212, 112, 30, 33, cream) + eye(158,110,{rx:18,ry:21,iris:'#8e7953'}) + eye(212,110,{rx:18,ry:21,iris:'#8e7953'});
    else head += eyes(173,197,94) + path('M182 117Q200 128 194 145Q182 144 182 117', '#b58170');
    head += path('M177 120L185 131L193 120Z', '#ba9562');
    body += path('M128 134Q105 176 143 198L151 148M240 134Q264 176 227 198L220 148', c);
    decoration += [162,185,208].map(x => line(`M${x-3} 171l3 4 3-4`, '#c4b599', 2)).join('');
  }
  return behind + body + head + decoration;
}

function water(kind, c) {
  if (kind === 'frog') return ellipse(185,226,93,10,'#b8c99d')+ellipse(139,202,33,27,c)+ellipse(231,202,33,27,c)+ellipse(185,180,48,49,c)+ellipse(185,185,29,34,'#cfdaad')+ellipse(157,106,27,31,c)+ellipse(213,106,27,31,c)+ellipse(185,140,69,41,c)+ellipse(157,103,16,19,'#ede9d5')+ellipse(213,103,16,19,'#ede9d5')+eyes(157,213,104)+line('M160 143Q185 165 210 143','#708257',3)+ellipse(143,138,10,5,'#bcc794')+ellipse(227,138,10,5,'#bcc794');
  if (['seal','seaLion'].includes(kind)) return path('M126 195Q118 106 179 103Q230 102 220 168Q230 194 279 196L303 179L301 208L278 219L173 223Q126 223 126 195',c)+ellipse(175,113,47,43,c)+ellipse(171,137,30,16,cream)+eyes(157,192,108)+ellipse(175,128,7,5,'#62645a')+line('M152 136L123 130M152 142L124 147M194 136L224 130M194 142L224 147','#7e8071',2)+path('M178 182Q190 227 154 235L150 227L159 181',c)+smile(175,141)+(kind === 'seaLion' ? ellipse(133,106,8,12,c)+ellipse(216,106,8,12,c) : '');
  if (kind === 'fish') return path('M251 146L296 110Q309 155 296 190L251 169',c)+path('M160 113L191 84L214 115M163 184L196 208L217 181','#b5896d')+ellipse(189,150,77,45,c)+ellipse(154,150,29,39,'#d9b79a')+eye(143,141)+line('M118 155q8 8 16 2','#8e725b',2)+line('M202 140q-16 13 0 25','#ac805f',3)+[220,237].map(x=>line(`M${x} 130q-10 20 0 40`,'#dab89b',2)).join('');
  let body = kind === 'dolphin' ? path('M105 166Q99 114 166 113L190 83L201 117Q244 124 265 170L298 157L291 184L265 192Q185 231 127 186L84 181Q72 168 105 166',c) : path('M92 144Q92 92 163 93Q240 92 260 167Q280 168 291 145L313 150Q313 197 270 207Q226 230 165 220Q90 213 92 144',c);
  body += path('M99 180Q169 213 252 188Q227 225 165 220Q117 215 99 180','#c4d3cb')+path('M169 177Q169 210 205 218Q211 195 191 176',c)+eye(125,151)+line('M99 171Q112 182 127 173','#597a7d',2.5);
  if (kind === 'whale') body += line('M153 85Q155 59 142 56M155 84Q167 62 178 66','#9cbcb8',5);
  return body;
}

function insect(kind, c) {
  if (kind === 'cicada') return line('M159 148L126 133M160 169L124 179M211 148L244 133M210 169L246 179','#7a8764',3)+ellipse(185,158,23,62,c)+ellipse(155,151,25,58,'#b7c6a2','transform="rotate(22 155 151)"')+ellipse(215,151,25,58,'#b7c6a2','transform="rotate(-22 215 151)"')+line('M165 108L146 188M205 108L224 188','#91a47a',2)+ellipse(185,100,28,22,c)+eyes(173,197,95);
  const wings = kind === 'moth' ? '#c9baa2' : '#d6b683';
  return ellipse(140,118,46,54,wings,'transform="rotate(-25 140 118)"')+ellipse(230,118,46,54,wings,'transform="rotate(25 230 118)"')+ellipse(151,179,35,36,c)+ellipse(219,179,35,36,c)+ellipse(135,115,21,27,'#e6d7b8')+ellipse(235,115,21,27,'#e6d7b8')+ellipse(151,182,13,14,'#ddd0ad')+ellipse(219,182,13,14,'#ddd0ad')+ellipse(185,147,13,57,'#8d8f6b')+ellipse(185,95,18,17,'#9c9d78')+line('M178 83Q163 59 157 71M192 83Q207 59 213 71','#8d8f6b',3)+eyes(179,191,94)+smile(185,101);
}

// Rounded joints and separated near/far legs keep the silhouettes readable.
function hoofed(kind, c) {
  const alpaca = kind === 'alpaca', deer = kind === 'deer', moose = kind === 'moose';
  const horse = ['horse','foal','zebra'].includes(kind), cow = kind === 'cow', young = kind === 'foal';
  const facingUs = ['horse','foal','moose'].includes(kind);
  const y = alpaca ? 163 : moose ? 146 : 154, hy = alpaca ? 70 : cow ? 109 : 96;
  const hx = 253, ry = deer || young ? 30 : moose || cow ? 42 : 36;
  const dark = kind === 'zebra' ? '#60675f' : '#76624c', hoof = '#675e50';
  const width = deer || young ? 5 : 7;
  const leg = (x, foot, fill, top = y+13) => path(`M${x-width} ${top}Q${x-width-1} ${top+22} ${foot-width} 225Q${foot} 232 ${foot+width} 225L${x+width+1} ${top}Z`,fill)
    + path(`M${foot-width} 222Q${foot} 220 ${foot+width} 222V230H${foot-width}Z`,hoof);
  let art = leg(141,142,'#998d77') + leg(199,202,'#998d77');
  if (horse) art += path('M110 143Q85 129 83 158Q83 188 75 207Q96 205 100 185L102 156L117 157Z',dark);
  else if (deer || moose) art += ellipse(106,y-7,10,13,deer ? cream : c,'transform="rotate(-28 106 147)"');
  else art += line(`M111 ${y-9}Q88 ${y-20} 85 ${y+15}`,c,7);
  art += path(`M193 ${y+16}C213 ${y-1} 220 ${hy+23} 229 ${hy+7}Q241 ${hy-5} 255 ${hy+6}C248 ${hy+27} 248 ${y+6} 228 ${y+22}Z`,c);
  if (horse) art += path(`M229 ${hy+3}Q223 ${hy+33} 208 ${y-2}Q217 ${y-2} 224 ${y+4}Q240 ${hy+38} 243 ${hy+7}Z`,dark);
  art += ellipse(169,y,70,ry,c);
  if (alpaca) art += path('M105 150Q92 138 109 131Q116 115 131 127Q146 112 160 126Q177 115 191 128Q210 121 220 137Q239 137 237 154Q248 173 230 183Q225 202 207 196Q193 212 177 201Q160 212 145 198Q126 207 117 188Q98 186 105 172Q92 160 105 150Z',c,paleOutline);
  if (deer) art += ellipse(109,y+2,11,19,cream)+path('M128 169Q170 184 211 168Q185 191 141 180Z',cream);
  if (cow) art += path('M116 139Q135 119 153 134Q163 145 147 158Q119 169 113 151ZM188 139Q211 127 227 145Q235 163 216 174Q193 181 185 163Z','#7d7b69')
    + ellipse(178,191,20,10,'#cfac9b')+line('M169 198v6m12-5v6m9-8v5','#b48d7e',3);
  art += leg(120,116,c)+leg(225,228,c);
  if (kind === 'zebra') art += path('M121 128Q127 146 129 169Q118 158 115 143ZM149 120Q155 142 157 170Q144 154 143 133ZM177 120Q184 140 183 173Q171 153 171 131ZM205 129Q211 144 214 170Q201 157 199 141Z',dark);
  if (kind === 'goat') art += path('M237 76Q220 47 232 28Q231 51 246 74M260 76Q275 52 266 31Q283 49 271 83Z',dark);
  if (cow) art += path('M233 91Q213 83 219 67Q228 84 241 87M266 90Q282 80 283 67Q293 83 273 98Z','#a29170');
  if (moose) art += path('M237 72L217 53Q193 62 176 45L167 28L181 36L184 20L195 38L206 24L211 44L228 48L242 65M266 72L285 51L290 29L298 40L309 22L313 40L327 30L321 49Q307 63 287 60L272 80Z','#8d795a');
  const ear = (x, angle, length) => ellipse(x,hy-28,9,length,c,`transform="rotate(${angle} ${x} ${hy-28})"`);
  art += ear(hx-20,cow || kind === 'goat' ? -61 : -27,alpaca ? 27 : 20)+ear(hx+15,cow || kind === 'goat' ? 61 : 27,alpaca ? 27 : 20);
  if (deer) art += ellipse(hx-20,hy-29,4,14,'#dfc1a0',`transform="rotate(-27 ${hx-20} ${hy-29})"`)+ellipse(hx+15,hy-29,4,14,'#dfc1a0',`transform="rotate(27 ${hx+15} ${hy-29})"`);
  art += ellipse(hx,hy+6,young ? 26 : 29,horse || moose ? 38 : 30,c);
  if (facingUs && horse) art += path(`M229 ${hy-17}Q241 ${hy-34} 260 ${hy-23}Q273 ${hy-17} 272 ${hy-3}Q259 ${hy-14} 248 ${hy-5}L250 ${hy-17}Q239 ${hy-7} 229 ${hy-11}Z`,dark);
  else if (horse) art += path(`M234 ${hy-18}Q246 ${hy-34} 263 ${hy-21}L273 ${hy-6}Q254 ${hy-17} 241 ${hy-3}Z`,dark);
  const muzzle = cow ? '#c6a18f' : deer ? '#ddc5a5' : moose ? '#b29a7d' : cream;
  if (moose) art += path('M238 132Q253 139 268 132L260 162L253 155L246 162Z',dark);
  art += ellipse(hx+(facingUs ? 0 : 14),hy+29,moose ? 29 : horse ? 23 : 19,moose ? 20 : 15,muzzle);
  if (alpaca) art += [232,246,260,272].map((x,i)=>ellipse(x,hy-18-Math.sin(i)*5,10,10,cream,paleOutline)).join('');
  if (kind === 'zebra') art += path(`M230 ${hy-7}Q240 ${hy-3} 249 ${hy+4}L231 ${hy+2}M232 ${hy+10}Q246 ${hy+12} 253 ${hy+20}L234 ${hy+18}`,dark);
  if (kind === 'goat') art += path(`M263 ${hy+42}Q263 ${hy+61} 274 ${hy+49}L275 ${hy+39}Z`,dark);
  if (facingUs) art += eyes(hx-12,hx+12,hy+5)+ellipse(hx-9,hy+29,3,2.5,hoof)+ellipse(hx+9,hy+29,3,2.5,hoof)+smile(hx,hy+39);
  else art += eye(hx+7,hy+4)+ellipse(hx+29,hy+26,3,2.5,hoof)+line(`M${hx+16} ${hy+39}q7 4 13-1`,dark,1.8);
  return art;
}

// Distinct silhouettes for animals that do not share the existing body shapes.
const specialIllustrations = {
  sheep: c => path('M113 174L110 230H123L130 174M182 177L190 230H203L201 173','#9c917c')
    + path('M95 143Q69 144 80 167L99 163',c,paleOutline)
    + path('M101 129Q88 108 111 102Q124 80 144 96Q161 77 180 96Q204 81 218 103Q246 99 244 125Q264 143 244 163Q251 187 226 192Q214 214 192 200Q169 219 150 201Q123 215 111 191Q87 190 93 168Q74 146 101 129Z',c,paleOutline)
    + path('M132 189L130 234H144L149 187M212 184L214 234H228L227 177','#a69b84')
    + path('M129 225H145V235H129M213 225H229V235H213M109 223H124V233H109M189 223H204V233H189','#665f50')
    + ellipse(244,126,25,38,'#8f8a76','transform="rotate(-16 244 126)"')
    + ellipse(224,103,24,10,'#a49c83','transform="rotate(20 224 103)"') + ellipse(270,103,20,9,'#a49c83','transform="rotate(-15 270 103)"')
    + [228,242,256].map((x,i)=>ellipse(x,92-(i===1?4:0),12,13,c,paleOutline)).join('')
    + eye(251,122) + ellipse(257,153,7,4,'#575c4f') + line('M252 163q7 3 12-2','#575c4f',2),
  hippo: c => ellipse(165,156,82,52,c) + line('M87 153Q69 152 72 171',c,8)
    + [112,142,197,225].map(x=>path(`M${x} 175v55h21l3-55Z`,c)+line(`M${x+5} 227v5m7-5v5`,'#817c8c',2)).join('')
    + ellipse(243,132,49,46,c) + ellipse(218,92,13,15,c) + ellipse(265,92,13,15,c)
    + ellipse(259,158,50,28,'#bcb1bc') + ellipse(240,148,5,4,'#857a8b') + ellipse(280,148,5,4,'#857a8b')
    + eyes(232,263,117) + line('M239 170q22 9 37-2','#827789',2.5),
  emu: c => line('M158 174L150 231L134 235M189 176L200 231L217 235','#8c7d61',6)
    + path('M107 153L94 145L105 130L102 114L120 111Q156 81 201 113L220 142L208 164L195 183L174 178L153 185L136 173L115 173Z',c)
    + ellipse(156,145,38,30,'#8b826d')
    + path('M195 132Q223 102 225 54L242 52Q247 112 217 150Z',c)
    + ellipse(236,47,23,22,c) + path('M256 44L280 54L255 59Z','#9a8866')
    + path('M218 35L219 23L227 31L235 20L241 29','#786f5d')
    + eye(243,44),
  moth: c => path('M178 109Q130 73 99 91L77 190L152 171L185 202L217 171L293 190L271 91Q236 73 192 109Z',c,'stroke="#8e816e" stroke-width="2"')
    + path('M97 155L154 135L176 149M273 155L216 135L194 149','none','stroke="#d5c7af" stroke-width="9"')
    + ellipse(137,119,12,10,'#e5d7bd') + ellipse(233,119,12,10,'#e5d7bd')
    + ellipse(185,147,14,51,'#8e8773') + ellipse(185,104,18,18,'#a49a81')
    + line('M176 93L160 73M194 93L210 73M163 77l-9 2m14 4-9 2m48-8 9 2m-14 4 9 2','#8e8773',2) + eyes(179,191,103),
  fly: c => line('M160 149L126 133M159 171L122 179M166 193L145 218M210 149L244 133M211 171L248 179M204 193L225 218','#687566',4)
    + ellipse(185,173,24,45,c) + line('M164 175h42M166 189h38','#5d6d5c',3)
    + ellipse(151,151,25,52,'#d7e0d8','transform="rotate(32 151 151)" stroke="#8d9f94" stroke-width="2"')
    + ellipse(219,151,25,52,'#d7e0d8','transform="rotate(-32 219 151)" stroke="#8d9f94" stroke-width="2"')
    + line('M174 120L134 183M196 120L236 183','#a6b7ab',2)
    + ellipse(185,116,29,26,c) + ellipse(168,111,15,20,'#9e8274') + ellipse(202,111,15,20,'#9e8274')
    + eyes(168,202,110) + line('M176 94L167 79M194 94L203 79','#687566',3),
  crab: c => ['M136 152L105 139L89 157','M132 171L96 172L80 191','M139 190L111 210L103 231','M234 152L265 139L281 157','M238 171L274 172L290 191','M231 190L259 210L267 231','M153 199L143 222L150 238','M217 199L227 222L220 238'].map(d=>line(d,c,8)).join('')
    + line('M141 140L111 109M229 140L259 109',c,12)
    + path('M111 116Q72 105 83 65L102 86L120 62Q145 100 111 116M259 116Q298 105 287 65L268 86L250 62Q225 100 259 116',c)
    + ellipse(185,166,65,42,c) + line('M164 134L159 115M206 134L211 115',c,9)
    + ellipse(159,113,10,12,cream) + ellipse(211,113,10,12,cream) + eyes(159,211,113) + smile(185,166),
  dolphin: c => path('M92 156Q115 112 173 119L197 81L203 126Q243 138 267 177L295 156L312 166L289 190L306 209L288 219L263 193Q180 224 125 184L78 179Q65 164 92 156Z',c)
    + path('M91 174Q170 195 257 185Q199 216 140 197L119 184Z','#cbd8cd')
    + path('M170 165Q165 205 209 215L199 184Z',c)
    + eye(122,151) + line('M82 174Q107 180 127 170','#56767a',2.5),
  shark: c => path('M86 151Q134 105 190 121L212 68L220 134L266 160L306 111L299 163L318 195L273 184Q206 216 131 195L87 175L72 163Z',c)
    + path('M88 174Q161 188 267 177Q200 213 134 195Z','#cad7ce')
    + path('M176 168L185 219L215 190Z','#7a999d')
    + eye(117,151)
    + line('M92 174Q107 179 121 172M140 146q-8 17-1 28M152 146q-7 17-1 28M164 147q-6 16-1 26','#58767b',2.5),
  orca: c => path('M77 155Q83 105 149 107L186 114L199 54L219 128Q247 147 267 179L298 159L315 168L288 192L305 210L289 219L262 198Q204 231 130 210Q77 198 77 155Z',c)
    + path('M79 172Q129 178 153 164Q164 148 178 164Q198 187 256 191Q199 222 135 208Q94 201 79 172Z','#e5e7db')
    + ellipse(139,141,19,10,'#e5e7db','transform="rotate(-14 139 141)"')
    + path('M171 174Q167 209 211 218L203 185Z',c)
    + eye(106,151) + line('M82 173Q101 180 116 172','#364f53',2.5),

  flamingo: c => line('M171 174V232H153M195 174L218 202L192 219', '#a67b6c', 5)
    + ellipse(165,155,56,34,c) + path('M119 150L97 125L143 137',c)
    + path('M200 158C262 138 202 110 223 78C237 58 252 77 249 92', 'none', `stroke="${c}" stroke-width="17" stroke-linecap="round"`)
    + ellipse(244,78,24,23,c) + path('M261 80Q286 90 270 111L254 99Z','#d7c2a9') + path('M267 95L279 99L270 111L259 102Z','#605f55')
    + ellipse(158,155,34,21,'#b78179') + eye(250,75),
  octopus: c => ['M144 171Q101 224 84 198Q74 183 89 180','M160 186Q133 247 111 222','M177 193Q164 253 145 233','M192 193Q204 253 221 233','M209 186Q237 247 258 222','M225 171Q269 224 286 198Q296 183 281 180','M155 175Q117 203 111 178','M215 175Q253 203 259 178'].map(d=>path(d,'none',`stroke="${c}" stroke-width="16" stroke-linecap="round"`)).join('')
    + ellipse(185,130,58,67,c) + ellipse(185,161,36,26,'#c8bfd0') + eyes(166,204,139) + smile(185,161),
  turtle: c => ellipse(131,219,23,12,c) + ellipse(218,219,23,12,c) + path('M115 200L91 213L126 212',c)
    + path('M119 204Q112 123 183 121Q251 122 246 204Z','#788b65','stroke="#5f7352" stroke-width="3"')
    + path('M133 186L151 146L190 135L223 157L234 187L201 207L158 207Z','#a0af85')
    + line('M151 146L166 175L158 207M166 175H204L223 157M204 175L201 207','#6c805a',3)
    + path('M228 201Q255 202 254 173L278 168Q295 211 250 219',c) + ellipse(269,166,28,26,c)
    + eye(278,160) + line('M281 180q-8 6-15 0','#5f7352',2),
  snail: c => path('M95 208Q141 220 223 205L235 145L259 146L256 214Q276 213 285 225H98Q79 223 95 208', '#9ba887')
    + line('M237 149L229 119M254 149L267 120','#83946f',5) + ellipse(229,117,9,9,'#9ba887') + ellipse(267,118,9,9,'#9ba887')
    + eyes(229,267,117) + ellipse(170,167,53,51,c)
    + line('M191 195C141 222 115 158 151 137C184 117 213 159 190 178C169 196 145 165 168 154Q180 150 180 163','#7f6b51',5)
    + smile(246,169),
  ladybug: c => line('M144 127L121 115M141 158H112M147 188L124 206M226 127L249 115M229 158H258M223 188L246 206','#616455',5)
    + ellipse(185,151,54,67,c,'stroke="#865f50" stroke-width="2"') + line('M185 96V217','#685e50',3)
    + [[159,122],[211,122],[151,157],[219,157],[163,190],[207,190]].map(([x,y])=>ellipse(x,y,9,10,'#625f51')).join('')
    + line('M173 85L161 66M197 85L209 66','#616455',3) + ellipse(185,94,28,24,'#717461') + eyes(174,196,94),
  bee: c => ellipse(154,112,30,48,'#d3ded7','transform="rotate(-32 154 112)" stroke="#8faaa0" stroke-width="2"')
    + ellipse(216,112,30,48,'#d3ded7','transform="rotate(32 216 112)" stroke="#8faaa0" stroke-width="2"')
    + ellipse(185,165,43,57,c) + path('M146 144Q185 156 224 144L228 160Q185 173 142 160ZM144 179Q185 191 226 179L220 195Q185 207 150 195Z','#77705a')
    + line('M172 101L161 81M198 101L209 81','#77705a',3) + ellipse(185,119,29,26,c) + eyes(174,196,117) + smile(185,130)
    + line('M158 206L149 221M212 206L221 221','#77705a',4),
  crayfish: c => line('M158 158L129 144M155 181L121 182M162 203L137 219M212 158L241 144M215 181L249 182M208 203L233 219',c,6)
    + line('M157 140L123 116M213 140L247 116',c,10)
    + path('M124 126Q83 120 91 75L109 98L124 73Q147 105 124 126M246 126Q287 120 279 75L261 98L246 73Q223 105 246 126',c)
    + path('M169 209L151 235L185 228L219 235L201 209',c) + ellipse(185,170,34,56,c)
    + line('M161 173H209M160 187H210M165 201H205','#8d624f',2)
    + line('M174 129L152 86M196 129L218 86','#96745a',3) + ellipse(185,135,31,26,c) + eyes(174,196,130) + smile(185,147),
};

export function illustration(animal, { scenery = true } = {}) {
  const { kind, color } = animal;
  let art;
  if (Object.hasOwn(moreIllustrations, kind)) art = moreIllustrations[kind](color);
  else if (Object.hasOwn(extendedIllustrations, kind)) art = extendedIllustrations[kind](color);
  else if (Object.hasOwn(specialIllustrations, kind)) art = specialIllustrations[kind](color);
  else if (['alpaca','deer','goat','horse','foal','zebra','moose','cow'].includes(kind)) art = hoofed(kind,color);
  else if (['stork','goose','emu','owl','turkey','duck','parrot','penguin'].includes(kind)) art = bird(kind,color);
  else if (['frog','seal','seaLion','fish','dolphin','whale'].includes(kind)) art = water(kind,color);
  else if (['cicada','moth','butterfly'].includes(kind)) art = insect(kind,color);
  else if (kind === 'hedgehog') art = path('M105 209L93 188L105 176L100 153L116 145L119 121L141 120L153 99L173 110L193 96L208 113L231 108L239 133L256 141L254 164L275 186L247 219Z',color)+ellipse(188,204,73,27,'#b59879')+path('M220 147Q247 146 275 182L298 189Q295 220 251 221Q213 217 210 190Z','#e3ceb0')+ellipse(295,190,7,6,'#655e4c')+eye(256,180)+ellipse(154,229,16,7,color)+ellipse(231,229,16,7,color)+[130,157,184,211].map((x,i)=>line(`M${x} ${150-i%2*15}l6 12`,'#c9b090',3)).join('');
  else if (['alpaca','hippo','cat','cow','rabbit','fox','moose','bear','sheep','dog','panda','elephant','deer','tiger','zebra','foal','beaver','hamster','goat','horse','lion','mouse','monkey','squirrel'].includes(kind)) art = mammal(kind,color);
  else throw new Error(`Brak ilustracji zwierzątka: ${kind}`);
  const background = scenery ? habitatArt(animal) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 270" aria-hidden="true">${background}<ellipse cx="187" cy="241" rx="100" ry="9" fill="#63765b" opacity=".16"/><g class="animal-body" stroke="#6c6452" stroke-width="1.35" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>`;
}
