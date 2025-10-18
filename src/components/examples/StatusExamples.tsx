// 状态枚举使用示例
// 演示如何在React组件中使用统一的状态常量

import React from 'react';
import { 
  STATUS, 
  getStatusDisplayName, 
  getStatusColor, 
  isSuccessStatus, 
  isFailureStatus, 
  isProcessingStatus, 
  getStatusGroup 
} from '../constants/status';

// 状态Badge组件示例
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const displayName = getStatusDisplayName(status);
  const color = getStatusColor(status);
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getColorClass(color)} ${className}`}>
      {displayName}
    </span>
  );
};

// 状态过滤器组件示例
interface StatusFilterProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  showAllOption?: boolean;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  currentStatus, 
  onStatusChange, 
  showAllOption = true 
}) => {
  // 常用的交易状态选项
  const statusOptions = [
    ...(showAllOption ? [{ value: 'all', label: '全部状态' }] : []),
    { value: STATUS.PENDING, label: getStatusDisplayName(STATUS.PENDING) },
    { value: STATUS.PROCESSING, label: getStatusDisplayName(STATUS.PROCESSING) },
    { value: STATUS.SUBMITTED, label: getStatusDisplayName(STATUS.SUBMITTED) },
    { value: STATUS.CONFIRMING, label: getStatusDisplayName(STATUS.CONFIRMING) },
    { value: STATUS.SUCCESS, label: getStatusDisplayName(STATUS.SUCCESS) },
    { value: STATUS.COMPLETED, label: getStatusDisplayName(STATUS.COMPLETED) },
    { value: STATUS.FAILED, label: getStatusDisplayName(STATUS.FAILED) },
    { value: STATUS.CANCELLED, label: getStatusDisplayName(STATUS.CANCELLED) },
    { value: STATUS.EXPIRED, label: getStatusDisplayName(STATUS.EXPIRED) }
  ];

  return (
    <select 
      value={currentStatus} 
      onChange={(e) => onStatusChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {statusOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// 状态统计组件示例
interface StatusStatsProps {
  transactions: Array<{ status: string; [key: string]: any }>;
}

export const StatusStats: React.FC<StatusStatsProps> = ({ transactions }) => {
  const stats = transactions.reduce((acc, transaction) => {
    const group = getStatusGroup(transaction.status);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getGroupDisplayName = (group: string) => {
    switch (group) {
      case 'PROCESSING': return '处理中';
      case 'SUCCESS': return '成功';
      case 'FAILED': return '失败';
      case 'INACTIVE': return '非活跃';
      default: return '未知';
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'PROCESSING': return 'text-blue-600';
      case 'SUCCESS': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      case 'INACTIVE': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {Object.entries(stats).map(([group, count]) => (
        <div key={group} className="bg-white p-4 rounded-lg border border-gray-200">
          <div className={`text-2xl font-bold ${getGroupColor(group)}`}>
            {count}
          </div>
          <div className="text-sm text-gray-600">
            {getGroupDisplayName(group)}
          </div>
        </div>
      ))}
    </div>
  );
};

// 在组件中使用状态判断的示例
export const TransactionRow: React.FC<{ transaction: any }> = ({ transaction }) => {
  const status = transaction.status;
  
  return (
    <tr className="border-b border-gray-200">
      <td className="px-4 py-3">{transaction.trx_id}</td>
      <td className="px-4 py-3">{transaction.amount}</td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3">
        {/* 根据状态显示不同的操作按钮 */}
        {isProcessingStatus(status) && (
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            查看详情
          </button>
        )}
        {isSuccessStatus(status) && (
          <button className="text-green-600 hover:text-green-800 text-sm">
            查看收据
          </button>
        )}
        {isFailureStatus(status) && (
          <button className="text-red-600 hover:text-red-800 text-sm">
            重试
          </button>
        )}
      </td>
    </tr>
  );
};

// 管理员面板状态总览示例
export const AdminStatusDashboard: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const totalTransactions = transactions.length;
  const pendingCount = transactions.filter(t => isProcessingStatus(t.status)).length;
  const successCount = transactions.filter(t => isSuccessStatus(t.status)).length;
  const failedCount = transactions.filter(t => isFailureStatus(t.status)).length;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">交易状态总览</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{totalTransactions}</div>
          <div className="text-sm text-gray-600">总交易数</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
          <div className="text-sm text-gray-600">处理中</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{successCount}</div>
          <div className="text-sm text-gray-600">成功</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{failedCount}</div>
          <div className="text-sm text-gray-600">失败</div>
        </div>
      </div>
    </div>
  );
};