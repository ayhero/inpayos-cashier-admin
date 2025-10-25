import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, Download, RefreshCw, User } from 'lucide-react';
import { cashierService, Cashier, CashierListParams, CashierStats } from '../services/cashierService';
import { toast } from '../utils/toast';

export function CashierManagement() {
  console.log('CashierManagement component rendering');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
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
        params.status = statusFilter;
      }
      if (regionFilter !== 'all') {
        params.region = regionFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (searchTerm) {
        // 支持按持卡人姓名、邮箱、电话、卡号搜索
        if (searchTerm.includes('@')) {
          params.holder_email = searchTerm;
        } else if (/^\d+$/.test(searchTerm)) {
          params.holder_phone = searchTerm;
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
  }, [pagination.page, statusFilter, regionFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchCashiers();
    fetchStats();
  }, [fetchCashiers, fetchStats]);

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

  const getTypeBadge = (type: string) => {
    const getTypeConfig = (type: string) => {
      switch (type?.toLowerCase()) {
        case 'private':
          return { label: '私户', variant: 'default' as const, className: 'bg-blue-500' };
        case 'corporate':
          return { label: '公户', variant: 'secondary' as const, className: 'bg-purple-500' };
        default:
          return { label: type || '-', variant: 'outline' as const, className: '' };
      }
    };
    
    const { label, variant, className } = getTypeConfig(type);
    return <Badge variant={variant} className={className}>{label}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 查看Cashier详情
  const handleViewDetail = async (cashier: Cashier) => {
    try {
      const response = await cashierService.getCashierDetail({ cashier_id: cashier.cashier_id });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cashier</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
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
                <SelectItem value="active">激活</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
                <SelectItem value="pending">待审核</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有类型</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="cashier">出纳员</SelectItem>
                <SelectItem value="operator">操作员</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="地区" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有地区</SelectItem>
                <SelectItem value="north">北部</SelectItem>
                <SelectItem value="south">南部</SelectItem>
                <SelectItem value="east">东部</SelectItem>
                <SelectItem value="west">西部</SelectItem>
                <SelectItem value="central">中部</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              高级筛选
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出
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
                <TableHead>Cashier ID</TableHead>
                <TableHead>持卡人</TableHead>
                <TableHead>银行</TableHead>
                <TableHead>卡号/UPI</TableHead>
                <TableHead>电话</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : !cashiers || cashiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                (cashiers || []).map((cashier) => (
                  <TableRow key={cashier.cashier_id}>
                    <TableCell className="font-mono text-sm">{cashier.cashier_id}</TableCell>
                    <TableCell className="font-medium">{cashier.holder_name}</TableCell>
                    <TableCell>{cashier.bank_name}</TableCell>
                    <TableCell className="font-mono text-sm">{cashier.card_number}</TableCell>
                    <TableCell>{cashier.holder_phone}</TableCell>
                    <TableCell>{getTypeBadge(cashier.type)}</TableCell>
                    <TableCell>{getStatusBadge(cashier.status)}</TableCell>
                    <TableCell>{formatDateTime(cashier.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
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
                                  <label className="text-sm text-muted-foreground">Cashier ID</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.cashier_id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人姓名</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_name}</p>
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
                                  <label className="text-sm text-muted-foreground">卡号/UPI</label>
                                  <p className="text-base font-semibold font-mono mt-1">{selectedCashier.card_number}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人电话</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_phone}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">持卡人邮箱</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.holder_email}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">类型</label>
                                  <p className="mt-1">{getTypeBadge(selectedCashier.type)}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">国家</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.country || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">省份</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.province || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">城市</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.city || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">币种</label>
                                  <p className="text-base font-semibold mt-1">{selectedCashier.ccy}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">状态</label>
                                  <p className="mt-1">{getStatusBadge(selectedCashier.status)}</p>
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
                                  <p className="text-sm text-muted-foreground">{formatDateTime(selectedCashier.updatedAt)}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}