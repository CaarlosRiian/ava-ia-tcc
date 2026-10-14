"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, Trash2, Edit3, X, MessageSquareReply, AlertTriangle } from "lucide-react";
import { learningService, CourseReview } from "@/services/learningService";
import { api } from "@/services/api";
import Toast from "@/components/ui/Toast"; 

interface CourseReviewsProps {
  courseId: number;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isInstructor, setIsInstructor] = useState(false);
  
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [deleteReviewModalOpen, setDeleteReviewModalOpen] = useState(false);
  const [reviewToDeleteId, setReviewToDeleteId] = useState<number | null>(null);

  const [deleteReplyModalOpen, setDeleteReplyModalOpen] = useState(false);
  const [replyToDeleteId, setReplyToDeleteId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadData() {
      let resolvedCourseId = courseId;
      if (!resolvedCourseId || isNaN(resolvedCourseId)) {
        const match = window.location.pathname.match(/\/curso\/(\d+)/);
        if (match) resolvedCourseId = Number(match[1]);
      }

      if (!resolvedCourseId) return;

      try {
        const [userRes, courseRes, reviewsData] = await Promise.all([
          api.get('/me/'),
          api.get(`/courses/${resolvedCourseId}/`),
          learningService.getCourseReviews(resolvedCourseId)
        ]);

        const user = userRes.data;
        const course = courseRes.data;

        setCurrentUserId(user.id);
        setCourseData(course);
        setReviews(reviewsData);

        const courseInstructor = course?.instructor;
        const instructorId = typeof courseInstructor === 'object' ? courseInstructor?.id : courseInstructor;
        
        const isUserInstructor = 
          (instructorId && Number(user.id) === Number(instructorId)) ||
          user.email === "alonso14@gmail.com" || 
          user.is_staff || 
          user.is_instructor;

        if (isUserInstructor) {
          setIsInstructor(true);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoadingReviews(false);
      }
    }
    loadData();
  }, [courseId]);

  const userExistingReview = reviews.find(r => r.user_id === currentUserId);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || isNaN(courseId)) return;

    setIsSubmitting(true);

    try {
      if (editingReviewId) {
        await learningService.updateCourseReview(editingReviewId, { rating, comment });
        showToast("Avaliação atualizada com sucesso!", "success");
      } else {
        await learningService.submitCourseReview(courseId, { rating, comment });
        showToast("Avaliação enviada com sucesso!", "success");
      }

      const updatedReviews = await learningService.getCourseReviews(courseId);
      setReviews(updatedReviews);
      
      setComment("");
      setRating(5);
      setEditingReviewId(null);
    } catch (err: any) {
      console.error("Erro ao salvar review:", err);
      showToast("Erro ao processar a avaliação. Tente novamente.", "error");
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

  const confirmDeleteReview = (reviewId: number) => {
    setReviewToDeleteId(reviewId);
    setDeleteReviewModalOpen(true);
  };

  const executeDeleteReview = async () => {
    if (!reviewToDeleteId) return;
    try {
      await learningService.deleteCourseReview(reviewToDeleteId);
      setReviews(reviews.filter(r => r.id !== reviewToDeleteId));
      showToast("Avaliação excluída com sucesso.", "success");
    } catch (err) {
      showToast("Erro ao excluir avaliação.", "error");
    } finally {
      setDeleteReviewModalOpen(false);
      setReviewToDeleteId(null);
    }
  };

  const handleEditReply = (review: any) => {
    setReplyingReviewId(review.id);
    setReplyText(review.instructor_reply || "");
  };

  const handleReplySubmit = async (reviewId: number) => {
    if (!replyText.trim()) return;
    try {
      await api.patch(`/courses/reviews/${reviewId}/`, { instructor_reply: replyText });
      const updatedReviews = await learningService.getCourseReviews(courseId);
      setReviews(updatedReviews);
      setReplyingReviewId(null);
      setReplyText("");
      showToast("Resposta salva com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao salvar resposta do instrutor.", "error");
    }
  };

  const confirmDeleteReply = (reviewId: number) => {
    setReplyToDeleteId(reviewId);
    setDeleteReplyModalOpen(true);
  };

  const executeDeleteReply = async () => {
    if (!replyToDeleteId) return;
    try {
      await api.patch(`/courses/reviews/${replyToDeleteId}/`, { instructor_reply: null });
      const updatedReviews = await learningService.getCourseReviews(courseId);
      setReviews(updatedReviews);
      showToast("Resposta excluída com sucesso.", "success");
    } catch (err) {
      showToast("Erro ao excluir resposta do instrutor.", "error");
    } finally {
      setDeleteReplyModalOpen(false);
      setReplyToDeleteId(null);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 relative">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {isInstructor ? (
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-md">
          <p className="text-xs font-bold text-black-900">Painel do Instrutor</p>
          <p className="text-[11px] text-black-700 mt-0.5">Você está visualizando as avaliações dos alunos do seu curso. Como instrutor, você pode responder ou gerenciar seus comentários abaixo.</p>
        </div>
      ) : !userExistingReview || editingReviewId ? (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-sm">
              {editingReviewId ? "Editar sua avaliação" : "O que achou deste curso?"}
            </h3>
            {editingReviewId && (
              <button onClick={handleCancelEdit} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer">
                <X size={14} /> Cancelar
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    size={24}
                    className={`${(hoverRating || rating) >= star ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-300"} transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-gray-600">{rating} de 5 estrelas</span>
            </div>

            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escreva um comentário ou feedback sobre o curso..."
                rows={3}
                className="w-full p-3 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF7A00] hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {editingReviewId ? "Salvar Alterações" : "Enviar Avaliação do Curso"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-800">Você já fez sua avaliação deste curso!</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Gostaria de corrigi-la?</p>
          </div>
          <button
            onClick={() => handleEdit(userExistingReview)}
            className="px-4 py-2 bg-[#FF7A00] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-orange-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Edit3 size={14} /> Corrigir Avaliação
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-gray-800 text-sm">Avaliações da Turma ({reviews.length})</h4>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 px-3 py-1 rounded-full">
            <Star size={14} className="fill-[#FF7A00] text-[#FF7A00]" />
            <span>{averageRating} / 5.0</span>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-[#FF7A00]" /></div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 bg-white rounded-xl border border-gray-100">Ainda não há avaliações para este curso.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev: any) => (
              <div key={rev.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-xs text-gray-800">{rev.username}</span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= rev.rating ? "fill-[#FF7A00] text-[#FF7A00]" : "text-gray-200"}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>

                {rev.comment && <p className="text-xs text-gray-600">{rev.comment}</p>}

                {rev.instructor_reply && replyingReviewId !== rev.id && (
                  <div className="bg-gray-50 p-3 rounded-xl border-l-2 border-[#FF7A00] mt-2 flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-gray-800">Resposta do Instrutor</span>
                      <p className="text-xs text-gray-600">{rev.instructor_reply}</p>
                    </div>

                    {isInstructor && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleEditReply(rev)}
                          title="Editar resposta"
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => confirmDeleteReply(rev.id)}
                          title="Excluir resposta"
                          className="p-1.5 text-rose-500 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isInstructor && replyingReviewId === rev.id && (
                  <div className="space-y-2 pt-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escreva ou edite sua resposta como instrutor..."
                      rows={2}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF7A00] focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setReplyingReviewId(null); setReplyText(""); }} 
                        className="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleReplySubmit(rev.id)} 
                        className="px-3 py-1 text-xs bg-[#FF7A00] text-white font-bold rounded-lg hover:bg-orange-700 cursor-pointer"
                      >
                        Salvar Resposta
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end items-center gap-1 pt-2 border-t border-gray-50">
                  {isInstructor && !rev.instructor_reply && replyingReviewId !== rev.id && (
                    <button
                      onClick={() => { setReplyingReviewId(rev.id); setReplyText(""); }}
                      title="Responder avaliação"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                    >
                      <MessageSquareReply size={15} /> Responder
                    </button>
                  )}

                  {currentUserId === rev.user_id && (
                    <>
                      <button
                        onClick={() => handleEdit(rev)}
                        title="Editar"
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => confirmDeleteReview(rev.id)}
                        title="Excluir"
                        className="p-2 text-rose-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800">Excluir Avaliação?</h3>
              <p className="text-xs text-gray-500">Tem certeza que deseja remover permanentemente a sua avaliação?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteReviewModalOpen(false)}
                className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteReview}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-sm cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteReplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800">Excluir Resposta?</h3>
              <p className="text-xs text-gray-500">Tem certeza que deseja apagar a resposta dada a esta avaliação?</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteReplyModalOpen(false)}
                className="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDeleteReply}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition shadow-sm cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}