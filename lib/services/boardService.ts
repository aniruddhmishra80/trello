// import { Board, List, Card } from "@/types";
// import { SupabaseClient } from "@supabase/supabase-js";
// import { listService } from "./listService";
// import { cardService } from "./cardService";

// export const boardServiceInstance = {
//   async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
//     const { data, error } = await supabase
//       .from("boards")
//       .select("*")
//       .eq("id", boardId)
//       .single();
//     if (error) throw error;
//     return data;
//   },

//   async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
//     const { data, error } = await supabase
//       .from("boards")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false });
//     if (error) throw error;
//     return data || [];
//   },

//   async createBoard(
//     supabase: SupabaseClient,
//     board: Omit<Board, "id" | "created_at" | "updated_at">
//   ): Promise<Board> {
//     const { data, error } = await supabase
//       .from("boards")
//       .insert(board)
//       .select()
//       .single();
//     if (error) throw error;
//     return data;
//   },

//   async updateBoard(
//     supabase: SupabaseClient,
//     boardId: string,
//     updates: Partial<Board>
//   ): Promise<Board> {
//     const { data, error } = await supabase
//       .from("boards")
//       .update({ ...updates, updated_at: new Date().toISOString() })
//       .eq("id", boardId)
//       .select()
//       .single();
//     if (error) throw error;
//     return data;
//   },
// };

// export const boardDataService = {
//   async getBoardWithLists(supabase: SupabaseClient, boardId: string) {
//     const [board, lists] = await Promise.all([
//       boardServiceInstance.getBoard(supabase, boardId),
//       listService.getLists(supabase, boardId),
//     ]);
//     if (!board) throw new Error("Board not found");

//     const cards = await cardService.getCardsByBoard(supabase, boardId);
//     const listsWithCards = lists.map((list: List) => ({
//       ...list,
//       cards: cards.filter((card: Card) => card.list_id === list.id),
//     }));

//     return { board, listsWithCards };
//   },

//   async createBoardWithDefaultLists(
//     supabase: SupabaseClient,
//     boardData: {
//       title: string;
//       description?: string;
//       color?: string;
//       userId: string;
//     }
//   ) {
//     const board = await boardServiceInstance.createBoard(supabase, {
//       title: boardData.title,
//       description: boardData.description || null,
//       color: boardData.color || "bg-blue-500",
//       user_id: boardData.userId,
//     });

//     const defaultLists = [
//       { title: "To Do", sort_order: 0 },
//       { title: "In Progress", sort_order: 1 },
//       { title: "Review", sort_order: 2 },
//       { title: "Done", sort_order: 3 },
//     ];

//     await Promise.all(
//       defaultLists.map((list) =>
//         listService.createList(supabase, {
//           ...list,
//           board_id: board.id,
//           user_id: boardData.userId,
//         })
//       )
//     );

//     return board;
//   },
// };
import { Board, List, Card } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { listService } from "./listService";
import { cardService } from "./cardService";

export const boardServiceInstance = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();
    if (error) throw error;
    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const boardDataService = {
  async getBoardWithLists(supabase: SupabaseClient, boardId: string) {
    const [board, lists] = await Promise.all([
      boardServiceInstance.getBoard(supabase, boardId),
      listService.getLists(supabase, boardId),
    ]);
    if (!board) throw new Error("Board not found");

    const cards = await cardService.getCardsByBoard(supabase, boardId);
    const listsWithCards = lists.map((list: List) => ({
      ...list,
      cards: cards.filter((card: Card) => card.list_id === list.id),
    }));

    return { board, listsWithCards };
  },

  async createBoardWithDefaultLists(
    supabase: SupabaseClient,
    boardData: { title: string; description?: string; color?: string; userId: string; }
  ) {
    const board = await boardServiceInstance.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultLists = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultLists.map((list) =>
        listService.createList(supabase, {
          ...list,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};