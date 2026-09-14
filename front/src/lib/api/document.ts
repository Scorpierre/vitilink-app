import { http } from './http';
import type { ApiResponse, DocumentItem, DocumentType } from '$lib/types';
import { DEMO_MODE } from '$lib/demo/mode';
import { uploadEntrepriseDocument as demoUploadDocument } from '$lib/demo/db';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const DocumentAPI = {
  listEntrepriseDocuments: (): Promise<ApiResponse<DocumentItem[]>> =>
    http('/document/entreprise'),

  fileUrl: (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('/demo/')) return path;
    return `${API_BASE}${path}`;
  },

  deleteDocument: (id: string) =>
    http(`/document/${id}/delete`, {
      method: 'POST'
    }),

  async uploadEntrepriseDocument(file: File, type: string, label = '') {
    if (DEMO_MODE) {
      return demoUploadDocument(URL.createObjectURL(file), type as DocumentType, label);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('label', label);

    const res = await fetch(`${API_BASE}/document/entreprise/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "Erreur lors de l'upload");
    }

    return data;
  }
};
