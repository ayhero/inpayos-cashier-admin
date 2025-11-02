import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Users, Plus, Edit, Lock, Unlock, Eye, Search, Filter } from 'lucide-react';
import { toast } from '../utils/toast';

// 模拟账户数据
const mockAccounts = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-01-15 14:30:25',
    createdAt: '2023-12-01 10:00:00',
    avatar: null
  },
  {
    id: 2,
    username: 'cashier01',
    name: '收银员001',
    email: 'cashier01@example.com',
    role: 'cashier',
    status: 'active',
    lastLogin: '2024-01-15 13:45:12',
    createdAt: '2024-01-10 09:30:00',
    avatar: null
  },
  {
    id: 3,
    username: 'operator01',
    name: '运营专员',
    email: 'operator01@example.com',
    role: 'operator',
    status: 'inactive',
    lastLogin: '2024-01-12 16:20:45',
    createdAt: '2024-01-05 14:15:00',
    avatar: null
  },
  {
    id: 4,
    username: 'finance01',
    name: '财务专员',
    email: 'finance01@example.com',
    role: 'finance',
    status: 'active',
    lastLogin: '2024-01-15 11:10:30',
    createdAt: '2024-01-08 11:45:00',
    avatar: null
  }
];

const roleNames = {
  admin: '系统管理员',
  cashier: '收银员',
  operator: '运营专员',
  finance: '财务专员'
};

const statusNames = {
  active: '激活',
  inactive: '停用',
  locked: '锁定'
};

export function Account() {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: '',
    name: '',
    email: '',
    role: 'cashier',
    password: '',
    confirmPassword: ''
  });

  // 筛选账户
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || account.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // 获取角色徽章
  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500',
      cashier: 'bg-blue-500',
      operator: 'bg-green-500',
      finance: 'bg-purple-500'
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors] || 'bg-gray-500'}>
        {roleNames[role as keyof typeof roleNames] || role}
      </Badge>
    );
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, className: 'bg-green-500' },
      inactive: { variant: 'secondary' as const, className: 'bg-gray-500' },
      locked: { variant: 'destructive' as const, className: '' }
    };
    
    const config = variants[status as keyof typeof variants] || { variant: 'outline' as const, className: '' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {statusNames[status as keyof typeof statusNames] || status}
      </Badge>
    );
  };

  // 切换账户状态
  const toggleAccountStatus = (id: number) => {
    setAccounts(prev => prev.map(account => 
      account.id === id 
        ? { 
            ...account, 
            status: account.status === 'active' ? 'inactive' : 'active'
          }
        : account
    ));
  };

  // 锁定/解锁账户
  const toggleAccountLock = (id: number) => {
    setAccounts(prev => prev.map(account => 
      account.id === id 
        ? { 
            ...account, 
            status: account.status === 'locked' ? 'active' : 'locked'
          }
        : account
    ));
  };

  // 添加新账户
  const addAccount = () => {
    if (!newAccount.username || !newAccount.name || !newAccount.email || !newAccount.password) {
      toast.warning('请填写完整信息', '用户名、姓名、邮箱和密码都不能为空');
      return;
    }

    if (newAccount.password !== newAccount.confirmPassword) {
      toast.error('两次输入的密码不一致', '请检查密码输入');
      return;
    }

    if (accounts.some(acc => acc.username === newAccount.username)) {
      toast.error('用户名已存在', '请使用不同的用户名');
      return;
    }

    if (accounts.some(acc => acc.email === newAccount.email)) {
      toast.error('邮箱已存在', '请使用不同的邮箱地址');
      return;
    }

    const account = {
      id: Math.max(...accounts.map(acc => acc.id)) + 1,
      username: newAccount.username,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      status: 'active' as const,
      lastLogin: '-',
      createdAt: new Date().toLocaleString('zh-CN'),
      avatar: null
    };

    setAccounts(prev => [...prev, account]);
    toast.success('添加成功', `用户 ${account.name} 已成功创建`);
    setNewAccount({
      username: '',
      name: '',
      email: '',
      role: 'cashier',
      password: '',
      confirmPassword: ''
    });
    setIsAddDialogOpen(false);
  };

  // 获取用户头像缩写
  const getAvatarFallback = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            账户管理
          </h1>
          <p className="text-muted-foreground">管理系统用户账户</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              添加账户
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新账户</DialogTitle>
              <DialogDescription>创建新的系统用户账户</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">用户名 *</label>
                  <Input
                    placeholder="用户名"
                    value={newAccount.username}
                    onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">姓名 *</label>
                  <Input
                    placeholder="真实姓名"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">邮箱 *</label>
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">角色</label>
                <Select value={newAccount.role} onValueChange={(value) => 
                  setNewAccount({ ...newAccount, role: value })
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">收银员</SelectItem>
                    <SelectItem value="operator">运营专员</SelectItem>
                    <SelectItem value="finance">财务专员</SelectItem>
                    <SelectItem value="admin">系统管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码 *</label>
                  <Input
                    type="password"
                    placeholder="密码"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">确认密码 *</label>
                  <Input
                    type="password"
                    placeholder="确认密码"
                    value={newAccount.confirmPassword}
                    onChange={(e) => setNewAccount({ ...newAccount, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={addAccount}>
                添加
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名、姓名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="admin">系统管理员</SelectItem>
                <SelectItem value="cashier">收银员</SelectItem>
                <SelectItem value="operator">运营专员</SelectItem>
                <SelectItem value="finance">财务专员</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">停用</SelectItem>
                <SelectItem value="locked">锁定</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 账户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>账户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后登录</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={account.avatar || undefined} />
                        <AvatarFallback>{getAvatarFallback(account.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{getRoleBadge(account.role)}</TableCell>
                  <TableCell>{getStatusBadge(account.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.lastLogin}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {account.createdAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>账户详情</DialogTitle>
                            <DialogDescription>
                              用户名: {selectedAccount?.username}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAccount && (
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div>
                                <label className="font-medium">用户名</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.username}</p>
                              </div>
                              <div>
                                <label className="font-medium">姓名</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.name}</p>
                              </div>
                              <div>
                                <label className="font-medium">邮箱</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.email}</p>
                              </div>
                              <div>
                                <label className="font-medium">角色</label>
                                <p className="text-sm text-muted-foreground">{getRoleBadge(selectedAccount.role)}</p>
                              </div>
                              <div>
                                <label className="font-medium">状态</label>
                                <p className="text-sm text-muted-foreground">{getStatusBadge(selectedAccount.status)}</p>
                              </div>
                              <div>
                                <label className="font-medium">最后登录</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.lastLogin}</p>
                              </div>
                              <div className="col-span-2">
                                <label className="font-medium">创建时间</label>
                                <p className="text-sm text-muted-foreground">{selectedAccount.createdAt}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleAccountLock(account.id)}
                        className={account.status === 'locked' ? 'text-green-600' : 'text-red-600'}
                      >
                        {account.status === 'locked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <div className="flex items-center">
                        <Switch
                          checked={account.status === 'active'}
                          onCheckedChange={() => toggleAccountStatus(account.id)}
                          disabled={account.status === 'locked'}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}