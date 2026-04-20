<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Code as Code2, Plus, ExternalLink, GitBranch, Search, Upload, X,
  Image as ImageIcon, Film, CircleCheck as CheckCircle2, CircleAlert as AlertCircle,
  ArrowRight, ArrowUpRight, Sparkles, Play, Users, Rocket, Flame,
  ChevronRight, Clock, Zap, LayoutGrid, Filter
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'
import { useScrollAnimation } from '../composables/useScrollAnimation'

const TECH_OPTIONS = ['React', 'TypeScript', 'Node.js', 'Python', 'Vue', 'Next.js', 'Laravel', 'Flutter']
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'
const MAX_MB = 50

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

useScrollAnimation()

const projects = ref<Project[]>([])
const loading = ref(true)
const showForm = ref(false)
const search = ref('')
const activeTech = ref<string | null>(null)
const activeProject = ref<Project | null>(null)
const form = ref({
  title: '', description: '', author_name: '', author_email: '',
  github_url: '', demo_url: '', image_url: '', media_type: 'image' as 'image' | 'video',
  tech_stack: [] as string[],
})
const submitting = ref(false)
const submitted = ref(false)
const uploadState = ref<UploadState>('idle')
const uploadProgress = ref(0)
const uploadError = ref('')
const previewUrl = ref('')
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const fetchProjects = async () => {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
  projects.value = data ?? []
  loading.value = false
}

let channel: ReturnType<typeof supabase.channel> | null = null
onMounted(() => {
  fetchProjects()
  channel = supabase
    .channel('projects-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
    .subscribe()
})
onBeforeUnmount(() => { if (channel) supabase.removeChannel(channel) })

const toggleTech = (tech: string) => {
  const list = form.value.tech_stack
  form.value.tech_stack = list.includes(tech) ? list.filter((t) => t !== tech) : [...list, tech]
}

const handleFile = async (file: File) => {
  uploadError.value = ''
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')
  if (!isVideo && !isImage) {
    uploadError.value = "Alleen afbeeldingen (JPG, PNG, WebP, GIF) en video's (MP4, WebM) zijn toegestaan."
    return
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    uploadError.value = `Bestand is te groot. Maximum is ${MAX_MB} MB.`
    return
  }

  uploadState.value = 'uploading'
  uploadProgress.value = 10

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const interval = setInterval(() => {
    uploadProgress.value = Math.min(uploadProgress.value + 15, 85)
  }, 300)

  const { data, error } = await supabase.storage
    .from('project-media')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  clearInterval(interval)

  if (error || !data) {
    uploadState.value = 'error'
    uploadError.value = 'Upload mislukt. Probeer opnieuw.'
    return
  }

  const { data: { publicUrl } } = supabase.storage.from('project-media').getPublicUrl(data.path)

  uploadProgress.value = 100
  uploadState.value = 'done'
  previewUrl.value = publicUrl
  form.value.image_url = publicUrl
  form.value.media_type = isVideo ? 'video' : 'image'
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) handleFile(file)
}

const clearMedia = () => {
  previewUrl.value = ''
  uploadState.value = 'idle'
  uploadProgress.value = 0
  uploadError.value = ''
  form.value.image_url = ''
  form.value.media_type = 'image'
  if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = async () => {
  const f = form.value
  if (!f.title || !f.description || !f.author_name) return
  submitting.value = true
  await supabase.from('projects').insert({ ...f, status: 'pending' })
  submitting.value = false
  submitted.value = true
  showForm.value = false
  clearMedia()
  form.value = {
    title: '', description: '', author_name: '', author_email: '',
    github_url: '', demo_url: '', image_url: '', media_type: 'image', tech_stack: [],
  }
  setTimeout(() => { submitted.value = false }, 4000)
}

const isVideoUrl = (p: Project) =>
  p.media_type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(p.image_url ?? '')

const daysAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 86_400_000
  if (d < 1) return 'Vandaag'
  if (d < 2) return 'Gisteren'
  if (d < 7) return `${Math.floor(d)} dagen geleden`
  return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
}

const isNew = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86_400_000 < 14

