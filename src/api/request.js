import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  // API基础URL，根据实际项目配置
  baseURL: "http://localhost:8080",
  // 请求超时时间
  timeout: 30000,
  // 请求头
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
       // 从 localStorage 获取 token
       const token = localStorage.getItem('token')
       // 如果 token 存在，添加到请求头
       if (token) {
         // Bearer token 是一种基于 OAuth 2.0 规范的认证方式
         // 通过在 token 前加上 "Bearer" 前缀,表明这是一个持有者令牌
         // 服务端可以据此判断请求是否经过身份认证
         config.headers['Authorization'] = token.startsWith('Bearer ') // 确保 token 带有 Bearer 前缀
           ? token // 如果 token 已经带有 Bearer 前缀，直接使用
           : `Bearer ${token}` // 如果 token 没有 Bearer 前缀，添加 Bearer 前缀
       }
       
       // 记录请求参数
       if (config.params) {
         console.log('请求URL:', config.url)
         console.log('请求参数(拦截器):', JSON.stringify(config.params, null, 2))
       }
       
       return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  // 处理响应数据
  response => {
    const res = response.data
    
    
    // 请求成功，返回完整的响应对象
    if (res.code === 200) {
      return res  // 返回完整响应，包含code, success, message, data
    }
    
    // 处理其他状态码
    ElMessage.error(res.message || '请求失败')
    
    // 特定错误码处理，例如权限错误、登录失效等
    if (res.code === 401) {
      // 处理未授权错误，可以跳转到登录页等
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  // 处理错误响应
  error => {
    console.error('响应错误', error)
    
    let message = '请求失败，请稍后重试'
    
    if (error.response) {
      // 请求已发出，但服务器返回状态码不在 2xx 范围内
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          // 使用window.location跳转，避免在响应拦截器中使用路由实例
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求错误: ${error.response.status}`
      }
    } else if (error.request) {
      // 请求已发出但未收到响应
      message = '网络异常，服务器未响应'
    }
    
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request 