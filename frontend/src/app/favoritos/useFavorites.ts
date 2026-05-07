"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFavorites, toggleFavorite } from "./favorites.service";

export interface FavoriteCourse {
  id: number;
  course: number;
  title: string;
  author: string;
  hours: number;
}

export function useFavorites() {
  const [favoriteCourses, setFavoriteCourses] = useState<FavoriteCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const token = localStorage.getItem("access");

      if (!token) {
        router.push("/entrar");
        return;
      }

      const data = await getFavorites(token);
      setFavoriteCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(courseId: number) {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      await toggleFavorite(token, courseId);

      setFavoriteCourses((prev) =>
        prev.filter((item) => item.course !== courseId)
      );
    } catch (error) {
      console.error(error);
    }
  }

  return {
    favoriteCourses,
    loading,
    removeFavorite,
  };
}