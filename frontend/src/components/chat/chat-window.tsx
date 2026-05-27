"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Copy, Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { Message } from "@/types/database";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (content: string) => void;
  onRetry?: () => void;
}

export function ChatWindow({ messages, isLoading, onSend, onRetry }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput("");
    onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full">
      {/* SAHJONY Brain Status Bar */}
      <div className="px-4 py-2 border-b border-border/50 bg-gradient-to-r from-indigo-950/30 to-purple-950/30">
        <div className="flex items-center gap-2 text-xs text-indigo-300">
          <Brain className="w-3 h-3" />
          <span>SAHJONY Brain Active</span>
          <span className="text-zinc-600">•</span>
          <Sparkles className="w-3 h-3" />
          <span>Freebuff Multi-Agent + Hermes Memory</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">SAHJONY is ready</h3>
            <p className="text-sm text-indigo-300 mb-2">Powered by Freebuff + Hermes</p>
            <p className="text-sm text-zinc-500">
              Start a conversation and I'll help you with any task
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "user" ? "bg-primary" : "bg-surface border border-border"
              )}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-primary" />
              )}
            </div>

            <div
              className={cn(
                "flex-1 max-w-2xl",
                message.role === "user" ? "text-right" : "text-left"
              )}
            >
              <div
                className={cn(
                  "inline-block px-4 py-2 rounded-lg text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-surface border border-border rounded-tl-none"
                )}
              >
                {message.content}
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                <span>{formatDate(message.created_at)}</span>
                <button
                  onClick={() => copyMessage(message.content)}
                  className="p-1 hover:text-white transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-lg rounded-tl-none px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {messages.length > 0 && isLoading && !isStreaming && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-surface border border-border rounded-lg rounded-tl-none px-4 py-2">
              <span className="text-sm text-zinc-400">Processing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-surface/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-[200px] resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="h-[44px] px-4">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-zinc-500">
            Press Enter to send, Shift+Enter for new line
          </p>
          <div className="flex items-center gap-1 text-xs text-indigo-400">
            <Brain className="w-3 h-3" />
            <span>SAHJONY</span>
          </div>
        </div>
      </div>
    </div>
  );
}