// import { PricingTable } from "@clerk/nextjs";

// export default function PricingPage() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* <Navbar /> */}
//       <div className="py-12 container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Choose Your Plan
//           </h1>
//           <p className="text-xl text-gray-600">
//             Select the perfect plan for your needs
//           </p>
//         </div>
//         <div className="max-w-5xl mx-auto">
//           <PricingTable newSubscriptionRedirectUrl="/dashboard" />
//         </div>
//       </div>
//     </div>
//   );
// // }
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { useSupabase } from "@/lib/supabase/SupabaseProvider";

// export default function PricingPage() {
//   const router = useRouter();
//   const { user } = useUser();
//   const { supabase } = useSupabase();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubscribe = async () => {
//     if (!user || !supabase) return;

//     setIsLoading(true);

//     try {
//       // 1. Calculate a date one month from now
//       const nextMonth = new Date();
//       nextMonth.setMonth(nextMonth.getMonth() + 1);

//       // 2. Insert the "Pro" subscription into your database
//       const { error } = await supabase.from('user_subscriptions').upsert({
//         user_id: user.id,
//         stripe_subscription_id: 'mock_sub_' + Date.now(),
//         stripe_customer_id: 'mock_cus_' + Date.now(),
//         stripe_price_id: 'pro_plan',
//         stripe_current_period_end: nextMonth.toISOString(),
//       });

//       if (error) {
//         console.error("Supabase insert error:", error);
//       }

//       // 3. FORCE NEXT.JS TO CLEAR THE CACHE AND RE-FETCH THE PRO STATUS
//       router.refresh();

//       // 4. Redirect back to the dashboard to enjoy unlimited boards
//       router.push('/dashboard');

//     } catch (error) {
//       console.error("Failed to upgrade:", error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl max-w-5xl w-full p-8 md:p-12 shadow-2xl">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
//           <p className="text-slate-500 mt-2">Select the perfect plan for your needs</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Free Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 flex flex-col relative">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Free</h3>
//               <Badge className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-2 py-0.5">
//                 Active
//               </Badge>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               1 Board • Basic Features • Community Support
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$0</span>
//             </div>
//             <p className="text-xs text-slate-500 mt-auto pt-6">Always free</p>
//           </div>

//           {/* Pro Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               Unlimited Boards • Advanced Features • Priority Support • Custom Templates
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$9.99</span>
//               <span className="text-sm text-slate-500"> / month</span>
//             </div>
//             <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
//             <Button
//               className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
//               onClick={handleSubscribe}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : "Subscribe"}
//             </Button>
//           </div>

//           {/* Enterprise Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Enterprise</h3>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               Everything in Pro • Team Management • Advanced Analytics • Dedicated Support
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$29.99</span>
//               <span className="text-sm text-slate-500"> / month</span>
//             </div>
//             <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
//             <Button
//               className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
//               onClick={handleSubscribe}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : "Subscribe"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// // }
// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useRouter } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { useSupabase } from "@/lib/supabase/SupabaseProvider";

// export default function PricingPage() {
//   const router = useRouter();
//   const { user } = useUser();
//   const { supabase } = useSupabase();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubscribe = async () => {
//     if (!user) {
//       alert("Error: Clerk user not found. Are you logged in?");
//       return;
//     }
//     if (!supabase) {
//       alert("Error: Supabase client not connected.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       // 1. Calculate a date one month from now
//       const nextMonth = new Date();
//       nextMonth.setMonth(nextMonth.getMonth() + 1);

//       // 2. Insert the "Pro" subscription into your Supabase database
//       const { data, error } = await supabase.from('user_subscriptions').upsert({
//         user_id: user.id,
//         stripe_subscription_id: 'mock_sub_' + Date.now(),
//         stripe_customer_id: 'mock_cus_' + Date.now(),
//         stripe_price_id: 'pro_plan',
//         stripe_current_period_end: nextMonth.toISOString(),
//       }).select();

//       // 3. Check for Database Errors
//       if (error) {
//         console.error("Supabase Error Details:", error);
//         alert(`Database Error: ${error.message}\n\nCheck your browser console for more details.`);
//         setIsLoading(false);
//         return; // Stop the redirect so we can read the error
//       }

