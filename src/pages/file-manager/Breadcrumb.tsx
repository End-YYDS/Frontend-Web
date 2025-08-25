
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  rootPath?: string;
}

export const Breadcrumb = ({ path, onNavigate, rootPath = '/' }: BreadcrumbProps) => {
  const pathSegments = path === rootPath ? [] : path.replace(rootPath, '').split('/').filter(Boolean);
  
  const buildPath = (index: number) => {
    if (index === -1) return rootPath;
    const segments = pathSegments.slice(0, index + 1);
    return rootPath === '/' ? `/${segments.join('/')}` : `${rootPath}/${segments.join('/')}`;
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(rootPath)}
        className="h-6 px-2 text-gray-600 hover:text-gray-900"
      >
        <Home className="w-3 h-3 mr-1" />
        {rootPath === '/' ? 'Root' : rootPath.split('/').pop()}
      </Button>
      
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(buildPath(index))}
            className="h-6 px-2 text-gray-600 hover:text-gray-900"
          >
            {segment}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};