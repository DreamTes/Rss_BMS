import request from './request'

/**
 * 获取仪表盘统计数据
 * @returns {Promise} - 返回统计数据
 */
export function getDashboardStatistics() {
  return request({
    url: '/dashboard/statistics',
    method: 'get'
  })
}

/**
 * 获取最新文章列表
 * @param {number} [limit=5] - 获取数量
 * @returns {Promise} - 返回最新文章列表
 */
export function getLatestArticles(limit = 5) {
  return request({
    url: '/rss/articles/latest',
    method: 'get',
    params: { limit }
  })
} 