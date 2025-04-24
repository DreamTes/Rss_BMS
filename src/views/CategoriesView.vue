<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <side-menu activeIndex="/categories" />
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-container>
        <el-header>
          <top-header @refresh="fetchCategories" />
        </el-header>
        
        <el-main>
          <div class="page-header">
            <h2>分类管理</h2>
            <el-button type="primary" @click="openAddDialog">
              <el-icon><Plus /></el-icon> 添加分类
            </el-button>
          </div>
          
          <!-- 分类列表 -->
          <el-card>
            <el-table
              v-loading="loading"
              :data="categories"
              style="width: 100%"
              border
            >
              <el-table-column type="index" width="60" label="#" />
              <el-table-column prop="name" label="分类名称" min-width="150" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="sourceCount" label="RSS源数量" width="120" align="center" />
              <el-table-column prop="articleCount" label="文章数量" width="120" align="center" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="handleEdit(scope.row)">
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        
        
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确认</el-button>
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
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../api/category'

// 加载状态
const loading = ref(false)

// 分类列表数据
const categories = ref([])

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryFormRef = ref(null)
const categoryForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: ''
})

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度应在2到20个字符之间', trigger: 'blur' }
  ],
  slug: [
    { required: true, message: '请输入分类标识', trigger: 'blur' },
    { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }
  ]
}

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await getCategories({ withCount: true })
    if (response.success) {
      categories.value = response.data
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  isEdit.value = false
  Object.keys(categoryForm).forEach(key => {
    categoryForm[key] = ''
  })
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
  isEdit.value = true
  Object.keys(categoryForm).forEach(key => {
    if (key in row) {
      categoryForm[key] = row[key]
    }
  })
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row) => {
  // 判断该分类下是否有RSS源
  if (row.sourceCount > 0) {
    return ElMessage.warning(`该分类下有${row.sourceCount}个RSS源，无法删除`)
  }
  
  ElMessageBox.confirm(
    `确定要删除分类 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      fetchCategories()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 提交分类表单
const submitCategoryForm = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 更新分类
          await updateCategory(categoryForm)
          ElMessage.success('更新成功')
        } else {
          // 添加分类
          await addCategory(categoryForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchCategories()
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
</style> 