"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  AdminButton,
  AdminCard,
  AdminField,
  AdminPageHeader,
  adminInputClass,
} from "@/components/admin/ui";
import { AdminToggle } from "@/components/admin/toggle";
import { profileSessions, type ProfileSession } from "@/static-data/admin/inbox";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 text-[10.5px] font-bold tracking-[0.1em] text-slate-400 uppercase">
      {children}
    </div>
  );
}

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

export function ProfileScreen() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [twoFa, setTwoFa] = useState(true);
  const [sessions, setSessions] = useState<ProfileSession[]>(profileSessions);

  const savePassword = () => {
    const errs: PasswordErrors = {};
    if (!current.trim()) errs.current = "Enter your current password.";
    if (next.length < 8) errs.next = "Use at least 8 characters.";
    if (!confirm || confirm !== next) errs.confirm = "Passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setCurrent("");
    setNext("");
    setConfirm("");
    notify.success("Password updated — other sessions were signed out");
  };

  const toggleTwoFa = (on: boolean) => {
    setTwoFa(on);
    if (on) notify.success("Two-factor authentication enabled");
    else notify.info("Two-factor authentication disabled");
  };

  const signOut = (session: ProfileSession) => {
    setSessions((ss) => ss.filter((s) => s.device !== session.device));
    notify.success(`${session.device} signed out`);
  };

  return (
    <div className="max-w-[640px]">
      <AdminPageHeader title="My profile" sub="Your account, security and sign-in settings" />

      <div className="flex flex-col gap-4">
        <AdminCard className="flex flex-wrap items-center gap-3.5 px-5 py-[18px]">
          <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-console text-[19px] font-bold text-white">
            AD
          </div>
          <div className="min-w-[160px] flex-1">
            <div className="text-[16px] font-bold text-slate-900">Abdul Danaa</div>
            <div className="text-[13px] text-slate-500">
              Owner · 024 400 1122 · abdul@nasara-agro.com
            </div>
            <div className="mt-0.5 text-[12px] text-slate-400">Member since March 2024</div>
          </div>
          <AdminButton
            variant="secondary"
            className="h-[34px] px-3.5 text-[13px] whitespace-nowrap"
            onClick={() =>
              notify.info("Name and contact edits are made by another owner in Users")
            }
          >
            Edit details
          </AdminButton>
        </AdminCard>

        <AdminCard className="px-5 py-[18px]">
          <SectionLabel>Change password</SectionLabel>
          <div className="flex max-w-[380px] flex-col gap-[13px]">
            <AdminField label="Current password" error={errors.current}>
              <Input
                type="password"
                value={current}
                placeholder="Enter your current password"
                onChange={(e) => {
                  setCurrent(e.target.value);
                  setErrors((er) => ({ ...er, current: undefined }));
                }}
                className={cn(adminInputClass, errors.current && "border-console-red")}
              />
            </AdminField>
            <AdminField label="New password" error={errors.next}>
              <Input
                type="password"
                value={next}
                placeholder="At least 8 characters"
                onChange={(e) => {
                  setNext(e.target.value);
                  setErrors((er) => ({ ...er, next: undefined }));
                }}
                className={cn(adminInputClass, errors.next && "border-console-red")}
              />
            </AdminField>
            <AdminField label="Confirm new password" error={errors.confirm}>
              <Input
                type="password"
                value={confirm}
                placeholder="Repeat the new password"
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((er) => ({ ...er, confirm: undefined }));
                }}
                className={cn(adminInputClass, errors.confirm && "border-console-red")}
              />
            </AdminField>
            <div>
              <AdminButton className="h-[38px] px-[18px]" onClick={savePassword}>
                Update password
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="px-5 py-[18px]">
          <SectionLabel>Two-factor authentication</SectionLabel>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-slate-900">
                {twoFa ? "SMS codes — enabled" : "SMS codes — off"}
              </div>
              <div className="mt-0.5 text-[12.5px] text-slate-500">
                A 6-digit code is sent to 024 400 1122 at every sign-in.
              </div>
            </div>
            <AdminToggle checked={twoFa} onChange={toggleTwoFa} label="Two-factor authentication" />
          </div>
          {twoFa ? (
            <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-[#E6F0E9] px-3 py-[9px] text-[12.5px] text-[#2F5E3D]">
              <span className="font-bold">✓</span>
              <span>Two-factor authentication is on. Recovery codes were saved 02 Jun 2026.</span>
            </div>
          ) : null}
        </AdminCard>

        <AdminCard className="overflow-hidden rounded-lg">
          <div className="px-5 pt-3.5 pb-2.5 text-[10.5px] font-bold tracking-[0.1em] text-slate-400 uppercase">
            Active sessions
          </div>
          {sessions.map((s) => (
            <div key={s.device} className="flex items-center gap-3 border-t border-slate-100 px-5 py-[11px]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-slate-900">
                  {s.device}
                  {s.current ? (
                    <span className="inline-flex rounded-full bg-[#E6F0E9] px-2 py-0.5 text-[9.5px] font-bold tracking-[0.08em] text-[#2F5E3D] uppercase">
                      This device
                    </span>
                  ) : null}
                </div>
                <div className="mt-px text-[12px] text-slate-500">{s.meta}</div>
              </div>
              {!s.current ? (
                <AdminButton
                  variant="ghost"
                  onClick={() => signOut(s)}
                  className="h-auto cursor-pointer p-0 text-[12.5px] font-semibold whitespace-nowrap text-console-red hover:bg-transparent hover:text-console-red"
                >
                  Sign out
                </AdminButton>
              ) : null}
            </div>
          ))}
        </AdminCard>
      </div>
    </div>
  );
}
