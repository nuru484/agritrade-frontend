import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/register/record-form";
import { getRegister, REGISTERS } from "@/static-data/admin/registers";

export const dynamicParams = false;

export function generateStaticParams() {
  // Read-only registers (audit) have no create form.
  return Object.entries(REGISTERS)
    .filter(([, register]) => register.add !== null)
    .map(([register]) => ({ register }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ register: string }>;
}): Promise<Metadata> {
  const { register } = await params;
  const config = getRegister(register);
  return { title: config ? `New ${config.single.toLowerCase()}` : "Console" };
}

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ register: string }>;
}) {
  const { register } = await params;
  const config = getRegister(register);
  if (!config || config.add === null) notFound();
  return <RecordForm slug={register} register={config} mode="new" />;
}
