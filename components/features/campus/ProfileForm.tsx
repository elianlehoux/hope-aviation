"use client";

import * as React from "react";
import { useTranslation } from "@/lib/i18n/context";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  User as UserIcon, 
  Phone, 
  Globe, 
  FileText,
  Mail,
  Search,
  Check,
  ChevronsUpDown,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

import { Title } from "@/components/ui/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countries, getCountryByCode } from "@/lib/utils/countries";
import { createClient } from "@/lib/supabase/client";

import type { Profile } from "@/types/database";

export function ProfileForm() {
  const { t } = useTranslation();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [authUserId, setAuthUserId] = React.useState<string | null>(null);
  const [authMetadata, setAuthMetadata] = React.useState<any>(null);
  const [isGoogleUser, setIsGoogleUser] = React.useState(false);

  // Form states
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("");
  const [birthDate, setBirthDate] = React.useState<Date | undefined>(undefined);

  // Country selector states
  const [countrySearch, setCountrySearch] = React.useState("");
  const [isCountryOpen, setIsCountryOpen] = React.useState(false);

  const supabase = createClient();

  const fetchProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUserId(user.id);
        setAuthMetadata(user.user_metadata);
        setIsGoogleUser(user.app_metadata?.provider === "google" || user.identities?.some(id => id.provider === "google") || false);
      }

      const res = await fetch("/api/me/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const json = await res.json();
      const p = json.data.profile as Profile;
      
      setProfile(p);
      setFirstName(p.first_name);
      setLastName(p.last_name);
      setPhone(p.phone || "");
      setDescription(p.bio || "");
      setCountryCode(p.country_code || "");
      if (p.birth_date) {
        setBirthDate(new Date(p.birth_date));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.errorLoading"));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        bio: description || null,
        country_code: countryCode || null,
        birth_date: birthDate ? format(birthDate, "yyyy-MM-dd") : null,
      };

      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Failed to update profile");
      }

      toast.success(t("profile.profileUpdated"));
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.errorUpdating"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card className="p-6 space-y-8 border-slate-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    );
  }

  const selectedCountry = getCountryByCode(countryCode);
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const avatarUrl = profile?.avatar_url || authMetadata?.avatar_url || authMetadata?.picture;


  return (
    <div className="max-w-4xl space-y-8 pb-20">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative">
          <Avatar className="h-28 w-28 border-4 border-white shadow-2xl ring-1 ring-slate-100 transition-transform hover:scale-105 duration-300">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
            <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
          <Title level="h2" className="tracking-tight truncate font-bold text-primary">
            {firstName} {lastName}
          </Title>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Badge variant="secondary" className="bg-slate-50 border-slate-100 text-slate-500 font-medium px-3 py-1">
              <Mail className="size-3 mr-1.5 opacity-70" />
              {profile?.email}
            </Badge>
            {isGoogleUser && (
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 py-1 px-3">
                {t("userMenu.googleAccount")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Personal details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary pl-1">
            <UserIcon className="size-4 opacity-70" />
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">{t("profile.personalDetails")}</h3>
          </div>
          
          <Card className="p-6 md:p-10 bg-white border-slate-100 shadow-xs overflow-visible rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold text-slate-600 pl-1">{t("profile.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("profile.firstNamePlaceholder")}
                  className="rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold text-slate-600 pl-1">{t("profile.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("profile.lastNamePlaceholder")}
                  className="rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-600 pl-1">{t("profile.phoneNumber")}</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="pl-11 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-semibold text-slate-600 pl-1">{t("profile.birthDate")}</Label>
                <DatePicker 
                  date={birthDate} 
                  setDate={setBirthDate} 
                  placeholder={t("profile.selectBirthDate")}
                  className="rounded-xl border-slate-200 focus:border-primary h-12"
                />
                <p className="text-[10px] text-slate-400 font-medium pl-2 italic">{t("profile.birthDateNote")}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary pl-1">
            <Globe className="size-4 opacity-70" />
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">{t("profile.location")}</h3>
          </div>
          
          <Card className="p-6 md:p-10 bg-white border-slate-100 shadow-xs overflow-visible rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-600 pl-1">{t("profile.countryRegion")}</Label>
                <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCountryOpen}
                      className="w-full h-12 justify-between rounded-xl border-slate-200 bg-white px-4 font-normal hover:bg-slate-50 transition-all focus:ring-4 focus:ring-primary/5"
                    >
                      {selectedCountry ? (
                        <span className="flex items-center gap-3">
                          <span className="text-xl leading-none">{selectedCountry.flag}</span>
                          <span className="font-bold text-primary tracking-tight">{selectedCountry.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{t("profile.searchCountry")}</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-slate-100 shadow-2xl overflow-hidden backdrop-blur-xl bg-white/95" align="start">
                    <div className="flex items-center border-b border-slate-50 px-3 h-14 bg-slate-50/50">
                      <Search className="mr-3 h-4 w-4 shrink-0 text-slate-400" />
                      <Input
                        className="border-none bg-transparent focus-visible:ring-0 shadow-none h-full placeholder:text-slate-400 text-sm font-medium"
                        placeholder={t("profile.searchCountryPlaceholder")}
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                      {filteredCountries.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400 font-medium">{t("common.noResults")}</div>
                      ) : (
                        filteredCountries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setIsCountryOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all hover:bg-slate-50 group",
                              countryCode === c.code ? "bg-primary text-white font-bold" : "text-slate-700 hover:translate-x-1"
                            )}
                          >
                            <span className="text-xl leading-none group-hover:scale-125 transition-transform">{c.flag}</span>
                            <span className="flex-1 text-left">{c.name}</span>
                            {countryCode === c.code && <Check className="h-4 w-4" />}
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </Card>
        </section>

        {/* Informacion Adicional */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary pl-1">
            <FileText className="size-4 opacity-70" />
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60">{t("profile.internalInfo")}</h3>
          </div>
          
          <Card className="p-6 md:p-10 bg-white border-slate-100 shadow-xs rounded-3xl">
            <div className="space-y-4">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-600 pl-1">{t("profile.personalDescription")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("profile.personalDescriptionPlaceholder")}
                className="min-h-[220px] rounded-2xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all p-6 text-base leading-relaxed font-medium"
              />
              <div className="flex items-start gap-3 text-xs text-slate-400 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                <AlertCircle className="size-4 mt-0.5 shrink-0 text-slate-400" />
                <p className="leading-relaxed">
                  {t("profile.personalDescriptionNote")}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end pt-8 gap-4 border-t border-slate-100">
          <Button 
            type="submit" 
            disabled={saving}
            className="rounded-2xl px-12 py-8 h-auto text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-[0.97] bg-primary text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                {t("profile.updatingRecords")}
              </>
            ) : (
              <>
                <Save className="mr-3 h-6 w-6" />
                {t("profile.saveProfile")}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
