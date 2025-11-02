import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, Eye, Calendar, TrendingUp } from 'lucide-react';

const settlementRecords = [
  {
    id: 'SET001',
    period: '2024-01-08 至 2024-01-14',
    periodType: 'weekly',
    status: 'completed',
    createTime: '2024-01-15 00:00:00',
    settleTime: '2024-01-15 09:30:25',
    totalFeeAmount: 1850.50,
    currency: 'INR',
    transactionCount: 45,
    accountFlowId: 'BAL_SET001',
    transactions: [
      { id: 'COL001', type: 'collection', amount: 15000, feeAmount: 75, feeRate: 0.5 },
      { id: 'COL002', type: 'collection', amount: 25000, feeAmount: 250, feeRate: 1.0 },
      { id: 'PAY001', type: 'payout', amount: 25000, feeAmount: 50, feeRate: 0.2 },
      // 更多交易记录...
    ]
  },
  {
    id: 'SET002', 
    period: '2024-01-01 至 2024-01-07',
    periodType: 'weekly',
    status: 'completed',
    createTime: '2024-01-08 00:00:00',
    settleTime: '2024-01-08 09:15:30',
    totalFeeAmount: 1650.75,
    currency: 'INR',
    transactionCount: 38,
    accountFlowId: 'BAL_SET002',
    transactions: [
      { id: 'COL003', type: 'collection', amount: 12000, feeAmount: 60, feeRate: 0.5 },
      { id: 'COL004', type: 'collection', amount: 18000, feeAmount: 180, feeRate: 1.0 },
      { id: 'PAY002', type: 'payout', amount: 15000, feeAmount: 30, feeRate: 0.2 },
    ]
  },
  {
    id: 'SET003',
    period: '2024-01-15 至 2024-01-21', 
    periodType: 'weekly',
    status: 'pending',
    createTime: '2024-01-22 00:00:00',
    settleTime: null,
    totalFeeAmount: 2120.25,
    currency: 'INR',
    transactionCount: 52,
    accountFlowId: null,
    transactions: [
      { id: 'COL005', type: 'collection', amount: 35000, feeAmount: 350, feeRate: 1.0 },
      { id: 'COL006', type: 'collection', amount: 28000, feeAmount: 140, feeRate: 0.5 },
      { id: 'PAY003', type: 'payout', amount: 20000, feeAmount: 40, feeRate: 0.2 },
    ]
  },
  {
    id: 'SET004',
    period: '2023-12',
    periodType: 'monthly',
    status: 'completed',
    createTime: '2024-01-01 00:00:00',
    settleTime: '2024-01-01 10:00:00',
    totalFeeAmount: 8950.80,
    currency: 'INR',
    transactionCount: 185,
    accountFlowId: 'BAL_SET004',
    transactions: [
      { id: 'COL_DEC_001', type: 'collection', amount: 150000, feeAmount: 1500, feeRate: 1.0 },
      { id: 'COL_DEC_002', type: 'collection', amount: 85000, feeAmount: 425, feeRate: 0.5 },
      { id: 'PAY_DEC_001', type: 'payout', amount: 120000, feeAmount: 240, feeRate: 0.2 },
    ]
  }
];

