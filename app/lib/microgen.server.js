import { MicrogenClient } from 'microgen-v3-sdk';

const MICROGEN_API_KEY = process.env.MICROGEN_API_KEY;

export const microgen = new MicrogenClient({
  apiKey: MICROGEN_API_KEY,
});

export const microgenApiUrl = `https://api.microgen.com/query/api/v1/${MICROGEN_API_KEY}`;
