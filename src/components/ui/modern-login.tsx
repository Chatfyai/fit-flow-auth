"use client";

import * as React from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ModernLoginProps {
  onSwitchToRegister: () => void;
}

export default function ModernLogin({ onSwitchToRegister }: ModernLoginProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message === 'Invalid login credentials' 
            ? "Email ou senha incorretos" 
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao PlayFit",
          className: 'warning-card-playfit shadow-lg border-2',
          style: {
            backgroundColor: 'oklch(0.9 0.15 85)',
            borderColor: 'oklch(0.85 0.12 75)',
            color: '#ffffff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }
        });
        
        // Redirecionar para dashboard após login bem-sucedido
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Container principal */}
        <div className="bg-white shadow-lg rounded-xl p-8 space-y-6">
          {/* Logo PlayFit */}
          <div className="flex justify-center">
            <div className="flex items-center text-2xl">
              <span className="text-black font-bold tracking-wide">Play</span>
              <svg 
                className="w-12 h-12 -ml-2 relative -top-0.5" 
                viewBox="0 0 120 120" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <polygon 
                  points="30,15 105,60 30,105"
                  fill="#facc15"
                  stroke="#facc15"
                  strokeWidth="20"
                  strokeLinejoin="round" 
                />
                <text 
                  x="67.5" 
                  y="65" 
                  dominantBaseline="middle"
                  fontFamily="system-ui, sans-serif" 
                  fontSize="55"
                  fontWeight="700" 
                  fill="#000000" 
                  textAnchor="middle"
                >
                  fit
                </text>
              </svg>
            </div>
          </div>

                     {/* Título e subtítulo */}
           <div className="text-center space-y-2">
             <h2 className="text-2xl font-bold text-gray-900">Bem vindo ao PlayFit</h2>
             <p className="text-gray-600">Vamos dar um play na sua meta</p>
           </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                                     placeholder="E-mail"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                                     placeholder="Senha"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me e Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                                 <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                   Lembrar
                 </label>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
              >
                                 Esqueceu a senha?
              </button>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                             {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          

                     {/* Link para Sign up */}
           <div className="text-center">
             <p className="text-sm text-gray-600">
               Ainda não tem uma conta?{' '}
               <button
                 type="button"
                 onClick={onSwitchToRegister}
                 className="font-medium text-amber-600 hover:text-amber-500 transition-colors"
                 disabled={loading}
               >
                 Cadastre aqui
               </button>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
