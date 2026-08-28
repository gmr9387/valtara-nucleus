export type ServiceAccount = {
  id: string;
  organizationId: string;
  name: string;
  scopes: string[];
  createdAt: number;
};

export class ServiceAccountRegistry {
  private accounts: ServiceAccount[] = [];

  create(organizationId: string, name: string, scopes: string[]): ServiceAccount {
    const account: ServiceAccount = {
      id: Math.random().toString(16).slice(2),
      organizationId,
      name,
      scopes,
      createdAt: Date.now(),
    };
    this.accounts.push(account);
    return account;
  }

  list(organizationId: string) {
    return this.accounts.filter((a) => a.organizationId === organizationId);
  }
}
