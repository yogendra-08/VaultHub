import { LoginForm } from '@/components/login-form';
import { VaultIcon } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <VaultIcon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to VaultHub</h1>
          <p className="text-muted-foreground">Sign in to access your secure document vault</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
