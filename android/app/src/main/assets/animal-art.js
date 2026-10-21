// Shared shapes keep the whole album in one rounded picture-book style.
export const ellipse = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const line = (d, color = '#71614f', width = 3) => path(d, 'none', `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`);
export const cream = '#fff1d8';
export const paleOutline = 'stroke="#83775f" stroke-width="2.5" stroke-linejoin="round"';
// The white stays fixed. Only iris, pupil and highlight follow the pointer.
// Every eye uses the same local coordinates so small eyes move proportionally.
export function eye(x, y, { rx = 9, ry = 11, iris = '#7c8766' } = {}) {
  return `<g class="eye" transform="translate(${x} ${y})"><svg x="${-rx}" y="${-ry}" width="${rx*2}" height="${ry*2}" viewBox="-10 -12 20 24" overflow="visible"><ellipse class="eye-white" cx="0" cy="0" rx="9" ry="11" fill="#fffbee" stroke="#665e4c" stroke-width="1.2"/><g class="pupil" stroke="none">${ellipse(0,0,4.7,6.2,iris)}${ellipse(0,0,3.2,4.8,'#273b35','class="eye-pupil"')}${ellipse(-1.1,-1.8,1.15,1.5,'#ffffff')}</g></svg></g>`;
}
export const eyes = (x1 = 163, x2 = 207, y = 109) => {
  const rx = Math.min(9, Math.abs(x2-x1)*.37);
  return eye(x1,y,{rx,ry:rx*1.22}) + eye(x2,y,{rx,ry:rx*1.22});
};

export const smile = (x = 185, y = 130) => line(`M${x-8} ${y}q8 7 16 0`, '#75654f', 2.3);
