"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Search,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCircle,
  Shield,
  Mail,
  Phone,
  Calendar,
  MapPin,
  MoreHorizontal,
  UserX,
  UserCheck,
  Pencil,
} from "lucide-react";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/shared/modal";

import type { Profile, Role } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleAssignment {
  role_id: string;
  assigned_at: string;
  roles: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
}

// PostgREST returns `roles_users` as a single object (one-to-one due to
// UNIQUE(user_id) constraint) or as an array, depending on schema detection.
// We handle both shapes defensively.
interface UserWithRoles extends Profile {
  roles_users: RoleAssignment | RoleAssignment[] | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function getRoleAssignment(user: UserWithRoles): RoleAssignment | null {
  const ru = user.roles_users;
  if (!ru) return null;
  if (Array.isArray(ru)) return ru[0] ?? null;
  return ru;
}

function getUserRole(user: UserWithRoles): string | null {
  return getRoleAssignment(user)?.roles?.name ?? null;
}

function getUserRoleSlug(user: UserWithRoles): string | null {
  return getRoleAssignment(user)?.roles?.slug ?? null;
}

function getRoleBadgeVariant(slug: string | null) {
  switch (slug) {
    case "admin":
      return "default" as const;
    case "instructor":
      return "secondary" as const;
    case "student":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function fetchUsers(params: {
  search?: string;
  isActive?: string;
  offset: number;
}): Promise<{ users: UserWithRoles[]; limit: number; offset: number }> {
  const query = new URLSearchParams();
  query.set("limit", String(PAGE_SIZE));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  if (params.isActive && params.isActive !== "all")
    query.set("is_active", params.isActive);

  const res = await fetch(`/api/admin/users?${query.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    console.error("fetchUsers failed:", res.status, txt);
    throw new Error(txt || "Failed to load users");
  }
  const json = await res.json();
  return json.data;
}

async function fetchRoles(): Promise<Role[]> {
  const res = await fetch("/api/admin/roles");
  if (!res.ok) {
    const txt = await res.text();
    console.error("fetchRoles failed:", res.status, txt);
    throw new Error(txt || "Failed to load roles");
  }
  const json = await res.json();
  return json.data.roles;
}

async function patchUser(
  userId: string,
  payload: Record<string, unknown>,
): Promise<UserWithRoles> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to update user");
  }
  const json = await res.json();
  return json.data.user;
}

async function assignRole(
  userId: string,
  roleId: string,
): Promise<UserWithRoles> {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roleId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to assign role");
  }
  const json = await res.json();
  return json.data.user;
}

async function deactivateUser(userId: string): Promise<UserWithRoles> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? "Failed to deactivate user");
  }
  const json = await res.json();
  return json.data.user;
}

// ─── User Detail / Edit Modal ─────────────────────────────────────────────────

interface UserDetailModalProps {
  user: UserWithRoles | null;
  roles: Role[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function UserDetailModal({
  user,
  roles,
  open,
  onOpenChange,
  onSaved,
}: UserDetailModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setPhone(user.phone ?? "");
      setIsActive(user.is_active);
      setSelectedRoleId(getRoleAssignment(user)?.roles?.id ?? "");
    }
  }, [user, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Update profile fields
      const profilePayload: Record<string, unknown> = {};
      if (firstName.trim() !== user.first_name)
        profilePayload.first_name = firstName.trim();
      if (lastName.trim() !== user.last_name)
        profilePayload.last_name = lastName.trim();
      if ((phone.trim() || null) !== user.phone)
        profilePayload.phone = phone.trim() || null;
      if (isActive !== user.is_active) profilePayload.is_active = isActive;

      if (Object.keys(profilePayload).length > 0) {
        await patchUser(user.id, profilePayload);
      }

      // Update role if changed
      const currentRoleId = getRoleAssignment(user)?.roles?.id ?? "";
      if (selectedRoleId && selectedRoleId !== currentRoleId) {
        await assignRole(user.id, selectedRoleId);
      }

      toast.success("User updated successfully.");
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              {user.avatar_url ? (
                <AvatarImage src={user.avatar_url} alt={user.first_name} />
              ) : null}
              <AvatarFallback>
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>
                {user.first_name} {user.last_name}
              </DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-first-name">First Name</Label>
              <Input
                id="user-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-last-name">Last Name</Label>
              <Input
                id="user-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="user-phone">
              Phone{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="user-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Role assignment */}
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                Account Active
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Inactive accounts are locked out of the platform.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              aria-label="Toggle active status"
            />
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
            {user.country_code && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {user.country_code}
              </span>
            )}
            {user.birth_date && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(user.birth_date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Joined {formatDate(user.created_at)}
            </span>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Deactivation Confirmation ────────────────────────────────────────────────

interface DeactivateModalProps {
  user: UserWithRoles | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeactivated: () => void;
}

function DeactivateUserModal({
  user,
  open,
  onOpenChange,
  onDeactivated,
}: DeactivateModalProps) {
  const [processing, setProcessing] = React.useState(false);

  async function handleDeactivate() {
    if (!user) return;
    setProcessing(true);
    try {
      await deactivateUser(user.id);
      toast.success(
        `${user.first_name} ${user.last_name} has been deactivated.`,
      );
      onDeactivated();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to deactivate user.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>
          <DialogDescription>
            This will deactivate{" "}
            <strong className="text-primary">
              {user?.first_name} {user?.last_name}
            </strong>
            . They will lose access to the platform. You can reactivate them
            later from the user edit panel.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDeactivate}
            disabled={processing}
          >
            {processing && <Loader2 className="size-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function UsersTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function UsersEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 mb-5">
        <UsersIcon className="size-8 text-accent" />
      </div>
      <p className="text-lg font-semibold text-primary tracking-tight">
        No users found
      </p>
      <p className="mt-1 text-sm text-slate-500 max-w-xs">
        Try adjusting your search or filters to find what you&apos;re looking
        for.
      </p>
    </div>
  );
}

// ─── Mobile User Card ─────────────────────────────────────────────────────────

interface MobileUserCardProps {
  user: UserWithRoles;
  onEdit: (user: UserWithRoles) => void;
  onDeactivate: (user: UserWithRoles) => void;
}

function MobileUserCard({ user, onEdit, onDeactivate }: MobileUserCardProps) {
  const roleName = getUserRole(user);
  const roleSlug = getUserRoleSlug(user);

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar size="default">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.first_name} />
          ) : null}
          <AvatarFallback>
            {getInitials(user.first_name, user.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-primary truncate tracking-tight">
              {user.first_name} {user.last_name}
            </p>
            {!user.is_active && (
              <Badge variant="destructive" className="text-[10px] shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {user.email}
          </p>
          {roleName && (
            <Badge
              variant={getRoleBadgeVariant(roleSlug)}
              className="mt-2 text-[10px]"
            >
              {roleName}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label="User actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="size-4" />
              Edit User
            </DropdownMenuItem>
            {user.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeactivate(user)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="size-4" />
                  Deactivate
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function UsersPanel() {
  const [users, setUsers] = React.useState<UserWithRoles[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);

  // Search & filter
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Modal states
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserWithRoles | null>(
    null,
  );
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [deactivatingUser, setDeactivatingUser] =
    React.useState<UserWithRoles | null>(null);

  // Load roles once
  React.useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch(() => toast.error("Could not load roles."));
  }, []);

  const loadUsers = React.useCallback(
    async (currentOffset: number) => {
      setLoading(true);
      try {
        const result = await fetchUsers({
          search: search.trim(),
          isActive: statusFilter,
          offset: currentOffset,
        });
        setUsers(result.users);
        setHasMore(result.users.length === PAGE_SIZE);
      } catch (e: any) {
        console.error("loadUsers catch block:", e);
        toast.error("Could not load users: " + e.message);
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter],
  );

  // Reload when filters change
  React.useEffect(() => {
    setOffset(0);
    loadUsers(0);
  }, [loadUsers]);

  // Debounced search
  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setOffset(0);
    }, 300);
  }

  function handlePrev() {
    const newOffset = Math.max(0, offset - PAGE_SIZE);
    setOffset(newOffset);
    loadUsers(newOffset);
  }

  function handleNext() {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    loadUsers(newOffset);
  }

  function handleEdit(user: UserWithRoles) {
    setSelectedUser(user);
    setDetailOpen(true);
  }

  function handleDeactivateClick(user: UserWithRoles) {
    setDeactivatingUser(user);
    setDeactivateOpen(true);
  }

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level="h3" as="h1">
          Users
        </Title>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Manage user profiles, account status, and role assignments.
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            id="users-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44" id="users-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Active Only</SelectItem>
            <SelectItem value="false">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <UsersTableSkeleton />
      ) : users.length === 0 ? (
        <UsersEmpty />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden xl:block rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Email</TableHead>
                  <TableHead className="hidden xl:table-cell">Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden 2xl:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleName = getUserRole(user);
                  const roleSlug = getUserRoleSlug(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {user.avatar_url ? (
                              <AvatarImage
                                src={user.avatar_url}
                                alt={user.first_name}
                              />
                            ) : null}
                            <AvatarFallback>
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary tracking-tight">
                              {user.first_name} {user.last_name}
                            </span>
                            {roleName && (
                              <div className="xl:hidden mt-0.5">
                                <Badge
                                  variant={getRoleBadgeVariant(roleSlug)}
                                  className="text-[9px] px-1.5 py-0 h-4"
                                >
                                  {roleName}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate max-w-[150px] 2xl:max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {roleName ? (
                          <Badge
                            variant={getRoleBadgeVariant(roleSlug)}
                            className="text-[10px]"
                          >
                            <Shield className="size-3" />
                            {roleName}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            No role
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.is_active ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <UserCheck className="size-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            <UserX className="size-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden 2xl:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <Calendar className="size-3.5" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Actions for ${user.first_name}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleEdit(user)}
                              >
                                <Pencil className="size-4" />
                                Edit User
                              </DropdownMenuItem>
                              {user.is_active && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeactivateClick(user)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserX className="size-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 xl:hidden">
            {users.map((user) => (
              <MobileUserCard
                key={user.id}
                user={user}
                onEdit={handleEdit}
                onDeactivate={handleDeactivateClick}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Page {currentPage} · Showing {users.length} user
              {users.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={offset === 0}
              >
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!hasMore}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <UserDetailModal
        user={selectedUser}
        roles={roles}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSaved={() => loadUsers(offset)}
      />
      <DeactivateUserModal
        user={deactivatingUser}
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        onDeactivated={() => loadUsers(offset)}
      />
    </div>
  );
}
