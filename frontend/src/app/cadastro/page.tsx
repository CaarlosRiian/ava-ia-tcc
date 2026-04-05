import Link from 'next/link';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[410px] space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-[#161B1D]">
            Criar minha conta
          </h1>
          <p className="mt-2 text-lg text-[#C9C9C9] font-light">
            Preencha com seus dados abaixo
          </p>
        </div>

        <RegisterForm />

        <p className="text-[#364153] font-light text-sm">
          Já possui uma conta?{' '}
          <Link href="/entrar" className="font-bold hover:underline">
            Entre agora
          </Link>
        </p>
      </div>

      <div className="fixed top-0 right-0 w-32 h-32 bg-[#2F52E0] rounded-bl-full opacity-10 -z-10 pointer-events-none"></div>
    </main>
  );
}