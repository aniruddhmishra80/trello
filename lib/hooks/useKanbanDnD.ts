import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { ListWithCards, Card } from "@/types";

export function useKanbanDnD(
  lists: ListWithCards[],
  setLists: React.Dispatch<React.SetStateAction<ListWithCards[]>>,
  moveCard: (cardId: string, newListId: string, newOrder: number) => Promise<void>
) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const cardId = event.active.id as string;
    const card = lists
      .flatMap((list) => list.cards)
      .find((t) => t.id === cardId);

    if (card) {
      setActiveCard(card);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceList = lists.find((list) =>
      list.cards.some((t) => t.id === activeId)
    );

    const targetList = lists.find((list) =>
      list.cards.some((t) => t.id === overId)
    );

    if (!sourceList || !targetList) return;

    if (sourceList.id === targetList.id) {
      const activeIndex = sourceList.cards.findIndex(
        (t) => t.id === activeId
      );
      const overIndex = targetList.cards.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        setLists((prev) => {
          const newLists = [...prev];
          const list = newLists.find((p) => p.id === sourceList.id);
          if (list) {
            const cards = [...list.cards];
            const [removed] = cards.splice(activeIndex, 1);
            cards.splice(overIndex, 0, removed);
            list.cards = cards;
          }
          return newLists;
        });
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      return;
    }

    const cardId = active.id as string;
    const overId = over.id as string;

    const targetList = lists.find((list) => list.id === overId);
    if (targetList) {
      const sourceList = lists.find((list) =>
        list.cards.some((t) => t.id === cardId)
      );

      if (sourceList && sourceList.id !== targetList.id) {
        await moveCard(cardId, targetList.id, targetList.cards.length);
      }
    } else {
      const sourceList = lists.find((list) =>
        list.cards.some((t) => t.id === cardId)
      );

      const tgtList = lists.find((list) =>
        list.cards.some((t) => t.id === overId)
      );

      if (sourceList && tgtList) {
        const oldIndex = sourceList.cards.findIndex((t) => t.id === cardId);
        const newIndex = tgtList.cards.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex || sourceList.id !== tgtList.id) {
          await moveCard(cardId, tgtList.id, newIndex);
        }
      }
    }
    setActiveCard(null);
  }

  return {
    sensors,
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
