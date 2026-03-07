# F03: Automação de Compras (PoC)

Este módulo foca na automação de processos de compra em sites brasileiros de Magic: The Gathering.

## US03.1: Automação de Carrinho de Compras (Cart Sync)
**Descrição:** Como usuário, desejo que o aplicativo monte automaticamente meu carrinho de compras em uma loja online com as cartas da minha lista para facilitar a compra.

### Critérios de Aceite (AC):
1.  O sistema deve abrir uma instância do Puppeteer (visível ou headless dependendo da configuração) para o site da loja selecionada.
2.  Deve realizar o login (com credenciais salvas de forma segura) ou permitir login manual inicial.
3.  Deve percorrer a lista de cartas selecionadas e adicioná-las ao carrinho na quantidade especificada.
4.  Deve reportar cartas não encontradas ou fora de estoque.

### Estratégia TDI:
*   **Teste Unitário (Bot):** Mockar as chamadas do Puppeteer para validar a lógica de "Add to Cart" com diferentes estados de UI do site.
*   **Teste de Integração:** Realizar um fluxo completo de adição ao carrinho em um ambiente de homologação ou com lista pequena em live.

---

# F04: Infraestrutura e Resiliência

Este módulo garante a persistência, integridade dos dados e a automação do ciclo de vida do software.

## US04.1: Backup Contínuo (SQLite -> Google Drive)
**Descrição:** Como usuário, desejo que meus dados estejam seguros e sincronizados com meu Google Drive para evitar perda de dados local.

### Critérios de Aceite (AC):
1.  Integração com Google Drive API (OAuth 2.0).
2.  Upload automático do arquivo SQLite local para uma pasta específica do Drive sempre que houver alterações críticas.
3.  Processo de backup deve rodar em background para não afetar a performance da UI.

### Estratégia TDI:
*   **Teste Unitário:** Validar o serviço de autenticação e geração de payload do Google Drive API.
*   **Teste de Integração:** Simular uma alteração no banco de dados e verificar se a trigger de upload foi disparada corretamente.

---

## US04.2: Gestão de Imagens e Cache (Drive como Bucket)
**Descrição:** Como usuário, desejo ver as imagens das cartas instantaneamente (mesmo offline) e economizar banda usando meu Drive como storage.

### Critérios de Aceite (AC):
1.  Download de imagens em alta definição na primeira visualização de uma carta.
2.  Otimização de imagem (resize/crop) antes do armazenamento.
3.  Upload da imagem otimizada para o Google Drive e manutenção de um cache local no filesystem.
4.  Uso do `logo.png` como placeholder durante o download.

### Estratégia TDI:
*   **Teste Unitário:** Validar o redimensionamento de imagem e o fluxo de cache local.
*   **Teste de Integração:** Garantir que o link gerado pelo Google Drive é consumível pelo Electron após o upload.

---

## US04.3: Esteira de CI/CD e Auto-Update
**Descrição:** Como desenvolvedor, desejo que o projeto valide automaticamente todos os testes e distribua novas versões para produção.

### Critérios de Aceite (AC):
1.  Configuração de GitHub Actions (ou similar) para rodar testes TDI em cada push para `develop`.
2.  Build automático do Electron para a branch `main`.
3.  Processo de auto-update integrado ao app para notificar e instalar novas versões.

### Estratégia TDI:
*   **Teste de CI:** Verificar se o pipeline falha caso um teste unitário não passe.
*   **Teste de Update:** Simular a existência de uma nova versão e validar o trigger de atualização no app local.
