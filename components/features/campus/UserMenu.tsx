"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Settings, 
  LogOut, 
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

interface UserMenuProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
      picture?: string;
    };
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const fullName = user.user_metadata?.full_name || 
    `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() || 
    "User";
  
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
      router.push("/auth/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden hover:bg-slate-100 transition-all border border-slate-100">
          <Avatar className="h-full w-full">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-primary tracking-tight">{fullName}</p>
            <p className="text-xs leading-none text-slate-500 truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/campus/profile">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>{t("userMenu.myProfile")}</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem disabled className="opacity-50">
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("userMenu.settings")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={onLogout} 
          disabled={loading}
          className="text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{loading ? t("userMenu.signingOut") : t("userMenu.logOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
