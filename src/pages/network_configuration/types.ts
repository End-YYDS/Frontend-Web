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
// ---------- RouteItem ----------
export interface RouteItem {
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}

// ---------- PcRoutes ----------
export interface PcRoutes {
  Routes: Record<string, RouteItem>; // destination -> RouteItem
  Length: number;
}

// ---------- GetAllRouteResponse ----------
export interface GetAllRouteResponse {
  Pcs: Record<string, PcRoutes>; // uuid -> PcRoutes
  Length: number;
}

// ---------- CreateRouteRequest (POST /api/network/route) ----------
export interface CreateRouteRequest {
  Destination: string;
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}

// ---------- DeleteRouteRequest (DELETE /api/network/route) ----------
export interface DeleteRouteRequest {
  Destination: string;
}

// ---------- PatchField ----------
export type PatchField = "Via" | "Dev" | "Proto" | "Metric" | "Scope" | "Src";

// ---------- PatchRouteRequest (PATCH 單欄) ----------
export interface PatchRouteRequest {
  Nid: string;
  Destination: string;
  Type: PatchField;
  Via?: string;
  Dev?: string;
  Proto?: string;
  Metric?: number;
  Scope?: string;
  Src?: string;
}

// ---------- PutRouteRequest (PUT 整筆) ----------
export interface PutRouteRequest {
  Nid: string;
  Destination: string;
  Via: string;
  Dev: string;
  Proto: string;
  Metric: number;
  Scope: string;
  Src: string;
}
