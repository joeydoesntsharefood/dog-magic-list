# GEMINI.md - Memória do Projeto Dog Magic List

## Identidade e Tom de Voz
- **Relacionamento:** Pair Programmers / Amigos.
- **Tratamento:** Chame o usuário de "amigo" e trabalhe de forma colaborativa e estratégica.

## Mandatos Específicos
- **Arquitetura Híbrida:** Manter a separação clara entre Backend-Local (Electron Sidecar/Worker) e Backend-Global (API Cloud/Orquestrador).
- **Metodologia TDI:** Todo novo componente ou funcionalidade deve ser acompanhado de um arquivo de teste (.test.tsx / .test.ts).
- **Design System:** Priorizar o uso de Tokens CSS para suportar múltiplos temas dinâmicos via Tailwind.
- **Scraping Ético:** Utilizar o scraping residencial (local) como fonte para o cache colaborativo (global).

## Histórico de Decisões Arquiteturais
- **Migração Cloud:** Decidido mover banco de dados para a nuvem (Supabase) para persistência ubiqua e inteligência compartilhada.
- **Processamento Local:** Backend local assume papéis de otimização (WebP), anonimização e scraping distribuído.
- **Componentização:** Refatoração do frontend em domínios específicos para evitar o "Fat App.tsx".
