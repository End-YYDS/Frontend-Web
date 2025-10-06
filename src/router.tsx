import React, { Suspense, type JSX } from 'react';
import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RequireAuth } from './auth';
import { type PageMeta } from './types';

const rawModules = import.meta.glob(
  [
    './pages/**/index.tsx',
    './pages/*.tsx',
    '!./pages/**/_*.tsx',
    '!./pages/**/App.tsx',
    '!./pages/**/types.ts',
    '!./pages/**/types.tsx',
  ],
  {
    eager: true,
    import: 'default',
  },
) as Record<string, (React.ComponentType & { meta?: PageMeta }) | undefined>;
const entries = Object.entries(rawModules).filter(([file, Comp]) => {
  const ok = !!Comp && !/\/App\.tsx$/i.test(file);
  if (!ok) console.warn(`[router] skip ${file}: no default export or excluded`);
  return ok;
});

type SimpleRoute = {
  path: string;
  index: boolean;
  relPath: string | null;
  element: JSX.Element;
  meta?: PageMeta;
};

export default function Router() {
  const simple: SimpleRoute[] = entries.map(([filePath, mod]) => {
    const Component = mod as React.ComponentType & { meta?: PageMeta };
    let path = filePath
      .replace(/^\.\/pages/, '')
      .replace(/\/index\.tsx$/, '')
      .replace(/\.tsx$/, '')
      .toLowerCase();
    if (path === '') path = '/';
    const isIndex = path === '/';
    const relPath = isIndex ? null : path.replace(/^\//, '');
    const meta: PageMeta | undefined = (Component as any).meta;
    return { path, index: isIndex, relPath, element: <Component />, meta };
  });

  simple.sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0));
  const inLayout = simple.filter(
    (r) => (r.meta?.layout ?? true) && r.path !== '/login' && r.path !== '/unauthorized',
  );
  const bare = simple.filter((r) => !inLayout.includes(r));
  const publicInLayout = inLayout.filter((r) => r.meta?.requiresAuth === false);
  const protectedNoRole = inLayout.filter(
    (r) => (r.meta?.requiresAuth ?? true) && !r.meta?.allowedRoles?.length,
  );
  const protectedWithRoles = inLayout.filter(
    (r) => (r.meta?.requiresAuth ?? true) && r.meta?.allowedRoles?.length,
  );
  const roleGroups = new Map<string, SimpleRoute[]>();
  for (const r of protectedWithRoles) {
    const key = r.meta!.allowedRoles!.slice().sort().join(',');
    if (!roleGroups.has(key)) roleGroups.set(key, []);
    roleGroups.get(key)!.push(r);
  }
  const toChild = (r: SimpleRoute) =>
    r.index ? { index: true, element: r.element } : { path: r.relPath!, element: r.element };

  const routes: RouteObject[] = [
    // 公開頁：直接進 Layout，不經過 RequireAuth
    { element: <Layout />, children: publicInLayout.map(toChild) },

    // 需要登入但不限角色
    {
      element: <RequireAuth />,
      children: [
        {
          element: <Layout />,
          children: protectedNoRole.map(toChild),
        },
      ],
    },

    // 需要登入且限定角色
    ...Array.from(roleGroups.entries()).map(([key, routesForRoles]) => ({
      element: <RequireAuth allowedRoles={key.split(',')} />,
      children: [
        {
          element: <Layout />,
          children: routesForRoles.map(toChild),
        },
      ],
    })),

    // 不進 Layout 的頁（login/unauthorized）
    ...bare.map((r) => ({ path: r.path, element: r.element })),

    { path: '*', element: <Navigate to='/' replace /> },
  ];

  return <Suspense fallback={<div>加載中…</div>}>{useRoutes(routes)}</Suspense>;
}
