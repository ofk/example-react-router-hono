import { hc } from 'hono/client';
import { Form, Link } from 'react-router';

import type { AppType } from '../../server';
import type { Route } from './+types/texts.$title';

export const meta: Route.MetaFunction = () => [{ title: 'Texts | New React Router App' }];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const client = hc<AppType>('/');
  const resp = await client.api.texts[':title'].$get({
    param: { title: params.title },
  });
  if (!resp.ok) {
    return { body: '', title: params.title };
  }
  const data = await resp.json();
  return data;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const client = hc<AppType>('/');
  await client.api.texts[':title'].$post({ json: { body }, param: { title: String(title) } });
}

export default function Text({ loaderData }: Route.ComponentProps): React.ReactElement {
  return (
    <div className="p-4">
      <h1 className="text-4xl">Texts</h1>
      <p>
        <Link className="text-blue-600" to="/texts/">
          Return
        </Link>
      </p>
      <Form method="post">
        <p>
          <input className="border-black-600 border" defaultValue={loaderData.title} name="title" />
        </p>
        <p>
          <textarea
            className="border-black-600 border"
            defaultValue={loaderData.body}
            name="body"
          />
        </p>
        <p>
          <button className="border-black-600 border" type="submit">
            Send
          </button>
        </p>
      </Form>
    </div>
  );
}
