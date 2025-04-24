<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <side-menu activeIndex="/rss-sources" />
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-container>
        <el-header>
          <top-header @refresh="fetchRssSources" />
        </el-header>
        
        <el-main>
          <div class="page-header">
            <h2>RSS源管理</h2>
            <el-button type="primary" @click="openAddDialog">
              <el-icon><Plus /></el-icon> 添加RSS源
            </el-button>
          </div>
          
          <!-- 搜索和筛选 -->
          <el-card class="filter-card">
            <el-form :model="filterForm" inline>
              <el-form-item label="关键词">
                <el-input v-model="filterForm.keyword" placeholder="搜索RSS源名称/URL" clearable />
              </el-form-item>
              
              <el-form-item label="分类">
                <el-select v-model="filterForm.category" placeholder="选择分类" clearable @change="handleCategoryChange" style="width: 150px;">
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="item in categories" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id" 
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="状态">
                <el-select v-model="filterForm.status" placeholder="RSS源状态" clearable @change="handleSearch" style="width: 150px;">
                  <el-option label="全部" value="" />
                  <el-option label="正常" value="active" />
                  <el-option label="禁用" value="disabled" />
                </el-select>
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- RSS源列表 -->
          <el-card>
            <el-table
              v-loading="loading"
              :data="rssSources"
              style="width: 100%"
              border
            >
              <el-table-column type="index" width="50" />
              <el-table-column prop="name" label="名称" min-width="120" />
              <el-table-column prop="url" label="URL" min-width="250" show-overflow-tooltip />
              <el-table-column prop="categoryName" label="分类" width="120" />
              <el-table-column prop="frequency" label="更新频率" width="120">
                <template #default="scope">
                  {{ formatFrequency(scope.row.frequency) }}
                </template>
              </el-table-column>
              <el-table-column prop="lastFetchTime" label="最后更新" width="180" />
              <el-table-column prop="articleCount" label="文章数" width="100" align="center" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="handleEdit(scope.row)">
                    编辑
                  </el-button>
                  <el-button type="primary" link @click="handleFetchNow(scope.row)">
                    立即抓取
                  </el-button>
                  <el-button type="danger" link @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[5, 10, 15, 20]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 添加/编辑RSS源对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑RSS源' : '添加RSS源'"
      width="600px"
    >
      <el-form
        ref="rssFormRef"
        :model="rssForm"
        :rules="rssRules"
        label-width="100px"
      >
        <el-form-item label="源名称" prop="name">
          <el-input v-model="rssForm.name" placeholder="请输入RSS源名称" />
        </el-form-item>
        
        <el-form-item label="RSS地址" prop="url">
          <el-input v-model="rssForm.url" placeholder="请输入RSS源URL" />
        </el-form-item>
        
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="rssForm.categoryId" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="更新频率" prop="frequency">
          <el-select v-model="rssForm.frequency" placeholder="选择更新频率" style="width: 100%">
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
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="rssForm.status"
            :active-value="'active'"
            :inactive-value="'disabled'"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="rssForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入RSS源描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRssForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SideMenu from '../components/SideMenu.vue'
import TopHeader from '../components/TopHeader.vue'
import { 
  getRssSources, 
  addRssSource, 
  updateRssSource, 
  deleteRssSource,
  fetchRssNow,
  getCategories 
} from '../api/rssSource'

// 加载状态
const loading = ref(false)

// RSS源列表数据
const rssSources = ref([])

