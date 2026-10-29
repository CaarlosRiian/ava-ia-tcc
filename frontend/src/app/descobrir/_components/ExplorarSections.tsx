import { Sparkles, Compass } from "lucide-react";
import { TopicSection } from "@/app/descobrir/TopicSection";
import { Pagination } from "@/components/Pagination";

interface ExplorarSectionsProps {
  courses: any[];
  recommendedCourses: any[];
  newAreasCourses: any[];
  expandedTopic: string | null;
  setExpandedTopic: (topic: string | null) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function ExplorarSections({
  courses,
  recommendedCourses,
  newAreasCourses,
  expandedTopic,
  setExpandedTopic,
  currentPage,
  totalPages,
  setCurrentPage,
}: ExplorarSectionsProps) {
  const recommendedList = expandedTopic === "recommended" ? recommendedCourses : recommendedCourses.slice(0, 4);
  const excludedIds = new Set(recommendedList.map((c: any) => c.id));

  const newAreasList = expandedTopic === "newAreas" ? newAreasCourses : newAreasCourses.filter((c: any) => !excludedIds.has(c.id)).slice(0, 4);
  newAreasList.forEach((c: any) => excludedIds.add(c.id));

  const popularCoursesData = courses.filter((c: any) => !excludedIds.has(c.id));
  const popularList = expandedTopic === "popular" ? popularCoursesData : popularCoursesData.slice(0, 4);
  popularList.forEach((c: any) => excludedIds.add(c.id));

  const recentCoursesData = [...courses].filter((c: any) => !excludedIds.has(c.id)).reverse();
  const recentList = expandedTopic === "recent" ? recentCoursesData : recentCoursesData.slice(0, 4);

  return (
    <div className="space-y-14 mt-2">
      {recommendedCourses.length > 0 && (expandedTopic === null || expandedTopic === "recommended") && (
        <TopicSection title="Recomendados para Você" icon={<Sparkles className="h-5 w-5 text-[#FF7A00]" />} courses={recommendedList} total={recommendedCourses.length} expanded={expandedTopic === "recommended"} onExpand={() => setExpandedTopic("recommended")} />
      )}
      {newAreasList.length > 0 && (expandedTopic === null || expandedTopic === "newAreas") && (
        <TopicSection title="Dê uma chance a novas áreas" icon={<Compass className="h-5 w-5 text-[#2F52E0]" />} courses={newAreasList} total={newAreasCourses.length} expanded={expandedTopic === "newAreas"} onExpand={() => setExpandedTopic("newAreas")} />
      )}
      {popularList.length > 0 && (expandedTopic === null || expandedTopic === "popular") && (
        <TopicSection title="Cursos em destaque" courses={popularList} total={popularCoursesData.length} expanded={expandedTopic === "popular"} onExpand={() => setExpandedTopic("popular")} />
      )}
      {recentList.length > 0 && (expandedTopic === null || expandedTopic === "recent") && (
        <TopicSection title="Novidades na plataforma" courses={recentList} total={recentCoursesData.length} expanded={expandedTopic === "recent"} onExpand={() => setExpandedTopic("recent")} />
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}