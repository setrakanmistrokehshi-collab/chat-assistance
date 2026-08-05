import React, { useEffect, useRef, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import MessageBubble from "../components/MessageBubble.jsx";
import MessageInput from "../components/MessageInput.jsx";
import GenerateFileModal from "../components/GenerateFileModal.jsx";
import {
  listConversations,
  createConversation,
  getConversation,
  renameConversation,
  deleteConversation,
  sendMessage,
  generatePdf,
  generateDocx,
  generateImage,
} from "../api/chat";

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const refreshConversations = useCallback(async () => {
    const { conversations } = await listConversations();
    setConversations(conversations);
    return conversations;
  }, []);

  useEffect(() => {
    (async () => {
      const convs = await refreshConversations();
      if (convs.length > 0) setActiveId(convs[0]._id);
    })();
  }, [refreshConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    getConversation(activeId)
      .then(({ messages }) => setMessages(messages))
      .catch(() => setError("Failed to load conversation"))
      .finally(() => setLoadingMessages(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = async () => {
    const { conversation } = await createConversation();
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation._id);
    setSidebarOpen(false);
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleRename = async (id, title) => {
    const { conversation } = await renameConversation(id, title);
    setConversations((prev) => prev.map((c) => (c._id === id ? conversation : c)));
  };

  const handleDelete = async (id) => {
    await deleteConversation(id);
    const remaining = conversations.filter((c) => c._id !== id);
    setConversations(remaining);
    if (activeId === id) setActiveId(remaining[0]?._id || null);
  };

  const handleSend = async ({ content, file }) => {
    let conversationId = activeId;

    if (!conversationId) {
      const { conversation } = await createConversation();
      setConversations((prev) => [conversation, ...prev]);
      conversationId = conversation._id;
      setActiveId(conversationId);
    }

    setError("");
    setSending(true);

    // Optimistic UI: show the user's message immediately
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: content || `[Uploaded file: ${file?.name}]`,
      attachments: [],
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const { userMessage, assistantMessage, conversation } = await sendMessage(conversationId, {
        content,
        file,
      });
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== optimisticMessage._id),
        userMessage,
        assistantMessage,
      ]);
      setConversations((prev) =>
        prev
          .map((c) => (c._id === conversation._id ? conversation : c))
          .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    } finally {
      setSending(false);
    }
  };

  const handleGenerate = async ({ type, title, content }) => {
    let conversationId = activeId;
    if (!conversationId) {
      const { conversation } = await createConversation();
      setConversations((prev) => [conversation, ...prev]);
      conversationId = conversation._id;
      setActiveId(conversationId);
    }

    try {
      let result;
      if (type === "pdf") result = await generatePdf({ title, content, conversationId });
      else if (type === "docx") result = await generateDocx({ title, content, conversationId });
      else result = await generateImage({ prompt: content, conversationId });

      if (result.message) setMessages((prev) => [...prev, result.message]);
    } catch (err) {
      setError(err.response?.data?.message || "File generation failed");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-xl">
            ☰
          </button>
          <h2 className="font-medium text-gray-900 dark:text-white truncate">
            {conversations.find((c) => c._id === activeId)?.title || "AI Chat"}
          </h2>
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {loadingMessages ? (
            <p className="text-center text-gray-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              Start the conversation by sending a message below.
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m._id} message={m} />)
          )}
          <div ref={bottomRef} />
        </div>

        <MessageInput
          onSend={handleSend}
          onOpenGenerate={() => setShowGenerateModal(true)}
          sending={sending}
        />
      </div>

      {showGenerateModal && (
        <GenerateFileModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
};

export default Chat;
