<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  title: string
  size?: 'md' | 'lg' | 'xl'
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const sizeClasses = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }

watch(() => props.isOpen, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}
window.addEventListener('keydown', onKey)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    <div :class="['relative w-full bg-white rounded-2xl shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain', sizeClasses[size ?? 'lg']]">
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
        <button class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>
      <div class="p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
