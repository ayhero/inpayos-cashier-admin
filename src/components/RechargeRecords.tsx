import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, Download, Plus } from 'lucide-react';

const rechargeRecords = [
  {
    id: 'RCH001',
    uid: 'user_12345',
    amount: 50000,
    currency: 'INR',
    rechargeMethod: '银行转账',
    status: 'success',
    createTime: '2024-01-15 09:30:25',
    completeTime: '2024-01-15 09:45:30',
    fee: 0,
    actualAmount: 50000,
    bankRef: 'TXN123456789',
    orderId: 'RCH_123456'
  },
  {
    id: 'RCH002',
    uid: 'user_67890',
    amount: 1000,
    currency: 'USDT',
    rechargeMethod: 'USDT转账',
    status: 'pending',
    createTime: '2024-01-15 10:45:12',
    completeTime: null,
    fee: 5,
    actualAmount: 995,
    walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    txHash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    orderId: 'RCH_123457'
  },
  {
    id: 'RCH003',
    uid: 'user_54321',
    amount: 25000,
    currency: 'INR',
    rechargeMethod: 'UPI',
    status: 'success',
    createTime: '2024-01-15 11:20:45',
    completeTime: '2024-01-15 11:21:30',
    fee: 0,
    actualAmount: 25000,
    upiRef: 'UPI123456789',
    orderId: 'RCH_123458'
  }
];

export function RechargeRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [, setSelectedRecord] = useState<any>(null);
  const [showManualRecharge, setShowManualRecharge] = useState(false);

  const filteredRecords = rechargeRecords.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || record.rechargeMethod === methodFilter;
    const matchesCurrency = currencyFilter === 'all' || record.currency === currencyFilter;
    return matchesSearch && matchesStatus && matchesMethod && matchesCurrency;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">成功</Badge>;
      case 'pending':
        return <Badge variant="secondary">处理中</Badge>;
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const handleManualRecharge = () => {
    // 模拟手动充值
    console.log('手动充值');
    setShowManualRecharge(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>充值记录</h1>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日充值总额</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,25,000</div>
            <p className="text-xs text-muted-foreground">8笔交易</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">%</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">7/8 成功</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">充值笔数</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">#</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">今日交易</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">#</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">需要关注</p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>筛选条件</CardTitle>
            <Dialog open={showManualRecharge} onOpenChange={setShowManualRecharge}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  手动充值
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>手动充值</DialogTitle>
                  <DialogDescription>为用户手动添加充值记录</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="font-medium">用户ID</label>
                    <Input placeholder="输入用户ID" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">充值金额</label>
                    <Input type="number" placeholder="输入充值金额" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium">币种</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择币种" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowManualRecharge(false)}>
                    取消
                  </Button>
                  <Button onClick={handleManualRecharge}>确认充值</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索交易ID、用户ID或订单号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="充值方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有方式</SelectItem>
                <SelectItem value="银行转账">银行转账</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="USDT转账">USDT转账</SelectItem>
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
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              导出
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 充值记录列表 */}
      <Card>
        <CardHeader>
          <CardTitle>充值记录</CardTitle>
          <CardDescription>共找到 {filteredRecords.length} 条充值记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>用户ID</TableHead>
                <TableHead>订单号</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>充值方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm">{record.id}</TableCell>
                  <TableCell className="font-mono text-sm">{record.uid}</TableCell>
                  <TableCell className="font-mono text-sm">{record.orderId}</TableCell>
                  <TableCell>
                    {record.currency === 'INR' ? '₹' : record.currency === 'USDT' ? '' : '$'}
                    {record.amount.toLocaleString()} {record.currency}
                  </TableCell>
                  <TableCell>{record.rechargeMethod}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{record.createTime}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                    >
                      详情
                    </Button>
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
