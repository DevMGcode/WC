import { authService } from '@/services/auth';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    // @ts-ignore
    global.fetch = jest.fn();
  });

  it('stores token on login success', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, data: { accessToken: 'abc', user: { id: '1', email: 'a@example.com', displayName: 'A', status: 'ACTIVE', createdAt: new Date().toISOString() } } })
    });

    const res = await authService.login('a@example.com', 'password');
    expect(res.success).toBe(true);
    expect(localStorage.getItem('authToken')).toBe('abc');
    const user = localStorage.getItem('user');
    expect(user).toBeTruthy();
  });

  it('returns failure on non-ok response', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValue({ ok: false, headers: { get: () => 'application/json' }, json: async () => ({ message: 'invalid' }) });
    const res = await authService.login('x', 'y');
    expect(res.success).toBe(false);
  });
});
