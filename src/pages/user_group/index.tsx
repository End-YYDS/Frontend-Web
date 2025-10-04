import { useState, useEffect } from "react";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./UserManagement";
import { GroupManagement } from "./GroupManagement";
import type { User, Group, CreateUserRequest, PatchUser, CreateGroupRequest, PatchGroup } from "./types";
import { type PageMeta } from "@/types";

const UserGroup = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const itemsPerPage = 10;

  // --------------- Fetch Data -----------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get<{ Users: User[] }>("/api/chm/user", { withCredentials: true });
      setUsers(res.data.Users || []);
    } catch (err) {
      toast("Failed to fetch user data.",);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get<{ Groups: Group[] }>("/api/chm/group", { withCredentials: true });
      setGroups(res.data.Groups || []);
    } catch (err) {
      toast("Failed to fetch group data.",);
    }
  };


  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  // --------------- Filtered & Pagination -----------------
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.groups.some((group) =>
        group.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(
    (activeTab === "users" ? filteredUsers.length : filteredGroups.length) / itemsPerPage
  );

  // ------------------- User CRUD --------------------
  const handleAddUser = async (user: Omit<User, "id">) => {
    try {
      const req: CreateUserRequest = {
        username: user.username,
        groups: user.groups,
        homeDirectory: user.homeDirectory,
        shell: user.shell,
      };
      const res = await axios.post<{ id: number }>("/api/chm/user", req, { withCredentials: true });
      setUsers((prev) => [...prev, { ...user, id: Number(res.data.id) }]);
      toast("User has been added.");
      fetchGroups(); // 更新群組成員
    } catch {
      toast("Failed to add user.");
    }
  };

  const handleUpdateUser = async (id: number, user: Omit<User, "id">) => {
    try {
      const patch: PatchUser = {
        username: user.username,
        groups: user.groups,
        homeDirectory: user.homeDirectory,
        shell: user.shell,
      };
      await axios.patch(`/api/chm/user`, { [id]: patch }, { withCredentials: true });
      setUsers((prev) =>
        prev.map((u) => (u.id === Number(id) ? { ...u, ...user } : u))
      );
      toast("User has been updated.");
      fetchGroups();
    } catch {
      toast("Failed to update user.");
    }
  };

  const handleDeleteUser = async (id: number) => {
      try {
        await axios.delete("/api/chm/user", { data: { uid: id.toString() }, withCredentials: true });
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast("User has been deleted.");
        fetchGroups();
      } catch {
        toast("Failed to delete user.");
      }
    };

  // ------------------- Group CRUD --------------------
  const handleAddGroup = async (group: Omit<Group, "id">) => {
    try {
      const req: CreateGroupRequest = {
        name: group.name,
        users: group.users,
      };
      const res = await axios.post<{ id: number }>("/api/chm/group", req, { withCredentials: true });
      setGroups((prev) => [...prev, { ...group, id: Number(res.data.id) }]);
      toast("Group has been added.");
    } catch {
      toast("Failed to add group.");
    }
  };

  const handleUpdateGroup = async (id: number, group: Omit<Group, "id">) => {
    try {
      const patch: PatchGroup = {
        name: group.name,
        users: group.users,
      };
      await axios.patch("/api/chm/group", { [id]: patch }, { withCredentials: true });
      setGroups((prev) =>
        prev.map((g) => (g.id === Number(id) ? { ...g, ...group } : g))
      );
      toast("Group has been updated.");
    } catch {
      toast("Failed to update group.");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await axios.delete("/api/chm/group", { data: { gid: id }, withCredentials: true });
      setGroups((prev) => prev.filter((g) => g.id !== Number(id)));
      toast("Group has been deleted.");
    } catch {
      toast("Failed to delete group.");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-1.5 mb-6">
        <h1 className="text-4xl font-extrabold text-center text-[#E6E6E6]">
          User & Group
        </h1>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as "users" | "groups");
          setCurrentPage(1);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User</TabsTrigger>
          <TabsTrigger value="groups">Group</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            groups={groups}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage} onDeleteSelectedUsers={(ids: number[]): void => {
              // Implement functionality for deleting selected users
              ids.forEach((id) => handleDeleteUser(id));
            }} onCreateGroup={() => {
              toast("Create group functionality is not implemented yet.");
            }}          />
          {filteredUsers.length > itemsPerPage && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupManagement
            groups={groups}
            users={users}
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          {filteredGroups.length > itemsPerPage && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ---------------- Pagination ----------------
const PaginationBar = ({
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) => (
  <div className="mt-4 flex justify-center">
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i + 1}>
            <PaginationLink
              onClick={() => setCurrentPage(i + 1)}
              isActive={currentPage === i + 1}
              className="cursor-pointer"
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
);

(UserGroup as any).meta = {
  requiresAuth: false,
  layout: true,
} satisfies PageMeta;

export default UserGroup;
