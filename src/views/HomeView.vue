<template>
  <div class="common-layout">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px">
        <side-menu :activeIndex="activeIndex" />
      </el-aside>
      
      <!-- 主内容区域 -->
      <el-container>
        <el-header>
          <top-header />
        </el-header>
        
        <el-main>
          <h2>RSS信息管理系统</h2>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="dashboard-card">
                <template #header>
                  <div class="card-header">
                    <span>RSS源</span>
                    <el-button type="primary" size="small" @click="goToRssSources">
                      管理
                    </el-button>
                  </div>
                </template>
                <div class="statistics">
                  <el-statistic :value="statistics.sourceCount">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        总RSS源数量
                        <el-icon style="margin-left: 4px">
                          <Link />
                        </el-icon>
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="dashboard-card">
                <template #header>
                  <div class="card-header">
                    <span>文章</span>
                    <el-button type="primary" size="small" @click="goToRssArticles">
                      查看
                    </el-button>
                  </div>
                </template>
                <div class="statistics">
                  <el-statistic :value="statistics.articleCount">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        总文章数量
                        <el-icon style="margin-left: 4px">
                          <Reading />
                        </el-icon>
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="dashboard-card">
                <template #header>
                  <div class="card-header">
                    <span>分类</span>
                    <el-button type="primary" size="small" @click="goToCategories">
                      管理
                    </el-button>
                  </div>
                </template>
                <div class="statistics">
                  <el-statistic :value="statistics.categoryCount">
                    <template #title>
                      <div style="display: inline-flex; align-items: center">
                        分类数量
                        <el-icon style="margin-left: 4px">
                          <Folder />
                        </el-icon>
                      </div>
                    </template>
                  </el-statistic>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="16">
              <el-card class="dashboard-card">
                <template #header>
                  <div class="card-header">
                    <span>最新文章</span>
                    <el-button type="text" @click="goToRssArticles">查看更多</el-button>
                  </div>
                </template>
                <el-table :data="latestArticles" style="width: 100%">
                  <el-table-column prop="title" label="标题" />
                  <el-table-column prop="source" label="来源" width="180" />
                  <el-table-column prop="publishDate" label="发布时间" width="180" />
                </el-table>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="dashboard-card">
                <template #header>
                  <div class="card-header">
                    <span>系统信息</span>
                  </div>
                </template>
                <div class="system-info">
                  <p><strong>系统名称:</strong> RSS信息管理系统</p>
                  <p><strong>最后更新:</strong> {{ statistics.lastUpdate }}</p>
                  <p><strong>版本:</strong> {{ statistics.version }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Link, Reading, Folder } from '@element-plus/icons-vue'
import SideMenu from '../components/SideMenu.vue'
import TopHeader from '../components/TopHeader.vue'
import { getDashboardStatistics, getLatestArticles } from '../api/dashboard'

// 路由实例
const router = useRouter()

// 当前活跃的菜单项
const activeIndex = ref('home')

// 统计数据
const statistics = ref({
  sourceCount: 0,
  articleCount: 0,
  categoryCount: 0,
  lastUpdate: '',
  version: '1.0.0'
})

// 最新文章数据
const latestArticles = ref([])

// 导航方法
const goToRssSources = () => router.push('/rss-sources')
const goToRssArticles = () => router.push('/rss-articles')
const goToCategories = () => router.push('/categories')

// 获取仪表盘统计数据
const fetchDashboardData = async () => {
  try {
    // 调用API获取统计数据
    const statsResponse = await getDashboardStatistics()
    console.log('仪表盘统计数据响应:', statsResponse)
    
    // 检查是否有成功状态码
    if (statsResponse.success && statsResponse.code === 200) {
      // 使用data字段的数据，并且做字段名映射
      const data = statsResponse.data || {}
      statistics.value = {
        sourceCount: data.totalSources || 0,
        articleCount: data.totalArticles || 0,
        categoryCount: data.categoryCount || 0,
        lastUpdate: new Date().toLocaleString(),
        version: '1.0.0'
      }
    } else {
      // 接口可能没有包装结构，直接使用返回值
      statistics.value = statsResponse
    }
    
    // 获取最新文章列表
    const articlesResponse = await getLatestArticles()
    console.log('最新文章响应:', articlesResponse)
    
    // 同样检查响应格式
    if (articlesResponse.success && articlesResponse.code === 200) {
      latestArticles.value = articlesResponse.data || []
    } else {
      // 接口可能没有包装结构，直接使用返回值
      latestArticles.value = articlesResponse || []
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #eee;
  padding: 0;
}

.dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics {
  padding: 10px 0;
}

.system-info p {
  margin: 8px 0;
}
</style>
