<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <side-menu activeIndex="/rss-articles" />
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-container>
        <el-header>
          <top-header @refresh="fetchArticles" />
        </el-header>
        
        <el-main>
          <div class="page-header">
            <h2>RSS文章管理</h2>
            <div>
              <el-button 
                type="danger" 
                :disabled="selectedArticles.length === 0"
                @click="handleBatchDelete"
              >
                <el-icon><Delete /></el-icon> 批量删除
              </el-button>
            </div>
          </div>
          
          <!-- 搜索和筛选 -->
          <el-card class="filter-card">
            <el-form :model="filterForm" inline>
              <el-form-item label="关键词">
                <el-input 
                  v-model="filterForm.keyword" 
                  placeholder="搜索文章标题/内容" 
                  clearable 
                />
              </el-form-item>
              
              <el-form-item label="RSS源">
                <el-select 
                  v-model="filterForm.sourceId" 
                  placeholder="选择RSS源" 
                  clearable
                  style="width: 180px;"
                >
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="item in rssSources" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id" 
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="分类">
                <el-select 
                  v-model="filterForm.categoryId" 
                  placeholder="选择分类" 
                  clearable
                  style="width: 180px;"
                >
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="item in categories" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id" 
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="发布日期">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  @change="handleDateChange"
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 文章列表 -->
          <el-card>
            <el-table
              v-loading="loading"
              :data="articles"
              style="width: 100%"
              border
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip>
                <template #default="scope">
                  <el-link :href="scope.row.link" target="_blank" type="primary">
                    {{ scope.row.title }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="sourceName" label="来源" width="120" />
              <el-table-column prop="categoryName" label="分类" width="100" />
              <el-table-column prop="publishDate" label="发布日期" width="180" sortable />
              <el-table-column prop="readCount" label="阅读数" width="100" align="center" sortable />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button type="primary" link @click="handleViewDetail(scope.row)">
                    查看
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
                :page-sizes="[10, 20, 50, 100]"
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
    
    <!-- 文章详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="文章详情"
      width="800px"
      destroy-on-close
    >
      <template v-if="currentArticle">
        <h2>{{ currentArticle.title }}</h2>
        <div class="article-meta">
          <span>来源: {{ currentArticle.sourceName }}</span>
          <el-divider direction="vertical" />
          <span>发布时间: {{ currentArticle.publishDate }}</span>
          <el-divider direction="vertical" />
          <span>分类: {{ currentArticle.categoryName }}</span>
        </div>
        
        <el-divider />
        
        <div class="article-content" v-html="currentArticle.content"></div>
        
        <div class="article-actions">
          <el-button type="primary" @click="openOriginalLink" v-if="currentArticle.link">
            <el-icon><Link /></el-icon> 查看原文
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Link } from '@element-plus/icons-vue'
import SideMenu from '../components/SideMenu.vue'
import TopHeader from '../components/TopHeader.vue'
import { 
  getArticles, 
  getArticleDetail, 
  deleteArticle, 
  batchDeleteArticles 
} from '../api/article'
import { getRssSources } from '../api/rssSource'
import { getCategories } from '../api/category'

// 加载状态
const loading = ref(false)

// 文章列表数据
const articles = ref([])
const rssSources = ref([])
const categories = ref([])

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 筛选表单
const filterForm = reactive({
  keyword: '',
  sourceId: '',
  categoryId: '',
  startDate: '',
  endDate: ''
})

// 日期范围
const dateRange = ref([])

// 选中的文章
const selectedArticles = ref([])

// 文章详情
const detailVisible = ref(false)
const currentArticle = ref(null)

// 处理日期变更
const handleDateChange = (val) => {
  if (val) {
    // 添加时间部分，起始日期设为当天00:00:00，结束日期设为当天23:59:59
    filterForm.startDate = val[0] ? `${val[0]}T00:00:00` : '';
    filterForm.endDate = val[1] ? `${val[1]}T23:59:59` : '';
  } else {
    filterForm.startDate = '';
    filterForm.endDate = '';
  }
}

// 获取文章列表
const fetchArticles = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filterForm
    }
    
    const response = await getArticles(params)
    console.log('文章列表响应:', response)
    
    // 检查响应格式
    if (response.success && response.code === 200) {
      // 成功，从data中提取数据和总数
      if (response.data) {
        articles.value = response.data.items || response.data || []
        total.value = response.data.total || 0
      }
    } else {
      // 兼容旧格式，直接使用返回值
      articles.value = response.items || []
      total.value = response.total || 0
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取RSS源列表
const fetchRssSources = async () => {
  try {
    const response = await getRssSources({
      pageSize: 100,  // 获取足够多的RSS源
      status: 'active'
    })
    console.log('RSS源列表响应:', response)
    
    // 检查响应格式
    if (response.success && response.code === 200) {
      // 成功，从data中提取数据
      rssSources.value = response.data?.items || response.data || []
    } else {
      // 兼容旧格式
      rssSources.value = response.items || response || []
    }
  } catch (error) {
    console.error('获取RSS源列表失败:', error)
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategories()
    console.log('分类列表响应:', response)
    
    // 检查响应格式
    if (response.success && response.code === 200) {
      // 成功，从data中提取数据
      categories.value = response.data || []
    } else {
      // 兼容旧格式
      categories.value = response || []
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
}

// 重置过滤条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  dateRange.value = []
  currentPage.value = 1
  fetchArticles()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchArticles()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchArticles()
}

// 多选处理
const handleSelectionChange = (selection) => {
  selectedArticles.value = selection
}

// 查看文章详情
const handleViewDetail = async (row) => {
  try {
    const data = await getArticleDetail(row.id)
    currentArticle.value = data
    detailVisible.value = true
  } catch (error) {
    console.error('获取文章详情失败:', error)
    ElMessage.error('获取文章详情失败')
  }
}

// 打开原文链接
const openOriginalLink = () => {
  if (currentArticle.value && currentArticle.value.link) {
    window.open(currentArticle.value.link, '_blank')
  }
}

// 删除文章
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除文章 "${row.title}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteArticle(row.id)
      ElMessage.success('删除成功')
      fetchArticles()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedArticles.value.length === 0) return
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedArticles.value.length} 篇文章吗？`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedArticles.value.map(item => item.id)
      await batchDeleteArticles(ids)
      ElMessage.success('批量删除成功')
      fetchArticles()
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败，请稍后重试')
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchRssSources()
  fetchCategories()
  fetchArticles()
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

.article-meta {
  color: #666;
  margin: 10px 0 20px;
}

.article-content {
  margin: 20px 0;
  max-height: 400px;
  overflow-y: auto;
}

.article-content img {
  max-width: 100%;
  height: auto;
}

.article-actions {
  margin-top: 20px;
  text-align: right;
}
</style> 