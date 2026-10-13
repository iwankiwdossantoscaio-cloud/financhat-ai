import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Goal, Tx } from "@/lib/finance";

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const txQuery = queryOptions({
  queryKey: ["transactions"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id,type,amount,category,description,occurred_on")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data ?? []).map((t) => ({ ...t, amount: Number(t.amount) })) as Tx[];
  },
});

export const goalsQuery = queryOptions({
  queryKey: ["goals"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("id,title,target_amount,saved_amount,monthly_contribution")
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map((g) => ({
      ...g,
      target_amount: Number(g.target_amount),
      saved_amount: Number(g.saved_amount),
      monthly_contribution: g.monthly_contribution == null ? null : Number(g.monthly_contribution),
    })) as Goal[];
  },
});

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions: { kind: string; label: string; detail: string }[];
  created_at: string;
  pending?: boolean;
};

export const messagesQuery = queryOptions({
  queryKey: ["messages"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id,role,content,actions,created_at")
      .order("created_at", { ascending: true })
      .limit(300);
    if (error) throw error;
    return (data ?? []) as unknown as ChatMsg[];
  },
});

export const useProfile = () => useQuery(profileQuery);
export const useTransactions = () => useQuery(txQuery);
export const useGoals = () => useQuery(goalsQuery);
