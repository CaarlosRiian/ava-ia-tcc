"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, ChevronDown } from "lucide-react";
import { Comment, LessonCommentsProps } from "../_components/comments/types";
import CommentItem from "../_components/comments/CommentItem";
import DeleteModal from "../_components/comments/DeleteModal";
import Toast from "@/components/ui/Toast"; 

export default function LessonComments({ lessonId, apiBaseUrl }: LessonCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  const fetchComments = async (pageNum = 1, isAppend = false) => {
    try {
      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      const token = localStorage.getItem("access");
      const res = await fetch(`${apiBaseUrl}/lessons/${lessonId}/comments/?page=${pageNum}&page_size=5`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        const fetchedList = data.results || (Array.isArray(data) ? data : []);
        const total = data.total_count ?? fetchedList.length;
        const next = data.has_next ?? false;

        setTotalCount(total);
        setHasNext(next);
        setPage(pageNum);

        if (isAppend) {
          setComments((prev) => [...prev, ...fetchedList]);
        } else {
          setComments(fetchedList);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    setCurrentUser(storedUser);

    if (lessonId && apiBaseUrl) {
      fetchComments(1, false);
    }
  }, [lessonId, apiBaseUrl]);

  const handleLoadMore = () => {
    if (!loadingMore && hasNext) {
      fetchComments(page + 1, true);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${apiBaseUrl}/lessons/${lessonId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        const createdComment = await res.json();
        setComments((prev) => [createdComment, ...prev]);
        setTotalCount((prev) => prev + 1);
        setNewComment("");
        showToast("Comentário publicado com sucesso!");
      } else {
        showToast("Erro ao enviar comentário.", "error");
      }
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      showToast("Erro de conexão com o servidor.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (parentId: number, content: string) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${apiBaseUrl}/lessons/${lessonId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content, parent: parentId })
      });

      if (res.ok) {
        const createdReply = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies || []), createdReply] } : c))
        );
        setTotalCount((prev) => prev + 1);
        showToast("Resposta enviada com sucesso!");
      } else {
        showToast("Erro ao enviar resposta.", "error");
      }
    } catch (err) {
      console.error("Erro ao responder comentário:", err);
      showToast("Erro de conexão com o servidor.", "error");
    }
  };

  const handleUpdateComment = (commentId: number, newContent: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content: newContent }
          : { ...c, replies: c.replies?.map((r) => (r.id === commentId ? { ...r, content: newContent } : r)) }
      )
    );
    showToast("Comentário atualizado com sucesso!");
  };

  const confirmDeleteComment = async () => {
    if (!deletingId || deleting) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${apiBaseUrl}/lessons/${lessonId}/comments/${deletingId}/`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok || res.status === 204) {
        setComments((prevComments) => {
          const filtered = prevComments.filter((c) => c.id !== deletingId);
          return filtered.map((c) => ({
            ...c,
            replies: c.replies ? c.replies.filter((r) => r.id !== deletingId) : []
          }));
        });
        setTotalCount((prev) => Math.max(0, prev - 1));
        showToast("Comentário excluído com sucesso!");
      } else {
        showToast("Erro ao excluir comentário.", "error");
      }
    } catch (err) {
      console.error("Erro ao excluir comentário:", err);
      showToast("Erro de conexão ao excluir.", "error");
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 mt-6 relative">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-[#2F52E0]" />
        <h3 className="font-bold text-lg text-[#161B1D]">Dúvidas e Comentários ({totalCount})</h3>
      </div>

      <form onSubmit={handleAddComment} className="mb-8">
        <div className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva sua dúvida ou comentário sobre esta aula..."
            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2F52E0] text-sm text-gray-800 placeholder-gray-400 resize-none transition"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#2F52E0] text-white rounded-xl font-bold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={15} />
              {submitting ? "Enviando..." : "Comentar"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-gray-400 text-center py-4">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            Nenhum comentário nesta aula ainda. Seja o primeiro a comentar!
          </p>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                lessonId={lessonId}
                apiBaseUrl={apiBaseUrl}
                onDeleteClick={(id) => setDeletingId(id)}
                onSendReply={handleSendReply}
                onUpdateComment={handleUpdateComment}
              />
            ))}

            {hasNext && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <ChevronDown size={14} className={loadingMore ? "animate-spin" : ""} />
                  {loadingMore ? "Carregando mais..." : "Carregar mais comentários"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteModal
        isOpen={!!deletingId}
        deleting={deleting}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDeleteComment}
      />

      <Toast message={toast?.message || null} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}