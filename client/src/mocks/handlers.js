import { rest } from 'msw';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'fake-token',
        user: {
          id: '1',
          username: 'testuser',
          role: 'client'
        }
      })
    );
  }),

  rest.get('/api/questionnaires', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: '1',
          title: 'Test Questionnaire',
          status: 'open',
          brands: [{ name: 'Brand 1' }]
        }
      ])
    );
  }),

  // Add more handlers as needed...
]; 