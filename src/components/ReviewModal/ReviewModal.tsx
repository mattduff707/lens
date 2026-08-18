import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  type AlbumResult,
  getArtworkUrl,
  getTracklist,
} from "../../lib/itunes";
import { uploadAlbumCover } from "../../lib/albumCover";
import {
  createReviewMutation,
  deleteReviewMutation,
  reviewKeys,
  reviewListQuery,
  updateReviewMutation,
} from "../../lib/queries";
import { type Review, type ReviewStatus } from "../../lib/supabase";
import { AlbumSearch } from "../AlbumSearch";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "delete";
  review?: Review;
}

export const ReviewModal = ({
  isOpen,
  onClose,
  mode,
  review,
}: ReviewModalProps) => {
  const queryClient = useQueryClient();
  const { data: existingReviews = [] } = useQuery(reviewListQuery);

  // Form state
  const [formData, setFormData] = useState({
    album: "",
    artist: [""],
    album_cover: "",
    rating: 5 as 1 | 2 | 3 | 4 | 5,
    tracklist: [""],
    highlights: [""],
    description: "",
    review_date: new Date().toISOString().slice(0, 10),
    release_date: "",
    status: "draft" as ReviewStatus,
  });

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

  // Create mutation
  const createMutation = useMutation({
    ...createReviewMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list() });
      onClose();
      resetForm();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    ...updateReviewMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list() });
      onClose();
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    ...deleteReviewMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.list() });
      onClose();
    },
  });

  const resetForm = () => {
    setFormData({
      album: "",
      artist: [""],
      album_cover: "",
      rating: 5,
      tracklist: [""],
      highlights: [""],
      description: "",
      review_date: new Date().toISOString().slice(0, 10),
      release_date: "",
      status: "draft",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Cleanup preview URL when component unmounts or file changes
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

  // Prefill form when review prop changes (for edit mode)
  useEffect(() => {
    if (review && mode === "edit") {
      setFormData({
        album: review.album,
        artist: review.artist.length > 0 ? review.artist : [""],
        album_cover: review.album_cover,
        rating: review.rating,
        tracklist: review.tracklist.length > 0 ? review.tracklist : [""],
        highlights: review.highlights.length > 0 ? review.highlights : [""],
        description: review.description,
        review_date: toDateInputValue(review.review_date),
        release_date: toDateInputValue(review.release_date),
        status: review.status,
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        album: "",
        artist: [""],
        album_cover: "",
        rating: 5,
        tracklist: [""],
        highlights: [""],
        description: "",
        review_date: new Date().toISOString().slice(0, 10),
        release_date: "",
        status: "draft",
      });
    }
  }, [review, mode]);

  // Fill the form from an iTunes search result. Rating, description and
  // review_date are left alone since they are the reviewer's own input.
  const handleAlbumSelect = async (album: AlbumResult) => {
    setFormData((prev) => ({
      ...prev,
      album: album.album,
      artist: [album.artist],
      release_date: album.releaseDate,
    }));

    setFillingFromSearch(true);

    // Metadata lookups are best effort: a failure here still leaves the
    // reviewer with the fields that were filled above.
    try {
      const tracks = await getTracklist(album.id);
      if (tracks.length > 0) {
        setFormData((prev) => ({ ...prev, tracklist: tracks }));
      }
    } catch (error) {
      console.error("Tracklist lookup failed:", error);
    }

    try {
      if (album.artworkUrl) {
        const response = await fetch(getArtworkUrl(album.artworkUrl));
        const blob = await response.blob();
        const file = new File([blob], `${album.id}.jpg`, { type: blob.type });

        clearPreview();
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Artwork download failed:", error);
    } finally {
      setFillingFromSearch(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create" || mode === "edit") {
      try {
        setUploadingFile(true);

        let albumCoverUrl = formData.album_cover;

        // Upload file if one is selected
        if (selectedFile) {
          albumCoverUrl = await uploadAlbumCover(selectedFile);
        }

        // Filter out empty values
        const cleanedData = {
          ...formData,
          album_cover: albumCoverUrl,
          artist: formData.artist.filter((a) => a.trim() !== ""),
          tracklist: formData.tracklist.filter((t) => t.trim() !== ""),
          highlights: formData.highlights.filter((h) => h.trim() !== ""),
        };

        if (mode === "create") {
          createMutation.mutate(cleanedData);
        } else if (mode === "edit" && review) {
          updateMutation.mutate({
            id: review.id,
            updates: cleanedData,
          });
        }
      } catch (error) {
        console.error("Upload failed:", error);
        // You could show an error message here
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleDelete = () => {
    if (review) {
      deleteMutation.mutate(review.id);
    }
  };

  const updateArrayField = (
    field: "artist" | "tracklist" | "highlights",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "artist" | "tracklist" | "highlights") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "artist" | "tracklist" | "highlights",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const matchingReviews = (() => {
    const albumTitle = formData.album.trim().toLowerCase();
    if (!albumTitle) return [];

    return existingReviews.filter((existing) => {
      if (mode === "edit" && review && existing.id === review.id) return false;
      return existing.album.trim().toLowerCase() === albumTitle;
    });
  })();

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Review";
      case "edit":
        return "Edit Review";
      case "delete":
        return "Delete Review";
      default:
        return "Review";
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
                Are you sure you want to delete the review for "{review?.album}
                "? This action cannot be undone.
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
              {/* Album Search */}
              <AlbumSearch
                onSelect={handleAlbumSelect}
                disabled={fillingFromSearch}
              />

              {/* Album Name */}
              <div>
                <Label.Root
                  htmlFor="album"
                  className="block text-main font-medium mb-2"
                >
                  Album Name
                </Label.Root>
                <input
                  id="album"
                  type="text"
                  value={formData.album}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, album: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-3 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                  placeholder="Enter album name"
                />
                {matchingReviews.length > 0 && (
                  <p
                    role="status"
                    className="mt-2 text-sm text-amber-500"
                  >
                    {matchingReviews.length === 1
                      ? `A review for this album already exists${
                          matchingReviews[0].artist.length > 0
                            ? ` (${matchingReviews[0].artist.join(", ")})`
                            : ""
                        }.`
                      : `${matchingReviews.length} reviews already exist for this album title.`}
                  </p>
                )}
              </div>

              {/* Artists */}
              <div>
                <Label.Root className="block text-main font-medium mb-2">
                  Artists
                </Label.Root>
                {formData.artist.map((artist, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) =>
                        updateArrayField("artist", index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                      placeholder="Artist name"
                    />
                    {formData.artist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("artist", index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("artist")}
                  className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  + Add Artist
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

              {/* Album Cover Upload */}
              <div>
                <Label.Root
                  htmlFor="album_cover"
                  className="block text-main font-medium mb-2"
                >
                  Album Cover Image
                </Label.Root>
                <div className="space-y-3">
                  <input
                    id="album_cover"
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
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Album cover preview"
                            className="w-32 h-32 object-cover rounded-lg border border-main/20"
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

              {/* Tracklist */}
              <div>
                <Label.Root className="block text-main font-medium mb-2">
                  Tracklist
                </Label.Root>
                {formData.tracklist.map((track, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={track}
                      onChange={(e) =>
                        updateArrayField("tracklist", index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                      placeholder="Track name"
                    />
                    {formData.tracklist.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("tracklist", index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("tracklist")}
                  className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  + Add Track
                </button>
              </div>

              {/* Highlights */}
              <div>
                <Label.Root className="block text-main font-medium mb-2">
                  Highlights (must be from tracklist)
                </Label.Root>
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) =>
                        updateArrayField("highlights", index, e.target.value)
                      }
                      className="flex-1 px-4 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-secondary/50 focus:outline-none focus:border-highlight focus:ring-2 focus:ring-highlight/20 transition-colors"
                      placeholder="Highlight track"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField("highlights", index)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField("highlights")}
                  className="bg-secondary/10 hover:bg-secondary/20 text-main border border-main/30 px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  + Add Highlight
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
