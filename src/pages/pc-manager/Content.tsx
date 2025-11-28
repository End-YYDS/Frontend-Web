import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Computer, Users, Edit2, UserPlus, Trash2 } from 'lucide-react';
import { DataTable } from './data-table';
import type { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { toast } from 'sonner';
import {
  addPc,
  getAllPc,
  getPcgroup,
  type DeletePcGroupRequest,
  type GetPcgroupResponseResult,
  type PcManagerRequest,
  type PostPcgroupRequest,
  type ResponseResult,
} from '@/api/openapi-client';

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
  computerCount: number;
}

export function PCManagerContent() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [groups, setGroups] = useState<ComputerGroup[]>([]);
  const [isAddComputerOpen, setIsAddComputerOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupSelectedComputers, setGroupSelectedComputers] = useState<{ [key: string]: string[] }>(
    {},
  );
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [newComputer, setNewComputer] = useState({ ip: '', password: '', group: '' });
  const [newGroup, setNewGroup] = useState({ name: '', cidr: '' });

  function isValidIpOrIpPort(value: string): boolean {
    const regex =
      /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?::([0-9]{1,5}))?$/;
    const match = value.match(regex);
    if (!match) return false;
    if (!match[1]) return true;
    const port = parseInt(match[1], 10);
    return port >= 0 && port <= 65535;
  }
  function parseIPv4(ip: string): number[] | null {
    const parts = ip.trim().split('.');
    if (parts.length !== 4) return null;
    const nums = parts.map((p) => {
      if (!/^\d+$/.test(p)) return NaN;
      const n = Number(p);
      return n >= 0 && n <= 255 ? n : NaN;
    });
    if (nums.some((n) => Number.isNaN(n))) return null;
    return nums as number[];
  }
  function ipv4ToInt(octets: number[]): number {
    return ((octets[0] << 24) >>> 0) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
  }

  function intToIPv4(n: number): string {
    return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
  }
  function prefixMask(prefix: number): number {
    return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  }

  function validateCIDR(
    cidr: string,
    opts?: { requireAligned?: boolean; allow31?: boolean; allow32?: boolean },
  ): { Ok: true; normalized: string } | { Ok: false; reason: string } {
    const requireAligned = opts?.requireAligned ?? true;
    const allow31 = opts?.allow31 ?? false;
    const allow32 = opts?.allow32 ?? false;

    const m = cidr.trim().match(/^([^/]+)\/(\d{1,2})$/);
    if (!m) return { Ok: false, reason: '格式需為 IPv4/Prefix,例如 192.168.1.0/24' };
    const ipStr = m[1];
    const prefix = Number(m[2]);
    if (prefix < 0 || prefix > 32) {
      return { Ok: false, reason: 'Prefix 需介於 0~32' };
    }
    if (!allow31 && prefix === 31) {
      return { Ok: false, reason: '不允許 /31' };
    }
    if (!allow32 && prefix === 32) {
      return { Ok: false, reason: '不允許 /32' };
    }
    const octets = parseIPv4(ipStr);
    if (!octets) return { Ok: false, reason: 'IPv4 不合法' };
    const ipInt = ipv4ToInt(octets);
    const mask = prefixMask(prefix);
    const network = ipInt & mask;
    const normalized = `${intToIPv4(network)}/${prefix}`;
    if (requireAligned && network !== ipInt) {
      return { Ok: false, reason: 'IP 必須為網路位址(host bits 需為 0)' };
    }

    return { Ok: true, normalized };
  }

  // -------------------- API --------------------
  // 取得所有主機
  const fetchAllComputers = async () => {
    try {
      const res = await getAllPc();
      const data = res.data;
      if (data && data.Pcs && typeof data.Pcs === 'object') {
        const pcs: Computer[] = Object.entries(data.Pcs).map(([uuid, pc]) => ({
          id: uuid,
          name: pc.Hostname,
          ip: pc.Ip,
          status: pc.Status ? 'Online' : 'Offline',
        }));
        setComputers(pcs);
        const raw = await getPcgroup().then((r) => r.data);
        if (raw && raw.Groups && typeof raw.Groups === 'object') {
          setComputers((prev) => applyServerGrouping(raw, prev));
        }
      } else {
        setComputers([]);
      }
    } catch (err) {
      console.error('Fetch all PCs failed:', err);
      setComputers([]);
    }
  };

  const defaultGroupComputers = computers.filter((computer) => !computer.group);

  const addComputerAPI = async (ip: string, password: string): Promise<ResponseResult> => {
    if (!isValidIpOrIpPort(ip)) {
      return { Type: 'Err', Message: 'Invalid IP address or IP:Port format.' };
    }
    const body: PcManagerRequest = { Ip: ip, Password: password };
    try {
      const { data } = await addPc({ body: body });
      return data ?? { Type: 'Err', Message: 'No response from server.' };
    } catch (err) {
      console.error('Add PC API failed:', err);
      return { Type: 'Err', Message: String(err) };
    }
  };

  // -------------------- PC Group --------------------

  const applyServerGrouping = (
    groupsRaw: GetPcgroupResponseResult,
    currentComputers: Computer[],
  ): Computer[] => {
    const uuidToGroup = new Map<string, string>();
    for (const [, item] of Object.entries(groupsRaw.Groups ?? {})) {
      const groupName = item.Groupname;
      for (const k of item.Pcs ?? []) {
        uuidToGroup.set(k, groupName);
      }
    }
    return currentComputers.map((c) => ({
      ...c,
      group: uuidToGroup.get(c.id) ?? undefined,
    }));
  };

  const fetchAllGroups = async () => {
    try {
      const { data } = await getPcgroup();
      if (data && data.Groups && typeof data.Groups === 'object') {
        // data.Groups 是 Record<string, Vxlanid>
        const groupList: ComputerGroup[] = Object.entries(data.Groups).map(([vxlanid, g]) => ({
          id: vxlanid,
          name: g.Groupname,
          computerCount: g.Pcs?.length ?? 0,
        }));
        setGroups(groupList);
        setComputers((prev) => applyServerGrouping(data, prev));
      } else {
        setGroups([]);
        setComputers((prev) => prev.map((c) => ({ ...c, group: undefined })));
      }
    } catch (err) {
      console.error('Fetch all groups failed:', err);
      setGroups([]);
      setComputers((prev) => prev.map((c) => ({ ...c, group: undefined })));
    }
  };

  const deleteGroupAPI = async (vxlanid: string): Promise<ResponseResult> => {
    const body: DeletePcGroupRequest = { Vxlanid: Number(vxlanid) };
    try {
      const { data } = await axios.delete<ResponseResult>('/api/chm/pcgroup', {
        data: body,
        withCredentials: true,
      });
      return data;
    } catch (err) {
      console.error('Delete group API failed:', err);
      return { Type: 'Err', Message: String(err) };
    }
  };
  const fetchAllGroupsRaw = async (): Promise<GetPcgroupResponseResult> => {
    const { data } = await getPcgroup();
    return data ?? { Groups: {}, Length: 0 };
  };

  const patchGroupPcs = async (vxlanid: string, pcs: string[]) => {
    const body = { [vxlanid]: { Pcs: pcs } };
    const { data } = await axios.patch<ResponseResult>('/api/chm/pcgroup', body, {
      withCredentials: true,
    });
    return data;
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [pcResp, groupResp] = await Promise.all([getAllPc(), getPcgroup()]);
        if (cancelled) return;

        const pcs: Computer[] = Object.entries(pcResp.data?.Pcs ?? {}).map(([uuid, pc]) => ({
          id: uuid,
          name: pc.Hostname,
          ip: pc.Ip,
          status: pc.Status ? 'Online' : 'Offline',
        }));

        const groupsList: ComputerGroup[] = Object.entries(groupResp.data?.Groups ?? {}).map(
          ([vxlanid, g]) => ({
            id: vxlanid,
            name: g.Groupname,
            computerCount: g.Pcs?.length ?? 0,
          }),
        );
        setGroups(groupsList);
        if (groupResp.data && groupResp.data.Groups && typeof groupResp.data.Groups === 'object') {
          setComputers(applyServerGrouping(groupResp.data, pcs));
        } else {
          throw new Error('Invalid group data');
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setGroups([]);
          setComputers([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------- Add / Remove PC --------------------
  const handleAddComputer = async () => {
    if (!newComputer.ip || !newComputer.password) return;
    const result = await addComputerAPI(newComputer.ip, newComputer.password);
    if (result.Type === 'Ok') {
      await fetchAllComputers();
      setIsAddComputerOpen(false);
      setNewComputer({ ip: '', password: '', group: '' });
    } else {
      toast.error(`Add PC failed: ${result.Message}`);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const result = await deleteGroupAPI(groupId);
    if (result.Type === 'Ok') {
      setGroups(groups.filter((g) => g.id !== groupId));
      setComputers(
        computers.map((c) =>
          c.group === groups.find((g) => g.id === groupId)?.name ? { ...c, group: undefined } : c,
        ),
      );
    } else {
      toast.error(`Delete group failed: ${result.Message}`);
    }
  };

  const handleAddToGroup = async (computerId: string, groupName: string) => {
    const prev = computers;
    setComputers((p) => p.map((c) => (c.id === computerId ? { ...c, group: groupName } : c)));
    try {
      const raw = await fetchAllGroupsRaw();
      const entry = Object.entries(raw.Groups).find(([, item]) => item.Groupname === groupName);
      if (!entry) throw new Error(`找不到群組：${groupName}`);
      const [vxlanid, groupItem] = entry;
      const currentPcs = groupItem.Pcs ?? [];
      const nextSet = new Set(currentPcs);
      nextSet.add(computerId);
      const nextPcs = Array.from(nextSet);
      const res = await patchGroupPcs(vxlanid, nextPcs);
      if (res.Type !== 'Ok') throw new Error(res.Message || 'PATCH 群組失敗');
      fetchAllGroups();
    } catch (err: any) {
      setComputers(prev);
      toast.error(`加入群組失敗：${err?.message ?? 'unknown error'}`);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.name) return;
    const body: PostPcgroupRequest = {
      Groupname: newGroup.name,
      Cidr: newGroup.cidr,
    };
    try {
      const { data } = await axios.post<ResponseResult>('/api/chm/pcgroup', body);
      if (data.Type === 'Ok') {
        const group: ComputerGroup = {
          id: (groups.length + 1).toString(), // 後端沒有回傳 vxlanid，暫時用長度+1 作為 id
          name: newGroup.name,
          computerCount: 0,
        };
        setGroups((prev) => [...prev, group]);
        setNewGroup({ name: '', cidr: '' });
        setIsAddGroupOpen(false);
      } else {
        toast.error(`Failed to add group: ${data.Message}`);
      }
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Failed to add group due to network error.');
    }
  };

  const handleBulkRemoveFromGroup = async (computerIds: string[], groupName: string) => {
    if (computerIds.length === 0) return;
    const prev = computers;
    setComputers((p) =>
      p.map((c) =>
        computerIds.includes(c.id) && c.group === groupName ? { ...c, group: undefined } : c,
      ),
    );
    try {
      const raw = await fetchAllGroupsRaw();
      const entry = Object.entries(raw.Groups).find(([, item]) => item.Groupname === groupName);
      if (!entry) throw new Error(`找不到群組：${groupName}`);
      const [vxlanid, groupItem] = entry;
      console.log('Computer', computerIds);
      const removeSet = new Set(computerIds);
      const nextPcs = (groupItem.Pcs ?? []).filter((k) => !removeSet.has(k));
      console.log('nextPcs', nextPcs);
      const res = await patchGroupPcs(vxlanid, nextPcs);
      if (res.Type !== 'Ok') throw new Error(res.Message || 'PATCH 群組失敗');
      setGroupSelectedComputers((s) => ({ ...s, [groupName]: [] }));
      fetchAllGroups();
    } catch (err: any) {
      setComputers(prev);
      toast.error(`移除失敗：${err?.message ?? 'unknown error'}`);
    }
  };

  const toggleComputerSelection = (computerId: string, groupName: string) => {
    const currentSelected = groupSelectedComputers[groupName] || [];
    if (currentSelected.includes(computerId)) {
      setGroupSelectedComputers({
        ...groupSelectedComputers,
        [groupName]: currentSelected.filter((id) => id !== computerId),
      });
    } else {
      setGroupSelectedComputers({
        ...groupSelectedComputers,
        [groupName]: [...currentSelected, computerId],
      });
    }
  };

  const toggleAllComputers = (groupName: string, allComputerIds: string[]) => {
    const currentSelected = groupSelectedComputers[groupName] || [];
    if (currentSelected.length === allComputerIds.length) {
      setGroupSelectedComputers({
        ...groupSelectedComputers,
        [groupName]: [],
      });
    } else {
      setGroupSelectedComputers({
        ...groupSelectedComputers,
        [groupName]: allComputerIds,
      });
    }
  };

  const shouldShowDefaultGroup = () =>
    selectedGroupFilter === 'all' || selectedGroupFilter === 'default';

  const getFilteredGroups = () => {
    if (selectedGroupFilter === 'all') return groups;
    if (selectedGroupFilter === 'default') return [];
    return groups.filter((group) => group.name === selectedGroupFilter);
  };

  // Default group columns
  const defaultGroupColumns: ColumnDef<Computer>[] = [
    {
      accessorKey: 'name',
      header: 'Computer Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Computer className='w-4 h-4' />
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const [selectedGroup, setSelectedGroup] = useState<string>('');

        const handleConfirm = () => {
          if (selectedGroup) {
            handleAddToGroup(row.original.id, selectedGroup);
            setSelectedGroup('');
          }
        };

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                style={{ backgroundColor: '#7B86AA' }}
                className='hover:opacity-90 text-white'
              >
                <UserPlus className='w-4 h-4' />
                Add to Group
              </Button>
            </DialogTrigger>
            <DialogContent className='w-[350px] max-w-full' aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Add {row.getValue('name')} to Group</DialogTitle>
              </DialogHeader>
              <div className='flex items-center gap-2 mt-4'>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className='w-48'>
                    <SelectValue placeholder='Choose a group' />
                  </SelectTrigger>
                  <SelectContent className='whitespace-nowrap'>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedGroup}
                  style={{ backgroundColor: '#7B86AA' }}
                  className='hover:opacity-90 text-white'
                >
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  const createGroupColumns = (groupName: string, isEditing: boolean): ColumnDef<Computer>[] => [
    ...(isEditing
      ? [
          {
            id: 'select',
            header: () => (
              <Checkbox
                checked={
                  (groupSelectedComputers[groupName]?.length ?? 0) ===
                  computers.filter((c) => c.group === groupName).length
                }
                onCheckedChange={() =>
                  toggleAllComputers(
                    groupName,
                    computers.filter((c) => c.group === groupName).map((c) => c.id),
                  )
                }
              />
            ),
            cell: ({ row }: any) => (
              <Checkbox
                checked={groupSelectedComputers[groupName]?.includes(row.original.id) || false}
                onCheckedChange={() => toggleComputerSelection(row.original.id, groupName)}
              />
            ),
          },
        ]
      : []),
    {
      accessorKey: 'name',
      header: 'Computer Name',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Computer className='w-4 h-4' />
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            {status}
          </span>
        );
      },
    },
    ...(isEditing
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: any) => (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-red-500 hover:text-red-700 hover:bg-red-50'
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Computer</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {row.getValue('name')} from group "{groupName}
                      "? The computer will be moved back to Default Group.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleBulkRemoveFromGroup([row.original.id], groupName)}
                      className='bg-red-500 hover:bg-red-600'
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ),
          },
        ]
      : []),
  ];
  return (
    <div className='bg-linear-to-br'>
      {/* Main Content */}
      <div className='container mx-auto py-8 px-6'>
        <div className='bg-[#A8AEBD] py-1.5 mb-6'>
          <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>PC Manager</h1>
        </div>
        {/* 系統管理區塊 */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Computer className='w-5 h-5' />
                System Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Computer, Add Group button area */}
              <div className='flex flex-wrap gap-4 mb-4'>
                {/* Add Computer */}
                <Dialog open={isAddComputerOpen} onOpenChange={setIsAddComputerOpen}>
                  <DialogTrigger asChild>
                    <Button
                      style={{ backgroundColor: '#7B86AA' }}
                      className='hover:opacity-90 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Computer
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Add PC</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <label className='text-sm font-medium'>IP Address</label>
                        <Input
                          placeholder='e.g. 192.168.1.1'
                          value={newComputer.ip}
                          onChange={(e) => setNewComputer({ ...newComputer, ip: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Password</label>
                        <Input
                          type='password'
                          value={newComputer.password}
                          onChange={(e) =>
                            setNewComputer({ ...newComputer, password: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>Group (Optional)</label>
                        <Select
                          value={newComputer.group}
                          onValueChange={(value) =>
                            setNewComputer({ ...newComputer, group: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Default Group' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='none'>Default Group</SelectItem>
                            {groups.map((group) => (
                              <SelectItem key={group.id} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' onClick={() => setIsAddComputerOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddComputer}
                          style={{ backgroundColor: '#7B86AA' }}
                          className='hover:opacity-90 text-white'
                        >
                          Add PC
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Group */}
                <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                  <DialogTrigger asChild>
                    <Button
                      style={{ backgroundColor: '#7B86AA' }}
                      className='hover:opacity-90 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                      <DialogTitle>Add Group</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4'>
                      <div>
                        <label className='text-sm font-medium'>Group Name *</label>
                        <Input
                          placeholder='Enter group name'
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className='text-sm font-medium'>NetWork Subnet</label>
                        <Input
                          placeholder='Enter network subnet'
                          value={newGroup.cidr}
                          onChange={(e) => setNewGroup({ ...newGroup, cidr: e.target.value })}
                          onBlur={() => {
                            if (!newGroup.cidr) return;
                            const res = validateCIDR(newGroup.cidr, { requireAligned: false });
                            if (res.Ok) {
                              setNewGroup((g) => ({ ...g, cidr: res.normalized }));
                            } else {
                              toast.error(`CIDR 不合法：${res.reason}`);
                            }
                          }}
                        />
                      </div>
                      <div className='flex justify-end gap-2'>
                        <Button variant='outline' onClick={() => setIsAddGroupOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddGroup}
                          style={{ backgroundColor: '#7B86AA' }}
                          className='hover:opacity-90 text-white'
                        >
                          Add Group
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Group Filter */}
                <div className='flex items-center gap-2'>
                  <label className='text-sm font-medium'>Display Group:</label>
                  <Select value={selectedGroupFilter} onValueChange={setSelectedGroupFilter}>
                    <SelectTrigger className='w-48'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Groups</SelectItem>
                      <SelectItem value='default'>Default Group Only</SelectItem>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Default Group Table */}
          {shouldShowDefaultGroup() && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Computer className='w-5 h-5' />
                  Default Group
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable columns={defaultGroupColumns} data={defaultGroupComputers} />
              </CardContent>
            </Card>
          )}

          {/* Computer Groups */}
          {getFilteredGroups().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='w-5 h-5' />
                  Computer Groups
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {getFilteredGroups().map((group) => {
                  const groupComputers = computers.filter(
                    (computer) => computer.group === group.name,
                  );
                  const isEditing = editingGroup === group.name;
                  const selectedInGroup = groupSelectedComputers[group.name] || []; //FIX: 修正選擇後透過右邊刪除後還存在

                  return (
                    <div key={group.id} className='border rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-slate-800 text-white rounded px-2 py-1 text-sm font-mono'>
                            {groupComputers.length}
                          </div>
                          <div>
                            <h3 className='font-medium'>{group.name}</h3>
                            {/* <p className='text-sm text-slate-600'>{group.description}</p> */}
                          </div>
                        </div>
                        <div className='flex items-center gap-2 mb-2'>
                          {isEditing ? (
                            <div className='flex items-center gap-2 mb-2'>
                              {/* Remove All 按鈕 + 確認框 */}
                              {selectedInGroup.length > 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='text-red-500 hover:text-red-600 hover:bg-red-50'
                                    >
                                      <Trash2 className='w-4 h-4 mr-1' />
                                      Remove All ({selectedInGroup.length})
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Selected Computers</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove {selectedInGroup.length}{' '}
                                        selected computer(s) from "{group.name}"?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          handleBulkRemoveFromGroup(selectedInGroup, group.name);
                                          setGroupSelectedComputers({
                                            ...groupSelectedComputers,
                                            [group.name]: [],
                                          });
                                        }}
                                        className='bg-red-500 hover:bg-red-600'
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {/* Delete Group 按鈕 */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='text-red-500 hover:text-red-600 hover:bg-red-50'
                                  >
                                    Delete Group
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Group "{group.name}"</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this group? All computers will
                                      be moved back to Default Group.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className='bg-red-600 hover:bg-red-700'
                                      onClick={() => {
                                        handleDeleteGroup(group.id);
                                        setGroupSelectedComputers({
                                          ...groupSelectedComputers,
                                          [group.name]: [],
                                        });
                                        if (editingGroup === group.name) setEditingGroup(null);
                                      }}
                                    >
                                      Confirm
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              {/* Edit / Done 按鈕 */}
                              {isEditing && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setEditingGroup(null);
                                    setGroupSelectedComputers({
                                      ...groupSelectedComputers,
                                      [group.name]: [],
                                    });
                                  }}
                                >
                                  Done
                                </Button>
                              )}
                            </div>
                          ) : (
                            // 未編輯模式才顯示 Edit 按鈕
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setEditingGroup(group.name)}
                            >
                              <Edit2 className='w-4 h-4 mr-1' />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      {groupComputers.length > 0 ? (
                        <DataTable
                          columns={createGroupColumns(group.name, isEditing)}
                          data={groupComputers}
                        />
                      ) : (
                        <div className='text-center py-8 text-slate-500'>
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
      </div>
    </div>
  );
}
