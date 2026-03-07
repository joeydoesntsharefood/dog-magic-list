# Fundação (Atualizado)

A aplicação dog magic list serve para gerenciar cards de Magic: The Gathering. Diferente do plano inicial de cache local de imagens, optamos por **consumo direto via API** (Scryfall) para garantir que as imagens e versões estejam sempre atualizadas.

Devemos ser capazes de listar **todas as versões disponíveis** de uma carta pesquisada. Isso é fundamental pois uma mesma carta pode ter artes diferentes, ser de coleções (sets) diferentes e possuir variações de acabamento (Foil/Etched) que impactam diretamente no valor.

A aplicação deve apresentar uma **tabela de preços comparativa** para cada versão, convertendo os valores de USD para BRL em tempo real. A estrutura continua sendo Electron + React + Fastify (Backend independente), com persistência em SQLite para as listas criadas pelo usuário. O foco agora é a inteligência de mercado e a facilidade de visualização de variações de preços.
