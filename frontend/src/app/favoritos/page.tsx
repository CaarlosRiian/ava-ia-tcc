"use client";

import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Heart } from "lucide-react";
import { useFavorites } from "./useFavorites";
import { formatName } from "@/utils/formatName";
import LoadingScreen from "@/components/LoadingScreen";

export default function Favoritos() {
  const { favoriteCourses, loading, removeFavorite } = useFavorites();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
      <Header />

      <Breadcrumb items={[{ label: "Meus Favoritos" }]} />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        <h1 className="text-3xl font-black text-[#161B1D] mb-2">
          Meus Favoritos
        </h1>

        <p className="text-gray-500 font-light text-lg mb-10">
          Cursos que você salvou para assistir depois
        </p>

        {loading ? (
          <LoadingScreen text="Carregando favoritos..." />
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
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-[#161B1D] mb-2">
              Sua lista está vazia
            </h2>

            <p className="text-gray-400 mb-8 font-light max-w-sm mx-auto">
              Navegue pelo catálogo e salve os cursos que mais te interessam.
            </p>

            <Link href="/descobrir">
              <button className="px-8 py-3 bg-[#2F52E0] text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md cursor-pointer">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}