import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegisterTable } from "@/components/admin/register/register-table";
import { getRegister, REGISTERS } from "@/static-data/admin/registers";

/**
 * The one register/list route: 13 config-driven modules share this template.
 * Custom screens (purchases, sales, shipments…) have their own static routes,
 * which win over this dynamic segment.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(REGISTERS).map((register) => ({ register }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ register: string }>;
}): Promise<Metadata> {
  const { register } = await params;
  return { title: getRegister(register)?.title ?? "Console" };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ register: string }>;
}) {
  const { register } = await params;
  const config = getRegister(register);
  if (!config) notFound();
  return <RegisterTable slug={register} register={config} />;
}
