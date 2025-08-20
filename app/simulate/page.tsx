"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SimulateRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/workspace#simulate");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg">Redirection vers le workspace...</p>
      </div>
    </div>
  );
}
