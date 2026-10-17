import { ArrowRight } from "lucide-react";
import CourseGrid from "@/app/descobrir/CourseGrid";

type TopicSectionProps = {
  title: string;
  icon?: React.ReactNode;
  courses: any[];
  total: number;
  expanded: boolean;
  onExpand: () => void;
};

export function TopicSection({ title, icon, courses, total, expanded, onExpand }: TopicSectionProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-2xl font-bold text-[#161B1D]">{title}</h2>
        </div>
        {!expanded && total > 4 && (
          <button
            onClick={onExpand}
            className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
      <CourseGrid courses={courses} />
    </section>
  );
}