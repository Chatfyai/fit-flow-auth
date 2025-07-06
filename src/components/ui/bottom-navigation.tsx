import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Scale, 
  Plus, 
  Apple, 
  Bot 
} from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  path: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'nutrition',
    label: 'Nutrição',
    icon: Apple,
    path: '/nutrition'
  },
  {
    id: 'create',
    label: 'Criar',
    icon: Plus,
    path: '/create-workout'
  },
  {
    id: 'calendar',
    label: 'IMC',
    icon: Scale,
    path: '/agenda'
  },
  {
    id: 'chat',
    label: 'IA',
    icon: Bot,
    path: '/chat'
  }
]

interface BottomNavigationProps {
  className?: string
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  className 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const handleNavigation = (path: string) => {
    // Apenas '/dashboard' é permitido para usuários não autenticados
    if (!user && path !== '/dashboard') {
      navigate('/login')
      return
    }
    navigate(path)
  }

  return (
    <nav className={cn("bottom-nav", className)}>
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          const isCreateButton = item.id === 'create'
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "bottom-nav-item",
                isActive && "active",
                isCreateButton && "relative"
              )}
              aria-label={item.label}
              type="button"
            >
              {isCreateButton ? (
                <div className="gradient-bg w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <Icon 
                    size={24} 
                    className="text-white transition-all duration-300 ease-out" 
                  />
                </div>
              ) : (
                <Icon 
                  size={20} 
                  className={cn(
                    "transition-all duration-300 ease-out",
                    isActive ? "scale-110" : "scale-100"
                  )} 
                />
              )}
              <span className={cn(
                "text-xs font-medium mt-1 transition-all duration-300 ease-out",
                isCreateButton ? "text-white font-semibold" : (isActive ? "opacity-100" : "opacity-70")
              )}>
                {item.label}
              </span>
              {isActive && !isCreateButton && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavigation 