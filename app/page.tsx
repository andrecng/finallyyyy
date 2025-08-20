"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/workspace");
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            2048 Asset Management
          </h1>
          <p className="text-xl text-slate-300">
            Moteur Alpha - Système de Gestion de Risque Adaptatif
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="text-lg text-slate-300">
            Redirection vers le Workspace...
          </div>
          
          <div className="text-sm text-slate-400">
            <p>Simulation Monte Carlo • Gestion de Risque • FTMO</p>
          </div>
        </div>
      </div>
    </div>
  );
}
