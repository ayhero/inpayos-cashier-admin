import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowUpRight, ArrowDownLeft, Plus, ArrowRightLeft, Minus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

// 账户数据类型定义
interface AccountData {
  account_id: string;
  user_id: string;
  user_type: string;
  currency: string;
  balance?: {
    balance: string;
    available_balance: string;
    frozen_balance: string;
    margin_balance: string;
    reserve_balance: string;
    currency: string;
    updated_at: number;
  };
  status: number;
  version: number;
  last_active_at: number;
  created_at: number;
  updated_at: number;
}

// 流水数据类型定义
interface FundFlowData {
  id: number;
  flow_no: string;
  ori_flow_no: string;
  user_id: string;
  user_type: string;
  account_id: string;
  account_version: number;
  direction: string; // "in" 或 "out"
  trx_id: string;
  trx_type: string;
  ccy: string;
  amount: string;
  before_balance: string;
  after_balance: string;
  remark: string;
  operator_id: string;
  created_at: number;
  updated_at: number;
}

// 流水查询请求参数
interface AccountFlowListRequest {
  flow_no?: string;
  trx_id?: string;
  trx_type?: string;
  direction?: string;
  ccy?: string;
  created_at_start?: number;
  created_at_end?: number;
  page: number;
  size: number;
}

// 货币符号映射
const getCurrencySymbol = (currency: string): string => {
  const symbolMap: { [key: string]: string } = {
    'INR': '₹',
    'USD': '$',
    'USDT': '₮',
    'CNY': '¥',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
  };
  return symbolMap[currency] || currency;
};

// 货币名称映射
const getCurrencyName = (currency: string): string => {
  const nameMap: { [key: string]: string } = {
    'INR': '印度卢比',
    'USD': '美元',
    'USDT': '泰达币',
    'CNY': '人民币',
    'EUR': '欧元',
    'GBP': '英镑',
    'JPY': '日元'
  };
  return nameMap[currency] || currency;
};



