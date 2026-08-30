// src/nucleus/identity/scimProvider.ts
// Full file — SCIM skeleton (future provisioning)

export type ScimUser = {
  id: string;
  userName: string;
  active: boolean;
  roles: string[];
};

export type ScimGroup = {
  id: string;
  displayName: string;
  members: string[];
};

export class ScimProvider {
  private users: ScimUser[] = [];
  private groups: ScimGroup[] = [];

  addUser(user: ScimUser) {
    this.users.push(user);
  }

  addGroup(group: ScimGroup) {
    this.groups.push(group);
  }

  getUsers() {
    return [...this.users];
  }

  getGroups() {
    return [...this.groups];
  }
}
