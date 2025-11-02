import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardService, DashboardTodayStats, DashboardTransactionTrend } from '../services/dashboardService';

export function Dashboard() {
  const [todayStats, setTodayStats] = useState<DashboardTodayStats | null>(null);
  const [transactionTrend, setTransactionTrend] = useState<DashboardTransactionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取今天日期
  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // 获取Dashboard数据
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用概览接口一次性获取所有数据
      const overview = await DashboardService.getDashboardOverview();
      setTodayStats(overview.today_stats);
      setTransactionTrend(overview.transaction_trend);
    } catch (err: any) {
      console.error('获取Dashboard数据失败:', err);
      setError(err.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 格式化货币显示
  const formatCurrency = (value: string | number, showSymbol: boolean = true) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    const formatted = num.toLocaleString();
    return showSymbol ? `₹${formatted}` : formatted;
  };

  // 格式化百分比显示
  const formatPercentage = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.0%';
    return `${num}%`;
  };

  // 格式化增长率显示
  const formatRate = (rate: string) => {
    const num = parseFloat(rate);
    if (isNaN(num)) return '+0.0%';
    return num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  };

  // 获取增长率颜色
  const getRateColor = (rate: string) => {
    const num = parseFloat(rate);
    if (isNaN(num)) return 'text-muted-foreground';
    return num >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1>首页</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1>首页</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-2">加载失败</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>首页</h1>
      </div>

      {/* 今日统计 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">今日统计 ({getTodayDate()})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日代收</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">₹</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(todayStats?.today_payin || '0')}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={getRateColor(todayStats?.today_payin_rate || '0')}>
                  {formatRate(todayStats?.today_payin_rate || '0')}
                </span> 较昨日
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日代付</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">₹</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(todayStats?.today_payout || '0')}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={getRateColor(todayStats?.today_payout_rate || '0')}>
                  {formatRate(todayStats?.today_payout_rate || '0')}
                </span> 较昨日
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">%</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(todayStats?.success_rate || '0')}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={getRateColor(todayStats?.success_rate_change || '0')}>
                  {formatRate(todayStats?.success_rate_change || '0')}
                </span> 较昨日
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 交易趋势图表 - 单独一行 */}
      <Card>
        <CardHeader>
          <CardTitle>本周交易趋势</CardTitle>
          <CardDescription>代收、代付交易金额变化（INR）</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="payin" fill="hsl(var(--chart-1))" name="代收" />
              <Bar dataKey="payout" fill="hsl(var(--chart-2))" name="代付" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}