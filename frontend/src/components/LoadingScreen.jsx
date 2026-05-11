export default function LoadingScreen({ text = "Carregando..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      
      <div className="h-10 w-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />

      <p className="text-sm text-gray-500 font-medium">
        {text}
      </p>

    </div>
  );
}