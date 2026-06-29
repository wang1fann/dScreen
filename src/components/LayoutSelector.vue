<template>
  <div style="display:flex; gap:12px; align-items:center; padding:8px 0;">
    <div v-for="l in layouts" :key="l.id" @click="select(l.id)"
         :style="cardStyle(l.id === selectedLayoutId)">
      <div style="height:54px; display:flex; align-items:center; justify-content:center; color:#94a3b8">
        {{ l.name }}
      </div>
      <div style="font-size:12px; color:#94a3b8; text-align:center;">（点击切换）</div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  layouts: { type: Array, default: () => [] },
  selectedLayoutId: { type: String, default: null }
})
const emit = defineEmits(['update:selectedLayoutId'])

function select(id) {
  emit('update:selectedLayoutId', id)
}

function cardStyle(active) {
  return {
    width: '160px',
    borderRadius: '6px',
    padding: '6px',
    background: active ? '#1f2937' : '#0b1220',
    border: active ? '1px solid #2563eb' : '1px solid #0f1720',
    cursor: 'pointer'
  }
}
</script>
