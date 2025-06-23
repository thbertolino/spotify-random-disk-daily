import React, { useEffect } from 'react';
import { redirectToSpotifyAuth } from './auth';

const CLIENT_ID = 'cf38be1a48df4c2888a9195e096c183b';
const REDIRECT_URI = 'https://thbertolino.github.io/spotify-random-disk-daily/';

function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (!code) {
      redirectToSpotifyAuth(CLIENT_ID, REDIRECT_URI);
    } else {
      alert("Autenticado com sucesso! Agora vamos trocar o code por token.");
      // Aqui virá a troca de code pelo token (próximo passo)
    }
  }, []);

  return (
    <div>
      <h1>Random Daily Disk</h1>
      <p>Autenticando com Spotify...</p>
    </div>
  );
}

export default App;
