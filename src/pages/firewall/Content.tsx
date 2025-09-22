import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Plus, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddRuleDialog } from './AddRuleDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Host { uuid: string; hostname: string; }
interface FirewallRule { Target: string; Protocol: string; In: string; Out: string; Source: string; Destination: string; Options: string; }
interface FirewallChain { Name: string; Policy: string; Rules: FirewallRule[]; Rules_Length: number; }
interface FirewallStatus { Status: string; Chains: FirewallChain[]; }

export const FirewallManager = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('');
  const [firewallStatus, setFirewallStatus] = useState<FirewallStatus | null>(null);
  const [, setIsLoading] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>('INPUT');
  const { toast } = useToast();

  // Dialog 狀態
  const [firewallDialog, setFirewallDialog] = useState({ open: false, newStatus: false });
  const [policyDialog, setPolicyDialog] = useState({ open: false, chain: '', newPolicy: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, chain: '', ruleIndex: -1 });

  // 取得主機
  const fetchHosts = async () => {
    try {
      const testHosts = [
        { uuid: 'host-001', hostname: 'PC-OFFICE-001' },
        { uuid: 'host-002', hostname: 'PC-OFFICE-002' },
        { uuid: 'host-003', hostname: 'SERVER-001' },
        { uuid: 'host-004', hostname: 'LAPTOP-DEV-001' },
        { uuid: 'host-005', hostname: 'GATEWAY-001' }
      ];
      setHosts(testHosts);
      setSelectedHost(testHosts[0]?.uuid || '');
    } catch {
      toast({ title: "錯誤", description: "無法取得主機列表", variant: "destructive" });
    }
  };

  // 取得防火牆狀態
  const fetchFirewallStatus = async (uuid: string) => {
    if (!uuid) return;
    setIsLoading(true);
    try {
      const testStatus: FirewallStatus = {
        Status: 'active',
        Chains: [
          { Name: 'INPUT', Policy: 'DROP', Rules: [
            { Target: 'ACCEPT', Protocol: 'tcp', In: 'lo', Out: '*', Source: '0.0.0.0/0', Destination: '0.0.0.0/0', Options: '' },
            { Target: 'ACCEPT', Protocol: 'tcp', In: 'eth0', Out: '*', Source: '0.0.0.0/0', Destination: '0.0.0.0/0', Options: 'tcp dpt:22' },
            { Target: 'DROP', Protocol: 'tcp', In: 'eth0', Out: '*', Source: '192.168.1.100', Destination: '0.0.0.0/0', Options: 'tcp dpt:22' }
          ], Rules_Length: 3 },
          { Name: 'FORWARD', Policy: 'DROP', Rules: [], Rules_Length: 0 },
          { Name: 'OUTPUT', Policy: 'ACCEPT', Rules: [
            { Target: 'ACCEPT', Protocol: 'all', In: '*', Out: 'eth0', Source: '0.0.0.0/0', Destination: '0.0.0.0/0', Options: '' }
          ], Rules_Length: 1 }
        ]
      };
      setFirewallStatus(testStatus);
      toast({ title: "成功", description: "已載入防火牆狀態" });
    } catch {
      toast({ title: "錯誤", description: "無法取得防火牆狀態", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  // 切換防火牆
const toggleFirewallStatus = async (status: boolean) => {
  if (!selectedHost) return;
  try {
    const newStatus = status ? 'active' : 'inactive';
    setFirewallStatus(prev => prev ? { ...prev, Status: newStatus } : null);
    toast({ title: "成功", description: `防火牆已${status ? '啟用' : '停用'}` });
  } catch {
    toast({ title: "錯誤", description: "無法修改防火牆狀態", variant: "destructive" });
  }
};

  // 確認修改策略
  const confirmUpdatePolicy = async () => {
    if (!selectedHost) return;
    const { chain, newPolicy } = policyDialog;
    try {
      setFirewallStatus(prev => {
        if (!prev) return null;
        return { ...prev, Chains: prev.Chains.map(c => c.Name === chain ? { ...c, Policy: newPolicy } : c) };
      });
      toast({ title: "成功", description: `${chain} 鏈的預設策略已更新` });
    } catch {
      toast({ title: "錯誤", description: "無法更新預設策略", variant: "destructive" });
    } finally { setPolicyDialog(prev => ({ ...prev, open: false })); }
  };

  // 確認刪除規則
  const confirmDeleteRule = async () => {
    if (!selectedHost) return;
    const { chain, ruleIndex } = deleteDialog;
    try {
      setFirewallStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          Chains: prev.Chains.map(c => {
            if (c.Name === chain) {
              const newRules = [...c.Rules];
              newRules.splice(ruleIndex, 1);
              return { ...c, Rules: newRules, Rules_Length: newRules.length };
            }
            return c;
          })
        };
      });
      toast({ title: "成功", description: "規則已刪除" });
    } catch {
      toast({ title: "錯誤", description: "無法刪除規則", variant: "destructive" });
    } finally { setDeleteDialog({ open: false, chain: '', ruleIndex: -1 }); }
  };

  useEffect(() => { fetchHosts(); }, []);
  useEffect(() => { if (selectedHost) fetchFirewallStatus(selectedHost); }, [selectedHost]);

  const getStatusBadge = (status: string) => status === 'active'
    ? <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />啟用</Badge>
    : <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />停用</Badge>;

  const getPolicyBadge = (policy: string) => {
    const colors = { ACCEPT: 'bg-green-100 text-green-800', DROP: 'bg-red-100 text-red-800', REJECT: 'bg-orange-100 text-orange-800' };
    return <Badge className={colors[policy as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{policy}</Badge>;
  };

  const getTargetBadge = (target: string) => {
    const colors = { ACCEPT: 'bg-green-100 text-green-800', DROP: 'bg-red-100 text-red-800', REJECT: 'bg-orange-100 text-orange-800' };
    return <Badge variant="outline" className={colors[target as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{target}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 主機選擇 */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">選擇主機</span>
            <Select value={selectedHost} onValueChange={setSelectedHost}>
              <SelectTrigger className="w-60"><SelectValue placeholder="請選擇主機" /></SelectTrigger>
              <SelectContent>{hosts.map(h => <SelectItem key={h.uuid} value={h.uuid}>{h.hostname} ({h.uuid})</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 防火牆狀態 */}
      {firewallStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Settings className="w-5 h-5" />防火牆狀態</span>
              {getStatusBadge(firewallStatus.Status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium">防火牆開關</span>
            <Switch
              checked={firewallStatus.Status === 'active'}
              onCheckedChange={(value) => setFirewallDialog({ open: true, newStatus: value })}
            />
          </CardContent>
        </Card>
      )}

      {/* 啟用/停用防火牆確認框 */}
      <Dialog open={firewallDialog.open} onOpenChange={(open) => setFirewallDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>確認操作</DialogTitle></DialogHeader>
          <div className="py-4">
            是否要 <span className="font-medium">{firewallDialog.newStatus ? '啟用' : '停用'}</span> 防火牆？
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFirewallDialog(prev => ({ ...prev, open: false }))}>取消</Button>
            <Button onClick={() => {
              toggleFirewallStatus(firewallDialog.newStatus);
              setFirewallDialog(prev => ({ ...prev, open: false }));
            }}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 防火牆鏈規則 */}
      {firewallStatus?.Status === 'active' && firewallStatus.Chains.map(chain => (
        <Card key={chain.Name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{chain.Name} 鏈</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">預設策略:</span>
                {getPolicyBadge(chain.Policy)}
                <Select
                  value={chain.Policy}
                  onValueChange={(value) => setPolicyDialog({ open: true, chain: chain.Name, newPolicy: value })}
                >
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACCEPT">ACCEPT</SelectItem>
                    <SelectItem value="DROP">DROP</SelectItem>
                    <SelectItem value="REJECT">REJECT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">共 {chain.Rules_Length} 條規則</span>
              <Button size="sm" onClick={() => { setSelectedChain(chain.Name); setIsAddRuleOpen(true); }} className="flex items-center gap-1"><Plus className="w-4 h-4" />新增規則</Button>
            </div>

            {chain.Rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>動作</TableHead>
                    <TableHead>協定</TableHead>
                    <TableHead>輸入介面</TableHead>
                    <TableHead>輸出介面</TableHead>
                    <TableHead>來源</TableHead>
                    <TableHead>目的</TableHead>
                    <TableHead>目標埠</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chain.Rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>{getTargetBadge(rule.Target)}</TableCell>
                      <TableCell>{rule.Protocol}</TableCell>
                      <TableCell>{rule.In || '*'}</TableCell>
                      <TableCell>{rule.Out || '*'}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Source}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Destination}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Options || '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteDialog({ open: true, chain: chain.Name, ruleIndex: index })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">此鏈目前沒有規則</div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* 新增規則對話框 */}
<AddRuleDialog
  isOpen={isAddRuleOpen}
  onClose={() => setIsAddRuleOpen(false)}
  selectedHost={selectedHost}
  selectedChain={selectedChain}
  onAddRule={(newRule: FirewallRule) => {
    // 直接更新防火牆狀態
    setFirewallStatus(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        Chains: prev.Chains.map(c => {
          if (c.Name === selectedChain) {
            const newRules = [...c.Rules, newRule];
            return { ...c, Rules: newRules, Rules_Length: newRules.length };
          }
          return c;
        })
      };
    });
    toast({ title: "成功", description: "規則已新增" });
  }}
/>


      {/* 修改策略確認對話框 */}
      <Dialog open={policyDialog.open} onOpenChange={(open) => setPolicyDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>確認修改策略</DialogTitle></DialogHeader>
          <div className="py-4">
            是否將 <span className="font-medium">{policyDialog.chain}</span> 鏈的預設策略修改為 <span className="font-medium">{policyDialog.newPolicy}</span>？
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPolicyDialog(prev => ({ ...prev, open: false }))}>取消</Button>
            <Button onClick={confirmUpdatePolicy}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除規則確認對話框 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>確認刪除規則</DialogTitle></DialogHeader>
          <div className="py-4">
            是否要刪除 <span className="font-medium">{deleteDialog.chain}</span> 鏈的第 <span className="font-medium">{deleteDialog.ruleIndex + 1}</span> 條規則？
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, open: false }))}>取消</Button>
            <Button onClick={confirmDeleteRule}>確認</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
