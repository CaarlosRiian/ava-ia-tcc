"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CourseCard from "@/components/CourseCard";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Heart, Trash2 } from "lucide-react";
import { useWishlist } from "./useWishlist";
import { formatName } from "@/utils/formatName";
import LoadingScreen from "@/components/LoadingScreen";
import Footer from "@/components/Footer";
import Toast from "@/components/ui/Toast";
import { RemoveWishlistModal } from "./_components/RemoveWishlistModal";

export default function ListaDeDesejos() {
  const { wishlistCourses, loading, removeItem } = useWishlist();

  useEffect(() => {
    if (!loading) {
      console.log("Cursos carregados:", wishlistCourses);
    }
  }, [wishlistCourses, loading]);

  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type?: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: undefined,
    isVisible: false,
  });

  const [selectedCourse, setSelectedCourse] = useState<{
    courseId: number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type?: "success" | "error") => {
    setToastConfig({ message, type, isVisible: true });
  };

  const handleConfirmRemove = async () => {
    if (!selectedCourse) return;

    try {
      setIsDeleting(true);
      await removeItem(selectedCourse.courseId);
      showToast("Curso removido da Lista de Desejos", undefined);
      setSelectedCourse(null);
    } catch (error) {
      showToast("Erro ao remover o curso. Tente novamente.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] relative">
      <Header />

      {toastConfig.isVisible && (
        <Toast
          message={toastConfig.message}
          type={toastConfig.type}
          onClose={() => setToastConfig((prev) => ({ ...prev, isVisible: false }))}
        />
      )}

      <RemoveWishlistModal
        open={!!selectedCourse}
        onOpenChange={(open) => !open && setSelectedCourse(null)}
        courseTitle={selectedCourse?.title || ""}
        onConfirm={handleConfirmRemove}
        loading={isDeleting}
      />

      <Breadcrumb items={[{ label: "Lista de Desejos" }]} />

      <main className="flex-1 container mx-auto px-6 pt-6 pb-12">
        <h1 className="text-3xl font-black text-[#161B1D] mb-2">
          Minha Lista de Desejos
        </h1>

        <p className="text-gray-500 font-light text-lg mb-10">
          Cursos que você salvou para assistir ou comprar no futuro
        </p>

        {loading ? (
          <LoadingScreen text="Carregando lista de desejos..." />
        ) : wishlistCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistCourses.map((course) => {
              // Log individual de cada curso e sua thumbnail para rastreio preciso
              console.log(`🖼️ [Wishlist Item] Curso: ${course.title} | Thumbnail recebida:`, course.thumbnail);

              return (
                <div 
                  key={course.id} 
                  className="flex flex-col bg-white border border-gray-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <CourseCard
                      id={course.course}
                      title={course.title}
                      author={formatName(course.author)}
                      price={course.price}                
                      hours={course.hours}
                      thumbnail={course.thumbnail || (course as any).course_thumbnail || (course as any).image || undefined}
                      lessonsCount={course.lessons_count}
                      showFavoriteButton={false}
                    />
                  </div>

                  <button
                    onClick={() => setSelectedCourse({ courseId: course.course, title: course.title })}
                    className="mt-3 w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-100 active:scale-[0.98]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remover da Lista</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-gray-200 shadow-sm">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-[#161B1D] mb-2">
              Sua lista de desejos está vazia
            </h2>

            <p className="text-gray-400 mb-8 font-light max-w-sm mx-auto">
              Navegue pelo catálogo e salve os cursos que mais te interessam.
            </p>

            <Link href="/descobrir">
              <button className="px-8 py-3 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-[#ea7306] transition-all shadow-md cursor-pointer">
                Explorar Cursos
              </button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}