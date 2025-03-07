
import { rest } from 'msw';

export const handlers = [
  // Mock admin check endpoint
  rest.get('/api/check-admin', (req, res, ctx) => {
    // In a real app, you would validate the token and check the user's role
    // For demonstration, we'll return true if there's an Authorization header
    const hasAuthHeader = req.headers.get('Authorization') !== null;
    
    return res(
      ctx.status(200),
      ctx.json({
        data: {
          isAdmin: hasAuthHeader
        }
      })
    );
  }),
  
  // Add other mock handlers as needed
];
