"use client";

import { Suspense } from "react";
import { SlidersHorizontal, RotateCcw, ArrowUpDown, Clock, SearchX } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import LoadingScreen from "@/components/LoadingScreen";
import CourseGrid from "@/app/descobrir/CourseGrid";
import CategoryFilters from "@/app/descobrir/CategoryFilters";
import { Pagination } from "@/components/Pagination";
import Footer from "@/components/Footer";
import OnboardingModal from "@/components/OnboardingModal";
import { useExplorar } from "./hook/useExplorar";
import { ExplorarSections } from "./_components/ExplorarSections";
import axios from "axios";

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

function ExplorarContent() {
  const { categories, courses, loading, currentPage, totalPages, setCurrentPage, searchQuery, setSearchQuery, activeCategory, setActiveCategory, sortBy, setSortBy,
    durationFilter, setDurationFilter, showAdvanced, setShowAdvanced, expandedTopic,
    setExpandedTopic, showOnboarding, setShowOnboarding, sortedCourses, recommendedCourses,
    newAreasCourses, handleResetFilters, } = useExplorar();

  const isBrowsingResults = Boolean(activeCategory || searchQuery || sortBy !== "default" || durationFilter !== "all");
  const hasActiveFilters = activeCategory !== null || sortBy !== "default" || durationFilter !== "all" || searchQuery !== "" || expandedTopic !== null;

  const handleCompleteOnboarding = async (selectedInterests: string[]) => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      await axios.patch("http://localhost:8000/api/me/", { interests: selectedInterests, onboarding_completed: true }, { headers: { Authorization: `Bearer ${token}` } });
      setShowOnboarding(false);
      window.location.reload();
    } catch (err) {
      console.error("Erro ao salvar preferências no onboarding:", err);
      throw err;
    }
  };

  const handleSkipOnboarding = async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      await axios.patch("http://localhost:8000/api/me/", { onboarding_completed: true }, { headers: { Authorization: `Bearer ${token}` } });
      setShowOnboarding(false);
    } catch (err) {
      console.error("Erro ao pular onboarding:", err);
      throw err;
    }
  };

  if (loading && courses.length === 0) return <LoadingScreen text="Carregando cursos..." />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header value={searchQuery} onChange={(e: any) => setSearchQuery(e.target.value)} />
      <Breadcrumb items={[{ label: "Explorar" }]} />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-[#161B1D]">
            {hasActiveFilters ? "Resultados da Busca" : "O que aprender em seguida"}
          </h1>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                showAdvanced ? "bg-[#FF7A00] text-white border-transparent shadow-md" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filtros
            </button>
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 cursor-pointer">
                <RotateCcw className="h-4 w-4" /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <CategoryFilters 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelect={(id) => setActiveCategory(id !== null ? Number(id) : null)} 
          />
        </div>

        {showAdvanced && (
          <div className="p-6 bg-white rounded-2xl border border-gray-200/70 shadow-sm mb-8 flex flex-col sm:flex-row gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block"><ArrowUpDown className="inline h-3.5 w-3.5 mr-1" /> Ordenar por</label>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer ${sortBy === opt.value ? "bg-white shadow-sm" : "text-gray-500"}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block"><Clock className="inline h-3.5 w-3.5 mr-1" /> Duração</label>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {DURATION_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setDurationFilter(opt.value)} className={`px-3 py-1.5 rounded-lg text-sm font-semibold cursor-pointer ${durationFilter === opt.value ? "bg-white shadow-sm" : "text-gray-500"}`}>{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isBrowsingResults ? (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-4">{sortedCourses.length} cursos encontrados</p>
            {sortedCourses.length > 0 ? (
              <>
                <CourseGrid courses={sortedCourses} />
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            ) : (
              <div className="py-20 bg-white rounded-2xl text-center border border-gray-200 flex flex-col items-center gap-3">
                <SearchX className="h-7 w-7 text-[#FF7A00]" />
                <p className="text-gray-500 font-semibold">Nenhum curso corresponde aos critérios.</p>
                <button onClick={handleResetFilters} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#FF7A00] cursor-pointer">Limpar filtros</button>
              </div>
            )}
          </div>
        ) : (
          <ExplorarSections
            courses={courses}
            recommendedCourses={recommendedCourses}
            newAreasCourses={newAreasCourses}
            expandedTopic={expandedTopic}
            setExpandedTopic={setExpandedTopic}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </main>

      {showOnboarding && (
        <OnboardingModal
          categories={categories}
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
        />
      )}

      <Footer />
    </div>
  );
}

export default function Explorar() {
  return (
    <Suspense fallback={<LoadingScreen text="Carregando..." />}>
      <ExplorarContent />
    </Suspense>
  );
}