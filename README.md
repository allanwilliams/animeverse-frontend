# 🎬 AnimeVerse Frontend

Frontend moderno para o AnimeVerse, construído com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** para requisições HTTP
- **Context API** para gerenciamento de estado
- **JWT** para autenticação

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend AnimeVerse rodando em `http://localhost:8000`

## ⚡ Início Rápido

### Opção 1: Setup Automático (Recomendado)

```bash
./setup.sh
npm run dev
```

### Opção 2: Setup Manual

```bash
# Instalar dependências
npm install

# Criar arquivo de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📁 Estrutura do Projeto

```
animeverse-frontend/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Home page
│   │   ├── animes/            # Páginas de animes
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   ├── favoritos/         # Favoritos (protegida)
│   │   └── perfil/            # Perfil (protegida)
│   ├── components/
│   │   ├── Layout/            # Navbar, Header, Footer
│   │   ├── Anime/             # Componentes de anime
│   │   ├── Auth/              # Componentes de autenticação
│   │   ├── Common/            # Componentes reutilizáveis
│   │   └── Filters/           # Filtros de busca
│   ├── contexts/
│   │   └── AuthContext.tsx    # Context de autenticação
│   ├── services/              # Serviços da API
│   │   ├── api.ts
│   │   ├── animeService.ts
│   │   ├── authService.ts
│   │   └── generoService.ts
│   ├── types/                 # Tipos TypeScript
│   ├── hooks/                 # Hooks customizados
│   └── utils/                 # Utilitários
├── public/                    # Arquivos públicos
├── .env.local                 # Variáveis de ambiente
└── tailwind.config.ts         # Configuração do Tailwind
```

## 🎨 Funcionalidades

### Públicas
- ✅ Listagem de animes com filtros
- ✅ Busca por título
- ✅ Detalhes do anime com episódios
- ✅ Filtros por gênero, status e rating
- ✅ Paginação

### Autenticadas
- ✅ Login e Registro
- ✅ Sistema de favoritos
- ✅ Marcar animes como assistindo/completo/planejado
- ✅ Perfil de usuário
- ✅ Estatísticas pessoais

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento

# Produção
npm run build        # Build de produção
npm start            # Iniciar servidor de produção

# Qualidade de código
npm run lint         # Executar ESLint
```

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. Login/Registro retorna `access_token` e `refresh_token`
2. `access_token` é enviado em todas as requisições autenticadas
3. Refresh automático quando o token expira
4. Proteção de rotas com `ProtectedRoute` component

## 📡 Integração com API

### Endpoints Utilizados

- `GET /animes/` - Listar animes
- `GET /animes/{id}/` - Detalhes do anime
- `GET /animes/populares/` - Animes populares
- `GET /animes/recentes/` - Animes recentes
- `POST /auth/login/` - Login
- `POST /auth/register/` - Registro
- `POST /animes/{id}/favoritar/` - Favoritar anime
- `GET /favoritos/` - Listar favoritos
- `GET /generos/` - Listar gêneros

## 🎨 Personalização

### Cores do Tema

Edite `tailwind.config.ts` para personalizar as cores:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#8B5CF6',    // Roxo
      secondary: '#EC4899',  // Rosa
    },
  },
}
```

## 📱 Responsividade

O layout é totalmente responsivo:
- Mobile: 2 colunas de animes
- Tablet: 3-4 colunas
- Desktop: 5-6 colunas

## 🐛 Troubleshooting

### Erro de conexão com API

Verifique se:
1. O backend está rodando em `http://localhost:8000`
2. A variável `NEXT_PUBLIC_API_URL` está configurada corretamente
3. Não há problemas de CORS no backend

### Erro de autenticação

1. Limpe o localStorage: `localStorage.clear()`
2. Faça login novamente
3. Verifique se o backend está retornando tokens válidos

### Imagens não aparecem

1. As URLs das imagens devem ser absolutas ou relativas ao backend
2. Configure o Next.js `next.config.ts` para permitir domínios externos se necessário

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build Manual

```bash
npm run build
npm start
```

## 📝 Próximas Funcionalidades

- [ ] Sistema de reviews
- [ ] Upload de avatar
- [ ] Notificações
- [ ] Dark/Light mode toggle
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autor

Desenvolvido com ❤️ para a comunidade de anime

---

**🎉 Divirta-se explorando o mundo dos animes!**