// 分类数据
const categories = ref([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 过滤表单
const filterForm = reactive({
  keyword: '',
  category: '',
  status: ''
})

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const rssFormRef = ref(null)
const rssForm = reactive({
  id: '',
  name: '',
  url: '',
  categoryId: '',
  frequency: '60',
  status: 'active',
  description: ''
})

// 表单验证规则
const rssRules = {
  name: [
    { required: true, message: '请输入RSS源名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应在2到50个字符之间', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入RSS地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  frequency: [
    { required: true, message: '请选择更新频率', trigger: 'change' }
  ]
}

// 获取RSS源列表
const fetchRssSources = async () => {
  loading.value = true
  try {
    // 调用API获取RSS源列表
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 添加可选的筛选条件
    if (filterForm.keyword) {
      params.keyword = filterForm.keyword
    }
    
    // 分类筛选处理 - 只在有有效值时添加参数
    if (filterForm.category !== null && filterForm.category !== '' && filterForm.category !== undefined) {
      const categoryIdNum = Number(filterForm.category)
      // 只有当转换后是有效数字时才添加参数
      if (!isNaN(categoryIdNum)) {
        params.categoryId = categoryIdNum
        console.log('分类ID类型:', typeof params.categoryId, '值:', params.categoryId)
      }
    }
    
    // 状态筛选处理
    if (filterForm.status) {
      params.status = filterForm.status
    }
    
    console.log('请求参数:', params) // 调试用
    const response = await getRssSources(params)
    console.log('RSS源列表响应:', response)
    
    if (response.code === 200 && response.success) {
      // 新的响应格式: {code, success, message, data: {total, items}}
      rssSources.value = response.data.items || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取RSS源列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    console.log('分类列表原始响应:', response)
    
    if (response.code === 200 && response.success) {
      categories.value = response.data || []
      console.log('处理后的分类数据:', categories.value)
    } else {
      ElMessage.error(response.message || '获取分类数据失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类数据失败')
  }
}

// 分类变更专用处理函数
const handleCategoryChange = (value) => {
  // 当值为undefined或null时（取消选择时），将其设为空字符串
  if (value === undefined || value === null) {
    filterForm.category = ''
  }
  handleSearch()
}

// 搜索
const handleSearch = () => {
  console.log('执行搜索，当前过滤条件:', filterForm)
  currentPage.value = 1
  fetchRssSources()
}

// 重置过滤条件
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.category = ''
  filterForm.status = ''
  currentPage.value = 1
  fetchRssSources()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchRssSources()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchRssSources()
}

// 打开添加对话框
const openAddDialog = () => {
  isEdit.value = false
  Object.keys(rssForm).forEach(key => {
    if (key === 'status') {
      rssForm[key] = 'active'
    } else if (key === 'frequency') {
      rssForm[key] = '60'
    } else {
      rssForm[key] = ''
    }
  })
  dialogVisible.value = true
}

// 编辑RSS源
const handleEdit = (row) => {
  isEdit.value = true
  // 复制主要字段
  rssForm.id = row.id
  rssForm.name = row.name
  rssForm.url = row.url
  rssForm.categoryId = row.categoryId || ''
  rssForm.frequency = row.frequency?.toString() || '60'
  rssForm.status = row.status || 'active'
  rssForm.description = row.description || ''
  
  dialogVisible.value = true
}

// 立即抓取RSS源
const handleFetchNow = async (row) => {
  try {
    await fetchRssNow(row.id)
    ElMessage.success(`已开始抓取RSS源: ${row.name}`)
  } catch (error) {
    console.error('立即抓取失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 删除RSS源
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除RSS源 "${row.name}" 吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteRssSource(row.id)
      ElMessage.success('删除成功')
      fetchRssSources()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 提交RSS源表单
const submitRssForm = async () => {
  if (!rssFormRef.value) return
  
  await rssFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 转换frequency为整数
        const formData = { ...rssForm, frequency: parseInt(rssForm.frequency) }
        
        if (isEdit.value) {
          // 更新RSS源
          await updateRssSource(formData)
          ElMessage.success('更新成功')
        } else {
          // 添加RSS源
          await addRssSource(formData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchRssSources()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  })
}

// 格式化更新频率显示
const formatFrequency = (frequency) => {
  const freq = parseInt(frequency)
  if (freq < 60) {
    return `${freq}分钟`
  } else if (freq < 1440) {
    return `${freq / 60}小时`
  } else {
    return '每天'
  }
}

// 获取状态类型（用于标签颜色）
const getStatusType = (status) => {
  const statusMap = {
    active: 'success',
    disabled: 'info',
    error: 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '正常',
    disabled: '禁用',
    error: '错误'
  }
  return statusMap[status] || '未知'
}

// 页面加载时获取数据
onMounted(async () => {
  // 先加载分类数据
  await fetchCategories()
  // 再加载RSS源数据
  fetchRssSources()
})
</script>

<style scoped>
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 