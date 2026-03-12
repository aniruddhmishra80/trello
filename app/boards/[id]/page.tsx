/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Correctly importing useBoard from your useBoards hook
import { useBoard } from '@/lib/hooks/useBoards';
import { useKanbanDnD } from "@/lib/hooks/useKanbanDnD";

// Importing the correct types. Renaming Card to CardModel to avoid clashing with Shadcn Card
import { ListWithCards, Card as CardModel } from "@/types";

import { MoreHorizontal, Plus, User, CheckSquare, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function DroppableList({
  list,
  children,
  onCreateCard,
  onEditList,
}: {
  list: ListWithCards;
  children: React.ReactNode;
  onCreateCard: (cardData: {
    listId: string;
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }) => Promise<void>;
  onEditList: (list: ListWithCards) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  return (
    <div
      ref={setNodeRef}
      className={`w-full lg:flex-shrink-0 lg:w-80 ${isOver ? "bg-slate-200 rounded-lg" : ""
        }`}
    >
      <div
        className={`bg-slate-100/80 rounded-lg shadow-sm border border-slate-200 ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""
          }`}
      >
        <div className="p-3 sm:p-4 border-b border-slate-200/60 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700 text-sm sm:text-base truncate pl-1">
              {list.title}
            </h3>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-600">
                {list.cards.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                onClick={() => onEditList(list)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-2">
          {children}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full mt-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 justify-start px-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a card
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Card</DialogTitle>
                <p className="text-sm text-gray-600">Add a card to {list.title}</p>
              </DialogHeader>

              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onCreateCard({
                  listId: list.id,
                  title: formData.get("title") as string,
                  description: formData.get("description") as string || undefined,
                  assignee: formData.get("assignee") as string || undefined,
                  dueDate: formData.get("dueDate") as string || undefined,
                  priority: formData.get("priority") as "low" | "medium" | "high" || "medium",
                });
                const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
                if (trigger) trigger.click();
              }}>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input id="title" name="title" placeholder="Enter card title" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Input id="assignee" name="assignee" placeholder="Who should do this?" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" id="dueDate" name="dueDate" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit">Add Card</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function getPriorityColor(priority: "low" | "medium" | "high"): string {
  switch (priority) {
    case "high": return "bg-red-500";
    case "medium": return "bg-yellow-500";
    case "low": return "bg-green-500";
    default: return "bg-slate-300";
  }
}

function CardContentUI({ card }: { card: any }) {
  const totalItems = card.checklists?.reduce((acc: number, cl: any) => acc + (cl.items?.length || 0), 0) || 0;
  const completedItems = card.checklists?.reduce((acc: number, cl: any) =>
    acc + (cl.items?.filter((item: any) => item.is_completed).length || 0)
    , 0) || 0;

  const hasDueDateText = card.due_date ? new Date(card.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="p-3 sm:p-3.5 space-y-2">
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {card.labels.map((label: string, idx: number) => (
            <Badge key={idx} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 py-0 h-5 text-[10px] font-semibold">
              {label}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-800 text-sm leading-tight break-words">
          {card.title}
        </h4>
        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getPriorityColor(card.priority)}`} />
      </div>

      {card.description && (
        <p className="text-xs text-slate-500 line-clamp-2">
          {card.description}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
        {hasDueDateText && (
          <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{hasDueDateText}</span>
          </div>
        )}

        {totalItems > 0 && (
          <div className={`flex items-center gap-1 ${completedItems === totalItems ? 'text-green-600 bg-green-50' : 'text-slate-600 bg-slate-100'} px-1.5 py-0.5 rounded`}>
            <CheckSquare className="h-3 w-3" />
            <span className="font-medium">{completedItems}/{totalItems}</span>
          </div>
        )}

        <div className="flex-1" />

        {card.assignee && (
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{card.assignee}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableCard({ card }: { card: CardModel }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={styles} {...listeners} {...attributes}>
      <Card className="cursor-pointer hover:ring-2 hover:ring-blue-400/50 shadow-sm border-slate-200 transition-all">
        <CardContentUI card={card} />
      </Card>
    </div>
  );
}

function CardOverlay({ card }: { card: CardModel }) {
  return (
    <Card className="cursor-grabbing shadow-xl ring-2 ring-blue-500 bg-white rotate-2 border-slate-200">
      <CardContentUI card={card} />
    </Card>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();

  // Using the renamed hooks and properties to match useBoards.ts
  const {
    board,
    lists,
    createRealCard,
    setLists,
    moveCard,
    createList,
    updateList,
    updateBoard
  } = useBoard(id as string);

  const {
    sensors,
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDnD(lists, setLists, moveCard);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);

  const [newListTitle, setNewListTitle] = useState("");
  const [editingListTitle, setEditingListTitle] = useState("");
  const [editingList, setEditingList] = useState<ListWithCards | null>(null);

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  function handleFilterChange(type: "priority" | "assignee" | "dueDate", value: string | string[] | null) {
    setFilters((prev) => ({ ...prev, [type]: value }));
  }

  function clearFilters() {
    setFilters({ priority: [], assignee: [], dueDate: null });
  }

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch { }
  }

  async function handleCreateCard({
    listId,
    title,
    description,
    assignee,
    dueDate,
    priority,
  }: {
    listId: string;
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: string;
    priority: "low" | "medium" | "high";
  }) {
    if (title.trim()) {
      await createRealCard(listId, { title, description, assignee, dueDate, priority });
    }
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    await createList(newListTitle.trim());
    setNewListTitle("");
    setIsCreatingList(false);
  }

  async function handleUpdateList(e: React.FormEvent) {
    e.preventDefault();
    if (!editingListTitle.trim() || !editingList) return;
    await updateList(editingList.id, editingListTitle.trim());
    setEditingListTitle("");
    setIsEditingList(false);
    setEditingList(null);
  }

  function handleEditList(list: ListWithCards) {
    setIsEditingList(true);
    setEditingList(list);
    setEditingListTitle(list.title);
  }

  const filteredLists = lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card) => {
      if (filters.priority.length > 0 && !filters.priority.includes(card.priority)) return false;
      if (filters.dueDate && card.due_date) {
        const taskDate = new Date(card.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();
        if (taskDate !== filterDate) return false;
      }
      return true;
    }),
  }));

  return (
    <>
      <div className="min-h-screen bg-blue-600/5 transition-colors">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) => count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0), 0
          )}
        />

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader><DialogTitle>Edit Board</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdateBoard}>
              <div className="space-y-2">
                <Label htmlFor="boardTitle">Board Title</Label>
                <Input
                  id="boardTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter board title..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Filter Cards</DialogTitle>
              <p className="text-sm text-gray-600">Filter cards by priority or due date</p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      onClick={() => {
                        const newPriorities = filters.priority.includes(priority)
                          ? filters.priority.filter((p) => p !== priority)
                          : [...filters.priority, priority];
                        handleFilterChange("priority", newPriorities);
                      }}
                      key={key}
                      variant={filters.priority.includes(priority) ? "default" : "outline"}
                      size="sm"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={filters.dueDate || ""}
                  onChange={(e) => handleFilterChange("dueDate", e.target.value || null)}
                />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={clearFilters}>Clear Filters</Button>
                <Button type="button" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <main className="container-fluid min-h-[calc(100vh-64px)] overflow-x-auto bg-slate-100 px-4 py-6">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start space-x-4 lg:space-x-4 h-full pb-4">
              {filteredLists.map((list, key) => (
                <DroppableList
                  key={key}
                  list={list}
                  onCreateCard={handleCreateCard}
                  onEditList={handleEditList}
                >
                  <SortableContext
                    items={list.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2.5 min-h-[10px]">
                      {list.cards.map((card, key) => (
                        <SortableCard card={card as CardModel} key={key} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableList>
              ))}

              <div className="flex-shrink-0 w-80">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white/50 border-dashed border-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                  onClick={() => setIsCreatingList(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another list
                </Button>
              </div>

              <DragOverlay>
                {activeTask ? <CardOverlay card={activeTask as CardModel} /> : null}
              </DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      <Dialog open={isCreatingList} onOpenChange={setIsCreatingList}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader><DialogTitle>Create New List</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateList}>
            <div className="space-y-2">
              <Label>List Title</Label>
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                required
              />
            </div>
            <div className="space-x-2 flex justify-end">
              <Button type="button" onClick={() => setIsCreatingList(false)} variant="outline">Cancel</Button>
              <Button type="submit">Create List</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingList} onOpenChange={setIsEditingList}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader><DialogTitle>Edit List</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateList}>
            <div className="space-y-2">
              <Label>List Title</Label>
              <Input
                value={editingListTitle}
                onChange={(e) => setEditingListTitle(e.target.value)}
                placeholder="Enter list title..."
                required
              />
            </div>
            <div className="space-x-2 flex justify-end">
              <Button type="button" onClick={() => { setIsEditingList(false); setEditingList(null); }} variant="outline">Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}