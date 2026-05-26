import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useEnvironments, useProjects } from "@/lib/queries";
import { useOrgStore } from "@/lib/org-store";
import { PageHeader, PageBody, EmptyState, StatusDot } from "@/components/platform-ui";
import { Field, Th, Td, FieldStyles } from "./_app.organizations";
import { logAudit } from "@/lib/audit";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_app/environments")({ component: EnvsPage });

const schema = z.object({
  project_id: z.string().uuid(),
  name: z.string().min(1).max(60),
  env_type: z.enum(["development", "staging", "production"]),
});

function EnvsPage() {
  const { currentOrgId } = useOrgStore();
  const { user } = useAuth();
  const envs = useEnvironments(currentOrgId);
  const projects = useProjects(currentOrgId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [envType, setEnvType] = useState<"development" | "staging" | "production">("development");

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({ project_id: projectId, name, env_type: envType });
      const { data, error } = await supabase.from("environments").insert({
        project_id: parsed.project_id, name: parsed.name, env_type: parsed.env_type, created_by: user!.id,
      }).select().single();
      if (error) throw error;
      await logAudit({ organization_id: currentOrgId, module: "tenancy", entity_type: "environment", entity_id: data.id, action: "create", after: data });
      return data;
    },
    onSuccess: () => {
      toast.success("Environment created");
      setName(""); setProjectId(""); setOpen(false);
      qc.invalidateQueries({ queryKey: ["envs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        eyebrow="TENANCY"
        title="Environments"
        description="Isolated runtime targets per project: development, staging, production."
        actions={
          <button onClick={() => setOpen((v) => !v)} disabled={!projects.data?.length}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> New environment
          </button>
        }
      />
      <PageBody>
        {open && (
          <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="mb-6 rounded-lg border border-border bg-surface-1 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Field label="Project">
                <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
                  <option value="">Select project…</option>
                  {projects.data?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Name">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
              </Field>
              <Field label="Type">
                <select className="input" value={envType} onChange={(e) => setEnvType(e.target.value as typeof envType)}>
                  <option value="development">development</option>
                  <option value="staging">staging</option>
                  <option value="production">production</option>
                </select>
              </Field>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-md border border-border bg-surface-2 px-3 text-sm hover:bg-surface-3">Cancel</button>
              <button type="submit" disabled={create.isPending} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                {create.isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        )}

        {envs.data?.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-1 text-mono-xs text-muted-foreground">
                <tr><Th>Project</Th><Th>Name</Th><Th>Type</Th><Th>Created</Th></tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-1/40">
                {envs.data.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-2/60">
                    <Td><span className="font-medium">{e.project_name}</span></Td>
                    <Td><span className="font-mono text-xs">{e.name}</span></Td>
                    <Td><span className="inline-flex items-center gap-1.5"><StatusDot status={e.env_type} /><span className="capitalize">{e.env_type}</span></span></Td>
                    <Td><span className="text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No environments yet" description={projects.data?.length ? "Create one for an existing project." : "Create a project first."} />
        )}
        <FieldStyles />
      </PageBody>
    </>
  );
}
