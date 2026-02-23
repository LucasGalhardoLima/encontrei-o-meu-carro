# Encontre o Meu Carro

Aplicação full-stack para descoberta e comparação de carros com base em dados técnicos e preferências do usuário.

## O que a aplicação faz

- Busca e filtros por carros.
- Quiz de prioridades (conforto, economia, performance e espaço).
- Ranking por match.
- Comparação lado a lado.
- Página de detalhe com metadados dinâmicos e imagem OG.
- Favoritos locais ("Minha Garagem").
- Backoffice admin para gestão de carros.

## Stack

- React Router 7 (SSR)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (Neon)
- Zustand (estado client-side)
- Vitest + Playwright (testes)

## Requisitos

- Node 20+
- PostgreSQL (ou Neon)

## Configuração local

1. Instale dependências:

```bash
npm install
```

2. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Configure variáveis no `.env`:

- `DATABASE_URL` (obrigatória)
- `ADMIN_USER` (padrão: `admin`)
- `ADMIN_PASSWORD` (obrigatória para rotas `/admin`)
- `VITE_SITE_URL` (opcional, usada para URLs absolutas de SEO/OG)

4. Rode migrações e seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Inicie em desenvolvimento:

```bash
npm run dev
```

App disponível em `http://localhost:5173`.

## Scripts úteis

- `npm run dev`: ambiente local
- `npm run build`: build de produção
- `npm run start`: sobe build de produção
- `npm run typecheck`: gera tipos de rota + TypeScript
- `npm run test:unit`: testes unitários (Vitest)
- `npm run test:e2e`: testes E2E (Playwright)
- `npm run test:e2e:external`: testes E2E usando servidor já iniciado externamente

Para rodar testes E2E que validam persistência em banco, use `RUN_DB_TESTS=1`.

## Rotas principais

- `/`: home/busca
- `/results`: listagem e ranking
- `/quiz`: quiz de prioridades
- `/compare`: comparação
- `/carros/:id`: detalhe do carro
- `/garagem`: favoritos
- `/admin`: listagem admin
- `/admin/new`: criação admin
- `/admin/:id`: edição admin
- `/api/cars`: API de carros por ids
- `/api/feedback`: API de feedback do ranking

## Deploy

### Docker

```bash
docker build -t encontre-o-meu-carro .
docker run -p 3000:3000 encontre-o-meu-carro
```

### Node

```bash
npm run build
npm run start
```
