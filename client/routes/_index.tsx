import { Link } from 'react-router';

import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => [
  { title: 'New React Router App' },
  { content: 'Welcome to React Router!', name: 'description' },
];

export default function Home(): React.ReactElement {
  return (
    <div className="p-4">
      <h1 className="text-4xl">Welcome</h1>
      <p>
        <Link className="text-blue-600" to="/files">
          Files
        </Link>
        <Link className="text-blue-600" to="/texts">
          Texts
        </Link>
      </p>
    </div>
  );
}
