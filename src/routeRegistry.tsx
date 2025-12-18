import { type JSX } from 'react';
import { type PageComponent, type PageMeta } from './types';

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
) as Record<string, PageComponent | undefined>;

const entries = Object.entries(rawModules).filter(([file, Comp]) => {
  const ok = !!Comp && !/\/App\.tsx$/i.test(file);
  if (!ok) console.warn(`[router] skip ${file}: no default export or excluded`);
  return ok;
});

export type SimpleRoute = {
  path: string;
  index: boolean;
  relPath: string | null;
  element: JSX.Element;
  meta?: PageMeta;
};

export const simpleRoutes: SimpleRoute[] = entries
  .map(([filePath, mod]) => {
    const Component = mod as PageComponent;
    let path = filePath
      .replace(/^\.\/pages/, '')
      .replace(/\/index\.tsx$/, '')
      .replace(/\.tsx$/, '')
      .toLowerCase();
    if (path === '') path = '/';
    const isIndex = path === '/';
    const relPath = isIndex ? null : path.replace(/^\//, '');
    const meta: PageMeta = { ...Component.meta, disable: Component.meta?.disable ?? false };
    return { path, index: isIndex, relPath, element: <Component />, meta };
  })
  .sort((a, b) => (a.path === '/' ? -1 : b.path === '/' ? 1 : 0));

export const pageMetaByPath: Readonly<Record<string, PageMeta | undefined>> = Object.freeze(
  Object.fromEntries(simpleRoutes.map((r) => [r.path, r.meta])),
);

export function isPathDisabled(path: string): boolean {
  return pageMetaByPath[path]?.disable ?? false;
}

