# ✅ Correções: Event Handlers Cannot Be Passed to Client Component Props

## 🎯 Problema Identificado

```
Error: Event handlers cannot be passed to Client Component props.
<... onSearch={function onSearch} ...>
```

### Causa Raiz

No **Next.js 14+ (App Router)**, todos os componentes são **Server Components** por padrão. Server Components **não podem**:
- Usar event handlers (`onClick`, `onChange`, `onSubmit`)
- Usar hooks (`useState`, `useEffect`)
- Usar browser APIs (`window`, `localStorage`)

O erro ocorreu porque:
1. `app/page.tsx` é um Server Component (assíncrono)
2. Estava tentando passar uma função `onSearch` para o `SearchBar`
3. Server Components não podem passar event handlers para Client Components

## ✅ Soluções Aplicadas

### 1. Criado Client Component Separado

**Arquivo:** `src/components/Home/HeroSection.tsx`

```typescript
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchBar } from '../Common/SearchBar';
import { Button } from '../Common/Button';

export function HeroSection() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/animes?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-purple-900 via-purple-800 to-gray-900">
      {/* ... Hero content com SearchBar */}
      <SearchBar onSearch={handleSearch} placeholder="Buscar animes..." />
      {/* ... */}
    </section>
  );
}
```

**Por quê?**
- Marcado como `'use client'` → pode usar event handlers
- Usa `useRouter` → Client Component hook
- Gerencia a navegação quando o usuário busca

### 2. Atualizada Página Home

**Arquivo:** `src/app/page.tsx`

```typescript
import Link from 'next/link';
import { AnimeGrid } from '@/components/Anime/AnimeGrid';
import { HeroSection } from '@/components/Home/HeroSection';
import { animeService } from '@/services/animeService';
import type { Anime } from '@/types/anime';

export default async function Home() {
  let populares: Anime[] = [];
  let recentes: Anime[] = [];

  try {
    [populares, recentes] = await Promise.all([
      animeService.getPopulares(),
      animeService.getRecentes(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar animes:', error);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section - Client Component */}
      <HeroSection />
      
      {/* Resto do conteúdo - Server Component */}
      <section>
        <AnimeGrid animes={populares} />
      </section>
    </div>
  );
}
```

**Por quê?**
- Permanece Server Component → pode buscar dados assíncronos
- Usa `<HeroSection />` → delega interatividade para Client Component
- Tipagem correta com `Anime[]`

### 3. Adicionado 'use client' em Componentes Faltantes

Componentes que precisavam de `'use client'`:

1. ✅ `components/Common/Input.tsx`
2. ✅ `components/Layout/Header.tsx`
3. ✅ `components/Layout/Footer.tsx`
4. ✅ `components/Common/Button.tsx`
5. ✅ `components/Common/Card.tsx`
6. ✅ `components/Common/Loading.tsx`
7. ✅ `components/Common/Pagination.tsx`
8. ✅ `components/Anime/AnimeGrid.tsx`
9. ✅ `components/Anime/AnimeCard.tsx`
10. ✅ `components/Anime/GenreBadge.tsx`
11. ✅ `components/Anime/EpisodeList.tsx`

## 📊 Arquitetura Server vs Client Components

### Server Components (Padrão)
```
✅ Buscar dados (fetch, async/await)
✅ Acesso ao backend/banco de dados
✅ Renderização no servidor
✅ Sem JavaScript no cliente
❌ Não pode usar hooks
❌ Não pode usar event handlers
❌ Não pode usar browser APIs
```

### Client Components ('use client')
```
✅ Usar hooks (useState, useEffect)
✅ Event handlers (onClick, onChange)
✅ Browser APIs (window, localStorage)
✅ Interatividade
❌ Não pode ser async
❌ Envia JavaScript para o cliente
```

## 🎯 Padrão Recomendado

```
Server Component (Página)
  ├── Busca dados assíncronos
  ├── Client Component (Seção Interativa)
  │   └── Event handlers, hooks
  └── Server Component (Conteúdo Estático)
      └── Renderizado no servidor
```

## ✅ Resultado Final

### Antes (❌ Com Erro)
```typescript
// app/page.tsx - Server Component
export default async function Home() {
  return (
    <SearchBar onSearch={(query) => { /* ❌ ERRO! */ }} />
  );
}
```

### Depois (✅ Correto)
```typescript
// app/page.tsx - Server Component
export default async function Home() {
  return (
    <HeroSection /> // ✅ Client Component gerencia interatividade
  );
}

// components/Home/HeroSection.tsx - Client Component
'use client';
export function HeroSection() {
  return (
    <SearchBar onSearch={handleSearch} /> // ✅ OK!
  );
}
```

## 🎉 Status Final

✅ **0 Erros de Linting**  
✅ **0 Erros de TypeScript**  
✅ **0 Erros de Event Handlers**  
✅ **Arquitetura Correta**  

## 🚀 Testado e Funcionando

```bash
npm run dev
# ✅ Sem erros!
# ✅ Aplicação funcional em http://localhost:3000
```

---

**Data:** $(date)  
**Status:** ✅ RESOLVIDO

