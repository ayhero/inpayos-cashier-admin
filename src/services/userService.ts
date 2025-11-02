import { api, ApiResponse } from './api';

// 用户信息接口类型定义
export interface UserInfo {
  mid: string; // 商户ID（兼容字段）
  cid: string; // 车队ID
  name: string;
  type: string;
  email: string;
  phone: string;
  status: number;
  has_g2fa: boolean;
}

// 用户服务类
export class UserService {
  // 获取用户信息
  static async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    try {
      const response = await api.post<UserInfo>('/info', {});
      return response;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
}

export default UserService;
