// "use client";

// import { createContext, useContext } from "react";

// interface PlanContextType {
//   isFreeUser: boolean;
//   hasProPlan: boolean;
//   hasEnterprisePlan: boolean;
// }

// const PlanContext = createContext<PlanContextType | undefined>(undefined);

// interface PlanProviderProps {
//   children: React.ReactNode;
//   hasProPlan: boolean;
//   hasEnterprisePlan: boolean;
// }

// export function PlanProvider({
//   children,
//   hasProPlan,
//   hasEnterprisePlan,
// }: PlanProviderProps) {
//   return (
//     <PlanContext.Provider
//       value={{
//         hasProPlan,
//         hasEnterprisePlan,
//         isFreeUser: !hasProPlan && !hasEnterprisePlan,
//       }}
//     >
//       {children}
//     </PlanContext.Provider>
//   );
// }

// export const usePlan = () => {
//   const context = useContext(PlanContext);
//   if (context === undefined) {
//     throw new Error("usePlan needs to be inside the provider");
//   }

//   return context;
// };
"use client";

import { createContext, useContext } from "react";

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
  // We keep the props so we don't break the parent component, 
  // but we are going to ignore them below!
  hasProPlan,
  hasEnterprisePlan,
}: PlanProviderProps) {
  return (
    // <PlanContext.Provider
    //   value={{
    //     hasProPlan: true,        // Force the app to think you are Pro
    //     hasEnterprisePlan: true, // Force Enterprise too, just in case!
    //     isFreeUser: false,       // Turn off free tier restrictions
    //   }}
    // >
    // <PlanContext.Provider
    //   value={{
    //     hasProPlan, // Remove the ": true"
    //     hasEnterprisePlan, // Remove the ": true"
    //     isFreeUser: !hasProPlan && !hasEnterprisePlan,
    //   }}
    // >
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