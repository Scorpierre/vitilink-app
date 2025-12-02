import { http } from './http';

export const AuthAPI = {
  login: (body: any) =>
    http('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  me: () => http('/auth/me'),

  logout: () =>
    http('/auth/logout', {
      method: 'POST'
    }),

  signup: (body: any) =>
    http('/user/signup', {
      method: 'POST',
      body: JSON.stringify(body)
    })
};
