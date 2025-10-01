import { createClient } from '@/-js';
const Url = import.meta.env.VITE__URL;
const AnonKey = import.meta.env.VITE__ANON_KEY;
if (!Url || !AnonKey) {
  throw new Error('Missing  environment variables');
  export const  = createClient(Url, AnonKey);