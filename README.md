# SaveToken frontend

Interface do SaveToken para converter PDFs em Markdown, com os modos de conversão fiel e otimizado para IA. O modo fiel é o padrão.

## Executar

```bash
npm install
npm run dev
```

Por padrão, o frontend usa `http://localhost:8000` como API. Para alterar:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000
```

O formulário envia `multipart/form-data` para `POST /api/v1/conversions`, baixa o Markdown retornado e exibe a comparação de tokens disponível nos cabeçalhos da API.

## Experiência

- **Conversão fiel** retorna o Markdown exportado pelo backend sem otimização adicional.
- **Otimizado para IA** explica a economia antes do envio. O backend compara candidatos seguros, preserva o conteúdo e seleciona a versão com menor custo de tokens.
- O botão de tema alterna entre o modo escuro e claro sem alterar a conversão.
- A seção de perguntas frequentes explica Markdown, limites, modos, tokens e tratamento dos arquivos.

## Verificação

```bash
npm run typecheck
npm run build
```

## Docker

A partir da pasta `SaveToken`:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API e Swagger: `http://localhost:8000/docs`
