import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { useAuthStore, User as UserType } from './store/authStore';
import { UserService, UserInfo } from './services/userService';
import { 
  Home, 
  ArrowDownLeft, 
  ArrowUpRight,
  Calculator,
  Settings, 
  Wallet, 
  LogOut,
  Building2,
  Menu,
  KeyRound
} from 'lucide-react';

import { AuthContainer } from './components/AuthContainer';
import { Dashboard } from './components/Dashboard';
import { PayinRecords } from './components/Payin';
import { PayoutRecords } from './components/Payout';
import { Config } from './components/Config';
// import { RefundRecords } from './components/RefundRecords';
// import { RechargeRecords } from './components/RechargeRecords';
import { SettlementRecords } from './components/SettlementRecords';
import { AccountBalance } from './components/AccountBalance';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [merchantInfo, setMerchantInfo] = useState<UserInfo | null>(null);
  const { isLoggedIn, currentUser, login, logout } = useAuthStore();

  const handleLogin = (userInfo: UserType, token: string, refreshToken?: string) => {
    login(userInfo, token, refreshToken);
  };

  const handleLogout = () => {
    logout();
    setActiveMenu('dashboard');
    setMerchantInfo(null);
  };

  const handlePasswordChanged = () => {
    // 密码修改成功后，关闭弹窗，退出登录并跳转到登录页面
    setShowChangePasswordDialog(false);
    logout();
    setActiveMenu('dashboard');
    setMerchantInfo(null);
  };

  // 获取商户信息
  useEffect(() => {
    if (isLoggedIn) {
      UserService.getUserInfo()
        .then(response => {
          if (response.code === '0000') {
            setMerchantInfo(response.data);
          }
        })
        .catch(error => {
          console.error('获取商户信息失败:', error);
        });
    }
  }, [isLoggedIn]);

  const menuItems = [
    {
      id: 'dashboard',
      label: '首页',
      icon: Home,
      component: Dashboard
    },
    {
      id: 'payin',
      label: '代收',
      icon: ArrowDownLeft,
      component: PayinRecords
    },
    {
      id: 'payout',
      label: '代付',
      icon: ArrowUpRight,
      component: PayoutRecords
    },

    // {
    //   id: 'refund',
    //   label: '退款',
    //   icon: Undo2,
    //   component: RefundRecords
    // },
    // {
    //   id: 'recharge',
    //   label: '充值记录',
    //   icon: Plus,
    //   component: RechargeRecords
    // },
    {
      id: 'settlement',
      label: '结算',
      icon: Calculator,
      component: SettlementRecords
    },
    {
      id: 'account',
      label: '账户',
      icon: Wallet,
      component: AccountBalance
    },
    {
      id: 'config',
      label: '配置',
      icon: Settings,
      component: Config
    },

  ];

  const ActiveComponent = menuItems.find(item => item.id === activeMenu)?.component || Dashboard;

  if (!isLoggedIn) {
    return <AuthContainer onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="flex h-screen w-full">
        {/* 侧边栏 */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 border-r bg-background flex flex-col`}>
          <div className="border-b h-14 flex items-center px-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 flex-shrink-0" />
              {sidebarOpen && (
                <div>
                  <h2 className="font-semibold">InPayOS</h2>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {/* 首页 */}
            <div className="px-3 mb-4">
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  activeMenu === 'dashboard' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => setActiveMenu('dashboard')}
              >
                <Home className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>首页</span>}
              </div>
            </div>

            {/* 交易管理 */}
            <div className="px-3 mb-4">
              {sidebarOpen && (
                <h4 className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                  交易管理
                </h4>
              )}
              <div className="space-y-1">
                {menuItems.slice(1, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      activeMenu === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveMenu(item.id)}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 账户与设置 */}
            <div className="px-3">
              {sidebarOpen && (
                <h4 className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
                  账户与设置
                </h4>
              )}
              <div className="space-y-1">
                {menuItems.slice(4, 6).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                      activeMenu === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveMenu(item.id)}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">
          {/* 顶部导航栏 */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 p-0"
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div className="flex-1" />
              
              {/* 用户菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatar.png" alt={merchantInfo?.name || currentUser?.companyName} />
                      <AvatarFallback>
                        {(merchantInfo?.name || currentUser?.companyName)?.charAt(0)?.toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">{merchantInfo?.name || currentUser?.companyName || '商户'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {merchantInfo?.email || currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowChangePasswordDialog(true)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    修改密码
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveMenu('config')}>
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* 主内容 */}
          <main className="flex-1 overflow-auto">
            <ActiveComponent />
          </main>
        </div>
      </div>
      
      {/* Toast容器 */}
      <ToastContainer />

      {/* 修改密码弹窗 */}
      <Dialog open={showChangePasswordDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
          </DialogHeader>
          <ChangePasswordPage 
            onBack={() => setShowChangePasswordDialog(false)}
            onPasswordChanged={handlePasswordChanged}
            isDialog={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
