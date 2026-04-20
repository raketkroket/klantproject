<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Newspaper, Calendar, Clock, ArrowRight, X } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import type { NewsItem } from '../types'
import { useScrollAnimation } from '../composables/useScrollAnimation'

useScrollAnimation()

const news = ref<NewsItem[]>([])
const loading = ref(true)
const selected = ref<NewsItem | null>(null)

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

const featured = computed(() => news.value[0] ?? null)
const secondary = computed(() => news.value.slice(1, 3))
const rest = computed(() => news.value.slice(3))

const fmtLong = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' })
const fmtDay = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: '2-digit' })
const fmtMonth = (d: string) => new Date(d).toLocaleDateString('nl-NL', { month: 'short' }).replace('.', '')
const readTime = (text: string) => Math.max(1, Math.ceil((text?.split(/\s+/).length ?? 0) / 200))
const preview = (text: string, n = 180) => {
  if (!text) return ''
  return text.length > n ? text.slice(0, n).trimEnd() + '…' : text
}

const open = (item: NewsItem) => { selected.value = item; document.body.style.overflow = 'hidden' }
const close = () => { selected.value = null; document.body.style.overflow = '' }
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <div class="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
      <img
        src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Nieuws"
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div class="absolute inset-x-0 bottom-8">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <span class="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-roc-300 uppercase mb-3">
            <span class="h-px w-8 bg-roc-300" /> Actueel
          </span>
          <h1 class="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">Nieuws</h1>
          <p class="text-white/70 text-sm md:text-base mt-2 max-w-xl">Verhalen, updates en verdieping van het Software Talent Hub platform.</p>
        </div>
      </div>
    </div>

    <div class="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16">
      <div v-if="loading" class="space-y-8">
        <div class="grid md:grid-cols-5 gap-8">
          <div class="md:col-span-3 bg-gray-100 rounded-2xl h-96 animate-pulse" />
          <div class="md:col-span-2 space-y-6">
            <div class="bg-gray-100 rounded-2xl h-44 animate-pulse" />
            <div class="bg-gray-100 rounded-2xl h-44 animate-pulse" />
          </div>
        </div>
      </div>

      <div v-else-if="news.length === 0" class="text-center py-24 text-gray-400">
        <div class="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
          <Newspaper :size="28" class="text-gray-300" />
        </div>
        <p class="font-serif text-2xl text-gray-600 mb-1">Nog geen nieuws</p>
        <p class="text-sm">Beheerders kunnen hier binnenkort berichten plaatsen.</p>
      </div>

      <template v-else>
        <div class="flex items-end justify-between mb-8 pb-4 border-b-2 border-gray-900">
          <div>
            <span class="text-[0.7rem] font-bold tracking-[0.25em] text-roc-500 uppercase">Laatste editie</span>
            <h2 class="font-serif text-2xl md:text-3xl font-bold text-gray-900 mt-1">Uitgelicht</h2>
          </div>
          <span class="hidden sm:block text-xs font-medium text-gray-400 tracking-wider uppercase">
            {{ news.length }} {{ news.length === 1 ? 'artikel' : 'artikelen' }}
          </span>
        </div>

        <div v-if="featured" class="grid md:grid-cols-5 gap-6 md:gap-10 mb-16">
          <article
            class="md:col-span-3 group cursor-pointer"
            data-animate
            @click="open(featured)"
          >
            <div class="relative overflow-hidden rounded-2xl mb-6 aspect-[16/10] bg-gradient-to-br from-gray-200 to-gray-300">
              <img
                v-if="featured.image_url"
                :src="featured.image_url"
                :alt="featured.title"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div v-else class="absolute inset-0 flex items-center justify-center">
                <Newspaper :size="56" class="text-gray-300" />
              </div>
              <div class="absolute top-4 left-4 bg-roc-500 text-white text-[0.65rem] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full shadow-lg">
                Hoofdartikel
              </div>
            </div>
            <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span class="flex items-center gap-1.5 font-medium">
                <Calendar :size="13" /> {{ fmtLong(featured.created_at) }}
              </span>
              <span class="text-gray-300">·</span>
              <span class="flex items-center gap-1.5">
                <Clock :size="13" /> {{ readTime(featured.content) }} min leestijd
              </span>
            </div>
            <h3 class="font-serif text-3xl md:text-4xl font-bold text-gray-900 leading-[1.15] mb-4 group-hover:text-roc-600 transition-colors">
              {{ featured.title }}
            </h3>
            <p class="text-gray-600 text-base leading-relaxed mb-5">
              {{ featured.excerpt || preview(featured.content, 240) }}
            </p>
            <span class="inline-flex items-center gap-2 text-roc-500 font-semibold text-sm group-hover:gap-3 transition-all">
              Lees het volledige artikel <ArrowRight :size="16" />
            </span>
          </article>

          <div class="md:col-span-2 md:border-l md:border-gray-200 md:pl-10 space-y-8">
            <article
              v-for="(item, i) in secondary" :key="item.id"
              class="group cursor-pointer pb-8"
              :class="{ 'border-b border-gray-200': i < secondary.length - 1 }"
              data-animate
              :data-animate-delay="`${(i + 1) * 120}`"
              @click="open(item)"
            >
              <div v-if="item.image_url" class="relative overflow-hidden rounded-xl mb-4 aspect-[16/9] bg-gray-100">
                <img :src="item.image_url" :alt="item.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <span class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-roc-500">Update</span>
              <h4 class="font-serif text-xl font-bold text-gray-900 leading-snug mt-1.5 mb-2 group-hover:text-roc-600 transition-colors">
                {{ item.title }}
              </h4>
              <p v-if="item.excerpt || item.content" class="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                {{ item.excerpt || preview(item.content, 140) }}
              </p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <Calendar :size="12" /> {{ fmtShort(item.created_at) }}
                </span>
                <span>·</span>
                <span>{{ readTime(item.content) }} min</span>
              </div>
            </article>
          </div>
        </div>

        <div v-if="rest.length > 0">
          <div class="flex items-end justify-between mb-8 pb-4 border-b-2 border-gray-900">
            <div>
              <span class="text-[0.7rem] font-bold tracking-[0.25em] text-roc-500 uppercase">Archief</span>
              <h2 class="font-serif text-2xl md:text-3xl font-bold text-gray-900 mt-1">Meer berichten</h2>
            </div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <article
              v-for="(item, i) in rest" :key="item.id"
              class="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              data-animate
              :data-animate-delay="`${Math.min(i * 100, 400)}`"
              @click="open(item)"
            >
              <div class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  v-if="item.image_url"
                  :src="item.image_url"
                  :alt="item.title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="absolute inset-0 flex items-center justify-center">
                  <Newspaper :size="32" class="text-gray-300" />
                </div>
                <div class="absolute top-3 left-3 bg-white rounded-xl px-2.5 py-1.5 shadow-md text-center min-w-[3rem]">
                  <div class="text-lg font-bold text-gray-900 leading-none font-serif">{{ fmtDay(item.created_at) }}</div>
                  <div class="text-[0.6rem] font-semibold text-roc-500 uppercase tracking-wider mt-0.5">{{ fmtMonth(item.created_at) }}</div>
                </div>
              </div>
              <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Clock :size="12" />
                  <span>{{ readTime(item.content) }} min leestijd</span>
                </div>
                <h3 class="font-serif text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-roc-600 transition-colors">
                  {{ item.title }}
                </h3>
                <p class="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
                  {{ item.excerpt || preview(item.content, 160) }}
                </p>
                <div class="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span class="text-xs text-gray-400 font-medium">{{ fmtShort(item.created_at) }}</span>
                  <span class="inline-flex items-center gap-1.5 text-roc-500 font-semibold text-xs group-hover:gap-2.5 transition-all">
                    Lees meer <ArrowRight :size="13" />
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </template>
    </div>

    <div v-if="selected" class="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4" style="animation: backdropFadeIn 0.2s ease-out">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />
      <article class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col" style="animation: panelSlideUp 0.3s ease-out">
        <button
          class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors"
          aria-label="Sluiten"
          @click="close"
        >
          <X :size="16" />
        </button>

        <div v-if="selected.image_url" class="relative h-28 sm:h-36 md:h-44 bg-gray-100 overflow-hidden shrink-0">
          <img :src="selected.image_url" :alt="selected.title" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div class="px-5 sm:px-8 py-5 sm:py-6 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
            <span class="bg-roc-50 text-roc-600 font-bold tracking-[0.15em] uppercase px-2.5 py-0.5 rounded-full text-[0.6rem]">Artikel</span>
            <span class="flex items-center gap-1.5 font-medium">
              <Calendar :size="12" /> {{ fmtLong(selected.created_at) }}
            </span>
            <span class="text-gray-300">·</span>
            <span class="flex items-center gap-1.5">
              <Clock :size="12" /> {{ readTime(selected.content) }} min leestijd
            </span>
          </div>

          <h1 class="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-[1.15] mb-3">{{ selected.title }}</h1>

          <p v-if="selected.excerpt" class="text-base text-gray-600 leading-relaxed border-l-4 border-roc-500 pl-4 mb-5 italic">
            {{ selected.excerpt }}
          </p>

          <div class="prose-article text-gray-700 text-[0.95rem] leading-[1.75] whitespace-pre-line">
            {{ selected.content }}
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.font-serif {
  font-family: 'Georgia', 'Times New Roman', ui-serif, serif;
}
.prose-article {
  font-family: 'Georgia', 'Times New Roman', ui-serif, serif;
}
</style>
