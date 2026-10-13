# FinanChat AI

Crie um app de finanças pessoais com base no seguinte PRD (PRODUCTION REQUERIMENTS DOCUMENT). 



Objetivo: 

Crie um aplicativo mobile-first chamado FinanChat, focado em finanças pessoais conversacionais. O produto deve seguir os princípios de Design Universal, acessibilidade WCAG AA e abordagem mobile-first. A principal interface deve ser um chat inteligente com entrada por texto e voz. O sistema deve interpretar linguagem natural para registrar receitas, despesas e metas financeiras automaticamente. Crie telas de Onboarding, Conversar, Dashboard Simplificado, Metas, Insights e Perfil. Utilize React, TypeScript, Tailwind CSS, Supabase e arquitetura preparada para integração com LLMs. O design deve combinar a simplicidade do WhatsApp, a clareza do Duolingo, a confiança do Nubank e a organização do Notion, priorizando acessibilidade, simplicidade cognitiva e experiência para usuários iniciantes, idosos e pessoas com diferentes necessidades de acessibilidade.

# PRD - FinanChat

Assistente Financeiro Conversacional com Design Universal



==============================================================

1. VISÃO DO PRODUTO

==============================================================



O FinanChat é um aplicativo de finanças pessoais baseado em Inteligência Artificial que permite registrar despesas, receitas e metas financeiras através de conversas em linguagem natural.



O objetivo é eliminar a complexidade das planilhas e formulários tradicionais, transformando o controle financeiro em uma experiência simples, acessível e intuitiva.



O produto será construído seguindo princípios de Design Universal, acessibilidade e simplicidade cognitiva, garantindo uso fácil para iniciantes, idosos e usuários com diferentes perfis de alfabetização digital.



==============================================================

2. PROBLEMA

==============================================================



Muitas pessoas abandonam aplicativos financeiros porque:



- Exigem preenchimento manual constante.

- Possuem interfaces complexas.

- Utilizam termos financeiros difíceis.

- Não oferecem orientação personalizada.

- Não atendem adequadamente usuários com necessidades de acessibilidade.



Como consequência, usuários deixam de acompanhar gastos e perdem oportunidades de economizar ou atingir objetivos financeiros.



==============================================================

3. OBJETIVO

==============================================================



Permitir que qualquer pessoa organize sua vida financeira apenas conversando com um assistente virtual.



Exemplo:



Usuário:

"Gastei R$ 45 no mercado hoje."



IA:

"Despesa registrada em Alimentação no valor de R$ 45."



==============================================================

4. PÚBLICO-ALVO

==============================================================



Primário:

- Pessoas iniciando educação financeira.

- Jovens adultos.

- Trabalhadores autônomos.

- Usuários com pouca familiaridade tecnológica.



Secundário:

- Pessoas idosas.

- Famílias.

- Usuários com TDAH.

- Pessoas com baixa visão.

- Pessoas que desejam criar hábitos financeiros consistentes.



==============================================================

5. PROPOSTA DE VALOR

==============================================================



"Controle suas finanças da mesma forma que conversa com um amigo."



O usuário não precisa aprender planilhas nem navegar por menus complexos.



A IA entende linguagem natural e transforma conversas em informações financeiras organizadas.



==============================================================

6. PRINCÍPIOS DE DESIGN UNIVERSAL

==============================================================



1. Simplicidade extrema

- Poucos elementos por tela.

- Linguagem clara.

- Fluxos curtos.



2. Inclusão cognitiva

- Sem jargões financeiros.

- Explicações simples.

- Orientação passo a passo.



3. Acessibilidade visual

- Contraste WCAG AA.

- Dark Mode.

- Fontes escaláveis.

- Compatibilidade com leitores de tela.



4. Acessibilidade motora

- Botões grandes.

- Navegação por teclado.

- Comandos por voz.



5. Acessibilidade linguística

- Aceitar diferentes formas de comunicação.



Exemplo:



"Gastei 50 no almoço"

"Almoço 50 reais"

"Paguei 50 reais pra comer"



Todos devem gerar o mesmo resultado.



6. Feedback imediato

- Toda ação deve ter confirmação clara.



Exemplos:



✅ Despesa registrada

✅ Meta criada

✅ Relatório atualizado



==============================================================

7. FUNCIONALIDADES DO MVP

==============================================================



7.1 Chat Financeiro Inteligente



O usuário registra:



- Despesas

- Receitas

- Metas



Utilizando mensagens naturais.



Exemplos:



"Recebi R$ 3.000 de salário."



"Paguei R$ 120 de internet."



"Gastei R$ 70 com gasolina."



A IA precisa identificar:



- Tipo da movimentação

- Valor

- Categoria

- Data

- Descrição



--------------------------------------------------------------



7.2 Registro por Voz



Fluxo:



Usuário fala

→ IA interpreta

→ Sistema registra

→ Confirmação exibida



--------------------------------------------------------------



7.3 Classificação Automática



Categorias:



- Alimentação

- Transporte

- Moradia

- Saúde

- Educação

- Compras

- Lazer

- Trabalho

- Investimentos

- Outros



--------------------------------------------------------------



7.4 Dashboard Simplificado



Mostrar:



- Total recebido

- Total gasto

- Saldo atual

- Economia do mês

- Gastos por categoria



Evitar excesso de gráficos.



--------------------------------------------------------------



7.5 Metas Financeiras



Exemplos:



- Comprar carro

- Viagem

- Reserva de emergência

- Quitar dívidas



A IA calcula:



- Valor restante

- Percentual concluído

- Tempo estimado



--------------------------------------------------------------



7.6 Agente Financeiro



Analisar comportamento financeiro.



Exemplos:



"Você gastou 18% mais com alimentação este mês."



"Economizando R$ 200 por mês você atingirá sua meta em 12 meses."



--------------------------------------------------------------



7.7 Alertas Inteligentes



Exemplos:



"Você não registra movimentações há 5 dias."



"Sua meta atingiu 80%."



"Os gastos com transporte aumentaram nesta semana."



==============================================================

8. PRINCIPAIS TELAS

==============================================================



Tela 1 - Onboarding



Objetivo:

- Explicar o aplicativo.

- Criar perfil inicial.



Campos:

- Nome

- Objetivo financeiro principal

- Faixa de renda (opcional)



--------------------------------------------------------------



Tela 2 - Conversar



Elementos:

- Campo de mensagem

- Botão de voz

- Histórico de conversas

- Sugestões rápidas



--------------------------------------------------------------



Tela 3 - Dashboard



Cards:



- Receitas

- Despesas

- Saldo

- Economia



Gráficos:



- Gastos por categoria

- Evolução dos gastos



--------------------------------------------------------------



Tela 4 - Metas



Informações:



- Meta

- Valor total

- Valor acumulado

- Progresso



--------------------------------------------------------------



Tela 5 - Insights



Exibir:



- Recomendações da IA

- Resumos semanais

- Resumos mensais



--------------------------------------------------------------



Tela 6 - Perfil



Configurações:



- Idioma

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b9667222-573d-4cf1-bbee-90ecbf8e5fc6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
