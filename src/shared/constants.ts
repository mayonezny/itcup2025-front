const local: boolean = true;
const safeMode: boolean = false;
export const API_URL = local ? `${safeMode ? 'https' : 'http'}://localhost:10001/` : 'unknown';

export const LOGIN = 'colonelsarkisyan';
