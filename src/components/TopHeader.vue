<template>
  <div class="top-header">
    <div class="left">
      <el-button type="text" :icon="Expand" @click="toggleSidebar">
        {{ isCollapse ? '展开' : '收起' }}
      </el-button>
    </div>
    
    <div class="right">
      <span class="refresh-btn" @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新
      </span>
      
      <el-dropdown trigger="click">
        <span class="user-dropdown">
          <el-avatar :size="32" :src="userAvatar">{{ userInitials }}</el-avatar> 
          <span class="username">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToSettings">
              <el-icon><Setting /></el-icon>
              <span>账户设置</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Expand, Refresh, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { logout } from '../api/user'
import { getUserProfile } from '../api/settings'

// 路由实例
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)

// 用户信息（实际项目中通常从用户状态管理中获取）
const username = ref('')

//获取用户的用户名
const getUsername = async () => {
  try {
    console.log('TOPHEADER开始获取用户信息--------')
    const response = await getUserProfile()

    username.value = response.data.username
  } catch (error) {
    console.error('获取用户名失败:', error)
  }
}

// 计算用户头像的文字缩写
const userInitials = computed(() => {
  const name = username.value
  return name ? name.charAt(0).toUpperCase() : 'U'
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  // 这里可以通过事件或状态管理通知父组件侧边栏状态变化
}

// 刷新数据
const refreshData = () => {
  ElMessage.success('数据刷新中...')
}

// 前往设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 退出登录
const handleLogout = async () => {
  try {
    // 先获取token
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('您已处于未登录状态')
      router.push('/login')
      return
    }
    
    // 添加更多日志帮助调试
    console.log('开始退出登录，当前token:', token)
    
    // 发送退出请求
    const response = await logout()
    console.log('退出响应:', response)
    
    // 成功后清除token
    localStorage.removeItem('token')
    localStorage.removeItem('remember')
    
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    // 更详细的错误日志
    console.error('退出失败详细信息:', error)
    if (error.response) {
      console.error('错误响应状态:', error.response.status)
      console.error('错误响应数据:', error.response.data)
    }
    
    // 即使请求失败，也清除token（这是一种降级策略）
    localStorage.removeItem('token')
    localStorage.removeItem('remember')
    
    ElMessage.error(`退出失败: ${error.message || '未知错误'}，已强制清除本地登录状态`)
    router.push('/login')
  }
}

onMounted(() => {
  getUsername()
})
</script>

<style scoped>
.top-header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.left, .right {
  display: flex;
  align-items: center;
}

.refresh-btn {
  margin-right: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.refresh-btn .el-icon {
  margin-right: 4px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
}
</style> 