# FinanChat AI

**Assistente Financeiro Conversacional com Inteligência Artificial**

## 1. Sobre o Projeto

O FinanChat AI é um aplicativo de finanças pessoais que permite registrar receitas, despesas e metas financeiras por meio de conversas em linguagem natural.

Em vez de preencher planilhas ou formulários complexos, o usuário pode simplesmente conversar com o assistente virtual para organizar suas finanças.

**Exemplo de interação**

Usuário:

> Gastei R$ 50 no mercado hoje.

FinanChat AI:

> Despesa de R$ 50 registrada na categoria Alimentação.

Usuário:

> Recebi R$ 3.500 de salário.

FinanChat AI:

> Receita de R$ 3.500 registrada com sucesso.

O objetivo do projeto é tornar a organização financeira mais simples, acessível e inclusiva, utilizando a Inteligência Artificial para facilitar o controle das movimentações financeiras e o acompanhamento de objetivos pessoais.

## 2. Principais Funcionalidades

- Registro de despesas por meio de conversas.
- Registro de receitas utilizando linguagem natural.
- Entrada por voz para facilitar o registro de movimentações.
- Classificação automática de receitas e despesas por categoria.
- Dashboard financeiro com receitas, despesas, saldo e economia mensal.
- Criação e acompanhamento de metas financeiras.
- Insights gerados por Inteligência Artificial.
- Alertas sobre metas e mudanças nos hábitos de consumo.
- Interface responsiva, acessível e desenvolvida com abordagem mobile-first.

## 3. Tecnologias Utilizadas

- **React:** construção da interface do aplicativo.
- **TypeScript:** tipagem estática e maior organização do código.
- **Tailwind CSS:** estilização e desenvolvimento de uma interface responsiva.
- **Supabase:** estrutura de backend, banco de dados e serviços de autenticação, conforme a implementação do projeto.
- **OpenAI:** integração com modelos de Inteligência Artificial para interpretação de linguagem natural, caso habilitada na aplicação.
- **Lovable:** ferramenta utilizada como apoio à criação e ao desenvolvimento do projeto.

## 4. Demonstrações do Aplicativo

Esta seção apresenta as evidências visuais das funcionalidades e das interações realizadas com o FinanChat AI.

### 4.1. Registro de Despesas

O usuário pode informar uma despesa por meio de uma mensagem em linguagem natural.

**Exemplo de interação:**

> Gastei R$ 45 na padaria hoje.

**Evidência:**

[Adicionar captura de tela do registro de despesa]

### 4.2. Registro de Receitas

O aplicativo permite informar receitas, como salários, pagamentos por serviços e outras fontes de renda.

**Exemplo de interação:**

> Recebi R$ 2.500 de salário.

**Evidência:**

[Adicionar captura de tela do registro de receita]

### 4.3. Criação de Metas Financeiras

O usuário pode estabelecer objetivos financeiros e acompanhar seu progresso.

**Exemplo de interação:**

> Quero economizar R$ 10.000 para uma viagem.

**Evidência:**

[Adicionar captura de tela da criação ou do acompanhamento de uma meta]

### 4.4. Dashboard Financeiro

O dashboard apresenta uma visão simplificada da situação financeira do usuário, incluindo receitas, despesas, saldo e distribuição dos gastos por categoria.

**Evidência:**

[Adicionar captura de tela do dashboard]

### 4.5. Interações com a Inteligência Artificial

Adicione capturas de tela ou vídeos curtos que demonstrem como a Inteligência Artificial foi utilizada durante o desenvolvimento e como o aplicativo responde às mensagens dos usuários.

**Evidências:**

[Adicionar capturas de tela ou links para os vídeos das interações reais]

## 5. Prompt Final Utilizado (PRD)

### 5.1. Objetivo

Desenvolver um aplicativo mobile-first chamado FinanChat AI, focado em finanças pessoais conversacionais.

O sistema deve permitir que os usuários registrem receitas, despesas e metas financeiras por meio de mensagens de texto ou comandos de voz, utilizando linguagem natural para simplificar a organização financeira.

A Inteligência Artificial deve interpretar as informações fornecidas e identificar, quando disponíveis:

- Tipo da movimentação financeira.
- Valor.
- Categoria.
- Data.
- Descrição.

Quando as informações forem insuficientes ou ambíguas, o sistema deve solicitar esclarecimentos antes de confirmar o registro.

### 5.2. Princípios de Design

