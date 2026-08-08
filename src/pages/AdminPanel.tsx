import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { reviewListQuery } from "../lib/queries";
import { authService } from "../lib/supabase";

const AdminPanel = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch reviews for stats
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

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
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
    <div className="space-y-8 max-w-list mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-main mb-2">Admin Panel</h1>
          <p className="text-main/70">Welcome back, {user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-main/10 hover:bg-secondary/20 text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Total Reviews
          </h3>
          <div className="text-3xl font-bold text-main mb-2">
            {reviewsLoading ? "..." : reviews.length}
          </div>
          <p className="text-main/70 text-sm">Album reviews published</p>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Average Rating
          </h3>
          <div className="text-3xl font-bold text-main mb-2">
            {reviewsLoading || reviews.length === 0
              ? "N/A"
              : (
                  reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length
                ).toFixed(1)}
          </div>
          <p className="text-main/70 text-sm">Across all reviews</p>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Latest Review
          </h3>
          <div className="text-lg font-semibold text-main mb-2">
            {reviewsLoading
              ? "Loading..."
              : reviews.length > 0
              ? reviews[0].album
              : "None"}
          </div>
          <p className="text-main/70 text-sm">Most recent publication</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-main mb-4">
            Music Reviews
          </h2>
          <p className="text-main/70 mb-4">
            Create, edit, and manage your album reviews
          </p>
          <Link
            to="/admin-panel/music"
            className="inline-block bg-main hover:bg-main/80 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Manage Reviews
          </Link>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-main mb-4">
            Quick Actions
          </h2>
          <p className="text-main/70 mb-4">Common administrative tasks</p>
          <div className="space-y-2">
            <Link
              to="/admin-panel/music"
              className="block bg-main/10 hover:bg-main/20 text-main border border-main/30 font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-center"
            >
              Add New Review
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
