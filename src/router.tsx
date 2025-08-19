import React, { Suspense } from 'react';
import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import type { PageMeta } from './pages/types';
import { RequireAuth } from './auth';

const modules = import.meta.glob<{
  default: React.ComponentType;
  meta?: PageMeta;
}>('./pages/**/*.tsx', { eager: true });

const routes: RouteObject[] = Object.entries(modules).map(([filePath, module]) => {
  let path = filePath
    .replace(/^\.\/pages/, '')
    .replace(/\/index\.tsx$/, '')
    .replace(/\.tsx$/, '')
    .toLowerCase();
  if (path === '') path = '/';
  if (filePath.endsWith('/App.tsx')) {
    path = '/';
  }
  const Component = module.default;
  const meta = module.meta ?? {};
  const element = meta.requiresAuth ? (
    <RequireAuth allowedRoles={meta.allowedRoles}>
      <Component />
    </RequireAuth>
  ) : (
    <Component />
  );

  return { path, element };
});
routes.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0));
routes.push({ path: '*', element: <Navigate to='/' replace /> });
export default function Router() {
  return <Suspense fallback={<div>加載中…</div>}>{useRoutes(routes)}</Suspense>;
}
