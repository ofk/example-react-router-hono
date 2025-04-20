import { Hono } from 'hono';

interface AppEnv {
  Bindings: {
    ASSETS: { fetch: typeof fetch };
  };
}

const app = new Hono<AppEnv>();

app.use(async (c, next) => {
  await next();
  c.header('X-Powered-By', 'React Router and Hono');
});

const _route = app.get('/api', (c) =>
  c.json({
    message: 'Hello',
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
