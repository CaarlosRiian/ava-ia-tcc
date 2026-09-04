"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

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
    <div className="space-y-4">
      {messages.map((msg) => {
        const isBot = msg.sender === "bot";
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}
          >
            <div className={`flex gap-2.5 w-full ${isBot ? "justify-start" : "justify-end"}`}>
              {isBot && (
                <div className="h-8 w-8 rounded-xl bg-[#2F52E0] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl shadow-sm text-sm max-w-[85%] border ${
                  isBot
                    ? "bg-white text-gray-800 border-gray-100 rounded-tl-xs"
                    : "bg-[#2F52E0] text-white border-transparent rounded-tr-xs"
                }`}
              >
                {isBot ? (
                  <div className="prose prose-sm max-w-none text-gray-800 dark:prose-invert leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl overflow-x-auto text-xs my-2">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                )}
              </div>

              {!isBot && (
                <div className="h-8 w-8 rounded-xl bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4.5 w-4.5 text-gray-600" />
                </div>
              )}
            </div>

            <span className={`text-[10px] text-gray-400 mt-1 ${isBot ? "ml-10.5" : "mr-10.5"}`}>
              {formatTime(msg.timestamp)}
            </span>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-start gap-2.5 justify-start">
          <div className="h-8 w-8 rounded-xl bg-[#2F52E0] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Bot className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-1.5 h-10">
            <span className="w-2 h-2 bg-[#2F52E0] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-[#2F52E0] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-[#2F52E0] rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}