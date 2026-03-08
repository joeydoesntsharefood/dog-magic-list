# Inteligência e Otimização Local (US14 - US17)

Este documento detalha as funcionalidades exclusivas do **Backend Local**, focadas em performance, privacidade e integração com o ecossistema do usuário.

---

## US14 - Processador de Imagens e Cache Inteligente (WebP)

### Descrição:
Como usuário de uma aplicação desktop, quero que o app consuma o mínimo possível de disco e memória RAM, convertendo e otimizando as artes das cartas localmente.

### Critérios de Aceitação:
1. **Conversão WebP:** O backend local deve baixar a imagem do Scryfall e convertê-la para o formato WebP (mais leve).
2. **Redimensionamento:** Imagens de "detalhe" devem ser redimensionadas para o tamanho exato usado na UI para economizar memória na renderização do Electron.
3. **Cache Persistence:** Verificação de existência local antes de realizar qualquer download externo.

### Requisitos Técnicos:
- Uso de biblioteca de processamento de imagem (ex: `sharp` ou `jimp`) no backend local.

---

## US15 - Fila de Sincronização Offline (Sync Queue)

### Descrição:
Como um jogador em trânsito, quero poder editar meus decks e biblioteca mesmo sem conexão com a internet, garantindo que as mudanças sejam sincronizadas com a nuvem assim que eu estiver online.

### Critérios de Aceitação:
1. **Fila de Diffs:** O sistema deve registrar cada alteração (adição, remoção, edição) em uma tabela local de `sync_queue`.
2. **Detecção de Conexão:** O backend local monitora o status da internet.
3. **Sincronia Automática:** Ao detectar conexão, o sistema processa a fila de forma sequencial, resolvendo conflitos básicos de "última alteração vence".

---

## US16 - Integração com Ecossistema (Importador de Logs)

### Descrição:
Como um jogador multi-plataforma, quero importar minha coleção do MTG Arena ou logs de outros apps automaticamente para o Dog Magic List.

### Critérios de Aceitação:
1. **Auto-Discovery:** O backend local deve procurar por caminhos padrão de instalação de jogos como o MTG Arena.
2. **Leitura de Logs:** Parsing de arquivos de log (`OutputLog.txt`) para extrair IDs de cartas e quantidades.
3. **Importação TXT/CSV:** Suporte para arrastar arquivos de exportação de outros sites (Moxfield, LigaMagic) diretamente no app.

---

## US17 - Camada de Anonimização e Privacidade

### Descrição:
Como usuário preocupado com privacidade, quero ter certeza de que dados sensíveis do meu computador (nome de usuário do PC, caminhos de pasta, metadados) não sejam enviados para o Backend Global.

### Critérios de Aceitação:
1. **Metadata Stripping:** Antes de enviar qualquer "Reporte de Preço" ou "Sync de Deck", o backend local deve sanitizar os objetos JSON.
2. **Anonimização de IP:** (Opcional) Uso de identificadores únicos (UUIDs) que não liguem diretamente o hardware do usuário à conta, se configurado pelo usuário.
3. **Log de Transparência:** O usuário pode visualizar localmente quais dados exatamente estão sendo "subidos" para o Global.
