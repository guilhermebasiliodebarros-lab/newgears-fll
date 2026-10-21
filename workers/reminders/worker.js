import { runReminderCycle } from '../../server/reports/reminders.js';

export default {
  async scheduled(controller, env, context) {
    context.waitUntil(runReminderCycle(env, new Date(controller.scheduledTime)));
  },
  async fetch() { return new Response('Agendador de lembretes da equipe. As execuções são automáticas.', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); },
};
