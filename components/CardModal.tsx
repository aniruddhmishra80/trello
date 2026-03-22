"use client";

import { useCardModal } from "@/lib/hooks/use-card-modal";
import { useState, useEffect } from "react";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { 
  X, AlignLeft, Layout, Activity, Trash2, 
  User, Plus, CheckSquare, Paperclip, MapPin, 
  ChevronDown, Image as ImageIcon, Tag // Added Tag icon here!
} from "lucide-react";

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1506744626753-1fa7673e022b?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&auto=format&fit=crop"
];

const DEFAULT_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981", 
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899"
];

export const CardModal = () => {
  const { id, isOpen, onClose } = useCardModal();
  const { supabase } = useSupabase();
  const { user } = useUser();
  
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Core Edits
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Popover States
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [attachLink, setAttachLink] = useState("");
  const [attachText, setAttachText] = useState("");
  const [newItemText, setNewItemText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && id) fetchCardData();
  }, [isOpen, id]);

  const fetchCardData = async () => {
    if (!supabase) return;
    setIsLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    
    if (!error && data) {
      setCard({
        ...data,
        labels: data.labels || [],
        checklists: data.checklists || [],
        attachments: data.attachments || [],
        comments: data.comments || [],
        assignee: data.assignee || ""
      });
      setTitle(data.title || "");
      setDescription(data.description || "");
    }
    setIsLoading(false);
  };

  const updateField = async (field: string, value: any) => {
    if (!supabase || !id) return;
    setCard((prev: any) => ({ ...prev, [field]: value })); 
    const { error } = await supabase.from('tasks').update({ [field]: value }).eq('id', id);
    if (error) alert(`Error saving ${field}: \n\n${error.message}`);
  };

  // --- ACTIONS ---
  const handleTitleSave = () => { if (title.trim()) updateField('title', title); };
  const handleDescriptionSave = () => { updateField('description', description); setIsEditingDesc(false); };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => updateField('due_date', e.target.value);
  const handleLocationSave = () => {
    const loc = window.prompt("Enter location:", card.location || "");
    if (loc !== null) updateField('location', loc);
  };

  const handleAddMember = () => {
    const newMember = window.prompt("Enter member name/email:");
    if (!newMember) return;
    const currentMembers = card.assignee ? card.assignee.split(',').map((s: string) => s.trim()) : [];
    if (!currentMembers.includes(newMember)) {
      updateField('assignee', [...currentMembers, newMember].join(', '));
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    const currentMembers = card.assignee ? card.assignee.split(',').map((s: string) => s.trim()) : [];
    updateField('assignee', currentMembers.filter((m: string) => m !== memberToRemove).join(', '));
  };

  const handleAddLabel = () => {
    const newLabel = window.prompt("Enter a new label (e.g., Bug, Urgent):");
    if (newLabel) updateField('labels', [...card.labels, newLabel]);
  };

  const handleAddAttachment = () => {
    if (!attachLink.trim()) return;
    const newAttachment = { id: Date.now().toString(), url: attachLink, text: attachText || attachLink, date: new Date().toISOString() };
    updateField('attachments', [...card.attachments, newAttachment]);
    setAttachLink(""); setAttachText(""); setActivePopover(null);
  };

  const handleAddChecklist = () => {
    const t = window.prompt("Checklist title:", "Checklist");
    if (t) updateField('checklists', [...card.checklists, { id: Date.now().toString(), title: t, items: [] }]);
  };

  const handleAddChecklistItem = (checklistId: string) => {
    const text = newItemText[checklistId];
    if (!text || !text.trim()) return;
    const updated = card.checklists.map((cl: any) => cl.id === checklistId ? { ...cl, items: [...cl.items, { id: Date.now().toString(), text, is_completed: false }] } : cl);
    updateField('checklists', updated);
    setNewItemText({ ...newItemText, [checklistId]: "" }); 
  };

  const handleToggleChecklistItem = (checklistId: string, itemId: string) => {
    const updated = card.checklists.map((cl: any) => cl.id === checklistId ? { ...cl, items: cl.items.map((i: any) => i.id === itemId ? { ...i, is_completed: !i.is_completed } : i) } : cl);
    updateField('checklists', updated);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    updateField('comments', [{ id: Date.now().toString(), user: user?.firstName || "You", text: commentText, date: new Date().toISOString() }, ...card.comments]); 
    setCommentText("");
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this card permanently?")) {
      await supabase?.from('tasks').delete().eq('id', id);
      onClose(); window.location.reload(); 
    }
  };

  // --- COVER ACTIONS ---
  const handleSetCoverColor = (color: string) => {
    updateField('cover_color', color);
    updateField('cover_image', null); 
    setActivePopover(null);
  };

  const handleSetCoverImage = (imgUrl: string) => {
    updateField('cover_image', imgUrl);
    updateField('cover_color', null); 
    setActivePopover(null);
  };

  const handleRemoveCover = () => {
    updateField('cover_color', null);
    updateField('cover_image', null);
    setActivePopover(null);
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const getMembersArray = () => card?.assignee ? card.assignee.split(',').map((s:string) => s.trim()).filter(Boolean) : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-16 bg-black/80 backdrop-blur-sm overflow-y-auto pb-20">
      
      <div className="bg-[#22272b] text-[#b6c2cf] w-full max-w-[800px] rounded-xl shadow-2xl flex flex-col relative overflow-hidden min-h-[500px]">
        
        {/* State Synchronization: Reloads the page on close so filters catch the new labels */}
        <button 
          onClick={() => {
            onClose();
            window.location.reload();
          }} 
          className="absolute top-3 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full transition z-20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* --- CARD COVER AREA --- */}
        {(card?.cover_color || card?.cover_image) && (
          <div 
            className="w-full h-32 bg-cover bg-center"
            style={{ 
              backgroundColor: card.cover_color || undefined,
              backgroundImage: card.cover_image ? `url(${card.cover_image})` : undefined
            }}
          />
        )}

        {/* Banner */}
        <div className="bg-[#4b2c60] w-full px-6 py-3 flex items-center gap-3">
           <Layout className="w-5 h-5 text-white/80" />
           <p className="text-white/90 text-sm font-medium">Organize your cards by list, member, or label. <span className="underline cursor-pointer">Open Timeline</span></p>
        </div>

        {isLoading ? (
          <div className="p-10 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
        ) : (
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* --- LEFT COLUMN --- */}
            <div className="flex-1 space-y-8">
              
              {/* Title */}
              <div className="flex items-start gap-3">
                <Layout className="w-6 h-6 mt-1 text-[#9fadbc]" />
                <div className="w-full">
                  <input 
                    value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                    className="bg-transparent text-xl font-semibold text-[#c7d1db] hover:bg-[#1c2126] focus:bg-[#1c2126] focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 w-full transition-colors py-1"
                  />
                  <p className="text-sm text-[#8c9bab] ml-1 mt-1">in list <span className="underline cursor-pointer">Board</span></p>
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="pl-9 flex flex-wrap gap-2">
                
                {/* RESTORED LABELS BUTTON */}
                <button onClick={handleAddLabel} className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                  <Tag className="w-4 h-4" /> Labels
                </button>

                <button onClick={handleAddChecklist} className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                  <CheckSquare className="w-4 h-4" /> Checklist
                </button>
                <button onClick={handleAddMember} className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                  <User className="w-4 h-4" /> Members
                </button>
                
                {/* ATTACHMENT POPOVER */}
                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === 'attach' ? null : 'attach')} className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                    <Paperclip className="w-4 h-4" /> Attachment
                  </button>
                  {activePopover === 'attach' && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-[#282e33] rounded-lg shadow-2xl border border-[#3f464e] z-50 p-4">
                      <div className="flex justify-between items-center mb-4 border-b border-[#3f464e] pb-2">
                        <span className="font-semibold text-sm text-center flex-1 text-[#c7d1db]">Attach</span>
                        <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setActivePopover(null)} />
                      </div>
                      <div className="border-t border-[#3f464e] pt-3">
                        <label className="text-xs font-semibold text-[#c7d1db] mb-1 block">Paste a link <span className="text-red-400">*</span></label>
                        <input value={attachLink} onChange={(e) => setAttachLink(e.target.value)} placeholder="Paste link here" className="w-full bg-[#22272b] border border-[#3f464e] rounded p-2 text-sm focus:border-blue-500 mb-3 outline-none" />
                        <label className="text-xs font-semibold text-[#c7d1db] mb-1 block">Display text</label>
                        <input value={attachText} onChange={(e) => setAttachText(e.target.value)} placeholder="Text to display" className="w-full bg-[#22272b] border border-[#3f464e] rounded p-2 text-sm focus:border-blue-500 mb-3 outline-none" />
                        <button onClick={handleAddAttachment} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm transition">Attach Link</button>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleLocationSave} className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                  <MapPin className="w-4 h-4" /> Location
                </button>
              </div>

              {/* Badges Row */}
              <div className="pl-9 flex flex-wrap gap-6 pt-2">
                {card.labels?.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-[#8c9bab]">Labels</h4>
                    <div className="flex flex-wrap gap-1">
                      {card.labels.map((label: string, idx: number) => (
                        <div key={idx} className="bg-yellow-600 text-white px-3 py-1 rounded-sm text-sm font-medium">{label}</div>
                      ))}
                      <button onClick={handleAddLabel} className="bg-[#a6c5e229] hover:bg-[#a6c5e23d] p-1.5 rounded-sm transition"><Plus className="w-4 h-4 text-[#c7d1db]" /></button>
                    </div>
                  </div>
                )}

                {getMembersArray().length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold text-[#8c9bab]">Members</h4>
                    <div className="flex flex-wrap gap-1">
                      {getMembersArray().map((member: string, idx: number) => (
                        <div key={idx} onClick={() => handleRemoveMember(member)} className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:bg-red-500 transition" title="Remove member">
                          {member.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      <button onClick={handleAddMember} className="w-8 h-8 rounded-full bg-[#a6c5e229] hover:bg-[#a6c5e23d] flex items-center justify-center transition"><Plus className="w-4 h-4 text-[#c7d1db]" /></button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-semibold text-[#8c9bab]">Due date</h4>
                  <div className="relative">
                    <input type="datetime-local" onChange={handleDateChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <button className="flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                      {card.due_date ? formatTime(card.due_date) : "Add Date"} <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-3 pt-4">
                <AlignLeft className="w-6 h-6 mt-1 text-[#9fadbc]" />
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#c7d1db]">Description</h3>
                    {!isEditingDesc && <button onClick={() => setIsEditingDesc(true)} className="bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition">Edit</button>}
                  </div>
                  {isEditingDesc ? (
                    <div className="space-y-3">
                      <textarea autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a more detailed description..." className="w-full min-h-[120px] bg-[#22272b] text-[#c7d1db] border border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-md p-3 text-sm resize-y outline-none" />
                      <div className="flex gap-2">
                        <button onClick={handleDescriptionSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-sm text-sm font-medium transition">Save</button>
                        <button onClick={() => { setDescription(card.description || ""); setIsEditingDesc(false); }} className="hover:bg-[#a6c5e229] text-[#c7d1db] px-4 py-1.5 rounded-sm text-sm font-medium transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setIsEditingDesc(true)} className={`w-full min-h-[60px] rounded-md p-3 text-sm cursor-pointer transition ${description ? '' : 'bg-[#a6c5e229] hover:bg-[#a6c5e23d]'}`}>
                      {description ? <p className="whitespace-pre-wrap">{description}</p> : <p className="text-[#8c9bab]">Add a more detailed description...</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments List */}
              {card.attachments?.length > 0 && (
                <div className="flex items-start gap-3 pt-4">
                  <Paperclip className="w-6 h-6 mt-1 text-[#9fadbc]" />
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-[#c7d1db] mb-4">Attachments</h3>
                    <div className="space-y-3">
                      {card.attachments.map((att: any) => (
                        <div key={att.id} className="flex items-center justify-between hover:bg-[#a6c5e229] p-2 rounded transition group">
                          <a href={att.url} target="_blank" className="flex items-center gap-4 cursor-pointer flex-1">
                            <div className="w-20 h-16 bg-[#282e33] flex items-center justify-center rounded border border-[#3f464e] font-bold text-xs text-[#8c9bab]">LINK</div>
                            <div>
                              <p className="font-semibold text-sm text-[#c7d1db] group-hover:underline">{att.text}</p>
                              <p className="text-xs text-[#8c9bab]">Added {formatTime(att.date)}</p>
                            </div>
                          </a>
                          <button onClick={() => updateField('attachments', card.attachments.filter((a:any)=>a.id !== att.id))} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-red-400 rounded transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Checklists */}
              {card.checklists?.map((list: any) => {
                const completed = list.items.filter((i:any)=>i.is_completed).length;
                const total = list.items.length;
                const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
                return (
                  <div key={list.id} className="flex items-start gap-3 pt-4">
                    <CheckSquare className="w-6 h-6 mt-1 text-[#9fadbc]" />
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-[#c7d1db]">{list.title}</h3>
                        <button onClick={() => updateField('checklists', card.checklists.filter((c:any)=>c.id !== list.id))} className="bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-3 py-1.5 rounded-sm text-sm font-medium transition">Delete</button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs text-[#8c9bab] w-8">{percent}%</span>
                        <div className="bg-[#a6c5e229] flex-1 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        {list.items.map((item: any) => (
                          <div key={item.id} className="flex items-start gap-3">
                            <input type="checkbox" checked={item.is_completed} onChange={() => handleToggleChecklistItem(list.id, item.id)} className="mt-1 w-4 h-4 cursor-pointer" />
                            <p className={`text-sm ${item.is_completed ? 'line-through text-[#8c9bab]' : 'text-[#c7d1db]'}`}>{item.text}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={newItemText[list.id] || ""} onChange={(e) => setNewItemText({...newItemText, [list.id]: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') handleAddChecklistItem(list.id); }} placeholder="Add an item" className="flex-1 bg-[#22272b] border border-[#3f464e] rounded p-2 text-sm focus:border-blue-500 outline-none" />
                        <button onClick={() => handleAddChecklistItem(list.id)} className="bg-[#a6c5e229] hover:bg-[#a6c5e23d] px-4 rounded text-sm transition">Add</button>
                      </div>
                    </div>
                  </div>
                )
              })}

            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="w-full md:w-[220px] space-y-6 border-t md:border-t-0 md:border-l border-[#3f464e] pt-6 md:pt-0 md:pl-6">
              
              {/* Cover Feature Area */}
              <div>
                <h4 className="text-xs font-semibold text-[#8c9bab] mb-3">Add to card</h4>
                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === 'cover' ? null : 'cover')} className="w-full flex items-center gap-2 bg-[#a6c5e229] hover:bg-[#a6c5e23d] text-left px-3 py-1.5 rounded-sm text-sm font-medium transition text-[#c7d1db]">
                    <ImageIcon className="w-4 h-4" /> Cover
                  </button>

                  {/* COVER POPOVER */}
                  {activePopover === 'cover' && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#282e33] rounded-lg shadow-2xl border border-[#3f464e] z-50 p-4">
                      <div className="flex justify-between items-center mb-4 border-b border-[#3f464e] pb-2">
                        <span className="font-semibold text-sm text-center flex-1 text-[#c7d1db]">Cover</span>
                        <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setActivePopover(null)} />
                      </div>
                      
                      {/* Color Picker */}
                      <p className="text-xs font-semibold text-[#c7d1db] mb-2">Colors</p>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {DEFAULT_COLORS.map(color => (
                          <div 
                            key={color} 
                            onClick={() => handleSetCoverColor(color)}
                            className="w-full h-8 rounded cursor-pointer hover:opacity-80 transition" 
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* Image Picker */}
                      <p className="text-xs font-semibold text-[#c7d1db] mb-2">Photos</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {DEFAULT_IMAGES.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={() => handleSetCoverImage(img)}
                            className="w-full h-12 rounded cursor-pointer hover:opacity-80 transition bg-cover bg-center" 
                            style={{ backgroundImage: `url(${img})` }}
                          />
                        ))}
                      </div>

                      <button onClick={handleRemoveCover} className="w-full bg-[#a6c5e229] hover:bg-[#a6c5e23d] text-[#c7d1db] py-1.5 rounded text-sm transition mt-2">
                        Remove cover
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Section */}
              <div>
                <h4 className="text-xs font-semibold text-[#8c9bab] mb-3 mt-6">Activity</h4>
                <div className="flex gap-2 flex-col">
                  <div className="flex gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-xs text-white font-bold">{user?.firstName?.charAt(0) || "U"}</div>
                    <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-[#22272b] rounded-md p-3 text-sm text-[#c7d1db] border border-[#3f464e] focus:border-blue-500 outline-none min-h-[60px]" />
                  </div>
                  {commentText && (
                    <div className="flex justify-end"><button onClick={handleAddComment} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-sm text-xs font-medium transition">Save</button></div>
                  )}
                </div>
                <div className="mt-4 space-y-4 max-h-60 overflow-y-auto pr-2">
                  {card.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2 group">
                      <div className="w-6 h-6 rounded-full bg-slate-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold mt-1">{comment.user.charAt(0)}</div>
                      <div className="flex-1 relative">
                        <p className="text-xs font-semibold text-[#c7d1db] mb-0.5">{comment.user} <span className="text-[10px] font-normal text-[#8c9bab] ml-1">{formatTime(comment.date)}</span></p>
                        <div className="bg-[#22272b] border border-[#3f464e] p-2 rounded text-xs text-[#c7d1db]">{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-[#3f464e]">
                <h4 className="text-xs font-semibold text-[#8c9bab] mb-3">Actions</h4>
                <button onClick={handleDelete} className="w-full flex items-center gap-2 bg-[#f8717129] text-red-400 hover:bg-[#f871713d] px-3 py-2 rounded-sm text-sm font-medium transition">
                  <Trash2 className="w-4 h-4" /> Delete Card
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};