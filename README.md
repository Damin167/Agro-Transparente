# Agricultura Familiar Transparente

Sistema web que visa promover a transparência e a gestão da produção agrícola familiar. Com ele, agricultores e sindicatos podem acompanhar, registrar e visualizar dados de produção de forma clara, moderna e intuitiva.

## Funcionalidades

- **Autenticação de Usuário**: Cadastro e login para produtores e sindicatos.
- **Dashboard Personalizado**: Visualização de produções cadastradas com filtros e gráficos interativos.
- **Cadastro de Produção**: Formulário completo com tipo, volume, localidade e sazonalidade.
- **Geolocalização**: Exibição dos locais de produção em mapa interativo.
- **Relatórios e Exportações**: Geração de gráficos, exportação de dados em CSV e PDF.
- **Cadastro de Dados Pessoais**: Informações complementares de produtores e sindicatos.

## Tecnologias Utilizadas

- **Frontend**: [React] + [Vite]
- **Backend as a Service (BaaS)**: [Supabase] (Autenticação, Banco de Dados PostgreSQL, API)
- **Estilização**: CSS Modules + Variáveis CSS
- **Mapas**: Leaflet.js 
- **Gráficos**: Recharts
- **Outros**: jsPDF, html2canvas, papaparse

## Como Rodar o Projeto

### 1. Clone o repositório

```sh
git clone https://github.com/seu-usuario/agricultura-familiar-transparente.git
cd agricultura-familiar-transparente
```

### 2. Instale as dependências

```sh
npm install
```

### 2. Rode o projeto localmente

```sh
npn run dev
Acesse http://localhost:5173 no navegador.
```

## Como contribuir

1. Faça um fork do projeto.
2. Crie uma branch nova: `git checkout -b minha-feature`
3. Faça o commit das suas alterações: `git commit -m 'Minha contribuição'`
4. Envie para o GitHub: `git push origin minha-feature`
5. Abra um Pull Request.


---
