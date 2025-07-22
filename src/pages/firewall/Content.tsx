
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

interface Host {
  uuid: string;
  hostname: string;
}

interface FirewallRule {
  Target: string;
  Protocol: string;
  In: string;
  Out: string;
  Source: string;
  Destination: string;
  Options: string;
}

interface FirewallChain {
  Name: string;
  Policy: string;
  Rules: FirewallRule[];
  Rules_Length: number;
}

interface FirewallStatus {
  Status: string;
  Chains: FirewallChain[];
}

export const FirewallManager = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHost, setSelectedHost] = useState<string>('');
  const [firewallStatus, setFirewallStatus] = useState<FirewallStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>('INPUT');
  const { toast } = useToast();

  // 取得所有主機
  const fetchHosts = async () => {
    try {
      console.log('正在取得主機列表...');
      // 測試數據
      const testHosts = [
        { uuid: 'host-001', hostname: 'PC-OFFICE-001' },
        { uuid: 'host-002', hostname: 'PC-OFFICE-002' },
        { uuid: 'host-003', hostname: 'SERVER-001' },
        { uuid: 'host-004', hostname: 'LAPTOP-DEV-001' },
        { uuid: 'host-005', hostname: 'GATEWAY-001' }
      ];
      setHosts(testHosts);
      setSelectedHost(testHosts[0]?.uuid || '');
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法取得主機列表",
        variant: "destructive",
      });
    }
  };

  // 取得防火牆狀態
  const fetchFirewallStatus = async (uuid: string) => {
    if (!uuid) return;
    
    setIsLoading(true);
    try {
      console.log(`正在取得主機 ${uuid} 的防火牆狀態...`);
      
      // 測試數據
      const testStatus: FirewallStatus = {
        Status: 'active',
        Chains: [
          {
            Name: 'INPUT',
            Policy: 'DROP',
            Rules: [
              {
                Target: 'ACCEPT',
                Protocol: 'tcp',
                In: 'lo',
                Out: '*',
                Source: '0.0.0.0/0',
                Destination: '0.0.0.0/0',
                Options: ''
              },
              {
                Target: 'ACCEPT',
                Protocol: 'tcp',
                In: 'eth0',
                Out: '*',
                Source: '0.0.0.0/0',
                Destination: '0.0.0.0/0',
                Options: 'tcp dpt:22'
              },
              {
                Target: 'DROP',
                Protocol: 'tcp',
                In: 'eth0',
                Out: '*',
                Source: '192.168.1.100',
                Destination: '0.0.0.0/0',
                Options: 'tcp dpt:22'
              }
            ],
            Rules_Length: 3
          },
          {
            Name: 'FORWARD',
            Policy: 'DROP',
            Rules: [],
            Rules_Length: 0
          },
          {
            Name: 'OUTPUT',
            Policy: 'ACCEPT',
            Rules: [
              {
                Target: 'ACCEPT',
                Protocol: 'all',
                In: '*',
                Out: 'eth0',
                Source: '0.0.0.0/0',
                Destination: '0.0.0.0/0',
                Options: ''
              }
            ],
            Rules_Length: 1
          }
        ]
      };
      
      setFirewallStatus(testStatus);
      
      toast({
        title: "成功",
        description: "已載入防火牆狀態",
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法取得防火牆狀態",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 切換防火牆狀態
  const toggleFirewallStatus = async (status: boolean) => {
    if (!selectedHost) return;
    
    try {
      const newStatus = status ? 'active' : 'inactive';
      console.log(`正在修改防火牆狀態為: ${newStatus}`);
      
      // 模擬 API 呼叫
      setFirewallStatus(prev => prev ? { ...prev, Status: newStatus } : null);
      
      toast({
        title: "成功",
        description: `防火牆已${status ? '啟用' : '停用'}`,
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法修改防火牆狀態",
        variant: "destructive",
      });
    }
  };

  // 修改預設策略
  const updatePolicy = async (chain: string, policy: string) => {
    if (!selectedHost) return;
    
    try {
      console.log(`正在修改 ${chain} 鏈的預設策略為: ${policy}`);
      
      // 模擬 API 呼叫
      setFirewallStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          Chains: prev.Chains.map(c => 
            c.Name === chain ? { ...c, Policy: policy } : c
          )
        };
      });
      
      toast({
        title: "成功",
        description: `${chain} 鏈的預設策略已更新`,
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法更新預設策略",
        variant: "destructive",
      });
    }
  };

  // 刪除規則
  const deleteRule = async (chain: string, ruleIndex: number) => {
    if (!selectedHost) return;
    
    try {
      console.log(`正在刪除 ${chain} 鏈的規則 ${ruleIndex}`);
      
      // 模擬 API 呼叫
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
      
      toast({
        title: "成功",
        description: "規則已刪除",
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法刪除規則",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  useEffect(() => {
    if (selectedHost) {
      fetchFirewallStatus(selectedHost);
    }
  }, [selectedHost]);

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">
        <Shield className="w-3 h-3 mr-1" />
        啟用
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        停用
      </Badge>
    );
  };

  const getPolicyBadge = (policy: string) => {
    const colors = {
      ACCEPT: 'bg-green-100 text-green-800',
      DROP: 'bg-red-100 text-red-800',
      REJECT: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[policy as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {policy}
      </Badge>
    );
  };

  const getTargetBadge = (target: string) => {
    const colors = {
      ACCEPT: 'bg-green-100 text-green-800',
      DROP: 'bg-red-100 text-red-800',
      REJECT: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge variant="outline" className={colors[target as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {target}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 主機選擇 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            主機選擇
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedHost} onValueChange={setSelectedHost}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇主機" />
                </SelectTrigger>
                <SelectContent>
                  {hosts.map((host) => (
                    <SelectItem key={host.uuid} value={host.uuid}>
                      {host.hostname} ({host.uuid})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => selectedHost && fetchFirewallStatus(selectedHost)}
              disabled={!selectedHost || isLoading}
            >
              重新載入
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 防火牆狀態 */}
      {firewallStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                防火牆狀態
              </span>
              {getStatusBadge(firewallStatus.Status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">防火牆開關</span>
              <Switch
                checked={firewallStatus.Status === 'active'}
                onCheckedChange={toggleFirewallStatus}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 防火牆鏈規則 - 只有在防火牆啟用時才顯示 */}
      {firewallStatus?.Status === 'active' && firewallStatus?.Chains.map((chain) => (
        <Card key={chain.Name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{chain.Name} 鏈</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">預設策略:</span>
                {getPolicyBadge(chain.Policy)}
                <Select 
                  value={chain.Policy} 
                  onValueChange={(value) => updatePolicy(chain.Name, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
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
              <span className="text-sm text-gray-600">
                共 {chain.Rules_Length} 條規則
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedChain(chain.Name);
                  setIsAddRuleOpen(true);
                }}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                新增規則
              </Button>
            </div>
            
            {chain.Rules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>動作</TableHead>
                    <TableHead>協定</TableHead>
                    <TableHead>輸入介面</TableHead>
                    <TableHead>輸出介面</TableHead>
                    <TableHead>來源</TableHead>
                    <TableHead>目標</TableHead>
                    <TableHead>選項</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chain.Rules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{getTargetBadge(rule.Target)}</TableCell>
                      <TableCell>{rule.Protocol}</TableCell>
                      <TableCell>{rule.In || '*'}</TableCell>
                      <TableCell>{rule.Out || '*'}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Source}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Destination}</TableCell>
                      <TableCell className="max-w-32 truncate">{rule.Options || '-'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteRule(chain.Name, index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                此鏈目前沒有規則
              </div>
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
        onRuleAdded={() => {
          setIsAddRuleOpen(false);
          if (selectedHost) {
            fetchFirewallStatus(selectedHost);
          }
        }}
      />
    </div>
  );
};