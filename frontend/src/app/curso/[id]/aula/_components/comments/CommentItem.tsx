"use client";

import { useState } from "react";
import { Edit2, Trash2, Check, X, Reply } from "lucide-react";
import { formatName } from "@/utils/formatName";
import { Comment } from "./types";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  currentUser: string | null;
  lessonId: number;
  apiBaseUrl: string;
  onDeleteClick: (id: number) => void;
  onSendReply: (parentId: number, content: string) => Promise<void>;
  onUpdateComment: (commentId: number, content: string) => void;
}

export default function CommentItem({
  comment,
  isReply = false,
  currentUser,
  lessonId,
  apiBaseUrl,
  onDeleteClick,
  onSendReply,
  onUpdateComment
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [updating, setUpdating] = useState(false);

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const authorName = comment.user_name || comment.user || "Usuário";
  const authorAvatar = comment.user_avatar || comment.avatar_url || comment.avatar || "";

  const isOwner = currentUser && comment.user && comment.user.toLowerCase() === currentUser.toLowerCase();
  const formattedDate = comment.created_at
    ? new Date(comment.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  const handleSaveEdit = async () => {
    if (!editContent.trim() || updating) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${apiBaseUrl}/lessons/${lessonId}/comments/${comment.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content: editContent })
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateComment(comment.id, updated.content);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Erro ao editar comentário:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || submittingReply) return;
    setSubmittingReply(true);
    await onSendReply(comment.id, replyContent);
    setSubmittingReply(false);
    setIsReplying(false);
    setReplyContent("");
  };

  return (
    <div
      className={`p-4 bg-[#FFFFFF] shadow-md border border-gray-100 rounded-xl space-y-2 group ${
        isReply ? "ml-6 sm:ml-10 mt-3 border-l-2 border-l-[black]/40" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`rounded-full bg-white border border-gray-300 text-[#000000] flex items-center justify-center font-bold text-xs overflow-hidden ${
              isReply ? "w-6 h-6" : "w-8 h-8"
            }`}
          >
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              formatName(authorName).charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-bold text-sm text-gray-800">{formatName(authorName)}</span>
        </div>

        <div className="flex items-center gap-3">
          {formattedDate && <span className="text-[11px] text-gray-400 font-medium">{formattedDate}</span>}

          {isOwner && !isEditing && (
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setEditContent(comment.content);
                }}
                className="p-2 text-black hover:text-black hover:bg-[#f2f2f2] rounded-full transition-colors duration-200 cursor-pointer"
                title="Editar"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteClick(comment.id)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-[#f2f2f2] rounded-full transition-colors duration-200 cursor-pointer"
                title="Excluir"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="pl-10 space-y-2 pt-1">
          <textarea
            rows={2}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 bg-white border border-[black] rounded-xl text-sm text-gray-800 focus:outline-none resize-none"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              <X size={13} /> Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updating || !editContent.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#FF7A00] text-white rounded-lg text-xs font-semibold hover:opacity-95 transition cursor-pointer disabled:opacity-50"
            >
              <Check size={13} /> {updating ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      ) : (
        <div className="pl-10 space-y-2">
          <p className="text-sm text-gray-600 whitespace-pre-line">{comment.content}</p>

          {!isReply && (
            <button
              type="button"
              onClick={() => {
                setIsReplying(!isReplying);
                setReplyContent("");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-black hover:bg-[#f2f2f2] rounded-full px-3 py-2 transition-colors duration-200 cursor-pointer"
            >
              <Reply size={13} /> Responder
            </button>
          )}
        </div>
      )}

      {isReplying && (
        <div className="pl-10 pt-3 space-y-2 animate-fadeIn">
          <textarea
            rows={2}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Respondendo a ${formatName(authorName)}...`}
            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#2F52E0] resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200/60 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={submittingReply || !replyContent.trim()}
              className="px-4 py-1.5 bg-[#FF7A00] text-white rounded-lg text-xs font-bold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {submittingReply ? "Enviando..." : "Enviar Resposta"}
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 pt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              currentUser={currentUser}
              lessonId={lessonId}
              apiBaseUrl={apiBaseUrl}
              onDeleteClick={onDeleteClick}
              onSendReply={onSendReply}
              onUpdateComment={onUpdateComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}