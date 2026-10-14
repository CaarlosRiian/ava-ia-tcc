import { ReactNode } from "react";

interface TabEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function TabEmptyState({ icon, title, description }: TabEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <div className="p-3 rounded-full border border-gray-200 bg-gray-50 text-[black]">{icon}</div>
      <h3 className="font-bold text-base text-[#161B1D]">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}