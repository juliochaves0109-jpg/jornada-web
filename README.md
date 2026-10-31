# Jornada.Web — Por trás de cada clique

Experiência educacional interativa para explicar a jornada de uma requisição em uma aplicação web.

## Requisitos
- Node.js 18+ (recomendado)
- npm

## Executar localmente
1. Extraia o ZIP.
2. Abra a pasta `jornada-web` no VS Code ou terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o endereço local exibido pelo Vite no navegador.

## Gerar versão de produção
```bash
npm run build
npm run preview
```

## O que está implementado
- Interface responsiva com ilustração CSS original de ambiente de trabalho e loja virtual.
- Simulação didática controlada por etapas: front-end, requisição HTTP, back-end, API, banco de dados e resposta.
- Controles de reproduzir/pausar, reiniciar, avançar, voltar e selecionar etapas diretamente.
- Visualização geral interativa da arquitetura.
- Explorador de tecnologias com classificações e descrições.
- Laboratório interativo de falhas HTTP e de conectividade.
- Glossário contextual, animações coordenadas e suporte a `prefers-reduced-motion`.

## Importante
O fluxo de compra é uma **simulação visual no navegador**. Não há compra real, API de back-end ou banco de dados conectado. As respostas e os dados exibidos são demonstrativos.
