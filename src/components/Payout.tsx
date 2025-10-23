import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, Download } from 'lucide-react';
import { 
  transactionService, 
  TransactionInfo, 
  TransactionType, 
  TransactionStatus,
  TransactionQueryParams,
  TodayStats 
} from '../services/transactionService';
import { getStatusDisplayName, getStatusColor } from '../constants/status';
import { toast } from '../utils/toast';

export function PayoutRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<TransactionInfo | null>(null);
  const [records, setRecords] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });

  // 确认交易相关状态
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmingRecord, setConfirmingRecord] = useState<TransactionInfo | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [secondConfirmOpen, setSecondConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string>('');

  // 获取今日统计
  const fetchTodayStats = async () => {
    try {
      const response = await transactionService.getTodayStats(TransactionType.PAYOUT);
      if (response.success) {
        setTodayStats(response.data);
      } else {
        // API调用成功但返回失败时，显示默认数据
        setTodayStats({
          totalAmount: '0.00',
          totalCount: 0,
          successCount: 0,
          successRate: 0,
          pendingCount: 0
        });
      }
    } catch (error) {
      console.error('获取今日统计失败:', error);
      // 网络错误时也显示默认数据
      setTodayStats({
        totalAmount: '0.00',
        totalCount: 0,
        successCount: 0,
        successRate: 0,
        pendingCount: 0
      });
    }
  };

  // 获取代付记录
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: TransactionQueryParams = {
        trxType: TransactionType.PAYOUT,
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.status = statusFilter as TransactionStatus;
      }
      if (searchTerm) {
        params.trxID = searchTerm;
      }

      const response = await transactionService.getTransactions(params);
      if (response.success) {
        setRecords(response.data.items);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          totalPages: response.data.totalPages
        }));
      } else {
        // API调用失败时清空记录和分页信息
        setRecords([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0
        }));
      }
    } catch (error) {
      console.error('获取代付记录失败:', error);
      // 发生异常时也清空数据
      setRecords([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [pagination.page]);

  // 当筛选条件变化时，重置到第一页并重新查询
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    // 由于分页变化会触发上面的useEffect，所以不需要直接调用fetchRecords
  }, [statusFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const displayName = getStatusDisplayName(status);
    const color = getStatusColor(status);
    
    const getVariantAndClass = (color: string) => {
      switch (color) {
        case 'success':
          return { variant: 'default' as const, className: 'bg-green-500' };
        case 'error':
          return { variant: 'destructive' as const, className: '' };
        case 'warning':
          return { variant: 'secondary' as const, className: 'bg-yellow-500' };
        case 'processing':
          return { variant: 'secondary' as const, className: 'bg-blue-500' };
        case 'info':
          return { variant: 'outline' as const, className: '' };
        default:
          return { variant: 'outline' as const, className: '' };
      }
    };
    
    const { variant, className } = getVariantAndClass(color);
    return <Badge variant={variant} className={className}>{displayName}</Badge>;
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    const symbol = currency === 'INR' ? '₹' : currency === 'USDT' ? '' : '$';
    return `${symbol}${num.toLocaleString()} ${currency}`;
  };

  // 模态窗专用的金额格式化函数，格式为"币种 金额"
  const formatCurrencyForModal = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 打开确认交易对话框
  const handleConfirmTransaction = (record: TransactionInfo) => {
    setConfirmingRecord(record);
    setReferenceId('');
    setConfirmDialogOpen(true);
  };

  // 第一步确认：输入reference_id
  const handleFirstConfirm = () => {
    if (!referenceId.trim()) {
      toast.warning('请输入流水号', '流水号不能为空');
      return;
    }
    setConfirmDialogOpen(false);
    setSecondConfirmOpen(true);
  };

  // 最终确认并提交
  const handleFinalConfirm = async () => {
    if (!confirmingRecord || !referenceId.trim()) {
      return;
    }

    setConfirming(true);
    setConfirmError('');
    try {
      const response = await transactionService.confirmTransaction({
        trxID: confirmingRecord.trxID,
        referenceID: referenceId.trim(),
        trxType: TransactionType.PAYOUT
      });

      if (response.success) {
        toast.success('交易确认成功', `交易 ${confirmingRecord.trxID} 已成功确认`);
        fetchRecords(); // 刷新列表
        // 成功后关闭弹窗
        setSecondConfirmOpen(false);
        setConfirmingRecord(null);
        setReferenceId('');
        setConfirmError('');
      } else {
        // 失败时显示错误信息，但不关闭弹窗
        setConfirmError(response.msg || '确认失败');
      }
    } catch (error: any) {
      console.error('确认交易失败:', error);
      setConfirmError('确认失败，请稍后重试');
    } finally {
      setConfirming(false);
    }
  };

  // 取消确认
  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setSecondConfirmOpen(false);
    setConfirmingRecord(null);
    setReferenceId('');
    setConfirmError('');
  };



  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1>代付</h1>
      </div>

      {/* 今日统计 */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日代付总额</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">₹</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{parseInt(todayStats.totalAmount).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{todayStats.totalCount}笔交易</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">%</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">{todayStats.successCount}/{todayStats.totalCount} 成功</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">代付笔数</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">#</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.totalCount}</div>
              <p className="text-xs text-muted-foreground">今日交易</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待处理</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">#</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">需要关注</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:flex-initial md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索交易ID..."
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
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="pending">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
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

      {/* 代付记录列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>完成时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.trxID}>
                  <TableCell className="font-mono text-sm">{record.trxID}</TableCell>
                  <TableCell>
                    {formatCurrencyForModal(record.amount, record.ccy)}
                  </TableCell>
                  <TableCell>{record.trxMethod || '-'}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                  <TableCell>{record.completedAt ? formatDateTime(record.completedAt) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRecord(record)}
                          >
                            详情
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
                          <DialogHeader>
                            <DialogTitle>代付交易详情</DialogTitle>
                            <DialogDescription>
                              交易ID: {selectedRecord?.trxID}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRecord && (
                            <div className="grid grid-cols-2 gap-4 py-4 max-h-[500px] overflow-y-auto">
                              <div>
                                <label className="font-medium">交易ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.trxID}</p>
                              </div>
                              <div>
                                <label className="font-medium">交易金额</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrencyForModal(selectedRecord.amount, selectedRecord.ccy)}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">支付方式</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.trxMethod || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">交易模式</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.trxMode || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">交易状态</label>
                                <p className="text-sm text-muted-foreground">{getStatusBadge(selectedRecord.status)}</p>
                              </div>
                              <div>
                                <label className="font-medium">响应码</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.resCode || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">响应消息</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.resMsg || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">失败原因</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.reason || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">渠道交易ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.channelTrxID || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">手续费</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedRecord.feeAmount ? formatCurrency(selectedRecord.feeAmount, selectedRecord.feeCcy || selectedRecord.ccy) : '-'}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">创建时间</label>
                                <p className="text-sm text-muted-foreground">{formatDateTime(selectedRecord.createdAt)}</p>
                              </div>
                              <div>
                                <label className="font-medium">更新时间</label>
                                <p className="text-sm text-muted-foreground">{formatDateTime(selectedRecord.updatedAt)}</p>
                              </div>
                              <div>
                                <label className="font-medium">完成时间</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedRecord.completedAt ? formatDateTime(selectedRecord.completedAt) : '-'}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">流水号</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.flowNo || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">国家</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.country || '-'}</p>
                              </div>
                              <div className="col-span-2">
                                <label className="font-medium">备注</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.remark || '-'}</p>
                              </div>
                              {selectedRecord.detail && (
                                <div className="col-span-2">
                                  <label className="font-medium">详细信息</label>
                                  <pre className="text-xs text-muted-foreground bg-muted p-2 rounded mt-1 max-h-32 overflow-y-auto">
                                    {JSON.stringify(JSON.parse(selectedRecord.detail), null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      {record.status === TransactionStatus.PENDING && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleConfirmTransaction(record)}
                          className="gap-1"
                        >
                          确认
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 分页 */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              显示第 {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
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

      {/* 确认交易对话框 - 第一步：输入参考ID */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认交易</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">交易ID:</span>
                <span className="font-mono">{confirmingRecord?.trxID}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">交易金额:</span>
                <span>{confirmingRecord && formatCurrencyForModal(confirmingRecord.amount, confirmingRecord.ccy)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">支付方式:</span>
                <span>{confirmingRecord?.trxMethod || '-'}</span>
              </div>
            </div>
            <Input
              placeholder="请输入流水号"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFirstConfirm()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelConfirm}>
              取消
            </Button>
            <Button onClick={handleFirstConfirm}>
              下一步
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 确认交易对话框 - 第二步：最终确认 */}
      <Dialog open={secondConfirmOpen} onOpenChange={setSecondConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提交</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {confirmError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {confirmError}
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">交易ID:</span>
                <span className="font-mono">{confirmingRecord?.trxID}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">交易金额:</span>
                <span>{confirmingRecord && formatCurrencyForModal(confirmingRecord.amount, confirmingRecord.ccy)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">支付方式:</span>
                <span>{confirmingRecord?.trxMethod || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">流水号:</span>
                <span className="font-mono">{referenceId}</span>
              </div>
            </div>
            <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              ⚠️ 确认后交易状态将会更新，此操作不可撤销！
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancelConfirm} disabled={confirming}>
              取消
            </Button>
            <Button onClick={handleFinalConfirm} disabled={confirming}>
              {confirming ? '确认中...' : '确认提交'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
