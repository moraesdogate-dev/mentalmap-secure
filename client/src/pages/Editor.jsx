import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import AddLinkDialog from '../components/AddLinkDialog'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default function Editor() {
  const { mapId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const canvasRef = useRef(null)
  
  const [map, setMap] = useState(null)
  const [cards, setCards] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [draggingCard, setDraggingCard] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [showCardForm, setShowCardForm] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [cardFormData, setCardFormData] = useState({
    type: 'text',
    title: '',
    content: '',
    url: ''
  })

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    fetchMap()
  }, [mapId, token, navigate])

  const fetchMap = async () => {
    try {
      const response = await axios.get(`${API_URL}/mentalmap/${mapId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMap(response.data.mentalMap)
      setCards(response.data.mentalMap.cards || [])
      setConnections(response.data.mentalMap.connections || [])
    } catch (error) {
      console.error('Erro ao carregar mapa:', error)
      navigate('/dashboard')
    }
  }

  const handleAddCard = async (e) => {
    e.preventDefault()
    
    const newCard = {
      type: cardFormData.type,
      title: cardFormData.title,
      content: cardFormData.content,
      url: cardFormData.url,
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
      color: '#3b82f6'
    }

    try {
      await axios.post(
        `${API_URL}/mentalmap/${mapId}/cards`,
        newCard,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setCards([...cards, newCard])
      setCardFormData({ type: 'text', title: '', content: '', url: '' })
      setShowCardForm(false)
    } catch (error) {
      console.error('Erro ao adicionar card:', error)
    }
  }

  const handleAddLinkWithPreview = async (linkData) => {
    const newCard = {
      type: 'link',
      title: linkData.title,
      url: linkData.url,
      description: linkData.preview?.description || '',
      imageSrc: linkData.preview?.image || '',
      content: linkData.preview?.description || linkData.url,
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
      color: '#8b5cf6'
    }

    try {
      await axios.post(
        `${API_URL}/mentalmap/${mapId}/cards`,
        newCard,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setCards([...cards, newCard])
      setShowLinkDialog(false)
    } catch (error) {
      console.error('Erro ao adicionar link:', error)
    }
  }

  const handleDragStart = (e, cardIndex) => {
    setDraggingCard(cardIndex)
  }

  const handleDragEnd = () => {
    setDraggingCard(null)
  }

  const handleCanvasMouseMove = (e) => {
    if (draggingCard !== null) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - offset.x) / zoom
      const y = (e.clientY - rect.top - offset.y) / zoom

      const updatedCards = [...cards]
      updatedCards[draggingCard].x = x
      updatedCards[draggingCard].y = y
      setCards(updatedCards)
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(Math.max(0.5, Math.min(3, zoom * delta)))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{map?.name || 'Carregando...'}</h1>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
        >
          ← Voltar
        </button>
      </header>

      {/* Toolbar */}
      <div className="bg-gray-800 p-4 flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setShowCardForm(!showCardForm)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          + Novo Card
        </button>

        <button
          onClick={() => setShowLinkDialog(true)}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold"
        >
          + Link com Preview
        </button>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
          >
            −
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded"
          >
            +
          </button>
        </div>

        <div className="text-sm text-gray-400 ml-auto">
          {cards.length} cards • {connections.length} conexões
        </div>
      </div>

      {/* Form */}
      {showCardForm && (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <form onSubmit={handleAddCard} className="max-w-md space-y-3">
            <select
              value={cardFormData.type}
              onChange={(e) => setCardFormData({ ...cardFormData, type: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="text">Texto</option>
              <option value="link">Link</option>
              <option value="image">Imagem</option>
            </select>

            <input
              type="text"
              placeholder="Título"
              value={cardFormData.title}
              onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            />

            <textarea
              placeholder="Conteúdo"
              value={cardFormData.content}
              onChange={(e) => setCardFormData({ ...cardFormData, content: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-20"
            />

            {cardFormData.type !== 'text' && (
              <input
                type="text"
                placeholder="URL"
                value={cardFormData.url}
                onChange={(e) => setCardFormData({ ...cardFormData, url: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setShowCardForm(false)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Link Dialog */}
      <AddLinkDialog
        isOpen={showLinkDialog}
        onClose={() => setShowLinkDialog(false)}
        onAdd={handleAddLinkWithPreview}
        token={token}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 bg-gray-900 relative overflow-hidden cursor-move"
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onWheel={handleWheel}
        style={{ height: 'calc(100vh - 200px)' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {connections.map((conn, idx) => {
            const card1 = cards.find(c => c.id === conn.card1Id)
            const card2 = cards.find(c => c.id === conn.card2Id)
            if (!card1 || !card2) return null

            return (
              <line
                key={idx}
                x1={card1.x + 50}
                y1={card1.y + 50}
                x2={card2.x + 50}
                y2={card2.y + 50}
                stroke={conn.color || '#666'}
                strokeWidth="2"
              />
            )
          })}
        </svg>

        {/* Cards */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {cards.map((card, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => setSelectedCard(idx)}
              className={`absolute w-24 h-24 rounded-lg p-3 cursor-grab active:cursor-grabbing text-xs overflow-hidden transition ${
                selectedCard === idx
                  ? 'ring-2 ring-yellow-400 shadow-lg'
                  : 'shadow'
              }`}
              style={{
                left: `${card.x}px`,
                top: `${card.y}px`,
                backgroundColor: card.color || '#3b82f6',
                color: 'white'
              }}
            >
              <div className="font-bold truncate">{card.title}</div>
              <div className="text-xs mt-1 truncate">{card.content}</div>
              {card.type === 'link' && card.imageSrc && (
                <img
                  src={card.imageSrc}
                  alt={card.title}
                  className="w-full h-12 object-cover mt-1 rounded"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
