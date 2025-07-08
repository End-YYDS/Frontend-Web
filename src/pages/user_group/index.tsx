"use client";

import { useState } from "react";
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
import type { User, Group } from "./types";

const UserGroup = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: "user1",
      groups: ["group1"],
      homeDirectory: "/root",
      shell: "/usr/sbin/nologin",
    },
    {
      id: 2,
      username: "user2",
      groups: ["group1", "group2"],
      homeDirectory: "/bin",
      shell: "/usr/sbin/nologin",
    },
    {
      id: 3,
      username: "user3",
      groups: ["group2"],
      homeDirectory: "/bin",
      shell: "/usr/sbin/nologin",
    },
  ]);

  const [groups, setGroups] = useState<Group[]>([
    {
      id: 1,
      name: "group1",
      users: ["user1", "user2"],
    },
    {
      id: 2,
      name: "group2",
      users: ["user2", "user3"],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const itemsPerPage = 10;

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
    (activeTab === "users" ? filteredUsers.length : filteredGroups.length) /
      itemsPerPage
  );

  const handleAddUser = (user: Omit<User, "id">) => {
    const newUser: User = { id: Date.now(), ...user };
    setUsers((prev) => [...prev, newUser]);
    setGroups((prev) =>
      prev.map((group) =>
        user.groups.includes(group.name)
          ? { ...group, users: [...group.users, user.username] }
          : group
      )
    );
    toast("使用者已新增");
  };

  const handleUpdateUser = (id: number, user: Omit<User, "id">) => {
    const oldUser = users.find((u) => u.id === id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...user } : u))
    );
    if (oldUser) {
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          users: group.users
            .filter((username) => username !== oldUser.username)
            .concat(user.groups.includes(group.name) ? [user.username] : []),
        }))
      );
    }
    toast("使用者資訊已更新");
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          users: group.users.filter((username) => username !== user.username),
        }))
      );
      toast("使用者已刪除");
    }
  };

  const handleDeleteSelectedUsers = (userIds: number[]) => {
    const selectedUserObjects = users.filter((user) =>
      userIds.includes(user.id)
    );
    const selectedUsernames = selectedUserObjects.map((u) => u.username);
    setUsers((prev) => prev.filter((u) => !userIds.includes(u.id)));
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        users: group.users.filter(
          (username) => !selectedUsernames.includes(username)
        ),
      }))
    );
    toast("選中的使用者已刪除");
  };

  const handleCreateGroup = (name: string) => {
    const newGroup: Group = { id: Date.now(), name, users: [] };
    setGroups((prev) => [...prev, newGroup]);
    toast("群組已新增");
  };

  const handleAddGroup = (group: Omit<Group, "id">) => {
    const newGroup: Group = { id: Date.now(), ...group };
    setGroups((prev) => [...prev, newGroup]);
    toast("群組已新增");
  };

  const handleUpdateGroup = (id: number, group: Omit<Group, "id">) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...group } : g))
    );
    toast("群組已更新");
  };

  const handleDeleteGroup = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          groups: user.groups.filter((g) => g !== group.name),
        }))
      );
      toast("群組已刪除");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-[#A8AEBD] py-3 mb-3">
        <h1 className="text-2xl font-extrabold text-center text-[#E6E6E6]">
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
        <TabsList className="w-full bg-[#F7F8FA] border-b rounded-b-lg">
          <TabsTrigger
            value="users"
            className="flex w-full font-bold flex-col gap-6 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700"
          >
            使用者
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="flex w-full font-bold flex-col gap-6 data-[state=active]:bg-[#A8AEBD] data-[state=active]:text-white text-gray-700"
          >
            群組
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="bg-white p-4">
          <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onDeleteSelectedUsers={handleDeleteSelectedUsers}
            groups={groups}
            onCreateGroup={handleCreateGroup}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          {filteredUsers.length > itemsPerPage && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </TabsContent>

        <TabsContent value="groups" className="bg-white p-4">
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

// 分頁元件抽出來共用
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

export default UserGroup;
