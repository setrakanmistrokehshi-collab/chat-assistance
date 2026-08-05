import React from "react";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

const resolveUrl = (url) => (url?.startsWith("http") ? url : `${API_ORIGIN}${url}`);

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm ${
          isUser
            ? "bg-brand-600 text-white rounded-br-sm"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700"
        }`}
      >
        {message.content}

        {message.attachments?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((att, i) => (
              <a
                key={i}
                href={resolveUrl(att.url)}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1 text-xs underline ${
                  isUser ? "text-brand-100" : "text-brand-600 dark:text-brand-400"
                }`}
              >
                📎 {att.originalName}
              </a>
            ))}
          </div>
        )}

        {message.generatedFiles?.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.generatedFiles.map((file, i) => (
              <a
                key={i}
                href={resolveUrl(file.url)}
                download
                className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 underline"
              >
                ⬇️ Download {file.type.toUpperCase()}: {file.originalName}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
