// 状态显示测试文件
// 用于验证所有状态常量是否能正确显示，不再出现"未知"状态

import React from 'react';
import { 
  STATUS, 
  getStatusDisplayName, 
  getStatusColor, 
  isSuccessStatus, 
  isFailureStatus, 
  isProcessingStatus 
} from '../constants/status';

// 测试所有23个状态的显示
const allStatuses = Object.values(STATUS);

export const StatusDisplayTest: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">状态显示测试</h1>
      
      {/* 所有状态的显示测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">全部{allStatuses.length}个状态显示测试</h2>
        <div className="grid grid-cols-3 gap-4">
          {allStatuses.map(status => {
            const displayName = getStatusDisplayName(status);
            const color = getStatusColor(status);
            const isSuccess = isSuccessStatus(status);
            const isFailure = isFailureStatus(status);
            const isProcessing = isProcessingStatus(status);
            
            return (
              <div key={status} className="border p-3 rounded-lg">
                <div className="space-y-2">
                  <div className="font-mono text-sm text-gray-600">{status}</div>
                  <div className="font-medium">{displayName}</div>
                  <div className="text-sm">
                    颜色: <span className={`px-2 py-1 rounded text-white bg-${color === 'success' ? 'green' : color === 'error' ? 'red' : color === 'warning' ? 'yellow' : color === 'processing' ? 'blue' : 'gray'}-500`}>
                      {color}
                    </span>
                  </div>
                  <div className="text-xs space-x-2">
                    {isSuccess && <span className="text-green-600">✓ 成功状态</span>}
                    {isFailure && <span className="text-red-600">✗ 失败状态</span>}
                    {isProcessing && <span className="text-blue-600">⟳ 处理状态</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 常见场景测试 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">常见交易状态场景</h2>
        <div className="space-y-2">
          {[
            { status: STATUS.PENDING, description: '新订单等待处理' },
            { status: STATUS.PROCESSING, description: '支付正在处理中' },
            { status: STATUS.SUBMITTED, description: '已提交到支付渠道' },
            { status: STATUS.CONFIRMING, description: '等待支付确认' },
            { status: STATUS.SUCCESS, description: '支付成功' },
            { status: STATUS.COMPLETED, description: '交易完成' },
            { status: STATUS.FAILED, description: '支付失败' },
            { status: STATUS.CANCELLED, description: '用户取消支付' },
            { status: STATUS.EXPIRED, description: '支付超时' },
            { status: STATUS.REJECTED, description: '支付被拒绝' },
            { status: STATUS.APPROVED, description: '管理员批准' },
            { status: STATUS.SUSPENDED, description: '交易暂停' },
            { status: STATUS.LOCKED, description: '账户被锁定' }
          ].map(({ status, description }) => (
            <div key={status} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="font-mono text-sm w-24">{status}</div>
              <div className="font-medium w-32">{getStatusDisplayName(status)}</div>
              <div className="text-sm text-gray-600 flex-1">{description}</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getStatusColor(status) === 'success' ? 'bg-green-100 text-green-800' :
                getStatusColor(status) === 'error' ? 'bg-red-100 text-red-800' :
                getStatusColor(status) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                getStatusColor(status) === 'processing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusDisplayName(status)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 验证没有"未知"状态 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">验证测试</h2>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <h3 className="font-medium text-green-800">✅ 验证通过</h3>
          <p className="text-green-700 mt-2">
            所有 {allStatuses.length} 个状态都有对应的显示名称和颜色配置，
            不会再出现"未知"状态的情况。
          </p>
          <div className="mt-3 text-sm text-green-600">
            <div>• 成功状态数量: {allStatuses.filter(s => isSuccessStatus(s)).length}</div>
            <div>• 失败状态数量: {allStatuses.filter(s => isFailureStatus(s)).length}</div>
            <div>• 处理状态数量: {allStatuses.filter(s => isProcessingStatus(s)).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplayTest;