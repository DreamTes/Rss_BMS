import request from './request'

/**
 * 获取RSS文章列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} [params.keyword] - 搜索关键词
 * @param {string} [params.sourceId] - RSS源ID
 * @param {string} [params.categoryId] - 分类ID
 * @param {string} [params.startDate] - 开始日期
 * @param {string} [params.endDate] - 结束日期
 * @returns {Promise} - 返回文章列表和总数
 */
export function getArticles(params) {
  return request({
    url: '/rss/articles',
    method: 'get',
    params
  })
}

/**
 * 获取文章详情
 * @param {string|number} id - 文章ID
 * @returns {Promise}
 */
export function getArticleDetail(id) {
  return request({
    url: `/rss/articles/${id}`,
    method: 'get'
  })
}

/**
 * 更新文章信息
 * @param {Object} data - 文章数据
 * @returns {Promise}
 */
export function updateArticle(data) {
  return request({
    url: `/rss/articles/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 删除文章
 * @param {string|number} id - 文章ID
 * @returns {Promise}
 */
export function deleteArticle(id) {
  return request({
    url: `/rss/articles/${id}`,
    method: 'delete'
  })
}

/**
 * 批量删除文章
 * @param {Array} ids - 文章ID数组
 * @returns {Promise}
 */
export function batchDeleteArticles(ids) {
  return request({
    url: '/rss/articles/batch',
    method: 'delete',
    data: { ids }
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