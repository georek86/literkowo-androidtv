import { test } from 'node:test';
import assert from 'node:assert/strict';
import { animals, illustration } from '../animals.js';
import { habitatFor } from '../habitats.js';

test('every animal has a habitat and scenery can be removed without changing the animal', () => {
  for (const animal of animals) {
    const habitat = habitatFor(animal);
    assert.ok(habitat.id && habitat.label);
    const scene = illustration(animal);
    const plain = illustration(animal, { scenery: false });
    assert.ok(scene.includes(`data-habitat="${habitat.id}"`), animal.name);
    assert.ok(!plain.includes('class="habitat"'), animal.name);
    const body = svg => svg.slice(svg.indexOf('<g class="animal-body"'));
    assert.equal(body(scene), body(plain), `scenery must not change ${animal.name}`);
    assert.ok(!/undefined|NaN/.test(scene), animal.name);
  }
});

test('representative animals appear in their matching environment', () => {
  for (const [name, expected] of Object.entries({ tygrys:'jungle', wielbłąd:'desert', surykatka:'savanna', kura:'farm', kogut:'farm', sarna:'forest', lew:'savanna', delfin:'ocean', koala:'outback', panda:'bamboo', kot:'home', 'niedźwiedź polarny':'polar', 'konik morski':'ocean' })) {
    assert.equal(habitatFor(animals.find(a => a.name === name)).id, expected);
  }
});
