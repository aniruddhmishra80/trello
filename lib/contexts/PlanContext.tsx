"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";

interface PlanContextType {
  isFreeUser: boolean;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

interface PlanProviderProps {
  children: React.ReactNode;
  hasProPlan: boolean;
  hasEnterprisePlan: boolean;
}

export function PlanProvider({
  children,
  hasProPlan: serverHasProPlan,
  hasEnterprisePlan,
}: PlanProviderProps) {
  const [hasProPlan, setHasProPlan] = useState(serverHasProPlan);
  const { user } = useUser();
  const { supabase } = useSupabase();

  useEffect(() => {
    // This bypasses the server cache and asks Supabase directly!
    const fetchLiveSubscription = async () => {
      if (!user || !supabase) return;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('stripe_price_id')
        .eq('user_id', user.id)
        .single();

      // If they have our mock pro plan in the database, instantly unlock the UI
      if (data && data.stripe_price_id === 'pro_plan') {
        setHasProPlan(true);
      }
    };

    fetchLiveSubscription();
  }, [user, supabase]);

  return (
    <PlanContext.Provider
      value={{
        hasProPlan,
        hasEnterprisePlan,
        isFreeUser: !hasProPlan && !hasEnterprisePlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan needs to be inside the provider");
  }
  return context;
};