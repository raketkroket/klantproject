<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Newspaper } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import type { NewsItem } from '../types'
import { useScrollAnimation } from '../composables/useScrollAnimation'

useScrollAnimation()

const news = ref<NewsItem[]>([])
const loading = ref(true)

const fetchNews = async () => {
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  news.value = data ?? []
  loading.value = false
}

let channel: ReturnType<typeof supabase.channel> | null = null
onMounted(() => {
  fetchNews()
  channel = supabase
    .channel('news-public')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews)
    .subscribe()
})
onBeforeUnmount(() => { if (channel) supabase.removeChannel(channel) })

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="relative w-full h-52 sm:h-64 md:h-72">
      <img
        src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Nieuws"
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div class="absolute inset-x-0 bottom-6">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <span class="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Actueel</span>
          <h1 class="text-3xl sm:text-4xl font-bold text-white">Nieuws</h1>
          <p class="text-white/70 text-sm mt-1">Laatste updates van het platform</p>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10">
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl h-64 animate-pulse" />
      </div>
      <div v-else-if="news.length === 0" class="text-center py-20 text-gray-400">
        <Newspaper :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="font-medium">Geen nieuwsberichten</p>
        <p class="text-sm mt-1">Beheerders kunnen hier berichten plaatsen.</p>
      </div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="(item, i) in news" :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          data-animate
          :data-animate-delay="`${Math.min(i * 100, 500)}`"
        >
          <img v-if="item.image_url" :src="item.image_url" :alt="item.title" class="w-full h-44 object-cover" />
          <div v-else class="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Newspaper :size="32" class="text-gray-300" />
          </div>
          <div class="p-5">
            <time class="text-xs text-gray-400 mb-2 block">{{ fmt(item.created_at) }}</time>
            <h3 class="font-bold text-gray-900 mb-2 leading-tight">{{ item.title }}</h3>
            <p v-if="item.excerpt" class="text-sm text-gray-500 leading-relaxed line-clamp-3">{{ item.excerpt }}</p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
