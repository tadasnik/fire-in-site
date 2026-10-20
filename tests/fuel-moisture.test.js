import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from 'svelte/compiler';

// Execute the real moisture pipeline, replacing inference and the Nelson
// response with controlled values so timing is independent of model weights.
function calculateWith(onnxValue = 10) {
  const source = `<script>${readFileSync(new URL('../src/lib/model/fuelMoisture.js', import.meta.url), 'utf8')}</script>`;
  const statements = parse(source).instance.content.body;
  const body = statements.filter(node => node.type !== 'ImportDeclaration').map(node => {
    const declaration = node.declaration ?? node;
    return source.slice(declaration.start, declaration.end);
  }).join('\n');
  return new Function('simpleNelsonFuelMoisture', 'deadFFMC', 'daylightSeconds', `${body}; return fuelMoistureCalcs;`)(
    (_previous, _temperature, _solar, _humidity, rain) => rain,
    async inputs => Float32Array.from({ length: inputs.length / 17 }, (_, i) => typeof onnxValue === 'function' ? onnxValue(i) : onnxValue),
    () => 40000,
  );
}

function weather(nelson) {
  return {
    time: nelson.map((_, i) => Date.UTC(2026, 9, 18, i)),
    precipitation: nelson,
    temperature_2m: nelson.map(() => 15),
    relative_humidity_2m: nelson.map(() => 70),
    vapour_pressure_deficit: nelson.map(() => 0.5),
    global_tilted_irradiance: nelson.map(() => 100),
  };
}

test('wetting correction uses the same hour for every fuel, including the final sample', async () => {
  const result = await calculateWith(i => 10 + i % 5)(weather([0, 40, 50]), 5, 45);
  for (const [i, fuel] of ['bracken', 'gorse', 'heather', 'grass', 'litter'].entries()) {
    assert.deepEqual(result[`ffmc_${fuel}`], [10 + i, 40, 50]);
  }
  assert.deepEqual(result.ffmc_nelson, [0, 40, 50]);
});

test('future drying cannot remove the current wetting correction', async () => {
  const result = await calculateWith()(weather([50, 40, 0]), 5, 45);
  assert.deepEqual(result.ffmc_grass, [50, 40, 10]);
});

test('wetting threshold, wetter ONNX estimates and the 1% floor are unchanged', async () => {
  assert.deepEqual((await calculateWith()(weather([30, 31, 0]), 5, 45)).ffmc_grass, [10, 31, 10]);
  assert.deepEqual((await calculateWith(55)(weather([40, 50]), 5, 45)).ffmc_grass, [55, 55]);
  assert.deepEqual((await calculateWith(0)(weather([0]), 5, 45)).ffmc_grass, [1]);
});
