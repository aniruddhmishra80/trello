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
import { Textarea } from "@/components/ui/textarea";

import { useBoard } from '@/lib/hooks/useBoards';
import { useKanbanDnD } from "@/lib/hooks/useKanbanDnD";
import { useCardModal } from "@/lib/hooks/use-card-modal";
import { useSupabase } from "@/lib/supabase/SupabaseProvider"; // Imported for List Deletion
import { ListWithCards, Card as CardModel } from "@/types";

import { MoreHorizontal, Plus, User, CheckSquare, Clock, Trash2, Search } from "lucide-react";
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

const BOARD_COLORS = ["#0079bf", "#d29034", "#519839", "#b04632", "#89609e", "#cd5a91"];
const BOARD_IMAGES = [
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-15196813937f5-4467d1c67e81?q=80&w=1920&auto=format&fit=crop"  
];

function DroppableList({
  list, children, onCreateCard, onEditList, onDeleteList
}: {
  list: ListWithCards; children: React.ReactNode;
  onCreateCard: (cardData: any) => Promise<void>;
  onEditList: (list: ListWithCards) => void;
  onDeleteList: (listId: string) => void; // Added Delete Prop
}) {
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  return (
    <div ref={setNodeRef} className={`w-full lg:flex-shrink-0 lg:w-80 ${isOver ? "bg-black/10 rounded-lg" : ""}`}>
      <div className={`bg-slate-100/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/50 ${isOver ? "ring-2 ring-blue-400 ring-opacity-50" : ""}`}>
        <div className="p-3 sm:p-4 border-b border-slate-200/60 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate pl-1">{list.title}</h3>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs bg-slate-200/80 text-slate-700">{list.cards.length}</Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800" onClick={() => onEditList(list)}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {/* NEW DELETE LIST BUTTON */}
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteList(list.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-2">
          {children}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full mt-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 justify-start px-2">
                <Plus className="h-4 w-4 mr-2" /> Add a card
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
              <DialogHeader><DialogTitle>Create New Card</DialogTitle></DialogHeader>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onCreateCard({
                  listId: list.id, title: formData.get("title") as string,
                  description: formData.get("description") as string || undefined,
                  assignee: formData.get("assignee") as string || undefined,
                  dueDate: formData.get("dueDate") as string || undefined,
                  priority: formData.get("priority") as "low" | "medium" | "high" || "medium",
                });
                const trigger = document.querySelector('[data-state="open"]') as HTMLElement;
                if (trigger) trigger.click();
              }}>
                <div className="space-y-2"><Label>Title *</Label><Input id="title" name="title" required /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea id="description" name="description" rows={3} /></div>
                <div className="flex justify-end pt-4"><Button type="submit">Add Card</Button></div>
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
  const completedItems = card.checklists?.reduce((acc: number, cl: any) => acc + (cl.items?.filter((item: any) => item.is_completed).length || 0), 0) || 0;
  const hasDueDateText = card.due_date ? new Date(card.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

  return (
    <div className="p-3 sm:p-3.5 space-y-2">
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {card.labels.map((label: string, idx: number) => (
            <Badge key={idx} className="bg-yellow-500 text-white border-none px-2 py-0 h-5 text-[10px] font-semibold">{label}</Badge>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-slate-800 text-sm leading-tight break-words">{card.title}</h4>
        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getPriorityColor(card.priority)}`} />
      </div>
      {card.description && <p className="text-xs text-slate-500 line-clamp-2">{card.description}</p>}
      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
        {hasDueDateText && (
          <div className="flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.5 rounded text-slate-600">
            <Clock className="h-3 w-3" /> <span className="font-medium">{hasDueDateText}</span>
          </div>
        )}
        {totalItems > 0 && (
          <div className={`flex items-center gap-1 ${completedItems === totalItems ? 'text-green-600 bg-green-50' : 'text-slate-600 bg-slate-100/80'} px-1.5 py-0.5 rounded`}>
            <CheckSquare className="h-3 w-3" /> <span className="font-medium">{completedItems}/{totalItems}</span>
          </div>
        )}
        <div className="flex-1" />
        {card.assignee && (
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded">
            <User className="h-3 w-3" /> <span className="truncate max-w-[80px]">{card.assignee.split(',')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SortableCard({ card }: { card: CardModel }) {
  const cardModal = useCardModal();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });
  const styles = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const cardData = card as any;
  const hasCover = cardData.cover_color || cardData.cover_image;

  return (
    <div ref={setNodeRef} style={styles} {...listeners} {...attributes}>
      <Card 
        onClick={() => cardModal.onOpen(card.id)}
        className="cursor-pointer hover:ring-2 hover:ring-blue-400/50 shadow-sm border-slate-200 transition-all overflow-hidden"
        style={{ 
          backgroundColor: cardData.cover_color || 'white',
          backgroundImage: cardData.cover_image ? `url(${cardData.cover_image})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}
      >
        <div className={hasCover ? "bg-gradient-to-t from-white via-white/95 to-transparent pt-12 w-full h-full" : "w-full h-full"}>
          <CardContentUI card={card} />
        </div>
      </Card>
    </div>
  );
}

function CardOverlay({ card }: { card: CardModel }) {
  const cardData = card as any;
  const hasCover = cardData.cover_color || cardData.cover_image;
  return (
    <Card 
      className="cursor-grabbing shadow-xl ring-2 ring-blue-500 rotate-2 border-slate-200 overflow-hidden"
      style={{ backgroundColor: cardData.cover_color || 'white', backgroundImage: cardData.cover_image ? `url(${cardData.cover_image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className={hasCover ? "bg-gradient-to-t from-white via-white/95 to-transparent pt-12 w-full h-full" : "w-full h-full"}>
        <CardContentUI card={card} />
      </div>
    </Card>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase(); // For list deletion

  const {
    board, lists, createRealCard, setLists, moveCard, createList, updateList, updateBoard
  } = useBoard(id as string);

  const { sensors, activeTask, handleDragStart, handleDragOver, handleDragEnd } = useKanbanDnD(lists, setLists, moveCard);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBgColor, setNewBgColor] = useState("");
  const [newBgImage, setNewBgImage] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isEditingList, setIsEditingList] = useState(false);

  const [newListTitle, setNewListTitle] = useState("");
  const [editingListTitle, setEditingListTitle] = useState("");
  const [editingList, setEditingList] = useState<ListWithCards | null>(null);

  // SEARCH AND FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ label: "", member: "", dueDate: null as string | null });

  function clearFilters() { 
    setFilters({ label: "", member: "", dueDate: null }); 
    setSearchQuery("");
  }

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !board) return;
    try {
      await updateBoard(board.id, { title: newTitle.trim(), background_color: newBgColor, background_image: newBgImage } as any);
      setIsEditingTitle(false);
    } catch (err) { console.error(err); }
  }

  async function handleCreateCard(cardData: any) {
    if (cardData.title.trim()) await createRealCard(cardData.listId, cardData);
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    await createList(newListTitle.trim());
    setNewListTitle(""); setIsCreatingList(false);
  }

  async function handleUpdateList(e: React.FormEvent) {
    e.preventDefault();
    if (!editingListTitle.trim() || !editingList) return;
    await updateList(editingList.id, editingListTitle.trim());
    setEditingListTitle(""); setIsEditingList(false); setEditingList(null);
  }

  function handleEditList(list: ListWithCards) {
    setIsEditingList(true); setEditingList(list); setEditingListTitle(list.title);
  }

  // --- DELETE LIST FUNCTION ---
  async function handleDeleteList(listId: string) {
    if (window.confirm("Are you sure you want to delete this list? All cards inside it will be permanently removed.")) {
      const { error } = await supabase.from('columns').delete().eq('id', listId);
      if (error) {
        alert("Failed to delete list: " + error.message);
      } else {
        // Update the screen instantly
        setLists((prev) => prev.filter((l) => l.id !== listId));
      }
    }
  }

  // --- FILTERING LOGIC ---
  const filteredLists = lists.map((list) => ({
    ...list,
    cards: list.cards.filter((card: any) => {
      // 1. Search by Title
      if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // 2. Filter by Label
      if (filters.label && (!card.labels || !card.labels.some((l: string) => l.toLowerCase().includes(filters.label.toLowerCase())))) return false;
      
      // 3. Filter by Member (Assignee)
      if (filters.member && (!card.assignee || !card.assignee.toLowerCase().includes(filters.member.toLowerCase()))) return false;
      
      // 4. Filter by Due Date
      if (filters.dueDate) {
        if (!card.due_date) return false;
        if (new Date(card.due_date).toDateString() !== new Date(filters.dueDate).toDateString()) return false;
      }
      
      return true;
    }),
  }));

  const boardData = board as any; 

  return (
    <>
      <div 
        className="min-h-screen transition-all duration-500 bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
        style={{
          backgroundColor: boardData?.background_color || '#0079bf', 
          backgroundImage: boardData?.background_image ? `url(${boardData.background_image})` : undefined,
        }}
      >
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? ""); setNewBgColor(boardData?.background_color ?? ""); setNewBgImage(boardData?.background_image ?? ""); setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={(searchQuery ? 1 : 0) + (filters.label ? 1 : 0) + (filters.member ? 1 : 0) + (filters.dueDate ? 1 : 0)}
        />

        {/* --- SLEEK SEARCH BAR --- */}
        <div className="w-full px-6 py-3 bg-black/20 backdrop-blur-sm border-b border-white/10 flex items-center gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards by title..." 
              className="pl-9 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 transition-all h-9"
            />
          </div>
          {(searchQuery || filters.label || filters.member || filters.dueDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/20 h-9">
              Clear All Filters
            </Button>
          )}
        </div>

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader><DialogTitle>Board Settings</DialogTitle></DialogHeader>
            <form className="space-y-6" onSubmit={handleUpdateBoard}>
              <div className="space-y-2"><Label htmlFor="boardTitle">Board Title</Label><Input id="boardTitle" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required /></div>
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <Label>Board Background</Label>
                <div className="space-y-2"><p className="text-xs text-slate-500">Colors</p>
                  <div className="grid grid-cols-6 gap-2">
                    {BOARD_COLORS.map(color => (
                      <div key={color} onClick={() => { setNewBgColor(color); setNewBgImage(""); }} className={`w-full h-8 rounded cursor-pointer transition-all hover:scale-105 ${newBgColor === color && !newBgImage ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><p className="text-xs text-slate-500">Photos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BOARD_IMAGES.map((img, i) => (
                      <div key={i} onClick={() => { setNewBgImage(img); setNewBgColor(""); }} className={`w-full h-16 rounded cursor-pointer transition-all hover:scale-105 bg-cover bg-center ${newBgImage === img ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} style={{ backgroundImage: `url(${img})` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4"><Button type="button" variant="outline" onClick={() => setIsEditingTitle(false)}>Cancel</Button><Button type="submit">Save Settings</Button></div>
            </form>
          </DialogContent>
        </Dialog>

        <main className="container-fluid flex-1 overflow-x-auto px-4 py-6">
          <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            <div className="flex items-start space-x-4 lg:space-x-4 h-full pb-4">
              
              {filteredLists.map((list, key) => (
                <DroppableList key={key} list={list} onCreateCard={handleCreateCard} onEditList={handleEditList} onDeleteList={handleDeleteList}>
                  <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2.5 min-h-[10px]">
                      {list.cards.map((card, key) => <SortableCard card={card as CardModel} key={key} />)}
                    </div>
                  </SortableContext>
                </DroppableList>
              ))}

              <div className="flex-shrink-0 w-80">
                <Button variant="outline" className="w-full justify-start h-12 bg-white/50 backdrop-blur-sm border-dashed border-2 border-white/40 text-slate-800 font-semibold hover:bg-white/80 transition-colors" onClick={() => setIsCreatingList(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add another list
                </Button>
              </div>

              <DragOverlay>{activeTask ? <CardOverlay card={activeTask as CardModel} /> : null}</DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader><DialogTitle>Filter Cards</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter by Label</Label>
              <Input placeholder="Type a label (e.g., Bug)" value={filters.label} onChange={(e) => setFilters({...filters, label: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Filter by Member</Label>
              <Input placeholder="Type a member name" value={filters.member} onChange={(e) => setFilters({...filters, member: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Filter by Due Date</Label>
              <Input type="date" value={filters.dueDate || ""} onChange={(e) => setFilters({...filters, dueDate: e.target.value || null})} />
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={clearFilters}>Clear Filters</Button>
              <Button type="button" onClick={() => setIsFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingList} onOpenChange={setIsCreatingList}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader><DialogTitle>Create New List</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateList}>
            <div className="space-y-2"><Label>List Title</Label><Input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} required /></div>
            <div className="space-x-2 flex justify-end"><Button type="button" onClick={() => setIsCreatingList(false)} variant="outline">Cancel</Button><Button type="submit">Create List</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingList} onOpenChange={setIsEditingList}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader><DialogTitle>Edit List</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateList}>
            <div className="space-y-2"><Label>List Title</Label><Input value={editingListTitle} onChange={(e) => setEditingListTitle(e.target.value)} required /></div>
            <div className="space-x-2 flex justify-end"><Button type="button" onClick={() => { setIsEditingList(false); setEditingList(null); }} variant="outline">Cancel</Button><Button type="submit">Save</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}