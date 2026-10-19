"use client";

import { Star, Send, Loader2, Trash2, Edit3, X, MessageSquareReply, AlertTriangle } from "lucide-react";
import Toast from "@/components/ui/Toast"; 
import { useCourseReviews } from "./hooks/useCourseReviews";

interface CourseReviewsProps {
  courseId: number;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const {
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
  } = useCourseReviews(courseId);

  const averageRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 relative">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {isOwnerInstructor ? (
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-md space-y-1">
          <p className="text-xs font-bold text-black">Restrição de Instrutor</p>
          <p className="text-[11px] text-black">Como criador/instrutor deste curso, você não pode enviar avaliações para o seu próprio conteúdo.</p>
        </div>
      ) : isInstructor ? (
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-md">
          <p className="text-xs font-bold text-gray-900">Painel do Instrutor</p>
          <p className="text-[11px] text-gray-700 mt-0.5">Você está visualizando as avaliações. Como instrutor, você pode responder aos comentários dos alunos abaixo.</p>
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
          <h4 className="font-bold text-gray-800 text-sm">Avaliações da Turma ({reviewsList.length})</h4>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 px-3 py-1 rounded-full">
            <Star size={14} className="fill-[#FF7A00] text-[#FF7A00]" />
            <span>{averageRating} / 5.0</span>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 animate-spin text-[#FF7A00]" /></div>
        ) : reviewsList.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6 bg-white rounded-xl border border-gray-100">Ainda não há avaliações para este curso.</p>
        ) : (
          <div className="space-y-3">
            {reviewsList.map((rev: any) => (
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
                          onClick={() => { setReplyingReviewId(rev.id); setReplyText(rev.instructor_reply); }}
                          title="Editar resposta"
                          className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => { setReviewToDeleteId(rev.id); setDeleteReplyModalOpen(true); }}
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
                        onClick={() => { setReviewToDeleteId(rev.id); setDeleteReviewModalOpen(true); }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
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