import './App.css'
import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import { motion, AnimatePresence } from 'framer-motion'
import InfiniteScroll from 'react-infinite-scroll-component'

const CATEGORIAS_RAPIDAS = ['Natureza', 'Tecnologia', 'Arquitetura', 'Minimalismo', 'Cidades', 'Favoritos'];

const OPCOES_ORIENTACAO = [
  { label: 'Todas Orientações', value: '' },
  { label: 'Paisagem (Horizontal)', value: 'landscape' },
  { label: 'Retrato (Vertical)', value: 'portrait' },
  { label: 'Quadrada', value: 'squarish' }
];

const OPCOES_COR = [
  { label: 'Todas as Cores', value: '' },
  { label: 'Preto e Branco', value: 'black_and_white' },
  { label: 'Preto', value: 'black' },
  { label: 'Branco', value: 'white' },
  { label: 'Amarelo', value: 'yellow' },
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Roxo', value: 'purple' },
  { label: 'Magenta', value: 'magenta' }
];

function App() {
  const [search, setSearch] = useState(() => {
    return localStorage.getItem('galeria_ultima_busca') || 'popular';
  });

  const [darkMode, setDarkMode] = useState(() => {
    const salvo = localStorage.getItem('galeria_dark_mode');
    return salvo ? JSON.parse(salvo) : true;
  });

  const [orientacion, setOrientacion] = useState(() => {
    return localStorage.getItem('galeria_filtro_orientacao') || '';
  });
  const [color, setColor] = useState(() => {
    return localStorage.getItem('galeria_filtro_cor') || '';
  });

  const [images, setImages] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(null)
  const [notificacao, setNotificacao] = useState<string | null>(null)

  const [favoritos, setFavoritos] = useState<any[]>(() => {
    const salvos = localStorage.getItem('galeria_favoritos');
    return salvos ? JSON.parse(salvos) : [];
  });

  useEffect(() => {
    localStorage.setItem('galeria_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('galeria_favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem('galeria_ultima_busca', search);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('galeria_filtro_orientacao', orientacion);
    localStorage.setItem('galeria_filtro_cor', color);
  }, [orientacion, color]);

  useEffect(() => {
    if (search === '') {
      setSearch('popular');
      setImages([]);
      setPage(1);
      buscarImagens('popular', true);
    }
  }, [search]);

  useEffect(() => {
    if (search !== 'Favoritos') {
      buscarImagens(search, true);
    }
  }, []);

  useEffect(() => {
    if (page > 1 && search !== 'Favoritos') {
      buscarImagens();
    }
  }, [page])

  useEffect(() => {
    if (search && search !== 'Favoritos') {
      setImages([]);
      setPage(1);
      buscarImagens(search, true);
    }
  }, [orientacion, color])

  function mostrarNotificacao(mensagem: string) {
    setNotificacao(mensagem);
  }

  useEffect(() => {
    if (!notificacao) return;
    const timer = setTimeout(() => {
      setNotificacao(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [notificacao]);

  function ejecutarNovaBusca() {
    if (!search.trim()) return;
    setImages([]);
    setPage(1);
    buscarImagens(search, true);
  }

  async function buscarImagens(termoSubstituto?: string, resetarLista = false) {
    const termoAtual = termoSubstituto || search;
    if (!termoAtual.trim() || termoAtual === 'Favoritos') return;

    setLoading(true);
    try {
      const apiKEY = import.meta.env.VITE_PUBLIC_KEY;
      const paginaAlvo = resetarLista ? 1 : (images.length === 0 ? 1 : page);

      // ALTERADO: Troca de &per_page=12 para &per_page=25 na URL da requisição
      let url = `https://api.unsplash.com/search/photos?query=${termoAtual}&per_page=25&page=${paginaAlvo}&client_id=${apiKEY}`;
      
      if (orientacion) url += `&orientation=${orientacion}`;
      if (color) url += `&color=${color}`;

      const response = await fetch(url);
      const data = await response.json();

      setImages((prevImages) => {
        if (paginaAlvo === 1) {
          return data.results || [];
        }
        return [...prevImages, ...(data.results || [])];
      });
    } catch (error) {
      console.error("Erro ao buscar imagens:", error);
      mostrarNotificacao("Erro ao buscar imagens da API.");
    } finally {
      setLoading(false);
    }
  }

  function lidarComCategoria(categoria: string) {
    setPage(1);
    setSearch(categoria);

    if (categoria === 'Favoritos') {
      setImages([]);
    } else {
      setSearch(categoria);
      setImages([]);
      buscarImagens(categoria, true);
    }
  }

  function alternarFavorito(image: any) {
    const jaE_Favorito = favoritos.some((fav) => fav.id === image.id);
    if (jaE_Favorito) {
      setFavoritos(favoritos.filter((fav) => fav.id !== image.id));
      mostrarNotificacao("Imagem removida dos salvos!");
    } else {
      setFavoritos([...favoritos, image]);
      mostrarNotificacao("Imagem salva nos favoritos!");
    }
  }

  function carregarMais() {
    setPage((prevPage) => prevPage + 1);
  }

  async function baixarImagem(urlDaImagem: string, idDaImagem: string) {
    try {
      mostrarNotificacao("Iniciando download da imagem...");
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
      mostrarNotificacao("Download concluído com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar:", error)
      mostrarNotificacao("Não foi possível baixar a imagem.");
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

  const listaDeImagensExibida = search === 'Favoritos' ? favoritos : images;

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
          <div className="container-pesquisa-filtros">
            <input
              type="text"
              className='Pesquisa'
              placeholder='Pesquisar imagens... Enter'
              value={search === 'Favoritos' ? '' : (search === 'popular' ? '' : search)} 
              disabled={search === 'Favoritos'} 
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executarNovaBusca();
                }
              }}
            />

            {search !== 'Favoritos' && (
              <div className="filtros-dropdown">
                <select 
                  className="select-filtro" 
                  value={orientacion} 
                  onChange={(e) => setOrientacion(e.target.value)}
                >
                  {OPCOES_ORIENTACAO.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                <select 
                  className="select-filtro" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                >
                  {OPCOES_COR.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="container-categorias">
            {CATEGORIAS_RAPIDAS.map((cat) => (
              <button
                key={cat}
                className={`btn-categoria ${search === cat ? 'active' : ''}`}
                onClick={() => lidarComCategoria(cat)}
              >
                {cat === 'Favoritos' ? <>Salvos</> : cat}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="area-galeria">
        <InfiniteScroll
          dataLength={listaDeImagensExibida.length}
          next={carregarMais}
          hasMore={false}
          loader={<h2></h2>}
        >
          <Masonry
            breakpointCols={pontosDeQuebra}
            className="galeria-masonry"
            columnClassName="galeria-masonry-coluna"
          >
            {loading && listaDeImagensExibida.length === 0
              ? Array.from({ length: 25 }).map((_, index) => ( // Ajustado aqui também para gerar 25 skeletons enquanto carrega
                <div key={index} className="skeleton"></div>
              ))
              : listaDeImagensExibida.map((image) => {
                const eFavorito = favoritos.some((fav) => fav.id === image.id);

                return (
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
                      className={`btn-favorito-foto ${eFavorito ? 'favoritado' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        alternarFavorito(image);
                      }}
                      title={eFavorito ? "Remover dos Salvos" : "Adicionar aos Salvos"}
                    >
                      <i className={`bi ${eFavorito ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>

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
                );
              })
            }
          </Masonry>

          {!loading && listaDeImagensExibida.length === 0 && (
            <div className="aviso-galeria-vazia">
              <i className={`bi ${search === 'Favoritos' ? 'bi-heart' : 'bi-image'}`} style={{ fontSize: '48px', marginBottom: '10px', display: 'block' }}></i>
              <h3>
                {search === 'Favoritos'
                  ? 'A sua lista de favoritos está vazia'
                  : 'Nenhuma imagem encontrada para os filtros aplicados.'
                }
              </h3>
              <p>
                {search === 'Favoritos'
                  ? 'Clique no ícone de coração em qualquer imagem para guardá-la aqui.'
                  : 'Tente mudar o termo de busca ou limpar os filtros de cor e orientação.'
                }
              </p>
            </div>
          )}
        </InfiniteScroll>
      </div>

      {listaDeImagensExibida.length > 0 && search !== 'Favoritos' && (
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

      <AnimatePresence>
        {notificacao && (
          <motion.div
            className="toast-notificacao"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <i className="bi bi-info-circle-fill" style={{ fontSize: '16px' }}></i>
            <span>{notificacao}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App;