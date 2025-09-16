# Projeto Jaiminho - Auto Preenchimento de Formulários por CNPJ e CEP

## Descrição do Projeto

Este projeto é uma implementação de auto-preenchimento de formulários HTML utilizando a Fetch API do JavaScript, sem bibliotecas externas. Ele foi desenvolvido para preencher automaticamente dados de empresas e endereços a partir do CNPJ e CEP informados pelo usuário, consultando a API pública BrasilAPI.

A ideia é melhorar a experiência do usuário, reduzindo o tempo e erros no preenchimento dos formulários de fornecedor, cliente e empresa, nos arquivos `fornecedor.html`, `cliente.html` e `empresa.html`.

---

## Como funciona

1. **Consulta por CNPJ:**

   - Quando o usuário digita um CNPJ e sai do campo (evento `blur`), o sistema sanitiza o valor (remove todos os caracteres que não são dígitos).
   - É feita uma requisição à API da BrasilAPI para consultar os dados do CNPJ:  
     `https://brasilapi.com.br/api/cnpj/v1/{CNPJ_SOMENTE_DIGITOS}`.
   - Caso o CNPJ seja válido e a API retorne dados, os campos do formulário relacionados à empresa são preenchidos automaticamente, incluindo:
     - Razão Social
     - Nome Fantasia
     - CNPJ (formatado)
     - CEP
     - Logradouro
     - Bairro
     - Município
     - UF
   - Se o CNPJ for inválido ou a API não encontrar o registro, uma mensagem de erro clara é exibida.

2. **Consulta por CEP:**

   - Quando o usuário digita um CEP e sai do campo, o sistema sanitiza o CEP (apenas números).
   - É feita uma requisição à API da BrasilAPI para consultar dados do CEP:  
     `https://brasilapi.com.br/api/cep/v1/{CEP_SOMENTE_DIGITOS}`.
   - Se válido, os campos relacionados ao endereço são preenchidos automaticamente:
     - Logradouro
     - Bairro
     - Cidade (Município)
     - UF
   - Em caso de erro, uma mensagem clara é exibida.

---

## Boas práticas e acessibilidade implementadas

- **Sanitização dos dados:** Antes de enviar a requisição, o CNPJ e o CEP são limpos para conter apenas dígitos, garantindo que a API receba o formato esperado.
- **Feedback ao usuário:**
  - Exibição de mensagens de carregamento durante as requisições para informar que o sistema está buscando os dados.
  - Mensagens de erro claras para valores inválidos, registros não encontrados (404) e falhas de rede.
- **Acessibilidade:**
  - Utilização de `<label for="id_do_campo">` para garantir que os campos estejam corretamente associados a seus rótulos.
  - Área de feedback com `aria-live="polite"` para que leitores de tela anunciem as mensagens automaticamente.
  - Após erro, o foco retorna ao campo que precisa ser corrigido para facilitar a navegação e correção.
- **UX:**
  - Durante a consulta, os botões e campos relevantes são desabilitados para evitar ações enquanto os dados estão sendo carregados.
  - Mensagens visuais claras e diretas para informar o usuário sobre o status das operações.

---

## Como testar

1. Abra no navegador qualquer um dos arquivos HTML:
   - `fornecedor.html`
   - `cliente.html`
   - `empresa.html`
2. No campo CNPJ, digite um CNPJ válido (somente números ou com máscara) e saia do campo para disparar o evento `blur`.
3. Observe o preenchimento automático dos campos relacionados à empresa.
4. No campo CEP, digite um CEP válido e saia do campo.
5. Observe o preenchimento dos campos de endereço.
6. Teste também com CNPJs e CEPs inválidos para conferir as mensagens de erro.
7. Simule falhas de rede (por exemplo, desconectando da internet) para testar o tratamento de erros.
8. As mensagens de feedback aparecerão na área designada, com suporte para leitores de tela.

---

## Exemplos para teste

- CNPJs válidos:  
  - 00000000000191  
  - 12345678000195 (exemplo fictício, verifique na API)
- CEPs válidos:  
  - 01001000  
  - 30140071

---

## Organização do código

- O código JavaScript está estruturado em funções reutilizáveis:
  - `onlyDigits`: sanitiza entradas, removendo caracteres não numéricos.
  - `fetchJSON`: realiza requisições `fetch` com tratamento de erros.
  - `preencherPorCNPJ`: executa a consulta e preenchimento a partir do CNPJ.
  - `preencherPorCEP`: executa a consulta e preenchimento a partir do CEP.
- O JavaScript é incluído nos três arquivos HTML para garantir o mesmo comportamento consistente.
- A interface mantém a associação correta entre `<label>` e `<input>`, garantindo acessibilidade.

---

## Considerações finais

Este projeto atende os requisitos solicitados, oferecendo:

- Auto-preenchimento automático de formulários por CNPJ e CEP.
- Tratamento completo de erros, com mensagens claras.
- Boas práticas de UX e acessibilidade.
- Código limpo, organizado e reutilizável.
- Documentação sucinta e clara para facilitar o uso e entendimento.

---

## Como publicar

- O projeto está disponível neste repositório público no GitHub.
- Para visualizar os formulários online, utilize o GitHub Pages configurado na sua conta.

---

├── index.html           # Página inicial (menu de navegação)
├── cliente.html         # Cadastro de clientes
├── empresa.html         # Cadastro de empresas
├── fornecedor.html      # Cadastro de fornecedores
├── css/
│   └── style.css        # Estilos globais
├── js/
│   └── form.js          # Lógica de validação e integração com APIs
└── README.md            # Documentação do projeto

