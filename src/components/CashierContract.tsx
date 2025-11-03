import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { RefreshCw, FileText } from 'lucide-react';
import { contractService } from '../services/contractService';
import type { Contract, ContractListParams, ContractStats } from '../services/contractService';
import { toast } from '../utils/toast';
import { getStatusDisplayName, getStatusColor } from '../constants/status';
import { useAuthStore } from '../store/authStore';

export function CashierContract() {
  const { currentUser } = useAuthStore();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats>({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // 后端会从JWT token中获取tid，不需要传递参数
      const response = await contractService.getContractStats();
      if (response.success) {
        setStats(response.data);
        console.log('CashierContract: 统计数据获取成功:', response.data);
      } else {
        console.error('CashierContract: 统计数据获取失败:', response.msg);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    console.log('CashierContract: 开始获取合约列表');
    setLoading(true);
    setError(null);
    try {
      // 后端会从JWT token中获取tid和stype，不需要前端传递
      const params: ContractListParams = {
        page: 1,
        size: 1000
      };
      console.log('CashierContract: 请求参数:', params);

      const response = await contractService.getContractList(params);
      console.log('CashierContract: 响应数据:', response);
      if (response.success) {
        setContracts(response.data.list);
        console.log('CashierContract: 合约列表获取成功，数量:', response.data.list.length);
      } else {
        setContracts([]);
        setError(response.msg || '获取数据失败');
        console.error('CashierContract: 合约列表获取失败:', response.msg);
      }
    } catch (error: any) {
      console.error('获取车队合约列表失败:', error);
      setContracts([]);
      setError(error.message || '网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('CashierContract useEffect 触发, currentUser:', currentUser);
    // 只要用户已登录就请求数据（后端从JWT获取tid）
    if (currentUser) {
      console.log('CashierContract: currentUser 存在，准备请求数据');
      fetchContracts();
      fetchStats();
    } else {
      console.log('CashierContract: currentUser 不存在，跳过请求');
    }
  }, [currentUser, fetchContracts, fetchStats]);

  const handleRefresh = () => {
    fetchContracts();
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    const displayName = getStatusDisplayName(status);
    const color = getStatusColor(status);
    
    const getVariantAndClass = (color: string) => {
      switch (color) {
        case 'green':
          return { variant: 'default' as const, className: 'bg-green-500' };
        case 'red':
          return { variant: 'destructive' as const, className: '' };
        case 'yellow':
          return { variant: 'default' as const, className: 'bg-yellow-500' };
        case 'gray':
          return { variant: 'secondary' as const, className: '' };
        default:
          return { variant: 'default' as const, className: '' };
      }
    };

    const { variant, className } = getVariantAndClass(color);
    return <Badge variant={variant} className={className}>{displayName}</Badge>;
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const handleViewDetail = async (contract: Contract) => {
    try {
      const response = await contractService.getContractDetail({ contract_id: contract.contract_id });
      if (response.success) {
        setSelectedContract(response.data);
      } else {
        toast.error('获取合约详情失败', response.msg);
      }
    } catch (error) {
      console.error('获取合约详情失败:', error);
      toast.error('获取合约详情失败', '网络错误，请稍后重试');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的合约</h1>
        <Button onClick={handleRefresh} className="gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">错误: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">生效中</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已过期</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待生效</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">加载中...</div>
          ) : !contracts || contracts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合约ID</TableHead>
                  <TableHead>生效时间</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-xs">{contract.contract_id}</TableCell>
                    <TableCell>{formatDateTime(contract.start_at)}</TableCell>
                    <TableCell>{contract.expired_at ? formatDateTime(contract.expired_at) : '永久'}</TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(contract)}>
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-[45vw] w-[45vw] min-w-[600px]" style={{width: '45vw', maxWidth: '45vw'}}>
          <DialogHeader>
            <DialogTitle>合约详情</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {/* 基本信息 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">合约ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedContract.contract_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">原合约ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedContract.ori_contract_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">车队ID</label>
                  <p className="mt-1 font-mono text-sm">{selectedContract.sid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">状态</label>
                  <p className="mt-1">{getStatusBadge(selectedContract.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">生效时间</label>
                  <p className="mt-1 text-sm">{formatDateTime(selectedContract.start_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">过期时间</label>
                  <p className="mt-1 text-sm">{selectedContract.expired_at ? formatDateTime(selectedContract.expired_at) : '永久有效'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">创建时间</label>
                  <p className="mt-1 text-sm">{formatDateTime(selectedContract.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">更新时间</label>
                  <p className="mt-1 text-sm">{formatDateTime(selectedContract.updated_at)}</p>
                </div>
              </div>
              
              {/* 代收配置 */}
              {selectedContract.payin && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">代收配置</h3>
                    {getStatusBadge(selectedContract.payin.status)}
                  </div>
                  
                  {/* 交易配置列表 */}
                  {selectedContract.payin.configs && selectedContract.payin.configs.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">交易配置</h4>
                      <div className="space-y-2">
                        {selectedContract.payin.configs.map((config: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-sm space-y-1">
                            {config.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{config.pkg}</span></div>}
                            {config.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{config.trx_method}</span></div>}
                            {config.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{config.trx_ccy}</span></div>}
                            {config.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{config.country}</span></div>}
                            {(config.min_amount || config.max_amount) && (
                              <div>
                                <span className="text-gray-600">金额范围:</span>{' '}
                                <span className="font-medium">
                                  {config.min_amount ? `${config.min_amount}` : '不限'} ~ {config.max_amount ? `${config.max_amount}` : '不限'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 结算配置列表 */}
                  {selectedContract.payin.settle && selectedContract.payin.settle.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">结算配置</h4>
                      <div className="space-y-2">
                        {selectedContract.payin.settle.map((settle: any, index: number) => (
                          <div key={index} className="bg-blue-50 p-3 rounded text-sm space-y-1">
                            <div><span className="text-gray-600">结算类型:</span> <span className="font-medium">{settle.type}</span></div>
                            {settle.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{settle.pkg}</span></div>}
                            {settle.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{settle.trx_method}</span></div>}
                            {settle.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{settle.trx_ccy}</span></div>}
                            {settle.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{settle.country}</span></div>}
                            {(settle.min_amount || settle.max_amount) && (
                              <div>
                                <span className="text-gray-600">金额范围:</span>{' '}
                                <span className="font-medium">
                                  {settle.min_amount ? `${settle.min_amount}` : '不限'} ~ {settle.max_amount ? `${settle.max_amount}` : '不限'}
                                </span>
                              </div>
                            )}
                            {settle.strategies && settle.strategies.length > 0 && (
                              <div>
                                <span className="text-gray-600">策略:</span>{' '}
                                <span className="font-medium">{settle.strategies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 代付配置 */}
              {selectedContract.payout && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">代付配置</h3>
                    {getStatusBadge(selectedContract.payout.status)}
                  </div>
                  
                  {/* 交易配置列表 */}
                  {selectedContract.payout.configs && selectedContract.payout.configs.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">交易配置</h4>
                      <div className="space-y-2">
                        {selectedContract.payout.configs.map((config: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-sm space-y-1">
                            {config.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{config.pkg}</span></div>}
                            {config.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{config.trx_method}</span></div>}
                            {config.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{config.trx_ccy}</span></div>}
                            {config.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{config.country}</span></div>}
                            {(config.min_amount || config.max_amount) && (
                              <div>
                                <span className="text-gray-600">金额范围:</span>{' '}
                                <span className="font-medium">
                                  {config.min_amount ? `${config.min_amount}` : '不限'} ~ {config.max_amount ? `${config.max_amount}` : '不限'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 结算配置列表 */}
                  {selectedContract.payout.settle && selectedContract.payout.settle.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">结算配置</h4>
                      <div className="space-y-2">
                        {selectedContract.payout.settle.map((settle: any, index: number) => (
                          <div key={index} className="bg-blue-50 p-3 rounded text-sm space-y-1">
                            <div><span className="text-gray-600">结算类型:</span> <span className="font-medium">{settle.type}</span></div>
                            {settle.pkg && <div><span className="text-gray-600">业务包:</span> <span className="font-medium">{settle.pkg}</span></div>}
                            {settle.trx_method && <div><span className="text-gray-600">支付方式:</span> <span className="font-medium">{settle.trx_method}</span></div>}
                            {settle.trx_ccy && <div><span className="text-gray-600">币种:</span> <span className="font-medium">{settle.trx_ccy}</span></div>}
                            {settle.country && <div><span className="text-gray-600">国家:</span> <span className="font-medium">{settle.country}</span></div>}
                            {(settle.min_amount || settle.max_amount) && (
                              <div>
                                <span className="text-gray-600">金额范围:</span>{' '}
                                <span className="font-medium">
                                  {settle.min_amount ? `${settle.min_amount}` : '不限'} ~ {settle.max_amount ? `${settle.max_amount}` : '不限'}
                                </span>
                              </div>
                            )}
                            {settle.strategies && settle.strategies.length > 0 && (
                              <div>
                                <span className="text-gray-600">策略:</span>{' '}
                                <span className="font-medium">{settle.strategies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
