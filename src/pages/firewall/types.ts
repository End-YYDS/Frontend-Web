type Status = 'active' | 'inactive';
type Target = 'ACCEPT' | 'DROP' | 'REJECT';
type ResultType = 'Ok' | 'Err';

type InnerRules = Rule[];
type InnerChains = Chains[];

interface GetFilewallPcs {
  Pcs: Record<string, string>;
  Length: number;
}

interface GetFirewallRequest {
  Uuid: string;
}

interface Rule {
  Target: Target;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}

interface Chains {
  Name: string;
  Policy: Target;
  Rules: InnerRules;
  Rules_Length: number;
}

interface GetFirewallResponse {
  Status: Status;
  Chain: InnerChains;
}

interface PostFirewallRuleRequest {
  Uuid: string;
  Chain: string; //INPUT FORWARD OUTPUT
  Target: Target;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}

interface DeleteFirewallRuleRequest {
  Uuid: string;
  Chain: string; //INPUT FORWARD OUTPUT
  RuleId: number;
}

interface PutFirewallStatusRequest {
  Uuid: string;
  Status: Status;
}

interface PutFirewallPolicyRequest {
  Uuid: string;
  Chain: string;
  Policy: Target;
}

// Post /api/firewall/rule
// Delete /api/firewall/rule
// Put /api/firewall/status
// Put /api/firewall/policy
interface FirewallResponse {
  Type: ResultType;
  Message: string;
}

export type {
  Target,
  Rule,
  GetFilewallPcs,
  GetFirewallRequest,
  GetFirewallResponse,
  PostFirewallRuleRequest,
  FirewallResponse,
  DeleteFirewallRuleRequest,
  PutFirewallStatusRequest,
  PutFirewallPolicyRequest,
};
