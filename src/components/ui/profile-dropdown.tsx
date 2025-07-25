import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  Target, 
  Settings, 
  LogOut, 
  UserCircle,
  TrendingUp,
  Share2,
  Home
} from "lucide-react"

interface ProfileDropdownProps {
  className?: string
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  const handleNavigation = (path: string) => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate(path)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-10 h-10 rounded-full p-0 hover:bg-gray-100"
          title="Meu Perfil"
        >
          <User className="h-8 w-8 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuLabel className="font-medium text-gray-700">
          {user ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário') : 'Visitante'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigation('/')} className="cursor-pointer">
          <Home className="mr-2 h-4 w-4" />
          <span>Início</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/goals')} className="cursor-pointer">
          <Target className="mr-2 h-4 w-4" />
          <span>Metas</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/agenda')} className="cursor-pointer">
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>Evolução</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation('/share')} className="cursor-pointer">
          <Share2 className="mr-2 h-4 w-4" />
          <span>Compartilhar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer text-blue-600 focus:text-blue-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Entrar</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown 