import './App.css'
import { useState } from 'react'
import Masonry from 'react-masonry-css';
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import InfiniteScroll from 'react-infinite-scroll-component'

function App() {
  const [search, setSearch] = useState('')
  const [images, setImages] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    if (search !== '') {
      buscarImagens()
    }
  }, [page])



  async function buscarImagens() {

    if (page === 1) {
      setImages([])
    }

    if (search === '') return

    setLoading(true)
    try {
      const apiKEY = import.meta.env.VITE_PUBLIC_KEY

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${search}&per_page=12&page=${page}&client_id=${apiKEY}`
      )

      const data = await response.json()
      setImages((prevImages) => [...prevImages, ...data.results])
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  function carregarMais() {
    setPage((prevPage) => prevPage + 1)
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

              setImages([])

              setPage(1)
            }
          }}
        />

        <button
          className="botao-dark"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

      </div>

      <InfiniteScroll
        dataLength={images.length}
        next={carregarMais}
        hasMore={page < 10}
        loader={<h2></h2>}
      >

        <Masonry
          breakpointCols={pontosDeQuebra}
          className="galeria-masonry"
          columnClassName="galeria-masonry-coluna"
        >

          {loading
            ? Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="skeleton"></div>
            ))
            : images.map((image) => (
              <motion.img
                key={image.id}
                src={image.urls.small}
                alt={image.alt_description || "Imagem"}
                onClick={() => {
                  setImagemSelecionada(image.urls.regular);
                }}
                style={{ cursor: 'zoom-in' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}

                transition={{
                  duration: 0.5
                }}

                whileHover={{
                  scale: 1.03
                }}
              />
            ))
          }
        </Masonry>
      </InfiniteScroll>

      {imagemSelecionada && (
        <motion.div className="zoom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setImagemSelecionada(null)}>
          <span className="zoom-fechar">&times;</span>
          <img src={imagemSelecionada} alt="Imagem em Zoom" className="zoom-imagem" />
        </motion.div>
      )}

    </div>
  )
}

export default App