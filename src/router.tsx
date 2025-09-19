import React, { Suspense, type JSX } from 'react';
import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import { RequireAuth } from './auth';
import Layout from '@/components/Layout';
import { type PageMeta } from './pages/types';

const modules = import.meta.glob<{
  default: React.ComponentType;
  meta?: PageMeta;
}>('./pages/**/*.tsx', { eager: true });

const entries = Object.entries(modules).filter(([file]) => !/\/App\.tsx$/i.test(file));
type SimpleRoute = { path: string; element: JSX.Element; meta?: PageMeta };
export default function Router() {
  const simple: SimpleRoute[] = entries.map(([filePath, mod]) => {
    let path = filePath
      .replace(/^\.\/pages/, '')
      .replace(/\/index\.tsx$/, '')
      .replace(/\.tsx$/, '')
      .toLowerCase();
    if (path === '') path = '/';
    const Component = mod.default;
    const meta = (mod as any).meta as PageMeta | undefined;
    const el = meta?.requiresAuth ? (
      <RequireAuth allowedRoles={meta?.allowedRoles}>
        <Component />
      </RequireAuth>
    ) : (
      <Component />
    );
    return { path, element: el, meta };
  });
  simple.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0));
  const inLayout = simple.filter(
    (r) => r.meta?.layout !== false && r.path !== '/login' && r.path !== '/unauthorized',
  );
  const bare = simple.filter((r) => !inLayout.includes(r));

  const routes: RouteObject[] = [
    {
      element: (
        <RequireAuth>
          <Layout />
        </RequireAuth>
      ),
      children: inLayout.map((r) => ({ path: r.path, element: r.element })),
    },
    ...bare.map((r) => ({ path: r.path, element: r.element })),
    { path: '*', element: <Navigate to='/' replace /> },
  ];

  return <Suspense fallback={<div>加載中…</div>}>{useRoutes(routes)}</Suspense>;
}
