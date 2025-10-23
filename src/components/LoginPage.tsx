import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Mail, Lock, Smartphone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService, LoginRequest } from '@/services/authService';
import { useAuthStore, User } from '@/store/authStore';
import { toast } from '@/utils/toast';
import { ErrorHandler } from '@/utils/errorHandler';

interface LoginPageProps {
  onLogin: (userInfo: User, token: string, refreshToken?: string) => void;
  onSwitchToRegister: () => void;
  onSwitchToResetPassword: () => void;
}

export function LoginPage({ onLogin, onSwitchToRegister, onSwitchToResetPassword }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'g2fa'>('password');
  const [passwordForm, setPasswordForm] = useState({ email: '', password: '' });
  const [g2faForm, setG2faForm] = useState({ email: '', twoFactorCode: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuthStore();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const credentials: LoginRequest = {
        email: passwordForm.email,
        password: passwordForm.password,
        loginType: 'password'
      };
      
      const response = await authService.login(credentials);
      
      if (response.code === "0000" && response.success) {
        login(response.data.user, response.data.token, response.data.refreshToken);
        toast.success('登录成功', '欢迎回到InPayOSCashier后台');
        onLogin(response.data.user, response.data.token, response.data.refreshToken);
      } else {
        setErrorMessage(response.msg);
        setShowErrorDialog(true);
      }
    } catch (error) {
      const apiError = ErrorHandler.handle(error);
      setErrorMessage(apiError.message);
      setShowErrorDialog(true);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleG2faLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const credentials: LoginRequest = {
        email: g2faForm.email,
        twoFactorCode: g2faForm.twoFactorCode,
        loginType: 'g2fa'
      };
      
      const response = await authService.login(credentials);
      
      if (response.code === "0000" && response.success) {
        login(response.data.user, response.data.token, response.data.refreshToken);
        toast.success('登录成功', '欢迎回到InPayOSCashier后台');
        onLogin(response.data.user, response.data.token, response.data.refreshToken);
      } else {
        setErrorMessage(response.msg);
        setShowErrorDialog(true);
      }
    } catch (error) {
      const apiError = ErrorHandler.handle(error);
      setErrorMessage(apiError.message);
      setShowErrorDialog(true);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">车队登录</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as 'password' | 'g2fa');
            }}>
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="password" className="flex items-center gap-2 h-10">
                  <Lock className="h-4 w-4" />
                  密码
                </TabsTrigger>
                <TabsTrigger value="g2fa" className="flex items-center gap-2 h-10">
                  <Smartphone className="h-4 w-4" />
                  G2FA
                </TabsTrigger>
              </TabsList>

              {/* 密码登录 */}
              <TabsContent value="password" className="space-y-4 mt-4">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-email"
                        type="email"
                        value={passwordForm.email}
                        onChange={(e) => setPasswordForm({ ...passwordForm, email: e.target.value })}
                        placeholder="请输入邮箱"
                        className="pl-10 h-12"
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                        placeholder="请输入密码"
                        className="pl-10 pr-10 h-12"
                        required
                        disabled={loginLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-4 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={loginLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={loginLoading}>
                    {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登录
                  </Button>
                  
                  {/* 忘记密码链接 */}
                  <div className="text-center">
                    <Button
                      variant="link"
                      className="p-0 h-6 text-sm font-medium text-muted-foreground hover:text-primary"
                      onClick={onSwitchToResetPassword}
                      type="button"
                    >
                      忘记密码？
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* G2FA登录 */}
              <TabsContent value="g2fa" className="space-y-4 mt-4">
                <form onSubmit={handleG2faLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="g2fa-email"
                        type="email"
                        value={g2faForm.email}
                        onChange={(e) => setG2faForm({ ...g2faForm, email: e.target.value })}
                        placeholder="请输入邮箱"
                        className="pl-10 h-12"
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="g2fa-code"
                        type="text"
                        value={g2faForm.twoFactorCode}
                        onChange={(e) => setG2faForm({ 
                          ...g2faForm, 
                          twoFactorCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                        })}
                        placeholder="请输入6位验证码"
                        className="pl-10 h-12"
                        maxLength={6}
                        required
                        disabled={loginLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={loginLoading}>
                    {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登录
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                还没有账号？{' '}
                <Button
                  variant="link"
                  className="p-0 h-6 font-medium"
                  onClick={onSwitchToRegister}
                >
                  立即注册
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 登录失败弹窗 */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              登录失败
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button className="h-10" onClick={() => setShowErrorDialog(false)}>
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
