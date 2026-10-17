import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-gray-100 bg-white mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-2 font-bold text-xl">
          <img
            src="/ava-ia-icon.png"
            alt="AVA-IA"
            className="h-10 w-10 rounded-lg object-contain"
          />
          <span>AVA-<span className="text-[#FF7A00]">IA</span></span>
        </div>

        <p className="text-sm text-gray-400 font-light">
          © {new Date().getFullYear()} AVA-IA. Ambiente Virtual de Aprendizagem com IA.
        </p>

        <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
          <Link href="/terms" className="hover:text-[#FF7A00] transition-colors">
            Termos de Uso
          </Link>
          <Link href="/privacity" className="hover:text-[#FF7A00] transition-colors">
            Política de Privacidade
          </Link>
        </div>

      </div>
    </footer>
  );
}