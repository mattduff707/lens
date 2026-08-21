import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { filmKeys, filmListQuery, reviewListQuery } from "../lib/queries";
import { authService, filmService } from "../lib/supabase";

const AdminPanel = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingDates, setSyncingDates] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch reviews for stats
  const { data: reviews = [], isLoading: reviewsLoading } =
    useQuery(reviewListQuery);
  const { data: films = [], isLoading: filmsLoading } = useQuery(filmListQuery);

  const statsLoading = reviewsLoading || filmsLoading;
  const totalCount = reviews.length + films.length;
  const ratings = [...reviews, ...films].map((entry) => entry.rating);
  // Both lists arrive ordered by created_at desc, so only the two heads can win.
  const latest = [
    ...reviews.slice(0, 1).map((r) => ({ title: r.album, at: r.created_at })),
    ...films.slice(0, 1).map((f) => ({ title: f.title, at: f.created_at })),
  ].sort((a, b) => b.at.localeCompare(a.at))[0];

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

  const handleSyncFilmDates = async () => {
    setSyncingDates(true);
    setSyncResult(null);
    try {
      const count = await filmService.syncReviewDatesToReleaseDates();
      await queryClient.invalidateQueries({ queryKey: filmKeys.all });
      setSyncResult({
        success: true,
        message: `Updated ${count} film review date${count === 1 ? "" : "s"}`,
      });
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      });
    } finally {
      setSyncingDates(false);
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
    <div className="space-y-8 max-w-list mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-main mb-2">Admin Panel</h1>
          <p className="text-main/70">Welcome back, {user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="bg-main/10 hover:bg-secondary/20 text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            View site
          </Link>
          <button
            onClick={handleSignOut}
            className="bg-main/10 hover:bg-secondary/20 text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Total Reviews
          </h3>
          <div className="text-3xl font-bold text-main mb-2">
            {statsLoading ? "..." : totalCount}
          </div>
          <p className="text-main/70 text-sm">
            {reviews.length} albums · {films.length} films
          </p>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Average Rating
          </h3>
          <div className="text-3xl font-bold text-main mb-2">
            {statsLoading || ratings.length === 0
              ? "N/A"
              : (
                  ratings.reduce((sum, rating) => sum + rating, 0) /
                  ratings.length
                ).toFixed(1)}
          </div>
          <p className="text-main/70 text-sm">Across all reviews</p>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Latest Review
          </h3>
          <div className="text-lg font-semibold text-main mb-2">
            {statsLoading ? "Loading..." : latest ? latest.title : "None"}
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
            className="inline-block bg-main hover:bg-main/80 text-secondary font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Manage Reviews
          </Link>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-main mb-4">Film Reviews</h2>
          <p className="text-main/70 mb-4">
            Create, edit, and manage your film reviews
          </p>
          <Link
            to="/admin-panel/film"
            className="inline-block bg-main hover:bg-main/80 text-secondary font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Manage Reviews
          </Link>
        </div>
      </div>

      {/* Utilities */}
      <div className="bg-main/5 border border-main/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-main mb-4">Utilities</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleSyncFilmDates}
              disabled={syncingDates}
              className="bg-main/10 hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {syncingDates ? "Syncing..." : "Sync film review dates to release dates"}
            </button>
            {syncResult && (
              <span
                className={
                  syncResult.success ? "text-green-600" : "text-red-500"
                }
              >
                {syncResult.message}
              </span>
            )}
          </div>
          <p className="text-main/50 text-sm">
            Sets every film's review date to match its release date
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
