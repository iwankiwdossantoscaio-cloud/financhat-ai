// LLM layer: turns a natural-language message into a reply + structured finance actions.
// Swap model/provider here without touching the rest of the app.
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText, type ModelMessage } from "ai";
import { z } from "zod";
import { CATEGORIES } from "@/lib/finance";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export const actionSchema = z.object({
  kind: z.enum(["expense", "income", "goal_create", "goal_contribution"]),
  amount: z.number().nullable(),
  category: z.enum(CATEGORIES).nullable(),
  description: z.string().nullable(),
  date: z.string().nullable().describe("YYYY-MM-DD"),
  goal_title: z.string().nullable(),
  monthly_contribution: z.number().nullable(),
});

const resultSchema = z.object({
  reply: z.string(),
  actions: z.array(actionSchema),
});

export type InterpretResult = z.infer<typeof resultSchema>;
export type InterpretAction = z.infer<typeof actionSchema>;

export class AiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function interpretMessage(opts: {
  history: ModelMessage[];
  context: string;
  today: string;
  userName: string | null;
  language: string;
  simple: boolean;
}): Promise<InterpretResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new AiError("Assistente não configurado.", 401);

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const instructions = `Você é o FinanChat, um assistente financeiro gentil, paciente e claro.
Hoje é ${opts.today} (fuso de São Paulo). Usuário: ${opts.userName ?? "amigo"}.
Responda no idioma: ${opts.language}. ${opts.simple ? "Use linguagem muito simples, frases curtas, sem jargões financeiros. Ideal para iniciantes e idosos." : "Use linguagem clara e objetiva."}

Sua tarefa:
1. Identificar movimentações financeiras na mensagem e devolver em "actions":
   - "expense" (gasto/paguei/comprei), "income" (recebi/ganhei/salário), com amount (número positivo em reais), category, description curta, date (YYYY-MM-DD; "ontem" = dia anterior; sem data = hoje).
   - "goal_create" quando o usuário quer criar uma meta (ex: "quero juntar 10 mil para viagem"): goal_title, amount = valor total, monthly_contribution se mencionado.
   - "goal_contribution" quando guarda dinheiro para uma meta existente: goal_title (use o nome exato da lista de metas), amount.
   - Entenda formas variadas: "Gastei 50 no almoço", "Almoço 50 reais", "Paguei 50 reais pra comer" = mesma despesa em Alimentação.
   - Valores brasileiros: "R$ 3.000" = 3000; "3 mil" = 3000; "45,90" = 45.9.
   - Categorias permitidas: ${CATEGORIES.join(", ")}. Mercado/restaurante/almoço = Alimentação; gasolina/uber/ônibus = Transporte; aluguel/luz/água/internet = Moradia; farmácia/médico = Saúde; salário/freela = Trabalho.
   - Campos não aplicáveis = null. Se não houver movimentação, actions = [].
   - Se faltar o valor, NÃO crie a ação; pergunte o valor na resposta.
2. Escrever "reply": uma confirmação curta e amigável (1 a 3 frases). Ex: "Despesa registrada em Alimentação no valor de R$ 45,00." Pode responder perguntas usando os dados abaixo. Nunca invente números que não estão nos dados.

Dados atuais do usuário:
${opts.context}`;

  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages: opts.history,
    output: Output.object({ schema: resultSchema }),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  try {
    const output = await result.output;
    return output;
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      return { reply: "Desculpe, não entendi bem. Pode repetir de outro jeito?", actions: [] };
    }
    if (APICallError.isInstance(err)) {
      const s = err.statusCode ?? 500;
      if (s === 402) throw new AiError("Os créditos de IA acabaram. Tente novamente mais tarde.", 402);
      if (s === 429) throw new AiError("Muitas mensagens em pouco tempo. Aguarde um instante.", 429);
      if (s === 403) throw new AiError("O assistente está temporariamente indisponível.", 403);
      throw new AiError("O assistente não respondeu. Tente novamente.", s);
    }
    throw err;
  }
}
