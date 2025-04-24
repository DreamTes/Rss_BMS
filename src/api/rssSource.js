import request from './request'

/**
 * 获取RSS源列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} [params.keyword] - 搜索关键词
 * @param {number} [params.categoryId] - 分类ID
 * @param {string} [params.status] - 状态过滤
 * @returns {Promise} - 返回RSS源列表和总数
 */
export function getRssSources(params) {
  return request({
    url: '/rss/sources',
    method: 'get',
    params
  })
}

/**
 * 添加RSS源
 * @param {Object} data - RSS源数据
 * @returns {Promise}
 */
export function addRssSource(data) {
  return request({
    url: '/rss/sources',
    method: 'post',
    data
  })
}

/**
 * 更新RSS源
 * @param {Object} data - RSS源数据
 * @returns {Promise}
 */
export function updateRssSource(data) {
  return request({
    url: `/rss/sources/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 删除RSS源
 * @param {string|number} id - RSS源ID
 * @returns {Promise}
 */
export function deleteRssSource(id) {
  return request({
    url: `/rss/sources/${id}`,
    method: 'delete'
  })
}

/**
 * 立即抓取RSS源
 * @param {string|number} id - RSS源ID
 * @returns {Promise}
 */
export function fetchRssNow(id) {
  return request({
    url: `/rss/sources/${id}/fetch`,
    method: 'post'
  })
}

/**
 * 获取分类列表
 * @returns {Promise}
 */
export function getCategories() {
  console.log('调用获取分类API')
  return request({
    url: '/categories',
    method: 'get'
  })
} 