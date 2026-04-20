<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Trophy, Plus, Calendar, Building2, Clock, X,
  Sparkles, Flame, Target, Search, Image as ImageIcon,
  Swords, Gem, Zap, Scroll, ChevronRight, Compass,
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import type { Challenge } from '../types'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const DIFFICULTY_META = {
  beginner: {
    label: 'Novice', stars: 1, icon: Sparkles,
    glow: 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)]',
    ring: 'ring-emerald-400/40',
    from: 'from-emerald-500/30', via: 'via-emerald-400/10',
    accent: 'text-emerald-300', bar: 'bg-emerald-400',
    tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  },
  intermediate: {
    label: 'Adept', stars: 2, icon: Flame,
    glow: 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.7)]',
    ring: 'ring-amber-400/40',
    from: 'from-amber-500/30', via: 'via-amber-400/10',
    accent: 'text-amber-300', bar: 'bg-amber-400',
    tag: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  },
  advanced: {
    label: 'Legend', stars: 3, icon: Target,
    glow: 'shadow-[0_0_45px_-10px_rgba(244,63,94,0.75)]',
    ring: 'ring-rose-400/40',
    from: 'from-rose-500/35', via: 'via-rose-400/10',
    accent: 'text-rose-300', bar: 'bg-rose-400',
    tag: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  },
} as const

const CATEGORIES = ['Alle', 'Web', 'Mobile', 'AI & Data', 'Design', 'Game', 'Overig'] as const
type CategoryFilter = typeof CATEGORIES[number]

useScrollAnimation()

const challenges = ref<Challenge[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitted = ref(false)
const submitting = ref(false)
const activeCategory = ref<CategoryFilter>('Alle')
const search = ref('')
const detail = ref<Challenge | null>(null)
const form = ref({
  title: '', description: '', company_name: '', contact_email: '',
  deadline: '', difficulty: 'beginner' as Challenge['difficulty'], prize: '',
  image_url: '', category: 'Web', duration: '',
})

const fetchChallenges = async () => {
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  challenges.value = data ?? []
  loading.value = false
}

let channel: ReturnType<typeof supabase.channel> | null = null
onMounted(() => {
  fetchChallenges()
  channel = supabase
    .channel('challenges-public')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchChallenges)
    .subscribe()
})
onBeforeUnmount(() => { if (channel) supabase.removeChannel(channel) })

const handleSubmit = async () => {
  const f = form.value
  if (!f.title || !f.description || !f.company_name) return
  submitting.value = true
  await supabase.from('challenges').insert({ ...f, status: 'pending' })
  submitting.value = false
  submitted.value = true
  showForm.value = false
  form.value = {
    title: '', description: '', company_name: '', contact_email: '',
    deadline: '', difficulty: 'beginner', prize: '',
    image_url: '', category: 'Web', duration: '',
  }
  setTimeout(() => { submitted.value = false }, 4000)
}

const filtered = computed(() => challenges.value.filter((c) => {
  const matchesCat = activeCategory.value === 'Alle' || (c.category || '').toLowerCase() === activeCategory.value.toLowerCase()
  const q = search.value.trim().toLowerCase()
  const matchesSearch = !q
    || c.title.toLowerCase().includes(q)
    || (c.company_name ?? '').toLowerCase().includes(q)
    || (c.description ?? '').toLowerCase().includes(q)
  return matchesCat && matchesSearch
}))

