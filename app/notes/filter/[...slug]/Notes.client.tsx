"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteForm from "@/components/NoteForm/NoteForm";
import Modal from "@/components/Modal/Modal";
import NoteList from "@/components/NoteList/NoteList";
import Loader from "@/app/loading";
import { fetchNotes, FetchNotesResponse } from "@/lib/api";

import css from "./Notes.page.module.css";

interface NotesClientProps {
  tag?: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isFetching, isError, error } = useQuery<FetchNotesResponse>({
    queryKey: ["notes", debouncedSearch, page, tag],
    queryFn: () => fetchNotes(debouncedSearch, page, 9, tag),
    placeholderData: (prev) => prev,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (selectedPage: number) => setPage(selectedPage);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasNotes = notes.length > 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        )}
        <button className={css.button} onClick={toggleModal}>
          Create note +
        </button>
      </header>

      <h2 className={css.title}>
        {tag ? `Notes tagged: ${tag}` : "All notes"}
      </h2>

      {isFetching && <Loader />}
      {isError && <p>Error: {(error as Error)?.message}</p>}

      {!isFetching && !hasNotes && (
        <p className={css.notfound}>
          {debouncedSearch
            ? `No notes found for "${debouncedSearch}"`
            : "No notes found"}
        </p>
      )}

      {hasNotes && <NoteList notes={notes} />}

      {isModalOpen && (
        <Modal onClose={toggleModal}>
          <NoteForm onCancel={toggleModal} />
        </Modal>
      )}
    </div>
  );
}