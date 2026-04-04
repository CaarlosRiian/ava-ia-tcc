import Link from 'next/link';
import LoginForm from './LoginForm'; 

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      
      <div className="w-full max-w-[410px] space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-[#161B1D]">
            Bem vindo Estudante!
          </h1>
          <p className="mt-2 text-lg text-[#C9C9C9] font-light">
            Preencha com seus dados abaixo
          </p>
        </div>
        <LoginForm />

        <p className="text-[#364153] font-light">
          Ainda não se cadastrou?{' '}
          <Link href="/cadastro" className="font-bold hover:underline">
            Crie uma conta
          </Link>
        </p>
      </div>

      <div className="fixed top-0 right-0 w-32 h-32 bg-[#2F52E0] rounded-bl-full opacity-10 -z-10 pointer-events-none"></div>
    </main>
  );
}