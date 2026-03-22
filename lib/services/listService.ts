import { SupabaseClient } from "@supabase/supabase-js";
import { List } from "@/types";

export const listService = {
  async getLists(supabase: SupabaseClient, boardId: string): Promise<List[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async createList(supabase: SupabaseClient, listData: any): Promise<List> {
    const { data, error } = await supabase
      .from("columns")
      .insert(listData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateListTitle(supabase: SupabaseClient, listId: string, title: string): Promise<List> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", listId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};