"use client";

import { useState, useEffect } from "react";
import { Sparkles, SlidersHorizontal, RotateCcw, Flame, Calendar, GraduationCap, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import CourseGrid from "@/app/descobrir/CourseGrid";
import CategoryFilters from "@/app/descobrir/CategoryFilters";
import { getCourses } from "@/services/courses";
import { getCategories } from "@/services/categories";

export default function Explorar() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
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
        const [coursesData, categoriesData] = await Promise.all([
          getCourses(),
          getCategories(),
        ]);
        setCourses(coursesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao carregar a página de explorar:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesCategory = activeCategory ? course.category === activeCategory : true;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
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

  const popularCoursesData = [...courses].sort((a, b) => (b.students_count || b.id) - (a.students_count || a.id));
  const recentCoursesData = [...courses].reverse();
  const completeCoursesData = [...courses].sort((a, b) => (b.modules?.length || 0) - (a.modules?.length || 0));

  const popularCourses = expandedTopic === "popular" ? popularCoursesData : popularCoursesData.slice(0, 4);
  const recentCourses = expandedTopic === "recent" ? recentCoursesData : recentCoursesData.slice(0, 4);
  const completeCourses = expandedTopic === "complete" ? completeCoursesData : completeCoursesData.slice(0, 4);

  const hasActiveFilters = activeCategory !== null || sortBy !== "default" || durationFilter !== "all" || searchQuery !== "" || expandedTopic !== null;

  const handleResetFilters = () => {
    setActiveCategory(null);
    setSortBy("default");
    setDurationFilter("all");
    setSearchQuery("");
    setExpandedTopic(null);
  };

  if (loading) {
    return <LoadingScreen text="Carregando cursos..." />
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />

      <main className="py-12">
        <div className="container mx-auto px-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#2F52E0] p-2 rounded-lg shadow-lg shadow-blue-100">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-[#161B1D]">
                {hasActiveFilters ? "Resultados da Busca" : "O que aprender em seguida"}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer ${
                  showAdvanced 
                    ? 'bg-[#6366F1] text-white border-transparent shadow-md' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" /> 
                {showAdvanced ? 'Ocultar Filtros' : 'Filtros Avançados'}
              </button>

              {hasActiveFilters && (
                <button 
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
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

          {showAdvanced && (
            <div className="mt-4 p-5 bg-white rounded-2xl border border-gray-200/60 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-3 duration-300 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordenar resultados por</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl p-3 outline-none focus:border-[#6366F1] transition-all cursor-pointer"
                >
                  <option value="default">Relevância (Padrão)</option>
                  <option value="az">Nome (A a Z)</option>
                  <option value="lessons">Maior número de aulas</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duração do Curso</label>
                <select 
                  value={durationFilter} 
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl p-3 outline-none focus:border-[#6366F1] transition-all cursor-pointer"
                >
                  <option value="all">Todas as durações</option>
                  <option value="short">Direto ao ponto (Até 3 módulos)</option>
                  <option value="long">Formações completas (Mais de 3 módulos)</option>
                </select>
              </div>
            </div>
          )}

          {(activeCategory || searchQuery || sortBy !== "default" || durationFilter !== "all") ? (
            <div className="animate-in fade-in duration-500 mt-8">
              {sortedCourses.length > 0 ? (
                <CourseGrid courses={sortedCourses} />
              ) : (
                <div className="py-16 bg-white rounded-2xl text-center border border-gray-200 shadow-sm">
                  <p className="text-gray-400 font-medium">Nenhum curso corresponde aos critérios definidos.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-14 mt-8">
              
              {popularCourses.length > 0 && (expandedTopic === null || expandedTopic === "popular") && (
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame className="text-amber-500 h-5 w-5 fill-amber-500" />
                      <h2 className="text-2xl font-bold text-[#161B1D]">Cursos em destaque</h2>
                    </div>
                    {expandedTopic === null && popularCoursesData.length > 4 && (
                      <button 
                        onClick={() => setExpandedTopic("popular")}
                        className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Ver todos <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <CourseGrid courses={popularCourses} />
                </section>
              )}

              {recentCourses.length > 0 && (expandedTopic === null || expandedTopic === "recent") && (
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-[#2F52E0] h-5 w-5" />
                      <h2 className="text-2xl font-bold text-[#161B1D]">Novidades na plataforma</h2>
                    </div>
                    {expandedTopic === null && recentCoursesData.length > 4 && (
                      <button 
                        onClick={() => setExpandedTopic("recent")}
                        className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Ver todos <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <CourseGrid courses={recentCourses} />
                </section>
              )}

              {completeCourses.length > 0 && (expandedTopic === null || expandedTopic === "complete") && (
                <section className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-emerald-500 h-5 w-5" />
                      <h2 className="text-2xl font-bold text-[#161B1D]">Formações completas e detalhadas</h2>
                    </div>
                    {expandedTopic === null && completeCoursesData.length > 4 && (
                      <button 
                        onClick={() => setExpandedTopic("complete")}
                        className="text-[#2F52E0] text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Ver todos <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <CourseGrid courses={completeCourses} />
                </section>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}