import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Wizard from "./wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <Wizard email={session.user?.email ?? ""} name={session.user?.name ?? ""}
                 provider={(session as any).provider === "azure-ad" ? "Microsoft 365" : "Google"} />;
}
