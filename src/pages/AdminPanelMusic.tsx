import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewModal } from "../components/ReviewModal";
import { ReviewSearch } from "../components/ReviewSearch";
import { musicConfig } from "../lib/media";
import { reviewListQuery } from "../lib/queries";
import { authService, type Review } from "../lib/supabase";

const matchesAlbumSearch = (review: Review, term: string): boolean => {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    review.album.toLowerCase().includes(q) ||
    review.artist.some((artist) => artist.toLowerCase().includes(q))
  );
};

const AdminPanelMusic = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "delete";
    review?: Review;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading } =
    useQuery(reviewListQuery);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data } = await authService.getCurrentUser();
        if (!data.user) {
          // Redirect to login if not authenticated
          navigate({ to: "/admin-login" });
          return;
        }
        setUser(data.user as { email: string });
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate({ to: "/admin-login" });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const publishedCount = reviews.filter(
    (review) => review.status === "published"
  ).length;
  const filteredReviews = reviews.filter((review) =>
    matchesAlbumSearch(review, searchTerm)
  );

  const openModal = (mode: "create" | "edit" | "delete", review?: Review) => {
    setModalState({ isOpen: true, mode, review });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "create" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-main">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="space-y-8 max-w-list mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-main mb-2">Music Reviews</h1>
          <p className="text-main/70">Manage your album reviews and ratings</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="bg-main/10 hover:bg-secondary/20 text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            View site
          </Link>
          <button
            onClick={() => openModal("create")}
            className="bg-main hover:bg-main/80 text-secondary font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Add Review
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Total Reviews
          </h3>
          <div className="text-3xl font-bold text-main">
            {reviewsLoading ? "..." : reviews.length}
          </div>
          {!reviewsLoading && (
            <p className="text-main/70 text-sm mt-1">
              {publishedCount} published · {reviews.length - publishedCount}{" "}
              draft
            </p>
          )}
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Average Rating
          </h3>
          <div className="text-3xl font-bold text-main">
            {reviewsLoading || reviews.length === 0
              ? "N/A"
              : (
                  reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length
                ).toFixed(1)}
          </div>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Latest Review
          </h3>
          <div className="text-sm text-main/70">
            {reviewsLoading
              ? "Loading..."
              : reviews.length > 0
              ? reviews[0].album
              : "No reviews yet"}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-main">All Reviews</h2>
          {reviews.length > 0 && (
            <ReviewSearch onDebouncedChange={setSearchTerm} />
          )}
        </div>

        {reviewsLoading ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main">Loading reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main/70 mb-4">No reviews created yet</div>
            <button
              onClick={() => openModal("create")}
              className="bg-main hover:bg-main/80 text-secondary font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Create your first review
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main/70">No reviews match "{searchTerm}"</div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                item={musicConfig.toMediaItem(review)}
                aspect={musicConfig.aspect}
                metaLabel={musicConfig.metaLabel}
                showActions={true}
                onEdit={() => openModal("edit", review)}
                onDelete={() => openModal("delete", review)}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        review={modalState.review}
      />
    </div>
  );
};

export default AdminPanelMusic;
