// Pure finance helpers shared by UI and server. No I/O here.

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Compras",
  "Lazer",
  "Trabalho",
  "Investimentos",
  "Outros",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_EMOJI: Record<string, string> = {
  Alimentação: "🍽️",
  Transporte: "🚗",
  Moradia: "🏠",
  Saúde: "🩺",
  Educação: "📚",
  Compras: "🛍️",
  Lazer: "🎉",
  Trabalho: "💼",
  Investimentos: "📈",
  Outros: "📦",
};

export type Tx = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  occurred_on: string; // YYYY-MM-DD
};

export type Goal = {
  id: string;
  title: string;
  target_amount: number;
  saved_amount: number;
  monthly_contribution: number | null;
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (n: number) => brl.format(n);

export function monthKey(date: string) {
  return date.slice(0, 7);
}

export function todayISO(now = new Date()) {
  // São Paulo local date
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

export function summarize(txs: Tx[], month: string) {
  let income = 0;
  let expense = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory: Record<string, number> = {};
  for (const t of txs) {
    const amt = Number(t.amount);
    if (t.type === "income") totalIncome += amt;
    else totalExpense += amt;
    if (monthKey(t.occurred_on) !== month) continue;
    if (t.type === "income") income += amt;
    else {
      expense += amt;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + amt;
    }
  }
  const categories = Object.entries(byCategory)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
  return {
    income: round(income),
    expense: round(expense),
    savings: round(income - expense),
    balance: round(totalIncome - totalExpense),
    categories,
  };
}

export function goalProgress(g: Goal) {
  const target = Number(g.target_amount);
  const saved = Number(g.saved_amount);
  const remaining = Math.max(0, round(target - saved));
  const percent = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const monthly = g.monthly_contribution ? Number(g.monthly_contribution) : 0;
  const monthsLeft = remaining === 0 ? 0 : monthly > 0 ? Math.ceil(remaining / monthly) : null;
  return { remaining, percent, monthsLeft };
}

export function monthsToReach(remaining: number, monthly: number) {
  if (remaining <= 0) return 0;
  if (monthly <= 0) return null;
  return Math.ceil(remaining / monthly);
}

export function previousMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}

export type Insight = {
  id: string;
  tone: "info" | "good" | "warn";
  emoji: string;
  title: string;
  text: string;
};

export function buildInsights(txs: Tx[], goals: Goal[], today = todayISO()): Insight[] {
  const out: Insight[] = [];
  const month = monthKey(today);
  const prev = previousMonth(month);
  const cur = summarize(txs, month);
  const last = summarize(txs, prev);

  // Days since last record
  if (txs.length > 0) {
    const latest = txs.reduce((a, t) => (t.occurred_on > a ? t.occurred_on : a), txs[0].occurred_on);
    const days = Math.floor((Date.parse(today) - Date.parse(latest)) / 86400000);
    if (days >= 5) {
      out.push({
        id: "inactive",
        tone: "warn",
        emoji: "⏰",
        title: "Que tal registrar algo?",
        text: `Você não registra movimentações há ${days} dias.`,
      });
    }
  }

  // Category change vs last month
  for (const c of cur.categories.slice(0, 3)) {
    const before = last.categories.find((x) => x.category === c.category)?.total ?? 0;
    if (before > 0) {
      const pct = Math.round(((c.total - before) / before) * 100);
      if (Math.abs(pct) >= 10) {
        out.push({
          id: `cat-${c.category}`,
          tone: pct > 0 ? "warn" : "good",
          emoji: CATEGORY_EMOJI[c.category] ?? "📊",
          title: c.category,
          text:
            pct > 0
              ? `Você gastou ${pct}% mais com ${c.category.toLowerCase()} este mês.`
              : `Você gastou ${Math.abs(pct)}% menos com ${c.category.toLowerCase()} este mês. Muito bem!`,
        });
      }
    }
  }

  // Weekly transport trend
  const weekAgo = shiftDays(today, -7);
  const twoWeeksAgo = shiftDays(today, -14);
  const sumRange = (from: string, to: string, cat: string) =>
    txs
      .filter((t) => t.type === "expense" && t.category === cat && t.occurred_on > from && t.occurred_on <= to)
      .reduce((s, t) => s + Number(t.amount), 0);
  const tNow = sumRange(weekAgo, today, "Transporte");
  const tBefore = sumRange(twoWeeksAgo, weekAgo, "Transporte");
  if (tBefore > 0 && tNow > tBefore * 1.1) {
    out.push({
      id: "transport-week",
      tone: "warn",
      emoji: "🚗",
      title: "Transporte",
      text: "Os gastos com transporte aumentaram nesta semana.",
    });
  }

  // Goals
  for (const g of goals) {
    const p = goalProgress(g);
    if (p.percent >= 100) {
      out.push({ id: `goal-done-${g.id}`, tone: "good", emoji: "🏆", title: g.title, text: `Parabéns! Você concluiu a meta "${g.title}".` });
    } else if (p.percent >= 80) {
      out.push({ id: `goal-80-${g.id}`, tone: "good", emoji: "🎯", title: g.title, text: `Sua meta "${g.title}" atingiu ${p.percent}%.` });
    } else {
      const monthly = g.monthly_contribution ? Number(g.monthly_contribution) : 200;
      const months = monthsToReach(p.remaining, monthly);
      if (months) {
        out.push({
          id: `goal-plan-${g.id}`,
          tone: "info",
          emoji: "💡",
          title: g.title,
          text: `Economizando ${formatBRL(monthly)} por mês você atingirá "${g.title}" em ${months} ${months === 1 ? "mês" : "meses"}.`,
        });
      }
    }
  }

  if (cur.income > 0 && cur.savings > 0) {
    const rate = Math.round((cur.savings / cur.income) * 100);
    out.push({ id: "savings-rate", tone: "good", emoji: "🌱", title: "Economia do mês", text: `Você guardou ${rate}% do que recebeu este mês.` });
  } else if (cur.income > 0 && cur.savings < 0) {
    out.push({ id: "overspend", tone: "warn", emoji: "⚠️", title: "Atenção", text: "Este mês você gastou mais do que recebeu." });
  }

  return out;
}

export function shiftDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
