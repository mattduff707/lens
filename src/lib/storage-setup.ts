import { supabase } from "./supabase";

/**
 * Setup script for Supabase storage bucket
 * Run this once to create the album-covers bucket
 *
 * You can also create this manually in your Supabase dashboard:
 * 1. Go to Storage in your Supabase dashboard
 * 2. Create a new bucket called "album-covers"
 * 3. Set it to public (or adjust the policy below)
 */

export const setupStorage = async () => {
  try {
    // Create the bucket
    const { data: bucket, error: bucketError } =
      await supabase.storage.createBucket("album-covers", {
        public: true,
        allowedMimeTypes: [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ],
        fileSizeLimit: 5242880, // 5MB
      });

    if (bucketError && bucketError.message !== "Bucket already exists") {
      throw bucketError;
    }

    console.log("✅ Storage bucket created or already exists:", bucket);

    // Set up RLS policy for public read access
    // Note: This should be done via SQL or the Supabase dashboard for security
    console.log(
      "🔒 Make sure to set up RLS policies in your Supabase dashboard"
    );
    console.log("   - Allow public read access to album-covers bucket");
    console.log(
      "   - Allow authenticated users to upload to album-covers bucket"
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Storage setup failed:", error);
    return { success: false, error };
  }
};

// Example RLS policies (to be applied in Supabase dashboard):
/*
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'album-covers');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'album-covers' AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE WITH CHECK (
  bucket_id = 'album-covers' AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'album-covers' AND auth.role() = 'authenticated'
);
*/
