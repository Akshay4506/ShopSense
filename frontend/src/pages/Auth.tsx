import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Store,
  Mail,
  Lock,
  User,
  KeyRound,
  Loader2,
  MapPin,
  Phone,
  Building2,
  Timer,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CrazyLoader } from "@/components/CrazyLoader";
import { apiClient } from '@/api/client';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopkeeperName, setShopkeeperName] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);

  // Views: "login", "signup"
  const [view, setView] = useState('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

  const { login: authLogin, loginWithToken, user, loading: authLoading } = useAuth(); // Rename to avoid conflict with local loading
  const { toast } = useToast();



  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // --- Handlers ---

  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authLogin(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to login',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authLogin(phone, password);
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to login',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        email,
        password,
        shopkeeper_name: shopkeeperName,
        shop_name: shopName,
        address: address,
        phone: phone,
      });
      toast({
        title: 'Success',
        description: 'Account created! Please login.',
      });
      setView('login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create account',
      });
    } finally {
      setLoading(false);
    }
  };

  // OTP flows have been replaced by Password-only login per user request.

  if (authLoading) {
    return <CrazyLoader />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] mb-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Store className="h-8 w-8" />
          <span className="text-2xl font-bold">ShopSense</span>
        </div>

        {/* Dynamic Headers */}
        {(view === 'login' || view === 'signup') && (
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to ShopSense
            </h1>
            <p className="text-sm text-muted-foreground">
              Smart Dukaan Management System
            </p>
          </div>
        )}
      </div>

      <Card className="w-full max-w-[420px] border-border/40 shadow-xl">
        <CardContent className="pt-6">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {loginMethod === 'email' ? (
                <form onSubmit={handleLoginEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-muted-foreground"
                      type="button"
                      onClick={() => setLoginMethod('mobile')}
                    >
                      Login with Mobile
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginMobile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-mobile-phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-mobile-phone"
                        className="pl-9"
                        placeholder="1234567890"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-mobile-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-mobile-password"
                        className="pl-9"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-muted-foreground"
                      type="button"
                      onClick={() => setLoginMethod('email')}
                    >
                      Login with Email
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="shopkeeperName">Shopkeeper Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="shopkeeperName"
                      className="pl-9"
                      placeholder="Your Name"
                      value={shopkeeperName}
                      onChange={(e) => setShopkeeperName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="shopName"
                      className="pl-9"
                      placeholder="My Awesome Shop"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      placeholder="1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Shop Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      className="pl-9"
                      placeholder="123 Main St, City"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      className="pl-9"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      className="pl-9"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ShopSense. All rights reserved.</p>
      </div>
    </div>
  );
}
