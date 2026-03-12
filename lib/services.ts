import { Workspace, SprintPhase, Ticket } from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const workspaceService = {
  async getWorkspace(supabase: SupabaseClient, workspaceId: string): Promise<Workspace> {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (error) throw error;

    return data;
  },

  async getWorkspaces(supabase: SupabaseClient, userId: string): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async createWorkspace(
    supabase: SupabaseClient,
    workspace: Omit<Workspace, "id" | "created_at" | "updated_at">
  ): Promise<Workspace> {
    const { data, error } = await supabase
      .from("workspaces")
      .insert(workspace)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateWorkspace(
    supabase: SupabaseClient,
    workspaceId: string,
    updates: Partial<Workspace>
  ): Promise<Workspace> {
    const { data, error } = await supabase
      .from("workspaces")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", workspaceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const sprintPhaseService = {
  async getSprintPhases(
    supabase: SupabaseClient,
    workspaceId: string
  ): Promise<SprintPhase[]> {
    const { data, error } = await supabase
      .from("sprint_phases")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createSprintPhase(
    supabase: SupabaseClient,
    phase: Omit<SprintPhase, "id" | "created_at">
  ): Promise<SprintPhase> {
    const { data, error } = await supabase
      .from("sprint_phases")
      .insert(phase)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateSprintPhaseTitle(
    supabase: SupabaseClient,
    phaseId: string,
    title: string
  ): Promise<SprintPhase> {
    const { data, error } = await supabase
      .from("sprint_phases")
      .update({ title })
      .eq("id", phaseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const ticketService = {
  async getTicketsByWorkspace(
    supabase: SupabaseClient,
    workspaceId: string
  ): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from("tickets")
      .select(
        `
        *,
        sprint_phases!inner(workspace_id)
        `
      )
      .eq("sprint_phases.workspace_id", workspaceId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createTicket(
    supabase: SupabaseClient,
    ticket: Omit<Ticket, "id" | "created_at" | "updated_at">
  ): Promise<Ticket> {
    const { data, error } = await supabase
      .from("tickets")
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async moveTicket(
    supabase: SupabaseClient,
    ticketId: string,
    newPhaseId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tickets")
      .update({
        phase_id: newPhaseId,
        sort_order: newOrder,
      })
      .eq("id", ticketId);

    if (error) throw error;
    return data;
  },
};

export const workspaceDataService = {
  async getWorkspaceWithPhases(supabase: SupabaseClient, workspaceId: string) {
    const [workspace, phases] = await Promise.all([
      workspaceService.getWorkspace(supabase, workspaceId),
      sprintPhaseService.getSprintPhases(supabase, workspaceId),
    ]);

    if (!workspace) throw new Error("Workspace not found");

    const tickets = await ticketService.getTicketsByWorkspace(supabase, workspaceId);

    const phasesWithTickets = phases.map((phase) => ({
      ...phase,
      tickets: tickets.filter((ticket) => ticket.phase_id === phase.id),
    }));

    return {
      workspace,
      phasesWithTickets,
    };
  },

  async createWorkspaceWithDefaultPhases(
    supabase: SupabaseClient,
    workspaceData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    const workspace = await workspaceService.createWorkspace(supabase, {
      title: workspaceData.title,
      description: workspaceData.description || null,
      color: workspaceData.color || "bg-blue-500",
      user_id: workspaceData.userId,
    });

    const defaultPhases = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultPhases.map((phase) =>
        sprintPhaseService.createSprintPhase(supabase, {
          ...phase,
          workspace_id: workspace.id,
          user_id: workspaceData.userId,
        })
      )
    );

    return workspace;
  },
};
