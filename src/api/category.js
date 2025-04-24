import request from './request'

/**
 * 获取分类列表
 * @param {Object} [params] - 查询参数
 * @returns {Promise}
 */
export function getCategories(params) {
  return request({
    url: '/categories',
    method: 'get',
    params
  })
}

/**
 * 添加分类
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export function addCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export function updateCategory(data) {
  return request({
    url: `/categories/${data.id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 * @param {string|number} id - 分类ID
 * @returns {Promise}
 */
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
} 