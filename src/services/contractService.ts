import { api, ApiResponse } from './api';

// 合约交易配置
export interface ContractTrxConfig {
  pkg: string;
  trx_type: string;
  trx_method: string;
  trx_ccy: string;
  country: string;
  min_amount: number;
  max_amount: number;
  min_usd_amount: number;
  max_usd_amount: number;
}

// 合约结算配置
export interface ContractSettleConfig {
  type: string; // T0、T1、T2、T3、W1、M1
  pkg: string;
  trx_type: string;
  trx_method: string;
  trx_ccy: string;
  country: string;
  min_amount: number;
  max_amount: number;
  min_usd_amount: number;
  max_usd_amount: number;
  strategies: string[];
}

// 合约配置
export interface ContractConfig {
  trx_type: string;
  status: string;
  configs: ContractTrxConfig[];
  settle: ContractSettleConfig[];
}

// 合约信息接口
export interface Contract {
  id: number;
  contract_id: string;
  ori_contract_id?: string;
  sid: string; // 车队ID
  stype: string; // cashier_team
  start_at: number;
  expired_at: number;
  status: string;
  payin?: ContractConfig;
  payout?: ContractConfig;
  created_at: number;
  updated_at: number;
}

// 合约列表查询参数
export interface ContractListParams {
  contract_id?: string;
  status?: string;
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

// 合约详情参数
export interface ContractDetailParams {
  contract_id: string;
}

// 合约统计数据
export interface ContractStats {
  total: number;
  active: number;
  expired: number;
  pending: number;
}

class ContractService {
  // 获取合约列表
  async getContractList(params: ContractListParams): Promise<ApiResponse<PaginatedResponse<Contract>>> {
    try {
      const response = await api.post<any>('/contract/list', params);
      
      if (!response.data) {
        return {
          success: false,
          code: response.code || '9999',
          msg: response.msg || '获取合约列表失败',
          data: {
            list: [],
            pagination: { page: params.page, size: params.size },
            total: 0
          }
        };
      }

      // 后端直接返回数组，不再有分页字段
      const list = Array.isArray(response.data) ? response.data : [];
      return {
        success: true,
        code: response.code,
        msg: response.msg || '成功',
        data: {
          list: list,
          pagination: { 
            page: params.page, 
            size: params.size 
          },
          total: list.length
        }
      };
    } catch (error: any) {
      console.error('获取合约列表失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '网络错误',
        data: {
          list: [],
          pagination: { page: params.page, size: params.size },
          total: 0
        }
      };
    }
  }

  // 获取合约详情
  async getContractDetail(params: ContractDetailParams): Promise<ApiResponse<Contract>> {
    try {
      const response = await api.post<Contract>('/contract/detail', params);
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data
      };
    } catch (error: any) {
      console.error('获取合约详情失败:', error);
      throw error;
    }
  }

  // 获取合约统计数据
  async getContractStats(): Promise<ApiResponse<ContractStats>> {
    try {
      // 后端会从JWT token中自动获取tid和stype，不需要传递参数
      const response = await api.post<ContractStats>('/contract/stats', {});
      return {
        success: response.code === '0000',
        code: response.code,
        msg: response.msg,
        data: response.data || {
          total: 0,
          active: 0,
          expired: 0,
          pending: 0
        }
      };
    } catch (error: any) {
      console.error('获取合约统计数据失败:', error);
      return {
        success: false,
        code: '9999',
        msg: error.message || '获取统计数据失败',
        data: {
          total: 0,
          active: 0,
          expired: 0,
          pending: 0
        }
      };
    }
  }
}

export const contractService = new ContractService();
