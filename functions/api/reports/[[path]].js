import { handleReportsRequest } from '../../../server/reports/api.js';

export const onRequest = ({ request, env }) => handleReportsRequest(request, env);
