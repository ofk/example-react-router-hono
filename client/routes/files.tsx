import { hc } from 'hono/client';
import { Form, Link, useRevalidator } from 'react-router';

import type { AppType } from '../../server';
import type { Route } from './+types/files';

export const meta: Route.MetaFunction = () => [{ title: 'Files | New React Router App' }];

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const client = hc<AppType>('/');
  const resp = await client.api.files.$get();
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  const data = await resp.json();
  return data;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string' || !file.name) return;

  const client = hc<AppType>('/');
  const resp = await client.api.files[':name'].upload.$get({ param: { name: file.name } });
  if (!resp.ok) return;

  const { url } = await resp.json();
  await fetch(url, {
    body: file,
    headers: {
      'Content-Type': file.type,
    },
    method: 'PUT',
  });
}

const downloadFile = async (name: string): Promise<void> => {
  const client = hc<AppType>('/');
  const resp = await client.api.files[':name'].download.$get({
    param: { name },
  });
  if (!resp.ok) return;

  const { url } = await resp.json();
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
};

const deleteFile = async (name: string): Promise<void> => {
  const client = hc<AppType>('/');
  await client.api.files[':name'].$delete({
    param: { name },
  });
};

export default function Files({ loaderData }: Route.ComponentProps): React.ReactElement {
  const revalidator = useRevalidator();

  return (
    <div className="p-4">
      <h1 className="text-4xl">Files</h1>
      <p>
        <Link className="text-blue-600" to="/">
          Welcome
        </Link>
      </p>
      <Form encType="multipart/form-data" method="post">
        <input name="file" type="file" />
        <button className="border-black-600 border" type="submit">
          Upload
        </button>
      </Form>
      <ul>
        {loaderData.map((file) => (
          <li key={file.name}>
            {file.name} ({file.size}){' '}
            <button
              className="border-black-600 border"
              onClick={(): void => {
                void downloadFile(file.name);
              }}
              type="button"
            >
              Download
            </button>
            <button
              className="border border-red-600"
              onClick={(): void => {
                void deleteFile(file.name).then(() => revalidator.revalidate());
              }}
              type="button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
