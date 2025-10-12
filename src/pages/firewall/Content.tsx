import { useState, useEffect } from 'react';
import axios from 'axios';
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
import type { DeleteFirewallRuleRequest, GetFirewallResponse, PutFirewallPolicyRequest, PutFirewallStatusRequest, Rule, Target } from './types';

interface Host { uuid: string; hostname: string; }

export const FirewallManager = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState('');
  const [firewallStatus, setFirewallStatus] = useState<GetFirewallResponse | null>(null);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('INPUT');
  const { toast } = useToast();

  const [firewallDialog, setFirewallDialog] = useState({ open: false, newStatus: false });
  const [policyDialog, setPolicyDialog] = useState({ open: false, chain: '', newPolicy: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, chain: '', ruleIndex: -1 });

  // ======== Fetch Hosts ========
const fetchHosts = async () => {
  try {
    const res = await axios.get('/api/firewall/pcs');
    const data = res.data;

    // 安全提取 Pcs，不論伺服器是 data.Pcs 或 data.Data.Pcs
    const pcsObj = data?.Pcs || data?.Data?.Pcs;

    if (!pcsObj || typeof pcsObj !== 'object') {
      console.warn('⚠️ Invalid response structure:', data);
      toast({
        title: 'Error',
        description: 'Invalid host list format',
        variant: 'destructive',
      });
      setHosts([]); // fallback 避免渲染報錯
      return;
    }

    const pcs: Host[] = Object.entries(pcsObj).map(([uuid, hostname]) => ({
      uuid,
      hostname: hostname as string,
    }));

    setHosts(pcs);
    setSelectedHost(pcs[0]?.uuid || '');
  } catch (e) {
    console.error('Fetch hosts error', e);
    toast({
      title: 'Error',
      description: 'Failed to fetch hosts',
      variant: 'destructive',
    });

    const testHosts: Host[] = [
      { uuid: 'host-001', hostname: 'PC-OFFICE-001' },
      { uuid: 'host-002', hostname: 'SERVER-001' },
    ];
    setHosts(testHosts);
    setSelectedHost(testHosts[0]?.uuid || '');
  }
};


  // ======== Fetch Firewall Status ========
  const fetchFirewallStatus = async (uuid: string) => {
    if (!uuid) return;
    try {
      const res = await axios.get('/api/firewall', { data: { Uuid: uuid } });
      const data = res.data;
      setFirewallStatus(data);
      toast({ title: "Success", description: "Firewall status loaded" });
    } catch (e) {
      console.error('Fetch firewall status error', e);
      toast({ title: "Error", description: "Failed to load firewall status", variant: "destructive" });
    }
  };

  // ======== Toggle Firewall Status ========
  const toggleFirewallStatus = async (status: boolean) => {
    if (!selectedHost) return;
    const req: PutFirewallStatusRequest = { Uuid: selectedHost, Status: status ? 'active' : 'inactive' };
    try {
      await axios.put('/api/firewall/status', req);
      setFirewallStatus(prev => prev ? { ...prev, Status: status ? 'active' : 'inactive' } : null);
      toast({ title: "Success", description: `Firewall ${status ? 'enabled' : 'disabled'}` });
    } catch {
      toast({ title: "Error", description: "Failed to update firewall status", variant: "destructive" });
    }
  };

  // ======== Update Policy ========
  const confirmUpdatePolicy = async () => {
    if (!selectedHost) return;
    const req: PutFirewallPolicyRequest = { Uuid: selectedHost, Chain: policyDialog.chain, Policy: policyDialog.newPolicy as Target };
    try {
      await axios.put('/api/firewall/policy', req);
      setFirewallStatus(prev => prev ? {
        ...prev,
        Chains: prev.Chain.map(c => c.Name === policyDialog.chain ? { ...c, Policy: policyDialog.newPolicy as Target } : c)
      } : null);
      toast({ title: "Success", description: "Policy updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update policy", variant: "destructive" });
    } finally { setPolicyDialog(prev => ({ ...prev, open: false })); }
  };

  // ======== Delete Rule ========
  const confirmDeleteRule = async () => {
    if (!selectedHost) return;
    const req: DeleteFirewallRuleRequest = { Uuid: selectedHost, Chain: deleteDialog.chain, RuleId: deleteDialog.ruleIndex };
    try {
      await axios.delete('/api/firewall/rule', { data: req });
      setFirewallStatus(prev => prev ? {
        ...prev,
        Chains: prev.Chain.map(c => c.Name === deleteDialog.chain ? {
          ...c,
          Rules: c.Rules.filter((_, i) => i !== deleteDialog.ruleIndex),
          Rules_Length: c.Rules.length - 1
        } : c)
      } : null);
      toast({ title: "Success", description: "Rule deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete rule", variant: "destructive" });
    } finally { setDeleteDialog({ open: false, chain: '', ruleIndex: -1 }); }
  };

  // ======== Add Rule ========

  useEffect(() => { fetchHosts(); }, []);
  useEffect(() => { if (selectedHost) fetchFirewallStatus(selectedHost); }, [selectedHost]);

  const getStatusBadge = (status: string) => status === 'active'
    ? <Badge className="bg-green-100 text-green-800"><Shield className="w-3 h-3 mr-1" />Enabled</Badge>
    : <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Disabled</Badge>;

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
      {/* 選主機 */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Select Host</span>
            <Select value={selectedHost} onValueChange={setSelectedHost}>
              <SelectTrigger className="w-60"><SelectValue placeholder="Please select host" /></SelectTrigger>
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
              <span className="flex items-center gap-2"><Settings className="w-5 h-5" />Firewall Status</span>
              {getStatusBadge(firewallStatus.Status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium">Firewall Switch</span>
            <Switch
              checked={firewallStatus.Status === 'active'}
              onCheckedChange={(value) => setFirewallDialog({ open: true, newStatus: value })}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={firewallDialog.open} onOpenChange={(open) => setFirewallDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Action</DialogTitle></DialogHeader>
          <div className="py-4">
            Do you want to <span className="font-medium">{firewallDialog.newStatus ? 'enable' : 'disable'}</span> the firewall?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setFirewallDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button style={{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white"
              onClick={() => { toggleFirewallStatus(firewallDialog.newStatus); setFirewallDialog(prev => ({ ...prev, open: false })); }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chains */}
      {firewallStatus?.Status === 'active' && firewallStatus.Chain.map(chain => (
        <Card key={chain.Name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{chain.Name} Chain</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Default Policy:</span>
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
              <span className="text-sm text-gray-600">{chain.Rules_Length} Rules</span>
              <Button size="sm" 
                onClick={() => { setSelectedChain(chain.Name); setIsAddRuleOpen(true); }} 
                style={{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white">
                <Plus className="w-4 h-4" />Add Rule</Button>
            </div>

            {chain.Rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Input Interface</TableHead>
                    <TableHead>Output Interface</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Target Port</TableHead>
                    <TableHead>Operation</TableHead>
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
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
              <div className="text-center py-8 text-gray-500">No rules in this chain</div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* AddRuleDialog */}
      <AddRuleDialog
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        selectedHost={selectedHost}
        selectedChain={selectedChain}
        onAddRule={async (newRule: Rule) => {
          if (!selectedHost) return;
          try {
            const res = await fetch('/api/firewall/rule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ Uuid: selectedHost, Chain: selectedChain, ...newRule })
            });
            const data = await res.json();
            if (res.ok && data.Type === 'OK') {
              setFirewallStatus(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  Chains: prev.Chain.map(c => {
                    if (c.Name === selectedChain) {
                      const newRules = [...c.Rules, newRule];
                      return { ...c, Rules: newRules, Rules_Length: newRules.length };
                    }
                    return c;
                  })
                };
              });
              toast({ title: "Success", description: "Rule added" });
            } else throw new Error(data.Message);
          } catch (e) {
            toast({ title: "Error", description: "Failed to add rule", variant: "destructive" });
          }
        }}
      />

      {/* Policy Dialog */}
      <Dialog open={policyDialog.open} onOpenChange={(open) => setPolicyDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Policy Change</DialogTitle></DialogHeader>
          <div className="py-4">
            Do you want to change <span className="font-medium">{policyDialog.chain}</span> chain default policy to <span className="font-medium">{policyDialog.newPolicy}</span>?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPolicyDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button style = {{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white"
            onClick={confirmUpdatePolicy}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Rule Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Delete Rule</DialogTitle></DialogHeader>
          <div className="py-4">
            Do you want to delete rule <span className="font-medium">{deleteDialog.ruleIndex + 1}</span> from <span className="font-medium">{deleteDialog.chain}</span> chain?
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button style = {{ backgroundColor: '#7B86AA' }} className="hover:opacity-90 text-white"
            onClick={confirmDeleteRule}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
