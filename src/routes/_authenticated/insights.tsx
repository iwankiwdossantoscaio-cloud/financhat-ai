import { createFileRoute } from "@tanstack/react-router";
import { buildInsights, formatBRL, monthKey, shiftDays, summarize, todayISO } from "@/lib/finance";
import { useGoals, useTransactions } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { PageHeader } from "./route";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Dicas — FinanChat" }, { name: "description", content: "Recomendações e resumos do seu dinheiro." }, { property: "og:title", content: "Dicas — FinanChat" }, { property: "og:description", content: "Recomendações e resumos do seu dinheiro." }] }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data: txs = [] } = useTransactions();
  const { data: goals = [] } = useGoals();
  const today = todayISO();
  const insights = buildInsights(txs, goals, today);
  const month = summarize(txs, monthKey(today));
  const weekFrom = shiftDays(today, -7);
  const week = txs.filter((t) => t.occurred_on > weekFrom);
  const wIn = week.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const wOut = week.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader title="Dicas" subtitle="O que seu assistente percebeu." />
      <div className="space-y-6 px-5 pb-6">
        <section aria-labelledby="rec-h">
          <h2 id="rec-h" className="text-xl font-bold">Recomendações</h2>
          {insights.length === 0 ? (
            <p className="mt-3 rounded-3xl bg-card p-5 text-muted-foreground shadow-soft">Registre alguns gastos e receitas e eu trarei dicas aqui. 🌱</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {insights.map((i) => (
                <li
                  key={i.id}
                  className={cn(
                    "flex gap-4 rounded-3xl p-4 shadow-soft",
                    i.tone === "warn" ? "bg-expense-soft" : i.tone === "good" ? "bg-income-soft" : "bg-card",
                  )}
                >
                  <span className="text-3xl" aria-hidden>{i.emoji}</span>
                  <div>
                    <p className="font-bold">{i.title}</p>
                    <p className="mt-0.5 text-base">{i.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Summary title="Resumo da semana" items={[["Recebido", wIn], ["Gasto", wOut], ["Sobrou", wIn - wOut]]} />
        <Summary title="Resumo do mês" items={[["Recebido", month.income], ["Gasto", month.expense], ["Economia", month.savings]]} extra={month.categories[0] ? `Maior gasto: ${month.categories[0].category} (${formatBRL(month.categories[0].total)})` : undefined} />
      </div>
    </div>
  );
}

function Summary({ title, items, extra }: { title: string; items: [string, number][]; extra?: string | undefined }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-soft">
      <h2 className="text-xl font-bold">{title}</h2>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm text-muted-foreground">{k}</dt>
            <dd className="text-lg font-bold">{formatBRL(v)}</dd>
          </div>
        ))}
      </dl>
      {extra && <p className="mt-3 text-base text-muted-foreground">{extra}</p>}
    </section>
  );
}
