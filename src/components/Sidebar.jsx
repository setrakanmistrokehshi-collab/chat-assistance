import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle.jsx";

const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = (conv) => {
    setEditingId(conv._id);
    setEditValue(conv.title);
  };

  const submitRename = (id) => {
    if (editValue.trim()) onRename(id, editValue.trim());
    setEditingId(null);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static z-30 h-full w-72 shrink-0 flex-col bg-gray-100 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-transform md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex flex`}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h1>
          <ThemeToggle />
        </div>

        <div className="px-3">
          <button
            onClick={onNewChat}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            + New Conversation
          </button>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                activeId === conv._id
                  ? "bg-brand-100 dark:bg-brand-600/20 text-brand-700 dark:text-brand-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {editingId === conv._id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => submitRename(conv._id)}
                  onKeyDown={(e) => e.key === "Enter" && submitRename(conv._id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-b border-brand-500 outline-none"
                />
              ) : (
                <span className="truncate">{conv.title}</span>
              )}

              <div className="hidden group-hover:flex items-center gap-2 ml-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(conv);
                  }}
                  title="Rename"
                  className="text-gray-500 hover:text-brand-600"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this conversation?")) onDelete(conv._id);
                  }}
                  title="Delete"
                  className="text-gray-500 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="px-3 py-4 text-sm text-gray-400">No conversations yet.</p>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{user?.name}</span>
          <button
            onClick={logout}
            className="text-sm font-medium text-red-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
