import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWishlist, toggleWishlist } from "./wishlist.service";

export interface WishlistItem {
  id: number;
  course: number;
  title: string;
  author: string;
  price?: string | number;
  hours?: number;
  thumbnail?: string | null;  
  lessons_count: number;
}

export function useWishlist() {
  const [wishlistCourses, setWishlistCourses] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        router.push("/entrar");
        return;
      }

      const data = await getWishlist(token);
      const list = data?.results || data || [];
      setWishlistCourses(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(courseId: number) {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      await toggleWishlist(token, courseId);

      setWishlistCourses((prev) =>
        prev.filter((item) => item.course !== courseId)
      );
    } catch (error) {
      console.error(error);
    }
  }

  return {
    wishlistCourses,
    loading,
    removeItem,
  };
}