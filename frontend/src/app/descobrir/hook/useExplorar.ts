import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getCourses } from "@/services/courses";
import { getCategories } from "@/services/categories";
import axios from "axios";

export function useExplorar() {
  const searchParams = useSearchParams();
  const searchUrlParam = searchParams.get("search") || "";
  const categoryUrlParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<number | string | null>(
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
  const [showOnboarding, setShowOnboarding] = useState(false);

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
          getCourses(true),
          getCategories(true),
        ]);

        const rawCourses = Array.isArray(coursesData) 
          ? coursesData 
          : coursesData?.results || [];
        
        const allCategories = Array.isArray(categoriesData) 
          ? categoriesData 
          : categoriesData?.results || [];
          
        setCategories(allCategories);

        const totalCount = rawCourses.length;
        setTotalPages(Math.ceil(totalCount / 10) || 1);

        const shuffledCourses = [...rawCourses].sort(() => Math.random() - 0.5);
        setCourses(shuffledCourses);

        let userInterests: string[] = [];
        if (token) {
          try {
            const userRes = await axios.get("http://localhost:8000/api/me/", {
              headers: { Authorization: `Bearer ${token}` },
            });

            userInterests = (userRes.data.interests || []).map((i: string) => i.toLowerCase());

            if (userRes.data.onboarding_completed === false) {
              setShowOnboarding(true);
            }
          } catch (err) {
            console.error("Erro ao buscar interesses do utilizador", err);
          }
        }

        const recommended = shuffledCourses.filter((course: any) => {
          const courseCats = course.categories || [];
          return courseCats.some((cat: any) => {
            const catId = typeof cat === "object" && cat !== null ? cat.id : cat;
            const catObj = allCategories.find((c: any) => String(c.id) === String(catId));
            return userInterests.includes(catObj?.name?.toLowerCase());
          });
        });

        setRecommendedCourses(recommended.length > 0 ? recommended : shuffledCourses.slice(0, 4));

        const newAreas = shuffledCourses.filter((course: any) => {
          const courseCats = course.categories || [];
          const matchesAnyCategory = courseCats.some((cat: any) => {
            const catId = typeof cat === "object" && cat !== null ? cat.id : cat;
            const catObj = allCategories.find((c: any) => String(c.id) === String(catId));
            return userInterests.includes(catObj?.name?.toLowerCase());
          });
          return !matchesAnyCategory;
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

  const handleResetFilters = () => {
    setActiveCategory(null);
    setSortBy("default");
    setDurationFilter("all");
    setSearchQuery("");
    setExpandedTopic(null);
    setCurrentPage(1);
  };

  const filteredCourses = courses.filter((course) => {
    let courseCategoryIds: string[] = [];

    if (Array.isArray(course.categories)) {
      courseCategoryIds = course.categories.map((cat: any) => {
        if (typeof cat === "object" && cat !== null) {
          return String(cat.id || cat.name);
        }
        return String(cat);
      });
    } else if (course.category) {
      courseCategoryIds = [String(course.category)];
    }

    const activeCatStr = activeCategory !== null ? String(activeCategory) : null;

    const matchesCategory = activeCatStr !== null
      ? courseCategoryIds.some((val) => String(val) === activeCatStr)
      : true;

    const matchesSearch = (() => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return course.title?.toLowerCase().includes(query);
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

  return {
    categories,
    courses,
    loading,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    durationFilter,
    setDurationFilter,
    showAdvanced,
    setShowAdvanced,
    expandedTopic,
    setExpandedTopic,
    showOnboarding,
    setShowOnboarding,
    sortedCourses,
    recommendedCourses,
    newAreasCourses,
    handleResetFilters,
  };
}