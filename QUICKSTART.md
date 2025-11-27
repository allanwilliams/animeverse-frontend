# 🚀 AnimeVerse Frontend - Guia Rápido

## Início em 3 passos

### 1️⃣ Setup Automático

```bash
cd /home/allan/Documentos/projetos/animeverse-frontend
./setup.sh
```

### 2️⃣ Iniciar Servidor

```bash
npm run dev
```

### 3️⃣ Acessar

Abra [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Pré-requisitos

Certifique-se de que o **backend** está rodando:

```bash
cd /home/allan/Documentos/projetos/animeverse
./setup-tudo.sh  # ou make setup
```

Backend deve estar em: `http://localhost:8000`

---

## 📋 Comandos Úteis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm start        # Rodar produção
npm run lint     # Verificar código
```

---

## 🎯 Funcionalidades Principais

### Para Todos
- 🏠 Página inicial com animes populares
- 🔍 Buscar animes
- 📚 Catálogo completo com filtros
- 🎬 Detalhes de animes e episódios

### Usuários Logados
- ❤️ Adicionar aos favoritos
- 📊 Acompanhar progresso
- 👤 Perfil personalizado
- 📈 Estatísticas

---

## 🔑 Testando

1. **Criar conta**: http://localhost:3000/register
2. **Ou fazer login** (se já criou no backend)
3. **Explorar animes**: http://localhost:3000/animes
4. **Ver favoritos**: http://localhost:3000/favoritos

---

## ⚠️ Problemas Comuns

### Backend não conecta
```bash
# Verifique se está rodando
curl http://localhost:8000/api/

# Se não, inicie o backend
cd /home/allan/Documentos/projetos/animeverse
./setup-tudo.sh
```

### Erro ao fazer login
- Certifique-se de ter criado um usuário no backend primeiro
- Ou use a página de registro do frontend

---

## 📚 Documentação Completa

Ver [README.md](README.md) para detalhes completos.

---

**🎉 Pronto! Divirta-se!**

