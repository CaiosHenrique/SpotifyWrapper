# SpotifyWrapper - Guia de Instalação

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (local ou remoto)
- Uma conta no [Spotify](https://spotify.com)

## Passo 1: Configuração do Spotify Developer

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Faça login com sua conta Spotify
3. Clique em "Create App"
4. Preencha os dados:
   - **App Name**: SpotifyWrapper
   - **App Description**: Aplicação para organizar músicas por gênero
   - **Redirect URI**: `http://localhost:3000/callback`
   - **API/SDKs**: Web API
5. Aceite os termos e clique em "Create"
6. Anote o **Client ID** e **Client Secret** (clique em "Show Client Secret")

## Passo 2: Clone e Configuração

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd SpotifyWrapper

# Instale as dependências
npm install

# Copie o arquivo de exemplo de configuração
cp .env.example .env
```

## Passo 3: Configuração do Ambiente

Edite o arquivo `.env` com seus dados:

```env
# Dados do Spotify (obrigatório)
SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Chave de sessão (obrigatório)
SESSION_SECRET=uma_chave_secreta_forte_aqui

# Configurações opcionais
MONGODB_URI=mongodb://localhost:27017/spotify_wrapper
PORT=3000
NODE_ENV=development
```

### Gerando uma SESSION_SECRET

Você pode gerar uma chave secreta forte usando:

```bash
# No Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou online
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

## Passo 4: Configuração do MongoDB

### Opção A: MongoDB Local
```bash
# Instale MongoDB Community Edition
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# macOS: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
# Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

# Inicie o MongoDB
mongod
```

### Opção B: MongoDB Cloud (Atlas)
1. Crie uma conta no [MongoDB Atlas](https://cloud.mongodb.com)
2. Crie um cluster gratuito
3. Configure o acesso (IP e usuário)
4. Obtenha a connection string
5. Atualize `MONGODB_URI` no arquivo `.env`

## Passo 5: Execução

```bash
# Inicie a aplicação
npm start

# Ou para desenvolvimento com auto-restart
npm run dev
```

A aplicação estará disponível em: `http://localhost:3000`

## Passo 6: Teste

1. Acesse `http://localhost:3000`
2. Clique em "Login with Spotify"
3. Autorize a aplicação
4. Toque uma música no Spotify
5. Veja a música aparecer no dashboard

## Possíveis Problemas

### Erro: "Invalid client"
- Verifique se `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET` estão corretos
- Confirme se a Redirect URI está configurada corretamente no Spotify Dashboard

### Erro: "Cannot connect to MongoDB"
- Verifique se o MongoDB está rodando
- Confirme a connection string em `MONGODB_URI`

### Erro: "Session secret required"
- Certifique-se de que `SESSION_SECRET` está definido no `.env`

### Erro: "Nothing is currently playing"
- Verifique se uma música está tocando no Spotify
- Confirme se o usuário tem uma conta Spotify Premium (necessário para algumas funcionalidades)

## Scripts Disponíveis

```bash
# Iniciar aplicação
npm start

# Desenvolvimento com auto-restart
npm run dev

# Executar testes (quando implementados)
npm test
```

## Estrutura de Diretórios

```
SpotifyWrapper/
├── .env                    # Configurações de ambiente
├── .env.example           # Exemplo de configuração
├── package.json           # Dependências
├── app.js                 # Ponto de entrada
├── config/
│   ├── server.js          # Configuração do Express
│   └── dbConnection.js    # Conexão MongoDB
├── routes/                # Rotas da aplicação
├── views/                 # Templates
├── styles/                # Arquivos CSS
└── images/                # Imagens estáticas
```

## Próximos Passos

Após a instalação bem-sucedida:

1. **Explore a aplicação**: Toque diferentes músicas e veja as coleções sendo criadas
2. **Crie playlists**: Use a funcionalidade de criação de playlists por gênero
3. **Personalize**: Modifique os estilos CSS para personalizar a aparência
4. **Contribua**: Veja issues abertas e contribua com melhorias

## Suporte

Se encontrar problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Confirme se todas as configurações estão corretas
3. Consulte a documentação técnica em `TECHNICAL_DOCS.md`
4. Abra uma issue no repositório com detalhes do problema

---

Enjoy your music organization with SpotifyWrapper! 🎵
