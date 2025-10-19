## Objetivo rápido
Este repositório é uma SPA multipágina estática (HTML/CSS/JS) que simula uma rede social. Agentes devem focar em: UX estático, manipulação do DOM em `scripts/*.js`, e convenções de persistência local via `localStorage`.

## Visão geral da arquitetura
- Páginas principais: `index.html` (login), `feed.html` (feed), `cadastro.html`, `recuperar-senha.html`, `mensagens.html`.
- Lógica cliente: arquivos em `scripts/` (ex.: `login.js`, `feed.js`) controlam navegação (window.location), eventos DOM e armazenamento local. Não há backend presente — integração com Firebase é considerada futura.
- Estilos: `styles/` contém CSS por página; o projeto usa classes e IDs diretamente referenciadas nos scripts.

## Fluxos comuns e pontos de integração
- Autenticação: `login.js` valida localmente e usa `localStorage` (`ifspace_email`, `ifspace_password`). Exemplos: redirecionamento `window.location.href = 'feed.html'`.
- Feed e posts: `feed.js` injeta posts e contatos no DOM a partir de dados estáticos (`samplePosts`, `contacts`). Novos posts são inseridos com `postsFeed.insertBefore(... )`.
- Uploads/Stories: funcionalidades simuladas — arquivos são lidos via input file; hooks para implementar upload a Firebase/Storage estão nos handlers de `change`.

## Convenções do projeto (úteis para gerar alterações automáticas)
- Prefira manipular elementos por ID (ex.: `document.getElementById('postText')`) — os scripts atuais dependem dessas IDs.
- Atualizações visuais via innerHTML são usadas frequentemente; mantenha sanitização se aceitar conteúdo do usuário.
- Persistência simples: use `localStorage` chaves existentes (`ifspace_email`, `ifspace_password`) para compatibilidade com o comportamento atual.

## Comandos de desenvolvimento / execução
- Projeto é estático. Para servir localmente (Windows PowerShell):
  - python: `python -m http.server 8000`
  - node: `npx http-server`
  Abra `http://localhost:8000` e comece em `index.html`.

## Arquivos relevantes (exemplos rápidos)
- `scripts/login.js`: validação local e lembrar senha (localStorage).
- `scripts/feed.js`: criação de posts dinamicamente, eventos de UI, story modal e handlers de upload.
- `scripts/cadastro.js`, `scripts/recuperar-senha.js`, `scripts/mensagens.js`: siga o mesmo padrão de manipulação DOM e validações.

## O que esperar de PRs/changes gerados por agentes
- Mudanças seguras: correções de UI, melhorias em validação front-end, modularização de funções em `scripts/` (export/ import não aplicável sem bundler — prefira funções IIFE ou anexadas ao objeto global).
- Evite: adicionar dependências de build complexas sem atualizar README e instruções de execução. Não substituir comportamento de `localStorage` sem migrar dados existentes.

## Exemplos rápidos que ajudam a entender padrões
- Redirecionamento após login: `window.location.href = 'feed.html';` (`scripts/login.js`).
- Inserir post novo: `postsFeed.insertBefore(postElement, postsFeed.firstChild);` (`scripts/feed.js`).

## Perguntas para o mantenedor (quando necessário)
- Deseja integração imediata com Firebase (Auth/Firestore/Storage)? Se sim, prefira adicionar um arquivo `scripts/firebase-config.example.js` e instruções no README.

Se algo aqui estiver incompleto ou você quer que eu detalhe padrões adicionais (ex.: testes, lint), diga o que devo expandir.
