import { Suspense } from 'react';
import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import Layout from '@/components/Layout';
import { RequireAuth } from './auth/RequireAuth';
import { simpleRoutes, type SimpleRoute } from './routeRegistry';

export default function Router() {
  const inLayoutAll = simpleRoutes.filter(
    (r) => (r.meta?.layout ?? true) && r.path !== '/login' && r.path !== '/unauthorized',
  );
  const bare = simpleRoutes.filter((r) => !inLayoutAll.includes(r));
  const publicInLayout = inLayoutAll.filter((r) => r.meta?.requiresAuth === false);
  const protectedNoRole = inLayoutAll.filter(
    (r) => (r.meta?.requiresAuth ?? true) && !r.meta?.allowedRoles?.length,
  );
  const protectedWithRoles = inLayoutAll.filter(
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

    { path: '*', element: <Navigate to='/dashboard' replace /> },
  ];

  return <Suspense fallback={<div>加載中…</div>}>{useRoutes(routes)}</Suspense>;
}