const daysUntil = (deadline?: string | null) => {
  if (!deadline) return null
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

const diffMeta = (d: Challenge['difficulty']) => DIFFICULTY_META[d ?? 'beginner']

const fmtShort = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
const fmtLong = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

const urgency = (days: number | null) => {
  if (days === null) return null
  if (days < 0) return { label: 'Verlopen', cls: 'bg-white/5 text-white/40 border-white/10' }
  if (days === 0) return { label: 'Vandaag!', cls: 'bg-rose-500 text-white border-rose-400 animate-pulse' }
  if (days <= 3) return { label: `${days}d`, cls: 'bg-rose-500/20 text-rose-300 border-rose-400/40' }
  if (days <= 7) return { label: `${days}d`, cls: 'bg-amber-500/20 text-amber-300 border-amber-400/40' }
  return { label: `${days}d`, cls: 'bg-white/5 text-white/70 border-white/10' }
}

const companyCount = computed(() => new Set(challenges.value.map((c) => c.company_name)).size)
const prizedCount = computed(() => challenges.value.filter((c) => c.prize).length)
const urgentCount = computed(() => challenges.value.filter((c) => {
  const d = daysUntil(c.deadline)
  return d !== null && d >= 0 && d <= 7
}).length)

const categoryEmoji = (cat?: string) => {
  const map: Record<string, string> = { Web: '<>', Mobile: '[]', 'AI & Data': 'AI', Design: '~/', Game: 'GG', Overig: '...' }
  return cat && map[cat] ? map[cat] : '::'
}

const handleTilt = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  const rx = (y - 0.5) * -8
  const ry = (x - 0.5) * 10
  el.style.setProperty('--rx', `${rx}deg`)
  el.style.setProperty('--ry', `${ry}deg`)
  el.style.setProperty('--mx', `${x * 100}%`)
  el.style.setProperty('--my', `${y * 100}%`)
}
const resetTilt = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}
</script>

