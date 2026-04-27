import { http } from './http';
import type { LoginBody, SignupBody, AuthMeResponse, LoginResponse } from '$lib/types';

export const AuthAPI = {
  login: (body: LoginBody): Promise<LoginResponse> =>
    http('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: (): Promise<AuthMeResponse> =>
    http('/auth/me'),

  logout: (): Promise<void> =>
    http('/auth/logout', { method: 'POST' }),

  signup: (body: SignupBody): Promise<void> =>
    http('/user/signup', { method: 'POST', body: JSON.stringify(body) })
};
