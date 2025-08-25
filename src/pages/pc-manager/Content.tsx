import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Computer, Users, User, Power } from "lucide-react";

interface Computer {
  id: string;
  name: string;
  ip: string;
  status: 'Online' | 'Offline';
  group?: string;
}

interface ComputerGroup {
  id: string;
  name: string;
  description: string;
  computerCount: number;
}

export function PCManagerContent() {
  const [computers, setComputers] = useState<Computer[]>([
    { id: '1', name: 'PC-1', ip: '192.168.1.101', status: 'Online', group: 'HIII' },
    { id: '2', name: 'PC-2', ip: '192.168.1.102', status: 'Offline' },
    { id: '3', name: 'PC-3', ip: '192.168.1.103', status: 'Online' },
  ]);

  const [groups, setGroups] = useState<ComputerGroup[]>([
    { id: '1', name: 'HIII', description: '主要伺服器群組', computerCount: 1 },
    { id: '2', name: '測試伺服器', description: '開發環境測試用', computerCount: 0 },
  ]);

  const [isAddComputerOpen, setIsAddComputerOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAssignGroupOpen, setIsAssignGroupOpen] = useState(false);
  const [selectedComputers, setSelectedComputers] = useState<string[]>([]);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [assignTargetGroup, setAssignTargetGroup] = useState<string>('');

  const [newComputer, setNewComputer] = useState({
    ip: '',
    password: '',
    group: '',
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
  });

  const defaultGroupComputers = computers.filter(computer => !computer.group);

  const handleShutdown = (computerId: string, computerName: string) => {
    console.log(`Shutting down computer: ${computerName} (ID: ${computerId})`);
    // Update computer status to offline
    setComputers(computers.map(computer => 
      computer.id === computerId 
        ? { ...computer, status: 'Offline' as const }
        : computer
    ));
  };

  const handleAddComputer = () => {
    if (newComputer.ip) {
      const computerName = `PC-${computers.length + 1}`;
      const computer: Computer = {
        id: (computers.length + 1).toString(),
        name: computerName,
        ip: newComputer.ip,
        status: 'Offline',
        group: newComputer.group === 'none' ? undefined : newComputer.group,
      };
      setComputers([...computers, computer]);
      setNewComputer({ ip: '', password: '', group: '' });
      setIsAddComputerOpen(false);
    }
  };

  const handleAddGroup = () => {
    if (newGroup.name) {
      const group: ComputerGroup = {
        id: (groups.length + 1).toString(),
        name: newGroup.name,
        description: newGroup.description,
        computerCount: 0,
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', description: '' });
      setIsAddGroupOpen(false);
    }
  };

  const handleAssignToGroup = () => {
    if (selectedComputers.length > 0 && assignTargetGroup) {
      setComputers(computers.map(computer => {
        if (selectedComputers.includes(computer.id)) {
          return {
            ...computer,
            group: assignTargetGroup === 'default' ? undefined : assignTargetGroup
          };
        }
        return computer;
      }));
      
      // Update group computer counts
      setGroups(groups.map(group => ({
        ...group,
        computerCount: computers.filter(c => 
          selectedComputers.includes(c.id) ? 
          (assignTargetGroup === group.name) : 
          (c.group === group.name)
        ).length
      })));
    }
    
    setIsAssignGroupOpen(false);
    setSelectedComputers([]);
    setAssignTargetGroup('');
  };

  // Filter groups based on selection - always show default group when not filtering by specific group
  const getFilteredGroups = () => {
    if (selectedGroupFilter === 'all') {
      return groups;
    } else if (selectedGroupFilter === 'default') {
      return [];
    } else {
      return groups.filter(group => group.name === selectedGroupFilter);
    }
  };

  const shouldShowDefaultGroup = () => {
    return selectedGroupFilter === 'all' || selectedGroupFilter === 'default' || 
           groups.some(group => group.name === selectedGroupFilter);
  };

  const ShutdownButton = ({ computer }: { computer: Computer }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={computer.status === 'Offline'}
        >
          <Power className="w-3 h-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>確認關機</AlertDialogTitle>
          <AlertDialogDescription>
            您確定要關閉 {computer.name} ({computer.ip}) 嗎？此操作將會關閉電腦。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => handleShutdown(computer.id, computer.name)}
            className="bg-red-600 hover:bg-red-700"
          >
            確定關機
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: '#E6E6E6', backgroundColor: '#A8AEBD' }}
          >
            PC Manager
          </h1>
        </div>
      {/* System Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Computer className="w-5 h-5" />
            System Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Dialog open={isAddComputerOpen} onOpenChange={setIsAddComputerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-800 hover:bg-slate-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Computer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增 PC</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">IP 地址</label>
                    <Input
                      placeholder="例如: 192.168.1.1"
                      value={newComputer.ip}
                      onChange={(e) => setNewComputer({...newComputer, ip: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">密碼</label>
                    <Input
                      type="password"
                      value={newComputer.password}
                      onChange={(e) => setNewComputer({...newComputer, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">群組 (選擇性)</label>
                    <Select value={newComputer.group} onValueChange={(value) => setNewComputer({...newComputer, group: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Default Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Default Group</SelectItem>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddComputerOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddComputer} className="bg-slate-800 hover:bg-slate-700">
                      新增 PC
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增群組</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">群組名稱 *</label>
                    <Input
                      placeholder="輸入群組名稱"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <Textarea
                      placeholder="輸入群組描述 (選填)"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleAddGroup} className="bg-slate-800 hover:bg-slate-700">
                      新增群組
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAssignGroupOpen} onOpenChange={setIsAssignGroupOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Assign to Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>將PC加入群組</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">選擇目標群組</label>
                    <Select value={assignTargetGroup} onValueChange={setAssignTargetGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇群組" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Group</SelectItem>
                        {groups.map(group => (
                          <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">選擇要加入的PC</label>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">選擇</TableHead>
                            <TableHead>名稱</TableHead>
                            <TableHead>IP地址</TableHead>
                            <TableHead>目前群組</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {computers.map(computer => (
                            <TableRow key={computer.id}>
                              <TableCell>
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  checked={selectedComputers.includes(computer.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedComputers([...selectedComputers, computer.id]);
                                    } else {
                                      setSelectedComputers(selectedComputers.filter(id => id !== computer.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>{computer.name}</TableCell>
                              <TableCell>{computer.ip}</TableCell>
                              <TableCell>{computer.group || 'Default Group'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAssignGroupOpen(false)}>
                      取消
                    </Button>
                    <Button 
                      onClick={handleAssignToGroup} 
                      className="bg-slate-800 hover:bg-slate-700"
                      disabled={selectedComputers.length === 0 || !assignTargetGroup}
                    >
                      加入群組 ({selectedComputers.length})
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Group Filter Selection */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Display Group:</label>
              <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="default">Default Group Only</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-slate-600">{defaultGroupComputers.length} computer(s) in default group</p>
        </CardContent>
      </Card>

      {/* Show Default Group when conditions are met */}
      {shouldShowDefaultGroup() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Computer className="w-5 h-5" />
              Default Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Computer Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaultGroupComputers.map(computer => (
                  <TableRow key={computer.id}>
                    <TableCell className="flex items-center gap-2">
                      <Computer className="w-4 h-4" />
                      {computer.name}
                    </TableCell>
                    <TableCell>{computer.ip}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        computer.status === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          computer.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                        {computer.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ShutdownButton computer={computer} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Computer Groups - filtered based on selection */}
      {getFilteredGroups().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Computer Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getFilteredGroups().map(group => {
              const groupComputers = computers.filter(computer => computer.group === group.name);
              return (
                <div key={group.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 text-white rounded px-2 py-1 text-sm font-mono">
                        {groupComputers.length}
                      </div>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-slate-600">{group.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  {groupComputers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Computer Name</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-16">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupComputers.map(computer => (
                          <TableRow key={computer.id}>
                            <TableCell className="flex items-center gap-2">
                              <Computer className="w-4 h-4" />
                              {computer.name}
                            </TableCell>
                            <TableCell>{computer.ip}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                computer.status === 'Online' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  computer.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                                }`} />
                                {computer.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <ShutdownButton computer={computer} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No computers in this group
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}