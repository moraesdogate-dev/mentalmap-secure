import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [maps, setMaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewMapForm, setShowNewMapForm] = useState(false)
  const [newMapName, setNewMapName] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    fetchMaps()
  }, [token, navigate])

  const fetchMaps = async () => {
    try {
      const response = await axios.get(`${API_URL}/mentalmap`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMaps(response.data.mentalMaps || [])
    } catch (error) {
      console.error('Erro ao carregar mapas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMap = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        `${API_URL}/mentalmap`,
        { name: newMapName, description: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMaps([response.data.mentalMap, ...maps])
      setNewMapName('')
      setShowNewMapForm(false)
      navigate(`/editor/${response.data.mentalMap._id}`)
    } catch (error) {
      console.error('Erro ao criar mapa:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MentalMap</h1>
            <p className="text-gray-600">Bem-vindo, {user?.username}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* New Map Button */}
        <div className="mb-8">
          {!showNewMapForm ? (
            <button
              onClick={() => setShowNewMapForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              + Novo Mapa Mental
            </button>
          ) : (
            <form onSubmit={handleCreateMap} className="bg-white p-6 rounded-lg shadow">
              <input
                type="text"
                value={newMapName}
                onChange={(e) => setNewMapName(e.target.value)}
                placeholder="Nome do mapa mental..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Criar
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewMapForm(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Maps Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Carregando mapas...</p>
          </div>
        ) : maps.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhum mapa criado ainda.</p>
            <p className="text-gray-500">Clique em "Novo Mapa Mental" para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maps.map((map) => (
              <div
                key={map._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer"
                onClick={() => navigate(`/editor/${map._id}`)}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{map.name}</h3>
                <p className="text-gray-600 mb-4">
                  {map.cards?.length || 0} cards • {map.connections?.length || 0} conexões
                </p>
                <p className="text-sm text-gray-500">
                  Criado em {new Date(map.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
