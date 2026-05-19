import { useAuthStore } from '@uniconnect/shared'
import { Link } from 'react-router-dom'
import EventFeed from '../components/events/EventFeed'

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome header */}
      {isAuthenticated && (
        <div className="text-center py-6">
          <p className="text-2xl font-bold text-[#002344]">Universidad de Caldas</p>
          <h1 className="text-lg font-medium text-gray-700 mt-1">Bienvenido a UniConnect</h1>
          <p className="text-lg text-gray-600 mt-2">{user?.name ?? 'Usuario'}</p>
        </div>
      )}

      {/* Event feed */}
      {isAuthenticated ? (
        <EventFeed />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to UniConnect</h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect with students from your university. Join groups, chat, and collaborate.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Quick access cards */}
      {isAuthenticated && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Acceso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/profile" className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#002344] mb-1">Tu Perfil</h3>
              <p className="text-sm text-gray-500">Ver y editar tu perfil académico</p>
            </Link>
            <Link to="/groups" className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#002344] mb-1">Grupos</h3>
              <p className="text-sm text-gray-500">Administra tus grupos de estudio</p>
            </Link>
            <Link to="/chat" className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-[#002344] mb-1">Chat</h3>
              <p className="text-sm text-gray-500">Mensajes directos y grupales</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
