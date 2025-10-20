import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  rootPath?: string;
}
export const Breadcrumb = ({
  path,
  onNavigate,
  rootPath = "/",
}: BreadcrumbProps) => {
  const pathSegments =
    path === rootPath
      ? []
      : path.replace(rootPath, "").split("/").filter(Boolean);

  const firstSegment = pathSegments[0];
  const lastSegment = pathSegments[pathSegments.length - 1];
  const middleSegments = pathSegments.slice(1, -1);

  const buildPath = (index: number) => {
    if (index < 0) return rootPath;
    const segments = pathSegments.slice(0, index + 1);
    return rootPath === "/" ? `/${segments.join("/")}` : `${rootPath}/${segments.join("/")}`;
  };

  return (
    <div className="flex items-center gap-1 text-sm w-full">
      {/* Root */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(rootPath)}
        className="h-6 px-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
      >
        {rootPath}
      </Button>

      {pathSegments.length > 0 && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />

          {/* 最前面的資料夾 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(buildPath(0))}
            className="h-6 px-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
          >
            {firstSegment}
          </Button>

          {/* 中間可捲動部分 */}
          {middleSegments.length > 0 && (
            <div className="flex-1 max-w-[300px] overflow-x-auto whitespace-nowrap scrollbar-thin mx-1 flex items-center">
              {middleSegments.map((segment, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(buildPath(idx + 1))}
                    className="h-6 px-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
                  >
                    {segment}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* 最後的資料夾 */}
          {pathSegments.length > 1 && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(buildPath(pathSegments.length - 1))}
                className="h-6 px-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                {lastSegment}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
};
