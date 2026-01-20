import { Ruler, LogOut, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppHeader() {
  const { user, logout } = useApp();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-soft">
            <Ruler className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">cubbuc</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoUrl} alt={user?.displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.displayName}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Tancar sessió
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
