"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { getPermissions, Role, ROLE_PERMISSIONS, ROLES, RolePermissions } from "@/lib/rbac";

interface RoleContextValue {
  role: Role;
  permissions: RolePermissions;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("Executive");
  const value = useMemo<RoleContextValue>(
    () => ({ role, permissions: getPermissions(role), setRole }),
    [role]
  );
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole() must be used within a <RoleProvider>");
  return ctx;
}

export default function RoleSwitcher() {
  const { role, permissions, setRole } = useRole();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-mc-border bg-mc-panel px-3 py-1.5 text-[12.5px] text-white/80 hover:border-mc-blue/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-mc-green" />
        <span className="text-white/40">Viewing as</span>
        <span className="font-medium text-white">{permissions.label}</span>
        <span className="text-white/30">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-mc-border bg-mc-panel p-1.5 shadow-mc">
            {ROLES.map((r) => {
              const p = ROLE_PERMISSIONS[r];
              const active = r === role;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setOpen(false);
                  }}
                  className={
                    "block w-full rounded-lg px-3 py-2 text-left " +
                    (active ? "bg-mc-blue/15" : "hover:bg-white/[0.04]")
                  }
                >
                  <div className={"text-[12.5px] font-medium " + (active ? "text-mc-blueBright" : "text-white/85")}>
                    {p.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-snug text-white/40">{p.description}</div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