O aplicativo deve seguir os princípios de:

- Design Universal.
- Acessibilidade WCAG AA.
- Simplicidade cognitiva.
- Desenvolvimento mobile-first.
- Linguagem clara e acessível.
- Feedback imediato após as ações.
- Navegação intuitiva e compatibilidade com tecnologias assistivas.

### 5.3. Principais Telas

**Onboarding:** apresentação do aplicativo e coleta das informações iniciais necessárias.

**Conversar:** interface principal para registrar movimentações financeiras por texto ou voz.

**Dashboard:** apresentação dos indicadores financeiros e da evolução das receitas e despesas.

**Metas:** criação e acompanhamento de objetivos financeiros.

**Insights:** apresentação de análises e recomendações sobre os hábitos financeiros do usuário.

**Perfil:** gerenciamento das preferências e configurações do aplicativo.

### 5.4. Requisitos Técnicos

- React para a construção da interface.
- TypeScript para organização e segurança de tipos.
- Tailwind CSS para estilização.
- Supabase para os serviços de backend e persistência de dados.
- Arquitetura preparada para integração com modelos de linguagem.
- Proteção dos dados financeiros e utilização segura das credenciais de serviços externos.

## 6. O Que o Aplicativo Faz?

O FinanChat AI transforma informações fornecidas em conversas em registros financeiros organizados.

A proposta é permitir que o usuário controle suas finanças de maneira mais natural, sem depender de formulários extensos ou conhecimentos avançados de educação financeira.

Por meio das funcionalidades previstas, o aplicativo busca:

- Interpretar gastos informados em linguagem natural.
- Registrar receitas e despesas.
- Organizar movimentações por categorias.
- Acompanhar metas financeiras.
- Apresentar recomendações personalizadas.
- Exibir resumos e relatórios financeiros simplificados.
- Facilitar a compreensão dos hábitos de consumo.

## 7. Reflexão Sobre o Processo

### 7.1. O Que Funcionou Bem?

A utilização da Inteligência Artificial como apoio ao desenvolvimento facilitou a estruturação da proposta, a organização dos requisitos e a definição das principais funcionalidades do aplicativo.

A elaboração de um documento de requisitos do produto (PRD) ajudou a transformar a ideia inicial em uma proposta mais clara, estabelecendo objetivos, público-alvo, funcionalidades e diretrizes de design.

A abordagem conversacional também se mostrou uma alternativa promissora para simplificar o registro das movimentações financeiras.

### 7.2. O Que Não Funcionou Como Esperado?

Um dos desafios desse tipo de aplicação é garantir que a Inteligência Artificial interprete corretamente as mensagens, identifique os valores e classifique as movimentações de maneira adequada.

Também é necessário validar a integração entre a interface, o backend e os serviços de Inteligência Artificial, além de tratar informações incompletas ou ambíguas.

Esses aspectos demonstram a importância de realizar testes e revisar os resultados gerados durante o desenvolvimento.

*Esta reflexão deve ser ajustada para representar as dificuldades realmente encontradas durante a implementação.*

### 7.3. O Que Aprendi Sobre Conversar com IAs?

Aprendi que instruções claras, detalhadas e bem organizadas ajudam a obter respostas mais próximas do resultado esperado.

A definição de um PRD permite explicar à Inteligência Artificial o propósito do projeto, suas funcionalidades, suas restrições e as necessidades dos usuários.

Também compreendi que as respostas geradas pela IA precisam ser revisadas, testadas e validadas. Embora essa tecnologia possa acelerar o desenvolvimento, a avaliação humana continua sendo importante para garantir a qualidade, a segurança e a usabilidade da aplicação.

## 8. Considerações Finais

O FinanChat AI propõe uma maneira mais simples e acessível de organizar as finanças pessoais por meio da Inteligência Artificial.

Ao utilizar conversas em linguagem natural, o projeto busca reduzir a complexidade do controle financeiro e ajudar os usuários a compreender melhor suas receitas, despesas e objetivos.

Como próximos passos, o aplicativo poderá evoluir por meio de testes de usabilidade, aprimoramento da interpretação de linguagem natural, melhorias de acessibilidade e expansão das funcionalidades financeiras.

## 9. Repositório do Projeto

**Projeto:** FinanChat AI

**Atividade:** Desafio da DIO

**Repositório GitHub:** [Adicionar o link do repositório]

**Aplicação publicada:** [Adicionar o link da aplicação, caso esteja disponível]
