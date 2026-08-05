import React, { useRef, useState } from "react";

const ACCEPTED = ".txt,.pdf,.docx,.csv,.md";

const MessageInput = ({ onSend, onOpenGenerate, sending }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    onSend({ content: text.trim(), file });
    setText("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
    >
      {file && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 w-fit">
          📎 {file.name}
          <button type="button" onClick={() => setFile(null)} className="text-red-500 font-bold">
            ×
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onOpenGenerate}
          title="Generate PDF, DOCX, or image"
          className="shrink-0 rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ✨
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
          className="shrink-0 rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 max-h-32"
        />

        <button
          type="submit"
          disabled={sending || (!text.trim() && !file)}
          className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
