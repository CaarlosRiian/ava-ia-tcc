import React from "react";
import * as LucideIcons from "lucide-react";

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className = "w-4 h-4" }: DynamicIconProps) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  
  const IconComponent = icons[name] || LucideIcons.Folder;

  return <IconComponent className={className} />;
}