import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Computer, Users, LogOut, Edit2, UserPlus } from "lucide-react";
import { DataTable } from "./data-table";
import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import type { DeletePcGroupRequest, GetAllPcResponse, GetPcgroupResponse, PostAddPcRequest, PostPcgroupRequest, ResponseResult } from "./types";

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
  const [computers, setComputers] = useState<Computer[]>([]);
  const [groups, setGroups] = useState<ComputerGroup[]>([]);
  const [isAddComputerOpen, setIsAddComputerOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupSelectedComputers, setGroupSelectedComputers] = useState<{ [key: string]: string[] }>({});
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("all");

  const [newComputer, setNewComputer] = useState({ ip: "", password: "", group: "" });
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  // -------------------- API --------------------
  // 取得所有主機
  const fetchAllComputers = async () => {
  try {
    const res = await axios.get<GetAllPcResponse>("/api/chm/pc/all");
    const data = res.data;

    if (data && data.Pcs && typeof data.Pcs === "object") {
      const pcs: Computer[] = Object.entries(data.Pcs).map(([uuid, pc]) => ({
        id: uuid,
        name: pc.Hostname,
        ip: pc.Ip,
        status: "Offline",
      }));
      setComputers(pcs);
    } else {
      // console.warn("data.Pcs is undefined or invalid:", data);
      setComputers([]); // 避免 setComputers(undefined)
    }
  } catch (err) {
    console.error("Fetch all PCs failed:", err);
    setComputers([]); // 保持狀態穩定
  }
};