//       console.log("Successfully saved subscription to Supabase:", data);

//       // 4. Force Next.js to clear the cache and re-fetch the Pro status
//       router.refresh();

//       // 5. Redirect back to the dashboard to enjoy unlimited boards
//       router.push('/dashboard');

//     } catch (error: any) {
//       console.error("Failed to upgrade:", error);
//       alert("Code Exception: " + error.message);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl max-w-5xl w-full p-8 md:p-12 shadow-2xl">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
//           <p className="text-slate-500 mt-2">Select the perfect plan for your needs</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Free Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 flex flex-col relative">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Free</h3>
//               <Badge className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-2 py-0.5">
//                 Active
//               </Badge>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               1 Board • Basic Features • Community Support
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$0</span>
//             </div>
//             <p className="text-xs text-slate-500 mt-auto pt-6">Always free</p>
//           </div>

//           {/* Pro Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               Unlimited Boards • Advanced Features • Priority Support • Custom Templates
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$9.99</span>
//               <span className="text-sm text-slate-500"> / month</span>
//             </div>
//             <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
//             <Button
//               className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
//               onClick={handleSubscribe}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : "Subscribe"}
//             </Button>
//           </div>

//           {/* Enterprise Plan */}
//           <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold text-slate-900">Enterprise</h3>
//             </div>
//             <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
//               Everything in Pro • Team Management • Advanced Analytics • Dedicated Support
//             </p>
//             <div className="mb-2">
//               <span className="text-4xl font-bold text-slate-900">$29.99</span>
//               <span className="text-sm text-slate-500"> / month</span>
//             </div>
//             <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
//             <Button
//               className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
//               onClick={handleSubscribe}
//               disabled={isLoading}
//             >
//               {isLoading ? "Processing..." : "Subscribe"}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Error: Clerk user not found. Are you logged in?");
      return;
    }
    if (!supabase) {
      alert("Error: Supabase client not connected.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Calculate a date one month from now
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // 2. Insert or Update the "Pro" subscription into your Supabase database
      const { data, error } = await supabase.from('user_subscriptions').upsert({
        user_id: user.id,
        stripe_subscription_id: 'mock_sub_' + Date.now(),
        stripe_customer_id: 'mock_cus_' + Date.now(),
        stripe_price_id: 'pro_plan',
        stripe_current_period_end: nextMonth.toISOString(),
      }, { onConflict: 'user_id' }).select(); // <--- FIX: Tells Supabase to update if user already exists

      // 3. Check for Database Errors
      if (error) {
        console.error("Supabase Error Details:", error);
        alert(`Database Error: ${error.message}\n\nCheck your browser console for more details.`);
        setIsLoading(false);
        return;
      }

      console.log("Successfully saved subscription to Supabase:", data);

      // 4. Force Next.js to clear the cache and re-fetch the Pro status
      router.refresh();

      // 5. Redirect back to the dashboard to enjoy unlimited boards
      router.push('/dashboard');

    } catch (error: any) {
      console.error("Failed to upgrade:", error);
      alert("Code Exception: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0e17] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Choose Your Plan</h1>
          <p className="text-slate-500 mt-2">Select the perfect plan for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Free</h3>
              <Badge className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-2 py-0.5">
                Active
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
              1 Board • Basic Features • Community Support
            </p>
            <div className="mb-2">
              <span className="text-4xl font-bold text-slate-900">$0</span>
            </div>
            <p className="text-xs text-slate-500 mt-auto pt-6">Always free</p>
          </div>

          {/* Pro Plan */}
          <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
              Unlimited Boards • Advanced Features • Priority Support • Custom Templates
            </p>
            <div className="mb-2">
              <span className="text-4xl font-bold text-slate-900">$9.99</span>
              <span className="text-sm text-slate-500"> / month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </div>

          {/* Enterprise Plan */}
          <div className="border border-slate-200 rounded-lg p-6 bg-white flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Enterprise</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
              Everything in Pro • Team Management • Advanced Analytics • Dedicated Support
            </p>
            <div className="mb-2">
              <span className="text-4xl font-bold text-slate-900">$29.99</span>
              <span className="text-sm text-slate-500"> / month</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Only billed monthly</p>
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}