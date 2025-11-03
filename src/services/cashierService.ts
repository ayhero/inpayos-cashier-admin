import { api, ApiResponse } from './api';

// 交易配置接口
export interface CashierTrxConfig {
  min_trx_amount?: number;
  max_trx_amount?: number;
  max_daily_count?: number;
  max_daily_sum?: number;
  max_monthly_count?: number;
  max_monthly_sum?: number;
  max_current_count?: number;
  max_current_sum?: number;
  max_failures?: number;
  support_trx_methods?: string[];
}

// 出纳员账户信息接口 (CashierAccount)
export interface Cashier {
  account_id: string;           // 收银账户ID (CashierAccountID) - 主键
  user_id: string;              // 收银员用户ID (CashierUserID) - 对应旧的cid
  app_type: string;             // 应用类型 (freecharge, paytm, phonepe, gpay)
  app_account: string;          // 绑定的APP账号ID (AppAccountID)
  
  // 支付方式信息（UPI和银行卡独立）
  upi: string;                  // UPI ID (如: 9876543001@paytm) - 有值时显示UPI
  provider: string;             // UPI提供商 (如: Paytm, PhonePe, GooglePay)
  bank_name: string;            // 银行名称
  bank_code: string;            // 银行代码
  card_number: string;          // 银行卡号 - 有值时显示银行卡
  
  // 持卡人/账户持有人信息
  holder_name: string;          // 持卡人姓名
  holder_phone: string;         // 持卡人手机
  holder_email: string;         // 持卡人邮箱
  
  // 状态信息
  status: string;               // 账户状态 (active, inactive, frozen)
  online_status: string;        // 在线状态 (online, offline, busy)
  payin_status: string;         // 代收状态 (enabled, disabled)
  payout_status: string;        // 代付状态 (enabled, disabled)
  
  // 配置信息
  payin_config: CashierTrxConfig;   // 代收配置
  payout_config: CashierTrxConfig;  // 代付配置
  daily_limit: number;          // 日限额
  monthly_limit: number;        // 月限额
  
  // 其他信息
  remark: string;               // 备注
  
  // 时间戳
  created_at: number;           // 创建时间
  updated_at: number;           // 更新时间
  bound_at: number;             // 绑定时间
  last_active_at: number;       // 最后活跃时间
}

// 为了向后兼容，保留 CashierTeam 类型别名
export type CashierTeam = Cashier;

// 出纳员列表查询参数
export interface CashierListParams {
  account_id?: string;          // 收银账户ID (CashierAccountID)
  user_id?: string;             // 收银员用户ID (CashierUserID)
  app_type?: string;            // 应用类型 (freecharge, paytm, phonepe, gpay)
  app_account?: string;         // 绑定的APP账号ID
  upi?: string;                 // UPI ID搜索
  bank_code?: string;           // 银行代码
  card_number?: string;         // 银行卡号
  holder_name?: string;         // 持卡人姓名
  holder_phone?: string;        // 持卡人手机
  status?: string;              // 账户状态
  payin_status?: string;        // 代收状态
  payout_status?: string;       // 代付状态
  online_status?: string;       // 在线状态
  created_at_start?: number;    // 创建开始时间
  created_at_end?: number;      // 创建结束时间
  page: number;
  size: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    size: number;
  };
  total: number;
}

// 出纳员详情参数
export interface CashierDetailParams {
  account_id: string;           // 收银账户ID (CashierAccountID)
}

// 创建出纳员参数
export interface CreateCashierParams {
  user_id: string;              // 收银员用户ID (CashierUserID) - 必填
  app_type: string;             // 应用类型 (freecharge, paytm, phonepe, gpay) - 必填
  app_account: string;          // 绑定的APP账号ID - 必填
  
  // 支付方式（UPI或银行卡，至少填一个）
  upi?: string;                 // UPI ID (如: 9876543001@paytm)
  provider?: string;            // UPI提供商 (如: Paytm, PhonePe)
  bank_code?: string;           // 银行代码
  bank_name?: string;           // 银行名称
  card_number?: string;         // 银行卡号
  
