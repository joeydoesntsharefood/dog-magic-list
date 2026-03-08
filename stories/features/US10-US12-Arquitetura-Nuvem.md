# Arquitetura Híbrida: Backend Local vs. Global (US10 - US12)

Esta fase define a separação entre o processamento do cliente (Edge/Local) e a inteligência centralizada (Cloud).

---

## Estrutura de Backend

### 1. Backend Local (Electron Sidecar)
**Responsabilidades:**
- **Scraping (Puppeteer):** Execução de buscas na LigaMagic usando o IP residencial do usuário.
- **Gestão de Ativos Físicos:** Cache local de imagens e leitura de arquivos do sistema (TXT, CSV, Arena Logs).
- **Trabalhador de Background:** Reporte de preços encontrados para o Backend Global.
- **Sync Queue:** Gerenciamento de alterações offline antes da sincronização com a nuvem.

### 2. Backend Global (Cloud API + Supabase)
**Responsabilidades:**
- **Autenticação Proprietária:** Gestão de usuários, senhas (hash) e tokens de sessão (JWT).
- **Cache Colaborativo:** Banco de dados central de preços reportados pela comunidade.
- **Storage de Usuário:** Biblioteca (Library), Decks e Wishlists salvos de forma persistente.
- **Analytics & Dashboards:** Processamento de estatísticas globais e histórico de preços por usuário.

---

## US10 - Autenticação e Gestão de Sessão Proprietária

### Descrição:
Como desenvolvedor, quero que o sistema gerencie o acesso via nossa própria API, garantindo segurança e controle total sobre os dados de usuário no Supabase.

### Critérios de Aceitação:
1. **API de Auth:** Endpoints `/auth/register` e `/auth/login` em nossa API Global.
2. **Tokens JWT:** Emissão de tokens de sessão para autenticar requisições entre o Client-Desktop e a Nuvem.
3. **Segurança:** Implementação de Hashing (BCrypt) e validação de tokens no lado do servidor.

---

## US11 - Cache Colaborativo e Dashboards

### Descrição:
Como sistema, quero centralizar os preços coletados e as listas dos usuários para fornecer dashboards analíticos e reduzir a carga de scraping.

### Critérios de Aceitação:
1. **Central Price DB:** Tabela `global_prices` que armazena a última cotação de cada carta por loja.
2. **User Dashboards:** Visualização na nuvem da valorização da coleção do usuário (Wishlist/Library) com base no histórico.
3. **API de Sincronia:** Endpoints para o backend local baixar as listas atualizadas do usuário ao iniciar o app.

---

## US12 - Orquestração de Scraping Distribuído

### Descrição:
Como plataforma, quero coordenar as tarefas de scraping entre os diversos clientes locais para manter o banco global sempre fresco.

### Critérios de Aceitação:
1. **Reporting API:** Endpoint para o backend local enviar (POST) os dados coletados de uma carta.
2. **Task Assignment:** O Backend Global pode sinalizar ao local que uma determinada carta precisa de uma nova cotação (cache vencido).
3. **Validação:** Lógica para ignorar reportes de preços que divirjam drasticamente da média (proteção contra bots ou erros).
