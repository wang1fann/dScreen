<template>
  <div style="width:320px; border-radius:6px; padding:12px; background:#071025; border:1px solid #122028; color:#cbd5e1;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div style="font-weight:600">内容管理</div>
      <div style="font-size:12px; color:#94a3b8">可拖拽到画布</div>
    </div>

    <div v-for="c in contents" :key="c.id" class="content-item"
         draggable="true" @dragstart="(e) => handleDragStart(e, c)">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600">{{ c.title }}</div>
          <div style="font-size:12px; color:#9ca3af">{{ c.type }}</div>
        </div>
        <div style="text-align:right">
          <div v-if="isAssigned(c.id)" style="font-size:12px; color:#fb923c">已分���</div>
          <div v-else style="font-size:12px; color:#94a3b8">未分配</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  contents: Array,
  slotsMapping: Object
})

function handleDragStart(e, item) {
  const payload = { kind: 'content', contentId: item.id }
  try {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
  } catch (err) {
    // ignore
  }
  e.dataTransfer.setData('text/plain', JSON.stringify(payload))
  e.dataTransfer.effectAllowed = 'copy'
}

function isAssigned(contentId) {
  return Object.values(props.slotsMapping || {}).includes(contentId)
}
</script>

<style scoped>
.content-item {
  border:1px solid #122a33;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), transparent);
  padding:10px;
  margin-bottom:8px;
  border-radius:6px;
  cursor:grab;
}
</style>
