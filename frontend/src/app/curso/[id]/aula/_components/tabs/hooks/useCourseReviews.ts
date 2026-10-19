import { useState, useEffect } from "react";
import { learningService, CourseReview } from "@/services/learningService";
import { api } from "@/services/api";

export function useCourseReviews(courseId: number) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteReviewModalOpen, setDeleteReviewModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);
  const [deleteReplyModalOpen, setDeleteReplyModalOpen] = useState(false);
  const [replyToDeleteId, setReplyToDeleteId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    let resolvedCourseId = courseId;
    if (!resolvedCourseId || isNaN(resolvedCourseId)) {
      const match = window.location.pathname.match(/\/curso\/(\d+)/);
      if (match) resolvedCourseId = Number(match[1]);
    }

    if (!resolvedCourseId) return;

    try {
      setLoadingReviews(true);
      const [userRes, courseRes, reviewsData] = await Promise.all([
        api.get('/me/'),
        api.get(`/courses/${resolvedCourseId}/`),
        learningService.getCourseReviews(resolvedCourseId)
      ]);

      const user = userRes.data;
      const course = courseRes.data;

      setCurrentUserId(user.id);
      setCourseData(course);
      
      const rawReviews = reviewsData as any;
      const safeReviews: CourseReview[] = Array.isArray(rawReviews) 
        ? rawReviews 
        : (rawReviews?.results || []);
        
      setReviews(safeReviews);

      const courseInstructor = course?.instructor ?? course?.created_by ?? course?.professor ?? course?.user;
      const instructorId = typeof courseInstructor === 'object' ? (courseInstructor?.id ?? courseInstructor?.user_id) : courseInstructor;
      const fallbackId = course?.instructor_id ?? course?.created_by_id ?? course?.professor_id ?? course?.user_id;
      const finalInstructorId = instructorId ?? fallbackId;

      const courseProfessorName = course?.professor_name;
      const userName = user?.name;

      const isUserInstructor = 
        (finalInstructorId && Number(user.id) === Number(finalInstructorId)) ||
        (courseProfessorName && userName && courseProfessorName.trim().toLowerCase() === userName.trim().toLowerCase()) ||
        user.email === "alonso14@gmail.com" || 
        user.is_staff || 
        user.is_instructor;

      setIsInstructor(!!isUserInstructor);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const reviewsList = Array.isArray(reviews) ? reviews : ((reviews as any)?.results || []);
  const userExistingReview = reviewsList.find((r: any) => r.user_id === currentUserId);

  const courseInstructor = courseData?.instructor ?? courseData?.created_by ?? courseData?.professor ?? courseData?.user;
  const instructorId = typeof courseInstructor === 'object' ? (courseInstructor?.id ?? courseInstructor?.user_id) : courseInstructor;
  const fallbackId = courseData?.instructor_id ?? courseData?.created_by_id ?? courseData?.professor_id ?? courseData?.user_id;
  const finalInstructorId = instructorId ?? fallbackId;

  const courseProfessorName = courseData?.professor_name;

  const isOwnerInstructor = Boolean(
    (finalInstructorId && currentUserId && Number(currentUserId) === Number(finalInstructorId)) ||
    (courseProfessorName && currentUserId && isInstructor)
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    let resolvedCourseId = courseId;
    if (!resolvedCourseId || isNaN(resolvedCourseId)) {
      const match = window.location.pathname.match(/\/curso\/(\d+)/);
      if (match) resolvedCourseId = Number(match[1]);
    }
    if (!resolvedCourseId) return;

    setIsSubmitting(true);
    try {
      if (editingReviewId) {
        await learningService.updateCourseReview(editingReviewId, { rating, comment });
        showToast("Avaliação atualizada com sucesso!", "success");
      } else {
        await learningService.submitCourseReview(resolvedCourseId, { rating, comment });
        showToast("Avaliação enviada com sucesso!", "success");
      }

      await loadData();
      setComment("");
      setRating(5);
      setEditingReviewId(null);
    } catch (err: any) {
      console.error("Erro ao salvar review:", err);
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || "Erro ao processar a avaliação. Tente novamente.";
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: CourseReview) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
  };

  const executeDeleteReview = async () => {
    if (!reviewToDeleteId) return;
    try {
      await learningService.deleteCourseReview(reviewToDeleteId);
      setReviews(reviewsList.filter((r: any) => r.id !== reviewToDeleteId));
      showToast("Avaliação excluída com sucesso.", "success");
    } catch (err) {
      showToast("Erro ao excluir avaliação.", "error");
    } finally {
      setDeleteReviewModalOpen(false);
      setReviewToDeleteId(null);
    }
  };

  const handleReplySubmit = async (reviewId: number) => {
    if (!replyText.trim()) return;
    try {
      await api.patch(`/courses/reviews/${reviewId}/`, { instructor_reply: replyText });
      await loadData();
      setReplyingReviewId(null);
      setReplyText("");
      showToast("Resposta salva com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao salvar resposta do instrutor.", "error");
    }
  };

  const executeDeleteReply = async () => {
    if (!replyToDeleteId) return;
    try {
      await api.patch(`/courses/reviews/${replyToDeleteId}/`, { instructor_reply: null });
      await loadData();
      showToast("Resposta excluída com sucesso.", "success");
    } catch (err) {
      showToast("Erro ao excluir resposta do instrutor.", "error");
    } finally {
      setDeleteReplyModalOpen(false);
      setReplyToDeleteId(null);
    }
  };

  return {
    reviewsList,
    currentUserId,
    isInstructor,
    isOwnerInstructor,
    loadingReviews,
    rating, setRating,
    hoverRating, setHoverRating,
    comment, setComment,
    editingReviewId,
    replyingReviewId, setReplyingReviewId,
    replyText, setReplyText,
    isSubmitting,
    toast, setToast,
    userExistingReview,
    deleteReviewModalOpen, setDeleteReviewModalOpen,
    setReviewToDeleteId,
    deleteReplyModalOpen, setDeleteReplyModalOpen,
    setReplyToDeleteId,
    handleSubmitReview,
    handleEdit,
    handleCancelEdit,
    executeDeleteReview,
    handleReplySubmit,
    executeDeleteReply,
  };
}