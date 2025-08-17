'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Check your email',
        description: 'A password reset link has been sent to you.',
      });
      setIsSent(true);
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send reset link. Please check the email and try again.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  if (isSent) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                    If an account with that email exists, a reset link has been sent. Please check your inbox (and spam folder).
                </p>
            </CardContent>
            <CardFooter>
                 <Link href="/" className="w-full">
                    <Button className="w-full" variant="outline">
                        Back to Login
                    </Button>
                 </Link>
            </CardFooter>
        </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
           <Link href="/">
                <Button variant="link">
                    Back to Login
                </Button>
            </Link>
        </CardFooter>
      </Card>
    </form>
  );
}
