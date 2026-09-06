"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="w-full bg-white border-b border-gray-100 py-3">
      <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-semibold text-gray-400">
        
        <Link 
          href="/descobrir" 
          className="flex items-center gap-1 hover:text-[#FF7A00] transition-colors"
        >
          <Home size={14} className="mb-[1px]" />
          <span>Início</span>
        </Link>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight size={12} className="text-gray-300 stroke-[2.5]" />
              {item.href && !isLast ? (
                <Link 
                  href={item.href} 
                  className="hover:text-[#FF7A00] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-bold">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}