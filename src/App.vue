<template>
  <el-container style="height:100vh; padding:16px; background:#0f1720; color:#cbd5e1">
    <el-header style="background:transparent; padding:8px 0">
      <h3 style="color:#fff; margin:0">布局管理 Demo</h3>
    </el-header>

    <el-main style="padding:12px 0">
      <layout-selector
        :layouts="layouts"
        v-model:selectedLayoutId="selectedLayoutId"
      />
      <div style="display:flex; gap:16px; margin-top:12px;">
        <layout-canvas
          :layout="currentLayout"
          :contents="contents"
          :slots-mapping="slotsMapping"
          @update:mapping="onUpdateMapping"
        />
        <content-pool
          :contents="contents"
          :slots-mapping="slotsMapping"
        />
      </div>
    </el-main>

    <el-footer style="background:transparent; padding-top:12px;">
      <el-button type="primary" @click="onSave">保存</el-button>
      <el-button @click="onReset">重置</el-button>
      <el-button @click="onPreview">预览</el-button>
      <span style="margin-left:16px; color:#9ca3af">最后保存：{{ lastSavedAt || '未保存' }}</span>
    </el-footer>

    <el-dialog title="布局预览（JSON）" v-model:visible="previewVisible" width="60%">
      <pre style="white-space:pre-wrap; background:#0b1220; color:#e6eef8; padding:12px; border-radius:6px">{{ previewJson }}</pre>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import LayoutSelector from './components/LayoutSelector.vue'
import LayoutCanvas from './components/LayoutCanvas.vue'
import ContentPool from './components/ContentPool.vue'
import * as api from './api'

const layouts = ref([])
const contents = ref([])
const selectedLayoutId = ref(null)
const slotsMapping = reactive({}) // slotId -> contentId | null
const lastSavedAt = ref(null)
const previewVisible = ref(false)
const previewJson = ref('')

let pageState = null

onMounted(async () => {
  layouts.value = await api.getLayouts()
  contents.value = await api.getContents()
  pageState = await api.getPageLayout()
  selectedLayoutId.value = pageState.layoutId
  // initialize mapping using pageState, but ensure mapping covers current layout slots
  loadMappingForLayout(pageState.layoutId, pageState.slotsMapping)
  lastSavedAt.value = pageState.updatedAt
})

function loadMappingForLayout(layoutId, mappingFromState) {
  const layout = layouts.value.find(l => l.id === layoutId)
  if (!layout) return
  selectedLayoutId.value = layoutId
  // clear and set mapping
  Object.keys(slotsMapping).forEach(k => delete slotsMapping[k])
  layout.slots.forEach(s => {
    slotsMapping[s.id] = mappingFromState && mappingFromState[s.id] ? mappingFromState[s.id] : null
  })
}

const currentLayout = computed(() => layouts.value.find(l => l.id === selectedLayoutId.value) || null)

// 当 layout 变化，重新初始化 mapping（若后端有不同 layoutId，应从后端加载；这里简化）
function onUpdateMapping(newMapping) {
  // newMapping 是完整 mapping object；复制到 reactive slotsMapping
  Object.keys(slotsMapping).forEach(k => delete slotsMapping[k])
  Object.entries(newMapping).forEach(([k, v]) => (slotsMapping[k] = v))
}

async function onSave() {
  if (!currentLayout.value) return
  const payload = { layoutId: currentLayout.value.id, slotsMapping: { ...slotsMapping } }
  try {
    const res = await api.savePageLayout('page_demo', payload)
    lastSavedAt.value = res.updatedAt
    window.$message && window.$message({ type: 'success', message: '保存成功' })
  } catch (e) {
    window.$message && window.$message({ type: 'error', message: '保存失败' })
  }
}

async function onReset() {
  const state = await api.getPageLayout()
  loadMappingForLayout(state.layoutId, state.slotsMapping)
}

function onPreview() {
  previewJson.value = JSON.stringify({ layoutId: currentLayout.value?.id, slotsMapping: { ...slotsMapping } }, null, 2)
  previewVisible.value = true
}
</script>

<style>
body { margin:0; font-family: "Helvetica Neue", Arial, sans-serif; }
</style>
