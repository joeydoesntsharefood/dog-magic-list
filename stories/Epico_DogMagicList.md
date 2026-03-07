# Épico: Dog Magic List - Ecossistema Inteligente para Gestão de MTG

## 1. Visão Geral
O **Dog Magic List** é uma aplicação desktop (Electron) de alta performance projetada para colecionadores e jogadores de Magic: The Gathering. O objetivo é centralizar a gestão de listas, análise de preços no mercado brasileiro e automação de processos (extração de decks e montagem de carrinhos), utilizando uma arquitetura orientada a eventos e armazenamento híbrido (Local + Cloud Backup).

## 2. Pilares Arquiteturais
*   **Interface (Frontend):** React + TypeScript com Shadcn UI e Headless UI.
*   **Processamento (Backend/Sidecar):** Processo Node.js independente comunicado via IPC.
*   **Mensageria e Eventos:** Arquitetura Event-Driven com RabbitMQ para processamento assíncrono e futura integração com IA (Grok).
*   **Persistência:** SQLite local para dados transacionais e Google Drive API como Bucket de baixo custo para backups e imagens.
*   **Metodologia de Desenvolvimento:** **TDI (Test-Driven Implementation)** - Testes unitários e de integração precedem a finalização de cada feature.

## 3. Principais Funcionalidades (Features)

### F01: Core de Gestão de Cartas e Listas
*   Criação e edição de listas de cartas/wishlists.
*   Busca de cartas via API externa com cache local de imagens de alta qualidade.
*   Cálculo automático de valores totais de listas com base em dados de mercado.

### F02: Inteligência de Mercado e Extração
*   Web Scraping (via Puppeteer/Fetch) de sites brasileiros confiáveis para consulta de preços em tempo real.
*   Crawler para extração de listas de decks de sites de referência.
*   Análise técnica de decks baseada em parâmetros de experiência do usuário.

### F03: Automação de Compras (Proof of Concept)
*   Integração com Puppeteer para automação de carrinhos em lojas de MTG (adição automática de listas).

### F04: Infraestrutura e Resiliência
*   Sincronização contínua de backups do SQLite para o Google Drive.
*   Sistema de processamento em segundo plano para download e otimização de imagens (armazenamento no Drive).
*   Pipeline de CI/CD para validação automática de testes e distribuição de updates.

## 4. Requisitos Não Funcionais
*   **Performance:** UI responsiva com feedback imediato; operações pesadas delegadas ao processo de eventos.
*   **Identidade Visual:** Uso obrigatório da paleta em `assets/pallet.json` e integração do `logo.png` em telas de carregamento/splash screens.
*   **Modularidade:** Código separado por responsabilidades (UI, Eventos, Data Access), mesmo sem o uso de monorepo.

## 5. Roadmap de Desenvolvimento (Metodologia TDI)
1.  **Fase 1 (Foundation):** Setup do Electron + React + SQLite + IPC Bridge + Testes de infra.
2.  **Fase 2 (Data & Assets):** Integração Google Drive + Sistema de Cache de Imagens + Event Bus (RabbitMQ).
3.  **Fase 3 (Intelligence):** Scrapers de preços + Analisador de Decks.
4.  **Fase 4 (Automation):** Módulo Puppeteer para carrinhos.
5.  **Fase 5 (AI Integration):** Integração Grok para análise preditiva e recomendações.
