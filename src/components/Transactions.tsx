import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Filter, Download } from 'lucide-react';
import { getStatusDisplayName, getStatusColor } from '../constants/status';

const transactions = [
  {
    id: 'TXN001',
    orderId: 'ORD2024001',
    amount: 1250.50,
    currency: 'CNY',
    status: 'success',
    customer: '张三',
    customerEmail: 'zhangsan@example.com',
    paymentMethod: '支付宝',
    createTime: '2024-01-15 14:30:25',
    completeTime: '2024-01-15 14:30:28',
    description: '商品购买'
  },
  {
    id: 'TXN002',
    orderId: 'ORD2024002',
    amount: 890.00,
    currency: 'CNY',
    status: 'pending',
    customer: '李四',
    customerEmail: 'lisi@example.com',
    paymentMethod: '微信支付',
    createTime: '2024-01-15 15:45:12',
    completeTime: null,
    description: '服务费用'
  },
  {
    id: 'TXN003',
    orderId: 'ORD2024003',
    amount: 2100.75,
    currency: 'CNY',
    status: 'success',
    customer: '王五',
    customerEmail: 'wangwu@example.com',
    paymentMethod: '银行卡',
    createTime: '2024-01-15 16:20:45',
    completeTime: '2024-01-15 16:20:50',
    description: '充值'
  },
  {
    id: 'TXN004',
    orderId: 'ORD2024004',
    amount: 675.25,
    currency: 'CNY',
    status: 'failed',
    customer: '赵六',
    customerEmail: 'zhaoliu@example.com',
    paymentMethod: '支付宝',
    createTime: '2024-01-15 17:10:30',
    completeTime: null,
    description: '商品购买'
  },
  {
    id: 'TXN005',
    orderId: 'ORD2024005',
    amount: 1500.00,
    currency: 'CNY',
    status: 'success',
    customer: '孙七',
    customerEmail: 'sunqi@example.com',
    paymentMethod: '微信支付',
    createTime: '2024-01-15 18:25:15',
    completeTime: '2024-01-15 18:25:18',
    description: '会员充值'
  }
];

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>交易记录</h1>
        <p className="text-muted-foreground">查看和管理所有交易记录</p>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号或客户名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="交易状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="success">成功</SelectItem>
                <SelectItem value="pending">处理中</SelectItem>
                <SelectItem value="failed">失败</SelectItem>
              </SelectContent>
            </Select>
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

      {/* 交易列表 */}
      <Card>
        <CardHeader>
          <CardTitle>交易列表</CardTitle>
          <CardDescription>共找到 {filteredTransactions.length} 条交易记录</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>交易ID</TableHead>
                <TableHead>订单号</TableHead>
                <TableHead>客户</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell className="font-mono text-sm">{transaction.orderId}</TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>¥{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{transaction.createTime}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          详情
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>交易详情</DialogTitle>
                          <DialogDescription>
                            交易ID: {selectedTransaction?.id}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedTransaction && (
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                              <label className="font-medium">订单号</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.orderId}</p>
                            </div>
                            <div>
                              <label className="font-medium">交易金额</label>
                              <p className="text-sm text-muted-foreground">¥{selectedTransaction.amount.toFixed(2)}</p>
                            </div>
                            <div>
                              <label className="font-medium">客户姓名</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.customer}</p>
                            </div>
                            <div>
                              <label className="font-medium">客户邮箱</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.customerEmail}</p>
                            </div>
                            <div>
                              <label className="font-medium">支付方式</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.paymentMethod}</p>
                            </div>
                            <div>
                              <label className="font-medium">交易状态</label>
                              <p className="text-sm text-muted-foreground">{getStatusBadge(selectedTransaction.status)}</p>
                            </div>
                            <div>
                              <label className="font-medium">创建时间</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.createTime}</p>
                            </div>
                            <div>
                              <label className="font-medium">完成时间</label>
                              <p className="text-sm text-muted-foreground">
                                {selectedTransaction.completeTime || '未完成'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="font-medium">交易描述</label>
                              <p className="text-sm text-muted-foreground">{selectedTransaction.description}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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