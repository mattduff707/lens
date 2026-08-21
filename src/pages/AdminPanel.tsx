import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  filmKeys,
  filmListQuery,
  recommendationRequestKeys,
  recommendationRequestListQuery,
  reviewListQuery,
} from "../lib/queries";
import {
  authService,
  filmService,
  recommendationEmailService,
  type RecommendationRequest,
} from "../lib/supabase";

const AdminPanel = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingDates, setSyncingDates] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch reviews for stats
  const { data: reviews = [], isLoading: reviewsLoading } =
    useQuery(reviewListQuery);
  const { data: films = [], isLoading: filmsLoading } = useQuery(filmListQuery);
  const { data: recommendationRequests = [], isLoading: requestsLoading } =
    useQuery(recommendationRequestListQuery);

  const statsLoading = reviewsLoading || filmsLoading || requestsLoading;
  const totalCount = reviews.length + films.length;
  const ratings = [...reviews, ...films].map((entry) => entry.rating);
  // Both lists arrive ordered by created_at desc, so only the two heads can win.
  const latest = [
    ...reviews.slice(0, 1).map((r) => ({ title: r.album, at: r.created_at })),
    ...films.slice(0, 1).map((f) => ({ title: f.title, at: f.created_at })),
  ].sort((a, b) => b.at.localeCompare(a.at))[0];

  const pendingRequests = recommendationRequests.filter((r) => !r.has_responded);
  const filteredRequests = showPendingOnly
    ? pendingRequests
    : recommendationRequests;

  const handleSendResponse = async (request: RecommendationRequest) => {
    if (!responseText.trim()) {
      setSendError("Please write a response before sending");
      return;
    }

    setSendingEmail(true);
    setSendError(null);

    try {
      await recommendationEmailService.sendResponse({
        requestId: request.id,
        recipientEmail: request.email,
        recipientName: request.name,
        responseText: responseText.trim(),
      });

      await queryClient.invalidateQueries({
        queryKey: recommendationRequestKeys.all,
      });
      setExpandedRequest(null);
      setResponseText("");
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Failed to send email"
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            Pending Requests
          </h3>
          <div className="text-3xl font-bold text-main mb-2">
            {statsLoading ? "..." : pendingRequests.length}
          </div>
          <p className="text-main/70 text-sm">Awaiting response</p>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Latest Review
          </h3>
          <div className="text-lg font-semibold text-main mb-2 truncate">
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

      {/* Recommendation Requests */}
      <div className="bg-main/5 border border-main/20 rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-main">
            Recommendation Requests
          </h2>
          <label className="flex items-center gap-2 text-sm text-main/70 cursor-pointer">
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
              className="rounded border-main/30"
            />
            Show pending only
          </label>
        </div>

        {requestsLoading ? (
          <p className="text-main/70">Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="text-main/70">
            {showPendingOnly
              ? "No pending requests"
              : "No recommendation requests yet"}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-main/20 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRequest(
                      expandedRequest === request.id ? null : request.id
                    )
                  }
                  className="w-full p-4 text-left hover:bg-main/5 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-main">
                        {request.name}
                      </span>
                      <span className="text-main/50 text-sm truncate max-w-[200px]">
                        {request.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-main/50 text-sm">
                        {formatDate(request.created_at)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          request.has_responded
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {request.has_responded ? "Responded" : "Pending"}
                      </span>
                    </div>
                  </div>
                </button>

                {expandedRequest === request.id && (
                  <div className="border-t border-main/20 p-4 bg-secondary/50">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-main/70 mb-2">
                        What they like:
                      </h4>
                      <p className="text-main whitespace-pre-wrap">
                        {request.what_you_like}
                      </p>
                    </div>

                    {request.response && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-main/70 mb-2">
                          Your response:
                        </h4>
                        <p className="text-main whitespace-pre-wrap">
                          {request.response}
                        </p>
                      </div>
                    )}

                    {!request.has_responded && (
                      <div className="space-y-3">
                        <div>
                          <label
                            htmlFor={`response-${request.id}`}
                            className="block text-sm font-medium text-main/70 mb-2"
                          >
                            Your response{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id={`response-${request.id}`}
                            value={responseText}
                            onChange={(e) => {
                              setResponseText(e.target.value);
                              if (sendError) setSendError(null);
                            }}
                            rows={5}
                            disabled={sendingEmail}
                            className="w-full px-3 py-2 bg-secondary border border-main/30 rounded-lg text-main placeholder-main/40 focus:outline-none focus:border-main/60 resize-vertical disabled:opacity-50"
                            placeholder="Write your recommendation response here. This will be sent to the user's email."
                          />
                        </div>
                        {sendError && (
                          <p className="text-red-500 text-sm">{sendError}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSendResponse(request)}
                            disabled={sendingEmail || !responseText.trim()}
                            className="bg-main hover:bg-main/80 disabled:opacity-50 disabled:cursor-not-allowed text-secondary font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            {sendingEmail ? "Sending..." : "Send Response"}
                          </button>
                          <span className="text-main/50 text-sm">
                            Email will be sent to {request.email}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
