import React, { useEffect, useState } from 'react';
import { redirectToSpotifyAuth } from './auth';

const CLIENT_ID = 'cf38be1a48df4c2888a9195e096c183b';
const REDIRECT_URI = 'https://thbertolino.github.io/spotify-random-disk-daily/';

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function App() {
  const [album, setAlbum] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const getToken = async () => {
      const codeVerifier = localStorage.getItem('code_verifier');

      if (!codeVerifier) {
        redirectToSpotifyAuth(CLIENT_ID, REDIRECT_URI);
        return;
      }

      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      });

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        window.history.replaceState({}, document.title, '/spotify-random-disk-daily/');
        fetchAlbums(data.access_token);
      } else {
        redirectToSpotifyAuth(CLIENT_ID, REDIRECT_URI);
      }
    };

    const fetchAlbums = async (token) => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/albums?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          // Token inválido ou expirado
          localStorage.clear();
          window.location.href = REDIRECT_URI;
          return;
        }

        if (!res.ok) {
          throw new Error('Erro ao buscar álbuns');
        }

        const data = await res.json();

        const today = getTodayDateString();
        const storedDate = localStorage.getItem('album_date');
        const storedAlbum = localStorage.getItem('album_data');

        if (storedDate === today && storedAlbum) {
          setAlbum(JSON.parse(storedAlbum));
        } else if (data.items?.length) {
          const randomAlbum = data.items[Math.floor(Math.random() * data.items.length)].album;
          localStorage.setItem('album_date', today);
          localStorage.setItem('album_data', JSON.stringify(randomAlbum));
          setAlbum(randomAlbum);
        }
      } catch (err) {
        console.error('Erro ao carregar álbum:', err);
      }
    };

    const accessToken = localStorage.getItem('access_token');

    if (code) {
      getToken();
    } else if (accessToken) {
      fetchAlbums(accessToken);
    } else {
      redirectToSpotifyAuth(CLIENT_ID, REDIRECT_URI);
    }
  }, []);

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #1db954, #191414)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '2rem',
    textAlign: 'center',
  };

  const cardStyle = {
    background: '#282828',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
    maxWidth: '400px',
    width: '100%',
  };

  const imageStyle = {
    width: '100%',
    borderRadius: '12px',
    marginBottom: '1rem',
  };

  return (
    <div style={pageStyle}>
      {album ? (
        <div style={cardStyle}>
          <img src={album.images[0].url} alt="Capa do álbum" style={imageStyle} />
          <h2 style={{ margin: '0.5rem 0' }}>{album.name}</h2>
          <p style={{ fontStyle: 'italic', color: '#b3b3b3' }}>
            {album.artists.map((a) => a.name).join(', ')}
          </p>
          <a
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              background: '#1db954',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            🎧 Ouvir no Spotify
          </a>
        </div>
      ) : (
        <h2>🎲 Autenticando com Spotify e carregando álbum do dia...</h2>
      )}
    </div>
  );
}

export default App;
