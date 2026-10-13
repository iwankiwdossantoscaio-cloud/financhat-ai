import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import { CATEGORY_EMOJI, formatBRL, monthKey, previousMonth, shiftDays, summarize, todayISO } from "@/lib/finance";
import { useTransactions } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { PageHeader } from "./route";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — FinanChat" }, { name: "description", content: "Resumo simples do seu mês." }, { property: "og:title", content: "Painel — FinanChat" }, { property: "og:description", content: "Resumo simples do seu mês." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: txs = [], isLoading } = useTransactions();
  const today = todayISO();
  const month = monthKey(today);
  const s = summarize(txs, month);
  const monthName = new Date(today + "T12:00:00").toLocaleDateString("pt-BR", { month: "long" });

  // Last 6 months of spending
  const months: string[] = [];
  let m = month;
  for (let i = 0; i < 6; i++) { months.unshift(m); m = previousMonth(m); }
  const evolution = months.map((k) => ({ k, total: summarize(txs, k).expense }));
  const maxEvo = Math.max(1, ...evolution.map((e) => e.total));
  const maxCat = Math.max(1, ...s.categories.map((c) => c.total));
  const recent = txs.filter((t) => t.occurred_on > shiftDays(today, -30)).slice(0, 6);

  return (
    <div>
      <PageHeader title="Painel" subtitle={`Resumo de ${monthName}`} />
      <div className="px-5">
        <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-pop">
          <p className="flex items-center gap-2 text-base font-semibold opacity-90"><Wallet aria-hidden className="size-5" /> Saldo atual</p>
          <p className="mt-1 font-display text-4xl font-bold">{isLoading ? "…" : formatBRL(s.balance)}</p>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon={<ArrowUpCircle aria-hidden />} label="Recebido" value={s.income} tone="income" />
          <Stat icon={<ArrowDownCircle aria-hidden />} label="Gasto" value={s.expense} tone="expense" />
          <div className="col-span-2">
            <Stat icon={<PiggyBank aria-hidden />} label="Economia do mês" value={s.savings} tone={s.savings >= 0 ? "income" : "expense"} />
          </div>
        </div>

        {txs.length === 0 && !isLoading ? (
          <div className="mt-8 rounded-3xl border-2 border-dashed p-6 text-center">
            <p className="text-4xl" aria-hidden>🌱</p>
            <p className="mt-3 text-lg font-semibold">Ainda não há registros</p>
            <p className="mt-1 text-muted-foreground">Conte ao assistente seu primeiro gasto.</p>
            <Button asChild className="mt-5"><Link to="/conversar">Ir para a conversa</Link></Button>
          </div>
        ) : (
          <>
            <section className="mt-8" aria-labelledby="cat-h">
              <h2 id="cat-h" className="text-xl font-bold">Gastos por categoria</h2>
              {s.categories.length === 0 ? (
                <p className="mt-3 text-muted-foreground">Nenhum gasto neste mês.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {s.categories.map((c) => (
                    <li key={c.category}>
                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold"><span aria-hidden>{CATEGORY_EMOJI[c.category]} </span>{c.category}</span>
                        <span className="font-bold">{formatBRL(c.total)}</span>
                      </div>
                      <div className="mt-1.5 h-3 rounded-full bg-muted" aria-hidden>
                        <div className="h-3 rounded-full bg-expense" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8" aria-labelledby="evo-h">
              <h2 id="evo-h" className="text-xl font-bold">Evolução dos gastos</h2>
              <div className="mt-4 flex h-40 items-end gap-2 rounded-3xl bg-card p-4 shadow-soft">
                {evolution.map((e) => {
                  const label = new Date(e.k + "-15T12:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
                  return (
                    <div key={e.k} className="flex flex-1 flex-col items-center gap-1.5" aria-label={`${label}: ${formatBRL(e.total)}`} role="img">
                      <div className="flex w-full flex-1 items-end">
                        <div className={e.k === month ? "w-full rounded-t-lg bg-primary" : "w-full rounded-t-lg bg-primary-soft"} style={{ height: `${Math.max(4, (e.total / maxEvo) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 pb-6" aria-labelledby="rec-h">
              <h2 id="rec-h" className="text-xl font-bold">Últimos registros</h2>
              <ul className="mt-3 divide-y rounded-3xl bg-card shadow-soft">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-2xl" aria-hidden>{CATEGORY_EMOJI[t.category] ?? "📦"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{t.description || t.category}</p>
                      <p className="text-sm text-muted-foreground">{t.category} · {new Date(t.occurred_on + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={t.type === "income" ? "font-bold text-income" : "font-bold text-expense"}>
                      {t.type === "income" ? "+" : "−"}{formatBRL(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "income" | "expense" }) {
  return (
    <div className="rounded-3xl bg-card p-4 shadow-soft">
      <p className={tone === "income" ? "flex items-center gap-2 text-base font-semibold text-income [&_svg]:size-5" : "flex items-center gap-2 text-base font-semibold text-expense [&_svg]:size-5"}>
        {icon} {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold">{formatBRL(value)}</p>
    </div>
  );
}
