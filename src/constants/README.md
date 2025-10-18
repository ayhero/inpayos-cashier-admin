# 状态常量系统使用指南

## 概述

这个文档描述了如何在收银员管理后台中使用统一的状态常量系统，该系统与后端的状态常量保持同步。

## 文件结构

```
src/
├── constants/
│   └── status.ts          # 状态常量定义和工具函数
└── components/
    └── examples/
        └── StatusExamples.tsx  # 使用示例组件
```

## 状态常量

### 可用状态

系统包含以下26个状态常量，与后端 `protocol/const.go` 中的 `Status*` 常量一一对应：

```typescript
// 核心状态
STATUS.ON          // "on"          - 开启
STATUS.OFF         // "off"         - 关闭
STATUS.PENDING     // "pending"     - 待处理
STATUS.PROCESSING  // "processing"  - 处理中
STATUS.SUCCESS     // "success"     - 成功
STATUS.FAILED      // "failed"      - 失败
STATUS.CANCELLED   // "cancelled"   - 已取消
STATUS.EXPIRED     // "expired"     - 已过期

// 交易状态
STATUS.SUBMITTED   // "submitted"   - 已提交
STATUS.CONFIRMING  // "confirming"  - 确认中
STATUS.COMPLETED   // "completed"   - 已完成
STATUS.TIMEOUT     // "timeout"     - 超时
STATUS.REJECTED    // "rejected"    - 已拒绝

// 账户状态
STATUS.ACTIVE      // "active"      - 活跃
STATUS.INACTIVE    // "inactive"    - 非活跃
STATUS.SUSPENDED   // "suspended"   - 已暂停
STATUS.BLOCKED     // "blocked"     - 已屏蔽
STATUS.LOCKED      // "locked"      - 已锁定

// 其他状态
STATUS.APPROVED    // "approved"    - 已批准
STATUS.DENIED      // "denied"      - 已拒绝
STATUS.ENABLED     // "enabled"     - 已启用
STATUS.DISABLED    // "disabled"    - 已禁用
STATUS.VERIFIED    // "verified"    - 已验证
STATUS.UNVERIFIED  // "unverified"  - 未验证
STATUS.UNKNOWN     // "unknown"     - 未知
STATUS.ERROR       // "error"       - 错误
```

## 工具函数

### 显示名称
```typescript
import { getStatusDisplayName } from '../constants/status';

const displayName = getStatusDisplayName('pending'); // "待处理"
```

### 状态颜色
```typescript
import { getStatusColor } from '../constants/status';

const color = getStatusColor('success'); // "success"
// 可能的颜色值: "success", "error", "warning", "processing", "info"
```

### 状态判断
```typescript
import { isSuccessStatus, isFailureStatus, isProcessingStatus } from '../constants/status';

if (isSuccessStatus(transaction.status)) {
  // 显示成功相关的UI
}

if (isFailureStatus(transaction.status)) {
  // 显示失败相关的UI
}

if (isProcessingStatus(transaction.status)) {
  // 显示处理中的UI
}
```

### 状态分组
```typescript
import { getStatusGroup } from '../constants/status';

const group = getStatusGroup('processing'); // "PROCESSING"
// 可能的分组: "PROCESSING", "SUCCESS", "FAILED", "INACTIVE"
```

## 管理后台特定用法

### 1. 交易管理仪表板

```typescript
import React from 'react';
import { getStatusGroup, isProcessingStatus, isSuccessStatus, isFailureStatus } from '../constants/status';

const TransactionDashboard: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const stats = {
    total: transactions.length,
    processing: transactions.filter(t => isProcessingStatus(t.status)).length,
    success: transactions.filter(t => isSuccessStatus(t.status)).length,
    failed: transactions.filter(t => isFailureStatus(t.status)).length,
  };

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>总交易数</h3>
        <div className="stat-number">{stats.total}</div>
      </div>
      <div className="stat-card processing">
        <h3>处理中</h3>
        <div className="stat-number">{stats.processing}</div>
      </div>
      <div className="stat-card success">
        <h3>成功</h3>
        <div className="stat-number">{stats.success}</div>
      </div>
      <div className="stat-card failed">
        <h3>失败</h3>
        <div className="stat-number">{stats.failed}</div>
      </div>
    </div>
  );
};
```

### 2. 状态管理操作

