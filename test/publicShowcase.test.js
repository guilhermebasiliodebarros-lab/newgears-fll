import assert from 'node:assert/strict';
import {
  buildPublicAchievements,
  buildTrainingGallery,
  getTournamentCountdown,
} from '../src/utils/publicShowcase.js';

export async function runPublicShowcaseTests() {
  const gallery = buildTrainingGallery({
    robotVersions: [{ id: 'v1', name: 'Base compacta', version: 'V1', date: '2026-06-01', image: 'robot.jpg' }],
    attachments: [{ id: 'a1', name: 'Garra frontal', date: '2026-06-02', image: 'claw.jpg' }],
  });

  assert.equal(gallery.length, 2);
  assert.equal(gallery[0].id, 'attachment-a1');
  assert.equal(gallery[1].type, 'Versao do robo');

  const achievements = buildPublicAchievements({
    students: [{
      id: 'student-1',
      name: 'Ana',
      badges: ['robot_driver'],
      badgeAchievements: [{ badgeId: 'robot_driver', awardedAt: '2026-06-02T12:00:00.000Z' }],
    }],
    teamSeasonStats: { successfulWeeks: 2 },
    trainingPhotos: gallery,
    totalImpactPeople: 80,
  });

  assert.equal(achievements[0].title, 'Piloto do Robo');
  assert.ok(achievements.some((item) => item.id === 'successful-weeks'));
  assert.ok(achievements.some((item) => item.id === 'community-impact'));

  assert.deepEqual(
    getTournamentCountdown('2026-06-03T12:00:00', new Date('2026-06-02T10:30:20')),
    { days: 1, hours: 1, minutes: 29, seconds: 40, arrived: false },
  );
  assert.equal(getTournamentCountdown('2026-06-01', new Date('2026-06-02')).arrived, true);
}
