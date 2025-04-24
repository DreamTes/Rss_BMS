import request from './request.js'

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {boolean} [data.remember] - 记住登录
 * @returns {Promise} - 返回登录结果
 */
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise} - 返回注册结果
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

/**
 * 用户退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

/**
 * 验证当前用户是否登录
 * @returns {Promise}
 */
export function checkAuth() {
  return request({
    url: '/user/check',
    method: 'get'
  })
} 