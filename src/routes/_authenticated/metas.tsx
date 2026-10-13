import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL, goalProgress, type Goal } from "@/lib/finance";
import { useGoals } from "@/lib/queries";
import { PageHeader } from "./route";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas — FinanChat" }, { name: "description", content: "Acompanhe seus objetivos financeiros." }, { property: "og:title", content: "Metas — FinanChat" }, { property: "og:description", content: "Acompanhe seus objetivos financeiros." }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const [open, setOpen] = useState(false);
  const [deposit, setDeposit] = useState<Goal | null>(null);

  return (
    <div>
      <PageHeader title="Metas" subtitle="Seus sonhos, passo a passo." />
      <div className="space-y-4 px-5 pb-6">
        {!isLoading && goals.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed p-6 text-center">
            <p className="text-4xl" aria-hidden>🎯</p>
            <p className="mt-3 text-lg font-semibold">Nenhuma meta ainda</p>
            <p className="mt-1 text-muted-foreground">Diga no chat: “quero juntar 5 mil para viajar”.</p>
            <Button asChild variant="soft" className="mt-5"><Link to="/conversar">Criar pela conversa</Link></Button>
          </div>
        )}
        {goals.map((g) => {
          const p = goalProgress(g);
          return (
            <article key={g.id} className="rounded-3xl bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{g.title}</h2>
                <span className="rounded-full bg-goal-soft px-3 py-1 text-base font-bold text-goal">{p.percent}%</span>
              </div>
              <div
                className="mt-4 h-4 rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={p.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progresso de ${g.title}`}
              >
                <div className="h-4 rounded-full bg-goal transition-all" style={{ width: `${p.percent}%` }} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-base">
                <div><dt className="text-muted-foreground">Guardado</dt><dd className="font-bold">{formatBRL(g.saved_amount)}</dd></div>
                <div><dt className="text-muted-foreground">Objetivo</dt><dd className="font-bold">{formatBRL(g.target_amount)}</dd></div>
                <div><dt className="text-muted-foreground">Falta</dt><dd className="font-bold">{formatBRL(p.remaining)}</dd></div>
                <div>
                  <dt className="text-muted-foreground">Tempo estimado</dt>
                  <dd className="font-bold">
                    {p.monthsLeft === 0 ? "Concluída 🏆" : p.monthsLeft ? `${p.monthsLeft} ${p.monthsLeft === 1 ? "mês" : "meses"}` : "Defina um valor mensal"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Button variant="soft" className="flex-1" onClick={() => setDeposit(g)}>
                  <Plus aria-hidden /> Guardar dinheiro
                </Button>
                <DeleteGoal goal={g} />
              </div>
            </article>
          );
        })}
        <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(true)}>
          <Plus aria-hidden /> Nova meta
        </Button>
      </div>
      <NewGoalDialog open={open} onOpenChange={setOpen} />
      <DepositDialog goal={deposit} onClose={() => setDeposit(null)} />
    </div>
  );
}

function parseMoney(v: string) {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function NewGoalDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const t = parseMoney(target);
    if (!title.trim() || t <= 0) { toast.error("Preencha o nome e o valor da meta."); return; }
    const { data: u } = await supabase.auth.getUser();
    const m = parseMoney(monthly);
    const { error } = await supabase.from("goals").insert({ user_id: u.user!.id, title: title.trim(), target_amount: t, monthly_contribution: m > 0 ? m : null });
    if (error) { toast.error("Não foi possível criar a meta."); return; }
    toast.success("Meta criada", { description: title });
    qc.invalidateQueries({ queryKey: ["goals"] });
    setTitle(""); setTarget(""); setMonthly("");
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="text-2xl">Nova meta</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="gt" className="text-base">Qual é o sonho?</Label><Input id="gt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Viagem" className="h-12 text-lg" /></div>
          <div className="space-y-2"><Label htmlFor="gv" className="text-base">Quanto precisa (R$)</Label><Input id="gv" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="5000" className="h-12 text-lg" /></div>
          <div className="space-y-2"><Label htmlFor="gm" className="text-base">Quanto pode guardar por mês (opcional)</Label><Input id="gm" inputMode="decimal" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="200" className="h-12 text-lg" /></div>
          <Button type="submit" size="lg" className="w-full">Criar meta</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepositDialog({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [value, setValue] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = parseMoney(value);
    if (!goal || v <= 0) { toast.error("Digite um valor."); return; }
    const { error } = await supabase.from("goals").update({ saved_amount: goal.saved_amount + v }).eq("id", goal.id);
    if (error) { toast.error("Não foi possível salvar."); return; }
    toast.success("Meta atualizada", { description: `+${formatBRL(v)} em ${goal.title}` });
    qc.invalidateQueries({ queryKey: ["goals"] });
    setValue("");
    onClose();
  }
  return (
    <Dialog open={!!goal} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle className="text-2xl">Guardar em “{goal?.title}”</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="dv" className="text-base">Valor (R$)</Label><Input id="dv" autoFocus inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="100" className="h-12 text-lg" /></div>
          <Button type="submit" size="lg" className="w-full">Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteGoal({ goal }: { goal: Goal }) {
  const qc = useQueryClient();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Apagar meta ${goal.title}`}
      onClick={async () => {
        if (!confirm(`Apagar a meta "${goal.title}"?`)) return;
        const { error } = await supabase.from("goals").delete().eq("id", goal.id);
        if (error) { toast.error("Não foi possível apagar."); return; }
        toast.success("Meta apagada");
        qc.invalidateQueries({ queryKey: ["goals"] });
      }}
    >
      <Trash2 />
    </Button>
  );
}
