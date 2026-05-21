import assert from 'node:assert/strict';

import { calculateSchoolReportXp } from '../src/utils/schoolReport.js';

export function runSchoolReportTests() {
  assert.equal(
    calculateSchoolReportXp({
      nota10: 10,
      nota99: 9.9,
      nota90: 9,
      nota89: 8.9,
      nota80: 8,
      nota79: 7.9,
      nota78: 7.8,
      vazia: ''
    }),
    30
  );

  assert.equal(
    calculateSchoolReportXp({
      Matematica: 10,
      Portugues: 10,
      Ciencias: 9.8,
      Historia: 9.5,
      Geografia: 9.2,
      Ingles: 9,
      Artes: 8.7,
      'Ed. Fisica': 8,
      Robotica: 7.9,
      STEAM: 7
    }),
    54
  );
}
