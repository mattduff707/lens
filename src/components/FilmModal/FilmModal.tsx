import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { FILM_POSTER, uploadCover } from "../../lib/coverImage";
import {
  createFilmMutation,
  deleteFilmMutation,
  filmKeys,
  filmListQuery,
  updateFilmMutation,
} from "../../lib/queries";
import { type Film, type ReviewStatus } from "../../lib/supabase";
import {
  getMovieDetails,
  getPosterUrl,
  type MovieResult,
} from "../../lib/tmdb";
import { MovieSearch } from "../MovieSearch";

interface FilmModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "delete";
  film?: Film;
}

type ArrayField = "director" | "cast_members";

const emptyForm = () => ({
  title: "",
  director: [""],
  cast_members: [""],
  poster: "",
  rating: 5 as 1 | 2 | 3 | 4 | 5,
  description: "",
  review_date: new Date().toISOString().slice(0, 10),
  release_date: "",
  status: "draft" as ReviewStatus,
  tmdb_id: null as number | null,
});

export const FilmModal = ({ isOpen, onClose, mode, film }: FilmModalProps) => {
  const queryClient = useQueryClient();
  const { data: existingFilms = [] } = useQuery(filmListQuery);

  const [formData, setFormData] = useState(emptyForm);

  const toDateInputValue = (dateString: string) =>
    dateString ? dateString.slice(0, 10) : "";

  const isValidDateInput = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  };

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fillingFromSearch, setFillingFromSearch] = useState(false);

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const createMutation = useMutation({
    ...createFilmMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filmKeys.list() });
      onClose();
      resetForm();
    },
  });

  const updateMutation = useMutation({
    ...updateFilmMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filmKeys.list() });
      onClose();
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    ...deleteFilmMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: filmKeys.list() });
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [previewUrl]);

  // Cleanup preview URL when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearPreview();
    }
  }, [isOpen, clearPreview]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Prefill form when film prop changes (for edit mode)
  useEffect(() => {
    if (film && mode === "edit") {
      setFormData({
        title: film.title,
        director: film.director?.length > 0 ? film.director : [""],
        cast_members:
          film.cast_members?.length > 0 ? film.cast_members : [""],
        poster: film.poster,
        rating: film.rating,
        description: film.description,
        review_date: toDateInputValue(film.review_date),
        release_date: toDateInputValue(film.release_date),
        status: film.status,
        tmdb_id: film.tmdb_id,
      });
    } else if (mode === "create") {
      setFormData(emptyForm());
    }
  }, [film, mode]);

  // Fill the form from a TMDB search result. Rating, description and
  // review_date are left alone since they are the reviewer's own input.
  const handleMovieSelect = async (movie: MovieResult) => {
    setFormData((prev) => ({
      ...prev,
      title: movie.title,
      release_date: movie.releaseDate,
      tmdb_id: movie.id,
    }));

    setFillingFromSearch(true);

    // Metadata lookups are best effort: a failure here still leaves the
    // reviewer with the fields that were filled above.
    try {
      const details = await getMovieDetails(movie.id);
      setFormData((prev) => ({
        ...prev,
        director: details.directors.length > 0 ? details.directors : prev.director,
        cast_members: details.cast.length > 0 ? details.cast : prev.cast_members,
      }));
    } catch (error) {
      console.error("Credits lookup failed:", error);
    }

    try {
      if (movie.posterPath) {
        const response = await fetch(getPosterUrl(movie.posterPath, "w500"));
        const blob = await response.blob();
        const file = new File([blob], `${movie.id}.jpg`, { type: blob.type });

        clearPreview();
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Poster download failed:", error);
    } finally {
      setFillingFromSearch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" || mode === "edit") {
      try {
        setUploadingFile(true);

        let posterUrl = formData.poster;

        if (selectedFile) {
          posterUrl = await uploadCover(selectedFile, FILM_POSTER);
        }

        const cleanedData = {
          ...formData,
          poster: posterUrl,
          director: formData.director.filter((d) => d.trim() !== ""),
          cast_members: formData.cast_members.filter((c) => c.trim() !== ""),
        };

        if (mode === "create") {
          createMutation.mutate(cleanedData);
        } else if (mode === "edit" && film) {
          updateMutation.mutate({
            id: film.id,
            updates: cleanedData,
          });
        }
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleDelete = () => {
    if (film) {
      deleteMutation.mutate(film.id);
    }
  };

  const updateArrayField = (
    field: ArrayField,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: ArrayField) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field: ArrayField, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const matchingFilms = (() => {
    const title = formData.title.trim().toLowerCase();
    if (!title) return [];

    return existingFilms.filter((existing) => {
      if (mode === "edit" && film && existing.id === film.id) return false;
      return existing.title.trim().toLowerCase() === title;
    });
  })();

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Film Review";
      case "edit":
        return "Edit Film Review";
      case "delete":
        return "Delete Film Review";
      default:
        return "Film Review";
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary border border-main/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold text-main mb-6">
            {getTitle()}
          </Dialog.Title>

          {mode === "delete" ? (
            <div className="space-y-4">
              <p className="text-main/70">
                Are you sure you want to delete the review for "{film?.title}"?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <Dialog.Close asChild>
                  <button className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 font-medium px-4 py-2 rounded-lg transition-colors duration-200">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-500 hover:bg-red-500/80 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete Review"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Film Search */}
              <MovieSearch
                onSelect={handleMovieSelect}
                disabled={fillingFromSearch}
              />

              {/* Title */}
              <div>
                <Label.Root
                  htmlFor="title"
                  className="block text-main font-medium mb-2"
                >
                  Film Title
                </Label.Root>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                  placeholder="Enter film title"
                />
                {matchingFilms.length > 0 && (
                  <p role="status" className="mt-2 text-sm text-amber-500">
                    {matchingFilms.length === 1
                      ? `A review for this film already exists${
                          matchingFilms[0].director?.length > 0
                            ? ` (${matchingFilms[0].director.join(", ")})`
                            : ""
                        }.`
                      : `${matchingFilms.length} reviews already exist for this film title.`}
                  </p>
                )}
              </div>

              {/* Directors */}
              <div>
                <Label.Root className="block text-main font-medium mb-2">
                  Directors
                </Label.Root>
                {formData.director.map((director, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={director}
                      onChange={(e) =>
                        updateArrayField("director", index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                      placeholder="Director name"
                    />
                    {formData.director.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("director", index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("director")}
                  className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  + Add Director
                </button>
              </div>

              {/* Rating */}
              <div>
                <Label.Root
                  htmlFor="rating"
                  className="block text-main font-medium mb-2"
                >
                  Rating (1-5)
                </Label.Root>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                    }))
                  }
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Fair</option>
                  <option value={3}>3 - Good</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              {/* Release Date */}
              <div>
                <Label.Root
                  htmlFor="release_date"
                  className="block text-main font-medium mb-2"
                >
                  Release Date
                </Label.Root>
                <input
                  id="release_date"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      release_date: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                />
              </div>

              {/* Review Date */}
              <div>
                <Label.Root
                  htmlFor="review_date"
                  className="block text-main font-medium mb-2"
                >
                  Review Date
                </Label.Root>
                <div className="flex gap-2">
                  <input
                    id="review_date"
                    type="date"
                    value={formData.review_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        review_date: e.target.value,
                      }))
                    }
                    required
                    className="flex-1 px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                  />
                  <button
                    type="button"
                    disabled={!isValidDateInput(formData.release_date)}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        review_date: prev.release_date,
                      }))
                    }
                    className="shrink-0 bg-secondary/10 hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed text-main border border-main/30 px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    Set to release date
                  </button>
                </div>
              </div>

              {/* Poster Upload */}
              <div>
                <Label.Root
                  htmlFor="poster"
                  className="block text-main font-medium mb-2"
                >
                  Poster Image
                </Label.Root>
                <div className="space-y-3">
                  <input
                    id="poster"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-highlight file:text-white hover:file:bg-highlight/80 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                  />
                  {selectedFile && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-main/70">
                        <span>Selected: {selectedFile.name}</span>
                        <span>
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={clearPreview}
                          className="text-red-400 hover:text-red-300 text-sm underline"
                        >
                          Remove
                        </button>
                      </div>
                      {previewUrl && (
                        <div className="relative w-32">
                          <img
                            src={previewUrl}
                            alt="Poster preview"
                            className="w-32 h-48 object-cover rounded-lg border border-main/20"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">Preview</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-main/70">
                    Supports JPEG, PNG, WebP. Max size: 5MB
                  </p>
                </div>
              </div>

              {/* Cast */}
              <div>
                <Label.Root className="block text-main font-medium mb-2">
                  Cast
                </Label.Root>
                {formData.cast_members.map((member, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) =>
                        updateArrayField("cast_members", index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                      placeholder="Actor name"
                    />
                    {formData.cast_members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("cast_members", index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("cast_members")}
                  className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  + Add Cast Member
                </button>
              </div>

              {/* Description */}
              <div>
                <Label.Root
                  htmlFor="description"
                  className="block text-main font-medium mb-2"
                >
                  Description
                </Label.Root>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors resize-vertical"
                  placeholder="Write your review description..."
                />
              </div>

              {/* Status */}
              <div>
                <Label.Root
                  htmlFor="status"
                  className="block text-main font-medium mb-2"
                >
                  Status
                </Label.Root>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as ReviewStatus,
                    }))
                  }
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                >
                  <option value="draft">Draft - only visible in admin</option>
                  <option value="published">Published - live on the site</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 justify-end pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    uploadingFile
                  }
                  className="bg-highlight hover:bg-highlight/80 disabled:bg-highlight/50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  {uploadingFile
                    ? "Uploading..."
                    : createMutation.isPending
                    ? "Creating..."
                    : updateMutation.isPending
                    ? "Updating..."
                    : mode === "create"
                    ? "Create Review"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-main/70 hover:text-main transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
