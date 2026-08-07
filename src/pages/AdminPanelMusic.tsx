import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewModal } from "../components/ReviewModal";
import { reviewListQuery } from "../lib/queries";
import { authService, type Review } from "../lib/supabase";

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-main mb-2">Music Reviews</h1>
          <p className="text-main/70">Manage your album reviews and ratings</p>
        </div>
        <button
          onClick={() => openModal("create")}
          className="bg-main hover:bg-main/80 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Add Review
        </button>
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
        <h2 className="text-2xl font-semibold text-main">All Reviews</h2>

        {reviewsLoading ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main">Loading reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main/70 mb-4">No reviews created yet</div>
            <button
              onClick={() => openModal("create")}
              className="bg-main hover:bg-main/80 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Create your first review
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showActions={true}
                onEdit={(review) => openModal("edit", review)}
                onDelete={(review) => openModal("delete", review)}
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
