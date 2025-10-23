import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Settings, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from '../utils/toast';

// 模拟配置数据
const mockConfigs = [
  {
    id: 1,
    key: 'payment.timeout',
    value: '300',
    description: '支付超时时间（秒）',
    category: 'payment',
    type: 'number',
    enabled: true,
    updatedAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    key: 'payment.retry.max',
    value: '3',
    description: '最大重试次数',
    category: 'payment',
    type: 'number',
    enabled: true,
    updatedAt: '2024-01-15 09:15:00'
  },
  {
    id: 3,
    key: 'notification.webhook.enabled',
    value: 'true',
    description: '启用Webhook通知',
    category: 'notification',
    type: 'boolean',
    enabled: true,
    updatedAt: '2024-01-14 16:45:00'
  },
  {
    id: 4,
    key: 'system.maintenance.mode',
    value: 'false',
    description: '系统维护模式',
    category: 'system',
    type: 'boolean',
    enabled: false,
    updatedAt: '2024-01-14 14:20:00'
  },
  {
    id: 5,
    key: 'fee.rate.default',
    value: '0.03',
    description: '默认手续费率',
    category: 'fee',
    type: 'number',
    enabled: true,
    updatedAt: '2024-01-13 11:00:00'
  }
];

const categoryNames = {
  payment: '支付配置',
  notification: '通知配置',
  system: '系统配置',
  fee: '费率配置'
};

export function Config() {
  const [configs, setConfigs] = useState(mockConfigs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    key: '',
    value: '',
    description: '',
    category: 'system',
    type: 'string'
  });

  // 筛选配置
  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || config.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // 获取分类徽章
  const getCategoryBadge = (category: string) => {
    const colors = {
      payment: 'bg-blue-500',
      notification: 'bg-green-500',
      system: 'bg-red-500',
      fee: 'bg-yellow-500'
    };
    
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-500'}>
        {categoryNames[category as keyof typeof categoryNames] || category}
      </Badge>
    );
  };

  // 获取类型徽章
  const getTypeBadge = (type: string) => {
    const colors = {
      string: 'bg-gray-500',
      number: 'bg-purple-500',
      boolean: 'bg-orange-500'
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-gray-500'}>
        {type}
      </Badge>
    );
  };

  // 切换配置启用状态
  const toggleConfigEnabled = (id: number) => {
    setConfigs(prev => prev.map(config => 
      config.id === id 
        ? { ...config, enabled: !config.enabled, updatedAt: new Date().toLocaleString('zh-CN') }
        : config
    ));
  };

  // 开始编辑配置
  const startEdit = (config: any) => {
    setEditingConfig({ ...config });
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingConfig) return;
    
    setConfigs(prev => prev.map(config => 
      config.id === editingConfig.id 
        ? { ...editingConfig, updatedAt: new Date().toLocaleString('zh-CN') }
        : config
    ));
    setEditingConfig(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingConfig(null);
  };

  // 删除配置
  const deleteConfig = (id: number) => {
    if (confirm('确定要删除这个配置项吗？')) {
      const config = configs.find(c => c.id === id);
      setConfigs(prev => prev.filter(config => config.id !== id));
      toast.success('删除成功', `配置项 ${config?.key} 已删除`);
    }
  };

  // 添加新配置
  const addConfig = () => {
    if (!newConfig.key || !newConfig.value || !newConfig.description) {
      toast.warning('请填写完整信息', '配置键、配置值和描述都不能为空');
      return;
    }

    const config = {
      id: Math.max(...configs.map(c => c.id)) + 1,
      ...newConfig,
      enabled: true,
      updatedAt: new Date().toLocaleString('zh-CN')
    };

    setConfigs(prev => [...prev, config]);
    toast.success('添加成功', `配置项 ${config.key} 已成功添加`);
    setNewConfig({
      key: '',
      value: '',
      description: '',
      category: 'system',
      type: 'string'
    });
    setIsAddDialogOpen(false);
  };

  const renderValue = (config: any) => {
    if (editingConfig && editingConfig.id === config.id) {
      if (config.type === 'boolean') {
        return (
          <Select value={editingConfig.value} onValueChange={(value) => 
            setEditingConfig({ ...editingConfig, value })
          }>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">true</SelectItem>
              <SelectItem value="false">false</SelectItem>
            </SelectContent>
          </Select>
        );
      } else {
        return (
          <Input
            value={editingConfig.value}
            onChange={(e) => setEditingConfig({ ...editingConfig, value: e.target.value })}
            className="w-32"
          />
        );
      }
    } else {
      if (config.type === 'boolean') {
        return (
          <Badge variant={config.value === 'true' ? 'default' : 'secondary'}>
            {config.value}
          </Badge>
        );
      } else {
        return <span className="font-mono">{config.value}</span>;
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            系统配置
          </h1>
          <p className="text-muted-foreground">管理系统配置参数</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              添加配置
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新配置</DialogTitle>
              <DialogDescription>添加新的系统配置项</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">配置键 *</label>
                <Input
                  placeholder="例如：payment.timeout"
                  value={newConfig.key}
                  onChange={(e) => setNewConfig({ ...newConfig, key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">配置值 *</label>
                <Input
                  placeholder="配置值"
                  value={newConfig.value}
                  onChange={(e) => setNewConfig({ ...newConfig, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">描述 *</label>
                <Input
                  placeholder="配置项描述"
                  value={newConfig.description}
                  onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">分类</label>
                  <Select value={newConfig.category} onValueChange={(value) => 
                    setNewConfig({ ...newConfig, category: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">系统配置</SelectItem>
                      <SelectItem value="payment">支付配置</SelectItem>
                      <SelectItem value="notification">通知配置</SelectItem>
                      <SelectItem value="fee">费率配置</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <Select value={newConfig.type} onValueChange={(value) => 
                    setNewConfig({ ...newConfig, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">字符串</SelectItem>
                      <SelectItem value="number">数字</SelectItem>
                      <SelectItem value="boolean">布尔值</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={addConfig}>
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
              <Input
                placeholder="搜索配置键或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有分类</SelectItem>
                <SelectItem value="system">系统配置</SelectItem>
                <SelectItem value="payment">支付配置</SelectItem>
                <SelectItem value="notification">通知配置</SelectItem>
                <SelectItem value="fee">费率配置</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 配置列表 */}
      <Card>
        <CardHeader>
          <CardTitle>配置列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>配置键</TableHead>
                <TableHead>配置值</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-mono text-sm">{config.key}</TableCell>
                  <TableCell>{renderValue(config)}</TableCell>
                  <TableCell>
                    {editingConfig && editingConfig.id === config.id ? (
                      <Input
                        value={editingConfig.description}
                        onChange={(e) => setEditingConfig({ ...editingConfig, description: e.target.value })}
                        className="w-full"
                      />
                    ) : (
                      config.description
                    )}
                  </TableCell>
                  <TableCell>{getCategoryBadge(config.category)}</TableCell>
                  <TableCell>{getTypeBadge(config.type)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={() => toggleConfigEnabled(config.id)}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {config.updatedAt}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingConfig && editingConfig.id === config.id ? (
                        <>
                          <Button variant="outline" size="sm" onClick={saveEdit}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEdit(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteConfig(config.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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