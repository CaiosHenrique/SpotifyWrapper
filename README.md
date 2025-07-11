# SpotifyWrapper - Documentação

## Descrição

SpotifyWrapper é uma aplicação web que permite aos usuários fazer login com suas contas do Spotify e organizar suas músicas em coleções baseadas em gêneros musicais. A aplicação monitora a música atualmente tocando do usuário e automaticamente categoriza as músicas em "pastas" baseadas nos gêneros dos artistas.

## Funcionalidades Principais

### 🎵 Autenticação com Spotify
- Login OAuth 2.0 com Spotify
- Gerenciamento de tokens de acesso e refresh
- Sessões persistentes

### 📊 Dashboard Interativo
- Visualização da música atualmente tocando
- Histórico de músicas recentemente tocadas
- Atualização automática em tempo real (5 segundos)
- Navegação por gêneros musicais

### 🗂️ Organização por Gêneros
- Categorização automática de músicas por gêneros
- Criação de coleções dinâmicas baseadas nos gêneros dos artistas
- Busca e navegação por coleções

### 🎧 Criação de Playlists
- Geração automática de playlists no Spotify
- Organização por gêneros musicais
- Integração completa com a API do Spotify

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **Express-session** - Gerenciamento de sessões
- **Body-parser** - Parsing de requisições HTTP
- **Consign** - Autoloader de módulos
- **Node-fetch** - Cliente HTTP para APIs
- **Nodemon** - Desenvolvimento com auto-restart

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização com tema retro/pixel art
- **JavaScript** - Interatividade e AJAX
- **Pug** - Template engine para views dinâmicas
- **Google Fonts** - Fonte "Press Start 2P" para estilo retro

### APIs e Integrações
- **Spotify Web API** - Integração completa com Spotify
- **OAuth 2.0** - Autenticação segura

## Arquitetura do Projeto

```
SpotifyWrapper/
├── app.js                  # Ponto de entrada da aplicação
├── package.json           # Dependências e scripts
├── config/
│   ├── server.js          # Configuração do servidor Express
│   └── dbConnection.js    # Conexão com MongoDB
├── routes/
│   ├── authorization.js   # Rota de autenticação
│   ├── callback.js        # Callback OAuth do Spotify
│   ├── dashboard.js       # Dashboard principal
│   ├── folder.js          # Gerenciamento de coleções
│   ├── home.js           # Página inicial
│   └── logout.js         # Logout
├── views/
│   ├── home.html         # Página inicial
│   ├── dashboard.pug     # Dashboard principal
│   └── folder.pug        # Visualização de coleções
├── styles/
│   ├── home.css          # Estilos da página inicial
│   ├── dashboard.css     # Estilos do dashboard
│   └── folder.css        # Estilos das coleções
└── images/
    ├── Caio.png
    └── Caio_Click.png
```

## Configuração e Instalação

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB (local ou remoto)
- Conta de desenvolvedor do Spotify

### Configuração do Spotify
1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie uma nova aplicação
3. Configure as URLs de redirecionamento:
   - `http://localhost:3000/callback`
4. Anote o Client ID e Client Secret

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
SESSION_SECRET=sua_chave_secreta_aqui
```

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Inicie o MongoDB (se local)
mongod

# Execute a aplicação
npm start
```

## Estrutura do Banco de Dados

### Banco: `spotify_wrapper`

#### Coleção: `musicas`
Armazena todas as músicas do usuário:
```javascript
{
  _id: ObjectId,
  id: String,          // ID da música no Spotify
  title: String,       // Nome da música
  artist: String,      // Nome do artista principal
  genres: [String],    // Array de gêneros
  image: String        // URL da imagem do álbum
}
```

#### Coleções Dinâmicas por Gênero
Para cada gênero musical, uma coleção específica é criada:
```javascript
// Exemplo: coleção "rock"
{
  _id: ObjectId,
  id: String,          // ID da música no Spotify
  title: String,       // Nome da música
  artist: String,      // Nome do artista principal
  genres: [String],    // Array de gêneros
  image: String        // URL da imagem do álbum
}
```

## Rotas da API

### Rotas Públicas
- `GET /` - Página inicial
- `GET /login` - Inicia processo de autenticação OAuth

### Rotas Autenticadas
- `GET /callback` - Callback OAuth do Spotify
- `GET /dashboard` - Dashboard principal
- `GET /api/currently-playing` - API para música atual
- `GET /collection/:genre` - Visualizar coleção por gênero
- `GET /find/collection` - Buscar coleção
- `POST /create/playlist` - Criar playlist no Spotify
- `GET /logout` - Logout do usuário

## Funcionalidades Detalhadas

### 1. Autenticação OAuth 2.0
O sistema implementa o fluxo completo de autenticação OAuth:
- Redirecionamento para autorização do Spotify
- Troca de código por tokens de acesso
- Refresh automático de tokens expirados
- Gerenciamento de sessões seguras

### 2. Monitoramento em Tempo Real
- Polling a cada 5 segundos para música atual
- Atualização automática da interface
- Sincronização com histórico de músicas

### 3. Categorização Automática
- Análise de gêneros dos artistas via API do Spotify
- Criação dinâmica de coleções MongoDB
- Prevenção de duplicatas

### 4. Interface Responsiva
- Design retro/pixel art com tema escuro
- Navegação intuitiva por gêneros
- Grid responsivo para coleções
- Sidebar deslizante para gêneros

## Fluxo de Uso

1. **Acesso Inicial**: Usuário acessa a página inicial
2. **Login**: Clica em "Login with Spotify" e autoriza a aplicação
3. **Dashboard**: Redirecionado para o dashboard principal
4. **Monitoramento**: Sistema monitora música atual automaticamente
5. **Categorização**: Músicas são organizadas por gêneros
6. **Navegação**: Usuário pode navegar pelas coleções criadas
7. **Playlists**: Pode criar playlists no Spotify com as coleções

## Escopos do Spotify Utilizados

- `user-read-private` - Informações básicas do usuário
- `user-read-email` - Email do usuário
- `user-read-currently-playing` - Música atual
- `user-read-recently-played` - Histórico de músicas
- `playlist-modify-private` - Criar playlists privadas
- `ugc-image-upload` - Upload de imagens (futuro)

## Tratamento de Erros

### Tokens Expirados
- Refresh automático usando refresh token
- Fallback para reautenticação se necessário

### API Rate Limits
- Controle de requisições
- Tratamento de erros HTTP

### Conexão com Banco
- Conexão singleton com MongoDB
- Tratamento de erros de conexão

## Melhorias Futuras

- [ ] Cache de dados para melhor performance
- [ ] Suporte a múltiplos usuários simultâneos
- [ ] Análise de estatísticas musicais
- [ ] Exportação de dados
- [ ] Modo offline
- [ ] Notificações push
- [ ] Integração com outras plataformas

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença ISC.

## Autor

Desenvolvido por [CaiosHenrique](https://github.com/CaiosHenrique)

---

*Documentação gerada automaticamente baseada na análise do código fonte*
