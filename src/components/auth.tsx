import { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Icons } from "./ui/icons"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { authService, handleAuthError } from '../services/auth.service';
import logoInstitutions from "../assets/logo-2.svg?url";

export default function AuthPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar errores al montar el componente
  useEffect(() => {
    setError(null);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login(loginData);
      // Redirigir al dashboard después de un inicio de sesión exitoso
      window.location.href = '/dashboard';
    } catch (err) {
      const { message } = handleAuthError(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001B28] via-[#013C52] to-[#024959] p-4 relative overflow-hidden">
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#04BFAD] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#A7F2EB] rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logoInstitutions} 
              alt="yoParticipo Logo" 
              className="h-16 scale-400 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-lg text-[#A7F2EB]">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Card de login con efecto glassmorphism */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#04BFAD] to-[#024959] rounded-3xl blur-xl opacity-30"></div>
          <Card className="relative bg-white/95 backdrop-blur-lg rounded-3xl border-2 border-[#04BFAD]/30 shadow-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl text-center text-[#024959] font-bold">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center text-[#4D4D59] text-base">
                Accede al sistema de gestión de ensayos clínicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm flex items-start gap-3">
                  <Icons.AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#024959] font-semibold">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Icons.Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#04BFAD]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={loginData.email}
                      onChange={handleInputChange}
                      className="pl-11 h-12 border-2 border-[#04BFAD]/20 focus:border-[#04BFAD] rounded-xl"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#024959] font-semibold">
                      Contraseña
                    </Label>
                    <a href="#" className="text-sm text-[#04BFAD] hover:text-[#024959] transition-colors font-medium">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Icons.Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#04BFAD]" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleInputChange}
                      className="pl-11 h-12 border-2 border-[#04BFAD]/20 focus:border-[#04BFAD] rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#04BFAD] to-[#024959] hover:opacity-90 text-white h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icons.Loader2 className="w-5 h-5 animate-spin" />
                      <span>Iniciando sesión...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Icons.LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </span>
                  )}
                </Button>
              </form>

              {/* Información adicional */}
              <div className="pt-4 border-t border-[#04BFAD]/20">
                <p className="text-center text-sm text-[#4D4D59] flex items-center justify-center gap-2">
                  <Icons.Shield className="w-4 h-4 text-[#04BFAD]" />
                  Conexión segura y encriptada
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[#A7F2EB]">
            © 2024 yoParticipo Chile. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
