"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Search,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Calendar,
  MoreHorizontal,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";

import { CampusPageHeader } from "@/components/features/campus/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/table";

const PAGE_SIZE = 20;

interface UserSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  is_active: boolean;
}

export default function UserManagementPanel() {
  const { t, lang } = useTranslation();
  const [users, setUsers] = React.useState<UserSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const loadUsers = React.useCallback(
    async (currentOffset: number) => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("limit", String(PAGE_SIZE));
        query.set("offset", String(currentOffset));
        if (search.trim()) query.set("search", search.trim());

        const res = await fetch(`/api/admin/user-management?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load users");
        
        const json = await res.json();
        setUsers(json.data.users);
        setHasMore(json.data.users.length === PAGE_SIZE);
      } catch (e: any) {
        toast.error(t("profile.errorLoading") + ": " + e.message);
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  React.useEffect(() => {
    setOffset(0);
    loadUsers(0);
  }, [loadUsers]);

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

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <CampusPageHeader
        title={t("adminDetail.usersTitle")}
        description={t("adminDetail.usersSubtitle")}
      />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <Input
          placeholder={t("adminDetail.searchPlaceholder")}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UsersIcon className="size-12 text-slate-200 mb-4" />
          <p className="text-lg font-semibold text-primary">{t("adminDetail.studentNotFound").split(".")[0]}</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden text-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminDetail.columnStudent")}</TableHead>
                  <TableHead className="hidden md:table-cell">{t("adminDetail.columnEmail")}</TableHead>
                  <TableHead className="hidden lg:table-cell">{t("adminDetail.columnJoined")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                          <AvatarFallback>
                            {user.first_name[0]}{user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-primary tracking-tight">
                          {user.first_name} {user.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(user.created_at).toLocaleDateString(lang === "es" ? "es-ES" : "en-US")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/campus/admin/user-management/${user.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <GraduationCap className="size-4" />
                          {t("adminDetail.viewProgress")}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              {t("adminDetail.pageLabel").replace("{current}", currentPage.toString())} · {users.length} {t("adminDetail.usersTitle")}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={offset === 0}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={!hasMore}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
