import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle, Mic, ShieldCheck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinanChat — Controle suas finanças conversando" },
      { name: "description", content: "Registre gastos, receitas e metas falando ou escrevendo, como numa conversa com um amigo." },
      { property: "og:title", content: "FinanChat — Controle suas finanças conversando" },
      { property: "og:description", content: "Registre gastos, receitas e metas falando ou escrevendo, como numa conversa com um amigo." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/conversar", replace: true });
    });
  }, [navigate]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
      <div className="flex items-center gap-2">
        <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
          <MessageCircle aria-hidden className="size-5" />
        </span>
        <span className="font-display text-xl font-bold">FinanChat</span>
      </div>

      <img
        src={hero}
        alt="Uma senhora e um jovem sorrindo enquanto conversam com o assistente no celular"
        width={1024}
        height={768}
        className="mt-6 aspect-[4/3] w-full rounded-3xl object-cover shadow-soft"
      />

      <h1 className="mt-7 text-[2rem] font-bold leading-tight">
        Controle seu dinheiro como quem conversa com um amigo.
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Diga “gastei 45 no mercado” e pronto. Sem planilhas, sem termos difíceis.
      </p>

      <ul className="mt-6 space-y-3 text-base">
        <li className="flex items-center gap-3"><Mic aria-hidden className="size-5 text-primary" /> Fale ou escreva do seu jeito</li>
        <li className="flex items-center gap-3"><MessageCircle aria-hidden className="size-5 text-primary" /> Tudo organizado automaticamente</li>
        <li className="flex items-center gap-3"><ShieldCheck aria-hidden className="size-5 text-primary" /> Seus dados protegidos</li>
      </ul>

      <div className="mt-auto space-y-3 pt-8">
        <Button asChild variant="hero" size="lg" className="w-full">
          <Link to="/auth" search={{ mode: "signup" }}>Começar agora</Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full">
          <Link to="/auth" search={{ mode: "signin" }}>Já tenho conta</Link>
        </Button>
      </div>
    </main>
  );
}
