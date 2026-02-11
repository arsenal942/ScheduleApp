import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { resolveRole } from "@/lib/roles";
import Schedule from "@/components/Schedule";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const role = resolveRole(session.user.email);
  if (!role) redirect("/login?error=AccessDenied");
  return <Schedule userName={session.user.name || undefined} userEmail={session.user.email} role={role} />;
}
