<template>
  <div class="side-menu">
    <div class="logo">
      <img src="../assets/logo.png" alt="RSS管理系统" height="40" />
      <span class="logo-text">RSS管理系统</span>
    </div>
    
    <el-menu
      :default-active="activeIndex"
      class="menu"
      router
      background-color="#001529"
      text-color="#fff"
      active-text-color="#409EFF"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </el-menu-item>
      
      <el-menu-item index="/rss-sources">
        <el-icon><Connection /></el-icon>
        <span>RSS源管理</span>
      </el-menu-item>
      
      <el-menu-item index="/rss-articles">
        <el-icon><Document /></el-icon>
        <span>文章管理</span>
      </el-menu-item>
      
      <el-menu-item index="/categories">
        <el-icon><Files /></el-icon>
        <span>分类管理</span>
      </el-menu-item>
      
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { 
  HomeFilled, 
  Connection, 
  Document, 
  Files, 
  Setting 
} from '@element-plus/icons-vue'

// 接收父组件传递的当前活跃菜单项
defineProps({
  activeIndex: {
    type: String,
    default: 'home'
  }
})
</script>

<style scoped>
.side-menu {
  height: 100vh;
  background-color: #001529;
  color: white;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  background-color: #002140;
}

.logo-text {
  margin-left: 8px;
  font-weight: bold;
  font-size: 16px;
}

.menu {
  border-right: none;
}
</style> 