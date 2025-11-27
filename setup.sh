#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║        🚀 AnimeVerse Frontend - Setup Automático                  ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale Node.js e npm primeiro."
    exit 1
fi

echo "✅ npm encontrado"
echo ""

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
else
    echo "ℹ️  Arquivo .env.local já existe"
fi

echo ""
echo "📦 Instalando dependências..."
npm install

echo ""
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║                 ✅  SETUP CONCLUÍDO!                               ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Próximos passos:"
echo ""
echo "1. Certifique-se de que o backend está rodando em http://localhost:8000"
echo ""
echo "2. Inicie o servidor de desenvolvimento:"
echo "   npm run dev"
echo ""
echo "3. Acesse a aplicação:"
echo "   http://localhost:3000"
echo ""
echo "📚 Comandos disponíveis:"
echo "   npm run dev      - Iniciar servidor de desenvolvimento"
echo "   npm run build    - Build de produção"
echo "   npm start        - Iniciar servidor de produção"
echo "   npm run lint     - Executar linter"
echo ""
echo "🎉 Tudo pronto! Bom desenvolvimento!"
echo ""

