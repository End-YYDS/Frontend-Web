// DNS 相關
export interface DnsPair {
  Primary: string;
  Secondary: string;
}

export interface PcDns {
  Hostname: string;
  DNS: DnsPair;
}

export interface GetAllDnsResponse {
  Pcs: Record<string, PcDns>; // uuid -> { Hostname, DNS }
}

// PATCH /api/network/dns
export interface PatchHostnameRequest {
  Uuid: string;
  // 若未來需要修改新 Hostname，可加:
  // Hostname: string;
}

// PUT /api/network/dns
export interface PutDnsRequest {
  Primary: string;
  Secondary: string;
}

// ---------------------------

// NIC / Network 相關
export const NicType = {
  Virtual: "Virtual",
  Physical: "Physical"
} as const;

export type NicType = (typeof NicType)[keyof typeof NicType];

export const NicStatus = {
  Up: "Up",
  Down: "Down"
} as const;

export type NicStatus = (typeof NicStatus)[keyof typeof NicStatus];

export interface NetworkItem {
  nic_type: NicType;
  ipv4: string;
  netmask: string;
  mac: string;
  broadcast: string;
  mtu: number;
  status: NicStatus;
}

export interface PcNetworks {
  networks: Record<string, NetworkItem>; // nid -> item
  length: number;
}

export interface GetAllNetResponse {
  pcs: Record<string, PcNetworks>; // uuid -> networks
  length: number;
}

// POST /api/network/net
export interface CreateNetRequest {
  Nid: string;
  Type: NicType;
  Ipv4: string;
  Netmask: string;
  Mac: string;
  Broadcast: string;
  Mtu: number;
  Status: NicStatus;
}

// DELETE /api/network/net
export interface DeleteNetRequest {
  Nid: string;
}

// PATCH 單欄更新
export type PatchOp =
  | { Ipv4: string }
  | { Netmask: string }
  | { Mac: string }
  | { Broadcast: string }
  | { Mtu: number }
  | { Status: NicStatus }
  | { Type: NicType };

// PATCH /api/network/net
export interface PatchNetRequest {
  Nid: string;
  op: PatchOp;
}

// PUT /api/network/net
export interface PutNetRequest {
  Nid: string;
  Type: NicType;
  Ipv4: string;
  Netmask: string;
  Mac: string;
  Broadcast: string;
  Mtu: number;
  Status: NicStatus;
}

// Action up/down
export interface ActionNetRequest {
  Nid: string;
}

// ---------------------------

// Route 相關
export interface RouteItem {
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}

export interface PcRoutes {
  Routes: Record<string, RouteItem>; // destination -> item
  Length: number;
}

export interface GetAllRouteResponse {
  Pcs: Record<string, PcRoutes>; // uuid -> routes
  Length: number;
}

// POST /api/network/route
export interface CreateRouteRequest {
  Destination: string;
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}

// DELETE /api/network/route
export interface DeleteRouteRequest {
  Destination: string;
}

// PATCH 單欄更新
export const PatchField = {
  Via: "Via",
  Dev: "Dev",
  Proto: "Proto",
  Metric: "Metric",
  Scope: "Scope",
  Src: "Src",
} as const;

export type PatchField = (typeof PatchField)[keyof typeof PatchField];

export interface PatchRouteRequest {
  Destination: string;
  Type: PatchField;
  Via?: string;
  Dev?: string;
  Proto?: string;
  Metric?: number;
  Scope?: string;
  Src?: string;
}

// PUT 整筆更新
export interface PutRouteRequest {
  Destination: string;
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}
