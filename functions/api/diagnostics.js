import { handleDiagnosticsRequest } from '../../server/diagnostics/api.js';

export const onRequest = ({ request, env }) => handleDiagnosticsRequest(request, env);
