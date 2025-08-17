'use client';

import { VaultIcon, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Props = {
    onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: Props) {
    const { user, handleLogout } = useAuth();
    const { toast } = useToast();
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || pin.length !== 4) return;
        setIsLoading(true);

        try {
            const userSettingsRef = doc(db, 'userSettings', user.uid);
            const docSnap = await getDoc(userSettingsRef);

            if (docSnap.exists() && docSnap.data().pin === pin) {
                toast({ title: 'PIN Accepted', description: 'Welcome back!' });
                onUnlock();
            } else {
                toast({ variant: 'destructive', title: 'Invalid PIN', description: 'The PIN you entered is incorrect.'});
            }

        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not verify PIN. Please try again.' });
        } finally {
            setIsLoading(false);
            setPin('');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <VaultIcon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Enter PIN</h1>
                    <p className="text-muted-foreground">Your vault is locked for security.</p>
                </div>
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handlePinSubmit}>
                            <div className="space-y-4">
                                <Input
                                    id="pin"
                                    type="password"
                                    placeholder="••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                    maxLength={4}
                                    className="text-center text-2xl tracking-[1.5rem]"
                                    disabled={isLoading}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Unlock'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <div className="mt-4 text-center">
                    <Button variant="link" onClick={handleLogout}>
                        Not you? Log out.
                    </Button>
                </div>
            </div>
        </div>
    )
}
