# Controle de Chamados Internos

Projeto para cadastro, acompanhamento e distribuição de chamados internos.

## Estrutura

- `backend/ControleChamadosInternos`: API .NET com Entity Framework e SQLite.
- `frontend/sistema-chamados`: aplicação React + TypeScript com Vite.

## Requisitos

- .NET SDK compatível com o projeto
- Node.js
- npm

## Hospedagem
Publiquei uma hospedagem no plano gratuido do Render nesta [URL](https://codificar-controlechamadosinternos-1.onrender.com/), caso queira checar por aqui!

## Como executar

Em um terminal, suba o backend:

```bash
cd backend/ControleChamadosInternos
dotnet run --launch-profile http
```

A API ficará em `http://localhost:5077`.

Em outro terminal, suba o frontend:

```bash
cd frontend/sistema-chamados
npm install
npm run dev
```

A interface ficará em `http://localhost:5173`.

## Configuração opcional

Se a API estiver em outro endereço, crie `frontend/sistema-chamados/.env`:

```env
VITE_API_URL=http://localhost:5077/api
```

## Funcionalidades

- Cadastro, edição, listagem e visualização de chamados.
- Campos principais: título, descrição, solicitante, prioridade, status, responsável, data de abertura e data de fechamento.
- Responsáveis pré-cadastrados por seed do backend.
- Atribuição manual ou automática ao responsável com menos chamados em aberto.
- Busca e filtros por texto, status, prioridade e responsável.
- Indicadores para acompanhamento da fila.

## Decisões

- React + TypeScript no frontend para reduzir erros de contrato com a API e manter uma interface organizada.
- Vite para execução local simples e rápida.
- .NET + Entity Framework + SQLite no backend para persistência local sem depender de serviços externos.
- A regra de "em aberto" considera `Aberto` e `EmAndamento`; `Resolvido` e `Fechado` são concluídos e não entram na carga de distribuição.
- A distribuição automática fica no backend, garantindo que a regra seja única mesmo que outro cliente consuma a API.

## Nota final
- Apesar de ter usado SQLite como banco de dados, foi apenas para fins técnicos, em um ambiente de produção real você pode e deve utilizar um banco de dados em nuvem
