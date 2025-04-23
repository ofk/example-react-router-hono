import type { Context } from 'hono';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Hono } from 'hono';

interface AppEnv {
  Bindings: {
    S3_ACCESS_KEY_ID: string;
    S3_ENDPOINT_URL: string;
    S3_REGION: string;
    S3_SECRET_ACCESS_KEY: string;
  };
}

const app = new Hono<AppEnv>();

app.use(async (c, next) => {
  await next();
  c.header('X-Powered-By', 'React Router and Hono');
});

const BUCKET_NAME = 'example-react-router-hono-bucket';

function getS3Client(c: Context<AppEnv>): S3Client {
  return new S3Client({
    credentials: {
      accessKeyId: c.env.S3_ACCESS_KEY_ID,
      secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: c.env.S3_ENDPOINT_URL,
    region: c.env.S3_REGION,
  });
}

const apiFiles = new Hono<AppEnv>()
  .get('', async (c) => {
    const s3 = getS3Client(c);
    const output = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      }),
    );
    const result = (output.Contents ?? []).map((f) => ({
      name: f.Key ?? '',
      size: f.Size ?? 0,
    }));
    return c.json(result);
  })
  .get(':name/upload', async (c) => {
    const s3 = getS3Client(c);
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: c.req.param('name'),
      }),
      {
        expiresIn: 5 * 60,
      },
    );
    return c.json({ url });
  })
  .get(':name/download', async (c) => {
    const name = c.req.param('name');
    const s3 = getS3Client(c);
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: name,
        ResponseContentDisposition: `attachment; filename="${name}"`,
      }),
      {
        expiresIn: 5 * 60,
      },
    );
    return c.json({ url });
  })
  .delete(':name', async (c) => {
    const s3 = getS3Client(c);
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: c.req.param('name'),
      }),
    );
    return c.json({ ok: true });
  });

const _route = app.route('/api/files', apiFiles);

export type AppType = typeof _route;

export default app;
