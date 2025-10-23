import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Send, Eye, Plus, Search } from 'lucide-react';

const notifications = [
  {
    id: 'NOTIF001',
    type: 'transaction',
    title: '交易成功通知',
    content: '您的订单 ORD2024001 已成功支付，金额：¥1,250.50',
    recipient: 'zhangsan@example.com',
    status: 'sent',
    sendTime: '2024-01-15 14:30:30',
    readTime: '2024-01-15 14:32:15'
  },
  {
    id: 'NOTIF002',
    type: 'system',
    title: '系统维护通知',
    content: '系统将于今晚23:00-01:00进行维护，期间可能影响服务',
    recipient: 'admin@example.com',
    status: 'sent',
    sendTime: '2024-01-15 12:00:00',
    readTime: '2024-01-15 12:05:30'
  },
  {
    id: 'NOTIF003',
    type: 'transaction',
    title: '交易失败通知',
    content: '订单 ORD2024004 支付失败，请检查支付信息',
    recipient: 'zhaoliu@example.com',
    status: 'failed',
    sendTime: '2024-01-15 17:10:35',
    readTime: null
  },
  {
    id: 'NOTIF004',
    type: 'security',
    title: '登录异常通知',
    content: '检测到异常登录行为，IP：192.168.1.100',
    recipient: 'admin@example.com',
    status: 'pending',
    sendTime: null,
    readTime: null
  },
  {
    id: 'NOTIF005',
    type: 'transaction',
    title: '大额交易提醒',
    content: '检测到大额交易，金额：¥15,000.00，请注意风险',
    recipient: 'admin@example.com',
    status: 'sent',
    sendTime: '2024-01-15 16:45:20',
    readTime: null
  }
];

export function Notifications() {
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotification, setNewNotification] = useState({
    type: '',
    title: '',
    content: '',
    recipient: ''
  });

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">已发送</Badge>;
      case 'pending':
        return <Badge variant="secondary">待发送</Badge>;
      case 'failed':
        return <Badge variant="destructive">发送失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'transaction':
        return <Badge variant="outline">交易</Badge>;
      case 'system':
        return <Badge variant="secondary">系统</Badge>;
      case 'security':
        return <Badge variant="destructive">安全</Badge>;
      default:
        return <Badge variant="outline">其他</Badge>;
    }
  };

  const handleCreateNotification = () => {
    // 模拟创建通知
    console.log('创建通知:', newNotification);
    setShowCreateDialog(false);
    setNewNotification({ type: '', title: '', content: '', recipient: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>交易通知</h1>
        <p className="text-muted-foreground">管理和发送交易通知消息</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">通知列表</TabsTrigger>
          <TabsTrigger value="templates">通知模板</TabsTrigger>
          <TabsTrigger value="settings">通知设置</TabsTrigger>
        </TabsList>

        {/* 通知列表 */}
        <TabsContent value="list" className="space-y-4">
          {/* 搜索和筛选 */}
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
                      placeholder="搜索通知标题或内容..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="通知类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="transaction">交易</SelectItem>
                    <SelectItem value="system">系统</SelectItem>
                    <SelectItem value="security">安全</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="发送状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="sent">已发送</SelectItem>
                    <SelectItem value="pending">待发送</SelectItem>
                    <SelectItem value="failed">发送失败</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      创建通知
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>创建新通知</DialogTitle>
                      <DialogDescription>创建并发送新的通知消息</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="notif-type">通知类型</Label>
                          <Select
                            value={newNotification.type}
                            onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择通知类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transaction">交易通知</SelectItem>
                              <SelectItem value="system">系统通知</SelectItem>
                              <SelectItem value="security">安全通知</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notif-recipient">接收人</Label>
                          <Input
                            id="notif-recipient"
                            placeholder="邮箱地址或手机号"
                            value={newNotification.recipient}
                            onChange={(e) => setNewNotification(prev => ({ ...prev, recipient: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notif-title">通知标题</Label>
                        <Input
                          id="notif-title"
                          placeholder="输入通知标题"
                          value={newNotification.title}
                          onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notif-content">通知内容</Label>
                        <Textarea
                          id="notif-content"
                          placeholder="输入通知内容"
                          rows={4}
                          value={newNotification.content}
                          onChange={(e) => setNewNotification(prev => ({ ...prev, content: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        取消
                      </Button>
                      <Button onClick={handleCreateNotification}>
                        发送通知
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* 通知列表 */}
          <Card>
            <CardHeader>
              <CardTitle>通知记录</CardTitle>
              <CardDescription>共找到 {filteredNotifications.length} 条通知记录</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>通知ID</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>接收人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>发送时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="font-mono text-sm">{notif.id}</TableCell>
                      <TableCell>{getTypeBadge(notif.type)}</TableCell>
                      <TableCell className="max-w-48 truncate">{notif.title}</TableCell>
                      <TableCell>{notif.recipient}</TableCell>
                      <TableCell>{getStatusBadge(notif.status)}</TableCell>
                      <TableCell>{notif.sendTime || '未发送'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>通知详情</DialogTitle>
                                <DialogDescription>通知ID: {notif.id}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="font-medium">标题</label>
                                  <p className="text-sm text-muted-foreground">{notif.title}</p>
                                </div>
                                <div>
                                  <label className="font-medium">内容</label>
                                  <p className="text-sm text-muted-foreground">{notif.content}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="font-medium">接收人</label>
                                    <p className="text-sm text-muted-foreground">{notif.recipient}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">状态</label>
                                    <p className="text-sm text-muted-foreground">{getStatusBadge(notif.status)}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">发送时间</label>
                                    <p className="text-sm text-muted-foreground">{notif.sendTime || '未发送'}</p>
                                  </div>
                                  <div>
                                    <label className="font-medium">阅读时间</label>
                                    <p className="text-sm text-muted-foreground">{notif.readTime || '未阅读'}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {notif.status === 'failed' && (
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知模板 */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知模板</CardTitle>
              <CardDescription>管理预设的通知模板</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">交易成功模板</CardTitle>
                    <CardDescription>用于发送交易成功通知</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      尊敬的客户，您的订单 {'{orderId}'} 已成功支付，金额：{'{amount}'}...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">编辑</Button>
                      <Button variant="outline" size="sm">使用</Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">交易失败模板</CardTitle>
                    <CardDescription>用于发送交易失败通知</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      抱歉，您的订单 {'{orderId}'} 支付失败，请检查支付信息...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">编辑</Button>
                      <Button variant="outline" size="sm">使用</Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">系统维护模板</CardTitle>
                    <CardDescription>用于发送系统维护通知</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      系统将于 {'{maintenanceTime}'} 进行维护，期间可能影响服务...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">编辑</Button>
                      <Button variant="outline" size="sm">使用</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  新建模板
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>配置自动通知规则和参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">自动通知规则</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">交易成功通知</p>
                      <p className="text-sm text-muted-foreground">交易成功后自动发送通知给客户</p>
                    </div>
                    <Button variant="outline" size="sm">配置</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">交易失败通知</p>
                      <p className="text-sm text-muted-foreground">交易失败后自动发送通知给客户</p>
                    </div>
                    <Button variant="outline" size="sm">配置</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">大额交易提醒</p>
                      <p className="text-sm text-muted-foreground">超过设定金额时发送提醒</p>
                    </div>
                    <Button variant="outline" size="sm">配置</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}