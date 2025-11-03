import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Filter, Download, RefreshCw, User, Plus, Edit } from 'lucide-react';
import { cashierService, Cashier, CashierListParams, CashierStats, CreateCashierParams, UpdateCashierParams } from '../services/cashierService';
import { toast } from '../utils/toast';

export function CashierManagement() {
  console.log('CashierManagement component rendering');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [stats, setStats] = useState<CashierStats>({
    total: 0,
    active: 0,
    online: 0,
    suspended: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  });

  // 新增/编辑对话框状态
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [formData, setFormData] = useState<CreateCashierParams>({
    user_id: '',
    app_type: 'freecharge',
    app_account: '',
    upi: '',
    provider: '',
    bank_code: '',
    bank_name: '',
    card_number: '',
    holder_name: '',
    holder_phone: '',
    holder_email: '',
    remark: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // 获取出纳员统计
  const fetchStats = useCallback(async () => {
    try {
      const response = await cashierService.getCashierStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  // 获取出纳员列表
  const fetchCashiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CashierListParams = {
        page: pagination.page,
        size: pagination.size
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.online_status = statusFilter;
      }
      if (searchTerm) {
        // 支持按持卡人姓名、手机、UPI、账户ID搜索
        if (searchTerm.includes('@')) {
          params.upi = searchTerm;
        } else if (/^\d+$/.test(searchTerm) && searchTerm.length >= 10) {
          params.holder_phone = searchTerm;
        } else if (searchTerm.startsWith('C') || searchTerm.startsWith('U')) {
          params.account_id = searchTerm;
        } else {
          params.holder_name = searchTerm;
        }
      }

      const response = await cashierService.getCashierList(params);
      if (response.success) {
        setCashiers(response.data.list);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: Math.ceil(response.data.total / prev.size)
        }));
      } else {
        // API调用失败时清空记录和分页信息
        setCashiers([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
        setError(response.msg || '获取数据失败');
      }
    } catch (error: any) {
      console.error('获取出纳员列表失败:', error);
      // 发生异常时也清空数据
      setCashiers([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, searchTerm]);

  useEffect(() => {
    fetchCashiers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, searchTerm]);

  const handleSearch = () => {
    // fetchCashiers 会自动触发，因为 searchTerm 是依赖项
  };

  const handleRefresh = () => {
    fetchCashiers();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const getStatusConfig = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'active':
        case '1':
          return { label: '激活', variant: 'default' as const, className: 'bg-green-500' };
        case 'inactive':
        case '0':
          return { label: '未激活', variant: 'secondary' as const, className: 'bg-gray-500' };
        case 'suspended':
        case '2':
          return { label: '暂停', variant: 'destructive' as const, className: '' };
        case 'pending':
        case '3':
          return { label: '待审核', variant: 'secondary' as const, className: 'bg-yellow-500' };
        default:
          return { label: status || '-', variant: 'outline' as const, className: '' };
      }
    };
    
    const { label, variant, className } = getStatusConfig(status);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const getOnlineStatusBadge = (onlineStatus: string) => {
    const getOnlineStatusConfig = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'online':
          return { label: '在线', variant: 'default' as const, className: 'bg-green-500' };
        case 'offline':
          return { label: '离线', variant: 'secondary' as const, className: 'bg-gray-500' };
        case 'busy':
          return { label: '忙碌', variant: 'secondary' as const, className: 'bg-yellow-500' };
        case 'locked':
          return { label: '锁定', variant: 'destructive' as const, className: '' };
        default:
          return { label: status || '-', variant: 'outline' as const, className: '' };
      }
    };
    
    const { label, variant, className } = getOnlineStatusConfig(onlineStatus);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 查看Cashier详情
  const handleViewDetail = async (cashier: Cashier) => {
    try {
      const response = await cashierService.getCashierDetail({ 
        account_id: cashier.account_id 
      });
      if (response.success) {
        setSelectedCashier(response.data);
      } else {
        toast.error('获取Cashier详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取Cashier详情失败:', error);
      toast.error('获取Cashier详情失败', '网络错误，请稍后重试');
    }
  };

  // 打开新增对话框
  const handleOpenCreate = () => {
    setFormData({
      user_id: '',
      app_type: 'freecharge',
      app_account: '',
      upi: '',
      provider: '',
      bank_code: '',
      bank_name: '',
      card_number: '',
      holder_name: '',
      holder_phone: '',
      holder_email: '',
      remark: ''
    });
    setShowCreateDialog(true);
  };

  // 打开编辑对话框
  const handleOpenEdit = (cashier: Cashier) => {
    setEditingCashier(cashier);
    setFormData({
      user_id: cashier.user_id,
      app_type: cashier.app_type,
      app_account: cashier.app_account,
      upi: cashier.upi || '',
      provider: cashier.provider || '',
      bank_code: cashier.bank_code || '',
      bank_name: cashier.bank_name || '',
      card_number: cashier.card_number || '',
      holder_name: cashier.holder_name,
      holder_phone: cashier.holder_phone,
      holder_email: cashier.holder_email || '',
      remark: cashier.remark || ''
    });
    setShowEditDialog(true);
  };

  // 创建Cashier
  const handleCreate = async () => {
    if (!formData.user_id || !formData.app_type || !formData.app_account || 
        !formData.holder_name || !formData.holder_phone) {
      toast.error('表单验证失败', '请填写所有必填字段');
      return;
    }

    setSubmitting(true);
    try {
      const response = await cashierService.createCashier(formData);
      if (response.success) {
        toast.success('创建成功', 'Cashier已成功创建');
        setShowCreateDialog(false);
        fetchCashiers();
        fetchStats();
      } else {
        toast.error('创建失败', response.msg);
      }
    } catch (error: any) {
      console.error('创建Cashier失败:', error);
      toast.error('创建失败', error.message || '网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 更新Cashier
  const handleUpdate = async () => {
    if (!editingCashier) return;

    setSubmitting(true);
    try {
      const updateParams: UpdateCashierParams = {
        account_id: editingCashier.account_id,
        ...formData
      };
      const response = await cashierService.updateCashier(updateParams);
      if (response.success) {
        toast.success('更新成功', 'Cashier信息已更新');
        setShowEditDialog(false);
        fetchCashiers();
        fetchStats();
      } else {
        toast.error('更新失败', response.msg);
      }
    } catch (error: any) {
      console.error('更新Cashier失败:', error);
      toast.error('更新失败', error.message || '网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cashier</h1>
        <div className="flex gap-2">
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            新增Cashier
          </Button>
          <Button onClick={handleRefresh} className="gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">错误: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">可用</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.online}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">暂停</CardTitle>
            <User className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.suspended}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名/邮箱/电话..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="online">在线</SelectItem>
                <SelectItem value="offline">离线</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 出纳员列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>APP账号</TableHead>
                <TableHead>持卡人</TableHead>
                <TableHead>银行</TableHead>
                <TableHead>UPI/卡号</TableHead>
                <TableHead>电话</TableHead>
                <TableHead>账户状态</TableHead>
                <TableHead>在线状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : !cashiers || cashiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                (cashiers || []).map((cashier) => (
                  <TableRow key={cashier.account_id}>
                    <TableCell className="font-mono text-xs">{cashier.account_id}</TableCell>
                    <TableCell className="font-mono text-xs">{cashier.user_id}</TableCell>
                    <TableCell className="font-mono text-xs">{cashier.app_account}</TableCell>
                    <TableCell className="font-medium">{cashier.holder_name}</TableCell>
                    <TableCell>{cashier.bank_name}</TableCell>
                    <TableCell className="font-mono text-sm">{cashier.upi || cashier.card_number}</TableCell>
                    <TableCell>{cashier.holder_phone}</TableCell>
                    <TableCell>{getStatusBadge(cashier.status)}</TableCell>
                    <TableCell>{getOnlineStatusBadge(cashier.online_status)}</TableCell>
                    <TableCell>{formatDateTime(cashier.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenEdit(cashier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetail(cashier)}
                            >
                              详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
                            <DialogHeader>
                              <DialogTitle>Cashier详情</DialogTitle>
                            </DialogHeader>
                            {selectedCashier && (
                              <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
                                <div>
                                  <label className="text-sm text-muted-foreground">Account ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.account_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">User ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.user_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">APP类型</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.app_type}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">APP账号</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.app_account}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">UPI ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.upi || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">UPI提供商</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.provider || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行代码</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.bank_code}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行名称</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.bank_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">银行卡号</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.card_number || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人姓名</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_name}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人电话</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_phone}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人邮箱</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_email || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">账户状态</label>
                                  <p className="mt-1">{getStatusBadge(selectedCashier.status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">在线状态</label>
                                  <p className="mt-1">{getOnlineStatusBadge(selectedCashier.online_status)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">代收状态</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.payin_status}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">代付状态</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.payout_status}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">备注</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.remark || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">创建时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.created_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">更新时间</label>
                                  <p className="text-base font-semibold mt-1">{formatDateTime(selectedCashier.updated_at)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">绑定时间</label>
                                  <p className="text-base font-semibold mt-1">{cashier.bound_at ? formatDateTime(selectedCashier.bound_at) : '-'}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {!loading && cashiers && cashiers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                显示第 {((pagination.page - 1) * pagination.size) + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} 条，共 {pagination.total} 条
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1 || loading}
                >
                  上一页
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新增Cashier对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增Cashier账户</DialogTitle>
            <DialogDescription>
              填写以下信息创建新的Cashier账户
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-user-id">User ID *</Label>
              <Input
                id="create-user-id"
                value={formData.user_id}
                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                placeholder="收银员用户ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-app-type">APP类型 *</Label>
              <Select value={formData.app_type} onValueChange={(value) => setFormData({...formData, app_type: value})}>
                <SelectTrigger id="create-app-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freecharge">Freecharge</SelectItem>
                  <SelectItem value="paytm">Paytm</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="gpay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="create-app-account">APP账号ID *</Label>
              <Input
                id="create-app-account"
                value={formData.app_account}
                onChange={(e) => setFormData({...formData, app_account: e.target.value})}
                placeholder="绑定的APP账号ID"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="create-upi">UPI ID</Label>
              <Input
                id="create-upi"
                value={formData.upi}
                onChange={(e) => setFormData({...formData, upi: e.target.value})}
                placeholder="如: 9876543001@paytm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-provider">UPI提供商</Label>
              <Input
                id="create-provider"
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                placeholder="如: Paytm, PhonePe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-bank-code">银行代码</Label>
              <Input
                id="create-bank-code"
                value={formData.bank_code}
                onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
                placeholder="如: UPI, HDFC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-bank-name">银行名称</Label>
              <Input
                id="create-bank-name"
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                placeholder="如: SBI UPI, HDFC Bank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-card-number">银行卡号</Label>
              <Input
                id="create-card-number"
                value={formData.card_number}
                onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                placeholder="银行卡号（如有）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-holder-name">持卡人姓名 *</Label>
              <Input
                id="create-holder-name"
                value={formData.holder_name}
                onChange={(e) => setFormData({...formData, holder_name: e.target.value})}
                placeholder="持卡人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-holder-phone">手机号 *</Label>
              <Input
                id="create-holder-phone"
                value={formData.holder_phone}
                onChange={(e) => setFormData({...formData, holder_phone: e.target.value})}
                placeholder="+91-9876543001"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="create-holder-email">邮箱</Label>
              <Input
                id="create-holder-email"
                type="email"
                value={formData.holder_email}
                onChange={(e) => setFormData({...formData, holder_email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="create-remark">备注</Label>
              <Input
                id="create-remark"
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                placeholder="备注信息"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? '创建中...' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑Cashier对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑Cashier账户</DialogTitle>
            <DialogDescription>
              修改Cashier账户信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-user-id">User ID</Label>
              <Input
                id="edit-user-id"
                value={formData.user_id}
                onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                placeholder="收银员用户ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-type">APP类型</Label>
              <Select value={formData.app_type} onValueChange={(value) => setFormData({...formData, app_type: value})}>
                <SelectTrigger id="edit-app-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freecharge">Freecharge</SelectItem>
                  <SelectItem value="paytm">Paytm</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="gpay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-app-account">APP账号ID</Label>
              <Input
                id="edit-app-account"
                value={formData.app_account}
                onChange={(e) => setFormData({...formData, app_account: e.target.value})}
                placeholder="绑定的APP账号ID"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-upi">UPI ID</Label>
              <Input
                id="edit-upi"
                value={formData.upi}
                onChange={(e) => setFormData({...formData, upi: e.target.value})}
                placeholder="如: 9876543001@paytm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-provider">UPI提供商</Label>
              <Input
                id="edit-provider"
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                placeholder="如: Paytm, PhonePe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bank-code">银行代码</Label>
              <Input
                id="edit-bank-code"
                value={formData.bank_code}
                onChange={(e) => setFormData({...formData, bank_code: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bank-name">银行名称</Label>
              <Input
                id="edit-bank-name"
                value={formData.bank_name}
                onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-card-number">银行卡号</Label>
              <Input
                id="edit-card-number"
                value={formData.card_number}
                onChange={(e) => setFormData({...formData, card_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-holder-name">持卡人姓名</Label>
              <Input
                id="edit-holder-name"
                value={formData.holder_name}
                onChange={(e) => setFormData({...formData, holder_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-holder-phone">手机号</Label>
              <Input
                id="edit-holder-phone"
                value={formData.holder_phone}
                onChange={(e) => setFormData({...formData, holder_phone: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-holder-email">邮箱</Label>
              <Input
                id="edit-holder-email"
                type="email"
                value={formData.holder_email}
                onChange={(e) => setFormData({...formData, holder_email: e.target.value})}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-remark">备注</Label>
              <Input
                id="edit-remark"
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={submitting}>
              {submitting ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}