"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, ArrowRight, X, ArrowUpDown, Clock, SearchX,
  Sparkles, } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import LoadingScreen from "@/components/LoadingScreen";
import CourseGrid from "@/app/descobrir/CourseGrid";
import CategoryFilters from "@/app/descobrir/CategoryFilters";
import { getCourses, getRecommendedCourses } from "@/services/courses";
import { getCategories } from "@/services/categories";

const SORT_OPTIONS = [
  { value: "default", label: "Relevância" },
  { value: "az", label: "A a Z" },
  { value: "lessons", label: "Mais aulas" },
];

const DURATION_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "short", label: "Direto ao ponto" },
  { value: "long", label: "Formação completa" },
];

export default function Explorar() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortBy, setSortBy] = useState<string>("default");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [coursesData, categoriesData, recommendedData] = await Promise.all([
          getCourses(),
          getCategories(),
          getRecommendedCourses().catch(() => []),
        ]);

        setCourses(coursesData || []);
        setCategories(categoriesData || []);

        const normalizedRecommendations = (recommendedData || []).map((item: any) =>
          item.course ? item.course : item
        );
        setRecommendedCourses(normalizedRecommendations);
      } catch (error) {
        console.error("Erro ao carregar a página de explorar:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const courseCatId = typeof course.category === "object" ? course.category?.id : course.category;
    const matchesCategory = activeCategory ? courseCatId === activeCategory : true;

    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const totalLessons = course.modules?.length || 0;
    let matchesDuration = true;
    if (durationFilter === "short") matchesDuration = totalLessons <= 3;
    if (durationFilter === "long") matchesDuration = totalLessons > 3;

    return matchesCategory && matchesSearch && matchesDuration;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === "az") return a.title.localeCompare(b.title);
    if (sortBy === "lessons") return (b.modules?.length || 0) - (a.modules?.length || 0);
    return 0;
  });

  const recommendedCoursesData = expandedTopic === "recommended" ? recommendedCourses : recommendedCourses.slice(0, 4);
  const popularCoursesData = [...courses].sort((a, b) => (b.students_count || b.id) - (a.students_count || a.id));
  const recentCoursesData = [...courses].reverse();
  const completeCoursesData = [...courses].sort((a, b) => (b.modules?.length || 0) - (a.modules?.length || 0));

  const popularCourses = expandedTopic === "popular" ? popularCoursesData : popularCoursesData.slice(0, 4);
  const recentCourses = expandedTopic === "recent" ? recentCoursesData : recentCoursesData.slice(0, 4);
  const completeCourses = expandedTopic === "complete" ? completeCoursesData : completeCoursesData.slice(0, 4);

  const isBrowsingResults = Boolean(activeCategory || searchQuery || sortBy !== "default" || durationFilter !== "all");
  const hasActiveFilters = activeCategory !== null || sortBy !== "default" || durationFilter !== "all" || searchQuery !== "" || expandedTopic !== null;

  const activeCategoryLabel = categories.find((c) => c.id === activeCategory)?.name;

  const handleResetFilters = () => {
    setActiveCategory(null);
    setSortBy("default");
    setDurationFilter("all");
    setSearchQuery("");
    setExpandedTopic(null);
  };

  if (loading) {
    return <LoadingScreen text="Carregando cursos..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />

      <Breadcrumb items={[{ label: "Explorar" }]} />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#161B1D]">
              {hasActiveFilters ? "Resultados da Busca" : "O que aprender em seguida"}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 cursor-pointer ${
                showAdvanced
                  ? "bg-[#FF7A00] text-white border-transparent shadow-md shadow-indigo-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {(sortBy !== "default" || durationFilter !== "all") && !showAdvanced && (
                <span className="ml-0.5 flex h-2 w-2 rounded-full bg-[#FF7A00]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showAdvanced ? "grid-rows-[1fr] opacity-100 mb-8" : "grid-rows-[0fr] opacity-0 mb-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="p-6 bg-white rounded-2xl border border-gray-200/70 shadow-sm shadow-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Ordenar por
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSortBy(opt.value)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          sortBy === opt.value
                            ? "bg-white text-[#161B1D] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <Clock className="h-3.5 w-3.5" /> Duração do curso
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDurationFilter(opt.value)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          durationFilter === opt.value
                            ? "bg-white text-[#161B1D] shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(activeCategory || sortBy !== "default" || durationFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 mb-6 -mt-2">
            {activeCategoryLabel && (
              <FilterChip label={activeCategoryLabel} onRemove={() => setActiveCategory(null)} />
            )}
            {sortBy !== "default" && (
              <FilterChip
                label={SORT_OPTIONS.find((o) => o.value === sortBy)?.label || ""}
                onRemove={() => setSortBy("default")}
              />
            )}
            {durationFilter !== "all" && (
              <FilterChip
                label={DURATION_OPTIONS.find((o) => o.value === durationFilter)?.label || ""}
                onRemove={() => setDurationFilter("all")}
              />
            )}
          </div>
        )}

        {isBrowsingResults ? (
          <div className="animate-in fade-in duration-500">
            <p className="text-sm font-semibold text-gray-400 mb-4">
              {sortedCourses.length} {sortedCourses.length === 1 ? "curso encontrado" : "cursos encontrados"}
            </p>

            {sortedCourses.length > 0 ? (
              <CourseGrid courses={sortedCourses} />
            ) : (
              <div className="py-20 bg-white rounded-2xl text-center border border-gray-200/70 shadow-sm flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <SearchX className="h-7 w-7 text-[#6366F1]" />
                </div>
                <p className="text-gray-500 font-semibold">Nenhum curso corresponde aos critérios definidos.</p>
                <p className="text-gray-400 text-sm max-w-sm">
                  Tente ajustar a categoria, a ordenação ou o termo buscado.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[#6366F1] bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" /> Limpar filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-14 mt-2">
            {recommendedCourses.length > 0 && (expandedTopic === null || expandedTopic === "recommended") && (
              <TopicSection
                title="Recomendados para Você"
                icon={<Sparkles className="h-5 w-5 text-[#6366F1]" />}
                courses={recommendedCoursesData}
                total={recommendedCourses.length}
                expanded={expandedTopic === "recommended"}
                onExpand={() => setExpandedTopic("recommended")}
              />
            )}

            {popularCourses.length > 0 && (expandedTopic === null || expandedTopic === "popular") && (
              <TopicSection
                title="Cursos em destaque"
                courses={popularCourses}
                total={popularCoursesData.length}
                expanded={expandedTopic === "popular"}
                onExpand={() => setExpandedTopic("popular")}
              />
            )}

            {recentCourses.length > 0 && (expandedTopic === null || expandedTopic === "recent") && (
              <TopicSection
                title="Novidades na plataforma"
                courses={recentCourses}
                total={recentCoursesData.length}
                expanded={expandedTopic === "recent"}
                onExpand={() => setExpandedTopic("recent")}
              />
            )}

            {completeCourses.length > 0 && (expandedTopic === null || expandedTopic === "complete") && (
              <TopicSection
                title="Formações completas e detalhadas"
                courses={completeCourses}
                total={completeCoursesData.length}
                expanded={expandedTopic === "complete"}
                onExpand={() => setExpandedTopic("complete")}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-indigo-50 text-[#4338CA] text-sm font-semibold">
      {label}
      <button
        onClick={onRemove}
        className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

function TopicSection({ title, icon, courses, total, expanded, onExpand,
}: {
  title: string;
  icon?: React.ReactNode;
  courses: any[];
  total: number;
  expanded: boolean;
  onExpand: () => void;
}) {
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
