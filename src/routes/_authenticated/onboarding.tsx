import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Boas-vindas — FinanChat" }, { name: "description", content: "Configure seu FinanChat em 3 passos." }, { property: "og:title", content: "Boas-vindas — FinanChat" }, { property: "og:description", content: "Configure seu FinanChat em 3 passos." }] }),
  component: Onboarding,
});

const GOALS = [
  { v: "Sair das dívidas", e: "🧾" },
  { v: "Criar uma reserva de emergência", e: "🛟" },
  { v: "Economizar para um sonho", e: "✈️" },
  { v: "Entender para onde vai meu dinheiro", e: "🔍" },
];
const INCOMES = ["Até R$ 2.000", "R$ 2.000 a R$ 5.000", "R$ 5.000 a R$ 10.000", "Acima de R$ 10.000"];

function Onboarding() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.name ?? "");
  const [goal, setGoal] = useState<string | null>(null);
  const [income, setIncome] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: u.user!.id, name: name.trim(), main_goal: goal, income_range: income, onboarded: true });
    setSaving(false);
    if (error) { toast.error("Não foi possível salvar. Tente novamente."); return; }
    await qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Perfil criado!");
    navigate({ to: "/conversar" });
  }

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      <div className="flex gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={`Passo ${step + 1} de 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-2 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-muted-foreground">Passo {step + 1} de 3</p>

      {step === 0 && (
        <section className="mt-6 animate-pop">
          <p className="text-5xl" aria-hidden>👋</p>
          <h1 className="mt-4 text-3xl font-bold">Olá! Eu sou o FinanChat.</h1>
          <p className="mt-3 text-lg text-muted-foreground">Vou te ajudar a cuidar do seu dinheiro só conversando. Como posso te chamar?</p>
          <Label htmlFor="name" className="mt-8 block text-base">Seu nome</Label>
          <Input id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-14 text-lg" autoComplete="given-name" />
        </section>
      )}

      {step === 1 && (
        <section className="mt-6 animate-pop">
          <h1 className="text-3xl font-bold">Qual é o seu principal objetivo?</h1>
          <p className="mt-2 text-lg text-muted-foreground">Escolha um. Você pode mudar depois.</p>
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Objetivo financeiro">
            {GOALS.map((g) => (
              <button
                key={g.v}
                role="radio"
                aria-checked={goal === g.v}
                onClick={() => setGoal(g.v)}
                className={cn(
                  "flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 bg-card px-4 text-left text-lg font-semibold transition-colors",
                  goal === g.v ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                <span className="text-2xl" aria-hidden>{g.e}</span>
                {g.v}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-6 animate-pop">
          <h1 className="text-3xl font-bold">Quanto você recebe por mês?</h1>
          <p className="mt-2 text-lg text-muted-foreground">É opcional. Ajuda a dar dicas melhores.</p>
          <div className="mt-6 grid gap-3" role="radiogroup" aria-label="Faixa de renda">
            {INCOMES.map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={income === v}
                onClick={() => setIncome(income === v ? null : v)}
                className={cn(
                  "min-h-14 rounded-2xl border-2 bg-card px-4 text-left text-lg font-semibold",
                  income === v ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-auto flex gap-3 pt-8">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep(step - 1)}>Voltar</Button>
        )}
        {step < 2 ? (
          <Button size="lg" className="flex-1" disabled={step === 0 ? !name.trim() : !goal} onClick={() => setStep(step + 1)}>
            Continuar
          </Button>
        ) : (
          <Button size="lg" className="flex-1" disabled={saving} onClick={finish}>
            {saving ? "Salvando…" : income ? "Começar" : "Pular e começar"}
          </Button>
        )}
      </div>
    </div>
  );
}
