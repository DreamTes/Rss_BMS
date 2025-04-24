<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <side-menu activeIndex="/settings" />
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-container>
        <el-header>
          <top-header />
        </el-header>
        
        <el-main>
          <h2>系统设置</h2>
          
          <el-tabs v-model="activeTab">
            <!-- 系统设置 -->
            <el-tab-pane label="系统设置" name="system">
              <el-card>
                <el-form
                  ref="systemFormRef"
                  :model="systemForm"
                  label-width="140px"
                  :disabled="!isSystemEditing"
                >
                  <el-form-item label="系统名称">
                    <el-input v-model="systemForm.systemName" placeholder="请输入系统名称" />
                  </el-form-item>
                  
                  <el-form-item label="默认抓取频率">
                    <el-select v-model="systemForm.defaultFetchFrequency" style="width: 100%">
                      <el-option label="5分钟" value="5" />
                      <el-option label="15分钟" value="15" />
                      <el-option label="30分钟" value="30" />
                      <el-option label="1小时" value="60" />
                      <el-option label="2小时" value="120" />
                      <el-option label="6小时" value="360" />
                      <el-option label="12小时" value="720" />
                      <el-option label="每天" value="1440" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="文章保存天数">
                    <el-input-number 
                      v-model="systemForm.articleRetentionDays" 
                      :min="1" 
                      :max="365"
                      style="width: 100%"
                    />
                  </el-form-item>
                  
                  <el-form-item label="默认分类">
                    <el-select v-model="systemForm.defaultCategory" style="width: 100%">
                      <el-option
                        v-for="item in categories"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="是否自动清理">
                    <el-switch v-model="systemForm.enableAutoCleanup" />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" v-if="!isSystemEditing" @click="isSystemEditing = true">
                      编辑设置
                    </el-button>
                    <template v-else>
                      <el-button type="primary" @click="saveSystemSettings">保存</el-button>
                      <el-button @click="cancelSystemEdit">取消</el-button>
                    </template>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>
            
            <!-- 账户设置 -->
            <el-tab-pane label="账户设置" name="account">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>用户信息</span>
                  </div>
                </template>
                
                <div v-if="loading" class="loading-container">
                  <el-skeleton :rows="3" animated />
                </div>
                
                <div v-else>
                  <el-form
                    ref="userFormRef"
                    :model="userForm"
                    :rules="userRules"
                    label-width="100px"
                  >
                    <el-form-item label="用户名">
                      <el-input v-model="userForm.username" placeholder="请输入用户名" />
                    </el-form-item>
                    
                    <el-form-item label="昵称" prop="nickname">
                      <el-input v-model="userForm.nickname" disabled />
                    </el-form-item>
                    
                    <el-form-item label="电子邮箱" prop="email">
                      <el-input v-model="userForm.email" placeholder="请输入电子邮箱" />
                    </el-form-item>
                    
                    <el-form-item>
                        <el-button type="primary" @click="saveUserInfo">更新信息</el-button>
                        <el-button @click="cancelUserEdit">取消</el-button>
                    </el-form-item>
                  </el-form>
                </div>
              </el-card>
              
              <el-card style="margin-top: 20px;">
                <template #header>
                  <div class="card-header">
                    <span>修改密码</span>
                  </div>
                </template>
                
                <el-form
                  ref="passwordFormRef"
                  :model="passwordForm"
                  :rules="passwordRules"
                  label-width="100px"
                >
                  <el-form-item label="原密码" prop="oldPassword">
                    <el-input 
                      v-model="passwordForm.oldPassword" 
                      type="password" 
                      placeholder="请输入原密码" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                      v-model="passwordForm.newPassword" 
                      type="password" 
                      placeholder="请输入新密码" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input 
                      v-model="passwordForm.confirmPassword" 
                      type="password" 
                      placeholder="请再次输入新密码" 
                      show-password
                    />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="changeUserPassword">修改密码</el-button>
                    <el-button @click="resetPasswordForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SideMenu from '../components/SideMenu.vue'
import TopHeader from '../components/TopHeader.vue'
import { 
  getSystemSettings, 
  updateSystemSettings,
  getUserProfile,
  updateUserProfile,
  changePassword
} from '../api/settings'
import { getCategories } from '../api/category'

// 当前活动的标签
const activeTab = ref('system')

// 路由实例
const router = useRouter()

// 加载状态
const loading = ref(false)

// 分类列表
const categories = ref([])

// 系统设置相关
const systemFormRef = ref(null)
const isSystemEditing = ref(true)
const systemForm = reactive({
  systemName: 'RSS信息管理系统',
  defaultFetchFrequency: '60',
  articleRetentionDays: 30,
  defaultCategory: '科技',
  enableAutoCleanup: true
})

