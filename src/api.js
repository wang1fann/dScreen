// 简单本地 mock API：把 layout 状态保存在 localStorage
const STORAGE_KEY = 'demo_layout_state_v1'

// 预置布局模板
export function getLayouts() {
  return Promise.resolve([
    {
      id: 'center',
      name: '中布局',
      slots: [
        { id: 'center_top', label: '中上' },
        { id: 'center_middle', label: '中中' },
        { id: 'center_bottom', label: '中下' }
      ],
      thumbnail: '' // 可放缩略图链接
    },
    {
      id: 'left-center',
      name: '左中布局',
      slots: [
        { id: 'left', label: '左' },
        { id: 'center_top', label: '中上' },
        { id: 'center_middle', label: '中中' }
      ],
      thumbnail: ''
    },
    {
      id: 'center-right',
      name: '中右布局',
      slots: [
        { id: 'center_top', label: '中上' },
        { id: 'center_middle', label: '中中' },
        { id: 'center_bottom', label: '中下' },
        { id: 'right_1', label: '右1' },
        { id: 'right_2', label: '右2' }
      ],
      thumbnail: ''
    }
  ])
}

// 预置内容池
export function getContents() {
  return Promise.resolve([
    { id: 'workStatusAnalysis', title: '工况分析', type: 'chart' },
    { id: 'pressureDynamics', title: '压力动态', type: 'chart' },
    { id: 'predictionWindow', title: '预测监测窗口', type: 'widget' },
    { id: 'realTimeDataWindow', title: '实时数据窗口', type: 'table' },
    { id: 'dataCompare', title: '数据对比窗口', type: 'table' }
  ])
}

// pageId 可自定义；将 slotsMapping 保存为 { slotId: contentId | null }
export function getPageLayout(pageId = 'page_demo') {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // 默认 mapping：全部未配置
    return getLayouts().then(layouts => {
      const defaultLayout = layouts[0]
      const mapping = {}
      defaultLayout.slots.forEach(s => (mapping[s.id] = null))
      const state = { pageId, layoutId: defaultLayout.id, slotsMapping: mapping, updatedAt: new Date().toISOString() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      return state
    })
  }
  const state = JSON.parse(raw)
  return Promise.resolve(state)
}

export function savePageLayout(pageId = 'page_demo', payload) {
  // payload: { layoutId, slotsMapping }
  const state = { ...payload, pageId, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  // 模拟网络延迟
  return new Promise(resolve => setTimeout(() => resolve(state), 500))
}
