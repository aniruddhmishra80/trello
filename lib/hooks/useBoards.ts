"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { Board, ListWithCards, Card } from "@/types";
import { useSupabase } from "../supabase/SupabaseProvider";
import { boardDataService, boardServiceInstance } from "../services/boardService";
import { listService } from "../services/listService";
import { cardService } from "../services/cardService";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardServiceInstance.getBoards(supabase!, user.id);
      setBoards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user, loadBoards]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");

    try {
      const newBoard = await boardDataService.createBoardWithDefaultLists(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<ListWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithLists(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setLists(data.listsWithCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, loadBoard]);

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardServiceInstance.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createRealCard(
    listId: string,
    cardData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    try {
      const newCard = await cardService.createCard(supabase!, {
        title: cardData.title,
        description: cardData.description || null,
        assignee: cardData.assignee || null,
        due_date: cardData.dueDate || null,
        list_id: listId,
        sort_order:
          lists.find((list) => list.id === listId)?.cards.length || 0,
        priority: cardData.priority || "medium",
      });

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
        )
      );

      return newCard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the card."
      );
    }
  }

  async function moveCard(
    cardId: string,
    newListId: string,
    newOrder: number
  ) {
    try {
      await cardService.moveCard(supabase!, cardId, newListId, newOrder);

      setLists((prev) => {
        const newLists = [...prev];

        // Find and remove card from the old list
        let cardToMove: Card | null = null;
        for (const list of newLists) {
          const cardIndex = list.cards.findIndex((card) => card.id === cardId);
          if (cardIndex !== -1) {
            cardToMove = list.cards[cardIndex];
            list.cards.splice(cardIndex, 1);
            break;
          }
        }

        if (cardToMove) {
          // Add card to new list
          const targetList = newLists.find((list) => list.id === newListId);
          if (targetList) {
            targetList.cards.splice(newOrder, 0, cardToMove);
          }
        }

        return newLists;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move card.");
    }
  }

  async function createList(title: string) {
    if (!board || !user) throw new Error("Board not loaded");

    try {
      const newList = await listService.createList(supabase!, {
        title,
        board_id: board.id,
        sort_order: lists.length,
        user_id: user.id,
      });

      setLists((prev) => [...prev, { ...newList, cards: [] }]);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create list.");
    }
  }

  async function updateList(listId: string, title: string) {
    try {
      const updatedList = await listService.updateListTitle(
        supabase!,
        listId,
        title
      );

      setLists((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, ...updatedList } : list
        )
      );

      return updatedList;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update list.");
    }
  }

  return {
    board,
    lists,
    loading,
    error,
    updateBoard,
    createRealCard,
    setLists,
    moveCard,
    createList,
    updateList,
  };
}
