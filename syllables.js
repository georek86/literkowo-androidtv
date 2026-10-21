// Syllables system for early Polish reading education (Metoda sylabowa / symultaniczno-sekwencyjna)
// Supports open and closed Polish syllables

export const ANIMAL_SYLLABLES = Object.freeze({
  // 1-syllable words
  'kot': ['KOT'],
  'pies': ['PIES'],
  'lis': ['LIS'],
  'lew': ['LEW'],
  'koń': ['KOŃ'],
  'wilk': ['WILK'],
  'szop': ['SZOP'],
  'wąż': ['WĄŻ'],
  'rak': ['RAK'],
  'gęś': ['GĘŚ'],
  'paw': ['PAW'],
  'ćma': ['ĆMA'],
  'słoń': ['SŁOŃ'],
  'kret': ['KRET'],
  'dzik': ['DZIK'],
  'bóbr': ['BÓBR'],
  'żubr': ['ŻUBR'],
  'łoś': ['ŁOŚ'],
  'mysz': ['MYSZ'],
  'tur': ['TUR'],

  // 2-syllable words
  'żaba': ['ŻA', 'BA'],
  'krowa': ['KRO', 'WA'],
  'sowa': ['SO', 'WA'],
  'ryba': ['RY', 'BA'],
  'koza': ['KO', 'ZA'],
  'foka': ['FO', 'KA'],
  'owca': ['OW', 'CA'],
  'kura': ['KU', 'RA'],
  'kaczka': ['KACZ', 'KA'],
  'zając': ['ZA', 'JĄC'],
  'indyk': ['IN', 'DYK'],
  'lama': ['LA', 'MA'],
  'zebra': ['ZE', 'BRA'],
  'małpa': ['MAŁ', 'PA'],
  'mewa': ['ME', 'WA'],
  'osa': ['O', 'SA'],
  'chomik': ['CHO', 'MIK'],
  'delfin': ['DEL', 'FIN'],
  'ślimak': ['ŚLI', 'MAK'],
  'borsuk': ['BOR', 'SUK'],
  'bizon': ['BI', 'ZON'],
  'kangur': ['KAN', 'GUR'],
  'jaguar': ['JA', 'GUAR'],
  'pingwin': ['PIN', 'GWIN'],
  'bocian': ['BO', 'CIAN'],
  'motyl': ['MO', 'TYL'],
  'królik': ['KRÓ', 'LIK'],
  'świnka': ['ŚWIN', 'KA'],
  'panda': ['PAN', 'DA'],
  'czapla': ['CZAP', 'LA'],
  'orzeł': ['O', 'RZEŁ'],
  'drop': ['DROP'],
  'jeleń': ['JE', 'LEŃ'],
  'sarna': ['SAR', 'NA'],
  'suseł': ['SU', 'SEŁ'],
  'jeż': ['JE', 'ŻYK'],

  // 3-syllable words
  'papuga': ['PA', 'PU', 'GA'],
  'koala': ['KO', 'A', 'LA'],
  'żyrafa': ['ŻY', 'RA', 'FA'],
  'wielbłąd': ['WIEL', 'BŁĄD'],
  'nosorożec': ['NO', 'SO', 'RO', 'ŻEC'],
  'kameleon': ['KA', 'ME', 'LE', 'ON'],
  'jaszczurka': ['JASZ', 'CZUR', 'KA'],
  'aligator': ['A', 'LI', 'GA', 'TOR'],
  'pelikan': ['PE', 'LI', 'KAN'],
  'flaming': ['FLA', 'MING']
});

const POLISH_VOWELS = new Set(['a', 'ą', 'e', 'ę', 'i', 'o', 'ó', 'u', 'y']);

/**
 * Fallback algorithmic syllabification for Polish words
 */
export function splitIntoSyllables(word) {
  if (!word) return [];
  const clean = word.trim().toLocaleLowerCase('pl');
  if (ANIMAL_SYLLABLES[clean]) {
    return [...ANIMAL_SYLLABLES[clean]];
  }

  // If very short or no vowels
  const vowelIndices = [];
  for (let i = 0; i < clean.length; i++) {
    if (POLISH_VOWELS.has(clean[i])) vowelIndices.push(i);
  }

  if (vowelIndices.length <= 1) {
    return [clean.toLocaleUpperCase('pl')];
  }

  const result = [];
  let start = 0;
  for (let v = 0; v < vowelIndices.length - 1; v++) {
    const currV = vowelIndices[v];
    const nextV = vowelIndices[v + 1];
    const consonantCount = nextV - currV - 1;

    let splitAt;
    if (consonantCount <= 1) {
      splitAt = currV + 1;
    } else {
      splitAt = currV + Math.floor(consonantCount / 2) + 1;
    }

    result.push(clean.slice(start, splitAt).toLocaleUpperCase('pl'));
    start = splitAt;
  }
  result.push(clean.slice(start).toLocaleUpperCase('pl'));
  return result;
}

export function getSyllablesForAnimal(animal) {
  if (!animal) return [];
  const name = (animal.name || animal.key || animal).toLocaleLowerCase('pl');
  return splitIntoSyllables(name);
}
