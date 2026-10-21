// Feeding and interaction system for animals
// Pure SVG vectors, CC0 procedural assets, no external files

const FOOD_SVGS = {
  marchewka: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M22 6c-2 2-3 5-2 7l-9 19c-1 2 1 4 3 3l19-9c2 1 5 0 7-2 1-3-1-6-4-6l-8-8c-2-3-5-5-6-4Z" fill="#ff7a18"/><path d="M25 5c-3-3-9-4-11-2 2 3 5 4 8 3m-2-4c-2 0-4 2-5 5 2 1 5 1 6-2m-3-4c-3-1-5 1-6 3 2 1 4 1 5-1" stroke="#3d8234" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  ryba: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 20q10-10 22-5l6-7v24l-6-7Q16 30 6 20Z" fill="#4fa3d1"/><circle cx="12" cy="18" r="2" fill="#fff"/><circle cx="11.5" cy="18" r="1" fill="#1b4965"/><path d="M19 15q4 5 0 10" stroke="#2a6f97" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  kostka: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 13a4 4 0 0 0-4 4 4 4 0 0 0 4 4l22 0a4 4 0 0 0 4-4 4 4 0 0 0-4-4l-22 0Z" fill="#f4ebd9" stroke="#d5c8b2" stroke-width="1.5"/><circle cx="9" cy="14" r="3.5" fill="#f4ebd9"/><circle cx="9" cy="22" r="3.5" fill="#f4ebd9"/><circle cx="31" cy="14" r="3.5" fill="#f4ebd9"/><circle cx="31" cy="22" r="3.5" fill="#f4ebd9"/></svg>`,
  banan: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M10 8c12 0 22 10 22 24 0 2-2 3-3 1-5-10-11-16-20-19-2-1-1-5 1-6Z" fill="#ffd13b" stroke="#e0a912" stroke-width="1.2"/><path d="M9 7l2 3" stroke="#684f12" stroke-width="2" stroke-linecap="round"/></svg>`,
  orzech: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M13 18c0 9 7 16 7 16s7-7 7-16a7 7 0 0 0-14 0Z" fill="#b06c3b"/><path d="M11 16q9-6 18 0c1-3-1-6-4-7h-10c-3 1-5 4-4 7Z" fill="#6d3d1a"/><path d="M20 7v-3" stroke="#6d3d1a" stroke-width="2" stroke-linecap="round"/></svg>`,
  koniczyna: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="16" cy="16" r="6" fill="#4ea843"/><circle cx="24" cy="16" r="6" fill="#4ea843"/><circle cx="20" cy="23" r="6" fill="#4ea843"/><path d="M20 23c0 8-3 11-6 13" stroke="#337a2a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  kwiat: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="12" r="5" fill="#ff70a6"/><circle cx="28" cy="20" r="5" fill="#ff70a6"/><circle cx="20" cy="28" r="5" fill="#ff70a6"/><circle cx="12" cy="20" r="5" fill="#ff70a6"/><circle cx="20" cy="20" r="5.5" fill="#ffd13b"/></svg>`,
  mucha: `<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="20" rx="5" ry="7" fill="#222"/><ellipse cx="14" cy="16" rx="6" ry="3" fill="#a4d4e6" opacity=".8" transform="rotate(-25 14 16)"/><ellipse cx="26" cy="16" rx="6" ry="3" fill="#a4d4e6" opacity=".8" transform="rotate(25 26 16)"/><circle cx="18" cy="15" r="1.5" fill="#ff3333"/><circle cx="22" cy="15" r="1.5" fill="#ff3333"/></svg>`,
  ziarno: `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34V10" stroke="#bfa035" stroke-width="2"/><ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#e8c75a" transform="rotate(-30 16 16)"/><ellipse cx="24" cy="16" rx="5" ry="2.5" fill="#e8c75a" transform="rotate(30 24 16)"/><ellipse cx="16" cy="22" rx="5" ry="2.5" fill="#e8c75a" transform="rotate(-30 16 22)"/><ellipse cx="24" cy="22" rx="5" ry="2.5" fill="#e8c75a" transform="rotate(30 24 22)"/></svg>`,
  jablko: `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="16" cy="22" r="11" fill="#e63946"/><circle cx="24" cy="22" r="11" fill="#e63946"/><path d="M20 14c1-4 3-7 6-8" stroke="#5a3d1c" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 10c4-1 6 1 7 4-3 1-6-1-7-4Z" fill="#52b788"/></svg>`
};