export function AccountBalance() {
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [rechargeMethod, setRechargeMethod] = useState('');
  
  // 账户数据状态
  const [accountBalances, setAccountBalances] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 流水数据状态
  const [fundFlows, setFundFlows] = useState<FundFlowData[]>([]);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [flowTotal, setFlowTotal] = useState(0);
  const [flowPage, setFlowPage] = useState(1);
  const [flowPageSize] = useState(20);
  
  // 筛选条件
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateStartFilter, setDateStartFilter] = useState('');
  const [dateEndFilter, setDateEndFilter] = useState('');

  // 获取账户数据
  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.get<AccountData[]>('/account/list');
      
      if (result.code === '0000') {
        setAccountBalances(result.data || []);
        // 如果有账户，设置第一个作为默认选择的币种
        if (result.data && result.data.length > 0) {
          setSelectedCurrency(result.data[0].currency);
        }
      } else {
        throw new Error(result.msg || '获取账户数据失败');
      }
    } catch (err) {
      console.error('获取账户数据失败:', err);
      setError(err instanceof Error ? err.message : '获取账户数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取流水数据
  const fetchFlowData = async (params: Partial<AccountFlowListRequest> = {}) => {
    try {
      setFlowLoading(true);
      setFlowError(null);
      
      const requestParams: AccountFlowListRequest = {
        page: flowPage,
        size: flowPageSize,
        ...params
      };

      // 根据筛选条件添加参数
      if (currencyFilter !== 'all') {
        requestParams.ccy = currencyFilter;
      }
      if (typeFilter !== 'all') {
        requestParams.direction = typeFilter === 'credit' ? 'in' : 'out';
      }
      if (dateStartFilter) {
        const startDate = new Date(dateStartFilter);
        startDate.setHours(0, 0, 0, 0);
        requestParams.created_at_start = startDate.getTime();
      }
      if (dateEndFilter) {
        const endDate = new Date(dateEndFilter);
        endDate.setHours(23, 59, 59, 999);
        requestParams.created_at_end = endDate.getTime();
      }

      const result = await api.post<{
        result_type: string;
        size: number;
        current: number;
        total: number;
        count: number;
        records: FundFlowData[];
        attach: object;
      }>('/account/flow/list', requestParams);
      
      if (result.code === '0000') {
        setFundFlows(result.data.records || []);
        setFlowTotal(result.data.count || 0);
        setFlowPage(result.data.current || 1);
      } else {
        throw new Error(result.msg || '获取流水数据失败');
      }
    } catch (err) {
      console.error('获取流水数据失败:', err);
      setFlowError(err instanceof Error ? err.message : '获取流水数据失败');
    } finally {
      setFlowLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAccountData();
    fetchFlowData();
  }, []);

  // 筛选条件变化时重新获取流水数据
  useEffect(() => {
    fetchFlowData();
  }, [currencyFilter, typeFilter, dateStartFilter, dateEndFilter, flowPage]);

  const handleWithdraw = () => {
    console.log('提现:', { amount: withdrawAmount, currency: selectedCurrency, method: withdrawMethod });
    setShowWithdrawDialog(false);
    setWithdrawAmount('');
    setWithdrawMethod('');
  };

  const handleRecharge = () => {
    console.log('充值:', { amount: rechargeAmount, currency: selectedCurrency, method: rechargeMethod });
    setShowRechargeDialog(false);
    setRechargeAmount('');
    setRechargeMethod('');
  };

  const handleExchange = () => {
    console.log('币种兑换');
    setShowExchangeDialog(false);
  };

  const getTypeIcon = (type: string) => {
    return type === 'credit' ? 
      <ArrowDownLeft className="h-4 w-4 text-green-600" /> : 
      <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const getTypeBadge = (type: string) => {
    return type === 'credit' ? 
      <Badge variant="default" className="bg-green-100 text-green-800">入账</Badge> : 
      <Badge variant="destructive">出账</Badge>;
  };

  // 获取业务类型显示名称
  const getTrxTypeName = (trxType: string) => {
    const typeMap: { [key: string]: string } = {
      'payin': '代收',
      'payout': '代付',
      'deposit': '充值',
      'margin': '保证金',
      'withdraw': '提现',
      'fee': '手续费',
      'adjust': '调账',
      'recharge': '充值',
      'topup': '充值'
    };
    return typeMap[trxType] || trxType;
  };

  // 格式化时间显示
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1>账户余额</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAccountData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 多币种账户卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          // 加载状态
          Array.from({length: 3}).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>加载中...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // 错误状态
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="mb-4">获取账户数据失败: {error}</p>
                <Button onClick={fetchAccountData}>重试</Button>
              </div>
            </CardContent>
          </Card>
        ) : accountBalances.length === 0 ? (
          // 无数据状态
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p>暂无账户数据</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // 正常数据渲染
          accountBalances.map((account, index) => {
            const symbol = getCurrencySymbol(account.currency);
            const isPrimary = index === 0; // 第一个账户作为主账户
            const balance = account.balance;
            
            return (
              <Card key={account.account_id} className={isPrimary ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{account.currency} 账户</span>
                    {isPrimary && <Badge variant="outline">主账户</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="font-medium">可用余额</label>
                    <p className="text-2xl font-bold text-green-600">
                      {symbol}{balance ? parseFloat(balance.available_balance).toLocaleString() : '0'} {account.currency}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">冻结余额</label>
                    <p className="text-lg">
                      {symbol}{balance ? parseFloat(balance.frozen_balance).toLocaleString() : '0'} {account.currency}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">总余额</label>
                    <p className="text-lg font-medium">
                      {symbol}{balance ? parseFloat(balance.balance).toLocaleString() : '0'} {account.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 操作按钮组 - 已隐藏 */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  充值
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>账户充值</DialogTitle>
                  <DialogDescription>向您的账户充值资金</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="rechargeCurrency">币种</Label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountBalances.map((account) => (
                          <SelectItem key={`recharge-${account.account_id}`} value={account.currency}>
                            {account.currency} ({getCurrencyName(account.currency)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rechargeAmount">充值金额</Label>
                    <Input
                      id="rechargeAmount"
                      type="number"
                      placeholder="请输入充值金额"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>充值方式</Label>
                    <Select value={rechargeMethod} onValueChange={setRechargeMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择充值方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">银行转账</SelectItem>
                        <SelectItem value="upi">UPI支付</SelectItem>
                        <SelectItem value="crypto">加密货币</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleRecharge}>确认充值</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Minus className="h-4 w-4" />
                  提现
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>账户提现</DialogTitle>
                  <DialogDescription>从您的账户提现资金</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdrawCurrency">币种</Label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accountBalances.map((account) => (
                          <SelectItem key={`withdraw-${account.account_id}`} value={account.currency}>
                            {account.currency} ({getCurrencyName(account.currency)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdrawAmount">提现金额</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="请输入提现金额"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>提现方式</Label>
                    <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择提现方式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">银行转账</SelectItem>
                        <SelectItem value="upi">UPI支付</SelectItem>
                        <SelectItem value="crypto">加密货币</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleWithdraw}>确认提现</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  币种兑换
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>币种兑换</DialogTitle>
                  <DialogDescription>在不同币种间进行资金兑换</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-600">币种兑换功能正在开发中...</p>
                </div>
                <DialogFooter>
                  <Button onClick={handleExchange}>确认兑换</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card> */}

      {/* 余额变动记录 - 无标题 */}
      <Card>
        <CardContent className="pt-6">
          {/* 筛选条件 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="所有币种" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有币种</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="所有类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="credit">入账</SelectItem>
                  <SelectItem value="debit">出账</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-md border">
                <Label className="text-sm text-gray-600 whitespace-nowrap">从</Label>
                <Input
                  type="date"
                  className="w-[140px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  value={dateStartFilter}
                  onChange={(e) => setDateStartFilter(e.target.value)}
                />
                <Label className="text-sm text-gray-600">至</Label>
                <Input
                  type="date"
                  className="w-[140px] border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  value={dateEndFilter}
                  onChange={(e) => setDateEndFilter(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrencyFilter('all');
                  setTypeFilter('all');
                  setDateStartFilter('');
                  setDateEndFilter('');
                  setFlowPage(1);
                }}
                className="gap-1"
              >
                重置筛选
              </Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>币种</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>余额</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flowLoading ? (
                // 加载状态
                Array.from({length: 5}).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : flowError ? (
                // 错误状态
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-600">
                    <div className="py-8">
                      <p className="mb-4">获取流水数据失败: {flowError}</p>
                      <Button onClick={() => fetchFlowData()} size="sm">重试</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : fundFlows.length === 0 ? (
                // 无数据状态
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    暂无流水记录
                  </TableCell>
                </TableRow>
              ) : (
                // 正常数据渲染
                fundFlows.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.direction === 'in' ? 'credit' : 'debit')}
                        {getTypeBadge(record.direction === 'in' ? 'credit' : 'debit')}
                      </div>
                    </TableCell>
                    <TableCell>{record.ccy}</TableCell>
                    <TableCell className={record.direction === 'in' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {record.direction === 'in' ? '+' : '-'}{parseFloat(record.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{parseFloat(record.after_balance).toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <div>{getTrxTypeName(record.trx_type)}</div>
                        {record.remark && <div className="text-xs text-gray-500">{record.remark}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(record.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* 分页控件 */}
          {!flowLoading && !flowError && fundFlows.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                共 {flowTotal} 条记录，第 {flowPage} 页，共 {Math.ceil(flowTotal / flowPageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (flowPage > 1) {
                      setFlowPage(flowPage - 1);
                    }
                  }}
                  disabled={flowPage <= 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (flowPage < Math.ceil(flowTotal / flowPageSize)) {
                      setFlowPage(flowPage + 1);
                    }
                  }}
                  disabled={flowPage >= Math.ceil(flowTotal / flowPageSize)}
                  className="gap-1"
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchFlowData()}
                  disabled={flowLoading}
                  className="gap-1"
                >
                  <RefreshCw className={`h-4 w-4 ${flowLoading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
