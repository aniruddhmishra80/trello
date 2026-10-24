import { PlanProvider } from "@/lib/contexts/PlanContext";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let hasProPlan = false;
  let hasEnterprisePlan = false;

  try {
    const { has } = await auth();
    hasProPlan = has({ plan: "pro_user" });
    hasEnterprisePlan = has({ plan: "enterprise_user" });
  } catch {
    // Clerk billing / plans may not be configured — default to free user
    hasProPlan = false;
    hasEnterprisePlan = false;
  }

  return (
    <PlanProvider hasProPlan={hasProPlan} hasEnterprisePlan={hasEnterprisePlan}>
      {children}
    </PlanProvider>
  );
}