  // 持卡人信息
  holder_name: string;          // 持卡人姓名 - 必填
  holder_phone: string;         // 持卡人手机 - 必填
  holder_email?: string;        // 持卡人邮箱
  
  remark?: string;              // 备注
}

// 更新出纳员参数
export interface UpdateCashierParams {
  account_id: string;           // 收银账户ID (CashierAccountID) - 必填
  
  // 关联信息
  user_id?: string;             // 收银员用户ID
  app_type?: string;            // 应用类型
  app_account?: string;         // 绑定的APP账号ID
  
  // 支付方式
  upi?: string;                 // UPI ID
  provider?: string;            // UPI提供商
  bank_code?: string;           // 银行代码
  bank_name?: string;           // 银行名称
  card_number?: string;         // 银行卡号
  
  // 持卡人信息
  holder_name?: string;         // 持卡人姓名
  holder_phone?: string;        // 持卡人手机
  holder_email?: string;        // 持卡人邮箱
  
  // 状态
  status?: string;              // 账户状态
  online_status?: string;       // 在线状态
  payin_status?: string;        // 代收状态
  payout_status?: string;       // 代付状态
  
  // 配置
  payin_config?: CashierTrxConfig;  // 代收配置
  payout_config?: CashierTrxConfig; // 代付配置
  daily_limit?: number;         // 日限额
  monthly_limit?: number;       // 月限额
  
  remark?: string;              // 备注
}

// 出纳员统计数据
export interface CashierStats {
  total: number;
  active: number;
  online: number;
  suspended: number;
}

class CashierService {
  // 获取出纳员列表
  async getCashierList(params: CashierListParams): Promise<ApiResponse<PaginatedResponse<Cashier>>> {
    try {
      const response = await api.post<any>('/cashier-account/list', params);
      // 后端返回的是 records，需要转换为 list
      const data: PaginatedResponse<Cashier> = {
        list: response.data?.records || [],
        pagination: {
          page: response.data?.current || params.page,
          size: response.data?.size || params.size
        },
        total: response.data?.total || 0
      };
      return {
        code: response.code,
        msg: response.msg,
        data: data,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员列表失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员列表失败',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        },
        success: false
      };
    }
  }

  // 获取出纳员详情
  async getCashierDetail(params: CashierDetailParams): Promise<ApiResponse<Cashier>> {
    try {
      const response = await api.post<Cashier>('/cashier-account/detail', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员详情失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员详情失败',
        data: {} as Cashier,
        success: false
      };
    }
  }

  // 获取出纳员统计
  async getCashierStats(): Promise<ApiResponse<CashierStats>> {
    try {
      const response = await api.post<CashierStats>('/cashier-account/stats', {});
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('获取出纳员统计失败:', error);
      return {
        code: '9999',
        msg: error.message || '获取出纳员统计失败',
        data: {
          total: 0,
          active: 0,
          online: 0,
          suspended: 0
        },
        success: false
      };
    }
  }

  // 创建出纳员
  async createCashier(params: CreateCashierParams): Promise<ApiResponse<Cashier>> {
    try {
      const response = await api.post<Cashier>('/cashier-account/create', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('创建出纳员失败:', error);
      return {
        code: '9999',
        msg: error.message || '创建出纳员失败',
        data: {} as Cashier,
        success: false
      };
    }
  }

  // 更新出纳员
  async updateCashier(params: UpdateCashierParams): Promise<ApiResponse<Cashier>> {
    try {
      const response = await api.post<Cashier>('/cashier-account/update', params);
      return {
        ...response,
        success: response.code === '0000'
      };
    } catch (error: any) {
      console.error('更新出纳员失败:', error);
      return {
        code: '9999',
        msg: error.message || '更新出纳员失败',
        data: {} as Cashier,
        success: false
      };
    }
  }
}

export const cashierService = new CashierService();