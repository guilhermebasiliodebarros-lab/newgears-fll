import { handleNvidiaGiroRequest } from '../../../server/giro/nvidia.js';

export const onRequest = ({ request, env }) => handleNvidiaGiroRequest(request, env);
