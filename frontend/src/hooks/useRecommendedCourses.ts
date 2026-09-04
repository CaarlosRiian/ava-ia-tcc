import { useState, useEffect, useCallback } from "react";
import { getRecommendedCourses } from "@/services/courses";
import { CourseRecommendation } from "@/types/course"; 

export function useRecommendedCourses() {
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecommendedCourses();
      setCourses(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar recomendações:", err);
      setError(err.message || "Erro ao carregar recomendações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    courses,
    loading,
    error,
    isEmpty: !loading && !error && courses.length === 0,
    refetch: fetchRecommendations,
  };
}