const availableTech = computed(() => {
  const set = new Set<string>()
  projects.value.forEach((p) => p.tech_stack?.forEach((t) => set.add(t)))
  return Array.from(set).slice(0, 14)
})

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return projects.value.filter((p) => {
    const matchQ = !q
      || p.title.toLowerCase().includes(q)
      || p.author_name.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || p.tech_stack?.some((t) => t.toLowerCase().includes(q))
    const matchTech = !activeTech.value || p.tech_stack?.includes(activeTech.value)
    return matchQ && matchTech
  })
})

const featured = computed(() => filtered.value[0] ?? null)
const rest = computed(() => filtered.value.slice(1))

const stats = computed(() => ({
  total: projects.value.length,
  makers: new Set(projects.value.map((p) => p.author_name)).size,
  techs: availableTech.value.length,
  fresh: projects.value.filter((p) => isNew(p.created_at)).length,
}))

const marqueeItems = computed(() => {
  const base = projects.value.slice(0, 10).map((p) => p.title)
  return base.length ? [...base, ...base] : ['Studenten bouwen de toekomst', 'Nieuwe drops elke week', 'Ingezonden door ROC van Flevoland', 'Software Talent Hub']
})
</script>

<template>
  <div class="min-h-screen bg-stone-50">
    <section class="relative pt-36 md:pt-44 pb-10 md:pb-14 bg-gradient-to-b from-white via-stone-50 to-stone-50 overflow-hidden border-b border-stone-200/80">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-20 right-[10%] w-[30rem] h-[30rem] rounded-full bg-roc-100/60 blur-3xl" />
        <div class="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl" />
        <div
          class="absolute inset-0 opacity-[0.035]"
          :style="{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }"
        />
      </div>

      <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
        <div class="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Home</span>
          <ChevronRight :size="12" />
          <span class="text-roc-500 font-semibold">Projecten</span>
        </div>

        <div class="grid md:grid-cols-12 gap-10 items-end">
          <div class="md:col-span-8">
            <div class="flex items-center gap-3 mb-8">
              <span class="inline-flex items-center gap-2 bg-white border border-roc-100 text-roc-600 rounded-full pl-2 pr-4 py-1.5 text-xs font-bold tracking-[0.2em] uppercase shadow-sm">
                <span class="w-5 h-5 rounded-full bg-roc-500 flex items-center justify-center text-white">
                  <Sparkles :size="10" />
                </span>
                Vol. 01 — Software Talent Hub
              </span>
              <span class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                <span class="relative flex w-2 h-2">
                  <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live feed
              </span>
            </div>

            <h1 class="font-bold text-gray-900 tracking-[-0.04em] leading-[0.88]">
              <span class="block text-[3.75rem] sm:text-[5rem] md:text-[7.5rem] lg:text-[9rem]">Projecten</span>
              <span class="block text-[3.75rem] sm:text-[5rem] md:text-[7.5rem] lg:text-[9rem] text-roc-500 italic font-serif -mt-2 md:-mt-4">gebouwd.</span>
            </h1>

            <p class="mt-8 max-w-2xl text-lg md:text-xl text-gray-600 leading-relaxed">
              Een levende gallery van wat studenten bij ROC van Flevoland bouwen — apps, games, platforms en experimenten. Nieuw werk verschijnt wekelijks.
            </p>
          </div>

          <div class="md:col-span-4 md:pl-10 md:border-l md:border-stone-200">
            <div class="grid grid-cols-2 gap-5">
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Projecten</p>
                <p class="text-4xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Makers</p>
                <p class="text-4xl font-bold text-gray-900">{{ stats.makers }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Technologieën</p>
                <p class="text-4xl font-bold text-gray-900">{{ stats.techs }}</p>
              </div>
              <div>
                <p class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-1">Deze week</p>
                <p class="text-4xl font-bold text-roc-500">{{ stats.fresh }}</p>
              </div>
            </div>

            <button
              class="mt-7 w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-roc-500 text-white font-semibold px-6 py-4 rounded-full text-sm shadow-xl shadow-gray-900/10 transition-all group"
              @click="showForm = true"
            >
              <Plus :size="16" class="group-hover:rotate-90 transition-transform duration-300" />
              Project indienen
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="relative bg-gray-900 text-white overflow-hidden">
      <div class="flex gap-12 py-4 whitespace-nowrap marquee">
        <div v-for="(item, i) in marqueeItems" :key="i" class="inline-flex items-center gap-4 shrink-0 text-sm font-semibold tracking-wide">
          <Flame :size="14" class="text-roc-400" />
          <span>{{ item }}</span>
          <span class="text-white/20">·</span>
        </div>
      </div>
    </section>

    <section class="sticky top-0 z-30 bg-stone-50/85 backdrop-blur-xl border-b border-stone-200/70">
      <div class="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div class="flex-1 relative">
          <Search :size="16" class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="search" type="text" placeholder="Zoek op titel, maker, stack…"
            class="w-full pl-12 pr-4 py-3.5 rounded-full bg-white border border-stone-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition-all"
          />
        </div>

        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span class="flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-gray-400 shrink-0 pr-1">
            <Filter :size="12" /> Stack
          </span>
          <button
            :class="['px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0',
              activeTech === null ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-stone-200 hover:border-gray-900']"
            @click="activeTech = null"
          >Alle</button>
          <button
            v-for="t in availableTech" :key="t"
            :class="['px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0',
              activeTech === t ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-stone-200 hover:border-gray-900']"
            @click="activeTech = activeTech === t ? null : t"
          >{{ t }}</button>
        </div>
      </div>
    </section>

    <div v-if="submitted" class="max-w-[1400px] mx-auto px-6 md:px-10 pt-6">
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-2">
        <CheckCircle2 :size="16" /> Je project is ingediend en wacht op goedkeuring.
      </div>
    </div>

    <section class="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 md:pt-14">
      <div v-if="loading" class="grid md:grid-cols-12 gap-6">
        <div class="md:col-span-8 bg-stone-200/70 rounded-3xl h-[28rem] animate-pulse" />
        <div class="md:col-span-4 space-y-6">
          <div class="bg-stone-200/70 rounded-3xl h-40 animate-pulse" />
          <div class="bg-stone-200/70 rounded-3xl h-40 animate-pulse" />
        </div>
      </div>

      <div v-else-if="filtered.length === 0" class="text-center py-24 text-gray-500">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white border border-stone-200 flex items-center justify-center text-gray-300 shadow-sm">
          <Code2 :size="32" />
        </div>
        <p class="text-xl font-bold text-gray-900">Nog geen projecten in deze selectie</p>
        <p class="text-sm mt-2">Pas je filters aan, of wees de eerste om iets te delen.</p>
        <button
          class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full mt-6 text-sm shadow-lg"
          @click="showForm = true"
        ><Plus :size="15" /> Project indienen</button>
      </div>

      <template v-else>
        <div v-if="featured" class="mb-10 md:mb-14" data-animate>
          <div class="flex items-center gap-3 mb-5">
            <span class="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full text-[0.65rem] font-bold tracking-[0.2em] uppercase">
              <Rocket :size="11" /> Featured drop
            </span>
            <span class="h-px flex-1 bg-stone-200" />
            <span class="text-xs text-gray-400 font-medium">{{ daysAgo(featured.created_at) }}</span>
          </div>

          <article
            class="group relative grid md:grid-cols-12 gap-0 rounded-[2rem] overflow-hidden bg-white border border-stone-200 hover:border-gray-900 transition-colors shadow-sm hover:shadow-2xl cursor-pointer"
            @click="activeProject = featured"
          >
            <div class="md:col-span-7 relative aspect-[16/10] md:aspect-auto md:min-h-[28rem] overflow-hidden bg-stone-100">
              <template v-if="featured.image_url">
                <video
                  v-if="isVideoUrl(featured)" :src="featured.image_url"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  autoplay muted loop playsinline
                />
                <img
                  v-else :src="featured.image_url" :alt="featured.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </template>
              <div v-else class="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                <Code2 :size="48" class="text-stone-300" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              <div v-if="isNew(featured.created_at)" class="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-roc-500 text-white px-3 py-1.5 rounded-full text-[0.65rem] font-bold tracking-[0.2em] uppercase shadow-lg">
                <Zap :size="11" /> Nieuw
              </div>
              <div v-if="isVideoUrl(featured)" class="absolute bottom-5 left-5 inline-flex items-center gap-2 bg-white/95 backdrop-blur text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                <Play :size="11" class="fill-current" /> Live demo
              </div>
            </div>

            <div class="md:col-span-5 p-7 md:p-10 flex flex-col">
              <div v-if="featured.tech_stack?.length" class="flex flex-wrap gap-1.5 mb-5">
                <span
                  v-for="t in featured.tech_stack" :key="t"
                  class="text-[0.7rem] font-bold bg-stone-100 text-gray-700 px-2.5 py-1 rounded-md"
                >{{ t }}</span>
              </div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-4 group-hover:text-roc-500 transition-colors">
                {{ featured.title }}
              </h2>
              <p class="text-gray-600 leading-relaxed mb-6 line-clamp-5">{{ featured.description }}</p>

              <div class="flex items-center gap-3 pb-6 mb-6 border-b border-stone-100">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-roc-400 to-roc-600 text-white flex items-center justify-center font-bold text-sm">
                  {{ featured.author_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ featured.author_name }}</p>
                  <p class="text-xs text-gray-400">Student · ROC van Flevoland</p>
                </div>
              </div>

              <div class="flex items-center gap-3 mt-auto">
                <a
                  v-if="featured.demo_url" :href="featured.demo_url" target="_blank" rel="noreferrer"
                  class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-3 rounded-full text-sm shadow-lg shadow-roc-500/20 transition-all"
                  @click.stop
                >
                  <ExternalLink :size="14" /> Open demo
                </a>
                <a
                  v-if="featured.github_url" :href="featured.github_url" target="_blank" rel="noreferrer"
                  class="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-gray-900 font-semibold px-5 py-3 rounded-full text-sm border border-stone-200 hover:border-gray-900 transition-all"
                  @click.stop
                >
                  <GitBranch :size="14" /> Source
                </a>
                <span class="ml-auto text-gray-300 group-hover:text-roc-500 group-hover:translate-x-1 transition-all">
                  <ArrowUpRight :size="28" />
                </span>
              </div>
            </div>
          </article>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase text-gray-500">
            <LayoutGrid :size="14" /> Alle drops
            <span class="text-gray-300">· {{ rest.length }}</span>
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[22rem] gap-5 md:gap-6 pb-20">
          <article
            v-for="(project, i) in rest" :key="project.id"
            :class="[
              'group relative overflow-hidden rounded-3xl bg-white border border-stone-200 hover:border-gray-900 hover:shadow-2xl transition-all cursor-pointer flex flex-col',
              i % 7 === 0 ? 'sm:col-span-2 sm:row-span-1' : '',
              i % 11 === 3 ? 'lg:row-span-2 lg:h-auto' : ''
            ]"
            data-animate
            :data-animate-delay="`${Math.min(i * 60, 420)}`"
            @click="activeProject = project"
          >
            <div class="relative flex-1 overflow-hidden bg-stone-100">
              <template v-if="project.image_url">
                <video
                  v-if="isVideoUrl(project)" :src="project.image_url"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  autoplay muted loop playsinline
                />
                <img
                  v-else :src="project.image_url" :alt="project.title"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </template>
              <div v-else class="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center">
                <Code2 :size="36" class="text-stone-300" />
              </div>

              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

              <div class="absolute top-4 left-4 flex items-center gap-2">
                <span v-if="isNew(project.created_at)" class="inline-flex items-center gap-1 bg-roc-500 text-white px-2.5 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase shadow-lg">
                  <Zap :size="9" /> Nieuw
                </span>
                <span v-if="isVideoUrl(project)" class="inline-flex items-center gap-1 bg-white/90 backdrop-blur text-gray-900 px-2.5 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase shadow">
                  <Play :size="9" class="fill-current" /> Video
                </span>
              </div>

              <div class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-900 shadow-md opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                <ArrowUpRight :size="16" />
              </div>

              <div class="absolute inset-x-0 bottom-0 p-5 text-white">
                <div v-if="project.tech_stack?.length" class="flex flex-wrap gap-1 mb-2.5">
                  <span
                    v-for="t in project.tech_stack.slice(0, 3)" :key="t"
                    class="text-[0.6rem] font-bold bg-white/15 backdrop-blur text-white px-2 py-0.5 rounded-md tracking-wide"
                  >{{ t }}</span>
                </div>
                <h4 class="text-xl font-bold leading-tight mb-1.5 line-clamp-2 tracking-tight">{{ project.title }}</h4>
                <div class="flex items-center gap-2 text-xs text-white/70">
                  <Users :size="11" />
                  <span>{{ project.author_name }}</span>
                  <span>·</span>
                  <Clock :size="11" />
                  <span>{{ daysAgo(project.created_at) }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <button
      class="md:hidden fixed bottom-6 right-6 z-40 bg-roc-500 hover:bg-roc-600 text-white w-14 h-14 rounded-full shadow-2xl shadow-roc-500/30 flex items-center justify-center transition-all hover:scale-105"
      aria-label="Project indienen"
      @click="showForm = true"
    >
      <Plus :size="22" />
    </button>

    <div
      v-if="activeProject"
      class="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fadein"
      :style="{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }"
      @click="activeProject = null"
    >
      <div
        class="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden grid md:grid-cols-2"
        @click.stop
      >
        <div class="relative bg-black md:min-h-[32rem] aspect-video md:aspect-auto">
          <template v-if="activeProject.image_url">
            <video v-if="isVideoUrl(activeProject)" :src="activeProject.image_url" class="w-full h-full object-contain" autoplay controls loop playsinline />
            <img v-else :src="activeProject.image_url" :alt="activeProject.title" class="w-full h-full object-contain" />
          </template>
          <div v-else class="w-full h-full flex items-center justify-center text-stone-400">
            <Code2 :size="64" />
          </div>
          <button
            aria-label="Sluiten"
            class="md:hidden absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-lg"
            @click="activeProject = null"
          ><X :size="18" /></button>
        </div>

        <div class="p-8 md:p-10 overflow-y-auto flex flex-col">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div v-if="activeProject.tech_stack?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="t in activeProject.tech_stack" :key="t"
                class="text-[0.7rem] font-bold bg-stone-100 text-gray-700 px-2.5 py-1 rounded-md"
              >{{ t }}</span>
            </div>
            <button
              aria-label="Sluiten"
              class="hidden md:flex w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-gray-700 items-center justify-center shrink-0"
              @click="activeProject = null"
            ><X :size="18" /></button>
          </div>

          <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-4">{{ activeProject.title }}</h2>

          <div class="flex items-center gap-3 pb-6 mb-6 border-b border-stone-100">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-roc-400 to-roc-600 text-white flex items-center justify-center font-bold text-sm">
              {{ activeProject.author_name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-gray-900">{{ activeProject.author_name }}</p>
              <p class="text-xs text-gray-400">{{ daysAgo(activeProject.created_at) }} · Student</p>
            </div>
          </div>

          <p class="text-gray-600 leading-relaxed whitespace-pre-line mb-8">{{ activeProject.description }}</p>

          <div class="flex flex-wrap items-center gap-3 mt-auto pt-4">
            <a
              v-if="activeProject.demo_url" :href="activeProject.demo_url" target="_blank" rel="noreferrer"
              class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-3 rounded-full text-sm shadow-lg shadow-roc-500/20 transition-all"
            >
              <ExternalLink :size="14" /> Live demo
            </a>
            <a
              v-if="activeProject.github_url" :href="activeProject.github_url" target="_blank" rel="noreferrer"
              class="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-gray-900 font-semibold px-5 py-3 rounded-full text-sm border border-stone-200 hover:border-gray-900 transition-all"
            >
              <GitBranch :size="14" /> Source code
            </a>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadein"
      :style="{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }"
      @click="showForm = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col" @click.stop>
        <div class="sticky top-0 bg-white border-b border-gray-100 px-7 py-5 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Project indienen</h2>
            <p class="text-xs text-gray-500 mt-0.5">Wacht op goedkeuring voordat het zichtbaar is.</p>
          </div>
          <button class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500" @click="showForm = false">
            <X :size="18" />
          </button>
        </div>

        <div class="p-7 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Afbeelding of video
              <span class="ml-1.5 text-xs font-normal text-gray-400">max {{ MAX_MB }} MB — JPG, PNG, WebP, GIF, MP4, WebM</span>
            </label>

            <div
              v-if="uploadState !== 'done'"
              :class="[
                'relative w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
                dragOver ? 'border-roc-500 bg-roc-50 cursor-copy'
                  : uploadState === 'uploading' ? 'border-gray-200 bg-gray-50 cursor-default'
                  : 'border-gray-200 bg-gray-50 hover:border-roc-400 hover:bg-roc-50 cursor-pointer'
              ]"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop="onDrop"
              @click="uploadState !== 'uploading' && fileInput?.click()"
            >
              <div v-if="uploadState === 'uploading'" class="flex flex-col items-center gap-3 w-48">
                <Upload :size="22" class="text-roc-500 animate-bounce" />
                <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-roc-500 rounded-full transition-all duration-300" :style="{ width: `${uploadProgress}%` }" />
                </div>
                <span class="text-xs text-gray-500">Uploaden… {{ uploadProgress }}%</span>
              </div>
              <template v-else>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <ImageIcon :size="18" class="text-gray-400" />
                  </div>
                  <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <Film :size="18" class="text-gray-400" />
                  </div>
                </div>
                <p class="text-sm font-medium text-gray-600 text-center">
                  Sleep een bestand hierheen<br />
                  <span class="text-roc-500 font-semibold">of klik om te bladeren</span>
                </p>
              </template>
              <input ref="fileInput" type="file" :accept="ACCEPTED" class="hidden" @change="onFileChange" />
            </div>

            <div v-else class="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
              <video v-if="form.media_type === 'video'" :src="previewUrl" controls class="w-full max-h-52 object-cover" />
              <img v-else :src="previewUrl" alt="preview" class="w-full max-h-52 object-cover" />
              <div class="absolute top-2 right-2 flex items-center gap-2">
                <span class="inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-600 shadow-sm">
                  <CheckCircle2 :size="12" />
                  {{ form.media_type === 'video' ? 'Video' : 'Afbeelding' }} geupload
                </span>
                <button
                  aria-label="Verwijder"
                  class="w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-gray-600 backdrop-blur"
                  @click.stop="clearMedia"
                >
                  <X :size="14" />
                </button>
              </div>
            </div>

            <div v-if="uploadError" class="mt-2 flex items-center gap-1.5 text-xs text-rose-600">
              <AlertCircle :size="13" /> {{ uploadError }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Projectnaam <span class="text-roc-500">*</span></label>
            <input v-model="form.title" class="form-input" placeholder="Mijn project" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Beschrijving <span class="text-roc-500">*</span></label>
            <textarea v-model="form.description" :rows="3" class="form-input !rounded-2xl" placeholder="Wat heb je gebouwd?" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Naam <span class="text-roc-500">*</span></label>
              <input v-model="form.author_name" class="form-input" placeholder="Jouw naam" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">E-mail</label>
              <input v-model="form.author_email" type="email" class="form-input" placeholder="naam@email.nl" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">GitHub URL</label>
              <input v-model="form.github_url" class="form-input" placeholder="github.com/..." />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">Demo URL</label>
              <input v-model="form.demo_url" class="form-input" placeholder="mijnproject.nl" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Technologieën</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="t in TECH_OPTIONS" :key="t" type="button"
                :class="['px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors', form.tech_stack.includes(t) ? 'bg-roc-500 text-white border-roc-500' : 'bg-white text-gray-600 border-gray-200 hover:border-roc-300']"
                @click="toggleTech(t)"
              >{{ t }}</button>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white border-t border-gray-100 px-7 py-4 flex gap-3 rounded-b-3xl">
          <button class="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors" @click="showForm = false">Annuleren</button>
          <button
            :disabled="submitting || uploadState === 'uploading'"
            class="flex-1 bg-roc-500 hover:bg-roc-600 text-white py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
            @click="handleSubmit"
          >{{ submitting ? 'Verzenden…' : 'Indienen' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  animation: marquee 40s linear infinite;
  will-change: transform;
}
@keyframes marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.animate-fadein { animation: fadein 0.25s ease-out; }
@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
