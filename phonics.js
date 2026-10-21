// Polish phonetics and alphabet pronunciation helper
// Supports two modes:
// 1. 'alphabet' - traditional letter names (A, Be, Ce, Cie, De...)
// 2. 'phonics' - pure phonetic sound (a, b, c, ć, d...) - ideal for early reading

export const POLISH_ALPHABET_NAMES = {
  'a': 'A',
  'ą': 'Ą',
  'b': 'Be',
  'c': 'Ce',
  'ć': 'Cie',
  'd': 'De',
  'e': 'E',
  'ę': 'Ę',
  'f': 'Ef',
  'g': 'Gie',
  'h': 'Ha',
  'i': 'I',
  'j': 'Jot',
  'k': 'Ka',
  'l': 'El',
  'ł': 'Eł',
  'm': 'Em',
  'n': 'En',
  'ń': 'Eń',
  'o': 'O',
  'ó': 'U zamknięte',
  'p': 'Pe',
  'r': 'Er',
  's': 'Es',
  'ś': 'Eś',
  't': 'Te',
  'u': 'U',
  'w': 'Wu',
  'y': 'Igrek',
  'z': 'Zet',
  'ź': 'Ziet',
  'ż': 'Żet'
};

export const POLISH_PHONIC_SOUNDS = {
  'a': 'a',
  'ą': 'ą',
  'b': 'b',
  'c': 'c',
  'ć': 'ć',
  'd': 'd',
  'e': 'e',
  'ę': 'ę',
  'f': 'f',
  'g': 'g',
  'h': 'h',
  'i': 'i',
  'j': 'j',
  'k': 'k',
  'l': 'l',
  'ł': 'ł',
  'm': 'm',
  'n': 'n',
  'ń': 'ń',
  'o': 'o',
  'ó': 'u',
  'p': 'p',
  'r': 'r',
  's': 's',
  'ś': 'ś',
  't': 't',
  'u': 'u',
  'w': 'w',
  'y': 'y',
  'z': 'z',
  'ź': 'ź',
  'ż': 'ż'
};

export function getLetterPronunciation(char, mode = 'alphabet') {
  if (!char) return '';
  const key = char.toLocaleLowerCase('pl');
  if (mode === 'phonics') {
    return POLISH_PHONIC_SOUNDS[key] || char;
  }
  return POLISH_ALPHABET_NAMES[key] || char.toUpperCase();
}
