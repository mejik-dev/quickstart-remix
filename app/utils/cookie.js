import { createCookie } from '@remix-run/node';

const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: true,
  maxAge: 604_800, //one week
};

export const microgenToken = createCookie('token', {
  ...cookieOptions,
});

export const getToken = async (request) => {
  const cookieHeader = request.headers.get('Cookie');
  const token = await microgenToken.parse(cookieHeader);
  return token;
};
