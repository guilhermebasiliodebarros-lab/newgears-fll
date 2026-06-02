import assert from 'node:assert/strict';
import {
  buildPublicAchievements,
  buildTrainingGallery,
  getTournamentCountdown,
  resolvePublicShowcaseSettings,
} from '../src/utils/publicShowcase.js';

export async function runPublicShowcaseTests() {
  const gallery = buildTrainingGallery({
    robotVersions: [{ id: 'v1', name: 'Base compacta', version: 'V1', date: '2026-06-01', image: 'robot.jpg' }],
    attachments: [{ id: 'a1', name: 'Garra frontal', date: '2026-06-02', image: 'claw.jpg' }],
  });

  assert.equal(gallery.length, 2);
  assert.equal(gallery[0].id, 'attachment-a1');
  assert.equal(gallery[1].type, 'Versao do robo');

  const curatedGallery = buildTrainingGallery({
    galleryPhotos: [
      { id: 'g1', title: 'Treino aberto', date: '2026-06-03', image: 'training.jpg' },
      { id: 'g2', title: 'Treino oculto', date: '2026-06-04', image: 'hidden.jpg', showInPublicGallery: false },
    ],
    robotVersions: [{ id: 'v2', name: 'Base oculta', image: 'hidden-robot.jpg', showInPublicGallery: false }],
  });

  assert.equal(curatedGallery.length, 1);
  assert.equal(curatedGallery[0].id, 'gallery-g1');
  assert.equal(buildTrainingGallery({
    galleryPhotos: [{ id: 'g2', image: 'hidden.jpg', showInPublicGallery: false }],
    includeHidden: true,
  })[0].isPublic, false);

  const orderedGallery = buildTrainingGallery({
    galleryPhotos: [
      { id: 'g1', date: '2026-06-03', image: 'first.jpg', displayOrder: 0 },
      { id: 'g2', date: '2026-06-04', image: 'second.jpg', displayOrder: 1 },
      { id: 'g3', date: '2026-06-02', image: 'featured.jpg', displayOrder: 2, isFeatured: true },
    ],
  });

  assert.deepEqual(orderedGallery.map((photo) => photo.id), ['gallery-g3', 'gallery-g1', 'gallery-g2']);
  assert.deepEqual(
    buildTrainingGallery({
      galleryPhotos: [
        { id: 'g1', image: 'first.jpg', displayOrder: 0 },
        { id: 'g2', image: 'second.jpg', displayOrder: 1, isFeatured: true },
      ],
      prioritizeFeatured: false,
    }).map((photo) => photo.id),
    ['gallery-g1', 'gallery-g2'],
  );

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

  assert.deepEqual(
    resolvePublicShowcaseSettings({
      tournamentName: 'Regional',
      tournamentTarget: '2026-11-12T09:30',
      innovationUrl: 'newgears.example/projeto',
      socialUrl: 'https://instagram.com/newgears',
      socialLabel: 'Instagram',
    }),
    {
      tournamentName: 'Regional',
      tournamentTarget: '2026-11-12T09:30',
      innovationUrl: 'https://newgears.example/projeto',
      socialUrl: 'https://instagram.com/newgears',
      socialLabel: 'Instagram',
    },
  );
}
