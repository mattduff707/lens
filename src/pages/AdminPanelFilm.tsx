import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FilmModal } from "../components/FilmModal";
import { ReviewCard } from "../components/ReviewCard";
import { ReviewSearch } from "../components/ReviewSearch";
import { filmConfig } from "../lib/media";
import { filmListQuery } from "../lib/queries";
import { authService, type Film } from "../lib/supabase";

const matchesFilmSearch = (film: Film, term: string): boolean => {
  if (!term) return true;
  const q = term.toLowerCase();
  return (
    film.title.toLowerCase().includes(q) ||
    (film.director ?? []).some((director) => director.toLowerCase().includes(q))
  );
};

const AdminPanelFilm = () => {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "edit" | "delete";
    film?: Film;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: films = [], isLoading: filmsLoading } =
    useQuery(filmListQuery);

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

  const publishedCount = films.filter(
    (film) => film.status === "published"
  ).length;
  const filteredFilms = films.filter((film) =>
    matchesFilmSearch(film, searchTerm)
  );

  const openModal = (mode: "create" | "edit" | "delete", film?: Film) => {
    setModalState({ isOpen: true, mode, film });
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
    <div className="space-y-8 max-w-list mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-main mb-2">Film Reviews</h1>
          <p className="text-main/70">Manage your film reviews and ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/film"
            className="bg-main/10 hover:bg-secondary/20 text-main border border-main font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            View site
          </Link>
          <button
            onClick={() => openModal("create")}
            className="bg-main hover:bg-main/80 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
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
            {filmsLoading ? "..." : films.length}
          </div>
          {!filmsLoading && (
            <p className="text-main/70 text-sm mt-1">
              {publishedCount} published · {films.length - publishedCount} draft
            </p>
          )}
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Average Rating
          </h3>
          <div className="text-3xl font-bold text-main">
            {filmsLoading || films.length === 0
              ? "N/A"
              : (
                  films.reduce((sum, film) => sum + film.rating, 0) /
                  films.length
                ).toFixed(1)}
          </div>
        </div>

        <div className="bg-main/5 border border-main/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-main mb-2">
            Latest Review
          </h3>
          <div className="text-sm text-main/70">
            {filmsLoading
              ? "Loading..."
              : films.length > 0
              ? films[0].title
              : "No reviews yet"}
          </div>
        </div>
      </div>

      {/* Films List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-main">All Reviews</h2>
          {films.length > 0 && (
            <ReviewSearch onDebouncedChange={setSearchTerm} />
          )}
        </div>

        {filmsLoading ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main">Loading reviews...</div>
          </div>
        ) : films.length === 0 ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main/70 mb-4">No reviews created yet</div>
            <button
              onClick={() => openModal("create")}
              className="bg-main hover:bg-main/80 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Create your first review
            </button>
          </div>
        ) : filteredFilms.length === 0 ? (
          <div className="bg-main/5 border border-main/20 rounded-lg p-8 text-center">
            <div className="text-main/70">No reviews match "{searchTerm}"</div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredFilms.map((film) => (
              <ReviewCard
                key={film.id}
                item={filmConfig.toMediaItem(film)}
                aspect={filmConfig.aspect}
                metaLabel={filmConfig.metaLabel}
                showActions={true}
                onEdit={() => openModal("edit", film)}
                onDelete={() => openModal("delete", film)}
              />
            ))}
          </div>
        )}
      </div>

      <FilmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        film={modalState.film}
      />
    </div>
  );
};

export default AdminPanelFilm;
