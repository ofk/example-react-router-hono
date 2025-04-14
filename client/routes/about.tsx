import { hc } from 'hono/client';
import { Link } from 'react-router';

import type { AppType } from '../../server';
import type { Route } from './+types/about';

export const meta: Route.MetaFunction = () => [{ title: 'About | New React Router App' }];

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const client = hc<AppType>('/');
  const resp = await client.api.secure.$get();
  if (!resp.ok) {
    throw new Error(await resp.text());
  }
  const data = await resp.json();
  return data;
}

export default function About({ loaderData }: Route.ComponentProps): React.ReactElement {
  return (
    <div className="p-4">
      <h1 className="text-4xl">About</h1>
      <p>{loaderData.name}</p>
      <p>
        <Link className="text-blue-600" to="/">
          Welcome
        </Link>
      </p>
    </div>
  );
}
