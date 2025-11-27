export type PageMeta = {
  requiresAuth?: boolean;
  allowedRoles?: string[];
  layout?: boolean;
};

export const ResponseType = {
  Ok: 'Ok',
  Err: 'Err',
} as const;

export type ResponseType = (typeof ResponseType)[keyof typeof ResponseType];

export type CommonResponse = {
  Type: ResponseType;
  Message: string;
};

export type GetServerRequest = {
  Server: string;
};

interface PcsUuid {
  Hostname: string;
  Status: 'active' | 'stopped' | 'uninstalled';
  Cpu: number;
  Memory: number;
};

export type GetInstalledServerResponse = {
  Pcs: Record<string, PcsUuid>;
  Length: number;
};

export type GetUninstalledServerResponse = {
  Pcs: Record<string, string>;
  Length: number;
};

export type PostInstallServerRequest = {
  Server: string;
  Uuids: string[];
};