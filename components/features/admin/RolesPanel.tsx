"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Lock,
  Calendar,
} from "lucide-react";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/table";
import {
  Modal,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";

import type { Role } from "@/types/database";

const PROTECTED_SLUGS = ["admin", "instructor", "student"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchRoles(): Promise<Role[]> {
  const res = await fetch("/api/admin/roles");
  if (!res.ok) throw new Error("Failed to load roles");
  const json = await res.json();
  return json.data.roles;
}

async function createRole(payload: {
  name: string;
  slug: string;
  description: string | null;
}): Promise<Role> {
  const res = await fetch("/api/admin/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to create role");
  }
  const json = await res.json();
  return json.data.role;
}

async function updateRole(
  roleId: string,
  payload: { name?: string; slug?: string; description?: string | null },
): Promise<Role> {
  const res = await fetch(`/api/admin/roles/${roleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update role");
  }
  const json = await res.json();
  return json.data.role;
}

async function deleteRole(roleId: string): Promise<void> {
  const res = await fetch(`/api/admin/roles/${roleId}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to delete role");
  }
}

// ─── Role Form Modal ─────────────────────────────────────────────────────────

interface RoleFormProps {
  role?: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function RoleFormModal({ role, open, onOpenChange, onSaved }: RoleFormProps) {
  const isEdit = !!role;
  const isProtected = role ? PROTECTED_SLUGS.includes(role.slug) : false;

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Sync form state when role changes
  React.useEffect(() => {
    if (open) {
      setName(role?.name ?? "");
      setSlug(role?.slug ?? "");
      setDescription(role?.description ?? "");
    }
  }, [role, open]);

  // Auto-generate slug from name for new roles
  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) {
      setSlug(
        value
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9_-]/g, ""),
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && role) {
        await updateRole(role.id, {
          name: name.trim(),
          ...(isProtected ? {} : { slug: slug.trim() }),
          description: description.trim() || null,
        });
        toast.success("Role updated successfully.");
      } else {
        await createRole({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
        });
        toast.success("Role created successfully.");
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "New Role"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the role details below."
              : "Fill in the details to create a new role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              placeholder="e.g. Content Manager"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-slug">
              Slug
              {isProtected && (
                <span className="ml-2 text-xs text-brand-orange font-medium">
                  (protected — cannot be changed)
                </span>
              )}
            </Label>
            <Input
              id="role-slug"
              placeholder="e.g. content-manager"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={isProtected}
              required
              className={isProtected ? "opacity-60 cursor-not-allowed" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">
              Description{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="role-description"
              placeholder="Brief description of this role's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteConfirmProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function DeleteRoleModal({
  role,
  open,
  onOpenChange,
  onDeleted,
}: DeleteConfirmProps) {
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    if (!role) return;
    setDeleting(true);
    try {
      await deleteRole(role.id);
      toast.success(`Role "${role.name}" deleted.`);
      onDeleted();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Role</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the role{" "}
            <strong className="text-primary">{role?.name}</strong>? This action
            cannot be undone. If the role is assigned to users, deletion will
            fail.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function RolesTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function RolesEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
        <ShieldCheck className="size-8 text-accent" />
      </div>
      <p className="text-lg font-semibold text-primary tracking-tight">
        No roles found
      </p>
      <p className="mt-1 text-sm text-slate-500 max-w-xs">
        Create your first role to start managing user permissions across the
        platform.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="size-4" />
        Create Role
      </Button>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function RolesPanel() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modal states
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingRole, setDeletingRole] = React.useState<Role | null>(null);

  const loadRoles = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch {
      toast.error("Could not load roles.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  function handleCreate() {
    setEditingRole(null);
    setFormOpen(true);
  }

  function handleEdit(role: Role) {
    setEditingRole(role);
    setFormOpen(true);
  }

  function handleDeleteClick(role: Role) {
    setDeletingRole(role);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level="h3" as="h1">
            Roles
          </Title>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Manage platform roles and their permissions. Built-in roles (admin,
            instructor, student) are protected.
          </p>
        </div>
        <Button onClick={handleCreate} className="shrink-0 self-start sm:self-auto">
          <Plus className="size-4" />
          New Role
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <RolesTableSkeleton />
      ) : roles.length === 0 ? (
        <RolesEmpty onCreateClick={handleCreate} />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Description
                </TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => {
                const isProtected = PROTECTED_SLUGS.includes(role.slug);
                return (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                          <ShieldCheck className="size-4 text-accent" />
                        </div>
                        <span className="font-semibold text-primary tracking-tight">
                          {role.name}
                        </span>
                        {isProtected && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Lock className="size-3.5 text-brand-orange" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Built-in role — slug cannot be changed or deleted
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{role.slug}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-slate-500 text-sm line-clamp-1 max-w-xs">
                        {role.description || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Calendar className="size-3.5" />
                        {formatDate(role.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEdit(role)}
                              aria-label={`Edit ${role.name}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        {!isProtected && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleDeleteClick(role)}
                                aria-label={`Delete ${role.name}`}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <RoleFormModal
        role={editingRole}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadRoles}
      />
      <DeleteRoleModal
        role={deletingRole}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={loadRoles}
      />
    </div>
  );
}
