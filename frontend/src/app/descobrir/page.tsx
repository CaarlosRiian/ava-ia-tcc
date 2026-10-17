"use client";

import { useState, useEffect, Suspense } from "react";
import { SlidersHorizontal, RotateCcw, X, ArrowUpDown, Clock, SearchX, Sparkles, Compass } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb";
import LoadingScreen from "@/components/LoadingScreen";
import CourseGrid from "@/app/descobrir/CourseGrid";
import CategoryFilters from "@/app/descobrir/CategoryFilters";
import { TopicSection } from "@/app/descobrir/TopicSection";
import { Pagination } from "@/components/Pagination";
import { getCourses } from "@/services/courses";
import { getCategories } from "@/services/categories";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
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
  const searchParams = useSearchParams();
  const searchUrlParam = searchParams.get("search") || "";
  const categoryUrlParam = searchParams.get("category"); 

  const [activeCategory, setActiveCategory] = useState<number | null>(
    categoryUrlParam ? Number(categoryUrlParam) : null
  );
  const [courses, setCourses] = useState<any[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [newAreasCourses, setNewAreasCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState(searchUrlParam);
  const [sortBy, setSortBy] = useState<string>("default");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  useEffect(() => {
    if (searchUrlParam !== searchQuery) setSearchQuery(searchUrlParam);
  }, [searchUrlParam]);

  useEffect(() => {
    if (categoryUrlParam) {
      setActiveCategory(Number(categoryUrlParam));
    }
  }, [categoryUrlParam]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");

        const [coursesData, categoriesData] = await Promise.all([
          getCourses(currentPage), 
          getCategories(),
        ]);

        const rawCourses = coursesData?.results || coursesData || [];
        const allCategories = categoriesData?.results || categoriesData || [];
        setCategories(allCategories);

        const totalCount = coursesData?.count || rawCourses.length;
        setTotalPages(Math.ceil(totalCount / 10));

        const shuffledCourses = [...rawCourses].sort(() => Math.random() - 0.5);
        setCourses(shuffledCourses);

        let userInterests: string[] = [];
        if (token) {
          try {
            const userRes = await axios.get("http://localhost:8000/api/me/", {
              headers: { Authorization: `Bearer ${token}` }
            });
            userInterests = (userRes.data.interests || []).map((i: string) => i.toLowerCase());
          } catch (err) {
            console.error("Erro ao buscar interesses do utilizador", err);
          }
        }

        const recommended = shuffledCourses.filter((course: any) => {
          const catName = typeof course.category === "object" 
            ? course.category?.name 
            : allCategories.find((c: any) => c.id === course.category)?.name;
          
          return userInterests.some((interest: string) => interest === catName?.toLowerCase());
        });

        setRecommendedCourses(recommended.length > 0 ? recommended : shuffledCourses.slice(0, 4));

        const newAreas = shuffledCourses.filter((course: any) => {
          const catName = typeof course.category === "object" 
            ? course.category?.name 
            : allCategories.find((c: any) => c.id === course.category)?.name;

          return !userInterests.includes(catName?.toLowerCase());
        });

        setNewAreasCourses(newAreas.length > 0 ? newAreas : shuffledCourses.slice(4, 8));

      } catch (error) {
        console.error("Erro ao carregar explorar:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentPage]);

  const filteredCourses = courses.filter((course) => {
    const courseCatId = typeof course.category === "object" ? course.category?.id : course.category;
    const matchesCategory = activeCategory ? courseCatId === activeCategory : true;

    const matchesSearch = (() => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = course.title?.toLowerCase().includes(query);
      const categoryName = typeof course.category === "object" ? course.category?.name : categories.find((c) => c.id === course.category)?.name;
      return titleMatch || categoryName?.toLowerCase().includes(query);
    })();

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

  const recommendedList = expandedTopic === "recommended" ? recommendedCourses : recommendedCourses.slice(0, 4);
  const excludedIds = new Set(recommendedList.map((c: any) => c.id));

  const newAreasList = expandedTopic === "newAreas" ? newAreasCourses : newAreasCourses.filter((c: any) => !excludedIds.has(c.id)).slice(0, 4);
  newAreasList.forEach((c: any) => excludedIds.add(c.id));

  const popularCoursesData = courses.filter((c: any) => !excludedIds.has(c.id));
  const popularList = expandedTopic === "popular" ? popularCoursesData : popularCoursesData.slice(0, 4);
  popularList.forEach((c: any) => excludedIds.add(c.id));

  const recentCoursesData = [...courses].filter((c: any) => !excludedIds.has(c.id)).reverse();
  const recentList = expandedTopic === "recent" ? recentCoursesData : recentCoursesData.slice(0, 4);

  const isBrowsingResults = Boolean(activeCategory || searchQuery || sortBy !== "default" || durationFilter !== "all");
  const hasActiveFilters = activeCategory !== null || sortBy !== "default" || durationFilter !== "all" || searchQuery !== "" || expandedTopic !== null;

  const handleResetFilters = () => {
    setActiveCategory(null);
    setSortBy("default");
    setDurationFilter("all");
    setSearchQuery("");
    setExpandedTopic(null);
    setCurrentPage(1);
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
          <CategoryFilters categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
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
        )}
      </main>
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