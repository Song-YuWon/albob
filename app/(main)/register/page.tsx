import { redirect } from "next/navigation";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { RegisterWizard } from "@/components/RegisterWizard/RegisterWizard";

interface RegisterPageProps {
  searchParams: Promise<{ name?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const testerId = await getCurrentTesterId();
  if (!testerId) redirect("/login");

  const { name } = await searchParams;

  return <RegisterWizard initialName={name ?? ""} testerId={testerId} />;
}
