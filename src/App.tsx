import './App.css'
import { useState } from 'react'
import Masonry from 'react-masonry-css';

function App() {
  const [search, setSearch] = useState('')
  const [images, setImages] = useState<any[]>([])

  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)

  async function buscarImagens() {
    if (search === '') return

    const apiKEY = import.meta.env.VITE_PUBLIC_KEY

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${search}&per_page=12&client_id=${apiKEY}`
    )

    const data = await response.json()
    setImages(data.results)
  }


  const pontosDeQuebra = {
    default: 4,
    1100: 3,
    700: 2
  };

  return (
    <div>

      <div className='barra-topo'>
        <input
          type="text"
          className='Pesquisa'
          placeholder='Pesquisar imagens...Enter'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              buscarImagens()
            }
          }}
        />
      </div>

      <Masonry
        breakpointCols={pontosDeQuebra}
        className="galeria-masonry"
        columnClassName="galeria-masonry-coluna"
      >
        {images.map((image) => (
          <img
            key={image.id}
            src={image.urls.small}
            alt={image.alt_description || "Imagem"}
            onClick={() => {
              setImagemSelecionada(image.urls.regular);
            }}
            style={{ cursor: 'zoom-in' }}
          />
        ))}
      </Masonry>

      {imagemSelecionada && (
        <div className="zoom-overlay" onClick={() => setImagemSelecionada(null)}>
          <span className="zoom-fechar">&times;</span>
          <img src={imagemSelecionada} alt="Imagem em Zoom" className="zoom-imagem" />
        </div>
      )}

    </div>
  )
}

export default App