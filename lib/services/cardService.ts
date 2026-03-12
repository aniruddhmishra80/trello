import { Card } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";

export const cardService = {
  async getCardsByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Card[]> {
    const { data, error } = await supabase
      .from("cards")
      .select(`*, lists!inner(board_id), checklists(id, items:checklist_items(id, is_completed))`)
      .eq("lists.board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCard(
    supabase: SupabaseClient,
    card: Omit<Card, "id" | "created_at" | "updated_at" | "labels" | "checklists"> & { labels?: string[] }
  ): Promise<Card> {
    const { data, error } = await supabase
      .from("cards")
      .insert({ ...card, labels: card.labels || [] })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async moveCard(
    supabase: SupabaseClient,
    cardId: string,
    newListId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("cards")
      .update({
        list_id: newListId,
        sort_order: newOrder,
      })
      .eq("id", cardId);

    if (error) throw error;
    return data;
  },
};