```typescript
import React from 'react';
import { STATUS, isProcessingStatus } from '../constants/status';

const AdminTransactionActions: React.FC<{ transaction: any; onUpdateStatus: (id: string, status: string) => void }> = ({ 
  transaction, 
  onUpdateStatus 
}) => {
  const handleApprove = () => {
    onUpdateStatus(transaction.id, STATUS.APPROVED);
  };

  const handleReject = () => {
    onUpdateStatus(transaction.id, STATUS.REJECTED);
  };

  const handleCancel = () => {
    onUpdateStatus(transaction.id, STATUS.CANCELLED);
  };

  return (
    <div className="admin-actions">
      {isProcessingStatus(transaction.status) && (
        <>
          <button onClick={handleApprove} className="btn-approve">
            批准
          </button>
          <button onClick={handleReject} className="btn-reject">
            拒绝
          </button>
        </>
      )}
      {transaction.status === STATUS.PENDING && (
        <button onClick={handleCancel} className="btn-cancel">
          取消
        </button>
      )}
    </div>
  );
};
```

### 3. 状态历史追踪

```typescript
import React from 'react';
import { getStatusDisplayName, getStatusColor } from '../constants/status';

const StatusHistory: React.FC<{ statusHistory: Array<{ status: string; timestamp: string; operator?: string }> }> = ({ 
  statusHistory 
}) => {
  return (
    <div className="status-history">
      <h4>状态变更历史</h4>
      <div className="timeline">
        {statusHistory.map((entry, index) => (
          <div key={index} className="timeline-item">
            <div className={`status-badge ${getStatusColor(entry.status)}`}>
              {getStatusDisplayName(entry.status)}
            </div>
            <div className="timestamp">{entry.timestamp}</div>
            {entry.operator && (
              <div className="operator">操作员: {entry.operator}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 使用示例

### 1. 状态徽章组件

```typescript
import React from 'react';
import { getStatusDisplayName, getStatusColor } from '../constants/status';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const displayName = getStatusDisplayName(status);
  const color = getStatusColor(status);
  
  return (
    <span className={`badge badge-${color}`}>
      {displayName}
    </span>
  );
};
```

### 2. 状态过滤器

```typescript
import React from 'react';
import { STATUS, getStatusDisplayName } from '../constants/status';

const AdminStatusFilter: React.FC<{ onFilter: (status: string) => void }> = ({ onFilter }) => {
  const adminRelevantStatuses = [
    STATUS.PENDING,
    STATUS.PROCESSING,
    STATUS.SUBMITTED,
    STATUS.CONFIRMING,
    STATUS.SUCCESS,
    STATUS.FAILED,
    STATUS.CANCELLED,
    STATUS.APPROVED,
    STATUS.REJECTED,
    STATUS.SUSPENDED,
    STATUS.BLOCKED
  ];

  return (
    <select onChange={(e) => onFilter(e.target.value)} className="admin-filter">
      <option value="">全部状态</option>
      {adminRelevantStatuses.map(status => (
        <option key={status} value={status}>
          {getStatusDisplayName(status)}
        </option>
      ))}
    </select>
  );
};
```

## 管理员权限控制

```typescript
import { STATUS, isProcessingStatus } from '../constants/status';

// 定义不同角色可以执行的状态操作
const ADMIN_PERMISSIONS = {
  super_admin: [
    STATUS.APPROVED, STATUS.REJECTED, STATUS.CANCELLED,
    STATUS.SUSPENDED, STATUS.BLOCKED, STATUS.LOCKED,
    STATUS.ACTIVE, STATUS.INACTIVE
  ],
  admin: [
    STATUS.APPROVED, STATUS.REJECTED, STATUS.CANCELLED,
    STATUS.SUSPENDED
  ],
  operator: [
    STATUS.CANCELLED
  ]
};

const canChangeStatus = (userRole: string, targetStatus: string): boolean => {
  return ADMIN_PERMISSIONS[userRole as keyof typeof ADMIN_PERMISSIONS]?.includes(targetStatus) || false;
};
```

## 最佳实践

1. **使用常量而不是硬编码字符串**
2. **使用工具函数进行状态判断**
3. **使用显示名称函数获取用户友好的文本**
4. **保持前后端状态常量同步**
5. **在管理后台中实现完整的状态追踪**
6. **根据用户角色控制状态操作权限**

## 故障排除

### TypeScript 编译错误
确保状态常量文件正确导入和类型注解正确使用。

### 状态显示不正确
检查状态值传递、显示名称映射和颜色映射配置。

## 更新指南

添加新状态时，同时更新后端和前端常量定义，确保管理后台功能完整性。