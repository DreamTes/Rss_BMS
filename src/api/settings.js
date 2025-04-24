import request from './request'

/**
 * 获取系统设置
 * @returns {Promise} 系统设置数据
 */
export function getSystemSettings() {
  return request({
    url: '/settings',
    method: 'get'
  })
}

/**
 * 更新系统设置
 * @param {Object} data - 设置数据
 * @returns {Promise} 更新后的设置
 */
export function updateSystemSettings(data) {
  return request({
    url: '/settings',
    method: 'put',
    data: { settings: data }
  })
}

/**
 * 获取用户信息
 * @returns {Promise} 用户信息
 */
export function getUserProfile() {
  return request({
    url: '/user/profile',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户数据
 * @param {string} data.nickname - 昵称
 * @param {string} data.email - 邮箱
 * @returns {Promise} 更新后的用户信息
 */
export function updateUserProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.password - 新密码
 * @returns {Promise} 修改结果
 */
export function changePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
} 