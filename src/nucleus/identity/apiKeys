export type ApiKey = {
  key: string;
  organizationId: string;
  scopes: string[];
  createdAt: number;
  revokedAt?: number;
};

export class ApiKeyRegistry {
  private keys: ApiKey[] = [];

  issue(organizationId: string, scopes: string[]): ApiKey {
    const key: ApiKey = {
      key: `vk_${Math.random().toString(36).slice(2)}`,
      organizationId,
      scopes,
      createdAt: Date.now(),
    };
    this.keys.push(key);
    return key;
  }

  revoke(keyValue: string) {
    const key = this.keys.find((k) => k.key === keyValue);
    if (key) {
      key.revokedAt = Date.now();
    }
  }

  validate(keyValue: string, scope: string): boolean {
    const key = this.keys.find((k) => k.key === keyValue);
    if (!key || key.revokedAt) return false;
    return key.scopes.includes(scope);
  }
}
