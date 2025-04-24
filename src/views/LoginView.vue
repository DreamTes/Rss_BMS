<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="../assets/logo.png"  class="logo" />
        <h2>RSS信息管理系统</h2>
      </div>
      
      <!-- 登录/注册切换卡片 -->
      <el-tabs v-model="activeTab" class="demo-tabs">
        <!-- 登录表单 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            @keyup.enter="handleLogin"
          >
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名" 
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码" 
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <div class="login-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading.login" 
                class="submit-button" 
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 注册表单 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top"
            @keyup.enter="handleRegister"
          >
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="请输入用户名" 
                prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="请输入邮箱" 
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码" 
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入密码" 
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading.register" 
                class="submit-button" 
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} RSS信息管理系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { login, register } from '../api/user'

// 路由实例
const router = useRouter()
const route = useRoute()

// 活动标签
const activeTab = ref('login')

// 加载状态
const loading = reactive({
  login: false,
  register: false
})

// 表单引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 校验密码是否一致
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.login = true
      try {
        const response = await login(loginForm)
        console.log('登录响应:', response)
        
        // 检查响应格式
        if (response.success && response.code === 200) {
          // 成功响应，token在data中
          const token = response.data?.token || response.token
          
          if (!token) {
            ElMessage.error('登录失败：未获取到有效的登录凭证')
            return
          }
          
          // 保存令牌到localStorage
          localStorage.setItem('token', token)
          
          // 如果选择了"记住我"，可以设置更长的过期时间
          if (loginForm.remember) {
            localStorage.setItem('remember', 'true')
          }
          
          ElMessage.success(response.message || '登录成功')
          
          // 如果有重定向，则跳转到对应页面，否则跳转到首页
          const redirectPath = route.query.redirect || '/'
          router.push(redirectPath)
        } else {
          // 登录可能失败，但返回了正常的错误信息
          ElMessage.error(response.message || '登录失败，请检查用户名和密码')
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.login = false
      }
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.register = true
      try {
        const response = await register({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
        console.log('注册响应:', response)
        
        // 检查响应格式
        if (response.success && response.code === 200) {
          ElMessage.success(response.message || '注册成功，请登录')
          
          // 重置注册表单
          registerFormRef.value.resetFields()
          
          // 切换到登录标签页
          activeTab.value = 'login'
          
          // 预填写用户名
          loginForm.username = registerForm.username
        } else {
          // 注册可能失败，但返回了正常的错误信息
          ElMessage.error(response.message || '注册失败，请稍后重试')
        }
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.register = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: px;
  margin-bottom: 16px;
}

.login-header h2 {
  margin: 0;
  color: #333;
  font-weight: 500;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

:deep(.el-tabs__nav) {
  width: 100%;
  display: flex;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}
</style> 