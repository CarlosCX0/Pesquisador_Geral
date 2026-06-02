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
    if (page > 1) {
      buscarImagens();
    }
  }, [page])

  function executarNovaBusca() {
    if (!search.trim()) return;

    setImages([]);
    setPage(1);
    buscarImagens(search);
  }

  async function buscarImagens(termoSubstituto?: string) {
    const termoAtual = termoSubstituto || search;
    if (!termoAtual.trim()) return;

    setLoading(true);
    try {
      const apiKEY = import.meta.env.VITE_PUBLIC_KEY;
      const paginaAlvo = images.length === 0 ? 1 : page;

      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${termoAtual}&per_page=12&page=${paginaAlvo}&client_id=${apiKEY}`
      );
      const data = await response.json();

      setImages((prevImages) => {
        if (paginaAlvo === 1) {
          return data.results || [];
        }
        return [...prevImages, ...(data.results || [])];
      });
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
    } finally {
      setLoading(false);
    }
  }

  function lidarComCategoria(categoria: string) {
    const termo = categoria === 'Todos' ? 'popular' : categoria;

    setSearch(termo);
    setImages([]);
    setPage(1);
    buscarImagens(termo); 
  }

  function carregarMais() {
    setPage((prevPage) => prevPage + 1);
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

  function obterProporcao(width: number, height: number) {
    const razao = width / height;
    if (Math.abs(razao - 16 / 9) < 0.1) return '16:9';
    if (Math.abs(razao - 4 / 3) < 0.1) return '4:3';
    if (Math.abs(razao - 1) < 0.1) return '1:1 (Quadrada)';
    return razao < 1 ? 'Vertical' : 'Horizontal';
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
        <motion.div
          className="conteudo-topo"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <input
            type="text"
            className='Pesquisa'
            placeholder='Pesquisar imagens... Enter'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                executarNovaBusca();
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
        </motion.div>
      </div>

      <div className="area-galeria">
        <InfiniteScroll
          dataLength={images.length}
          next={carregarMais}
          hasMore={false}
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

                    <div className="badge-dimensao">
                      <i className="bi bi-aspect-ratio me-1"></i>
                      {obterProporcao(image.width, image.height)} ({image.width}x{image.height})
                    </div>

                    <button
                      className="btn-download-foto"
                      onClick={(e) => {
                        e.stopPropagation();
                        baixarImagem(image.urls.regular, image.id);
                      }}
                      title="Baixar Imagem"
                    >
                      <i className="bi bi-download"></i>
                    </button>
                  </div>
                ))
            }
          </Masonry>

          {!loading && images.length === 0 && (
            <div className="aviso-galeria-vazia">
              <i className="bi bi-image" style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}></i>
              <h3>Digite um termo e pressione Enter para buscar</h3>
              <p>Exemplo: Natureza, Arquitetura, Animais...</p>
            </div>
          )}
        </InfiniteScroll>
      </div>

      {images.length > 0 && (
        <div className="container-botao-mais">
          <button className="btn-carregar-mais" onClick={carregarMais} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Carregando...
              </>
            ) : (
              'Carregar mais imagens'
            )}
          </button>
        </div>
      )}

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

export default App;