import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  // Auth endpoints
  http.post('http://127.0.0.1:8000/api/token/', async ({ request }) => {
    const body = await request.json();
    const { username, password } = body as { username: string; password: string };
    
    if (username === 'test.user' && password === 'password') {
      return HttpResponse.json({
        access: 'fake.access.token',
        refresh: 'fake.refresh.token',
        token_type: 'Bearer',
        status: 'success'
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('http://127.0.0.1:8000/api/token/refresh/', async ({ request }) => {
    const body = await request.json();
    const { refresh } = body as { refresh: string };
    
    if (refresh === 'fake.refresh.token') {
      return HttpResponse.json({
        access: 'new.access.token',
        status: 'success'
      }, { status: 200 });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid refresh token' },
      { status: 401 }
    );
  }),

  http.get('http://127.0.0.1:8000/api/me/', async ({ request }) => {
    // In test environment, always return user data
    return HttpResponse.json({
      id: 1,
      username: 'test.user',
      role: 'manager',
      perms: ['inventory.view', 'inventory.edit']
    }, { status: 200 });
  })
];

export const server = setupServer(...handlers);