<template>
  <div class="relative min-h-screen bg-[#0b0d12] text-white overflow-hidden">
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 opacity-[0.25]"
        :style="{ backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(244,114,58,0.22), transparent 45%), radial-gradient(circle at 85% 15%, rgba(16,185,129,0.15), transparent 40%), radial-gradient(circle at 50% 100%, rgba(244,63,94,0.15), transparent 50%)' }" />
      <div class="absolute inset-0 opacity-[0.07]"
        :style="{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '80px 80px' }" />
    </div>

    <section class="relative pt-36 md:pt-44 pb-14 md:pb-20">
      <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
        <div class="flex items-center gap-2 text-xs text-white/40 mb-8">
          <span>Home</span>
          <ChevronRight :size="12" />
          <span class="text-roc-400 font-semibold">Challenges</span>
        </div>

        <div class="grid md:grid-cols-12 gap-10 items-end">
          <div class="md:col-span-8">
            <div class="flex items-center gap-3 mb-7 flex-wrap">
              <span class="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur rounded-full pl-2 pr-4 py-1.5 text-[0.7rem] font-bold tracking-[0.2em] uppercase">
                <span class="w-5 h-5 rounded-full bg-roc-500 flex items-center justify-center">
                  <Swords :size="10" />
                </span>
                Quest Board
              </span>
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <span class="relative flex w-2 h-2">
                  <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {{ challenges.length }} open challenges
              </span>
            </div>

            <h1 class="font-bold tracking-[-0.04em] leading-[0.88]">
              <span class="block text-[3.5rem] sm:text-[5rem] md:text-[7.5rem] lg:text-[8.5rem]">Accepteer je</span>
              <span class="block text-[3.5rem] sm:text-[5rem] md:text-[7.5rem] lg:text-[8.5rem] italic font-serif -mt-2 md:-mt-4 bg-gradient-to-r from-roc-400 via-amber-300 to-rose-400 text-transparent bg-clip-text">
                volgende quest.
              </span>
            </h1>

            <p class="mt-8 max-w-2xl text-lg text-white/60 leading-relaxed">
              Echte opdrachten van echte bedrijven. Kies een challenge, bouw je oplossing, en win prijzen, stages of gewoon eeuwige roem.
            </p>
          </div>

          <div class="md:col-span-4 md:pl-10 md:border-l md:border-white/10">
            <div class="grid grid-cols-2 gap-5 mb-6">
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Quests</p>
                <p class="text-4xl font-bold text-white">{{ challenges.length }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Gilden</p>
                <p class="text-4xl font-bold text-white">{{ companyCount }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Met prijzen</p>
                <p class="text-4xl font-bold text-amber-300">{{ prizedCount }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white/40 mb-1">Urgent</p>
                <p class="text-4xl font-bold text-rose-300">{{ urgentCount }}</p>
              </div>
            </div>
            <button
              class="w-full inline-flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-400 text-white font-semibold px-6 py-4 rounded-full text-sm shadow-[0_20px_40px_-12px] shadow-roc-500/60 transition-all group"
              @click="showForm = true"
            >
              <Plus :size="16" class="group-hover:rotate-90 transition-transform duration-300" />
              Plaats een quest
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="relative sticky top-0 z-30 bg-[#0b0d12]/85 backdrop-blur-xl border-y border-white/5">
      <div class="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div class="flex-1 relative">
          <Search :size="16" class="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="search" placeholder="Zoek een quest, bedrijf, skill…"
            class="w-full pl-12 pr-4 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-roc-500 focus:ring-4 focus:ring-roc-500/10 transition-all"
          />
        </div>
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span class="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-white/40 shrink-0 pr-1">
            <Compass :size="12" /> Realm
          </span>
          <button
            v-for="c in CATEGORIES" :key="c"
            :class="['px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all',
              activeCategory === c
                ? 'bg-white text-gray-900'
                : 'bg-white/[0.04] text-white/70 border border-white/10 hover:border-white/30']"
            @click="activeCategory = c"
          >{{ c }}</button>
        </div>
      </div>
    </section>

    <div v-if="submitted" class="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-6">
      <div class="p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-2xl text-emerald-300 text-sm flex items-center gap-2">
        <Sparkles :size="16" /> Je quest is ingediend en wacht op goedkeuring.
      </div>
    </div>

    <section class="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-10 md:pt-14 pb-24">
      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
      </div>

      <div v-else-if="filtered.length === 0" class="text-center py-24">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
          <Scroll :size="32" />
        </div>
        <p class="text-xl font-bold text-white">Geen quests beschikbaar in deze realm</p>
        <p class="text-sm mt-2 text-white/50">Pas je filters aan of plaats er zelf een.</p>
        <button class="mt-6 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-400 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-lg" @click="showForm = true">
          <Plus :size="15" /> Plaats een quest
        </button>
      </div>

      <template v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-white/50">
            <Scroll :size="14" /> Quest deck
            <span class="text-white/30">· {{ filtered.length }}</span>
          </h2>
          <span class="hidden sm:inline text-xs text-white/30">Klik een kaart om te openen</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" style="perspective: 1600px;">
          <article
            v-for="(c, i) in filtered" :key="c.id"
            class="quest-card group relative aspect-[3/4.1] rounded-[1.75rem] cursor-pointer"
            :style="{ '--rx': '0deg', '--ry': '0deg' }"
            data-animate
            :data-animate-delay="`${Math.min(i * 80, 500)}`"
            @mousemove="handleTilt"
            @mouseleave="resetTilt"
            @click="detail = c"
          >
            <div
              :class="['absolute -inset-px rounded-[1.85rem] opacity-60 group-hover:opacity-100 blur-xl transition-opacity pointer-events-none bg-gradient-to-br to-transparent',
                diffMeta(c.difficulty).from, diffMeta(c.difficulty).via]"
            />

            <div
              :class="['quest-card-inner relative h-full w-full rounded-[1.75rem] overflow-hidden border border-white/10 bg-gradient-to-br from-[#15181f] via-[#0e1015] to-[#0b0d12] ring-1 transition-all duration-300 group-hover:ring-2',
                diffMeta(c.difficulty).ring, diffMeta(c.difficulty).glow]"
            >
              <div
                class="absolute inset-0 opacity-20 pointer-events-none"
                :style="{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }"
              />

              <div
                class="quest-shine absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                :style="{ background: 'radial-gradient(600px circle at var(--mx) var(--my), rgba(255,255,255,0.08), transparent 40%)' }"
              />

              <template v-if="c.image_url">
                <div class="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
                  <img :src="c.image_url" :alt="c.title" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/80 to-[#0b0d12]/40" />
                </div>
              </template>

              <div class="relative h-full flex flex-col p-6">
                <div class="flex items-start justify-between gap-3 mb-5">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 font-mono text-[0.65rem] font-bold tracking-wider">
                      {{ categoryEmoji(c.category) }}
                    </span>
                    <span class="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-white/50">{{ c.category || 'Quest' }}</span>
                  </div>
                  <div class="flex items-center gap-0.5">
                    <Gem v-for="n in 3" :key="n" :size="12"
                      :class="n <= diffMeta(c.difficulty).stars ? diffMeta(c.difficulty).accent : 'text-white/10'" />
                  </div>
                </div>

                <div class="mb-5">
                  <p class="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-white/40 mb-2 flex items-center gap-1.5">
                    <Building2 :size="10" /> Uitgevaardigd door
                  </p>
                  <p class="text-sm font-bold text-white/90 truncate">{{ c.company_name }}</p>
                </div>

                <h3 class="text-2xl md:text-[1.65rem] font-bold tracking-tight leading-[1.1] mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                  {{ c.title }}
                </h3>

                <p class="text-sm text-white/60 leading-relaxed line-clamp-3">{{ c.description }}</p>

                <div class="mt-auto pt-6">
                  <div class="flex items-center justify-between mb-3">
                    <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border', diffMeta(c.difficulty).tag]">
                      <component :is="diffMeta(c.difficulty).icon" :size="10" />
                      {{ diffMeta(c.difficulty).label }}
                    </span>
                    <span v-if="daysUntil(c.deadline) !== null && urgency(daysUntil(c.deadline))"
                      :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-bold border', urgency(daysUntil(c.deadline))!.cls]">
                      <Clock :size="10" /> {{ urgency(daysUntil(c.deadline))!.label }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
                    <div class="min-w-0 flex-1">
                      <p class="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-white/40 mb-0.5">Reward</p>
                      <p v-if="c.prize" class="text-sm font-bold text-amber-300 truncate flex items-center gap-1.5">
                        <Trophy :size="12" class="shrink-0" /> {{ c.prize }}
                      </p>
                      <p v-else class="text-sm font-bold text-white/50 truncate">Eeuwige roem</p>
                    </div>
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 shrink-0 group-hover:scale-110 group-hover:bg-roc-400 group-hover:text-white transition-all">
                      <Zap :size="16" class="fill-current" />
                    </span>
                  </div>
                </div>

                <div class="absolute inset-x-0 bottom-0 h-1 overflow-hidden">
                  <div :class="['h-full transition-transform duration-500 origin-left scale-x-0 group-hover:scale-x-100', diffMeta(c.difficulty).bar]" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <button
      class="md:hidden fixed bottom-6 right-6 z-40 bg-roc-500 hover:bg-roc-400 text-white w-14 h-14 rounded-full shadow-2xl shadow-roc-500/40 flex items-center justify-center transition-all hover:scale-105"
      aria-label="Plaats een quest"
      @click="showForm = true"
    >
      <Plus :size="22" />
    </button>

    <div
      v-if="detail"
      class="fixed inset-0 z-[150] flex items-center justify-center p-3 md:p-4 animate-fadein"
      :style="{ backgroundColor: 'rgba(5,7,12,0.85)', backdropFilter: 'blur(14px)' }"
      @click="detail = null"
    >
      <div class="relative bg-[#0f1218] border border-white/10 rounded-[1.75rem] md:rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col" @click.stop>
        <div class="relative h-36 sm:h-44 md:h-52 overflow-hidden shrink-0">
          <img v-if="detail.image_url" :src="detail.image_url" :alt="detail.title" class="w-full h-full object-cover" />
          <div v-else :class="['w-full h-full bg-gradient-to-br', diffMeta(detail.difficulty).from, 'to-[#0b0d12]', 'flex items-center justify-center']">
            <Swords :size="80" class="text-white/20" />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f1218] via-[#0f1218]/40 to-transparent" />
          <button aria-label="Sluiten" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors" @click="detail = null">
            <X :size="18" />
          </button>
          <div class="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <span :class="['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider border', diffMeta(detail.difficulty).tag]">
                <component :is="diffMeta(detail.difficulty).icon" :size="11" />
                {{ diffMeta(detail.difficulty).label }}
              </span>
              <span v-if="detail.category" class="inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wider text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {{ detail.category }}
              </span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{{ detail.title }}</h2>
            <p class="text-white/60 text-sm mt-2 flex items-center gap-1.5">
              <Building2 :size="13" /> {{ detail.company_name }}
            </p>
          </div>
        </div>

        <div class="p-5 md:p-7 overflow-y-auto min-h-0 flex-1 overscroll-contain">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
            <div v-if="detail.deadline" class="rounded-2xl p-3 bg-white/5 border border-white/10">
              <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/40 mb-1"><Calendar :size="11" /> Deadline</div>
              <div class="text-sm font-bold">{{ fmtLong(detail.deadline) }}</div>
            </div>
            <div v-if="detail.duration" class="rounded-2xl p-3 bg-white/5 border border-white/10">
              <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/40 mb-1"><Clock :size="11" /> Duur</div>
              <div class="text-sm font-bold">{{ detail.duration }}</div>
            </div>
            <div v-if="detail.prize" class="rounded-2xl p-3 bg-amber-500/10 border border-amber-400/30">
              <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-200/80 mb-1"><Trophy :size="11" /> Reward</div>
              <div class="text-sm font-bold text-amber-200">{{ detail.prize }}</div>
            </div>
            <div class="rounded-2xl p-3 bg-white/5 border border-white/10">
              <div class="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white/40 mb-1"><Gem :size="11" /> Niveau</div>
              <div class="text-sm font-bold flex items-center gap-0.5">
                <Gem v-for="n in 3" :key="n" :size="12"
                  :class="n <= diffMeta(detail.difficulty).stars ? diffMeta(detail.difficulty).accent : 'text-white/15'" />
              </div>
            </div>
          </div>

          <h3 class="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Briefing</h3>
          <p class="text-white/80 leading-relaxed whitespace-pre-wrap">{{ detail.description }}</p>

          <a
            v-if="detail.contact_email"
            :href="`mailto:${detail.contact_email}?subject=${encodeURIComponent('Quest: ' + detail.title)}`"
            class="mt-8 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-400 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg shadow-roc-500/30"
          >
            <Swords :size="16" /> Accepteer quest
          </a>
        </div>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadein"
      :style="{ backgroundColor: 'rgba(5,7,12,0.85)', backdropFilter: 'blur(10px)' }"
      @click="showForm = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain" @click.stop>
        <div class="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Plaats een quest</h2>
            <p class="text-xs text-gray-500 mt-0.5">Je challenge wordt eerst beoordeeld.</p>
          </div>
          <button class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500" @click="showForm = false">
            <X :size="18" />
          </button>
        </div>

        <div class="p-7 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Titel <span class="text-roc-500">*</span></label>
            <input v-model="form.title" class="form-input" placeholder="Naam van de quest" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Cover afbeelding (URL)</label>
            <div class="relative">
              <ImageIcon :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input v-model="form.image_url" class="form-input pl-10" placeholder="https://..." />
            </div>
            <div v-if="form.image_url" class="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-32">
              <img :src="form.image_url" alt="preview" class="w-full h-full object-cover" @error="($event.target as HTMLImageElement).style.display='none'" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Beschrijving <span class="text-roc-500">*</span></label>
            <textarea v-model="form.description" :rows="4" class="form-input !rounded-2xl" placeholder="Wat moet er gebouwd worden? Wat is de context?" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Bedrijf <span class="text-roc-500">*</span></label>
              <input v-model="form.company_name" class="form-input" placeholder="Bedrijfsnaam" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Contact e-mail</label>
              <input v-model="form.contact_email" type="email" class="form-input" placeholder="contact@bedrijf.nl" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Categorie</label>
              <select v-model="form.category" class="form-input">
                <option v-for="c in CATEGORIES.filter((x) => x !== 'Alle')" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Duur</label>
              <input v-model="form.duration" class="form-input" placeholder="Bijv. 2-4 weken" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Deadline</label>
              <input v-model="form.deadline" type="date" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Prijs</label>
              <input v-model="form.prize" class="form-input" placeholder="€500 / stage / ..." />
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Niveau</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="d in (['beginner', 'intermediate', 'advanced'] as const)" :key="d" type="button"
                :class="['flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold border transition-colors',
                  form.difficulty === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400']"
                @click="form.difficulty = d"
              >
                <component :is="diffMeta(d).icon" :size="12" /> {{ diffMeta(d).label }}
              </button>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex gap-3 rounded-b-3xl">
          <button class="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors" @click="showForm = false">Annuleren</button>
          <button :disabled="submitting" class="flex-1 bg-roc-500 hover:bg-roc-600 text-white py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60" @click="handleSubmit">
            {{ submitting ? 'Verzenden…' : 'Indienen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-card {
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.quest-card:hover {
  transform: rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
}
.quest-card-inner {
  transform: translateZ(0);
  backface-visibility: hidden;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.animate-fadein { animation: fadein 0.25s ease-out; }
@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
