<template>
  <div style="flex:1; min-height:480px; border-radius:6px; padding:12px; background:#071025; border:1px dashed #233239;">
    <div style="color:#93c5fd; margin-bottom:8px">布局画布 — {{ layout?.name || '未选择布局' }}</div>
    <div v-if="!layout" style="color:#94a3b8">请选择上方布局。</div>
    <div v-else style="display:flex; gap:12px; align-items:flex-start;">
      <div style="flex:1;">
        <div v-for="slot in layout.slots" :key="slot.id" class="slot-box"
          :data-slot="slot.id"
          @dragover.prevent="onDragOver($event, slot.id)"
          @drop.prevent="onDrop($event, slot.id)"
        >
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="color:#9ca3af;">{{ slot.label }}</div>
            <div>
              <el-button type="text" size="mini" @click="remove(slot.id)">移除</el-button>
            </div>
          </div>

          <div v-if="assigned(slot.id)" class="assigned-item" draggable="true"
               @dragstart="onDragStartAssigned($event, slot.id)">
            <div style="font-weight:600">{{ assigned(slot.id).title }}</div>
            <div style="font-size:12px; color:#94a3b8">{{ assigned(slot.id).type }}</div>
          </div>

          <div v-else class="empty-slot">未配置（拖拽或点击右侧添加）</div>
        </div>
      </div>

      <div style="width:180px; color:#94a3b8; font-size:12px;">
        <div style="margin-bottom:8px">提示：</div>
        <div style="line-height:1.6">
          - 每个区域只能放一个内容。<br/>
          - 从右侧拖动或从其他区域拖动来放置/交换。<br/>
          - 放到已有内容的区域会弹出替换确认。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  layout: Object,
  contents: Array,
  slotsMapping: Object
})
const emit = defineEmits(['update:mapping'])

const assigned = (slotId) => {
  const cid = props.slotsMapping && props.slotsMapping[slotId]
  if (!cid) return null
  return props.contents.find(c => c.id === cid) || null
}

function onDragStartAssigned(e, fromSlotId) {
  const payload = { kind: 'assigned', fromSlotId, contentId: props.slotsMapping[fromSlotId] }
  try {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
  } catch (err) {}
  e.dataTransfer.setData('text/plain', JSON.stringify(payload))
  e.dataTransfer.effectAllowed = 'move'
}

function onDragOver(e, slotId) {
  // visual feedback could be added
  e.dataTransfer.dropEffect = 'move'
}

async function onDrop(e, targetSlotId) {
  const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain')
  if (!raw) return
  let payload
  try { payload = JSON.parse(raw) } catch { return }
  if (payload.kind === 'content') {
    // 从内容池拖入
    const contentId = payload.contentId
    const cur = props.slotsMapping[targetSlotId]
    if (cur && cur !== contentId) {
      // 已有不同内容：询问替换
      try {
        await ElMessageBox.confirm('目标区域已有内容，确认替换？', '替换确认', { confirmButtonText: '替换', cancelButtonText: '取消', type: 'warning' })
        const newMap = { ...props.slotsMapping, [targetSlotId]: contentId }
        emit('update:mapping', newMap)
        ElMessage({ type: 'success', message: '已替换' })
      } catch {
        // 取消
      }
    } else {
      // 直接放置（为空或相同，则直接设）
      const newMap = { ...props.slotsMapping, [targetSlotId]: contentId }
      emit('update:mapping', newMap)
    }
  } else if (payload.kind === 'assigned') {
    const from = payload.fromSlotId
    const contentId = payload.contentId
    if (from === targetSlotId) return // 同一区域拖动无效
    const targetContent = props.slotsMapping[targetSlotId]
    const newMap = { ...props.slotsMapping }
    if (!targetContent) {
      // 目标为空 -> 移动
      newMap[targetSlotId] = contentId
      newMap[from] = null
    } else {
      // 目标有内容 -> 交换
      newMap[targetSlotId] = contentId
      newMap[from] = targetContent
    }
    emit('update:mapping', newMap)
  }
}

function remove(slotId) {
  const newMap = { ...props.slotsMapping, [slotId]: null }
  emit('update:mapping', newMap)
  ElMessage({ type: 'info', message: '已移除' })
}
</script>

<style scoped>
.slot-box {
  border: 1px dashed #21303a;
  padding:10px;
  border-radius:6px;
  min-height:88px;
  margin-bottom:12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
}
.empty-slot { color:#475569; padding:18px 6px; }
.assigned-item {
  background:#0b2b3a;
  border-radius:6px;
  padding:8px;
  color:#e6eef8;
  cursor:grab;
}
</style>
