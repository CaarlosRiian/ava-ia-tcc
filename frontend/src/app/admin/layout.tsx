import { ShieldAlert } from "lucide-react";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#161B1D] text-white py-2 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
        <ShieldAlert className="h-3 w-3 text-yellow-500" />
        Painel de Administração
      </div>
      
      {children}

      <Toaster 
          position="bottom-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              borderRadius: '12px', 
              padding: '16px',
            },
          }}
        />
    </div>
  );
}