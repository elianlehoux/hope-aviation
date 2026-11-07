"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n/context";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import type { PersonDetail, PersonRole } from "@/lib/campus/people";
import { setPersonActive, setPersonRole } from "./people-api";
import { roleLabel } from "./PeopleDirectory";

/** Admin-only account controls: role and active state, each behind a confirmation. */
export function PersonAccountCard({ person, isSelf }: { person: PersonDetail; isSelf: boolean }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const userId = person.profile.id;

  const [pendingRole, setPendingRole] = React.useState<{ id: string; slug: PersonRole } | null>(null);
  const [confirmActive, setConfirmActive] = React.useState(false);

  const currentRoleId = person.roles.find((r) => r.slug === person.role)?.id ?? "";
  const name = person.profile.fullName;

  const applyRole = async () => {
    if (!pendingRole) return;
    try {
      await setPersonRole(userId, pendingRole.id);
      toast.success(es ? `Ahora ${name} es ${roleLabel(pendingRole.slug, es).toLowerCase()}.` : `${name} is now ${roleLabel(pendingRole.slug, es).toLowerCase()}.`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : es ? "No pudimos cambiar el rol." : "Could not change the role.");
      throw e;
    }
  };

  const applyActive = async () => {
    const next = !person.isActive;
    try {
      await setPersonActive(userId, next);
      toast.success(
        next
          ? es ? "Cuenta reactivada." : "Account reactivated."
          : es ? "Cuenta desactivada." : "Account deactivated.",
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : es ? "No pudimos actualizar la cuenta." : "Could not update the account.");
      throw e;
    }
  };

  return (
    <CampusSurface className="p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-primary">{es ? "Cuenta" : "Account"}</h2>
      <p className="mt-1 text-sm text-primary/65">
        {isSelf
          ? es
            ? "Es tu propia cuenta: no podés cambiar tu rol ni desactivarla desde acá."
            : "This is your own account: you can't change your role or deactivate it here."
          : es
            ? "El rol define qué puede ver y hacer en el campus."
            : "The role defines what they can see and do on campus."}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label={es ? "Rol" : "Role"} htmlFor="person-role">
          <select
            id="person-role"
            className={fieldControl}
            value={currentRoleId}
            disabled={isSelf || person.roles.length === 0}
            onChange={(e) => {
              const role = person.roles.find((r) => r.id === e.target.value);
              if (role && role.id !== currentRoleId) setPendingRole({ id: role.id, slug: role.slug });
            }}
          >
            {currentRoleId ? null : <option value="">{es ? "Sin rol" : "No role"}</option>}
            {person.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {roleLabel(r.slug, es)}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex flex-col gap-1.5">
          <span id="person-active-label" className="text-sm font-semibold text-primary/80">
            {es ? "Cuenta activa" : "Active account"}
          </span>
          <div className="flex min-h-[42px] items-center gap-3">
            <Switch
              aria-labelledby="person-active-label"
              checked={person.isActive}
              disabled={isSelf}
              onCheckedChange={() => setConfirmActive(true)}
            />
            <span className="text-sm text-primary/70">
              {person.isActive ? (es ? "Activa" : "Active") : es ? "Inactiva" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={(o) => !o && setPendingRole(null)}
        title={es ? "¿Cambiar el rol?" : "Change role?"}
        description={
          pendingRole
            ? es
              ? `${name} pasa de ${roleLabel(person.role, es).toLowerCase()} a ${roleLabel(pendingRole.slug, es).toLowerCase()}. Cambia lo que puede ver y hacer en el campus.`
              : `${name} goes from ${roleLabel(person.role, es).toLowerCase()} to ${roleLabel(pendingRole.slug, es).toLowerCase()}. This changes what they can see and do on campus.`
            : undefined
        }
        confirmLabel={es ? "Cambiar rol" : "Change role"}
        onConfirm={applyRole}
      />

      <ConfirmDialog
        open={confirmActive}
        onOpenChange={setConfirmActive}
        title={person.isActive ? (es ? "¿Desactivar la cuenta?" : "Deactivate account?") : es ? "¿Reactivar la cuenta?" : "Reactivate account?"}
        description={
          person.isActive
            ? es
              ? `La cuenta de ${name} queda inactiva. Su avance se conserva y podés reactivarla cuando quieras.`
              : `${name}'s account becomes inactive. Their progress is kept and you can reactivate it anytime.`
            : es
              ? `La cuenta de ${name} vuelve a estar activa, con todo su avance.`
              : `${name}'s account becomes active again, with all their progress.`
        }
        confirmLabel={person.isActive ? (es ? "Desactivar" : "Deactivate") : es ? "Reactivar" : "Reactivate"}
        destructive={person.isActive}
        onConfirm={applyActive}
      />
    </CampusSurface>
  );
}
