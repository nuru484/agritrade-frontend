import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordDetail } from "@/components/admin/register/record-detail";
import {
  cellText,
  findRegisterRow,
  getRegister,
  REGISTERS,
} from "@/static-data/admin/registers";

/** Route ids arrive percent-encoded on demand; decode defensively. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function generateStaticParams() {
  return Object.entries(REGISTERS).flatMap(([register, config]) =>
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
  return { title: config ? `${config.single} ${safeDecode(id)}` : "Console" };
}

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ register: string; id: string }>;
}) {
  const { register, id } = await params;
  const config = getRegister(register);
  if (!config) notFound();
  const row = findRegisterRow(config, safeDecode(id)) ?? findRegisterRow(config, id);
  if (!row) notFound();
  return <RecordDetail slug={register} register={config} row={row} />;
}