export function SettlementRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');

  const filteredRecords = settlementRecords.filter(record => {
    const matchesSearch = record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || record.periodType === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">已结算</Badge>;
      case 'pending':
        return <Badge variant="secondary">待结算</Badge>;
      case 'processing':
        return <Badge variant="outline">结算中</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getPeriodTypeBadge = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Badge variant="outline">周结算</Badge>;
      case 'monthly':
        return <Badge variant="outline">月结算</Badge>;
      case 'daily':
        return <Badge variant="outline">日结算</Badge>;
      default:
        return <Badge variant="outline">其他</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'collection':
        return <Badge variant="default">代收</Badge>;
      case 'payout':
        return <Badge variant="secondary">代付</Badge>;
      default:
        return <Badge variant="outline">其他</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>结算</h1>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周结算</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,120.25</div>
            <p className="text-xs text-muted-foreground">52笔交易</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">上周结算</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,850.50</div>
            <p className="text-xs text-muted-foreground">45笔交易</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月度结算</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹8,450.75</div>
            <p className="text-xs text-muted-foreground">220笔交易</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待结算</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">#</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">笔交易</p>
          </CardContent>  
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">结算列表</TabsTrigger>
          <TabsTrigger value="analytics">结算分析</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
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
                      placeholder="搜索结算ID或结算周期..."
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
                    <SelectItem value="completed">已结算</SelectItem>
                    <SelectItem value="pending">待结算</SelectItem>
                    <SelectItem value="processing">结算中</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full md:w-32">
                    <SelectValue placeholder="周期" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有周期</SelectItem>
                    <SelectItem value="weekly">周结算</SelectItem>
                    <SelectItem value="monthly">月结算</SelectItem>
                    <SelectItem value="daily">日结算</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 结算统计 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本月结算总额</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">₹</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹12,571.30</div>
                <p className="text-xs text-muted-foreground">4个结算周期</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均手续费率</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">%</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.68%</div>
                <p className="text-xs text-muted-foreground">较上月持平</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">结算交易数</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">#</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">320</div>
                <p className="text-xs text-muted-foreground">成功交易</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">待结算</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">₹</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹2,120.25</div>
                <p className="text-xs text-muted-foreground">52笔交易</p>
              </CardContent>
            </Card>
          </div>

          {/* 结算记录列表 */}
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>结算ID</TableHead>
                    <TableHead>结算周期</TableHead>
                    <TableHead>周期类型</TableHead>
                    <TableHead>交易数量</TableHead>
                    <TableHead>结算金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>结算时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">{record.id}</TableCell>
                      <TableCell>{record.period}</TableCell>
                      <TableCell>{getPeriodTypeBadge(record.periodType)}</TableCell>
                      <TableCell>{record.transactionCount}</TableCell>
                      <TableCell>₹{record.totalFeeAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.settleTime || '未结算'}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>结算详情</DialogTitle>
                              <DialogDescription>
                                结算ID: {selectedRecord?.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRecord && (
                              <div className="space-y-6">
                                {/* 结算基本信息 */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">结算周期</label>
                                    <p className="text-sm text-muted-foreground">{selectedRecord.period}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">周期类型</label>
                                    <p className="text-sm text-muted-foreground">{getPeriodTypeBadge(selectedRecord.periodType)}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">交易数量</label>
                                    <p className="text-sm text-muted-foreground">{selectedRecord.transactionCount} 笔</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">结算总额</label>
                                    <p className="text-sm text-muted-foreground">₹{selectedRecord.totalFeeAmount.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">结算状态</label>
                                    <p className="text-sm text-muted-foreground">{getStatusBadge(selectedRecord.status)}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">账户流水ID</label>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedRecord.accountFlowId || '未生成'}</p>
                                  </div>
                                </div>

                                {/* 涉及的交易记录 */}
                                <div>
                                  <h4 className="font-medium mb-3">涉及的交易记录</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>交易ID</TableHead>
                                        <TableHead>类型</TableHead>
                                        <TableHead>交易金额</TableHead>
                                        <TableHead>手续费率</TableHead>
                                        <TableHead>手续费金额</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedRecord.transactions.slice(0, 10).map((transaction: any) => (
                                        <TableRow key={transaction.id}>
                                          <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                                          <TableCell>{getTransactionTypeBadge(transaction.type)}</TableCell>
                                          <TableCell>₹{transaction.amount.toLocaleString()}</TableCell>
                                          <TableCell>{transaction.feeRate}%</TableCell>
                                          <TableCell>₹{transaction.feeAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                  {selectedRecord.transactions.length > 10 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                      显示前10条，共{selectedRecord.transactions.length}条交易记录
                                    </p>
                                  )}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 结算趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  结算趋势
                </CardTitle>
                <CardDescription>最近几个周期的结算金额变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  结算趋势图表
                </div>
              </CardContent>
            </Card>

            {/* 手续费分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  手续费分布
                </CardTitle>
                <CardDescription>按交易类型统计手续费收入</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>代收手续费</span>
                    </div>
                    <span>₹8,950.20 (75%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>代付手续费</span>
                    </div>
                    <span>₹2,985.10 (25%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}