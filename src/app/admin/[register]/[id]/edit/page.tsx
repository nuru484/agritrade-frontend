import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordForm } from "@/components/admin/register/record-form";
import {
  cellText,
  findRegisterRow,
  getRegister,
  REGISTERS,
} from "@/static-data/admin/registers";

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function generateStaticParams() {
  // Read-only registers (audit) have no edit form.
  return Object.entries(REGISTERS)
    .filter(([, config]) => !config.readOnly)
    .flatMap(([register, config]) =>
      config.rows.map((row) => ({ register, id: cellText(row[0]) })),
    );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ register: string; id: string }>;
}): Promise<Metadata> {
  const { register, id } = await params;
  const config = getRegister(register);
  return {
    title: config
      ? `Edit ${config.single.toLowerCase()} ${safeDecode(id)}`
      : "Console",
  };
}

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ register: string; id: string }>;
}) {
  const { register, id } = await params;
  const config = getRegister(register);
  if (!config || config.readOnly) notFound();
  const row = findRegisterRow(config, safeDecode(id)) ?? findRegisterRow(config, id);
  if (!row) notFound();
  return <RecordForm slug={register} register={config} mode="edit" row={row} />;
}
