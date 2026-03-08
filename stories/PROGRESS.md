# Registro de Progresso: Dog Magic List

Este documento consolida as atividades realizadas no projeto, servindo como uma linha do tempo técnica e funcional das entregas, correções e melhorias.

## 🛠️ [Março/2026] - Integração Electron e Estabilização de Build

Nesta etapa, focamos em transformar o projeto em uma aplicação desktop funcional, integrando o backend ao ciclo de vida do Electron e preparando o sistema para distribuição.

### ✅ Entregas de Infraestrutura
- **Integração Backend-Electron:** Configuração do processo principal do Electron para gerenciar o ciclo de vida do servidor Fastify (backend sidecar).
- **Sistema de Build Produtivo:** Implementação de scripts via `esbuild` para compilar o backend em um único arquivo (`server.cjs`) compatível com o ambiente empacotado.
- **Isolamento de Dados de Usuário:** Migração do banco de dados SQLite e pastas de debug para o diretório padrão de dados de aplicativos do sistema operacional (`userData`), garantindo persistência após instalação.
- **Configuração de Build do Electron:** Setup do `electron-builder` para geração de instaladores (AppImage para Linux) com inclusão automática de binários do Puppeteer.

### 🛠️ Correções e Refinamentos (Bugs 001-012)
- **Correção Crítica de Deleção:** Implementação de integridade referencial (`ON DELETE CASCADE`) e ativação de Foreign Keys no SQLite para garantir remoção limpa de decks e suas cartas vinculadas.
- **UX de Marketplace:** Ajustes na sincronia de preços e tratamento de erros no scraper da LigaMagic.
- **Wizard de Construção:** Estabilização do estado de confirmação ao remover cartas e correção de vazamento de estado entre passos do wizard.
- **UI & Layout:** Ajustes de alinhamento arquitetural e visual conforme a paleta de cores oficial.

---

## 🏗️ [Fevereiro/2026] - Fundação e Core de Inteligência

Fase inicial focada na estruturação da aplicação e nas capacidades de busca e processamento de dados.

### ✅ Funcionalidades Core (F01 & F02)
- **Gestão de Cartas:** Integração com Scryfall API para busca rápida e detalhada de cartas.
- **Inteligência de Mercado:** Implementação do Scraper inicial para LigaMagic via Puppeteer, permitindo consulta de preços reais no mercado brasileiro.
- **Arquitetura Event-Driven:** Setup da comunicação via IPC entre Frontend e Backend.
- **Persistência Local:** Modelagem inicial das tabelas de `decks`, `cards` e `lists` no SQLite usando Kysely.

---

## 🔮 Próximos Passos (Backlog Estratégico)

1.  **US04 - Central de Ativos (Library):** Implementação da gestão de coleção física (estoque local).
2.  **Otimizador de Carrinho Inteligente:** Algoritmo para encontrar a melhor combinação de lojas vs. frete no marketplace.
3.  **Análise de Saúde e Curva:** Painel estatístico (Mana Curve, Color Pie, Deck Categories) para auxílio na construção.
4.  **Sugestões Budget:** Sistema de recomendação de cartas alternativas baseadas em custo-benefício.
5.  **Refinamento de UX:** Implementação de Skeletons e notificações persistentes para operações de scraper em segundo plano.

---

*Última atualização: 07 de Março de 2026.*
