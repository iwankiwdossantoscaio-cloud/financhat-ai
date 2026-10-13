import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { FONT_SCALES, readPrefs, savePrefs, type Theme } from "@/lib/prefs";
import { useProfile } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { PageHeader } from "./route";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({ meta: [{ title: "Perfil — FinanChat" }, { name: "description", content: "Ajuste idioma, aparência e acessibilidade." }, { property: "og:title", content: "Perfil — FinanChat" }, { property: "og:description", content: "Ajuste idioma, aparência e acessibilidade." }] }),
  component: ProfilePage,
});

const LANGS = [
  { v: "pt-BR", l: "Português" },
  { v: "en", l: "English" },
  { v: "es", l: "Español" },
];

function ProfilePage() {
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [prefs, setPrefs] = useState<{ theme: Theme; fontScale: number }>({ theme: "light", fontScale: 1 });

  useEffect(() => setPrefs(readPrefs()), []);
  useEffect(() => setName(profile?.name ?? ""), [profile?.name]);

  async function update(patch: { name?: string; language?: string; simple_language?: boolean }) {
    if (!profile) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (error) { toast.error("Não foi possível salvar."); return; }
    toast.success("Preferência salva");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  function setPref(p: Partial<typeof prefs>) {
    const next = { ...prefs, ...p };
    setPrefs(next);
    savePrefs(next);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div>
      <PageHeader title="Perfil" subtitle={profile?.main_goal ? `Objetivo: ${profile.main_goal}` : undefined} />
      <div className="space-y-4 px-5 pb-6">
        <Card title="Seu nome">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); update({ name: name.trim() }); }}>
            <Label htmlFor="pname" className="sr-only">Nome</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-lg" />
            <Button type="submit" variant="soft">Salvar</Button>
          </form>
        </Card>

        <Card title="Idioma" desc="Idioma das respostas do assistente.">
          <Segmented
            label="Idioma"
            value={profile?.language ?? "pt-BR"}
            options={LANGS.map((x) => ({ value: x.v, label: x.l }))}
            onChange={(v) => update({ language: v })}
          />
        </Card>

        <Card title="Linguagem natural">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="simple" className="text-base font-normal">
              <span className="block font-bold">Linguagem simples</span>
              <span className="text-muted-foreground">Respostas curtas, sem termos difíceis.</span>
            </Label>
            <Switch id="simple" checked={profile?.simple_language ?? true} onCheckedChange={(v) => update({ simple_language: v })} className="scale-125" />
          </div>
        </Card>

        <Card title="Tamanho do texto">
          <Segmented
            label="Tamanho do texto"
            value={String(prefs.fontScale)}
            options={FONT_SCALES.map((s, i) => ({ value: String(s), label: ["A", "A+", "A++"][i] ?? "A" }))}
            onChange={(v) => setPref({ fontScale: Number(v) })}
          />
        </Card>

        <Card title="Aparência">
          <Segmented
            label="Aparência"
            value={prefs.theme}
            options={[{ value: "light", label: "☀️ Claro" }, { value: "dark", label: "🌙 Escuro" }]}
            onChange={(v) => setPref({ theme: v as Theme })}
          />
        </Card>

        <Button variant="outline" size="lg" className="w-full" onClick={signOut}>
          <LogOut aria-hidden /> Sair da conta
        </Button>
      </div>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-soft">
      <h2 className="text-lg font-bold">{title}</h2>
      {desc && <p className="text-base text-muted-foreground">{desc}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-2 rounded-2xl bg-muted p-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-12 flex-1 rounded-xl text-base font-semibold transition-colors",
            value === o.value ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
