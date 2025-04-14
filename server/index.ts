import type { Context } from 'hono';

import Google from '@auth/core/providers/google';
import { authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js';
import { Hono } from 'hono';

interface AppEnv {
  Bindings: {
    ASSETS: { fetch: typeof fetch };
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    AUTH_SECRET: string;
    AUTH_URL: string;
  };
}

const app = new Hono<AppEnv>();

app.use(
  initAuthConfig((c: Context<AppEnv>) => ({
    providers: [
      // eslint-disable-next-line new-cap
      Google({
        clientId: c.env.AUTH_GOOGLE_ID,
        clientSecret: c.env.AUTH_GOOGLE_SECRET,
      }),
    ],
    secret: c.env.AUTH_SECRET,
  })),
);

app.use('/api/auth/*', authHandler());

app.use('/api/*', verifyAuth());

app.use(async (c, next) => {
  await next();
  c.header('X-Powered-By', 'React Router and Hono');
});

const _route = app.get('/api/secure', (c) =>
  c.json({
    name: c.get('authUser').session.user?.name,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!import.meta.env?.DEV) {
  app.get('*', async (c) => {
    const resp = await c.env.ASSETS.fetch(c.req.raw.url.slice(0, -c.req.path.length), c.req.raw);
    return new Response(resp.body, resp);
  });
}

export type AppType = typeof _route;

export default app;
