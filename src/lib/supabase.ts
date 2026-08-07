import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscription payload types
export interface RealtimePayload<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T;
  old: T;
  errors: string[] | null;
}

// Types for your database tables
export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  album: string;
  album_cover: string; // URL/path to image stored in Supabase
  rating: 1 | 2 | 3 | 4 | 5;
  tracklist: string[];
  highlights: string[]; // Must be subset of tracklist
  artist: string[];
  description: string;
  review_date: string; // Date as ISO string
  created_at: string;
  updated_at: string;
}

// CRUD service for review table
export const reviewService = {
  // Get all reviews
  async getAll() {
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  // Get a single review
  async getOne(id: number) {
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Get reviews by album
  async getByAlbum(album: string) {
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("album", album)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  // Get reviews by artist
  async getByArtist(artist: string) {
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .contains("artist", [artist])
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  // Get reviews by rating
  async getByRating(rating: 1 | 2 | 3 | 4 | 5) {
    const { data, error } = await supabase
      .from("review")
      .select("*")
      .eq("rating", rating)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Review[];
  },

  // Create a new review
  async create(review: Omit<Review, "id" | "created_at" | "updated_at">) {
    // Validate that highlights are subset of tracklist
    const invalidHighlights = review.highlights.filter(
      (highlight) => !review.tracklist.includes(highlight)
    );

    if (invalidHighlights.length > 0) {
      throw new Error(
        `Highlights must be in tracklist. Invalid: ${invalidHighlights.join(
          ", "
        )}`
      );
    }

    const { data, error } = await supabase
      .from("review")
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Update a review
  async update(
    id: number,
    updates: Partial<Omit<Review, "id" | "created_at" | "updated_at">>
  ) {
    // If updating highlights or tracklist, validate highlights are subset of tracklist
    if (updates.highlights || updates.tracklist) {
      const { data: currentReview, error: fetchError } = await supabase
        .from("review")
        .select("tracklist, highlights")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const finalTracklist = updates.tracklist || currentReview.tracklist;
      const finalHighlights = updates.highlights || currentReview.highlights;

      const invalidHighlights = finalHighlights.filter(
        (highlight: string) => !finalTracklist.includes(highlight)
      );

      if (invalidHighlights.length > 0) {
        throw new Error(
          `Highlights must be in tracklist. Invalid: ${invalidHighlights.join(
            ", "
          )}`
        );
      }
    }

    const { data, error } = await supabase
      .from("review")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  // Delete a review
  async delete(id: number) {
    const { error } = await supabase.from("review").delete().eq("id", id);

    if (error) throw error;
  },

  // // Subscribe to real-time changes
  // subscribe(callback: (payload: RealtimePayload<Review>) => void) {
  //   return supabase
  //     .channel("reviews")

  //     .on(
  //       "postgres_changes" as any,
  //       { event: "*", schema: "public", table: "review" },
  //       callback
  //     )
  //     .subscribe();
  // },
};

// Authentication utilities
export const authService = {
  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Get current session
  getCurrentSession: () => {
    return supabase.auth.getSession();
  },

  // Sign out
  signOut: () => {
    return supabase.auth.signOut();
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};
