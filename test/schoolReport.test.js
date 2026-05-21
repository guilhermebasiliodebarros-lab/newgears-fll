import assert from 'node:assert/strict';

import {
  calculateSchoolReportXp,
  getSchoolGradeXp,
  parseSchoolGrade
} from '../src/utils/schoolReport.js';

export function runSchoolReportTests() {
  assert.equal(parseSchoolGrade('8,5'), 8.5);
  assert.equal(parseSchoolGrade('10,0'), 10);
  assert.equal(parseSchoolGrade('10,1'), null);
  assert.equal(parseSchoolGrade('8e0'), null);
  assert.equal(parseSchoolGrade('texto'), null);

  assert.equal(getSchoolGradeXp('10'), 10);
  assert.equal(getSchoolGradeXp('9,8'), 7);
  assert.equal(getSchoolGradeXp('8,5'), 5);
  assert.equal(getSchoolGradeXp('7,9'), -2);

  assert.equal(
    calculateSchoolReportXp({
      nota10: 10,
      nota99: 9.9,
      nota90: 9,
      nota89: 8.9,
      nota80: 8,
      nota79: '7,9',
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
