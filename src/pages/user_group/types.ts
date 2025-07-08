export interface User {
  id: number;
  username: string;
  groups: string[];
  homeDirectory: string;
  shell: string;
}

export interface Group {
  id: number;
  name: string;
  users: string[];
}