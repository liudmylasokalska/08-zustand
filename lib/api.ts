import axios from "axios";
import type { Note } from "../types/note";

const BASE_URL = "https://notehub-public.goit.study/api/notes";
const myKey = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;

if (!myKey) {
  throw new Error("API token is missing. Set NEXT_PUBLIC_NOTEHUB_TOKEN");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${myKey}`,
  },
});

// Типи
export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: string;
}

// Функції API

export const fetchNotes = async (
  search: string = "",
  page = 1,
  perPage = 9,
  tag?: string
): Promise<FetchNotesResponse> => {
  const safePage = page > 0 ? page : 1;
  const safePerPage = perPage > 0 ? perPage : 9;

  const params: Record<string, string> = {
    page: String(safePage),
    perPage: String(safePerPage),
  };

  if (search.trim()) params.search = search.trim();
  if (tag && tag.trim() !== "" && tag.toLowerCase() !== "all")
    params.tag = tag.trim();

  try {
    const { data } = await api.get<FetchNotesResponse>("", { params });
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return { notes: [], totalPages: 0 };
    }
    throw new Error("Unexpected error while fetching notes");
  }
};

export const createNote = async (note: CreateNotePayload): Promise<Note> => {
  try {
    const { data } = await api.post<Note>("", note);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to create note");
    }
    throw new Error("Unexpected error while creating note");
  }
};

export const deleteNote = async (id: string): Promise<Note> => {
  try {
    const { data } = await api.delete<Note>(`/${id}`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to delete note");
    }
    throw new Error("Unexpected error while deleting note");
  }
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  try {
    const { data } = await api.get<Note>(`/${id}`);
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch note by ID"
      );
    }
    throw new Error("Unexpected error while fetching note by ID");
  }
};

export const getTags = async (): Promise<string[]> => {
  try {
    const { notes } = await fetchNotes("");
    return Array.from(new Set(notes.map((note) => note.tag)));
  } catch {
    return [];
  }
};