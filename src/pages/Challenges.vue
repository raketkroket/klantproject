<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Trophy, Plus, Calendar, Building2, Clock, Tag, ArrowRight, X,
  Sparkles, Flame, Target, Search, Image as ImageIcon,
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import type { Challenge } from '../types'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const DIFFICULTY_META = {
  beginner:     { label: 'Beginner',  dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Sparkles },
  intermediate: { label: 'Gevorderd', dot: 'bg-amber-500',   pill: 'bg-amber-50 text-amber-700 border-amber-100',       icon: Flame    },
  advanced:     { label: 'Expert',    dot: 'bg-rose-500',    pill: 'bg-rose-50 text-rose-700 border-rose-100',          icon: Target   },
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

const featured = computed(() => filtered.value[0])
const rest = computed(() => filtered.value.slice(1))

const daysUntil = (deadline?: string | null) => {
  if (!deadline) return null
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

const companyCount = computed(() => new Set(challenges.value.map((c) => c.company_name)).size)
const prizedCount = computed(() => challenges.value.filter((c) => c.prize).length)

const diffMeta = (d: Challenge['difficulty']) => DIFFICULTY_META[d ?? 'beginner']

const fmtShort = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
const fmtLong = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

const deadlineClass = (days: number | null) => {
  if (days === null) return ''
  if (days < 0) return 'bg-gray-100 text-gray-500'
  if (days <= 7) return 'bg-rose-50 text-rose-600 border border-rose-100'
  return 'bg-white/80 text-gray-700 border border-gray-200 backdrop-blur'
}
const deadlineText = (days: number | null) => {
  if (days === null) return ''
  if (days < 0) return 'Verlopen'
  if (days === 0) return 'Vandaag'
  return `${days} dagen`
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white">
    <div class="relative w-full overflow-hidden bg-gray-900">
      <img
        src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Challenges"
        class="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-transparent" />
      <div
        class="absolute inset-0 opacity-20 pointer-events-none"
        :style="{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)', backgroundSize: '24px 24px' }"
      />

      <div class="relative max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-20 md:pt-40 md:pb-28">
        <div class="flex items-center gap-2 text-roc-300 text-xs font-bold tracking-widest uppercase mb-3">
          <Trophy :size="14" /> Voor studenten
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] max-w-3xl">
          Los echte challenges op van <span class="text-roc-400">echte bedrijven</span>.
        </h1>
        <p class="text-white/70 text-base md:text-lg mt-5 max-w-2xl leading-relaxed">
          Zet je vaardigheden in praktijk, bouw aan je portfolio en maak kans op prijzen,
          stages en werkervaring bij bedrijven uit Flevoland.
        </p>

        <div class="flex flex-wrap gap-3 mt-8">
          <button
            class="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            @click="showForm = true"
          >
            <Plus :size="16" /> Challenge plaatsen
          </button>
          <a href="#overzicht" class="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold px-6 py-3 rounded-full transition-colors border border-white/20">
            Bekijk overzicht <ArrowRight :size="16" />
          </a>
        </div>

        <div class="grid grid-cols-3 gap-4 md:gap-8 mt-12 max-w-xl">
          <div><div class="text-3xl md:text-4xl font-bold text-white">{{ challenges.length }}</div><div class="text-xs md:text-sm text-white/60 mt-1">Open challenges</div></div>
          <div><div class="text-3xl md:text-4xl font-bold text-white">{{ companyCount }}</div><div class="text-xs md:text-sm text-white/60 mt-1">Bedrijven</div></div>
          <div><div class="text-3xl md:text-4xl font-bold text-white">{{ prizedCount }}</div><div class="text-xs md:text-sm text-white/60 mt-1">Met prijzen</div></div>
        </div>
      </div>
    </div>

    <div id="overzicht" class="sticky top-[72px] z-20 bg-white/90 backdrop-blur border-b border-gray-100">
      <div class="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div class="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            v-for="c in CATEGORIES" :key="c"
            :class="['shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors', activeCategory === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            @click="activeCategory = c"
          >{{ c }}</button>
        </div>
        <div class="relative md:w-72">
          <Search :size="15" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="search" placeholder="Zoek op titel of bedrijf…"
            class="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50"
          />
        </div>
      </div>
    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-20">
      <div v-if="submitted" class="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
        <Sparkles :size="16" /> Je challenge is ingediend en wacht op goedkeuring.
      </div>

      <div v-if="loading" class="space-y-8">
        <div class="h-80 bg-gray-100 rounded-3xl animate-pulse" />
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
      <div v-else-if="filtered.length === 0" class="text-center py-24 border border-dashed border-gray-200 rounded-3xl bg-gray-50">
        <div class="w-16 h-16 rounded-2xl bg-white shadow-sm mx-auto flex items-center justify-center mb-5">
          <Trophy :size="28" class="text-gray-400" />
        </div>
        <h3 class="font-bold text-gray-900 text-lg">Geen challenges in deze categorie</h3>
        <p class="text-sm text-gray-500 mt-1">Wees de eerste en plaats zelf een challenge.</p>
        <button class="mt-6 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-2.5 rounded-full transition-colors text-sm" @click="showForm = true">
          <Plus :size="15" /> Challenge plaatsen
        </button>
      </div>
      <template v-else>
        <article
          v-if="featured"
          class="group relative grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
          data-animate
          @click="detail = featured"
        >
          <div class="relative h-64 md:h-auto min-h-[320px] bg-gray-100 overflow-hidden">
            <img v-if="featured.image_url" :src="featured.image_url" :alt="featured.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div v-else class="w-full h-full bg-gradient-to-br from-roc-500 to-roc-700 flex items-center justify-center">
              <Trophy :size="64" class="text-white/30" />
            </div>
            <div class="absolute top-4 left-4 flex gap-2">
              <span class="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur text-gray-900 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                <Sparkles :size="12" class="text-roc-500" /> Uitgelicht
              </span>
            </div>
            <div class="absolute top-4 right-4">
              <span v-if="daysUntil(featured.deadline) !== null" :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', deadlineClass(daysUntil(featured.deadline))]">
                <Clock :size="11" /> {{ deadlineText(daysUntil(featured.deadline)) }}
              </span>
            </div>
          </div>

          <div class="p-7 md:p-10 flex flex-col">
            <div class="flex items-center gap-2 mb-4 flex-wrap">
              <span v-if="featured.category" class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <Tag :size="11" /> {{ featured.category }}
              </span>
              <span :class="['inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', diffMeta(featured.difficulty).pill]">
                <component :is="diffMeta(featured.difficulty).icon" :size="11" />
                {{ diffMeta(featured.difficulty).label }}
              </span>
            </div>
            <h3 class="font-bold text-gray-900 text-2xl md:text-3xl leading-tight mb-3">{{ featured.title }}</h3>
            <p class="text-gray-600 leading-relaxed line-clamp-3 mb-6">{{ featured.description }}</p>

            <div class="mt-auto grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-sm">
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 text-gray-500"><Building2 :size="14" /></div>
                <div class="min-w-0"><div class="text-xs text-gray-400 font-medium">Bedrijf</div><div class="text-sm font-semibold truncate text-gray-900">{{ featured.company_name }}</div></div>
              </div>
              <div v-if="featured.deadline" class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 text-gray-500"><Calendar :size="14" /></div>
                <div class="min-w-0"><div class="text-xs text-gray-400 font-medium">Deadline</div><div class="text-sm font-semibold truncate text-gray-900">{{ fmtLong(featured.deadline) }}</div></div>
              </div>
              <div v-if="featured.duration" class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 text-gray-500"><Clock :size="14" /></div>
                <div class="min-w-0"><div class="text-xs text-gray-400 font-medium">Duur</div><div class="text-sm font-semibold truncate text-gray-900">{{ featured.duration }}</div></div>
              </div>
              <div v-if="featured.prize" class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 text-amber-600"><Trophy :size="14" /></div>
                <div class="min-w-0"><div class="text-xs text-gray-400 font-medium">Prijs</div><div class="text-sm font-semibold truncate text-amber-700">{{ featured.prize }}</div></div>
              </div>
            </div>

            <div class="mt-6 inline-flex items-center gap-2 text-roc-500 font-semibold text-sm group-hover:gap-3 transition-all">
              Bekijk challenge <ArrowRight :size="16" />
            </div>
          </div>
        </article>

        <template v-if="rest.length > 0">
          <div class="flex items-baseline justify-between mt-16 mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Meer challenges</h2>
            <span class="text-sm text-gray-400">{{ rest.length }} {{ rest.length === 1 ? 'challenge' : 'challenges' }}</span>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="(c, i) in rest" :key="c.id"
              class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-xl transition-all cursor-pointer flex flex-col"
              data-animate
              :data-animate-delay="`${Math.min(i * 100, 500)}`"
              @click="detail = c"
            >
              <div class="relative h-44 bg-gray-100 overflow-hidden">
                <img v-if="c.image_url" :src="c.image_url" :alt="c.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div v-else class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Trophy :size="40" class="text-white/20" />
                </div>
                <div class="absolute inset-x-3 top-3 flex justify-between">
                  <span :class="['inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border backdrop-blur', diffMeta(c.difficulty).pill]">
                    <span :class="['w-1.5 h-1.5 rounded-full', diffMeta(c.difficulty).dot]" />
                    {{ diffMeta(c.difficulty).label }}
                  </span>
                  <span v-if="daysUntil(c.deadline) !== null" :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', deadlineClass(daysUntil(c.deadline))]">
                    <Clock :size="11" /> {{ deadlineText(daysUntil(c.deadline)) }}
                  </span>
                </div>
                <div v-if="c.prize" class="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <Trophy :size="11" /> {{ c.prize }}
                </div>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Building2 :size="11" />
                  <span class="truncate font-medium">{{ c.company_name }}</span>
                  <template v-if="c.category"><span>·</span><span class="truncate">{{ c.category }}</span></template>
                </div>
                <h3 class="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-roc-600 transition-colors">{{ c.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{{ c.description }}</p>
                <div class="mt-auto flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <span v-if="c.deadline" class="flex items-center gap-1.5"><Calendar :size="12" />{{ fmtShort(c.deadline) }}</span>
                  <span v-else />
                  <span class="inline-flex items-center gap-1 text-roc-500 font-semibold group-hover:gap-2 transition-all">
                    Bekijk <ArrowRight :size="12" />
                  </span>
                </div>
              </div>
            </article>
          </div>
        </template>
      </template>
    </div>

    <!-- Detail modal -->
    <div
      v-if="detail"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      :style="{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }"
      @click="detail = null"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="relative h-56 md:h-72 bg-gray-100 overflow-hidden rounded-t-3xl">
          <img v-if="detail.image_url" :src="detail.image_url" :alt="detail.title" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-gradient-to-br from-roc-500 to-roc-700 flex items-center justify-center">
            <Trophy :size="72" class="text-white/30" />
          </div>
          <button aria-label="Sluiten" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-gray-700 transition-colors" @click="detail = null">
            <X :size="18" />
          </button>
        </div>
        <div class="p-7 md:p-10">
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <span :class="['inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', diffMeta(detail.difficulty).pill]">
              <span :class="['w-1.5 h-1.5 rounded-full', diffMeta(detail.difficulty).dot]" />
              {{ diffMeta(detail.difficulty).label }}
            </span>
            <span v-if="detail.category" class="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              <Tag :size="11" /> {{ detail.category }}
            </span>
            <span v-if="daysUntil(detail.deadline) !== null" :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', deadlineClass(daysUntil(detail.deadline))]">
              <Clock :size="11" /> {{ deadlineText(daysUntil(detail.deadline)) }}
            </span>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-3 leading-tight">{{ detail.title }}</h2>
          <p class="text-gray-500 text-sm mb-6 flex items-center gap-1.5">
            <Building2 :size="13" /> {{ detail.company_name }}
          </p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div v-if="detail.deadline" class="rounded-xl p-3 border bg-gray-50 border-gray-100">
              <div class="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1"><Calendar :size="12" /> Deadline</div>
              <div class="text-sm font-bold truncate text-gray-900">{{ fmtShort(detail.deadline) }}</div>
            </div>
            <div v-if="detail.duration" class="rounded-xl p-3 border bg-gray-50 border-gray-100">
              <div class="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1"><Clock :size="12" /> Duur</div>
              <div class="text-sm font-bold truncate text-gray-900">{{ detail.duration }}</div>
            </div>
            <div v-if="detail.prize" class="rounded-xl p-3 border bg-amber-50 border-amber-100">
              <div class="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1"><Trophy :size="12" /> Prijs</div>
              <div class="text-sm font-bold truncate text-amber-700">{{ detail.prize }}</div>
            </div>
            <div class="rounded-xl p-3 border bg-gray-50 border-gray-100">
              <div class="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1">
                <component :is="diffMeta(detail.difficulty).icon" :size="12" /> Niveau
              </div>
              <div class="text-sm font-bold truncate text-gray-900">{{ diffMeta(detail.difficulty).label }}</div>
            </div>
          </div>

          <h3 class="font-bold text-gray-900 mb-2">Omschrijving</h3>
          <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ detail.description }}</p>

          <a
            v-if="detail.contact_email"
            :href="`mailto:${detail.contact_email}?subject=${encodeURIComponent('Challenge: ' + detail.title)}`"
            class="mt-8 inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Neem contact op <ArrowRight :size="16" />
          </a>
        </div>
      </div>
    </div>

    <!-- Submit modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      :style="{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }"
      @click="showForm = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto" @click.stop>
        <div class="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Challenge plaatsen</h2>
            <p class="text-xs text-gray-500 mt-0.5">Je challenge wordt eerst beoordeeld.</p>
          </div>
          <button class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500" @click="showForm = false">
            <X :size="18" />
          </button>
        </div>

        <div class="p-7 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Titel <span class="text-roc-500">*</span></label>
            <input v-model="form.title" class="form-input" placeholder="Naam van de challenge" />
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
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Moeilijkheidsgraad</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="d in (['beginner', 'intermediate', 'advanced'] as const)" :key="d" type="button"
                :class="['flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold border transition-colors', form.difficulty === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400']"
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
