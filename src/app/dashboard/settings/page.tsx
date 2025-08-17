'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";


export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSavingPin, setIsSavingPin] = useState(false);

  useEffect(() => {
    if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');

        const fetchPinSettings = async () => {
            const userSettingsRef = doc(db, 'userSettings', user.uid);
            const docSnap = await getDoc(userSettingsRef);
            if (docSnap.exists() && docSnap.data().pin) {
                setIsPinEnabled(true);
            } else {
                setIsPinEnabled(false);
            }
        };
        fetchPinSettings();
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        await updateProfile(user, { displayName: name });
        toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const handlePinSave = async () => {
    if (!user) return;
    if (pin.length !== 4) {
        toast({ variant: 'destructive', title: 'Invalid PIN', description: 'PIN must be 4 digits.'});
        return;
    }
    if (pin !== confirmPin) {
        toast({ variant: 'destructive', title: 'PINs do not match', description: 'Please confirm your PIN.'});
        return;
    }

    setIsSavingPin(true);
    try {
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        // In a real app, you'd hash the PIN before saving.
        // For this example, we store it directly for simplicity.
        await setDoc(userSettingsRef, { pin }, { merge: true });
        toast({ title: 'PIN Saved', description: 'Your PIN has been successfully set.'});
        setPin('');
        setConfirmPin('');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSavingPin(false);
    }
  }
  
  const handlePinRemove = async () => {
      if (!user) return;
      setIsSavingPin(true);
      try {
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        await setDoc(userSettingsRef, { pin: null }, { merge: true });
        toast({ title: 'PIN Removed', description: 'Your PIN has been successfully removed.'});
        setIsPinEnabled(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSavingPin(false);
    }
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
                Manage your account settings, preferences, and more.
            </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                    </div>
                    <Button onClick={handleSaveChanges} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Enable dark theme for a different visual experience.
                            </p>
                        </div>
                        <Switch 
                          id="dark-mode"
                          checked={theme === 'dark'}
                          onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Enhance your account's security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isPinEnabled ? (
                        <>
                            <p className="text-sm text-muted-foreground">Set a 4-digit PIN for an extra layer of security when you log in.</p>
                            <div className="space-y-2">
                                <Label htmlFor="pin">New PIN</Label>
                                <Input id="pin" type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} disabled={isSavingPin} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-pin">Confirm PIN</Label>
                                <Input id="confirm-pin" type="password" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} disabled={isSavingPin} />
                            </div>
                            <Button onClick={handlePinSave} disabled={isSavingPin}>
                                {isSavingPin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Set PIN
                            </Button>
                        </>
                    ) : (
                         <>
                            <p className="text-sm text-muted-foreground">Your account is secured with a PIN.</p>
                            <Button onClick={handlePinRemove} variant="destructive" disabled={isSavingPin}>
                                {isSavingPin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Remove PIN
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AI Settings</CardTitle>
                    <CardDescription>Configure the behavior of AI-powered features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-categorize" className="text-base">Automatic Categorization</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically suggest categories for new documents on upload.
                            </p>
                        </div>
                        <Switch 
                          id="auto-categorize" 
                          checked
                          disabled
                        />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="ai-model" className="text-base">AI Model</Label>
                            <p className="text-sm text-muted-foreground">
                                Select the AI model for document analysis.
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Gemini 2.0 Flash (Default)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
