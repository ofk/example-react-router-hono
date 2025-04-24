import type { Context } from 'hono';

import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

interface AppEnv {
  Bindings: {
    DYNAMODB_ACCESS_KEY_ID: string;
    DYNAMODB_ENDPOINT_URL: string;
    DYNAMODB_REGION: string;
    DYNAMODB_SECRET_ACCESS_KEY: string;
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

const TABLE_NAME = 'example-react-router-hono-table';

function getDynamoDBClient(c: Context<AppEnv>): DynamoDBClient {
  return new DynamoDBClient({
    credentials: {
      accessKeyId: c.env.DYNAMODB_ACCESS_KEY_ID,
      secretAccessKey: c.env.DYNAMODB_SECRET_ACCESS_KEY,
    },
    endpoint: c.env.DYNAMODB_ENDPOINT_URL,
    region: c.env.DYNAMODB_REGION,
  });
}

const apiTexts = new Hono<AppEnv>()
  .get('', async (c) => {
    const ddb = getDynamoDBClient(c);
    const result = await ddb.send(
      new ScanCommand({
        ProjectionExpression: 'title',
        TableName: TABLE_NAME,
      }),
    );
    const titles =
      result.Items?.map((item) => ({
        title: item.title.S ?? '',
      })) ?? [];
    return c.json(titles);
  })
  .get(':title', async (c) => {
    const ddb = getDynamoDBClient(c);
    const title = c.req.param('title');

    const result = await ddb.send(
      new GetItemCommand({
        Key: { title: { S: title } },
        TableName: TABLE_NAME,
      }),
    );
    const item = result.Item;
    if (!item) {
      throw new HTTPException(404);
    }

    return c.json({
      body: item.body.S ?? '',
      title: item.title.S ?? '',
    });
  })
  .post(':title', zValidator('json', z.object({ body: z.string() })), async (c) => {
    const ddb = getDynamoDBClient(c);
    const title = c.req.param('title');
    const { body } = c.req.valid('json');
    if (body) {
      await ddb.send(
        new PutItemCommand({
          Item: { body: { S: body }, title: { S: title } },
          TableName: TABLE_NAME,
        }),
      );
    } else {
      await ddb.send(
        new DeleteItemCommand({
          Key: { title: { S: title } },
          TableName: TABLE_NAME,
        }),
      );
    }
    return c.json({ ok: true });
  });

const _route = app.route('/api/files', apiFiles).route('/api/texts', apiTexts);

export type AppType = typeof _route;

export default app;
