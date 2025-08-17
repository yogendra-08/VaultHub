'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LifeBuoy, LogOut, Settings, User, VaultIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { user, handleLogout } = useAuth();
  
  const userName = user?.displayName || "User";
  const userAvatar = user?.photoURL || `https://avatar.vercel.sh/${user?.email || 'user'}.png`;
  
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <VaultIcon className="h-6 w-6 text-primary" />
        <span className="text-lg">VaultHub</span>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        {user && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt="User avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userName}'s Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard/settings" passHref>
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/settings" passHref>
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                </Link>
                <DropdownMenuItem disabled>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>
    </header>
  );
}
