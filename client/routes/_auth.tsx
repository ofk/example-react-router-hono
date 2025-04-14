import { signIn } from '@hono/auth-js/react';
import { Outlet } from 'react-router';

import type { Route } from './+types/_auth';

export default function Layout(): React.ReactElement | null {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): null {
  if (error instanceof Error && error.message.startsWith('Unauthorized')) {
    void signIn('google');
    return null;
  }
  throw error;
}
