import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATEGORIES, formatBRL, goalProgress, monthKey, summarize, todayISO, type Goal, type Tx } from "@/lib/finance";

export type ActionConfirmation = { kind: string; label: string; detail: string };

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ text: z.string().trim().min(1).max(1000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { interpretMessage, AiError } = await import("@/lib/ai/interpret.server");

    const [{ data: profile }, { data: txs }, { data: goals }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("name, language, simple_language, main_goal").eq("id", userId).maybeSingle(),
      supabase.from("transactions").select("id,type,amount,category,description,occurred_on").order("occurred_on", { ascending: false }).limit(500),
      supabase.from("goals").select("id,title,target_amount,saved_amount,monthly_contribution"),
      supabase.from("chat_messages").select("role,content").order("created_at", { ascending: false }).limit(12),
    ]);

    const { error: userErr } = await supabase.from("chat_messages").insert({ user_id: userId, role: "user", content: data.text });
    if (userErr) throw new Error("Não foi possível salvar a mensagem.");

    const today = todayISO();
    const s = summarize((txs ?? []) as Tx[], monthKey(today));
    const goalList = ((goals ?? []) as Goal[])
      .map((g) => {
        const p = goalProgress(g);
        return `- ${g.title}: ${formatBRL(Number(g.saved_amount))} de ${formatBRL(Number(g.target_amount))} (${p.percent}%)`;
      })
      .join("\n");
    const ctx = [
      `Objetivo principal: ${profile?.main_goal ?? "não informado"}`,
      `Este mês: recebido ${formatBRL(s.income)}, gasto ${formatBRL(s.expense)}, economia ${formatBRL(s.savings)}. Saldo total ${formatBRL(s.balance)}.`,
      `Gastos por categoria no mês: ${s.categories.map((c) => `${c.category} ${formatBRL(c.total)}`).join(", ") || "nenhum"}`,
      `Metas:\n${goalList || "nenhuma"}`,
    ].join("\n");

    const messages = [...(history ?? [])].reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    messages.push({ role: "user", content: data.text });

    let result;
    try {
      result = await interpretMessage({
        history: messages,
        context: ctx,
        today,
        userName: profile?.name ?? null,
        language: profile?.language ?? "pt-BR",
        simple: profile?.simple_language ?? true,
      });
    } catch (e) {
      const msg = e instanceof AiError ? e.message : "O assistente não respondeu. Tente novamente.";
      return { reply: msg, confirmations: [] as ActionConfirmation[], error: true };
    }

    const confirmations: ActionConfirmation[] = [];
    for (const a of result.actions) {
      const amount = a.amount && a.amount > 0 ? Math.round(a.amount * 100) / 100 : null;
      if (!amount) continue;
      if (a.kind === "expense" || a.kind === "income") {
        const category = a.category && (CATEGORIES as readonly string[]).includes(a.category) ? a.category : a.kind === "income" ? "Trabalho" : "Outros";
        const date = a.date && /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : today;
        const { error } = await supabase.from("transactions").insert({
          user_id: userId,
          type: a.kind,
          amount,
          category,
          description: a.description ?? "",
          occurred_on: date,
        });
        if (!error)
          confirmations.push({
            kind: a.kind,
            label: a.kind === "expense" ? "Despesa registrada" : "Receita registrada",
            detail: `${formatBRL(amount)} · ${category}`,
          });
      } else if (a.kind === "goal_create" && a.goal_title) {
        const { error } = await supabase.from("goals").insert({
          user_id: userId,
          title: a.goal_title.slice(0, 80),
          target_amount: amount,
          monthly_contribution: a.monthly_contribution && a.monthly_contribution > 0 ? a.monthly_contribution : null,
        });
        if (!error) confirmations.push({ kind: a.kind, label: "Meta criada", detail: `${a.goal_title} · ${formatBRL(amount)}` });
      } else if (a.kind === "goal_contribution" && a.goal_title) {
        const t = a.goal_title.toLowerCase();
        const g = ((goals ?? []) as Goal[]).find((x) => x.title.toLowerCase() === t) ??
          ((goals ?? []) as Goal[]).find((x) => x.title.toLowerCase().includes(t) || t.includes(x.title.toLowerCase()));
        if (g) {
          const { error } = await supabase.from("goals").update({ saved_amount: Number(g.saved_amount) + amount }).eq("id", g.id);
          if (!error) confirmations.push({ kind: a.kind, label: "Meta atualizada", detail: `+${formatBRL(amount)} em ${g.title}` });
        }
      }
    }

    await supabase.from("chat_messages").insert({ user_id: userId, role: "assistant", content: result.reply, actions: confirmations });
    return { reply: result.reply, confirmations, error: false };
  });
