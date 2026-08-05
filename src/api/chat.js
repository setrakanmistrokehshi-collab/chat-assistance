import api from "./axios";

export const listConversations = () => api.get("/conversations").then((r) => r.data);
export const createConversation = () => api.post("/conversations", {}).then((r) => r.data);
export const getConversation = (id) => api.get(`/conversations/${id}`).then((r) => r.data);
export const renameConversation = (id, title) =>
  api.patch(`/conversations/${id}`, { title }).then((r) => r.data);
export const deleteConversation = (id) => api.delete(`/conversations/${id}`).then((r) => r.data);

export const sendMessage = (conversationId, { content, file }) => {
  const formData = new FormData();
  if (content) formData.append("content", content);
  if (file) formData.append("file", file);

  return api
    .post(`/chat/${conversationId}/messages`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const generatePdf = (payload) => api.post("/files/generate/pdf", payload).then((r) => r.data);
export const generateDocx = (payload) => api.post("/files/generate/docx", payload).then((r) => r.data);
export const generateImage = (payload) => api.post("/files/generate/image", payload).then((r) => r.data);
