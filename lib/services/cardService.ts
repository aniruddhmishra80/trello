// import { Card } from "@/types";
// import { SupabaseClient } from "@supabase/supabase-js";

// export const cardService = {
//   async getCardsByBoard(
//     supabase: SupabaseClient,
//     boardId: string
//   ): Promise<Card[]> {
//     const { data, error } = await supabase
//       .from("tasks")
//       .select(`*, lists!inner(board_id), checklists(id, items:checklist_items(id, is_completed))`)
//       .eq("lists.board_id", boardId)
//       .order("sort_order", { ascending: true });

//     if (error) throw error;
//     return data || [];
//   },

//   async createCard(
//     supabase: SupabaseClient,
//     card: Omit<Card, "id" | "created_at" | "updated_at" | "labels" | "checklists"> & { labels?: string[] }
//   ): Promise<Card> {
//     const { data, error } = await supabase
//       .from("tasks")
//       .insert({ ...card, labels: card.labels || [] })
//       .select()
//       .single();

//     if (error) throw error;
//     return data;
//   },

//   async moveCard(
//     supabase: SupabaseClient,
//     cardId: string,
//     newListId: string,
//     newOrder: number
//   ) {
//     const { data, error } = await supabase
//       .from("tasks")
//       .update({
//         list_id: newListId,
//         sort_order: newOrder,
//       })
//       .eq("id", cardId);

//     if (error) throw error;
//     return data;
//   },
// };
import { SupabaseClient } from "@supabase/supabase-js";
import { Card } from "@/types";

export const cardService = {
  async getCardsByBoard(supabase: SupabaseClient, boardId: string): Promise<Card[]> {
    // 1. Get the columns for this board
    const { data: columns } = await supabase
      .from("columns")
      .select("id")
      .eq("board_id", boardId);

    if (!columns || columns.length === 0) return [];
    const columnIds = columns.map(c => c.id);

    // 2. Get the tasks inside those columns
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .in("column_id", columnIds);

    if (error) throw error;

    // 3. Map database column_id back to frontend list_id
    return (data || []).map(task => ({
      ...task,
      list_id: task.column_id
    }));
  },

  async createCard(supabase: SupabaseClient, cardData: any): Promise<Card> {
    // Swap frontend list_id to database column_id before saving
    const taskPayload = { ...cardData, column_id: cardData.list_id };
    delete taskPayload.list_id;

    const { data, error } = await supabase
      .from("tasks")
      .insert(taskPayload)
      .select()
      .single();

    if (error) throw error;
    return { ...data, list_id: data.column_id };
  },

  async moveCard(supabase: SupabaseClient, cardId: string, newListId: string, newOrder: number) {
    const { error } = await supabase
      .from("tasks")
      .update({ column_id: newListId, sort_order: newOrder })
      .eq("id", cardId);
    if (error) throw error;
  }
};