// 用户信息相关
const userFormRef = ref(null)
const isUserEditing = ref(false)
const userForm = reactive({
  username: '',
  nickname: '',
  email: ''
})

// 密码修改相关
const passwordFormRef = ref(null)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 用户表单验证规则
const userRules = {
  nickname: [
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}


// // 获取系统设置
// const fetchSystemSettings = async () => {
//   loading.value = true
//   try {
//     const data = await getSystemSettings()
//     Object.keys(systemForm).forEach(key => {
//       if (key in data) {
//         systemForm[key] = data[key]
//       }
//     })
//   } catch (error) {
//     console.error('获取系统设置失败:', error)
//     ElMessage.error('获取系统设置失败，请稍后重试')
//   } finally {
//     loading.value = false
//   }
// }

// 获取分类列表
// const fetchCategories = async () => {
//   try {
//     const data = await getCategories()
//     categories.value = data
//   } catch (error) {
//     console.error('获取分类列表失败:', error)
//   }
// }

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    console.log('开始获取用户信息')
    const response = await getUserProfile()
    
    // 判断响应格式，兼容多种返回结构
    const userData = response.data || response  
    
    // 更新用户表单数据
    userForm.username = userData.username || ''
    userForm.nickname = userData.nickname || ''
    userForm.email = userData.email || ''

    isUserEditing.value = true
    
    console.log('用户信息获取成功:', userForm)
  } catch (error) {
    console.error('获取用户信息失败:', error)
    if (error.response) {
      console.error('错误响应状态:', error.response.status)
      console.error('错误响应数据:', error.response.data)
    }
    ElMessage.error(`获取用户信息失败: ${error.message || '请稍后重试'}`)
  } finally {
    loading.value = false
  }
}

// // 保存系统设置
// const saveSystemSettings = async () => {
//   if (!systemFormRef.value) return
  
//   try {
//     await updateSystemSettings(systemForm)
//     ElMessage.success('系统设置保存成功')
//     isSystemEditing.value = false
//   } catch (error) {
//     console.error('保存系统设置失败:', error)
//     ElMessage.error('保存失败，请稍后重试')
//   }
// }

// // 取消系统设置编辑
// const cancelSystemEdit = () => {
//   isSystemEditing.value = false
//   fetchSystemSettings() // 重新获取系统设置
// }

// 保存用户信息
const saveUserInfo = async () => {
  
  try {
    // 先进行表单验证
    const valid = await userFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请修正表单中的错误后再提交')
      return
    }
    
    loading.value = true
    console.log('开始保存用户信息:', {
      username: userForm.username,
      email: userForm.email
    })
    
    const response = await updateUserProfile({
      username: userForm.username,
      email: userForm.email
    })
    
    console.log('保存用户信息响应:', response)
    ElMessage.success('用户信息保存成功')

    //保存成功跳转重新登录
    router.push('/login')
    
  } catch (error) {
    console.error('保存用户信息失败:', error)
    if (error.response) {
      console.error('错误响应状态:', error.response.status)
      console.error('错误响应数据:', error.response.data)
    }
    ElMessage.error(`保存失败: ${error.message || '请稍后重试'}`)
  } finally {
    loading.value = false
  }
}

// 取消用户信息编辑
const cancelUserEdit = () => {
  fetchUserInfo() // 重新获取用户信息
}


// 修改密码
const changeUserPassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    // 先进行表单验证
    const valid = await passwordFormRef.value.validate()
    if (!valid) {
      ElMessage.warning('请修正表单中的错误后再提交')
      return
    }
    
    // 确保确认密码与新密码一致
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }
    
    // 验证是否填写了旧密码
    if (!passwordForm.oldPassword) {
      ElMessage.error('请输入原密码')
      return
    }
    
    // 按照后端接口格式，只发送新密码字段
    const response = await changePassword({
      password: passwordForm.newPassword
    })
    console.log("修改密码完整响应:", response)
    // 检查响应结果
    if (response.success && response.code === 200) {
      ElMessage.success(response.message || '密码修改成功')
      resetPasswordForm()
    } else {
      ElMessage.error(response.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    
    // 根据错误状态码提供更明确的反馈
    if (error.response && error.response.status === 403) {
      ElMessage.error('权限不足，请重新登录')
    } else if (error.response && error.response.status === 400) {
      ElMessage.error('新密码不符合要求，请更换')
    } else {
      ElMessage.error('修改密码失败，请稍后重试')
    }
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 页面加载时获取数据
onMounted(() => {
  // fetchSystemSettings()
  // fetchCategories()
  fetchUserInfo()
})
</script>

<style scoped>
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0;
}

.el-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-profile-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.avatar-container {
  display: flex;
  align-items: center;
}

.user-basic-info {
  margin-left: 20px;
}

.loading-container {
  padding: 20px;
}
</style> 