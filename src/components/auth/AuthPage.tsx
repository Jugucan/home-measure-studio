import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler, Home, Camera, Box } from 'lucide-react';

export function AuthPage() {
  const { login, loginWithGoogle, signup, isLoading } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError('Error d\'autenticació. Torna-ho a provar.');
    }
  };

  const features = [
    { icon: Home, title: 'Organitza per espais', desc: 'Crea zones per cada àrea' },
    { icon: Camera, title: 'Mesures amb fotos', desc: 'Col·loca cubs 3D sobre fotos' },
    { icon: Box, title: 'Dimensions precises', desc: 'Guarda ample, alt i fondària' },
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Ruler className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Cubbuc</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Mesura el teu
              <span className="text-gradient block">Espai Ideal</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
              Planifica el redisseny de casa teva amb precisió. Puja fotos, col·loca cubs 
              de mesura 3D i guarda totes les dimensions en un sol lloc.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass rounded-xl p-4 shadow-soft"
                >
                  <feature.icon className="w-8 h-8 text-primary mb-2 mx-auto lg:mx-0" />
                  <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Auth form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow-float border-0">
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-2xl">
                  {isSignUp ? 'Crear compte' : 'Benvingut/da'}
                </CardTitle>
                <CardDescription>
                  {isSignUp
                    ? 'Comença a mesurar el teu espai ideal avui'
                    : 'Inicia sessió per accedir als teus cubs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base gap-3"
                  onClick={loginWithGoogle}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar amb Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O continua amb email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nom</Label>
                      <Input
                        id="displayName"
                        placeholder="El teu nom"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contrasenya</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Espera...' : isSignUp ? 'Crear compte' : 'Iniciar sessió'}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  {isSignUp ? 'Ja tens un compte?' : 'No tens un compte?'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline font-medium"
                  >
                    {isSignUp ? 'Inicia sessió' : 'Registra\'t'}
                  </button>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Connectat amb Firebase • Mode actiu</p>
      </footer>
    </div>
  );
}
