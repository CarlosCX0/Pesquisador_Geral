import './App.css'
import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import { motion } from 'framer-motion'
import InfiniteScroll from 'react-infinite-scroll-component'

const CATEGORIAS_RAPIDAS = ['Todos', 'Natureza', 'Tecnologia', 'Arquitetura', 'Minimalismo', 'Cidades'];

function App() {
  const [search, setSearch] = useState('')
  const [images, setImages] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
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
  }, [page, search])

  async function buscarImagens() {
    setLoading(true)
    try {
      const apiKEY = import.meta.env.VITE_PUBLIC_KEY
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${search}&per_page=12&page=${page}&client_id=${apiKEY}`
      )
      const data = await response.json()

      setImages((prevImages) => {
        const listaCompleta = [...prevImages, ...data.results]
        return listaCompleta.slice(0, 15)
      })
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  async function baixarImagem(urlDaImagem: string, idDaImagem: string) {
    try {
      const resposta = await fetch(urlDaImagem)
      const blob = await resposta.blob()
      const urlBlob = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = urlBlob;
      link.download = `unsplash-${idDaImagem}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(urlBlob)
    } catch (error) {
      console.error("Erro ao baixar:", error)
    }
  }

  function carregarMais() {
    setPage((prevPage) => prevPage + 1)
  }

  function lidarComCategoria(categoria: string) {
    setImages([])
    setPage(1)
    setSearch(categoria === 'Todos' ? 'popular' : categoria)
  }

  const pontosDeQuebra = {
    default: 4,
    1100: 3,
    700: 2
  }

  return (
    <div>
      <button className="botao-dark" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <i className="bi bi-brightness-low-fill"></i> : <i className="bi bi-moon-stars-fill"></i>}
      </button>

      <div className='barra-topo'>
        <div className="conteudo-topo">
          <input
            type="text"
            className='Pesquisa'
            placeholder='Pesquisar imagens... Enter'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setImages([])
                setPage(1)
                buscarImagens()
              }
            }}
          />

          <div className="container-categorias">
            {CATEGORIAS_RAPIDAS.map((cat) => (
              <button
                key={cat}
                className={`btn-categoria ${search === cat || (cat === 'Todos' && search === 'popular') ? 'active' : ''}`}
                onClick={() => lidarComCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <InfiniteScroll
        dataLength={images.length}
        next={carregarMais}
        hasMore={images.length < 15}
        loader={<h2></h2>}
      >
        <Masonry
          breakpointCols={pontosDeQuebra}
          className="galeria-masonry"
          columnClassName="galeria-masonry-coluna"
        >
          {loading && images.length === 0
            ? Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="skeleton"></div>
            ))
            : images.map((image) => (
              <div key={image.id} className="container-imagem-galeria">
                <motion.img
                  src={image.urls.small}
                  alt={image.alt_description || "Imagem"}
                  onClick={() => setImagemSelecionada(image.urls.regular)}
                  style={{ cursor: 'zoom-in' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                />

                <button
                  className="btn-download-foto"
                  onClick={(e) => {
                    e.stopPropagation()
                    baixarImagem(image.urls.regular, image.id)
                  }}
                >
                  <i className="bi bi-download"></i>
                </button>
              </div>
            ))
          }
        </Masonry>
      </InfiniteScroll>

      {imagemSelecionada && (
        <motion.div
          className="zoom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setImagemSelecionada(null)}
        >
          <span className="zoom-fechar">&times;</span>
          <img src={imagemSelecionada} alt="Imagem em Zoom" className="zoom-imagem" />
        </motion.div>
      )}
    </div>
  )
}

export default App