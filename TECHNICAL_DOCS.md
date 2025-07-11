# SpotifyWrapper - Documentação Técnica

## Visão Geral da Arquitetura

### Padrão MVC
O projeto segue uma arquitetura baseada em MVC (Model-View-Controller):

- **Models**: Representados pelas coleções MongoDB
- **Views**: Templates Pug e HTML estático
- **Controllers**: Arquivos de rota em `/routes/`

### Arquitetura de Sessões

```javascript
// Configuração de sessão
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // HTTP para desenvolvimento
}));
```

## Detalhes das Rotas

### Authorization Flow (`/routes/authorization.js`)

```javascript
// Gera URL de autorização OAuth
const scopes = 'user-read-private user-read-email user-read-currently-playing user-read-recently-played playlist-modify-private';

// Redireciona para Spotify com parâmetros
res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state: state
}));
```

### Callback Handler (`/routes/callback.js`)

```javascript
// Troca código por tokens
const tokenRequest = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
    },
    headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    }
};
```

### Dashboard Controller (`/routes/dashboard.js`)

#### Principais Funções:

1. **getCurrentlyPlaying(token)**
   - Consulta API do Spotify para música atual
   - Trata erros 401 (token expirado)
   - Retorna dados da música ou null

2. **getArtistInformation(token, artistId)**
   - Obtém informações detalhadas do artista
   - Extrai gêneros musicais
   - Usado para categorização

3. **refreshAccessToken(req)**
   - Renova token de acesso automaticamente
   - Usa refresh token armazenado na sessão
   - Atualiza sessão com novos tokens

4. **getRecentlyPlayed(token)**
   - Obtém histórico de músicas
   - Mapeia apenas as tracks
   - Usado no sidebar do dashboard

### Collection Manager (`/routes/folder.js`)

#### Funcionalidades:

1. **Visualização de Coleções**
   ```javascript
   app.get('/collection/:genre', async (req, res) => {
       let genre = req.params.genre.trim().toLowerCase();
       const collection = db.collection(genre);
       let songs = await collection.find({}).toArray();
       
       // Ordena por artista
       songs.sort((a, b) => a.artist.localeCompare(b.artist));
       
       // Calcula artista favorito
       const artistCount = {};
       songs.forEach(song => {
           artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;
       });
   });
   ```

2. **Criação de Playlists**
   ```javascript
   app.post('/create/playlist', async (req, res) => {
       const playlist = await createPlaylist(token, req);
       const songs = await collection.find({}).toArray();
       
       await Promise.all(
           songs.filter(song => song.id)
                .map(song => postTrackToPlaylist(token, playlist.id, song.id))
       );
   });
   ```

## Configuração do Banco de Dados

### Conexão Singleton

```javascript
const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb://localhost:27017');
let db;

async function getDb() {
    if (!db) {
        await mongoClient.connect();
        db = mongoClient.db('spotify_wrapper');
    }
    return db;
}
```

### Estratégia de Armazenamento

1. **Coleção Principal** (`musicas`):
   - Armazena todas as músicas do usuário
   - Serve como índice geral
   - Previne duplicatas globais

2. **Coleções por Gênero**:
   - Uma coleção para cada gênero musical
   - Permite queries eficientes por categoria
   - Facilita criação de playlists

### Estrutura de Dados

```javascript
// Documento típico de música
{
  _id: ObjectId("..."),
  id: "4iV5W9uYEdYUVa79Axb7Rh",           // Spotify ID
  title: "Hotel California",              // Nome da música
  artist: "Eagles",                       // Artista principal
  genres: ["classic rock", "rock"],       // Gêneros do artista
  image: "https://i.scdn.co/image/..."    // URL da capa
}
```

## Frontend - Interface Retro

### Tema de Cores

```css
:root {
  --blue: #7fd6ff;      /* Azul principal */
  --white: #fff;        /* Branco */
  --green: #7cffb2;     /* Verde accent */
  --panel: #f0f2f5;     /* Cinza claro */
  --gray: #e0e0e0;      /* Cinza médio */
  --black: #222;        /* Preto de fundo */
}
```

### Fonte Retro

```css
font-family: 'Press Start 2P', monospace, 'Courier New', Courier;
```

### Grid System

```css
.collections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 110px);
  gap: 24px;
}
```

## JavaScript Frontend

### Polling para Música Atual

