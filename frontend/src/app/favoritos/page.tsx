"use client";

import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import { Heart } from "lucide-react";
import { useFavorites } from "./useFavorites";
import { formatName } from "@/utils/formatName";

export default function Favoritos() {
  const { favoriteCourses, loading, removeFavorite } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-[#161B1D] mb-2">
          Meus Favoritos
        </h1>

        <p className="text-gray-500 font-light text-lg mb-10">
          Cursos que você salvou para assistir depois
        </p>

        {loading ? (
          <p className="text-gray-400 text-center py-20">
            Carregando favoritos...
          </p>
        ) : favoriteCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoriteCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.course}
                title={course.title}
                author={formatName(course.author)}
                hours={course.hours}
                showFavoriteButton
                isFavorite
                onToggleFavorite={() => removeFavorite(course.course)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 mt-4">
            <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />

            <h2 className="text-xl font-bold mb-2">
              Sua lista está vazia
            </h2>

            <p className="text-gray-400 mb-8">
              Navegue pelo catálogo e salve os cursos que mais te interessam.
            </p>

            <Link href="/descobrir">
              <button className="px-8 py-3 bg-[#2F52E0] text-white rounded-xl font-bold hover:bg-blue-700 transition-all cursor-pointer">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}