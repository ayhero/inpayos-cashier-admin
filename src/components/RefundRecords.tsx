import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { 
  transactionService, 
  TransactionInfo, 
  TransactionType, 
  TransactionStatus,
  TransactionQueryParams,
  TodayStats 
} from '../services/transactionService';

export function RefundRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
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

  // 获取今日统计
  const fetchTodayStats = async () => {
    try {
      const response = await transactionService.getTodayStats(TransactionType.REFUND);
      if (response.success) {
        setTodayStats(response.data);
      }
    } catch (error) {
      console.error('获取今日统计失败:', error);
    }
  };

  // 获取退款记录
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: TransactionQueryParams = {
        trxType: TransactionType.REFUND,
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      // 添加筛选条件
      if (statusFilter !== 'all') {
        params.status = statusFilter as TransactionStatus;
      }
      if (methodFilter !== 'all') {
        params.trxMethod = methodFilter;
      }
      if (currencyFilter !== 'all') {
        params.ccy = currencyFilter;
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
      }
    } catch (error) {
      console.error('获取退款记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStats();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [pagination.page, statusFilter, methodFilter, currencyFilter]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRecords();
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.SUCCESS:
        return <Badge variant="default">成功</Badge>;
      case TransactionStatus.PENDING:
        return <Badge variant="secondary">处理中</Badge>;
      case TransactionStatus.FAILED:
        return <Badge variant="destructive">失败</Badge>;
      case TransactionStatus.CANCELLED:
        return <Badge variant="outline">已取消</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    const symbol = currency === 'INR' ? '₹' : currency === 'USDT' ? '' : '$';
    return `${symbol}${num.toLocaleString()} ${currency}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleRetryNotification = async (trxID: string) => {
    try {
      await transactionService.retryNotification(trxID);
      // 可以添加成功提示
      fetchRecords(); // 刷新列表
    } catch (error) {
      console.error('重试通知失败:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>退款</h1>
      </div>

      {/* 今日统计 */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日退款总额</CardTitle>
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
              <CardTitle className="text-sm font-medium">退款笔数</CardTitle>
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
            <div className="flex-1">
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
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="支付方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有方式</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK_CARD">银行卡</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="WALLET">钱包</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="币种" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有币种</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 退款记录列表 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>原交易ID</TableHead>
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
                  <TableCell className="font-mono text-sm">{record.oriTrxID || '-'}</TableCell>
                  <TableCell>
                    {formatCurrency(record.amount, record.ccy)}
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
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>退款交易详情</DialogTitle>
                            <DialogDescription>
                              交易ID: {selectedRecord?.trxID}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRecord && (
                            <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
                              <div>
                                <label className="font-medium">交易ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.trxID}</p>
                              </div>
                              <div>
                                <label className="font-medium">请求ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.reqID}</p>
                              </div>
                              <div>
                                <label className="font-medium">原交易ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.oriTrxID || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">原请求ID</label>
                                <p className="text-sm text-muted-foreground font-mono">{selectedRecord.oriReqID || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">退款金额</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(selectedRecord.amount, selectedRecord.ccy)}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">USD金额</label>
                                <p className="text-sm text-muted-foreground">
                                  ${parseFloat(selectedRecord.usdAmount).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <label className="font-medium">支付方式</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.trxMethod || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">交易状态</label>
                                <p className="text-sm text-muted-foreground">{getStatusBadge(selectedRecord.status)}</p>
                              </div>
                              <div>
                                <label className="font-medium">渠道状态</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.channelStatus}</p>
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
                                <label className="font-medium">渠道代码</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.channelCode || '-'}</p>
                              </div>
                              <div>
                                <label className="font-medium">渠道账户</label>
                                <p className="text-sm text-muted-foreground">{selectedRecord.channelAccount || '-'}</p>
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
                      {record.status === TransactionStatus.FAILED && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRetryNotification(record.trxID)}
                          className="gap-1"
                        >
                          <RefreshCw className="h-4 w-4" />
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
    </div>
  );
}
