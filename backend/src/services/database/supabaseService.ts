import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Database types
export interface CodeReview {
  id: string;
  created_at: string;
  code: string;
  language: string;
  review_type: string;
  ai_feedback: any; // JSONB
  ai_model: string;
  user_rating: number | null; // 1 or -1
  rated_at: string | null;
}

class SupabaseService {
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (!this.client) {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase credentials not configured");
      }

      this.client = createClient(supabaseUrl, supabaseKey);
    }
    return this.client;
  }

  // Save a new code review
  async saveReview(data: {
    code: string;
    language: string;
    reviewType: string;
    aiFeedback: any;
    aiModel: string;
  }): Promise<string> {
    const client = this.getClient();

    const { data: review, error } = await client
      .from("code_reviews")
      .insert({
        code: data.code,
        language: data.language,
        review_type: data.reviewType,
        ai_feedback: data.aiFeedback,
        ai_model: data.aiModel,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to save review");
    }

    return review.id;
  }

  // Update rating for a review
  async updateRating(reviewId: string, rating: number): Promise<void> {
    const client = this.getClient();

    const { error } = await client
      .from("code_reviews")
      .update({
        user_rating: rating,
        rated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to update rating");
    }
  }

  // Get statistics (for learning loop analysis)
  async getStatistics(): Promise<{
    totalReviews: number;
    totalRatings: number;
    positiveRatings: number;
    negativeRatings: number;
    averageRating: number;
  }> {
    const client = this.getClient();

    const { data, error } = await client
      .from("code_reviews")
      .select("user_rating");

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to get statistics");
    }

    const totalReviews = data.length;
    const rated = data.filter((r) => r.user_rating !== null);
    const totalRatings = rated.length;
    const positiveRatings = rated.filter((r) => r.user_rating === 1).length;
    const negativeRatings = rated.filter((r) => r.user_rating === -1).length;
    const averageRating =
      totalRatings > 0
        ? rated.reduce((sum, r) => sum + (r.user_rating || 0), 0) / totalRatings
        : 0;

    return {
      totalReviews,
      totalRatings,
      positiveRatings,
      negativeRatings,
      averageRating,
    };
  }
}

export const supabaseService = new SupabaseService();