```javascript
async function fetchCurrentlyPlaying() {
    const res = await fetch('/api/currently-playing');
    const data = await res.json();
    
    if (data.item && data.item.id !== currentTrackId) {
        currentTrackId = data.item.id;
        // Atualiza interface
        updateMusicDisplay(data);
        updateGenresSidebar(data.artist.genres);
    }
}

// Executa a cada 5 segundos
setInterval(fetchCurrentlyPlaying, 5000);
```

### Controle de Sidebar

```javascript
const btn = document.getElementById('toggleGenres');
const sidebar = document.getElementById('sidebarGenres');
btn.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--visible');
});
```

## API Endpoints do Spotify Utilizados

### 1. Currently Playing
```
GET https://api.spotify.com/v1/me/player/currently-playing
```
- Retorna música atual do usuário
- Pode retornar 204 (sem conteúdo) se nada estiver tocando

### 2. Artist Information
```
GET https://api.spotify.com/v1/artists/{id}
```
- Obtém informações detalhadas do artista
- Inclui array de gêneros musicais

### 3. Recently Played
```
GET https://api.spotify.com/v1/me/player/recently-played
```
- Histórico de músicas recentes
- Limitado a 50 itens

### 4. Create Playlist
```
POST https://api.spotify.com/v1/users/{user_id}/playlists
```
- Cria playlist privada
- Requer escopo `playlist-modify-private`

### 5. Add Tracks to Playlist
```
POST https://api.spotify.com/v1/playlists/{playlist_id}/tracks
```
- Adiciona faixas à playlist
- Aceita array de URIs do Spotify

### 6. Get Track
```
GET https://api.spotify.com/v1/tracks/{id}
```
- Obtém informações detalhadas da faixa
- Usado para obter URI da música

## Tratamento de Erros

### 1. Token Expirado (401)
```javascript
if (response.status === 401) {
    await refreshAccessToken(req);
    token = req.session.access_token;
    data = await getCurrentlyPlaying(token);
}
```

### 2. Rate Limiting
- Implementado implicitamente pelo polling de 5 segundos
- Evita excesso de requisições à API

### 3. Dados Ausentes
```javascript
const imgUrl = (track.album.images && track.album.images.length > 2) 
    ? track.album.images[2].url 
    : (track.album.images && track.album.images.length 
        ? track.album.images[0].url 
        : '');
```

## Segurança

### 1. Variáveis de Ambiente
- Client Secret protegido
- Session Secret randomizado
- URLs de redirect validadas

### 2. Validação de Entrada
```javascript
let genre = req.params.genre.trim().toLowerCase();
if (!collectionNames.includes(genre)) {
    return res.render('folder', { /* dados vazios */ });
}
```

### 3. Sanitização de Dados
- Escape automático em templates Pug
- Validação de tipos de dados

## Performance

### 1. Conexão de Banco Singleton
- Evita múltiplas conexões desnecessárias
- Reutiliza conexão existente

### 2. Queries Otimizadas
```javascript
// Busca específica por gênero
const collection = db.collection(genre);
let songs = await collection.find({}).toArray();
```

### 3. Prevenção de Duplicatas
```javascript
const musicaExistente = await collection.findOne({
    title: data.item.name,
    artist: mainArtist[0].name
});
if (!musicaExistente) {
    await collection.insertOne(/* dados */);
}
```

## Logs e Debugging

### Console Logs Implementados
- Requisições recebidas
- Tokens renovados
- Músicas adicionadas
- Erros de API

### Estrutura de Logs
```javascript
console.log('Dashboard request received');
console.log('Refreshing access token...');
console.log('Adding track to playlist:', track.name);
console.error('Failed to create playlist:', response.statusText);
```

## Deployment

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/spotify_wrapper
SESSION_SECRET=sua_chave_super_secreta_aqui
SPOTIFY_CLIENT_ID=seu_client_id
SPOTIFY_CLIENT_SECRET=seu_client_secret
SPOTIFY_REDIRECT_URI=https://seudominio.com/callback
```

### Considerações de Produção
1. Usar HTTPS para cookies seguros
2. Implementar rate limiting
3. Adicionar logging estruturado
4. Configurar PM2 para gerenciamento de processos
5. Implementar health checks
6. Adicionar monitoramento de performance

---

*Esta documentação técnica fornece detalhes de implementação para desenvolvedores que desejam contribuir ou entender o funcionamento interno do SpotifyWrapper.*
