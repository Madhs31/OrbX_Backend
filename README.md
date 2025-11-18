# OrbX Backend

Backend do projeto **OrbX**: uma API construída em TypeScript com foco
em escalabilidade, organização e boas práticas.\
Este repositório contém a lógica do servidor, configuração de banco de
dados e endpoints REST utilizados pelo OrbX Frontend.

## 📁 Estrutura do Projeto

    ├── prisma
    │   └── schema.prisma
    ├── src
    │   ├── controllers
    │   ├── services
    │   ├── models
    │   ├── routes
    │   ├── index.ts
    │   └── utils
    ├── tsconfig.json
    ├── package.json
    └── .gitignore

## ✨ Funcionalidades principais

-   API escrita em **TypeScript**
-   Uso de **Prisma ORM**
-   Estrutura modular baseada em controllers, services e rotas
-   Variáveis de ambiente via `.env`
-   Scripts de inicialização e migração
-   Suporte para bancos relacionais (PostgreSQL, MySQL, etc.)

## 📦 Tecnologias utilizadas

-   **Node.js**
-   **Express**
-   **TypeScript**
-   **Prisma ORM**
-   **dotenv**
-   **cors**

## 🚀 Como iniciar o projeto

### 1. Clone o repositório

``` bash
git clone https://github.com/Madhs31/OrbX-Backend.git
cd OrbX-Backend
```

### 2. Instale as dependências

``` bash
npm install
```

### 3. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz com os valores necessários:

    DATABASE_URL="postgresql://user:password@localhost:5432/orbx?schema=public"
    # Chave secreta para JWT (Autenticação)
    JWT_SECRET="sua_chave_secreta_aqui_escolha_uma_forte"
    # Chave da OpenWeatherMap API 
    OPENWEATHERMAP_API_KEY=""
    # Chave da PEXELS API 
    PEXELS_API_KEY=""

### 4. Gere o cliente Prisma

``` bash
npx prisma generate
```

### 5. Execute as migrações do Prisma

``` bash
npx prisma migrate dev
```

### 6. Inicie o servidor em modo de desenvolvimento

``` bash
npm run dev
```


Servidor disponível em:

    http://localhost:3001

