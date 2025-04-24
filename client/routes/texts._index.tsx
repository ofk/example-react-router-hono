import { hc } from 'hono/client';
import { Form, Link, redirect } from 'react-router';

import type { AppType } from '../../server';
import type { Route } from './+types/texts/_index';

export const meta: Route.MetaFunction = () => [{ title: 'Texts | New React Router App' }];

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const client = hc<AppType>('/');
  const resp = await client.api.texts.$get();
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  const data = await resp.json();
  return data;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const title = formData.get('title') as string;
  return redirect(`/texts/${title}`);
}

export default function Texts({ loaderData }: Route.ComponentProps): React.ReactElement {
  return (
    <div className="p-4">
      <h1 className="text-4xl">Texts</h1>
      <p>
        <Link className="text-blue-600" to="/">
          Welcome
        </Link>
      </p>
      <Form method="post">
        <input className="border-black-600 border" name="title" />
        <button className="border-black-600 border" type="submit">
          Create
        </button>
      </Form>
      <ul>
        {loaderData.map((text) => (
          <li key={text.title}>
            <Link className="text-blue-600" to={`/texts/${text.title}`}>
              {text.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