const defaultGroupComputers = computers.filter((computer) => !computer.group);

  const addComputerAPI = async (ip: string, password: string): Promise<ResponseResult> => {
    const body: PostAddPcRequest = { Ip: ip, Password: password };
    try {
      const { data } = await axios.post<ResponseResult>("/api/chm/pc/add", body);
      return data;
    } catch (err) {
      console.error("Add PC API failed:", err);
      return { Type: "Err", Message: String(err) };
    }
  };


  // -------------------- PC Group --------------------
  const fetchAllGroups = async () => {
    try {
      const { data } = await axios.get<GetPcgroupResponse>("/api/chm/pcgroup");

      if (data && data.Groups && typeof data.Groups === 'object'){
        // data.Groups 是 Record<string, Vxlanid>
        const groupList: ComputerGroup[] = Object.entries(data?.Groups).map(([vxlanid, g]) => ({
          id: vxlanid,
          name: g.Groupname,
          description: "",
          computerCount: g.Pcs?.length ?? 0,
        }));

        setGroups(groupList);
      }
      else {
        setGroups([]);
      }
    } catch (err) {
      console.error("Fetch all groups failed:", err);
      setGroups([]);
    }
  };

  
  const deleteGroupAPI = async (vxlanid: string): Promise<ResponseResult> => {
    const body: DeletePcGroupRequest = { Vxlanid: Number(vxlanid) };
    try {
      const { data } = await axios.delete<ResponseResult>("/api/chm/pcgroup", { data: body });
      return data;
    } catch (err) {
      console.error("Delete group API failed:", err);
      return { Type: "Err", Message: String(err) };
    }
  };

  // -------------------- Init --------------------
  useEffect(() => {
    fetchAllComputers();
    fetchAllGroups();
  }, []);

  // -------------------- Add / Remove PC --------------------
  const handleAddComputer = async () => {
    if (!newComputer.ip || !newComputer.password) return;
    const result = await addComputerAPI(newComputer.ip, newComputer.password);
    if (result.Type === "Ok") {
      await fetchAllComputers();
      setIsAddComputerOpen(false);
      setNewComputer({ ip: "", password: "", group: "" });
    } else {
      alert(`Add PC failed: ${result.Message}`);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const result = await deleteGroupAPI(groupId);
    if (result.Type === "Ok") {
      setGroups(groups.filter((g) => g.id !== groupId));
      setComputers(
        computers.map((c) =>
          c.group === groups.find((g) => g.id === groupId)?.name ? { ...c, group: undefined } : c
        )
      );
    } else {
      alert(`Delete group failed: ${result.Message}`);
    }
  };

  const handleAddToGroup = async (computerId: string, groupName: string) => {
    try {
      const targetComputer = computers.find((c) => c.id === computerId);
      if (!targetComputer) return;

      const { data } = await axios.patch("/api/chm/pcgroup", {
        [groupName]: { Pcs: [targetComputer.name] },
      });

      if (data.Type === "OK") {
        setComputers((prev) =>
          prev.map((computer) =>
            computer.id === computerId ? { ...computer, group: groupName } : computer
          )
        );
      } else {
        alert(`Failed to add to group: ${data.Message}`);
      }
    } catch (error) {
      console.error("Error adding to group:", error);
      alert("Failed to add computer to group due to network error.");
    }
  };

const handleAddGroup = async () => {
    if (!newGroup.name) return;
    const body: PostPcgroupRequest = {
      Groupname: newGroup.name,
      Describe: newGroup.description,
    };
    try {
      const { data } = await axios.post<ResponseResult>("/api/chm/pcgroup", body);

      if (data.Type === "Ok") {
        const group: ComputerGroup = {
          id: (groups.length + 1).toString(),
          name: newGroup.name,
          description: newGroup.description,
          computerCount: 0,
        };
        setGroups((prev) => [...prev, group]);
        setNewGroup({ name: "", description: "" });
        setIsAddGroupOpen(false);
      } else {
        alert(`Failed to add group: ${data.Message}`);
      }
    } catch (error) {
      console.error("Error adding group:", error);
      alert("Failed to add group due to network error.");
    }
  };

  const handleRemoveFromGroup = (computerId: string, groupName: string) => {
    setComputers(
      computers.map((computer) =>
        computer.id === computerId && computer.group === groupName
          ? { ...computer, group: undefined }
          : computer
      )
    );
  };

  const handleBulkRemoveFromGroup = (computerIds: string[], groupName: string) => {
    setComputers(
      computers.map((computer) =>
        computerIds.includes(computer.id) && computer.group === groupName
          ? { ...computer, group: undefined }
          : computer
      )
    );
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

  const shouldShowDefaultGroup = () => selectedGroupFilter === "all" || selectedGroupFilter === "default";
  
  const getFilteredGroups = () => {
    if (selectedGroupFilter === "all") return groups;
    if (selectedGroupFilter === "default") return [];
    return groups.filter((group) => group.name === selectedGroupFilter);
  };

  // Default group columns
  const defaultGroupColumns: ColumnDef<Computer>[] = [
    {
      accessorKey: "name",
      header: "Computer Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Computer className="w-4 h-4" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "ip",
      header: "IP Address",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
            status === 'Online'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const [selectedGroup, setSelectedGroup] = useState<string>("");

        const handleConfirm = () => {
          if (selectedGroup) {
            handleAddToGroup(row.original.id, selectedGroup);
            setSelectedGroup("");
          }
        };

        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button style={{ backgroundColor: '#7B86AA' }}
                      className="hover:opacity-90 text-white">
                <UserPlus className="w-4 h-4" />
                Add to Group
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[350px] max-w-full">
              <DialogHeader>
                <DialogTitle>Add {row.getValue("name")} to Group</DialogTitle>
              </DialogHeader>

              <div className="flex items-center gap-2 mt-4">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent className="whitespace-nowrap">
                    {groups.map(group => (
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
                  className="hover:opacity-90 text-white"
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
  ...(isEditing ? [{
    id: "select",
    header: () => (
      <Checkbox
        checked={(groupSelectedComputers[groupName]?.length ?? 0) === computers.filter(c => c.group === groupName).length}
        onCheckedChange={() => toggleAllComputers(groupName, computers.filter(c => c.group === groupName).map(c => c.id))}
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        checked={groupSelectedComputers[groupName]?.includes(row.original.id) || false}
        onCheckedChange={() => toggleComputerSelection(row.original.id, groupName)}
      />
    ),
  }] : []),
  {
    accessorKey: "name",
    header: "Computer Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Computer className="w-4 h-4" />
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP Address",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          status === 'Online'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          {status}
        </span>
      );
    },
  },
  ...(isEditing ? [{
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-3 h-3" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Computer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {row.getValue("name")} from group "{groupName}"? The computer will be moved back to Default Group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemoveFromGroup(row.original.id, groupName)}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  }] : []),
];



  return (
    <div className="bg-linear-to-br">   

      {/* Main Content */}
      <div className="container mx-auto py-8 px-6">
        <div className='bg-[#A8AEBD] py-1.5 mb-6'>
        <h1 className='text-4xl font-extrabold text-center text-[#E6E6E6]'>PC Manager</h1>
      </div>
      {/* 系統管理區塊 */}
      <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Computer className="w-5 h-5" />
            System Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Computer, Add Group button area */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Add Computer */}
            <Dialog open={isAddComputerOpen} onOpenChange={setIsAddComputerOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#7B86AA' }}
                  className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Computer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add PC</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">IP Address</label>
                    <Input
                      placeholder="e.g. 192.168.1.1"
                      value={newComputer.ip}
                      onChange={(e) => setNewComputer({...newComputer, ip: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={newComputer.password}
                      onChange={(e) => setNewComputer({...newComputer, password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Group (Optional)</label>
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
                      Cancel
                    </Button>
                    <Button onClick={handleAddComputer} 
                    style={{ backgroundColor: '#7B86AA' }}
                    className="hover:opacity-90 text-white">
                    Add PC
                  </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Group */}
            <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
              <DialogTrigger asChild>
                <Button style={{ backgroundColor: '#7B86AA' }}
                  className="hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Group Name *</label>
                    <Input
                      placeholder="Enter group name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Enter group description (optional)"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddGroupOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGroup} style={{ backgroundColor: '#7B86AA' }}
                  className="hover:opacity-90 text-white">
                      Add Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Group Filter */}
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

          {/* <p className="text-sm text-slate-600">{defaultGroupComputers.length} computer(s) in default group</p> */}
        </CardContent>
      </Card>

      {/* Default Group Table */}
      {shouldShowDefaultGroup() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Computer className="w-5 h-5" />
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
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Computer Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getFilteredGroups().map(group => {
            const groupComputers = computers.filter(computer => computer.group === group.name);
            const isEditing = editingGroup === group.name;
            const selectedInGroup = groupSelectedComputers[group.name] || [];

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
                  <div className="flex items-center gap-2 mb-2">
            {isEditing ? (
              <div className="flex items-center gap-2 mb-2">
            {/* Remove All 按鈕 + 確認框 */}
            {selectedInGroup.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Remove All ({selectedInGroup.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Selected Computers</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {selectedInGroup.length} selected computer(s) from "{group.name}"?
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
                      className="bg-red-500 hover:bg-red-600"
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
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Delete Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Group "{group.name}"</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this group? All computers will be moved back to Default Group.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
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
            {isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingGroup(null);
                  setGroupSelectedComputers({ ...groupSelectedComputers, [group.name]: [] });
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGroup(group.name)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            </div>
            ) : (
              // 未編輯模式才顯示 Edit 按鈕
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingGroup(group.name)}
              >
                <Edit2 className="w-4 h-4 mr-1" />
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
    </div>
    </div>
  );
}