import type React from 'react';

export type PageMeta = {
  requiresAuth?: boolean;
  allowedRoles?: string[];
  layout?: boolean;
  disable?: boolean;
};

export type PageComponent = React.ComponentType & {
  meta?: PageMeta;
};

// export const ResponseType = {
//   Ok: 'Ok',
//   Err: 'Err',
// } as const;

// export type ResponseType = (typeof ResponseType)[keyof typeof ResponseType];

// export type CommonResponse = {
//   Type: ResponseType;
//   Message: string;
// };
