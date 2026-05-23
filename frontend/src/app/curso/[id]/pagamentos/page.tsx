"use client";

import { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; 
import Link from "next/link"; 
import { toast } from "react-hot-toast";

import { getCourseDetail, enrollInCourse, getMyCourses } from "@/services/courses"; 

import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import { formatName } from "@/utils/formatName";

import CheckoutHeader from "./_components/checkout-header";
import PaymentTabs from "./_components/payment-tabs";
import OrderSummary from "./_components/order-summary";

interface CourseData {
  id: number;
  title: string;
  description: string;
  professor_name: string;
  price: string | number;
  thumbnail: string | null;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const courseIdNum = Number(id);
  
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseAndCheckAccess() {
      try {
        if (!id || isNaN(courseIdNum)) return;

        const token = localStorage.getItem("access");

        if (!token) {
          router.replace(`/login?redirect=/curso/${courseIdNum}/pagamentos`);
          return;
        }

        const [myCourses, courseData] = await Promise.all([
          getMyCourses(),
          getCourseDetail(courseIdNum)
        ]);

        const isEnrolled = myCourses?.some((c: any) => {
          if (!c) return false;
          
          if (c.course_id !== undefined && c.course_id !== null) {
            return Number(c.course_id) === courseIdNum;
          }
          if (typeof c === "number" || typeof c === "string") return Number(c) === courseIdNum;
          if (c.course && typeof c.course === "object") return Number(c.course.id) === courseIdNum;
          if (c.course) return Number(c.course) === courseIdNum;
          return Number(c.id) === courseIdNum;
        });

        if (isEnrolled) {
          router.replace(`/curso/${courseIdNum}`);
          return;
        }

        if (courseData) setCourse(courseData);
      } catch (error: any) {
        toast.error(error.message || "Não foi possível carregar as informações do checkout.");
      } finally {
        setLoading(false);
      }
    }

    loadCourseAndCheckAccess();
  }, [id, courseIdNum, router]);

  const price = Number(course?.price) || 0;
  const formattedPrice = useMemo(
    () => price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    [price]
  );
  
  const formattedTitle = useMemo(() => {
    return course?.title ? formatName(course.title) : "";
  }, [course?.title]);

  const formattedProfessorName = useMemo(() => {
    return course?.professor_name ? formatName(course.professor_name) : "";
  }, [course?.professor_name]);

  const handleConfirm = async () => {
    if (!course) return;
    
    try {
      await enrollInCourse(course.id);
      toast.success("Matrícula realizada com sucesso!");
      setTimeout(() => router.push(`/curso/${course.id}`), 1200);
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao processar a matrícula.");
    }
  };

  if (loading) {
    return <LoadingScreen text="Carregando detalhes do pagamento..." />
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 container py-20 text-center">
          <p className="text-muted-foreground">Curso não encontrado.</p>
          <Link href="/explorar">
            <button className="mt-4 px-4 py-2 border rounded-md hover:bg-muted cursor-pointer">Voltar</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 bg-muted/30 py-10">
        <div className="container max-w-5xl px-4 mx-auto">
          <CheckoutHeader courseId={course.id} />
          
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <PaymentTabs price={price} formattedPrice={formattedPrice} onConfirm={handleConfirm} />
            </div>
            <div className="lg:col-span-1">
              <OrderSummary title={formattedTitle} author={formattedProfessorName} formattedPrice={formattedPrice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}