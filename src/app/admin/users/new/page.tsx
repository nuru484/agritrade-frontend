import type { Metadata } from "next";
import { UserForm } from "@/components/admin/users/user-form";

export const metadata: Metadata = { title: "Add user" };

export default function NewUserPage() {
  return <UserForm />;
}
