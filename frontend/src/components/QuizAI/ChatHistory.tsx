"use client";

import { Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date | string;
}

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  formatTime: (timestamp: Date | string) => string;
}

export default function ChatHistory({ messages, isLoading, formatTime }: ChatHistoryProps) {
  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
        >
          <div className={`flex gap-3 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}

            <div
              className={`p-3 rounded-2xl shadow-sm text-sm border max-w-[85%] ${
                msg.sender === "user"
                  ? "bg-[#2F52E0] text-white border-transparent rounded-tr-none"
                  : "bg-white text-gray-700 border-gray-100 rounded-tl-none"
              }`}
            >
              <div className="prose prose-sm max-w-none break-words leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>

          <span className={`text-[12px] text-gray-400 mt-1 ${msg.sender === "user" ? "mr-11" : "ml-11"}`}>
            {formatTime(msg.timestamp)}
          </span>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 justify-start items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3 w-3 animate-spin text-[#2F52E0]" />
            O tutor está processando...
          </div>
        </div>
      )}
    </>
  );
}