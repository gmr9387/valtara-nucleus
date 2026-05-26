import { useMyOrganizations } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logAudit } from "@/lib/audit";
import { Link } from "@tanstack/react-router";

export function OrgSwitcher() {
  const orgs = useMyOrganizations();
  const { currentOrgId, setCurrentOrgId } = useOrgStore();
  const current = orgs.data?.find((o) => o.id === currentOrgId) ?? orgs.data?.[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-8 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 text-sm hover:bg-surface-3">
        <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary/15 text-[10px] font-semibold text-primary">
          {current?.name?.[0]?.toUpperCase() ?? "·"}
        </div>
        <span className="max-w-[180px] truncate">{current?.name ?? "Select organization"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Organizations
        </DropdownMenuLabel>
        {orgs.data?.length ? (
          orgs.data.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onClick={async () => {
                setCurrentOrgId(o.id);
                await logAudit({ organization_id: o.id, module: "tenancy", entity_type: "organization", entity_id: o.id, action: "switch_org" });
              }}
              className="flex items-center justify-between"
            >
              <span className="truncate">{o.name}</span>
              {o.id === current?.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">No organizations yet</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/organizations" className="text-sm">Manage organizations</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
