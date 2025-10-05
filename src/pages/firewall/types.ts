// /api/firewall/status & PUT /api/firewall/status
export interface FirewallRequest {
  Uuid: string;
}

// Firewall 狀態
export type FirewallStatus = "active" | "inactive";

// 封包目標
export type Target = "ACCEPT" | "DROP" | "REJECT";

// 單一防火牆規則
export interface Rule {
  Target: Target;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}

// 單一 Chain
export interface Chain {
  Name: string;
  Policy: Target;
  Rules: Rule[];
  Rules_Length: number;
}

// 防火牆回應
export interface FirewallStatusResponse {
  Status: FirewallStatus;
  Chains: Chain[];
}

// DELETE /api/firewall/rule
export interface DeleteRuleRequest {
  Uuid: string;
  Chain: string;
  RuleId: number;
}

// PUT /api/firewall/status
export interface PutStatusRequest {
  Uuid: string;
  Status: FirewallStatus;
}

// PUT /api/firewall/policy
export interface PutPolicyRequest {
  Uuid: string;
  Chain: string;
  Policy: Target;
}

// POST /api/firewall/rule
export interface AddRuleRequest {
  Uuid: string;
  Chain: string;
  Target: Target;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}
