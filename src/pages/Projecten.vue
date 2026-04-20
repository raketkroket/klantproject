<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  Code as Code2, Plus, ExternalLink, GitBranch, Search,
  Upload, X, Image as ImageIcon, Film, CheckCircle2, AlertCircle,
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

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return projects.value.filter((p) =>
    p.title.toLowerCase().includes(q) ||
    p.author_name.toLowerCase().includes(q) ||
    p.tech_stack?.some((t) => t.toLowerCase().includes(q))
  )
})

const isVideoUrl = (p: Project) =>
  p.media_type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(p.image_url ?? '')
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="relative w-full h-52 sm:h-64 md:h-72">
      <img
        src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Projecten"
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div class="absolute inset-x-0 bottom-6">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <span class="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Software Talent Hub</span>
          <h1 class="text-3xl sm:text-4xl font-bold text-white">Projecten</h1>
          <p class="text-white/70 text-sm mt-1">Ontdek studentprojecten van ROC van Flevoland</p>
        </div>
      </div>
    </div>

    <div class="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-10">
      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <div class="flex-1 relative">
          <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="search" type="text" placeholder="Zoek op titel, auteur of technologie…"
            class="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500"
          />
        </div>
        <button
          class="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-5 py-3 rounded-full transition-colors shrink-0"
          @click="showForm = true"
        >
          <Plus :size="16" /> Project indienen
        </button>
      </div>

      <div v-if="submitted" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
        <CheckCircle2 :size="16" /> Je project is ingediend en wacht op goedkeuring.
      </div>

      <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl h-64 animate-pulse" />
      </div>
      <div v-else-if="filtered.length === 0" class="text-center py-20 text-gray-400">
        <Code2 :size="48" class="mx-auto mb-4 opacity-30" />
        <p class="font-medium">Nog geen projecten</p>
        <p class="text-sm mt-1">Wees de eerste om een project in te dienen!</p>
      </div>
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(project, i) in filtered" :key="project.id"
          class="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
          data-animate
          :data-animate-delay="`${Math.min(i * 100, 500)}`"
        >
          <template v-if="project.image_url">
            <video v-if="isVideoUrl(project)" :src="project.image_url" class="w-full h-44 object-cover" autoplay muted loop playsinline />
            <img v-else :src="project.image_url" :alt="project.title" class="w-full h-44 object-cover" />
          </template>
          <div v-else class="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Code2 :size="32" class="text-gray-300" />
          </div>
          <div class="p-5">
            <div v-if="project.tech_stack?.length > 0" class="flex flex-wrap gap-1.5 mb-3">
              <span
                v-for="t in project.tech_stack.slice(0, 3)" :key="t"
                class="text-xs font-semibold bg-roc-50 text-roc-600 px-2 py-0.5 rounded-full"
              >{{ t }}</span>
            </div>
            <h3 class="font-bold text-gray-900 mb-1">{{ project.title }}</h3>
            <p class="text-xs text-gray-400 mb-2">door {{ project.author_name }}</p>
            <p class="text-sm text-gray-500 leading-relaxed line-clamp-3">{{ project.description }}</p>
            <div v-if="project.github_url || project.demo_url" class="flex gap-3 mt-4 pt-4 border-t border-gray-100">
              <a v-if="project.github_url" :href="project.github_url" target="_blank" rel="noreferrer" class="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <GitBranch :size="13" /> Code
              </a>
              <a v-if="project.demo_url" :href="project.demo_url" target="_blank" rel="noreferrer" class="flex items-center gap-1.5 text-xs font-medium text-roc-500 hover:text-roc-700 transition-colors">
                <ExternalLink :size="13" /> Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      :style="{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }"
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