const ANIMAL_FOOD_MAP = {
  // Rybka
  kot: { food: 'ryba', label: 'chrupiącą rybkę', speech: 'Mniam! Pyszna rybka!' },
  foka: { food: 'ryba', label: 'świeżą rybkę', speech: 'Mniam mniam! Świeża rybka!' },
  delfin: { food: 'ryba', label: 'małą rybkę', speech: 'Pyszna rybka dla delfina!' },
  orka: { food: 'ryba', label: 'wielką rybę', speech: 'Wielka ryba, pycha!' },
  pingwin: { food: 'ryba', label: 'rybkę z oceanu', speech: 'Mniam! Rybka dla pingwina!' },
  mewa: { food: 'ryba', label: 'rybkę', speech: 'Kra, kra! Pyszna rybka!' },
  niedźwiedź: { food: 'ryba', label: 'łososia', speech: 'Mniam! Niedźwiedź uwielbia ryby!' },

  // Kostka
  pies: { food: 'kostka', label: 'chrupiącą kostkę', speech: 'Hau! Dziękuję za kostkę!' },
  wilk: { food: 'kostka', label: 'kostkę', speech: 'Auuu! Pyszna kostka!' },
  lis: { food: 'kostka', label: 'smakołyk', speech: 'Chrup, chrup! Pyszny przysmak!' },
  szop: { food: 'kostka', label: 'smakołyk', speech: 'Mniam mniam!' },

  // Marchewka
  królik: { food: 'marchewka', label: 'słodką marchewkę', speech: 'Chrup, chrup! Pyszna marchewka!' },
  zając: { food: 'marchewka', label: 'chrupiącą marchewkę', speech: 'Chrup! Dziękuję za marchewkę!' },
  chomik: { food: 'marchewka', label: 'kawałek marchewki', speech: 'Mniam! Chomik schowa do policzka!' },

  // Banan
  małpa: { food: 'banan', label: 'słodkiego banana', speech: 'Uuu-aaa! Pyszny banan!' },

  // Orzech
  wiewiórka: { food: 'orzech', label: 'chrupiący orzeszek', speech: 'Chrup, chrup! Pyszny orzeszek!' },
  mysz: { food: 'orzech', label: 'orzeszek', speech: 'Pi, pi! Dziękuję za orzeszek!' },
  kret: { food: 'orzech', label: 'smakołyk', speech: 'Mniam mniam!' },

  // Koniczynka / sianko
  krowa: { food: 'koniczyna', label: 'świeżą koniczynkę', speech: 'Muuu! Pyszna soczysta trawa!' },
  koń: { food: 'koniczyna', label: 'soczystą koniczynę', speech: 'I-ha-ha! Pyszna koniczynka!' },
  koza: { food: 'koniczyna', label: 'koniczynkę', speech: 'Meee! Bardzo smaczne!' },
  owca: { food: 'koniczyna', label: 'słodką trawkę', speech: 'Beee! Dziękuję za trawkę!' },
  sarna: { food: 'koniczyna', label: 'zieloną koniczynkę', speech: 'Chrup, chrup! Bardzo dziękuję!' },
  jeleń: { food: 'koniczyna', label: 'świeże listki', speech: 'Pyszne leśne przysmaki!' },
  żubr: { food: 'koniczyna', label: 'pęczek trawy', speech: 'Mniam! Pyszna trawa z puszczy!' },
  bizon: { food: 'koniczyna', label: 'trawę z prerii', speech: 'Mniam mniam!' },
  lama: { food: 'koniczyna', label: 'koniczynkę', speech: 'Pyszny poczęstunek!' },
  zebra: { food: 'koniczyna', label: 'słodkie sianko', speech: 'Mniam! Dziękuję!' },
  żyrafa: { food: 'koniczyna', label: 'zielone gałązki', speech: 'Mniam! Sięgam wysoko po listki!' },

  // Kwiat / Nektar
  pszczoła: { food: 'kwiat', label: 'słodki kwiatek', speech: 'Bzzzz! Pyszny słodki nektar!' },
  osa: { food: 'kwiat', label: 'kwiatuszek', speech: 'Bzzz! Słodki poczęstunek!' },
  motyl: { food: 'kwiat', label: 'nektar z kwiatka', speech: 'Pyszny kwiatowy nektar!' },

  // Mucha / owad
  żaba: { food: 'mucha', label: 'muszkę', speech: 'Kum-kum! Mniam, mucha złapana!' },
  kameleon: { food: 'mucha', label: 'owada', speech: 'Hap! Złapane długim językiem!' },
  jaszczurka: { food: 'mucha', label: 'muszkę', speech: 'Mniam mniam!' },

  // Ziarno
  kura: { food: 'ziarno', label: 'złociste ziarno', speech: 'Ko-ko-ko! Pyszne ziarenka!' },
  kaczka: { food: 'ziarno', label: 'ziarenka', speech: 'Kwa, kwa! Dziękuję za ziarno!' },
  gęś: { food: 'ziarno', label: 'ziarno zbóż', speech: 'Gę, gę! Pyszny poczęstunek!' },
  indyk: { food: 'ziarno', label: 'garść ziaren', speech: 'Gul, gul! Dobre ziarenka!' },
  papuga: { food: 'ziarno', label: 'ziarenka', speech: 'Dobre! Dobre ziarno!' },
  paw: { food: 'ziarno', label: 'smaczne ziarna', speech: 'Dziękuję za ziarenka!' }
};

export function getFoodForAnimal(animal) {
  const key = (animal?.name || animal?.key || animal || '').toLocaleLowerCase('pl');
  const matched = ANIMAL_FOOD_MAP[key] || {
    food: 'jablko',
    label: 'soczyste jabłuszko',
    speech: 'Chrup, chrup! Pyszne soczyste jabłuszko!'
  };

  return {
    foodKey: matched.food,
    label: matched.label,
    speech: matched.speech,
    svg: FOOD_SVGS[matched.food] || FOOD_SVGS.jablko
  };
}
