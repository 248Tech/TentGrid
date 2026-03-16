import { auth } from "../../auth";
import { redirect } from "next/navigation";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/sign-in");
  return <>{children}</>;
}
