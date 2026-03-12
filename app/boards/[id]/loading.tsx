import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";

export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Board Columns */}
        <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:-mx-2 space-y-4 lg:space-y-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full lg:flex-shrink-0 lg:w-80">
              <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-8 rounded-full" />
                </div>
                
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="rounded-xl border bg-card text-card-foreground shadow p-3 sm:p-4">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-3 rounded-full" />
                      </div>
                    </div>
                  ))}
                  <Skeleton className="h-9 w-full mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
