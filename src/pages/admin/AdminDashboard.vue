<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import {
  LayoutDashboard, FolderGit2, Zap, Newspaper, Mail,
  CircleCheck as CheckCircle, Circle as XCircle, Clock, Loader as Loader2,
  Plus, Trash2, CircleAlert as AlertCircle, LogOut, Eye, EyeOff, Hop as Home, Code2,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import type { Project, Challenge, NewsItem } from '../../types'
import Badge from '../../components/ui/Badge.vue'
import Modal from '../../components/ui/Modal.vue'

const CHALLENGE_TAG_PREFIX = '__challenge:'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

type Tab = 'overview' | 'projects' | 'challenges' | 'news' | 'messages'
  | 'submissions'

const router = useRouter()
const { user, signOut } = useAuth()

const tab = ref<Tab>('overview')
const projects = ref<Project[]>([])
const challenges = ref<Challenge[]>([])
const news = ref<NewsItem[]>([])
const messages = ref<ContactMessage[]>([])
const submissions = ref<Project[]>([])
const messagesError = ref<string | null>(null)
const submissionsError = ref<string | null>(null)
const loading = ref(true)
const newsModalOpen = ref(false)
const newsForm = ref({ title: '', content: '', excerpt: '', image_url: '' })
const newsSubmitting = ref(false)
const newsError = ref<string | null>(null)
const newsEditModalOpen = ref(false)
const newsEditSubmitting = ref(false)
const newsEditError = ref<string | null>(null)
const editingNewsId = ref<string | null>(null)
const newsEditForm = ref({ title: '', content: '', excerpt: '', image_url: '' })
const projectEditModalOpen = ref(false)
const projectEditSubmitting = ref(false)
const projectEditError = ref<string | null>(null)
const editingProjectId = ref<string | null>(null)
const projectForm = ref({
  title: '',
  description: '',
  author_name: '',
  author_email: '',
  tech_stack_text: '',
  github_url: '',
  demo_url: '',
  image_url: '',
  media_type: 'image' as Project['media_type'],
  status: 'pending' as Project['status'],
})
const challengeEditModalOpen = ref(false)
const challengeEditSubmitting = ref(false)
const challengeEditError = ref<string | null>(null)
const editingChallengeId = ref<string | null>(null)
const challengeForm = ref({
  title: '',
  description: '',
  company_name: '',
  contact_email: '',
  deadline: '',
  difficulty: 'beginner' as Challenge['difficulty'],
  prize: '',
  image_url: '',
  category: '',
  duration: '',
  status: 'pending' as Challenge['status'],
})
const expandedMessage = ref<string | null>(null)
const expandedSubmission = ref<string | null>(null)

const visibleTechStack = (stack?: string[] | null) => (stack ?? []).filter((tech) => !tech.startsWith(CHALLENGE_TAG_PREFIX))
const getChallengeId = (project: Project) => project.tech_stack?.find((tech) => tech.startsWith(CHALLENGE_TAG_PREFIX))?.slice(CHALLENGE_TAG_PREFIX.length) ?? null
const isChallengeProject = (project: Project) => Boolean(getChallengeId(project))

watchEffect(() => {
  if (user.value === null && !loading.value) {
    router.replace({ name: 'admin-login' })
  }
})

const fetchProjects = async () => {
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (data) {
    projects.value = data as Project[]
    submissions.value = projects.value.filter((project) => isChallengeProject(project))
  }
}
const fetchChallenges = async () => {
  const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false })
  if (data) challenges.value = data as Challenge[]
}
const fetchNews = async () => {
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  if (data) news.value = data as NewsItem[]
}
const fetchMessages = async () => {
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (error) {
    messagesError.value = `Contactberichten laden mislukt: ${error.message}`
    return
  }
  messagesError.value = null
  if (data) messages.value = data as ContactMessage[]
}
const fetchSubmissions = async () => {
  submissionsError.value = null
  submissions.value = projects.value.filter((project) => isChallengeProject(project))
}
const fetchAll = async () => {
  loading.value = true
  await Promise.all([fetchProjects(), fetchChallenges(), fetchNews(), fetchMessages(), fetchSubmissions()])
  loading.value = false
}

let channels: ReturnType<typeof supabase.channel>[] = []

onMounted(() => {
  if (!user.value) {
    router.replace({ name: 'admin-login' })
    return
  }
  fetchAll()

  channels = [
    supabase.channel('admin-projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects).subscribe(),
    supabase.channel('admin-challenges').on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchChallenges).subscribe(),
    supabase.channel('admin-news').on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews).subscribe(),
    supabase.channel('admin-messages').on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, fetchMessages).subscribe(),
    supabase.channel('admin-submissions').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchSubmissions).subscribe(),
  ]
})

onBeforeUnmount(() => {
  channels.forEach((c) => supabase.removeChannel(c))
})

const updateProjectStatus = async (id: string, status: 'approved' | 'rejected') => {
  await supabase.from('projects').update({ status }).eq('id', id)
  projects.value = projects.value.map((p) => p.id === id ? { ...p, status } : p)
  submissions.value = projects.value.filter((project) => isChallengeProject(project))
}
const updateChallengeStatus = async (id: string, status: 'approved' | 'rejected') => {
  await supabase.from('challenges').update({ status }).eq('id', id)
  challenges.value = challenges.value.map((c) => c.id === id ? { ...c, status } : c)
}
const deleteNews = async (id: string) => {
  await supabase.from('news').delete().eq('id', id)
  news.value = news.value.filter((n) => n.id !== id)
}
const deleteProject = async (id: string) => {
  await supabase.from('projects').delete().eq('id', id)
  projects.value = projects.value.filter((p) => p.id !== id)
  submissions.value = projects.value.filter((project) => isChallengeProject(project))
}
const deleteChallenge = async (id: string) => {
  await supabase.from('challenges').delete().eq('id', id)
  challenges.value = challenges.value.filter((c) => c.id !== id)
}
const deleteMessage = async (id: string) => {
  messagesError.value = null
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) {
    console.error('Kon bericht niet verwijderen:', error.message)
    messagesError.value = `Verwijderen mislukt: ${error.message}`
    await fetchMessages()
    return
  }
  messages.value = messages.value.filter((m) => m.id !== id)
  if (expandedMessage.value === id) expandedMessage.value = null
}

const deleteSubmission = async (id: string) => {
  await supabase.from('projects').delete().eq('id', id)
  submissions.value = submissions.value.filter((submission) => submission.id !== id)
  projects.value = projects.value.filter((project) => project.id !== id)
  if (expandedSubmission.value === id) expandedSubmission.value = null
}

const openProjectEditor = (project: Project) => {
  editingProjectId.value = project.id
  projectEditError.value = null
  projectForm.value = {
    title: project.title ?? '',
    description: project.description ?? '',
    author_name: project.author_name ?? '',
    author_email: project.author_email ?? '',
    tech_stack_text: (project.tech_stack ?? []).join(', '),
    github_url: project.github_url ?? '',
    demo_url: project.demo_url ?? '',
    image_url: project.image_url ?? '',
    media_type: project.media_type ?? 'image',
    status: project.status ?? 'pending',
  }
  projectEditModalOpen.value = true
}

const closeProjectModal = () => {
  projectEditModalOpen.value = false
  projectEditSubmitting.value = false
  projectEditError.value = null
  editingProjectId.value = null
}

const submitProjectEdit = async (e: Event) => {
  e.preventDefault()
  if (!editingProjectId.value) return
  if (!projectForm.value.title.trim() || !projectForm.value.description.trim() || !projectForm.value.author_name.trim()) {
    projectEditError.value = 'Titel, beschrijving en auteur zijn verplicht.'
    return
  }

  projectEditSubmitting.value = true
  projectEditError.value = null

  const payload = {
    title: projectForm.value.title.trim(),
    description: projectForm.value.description.trim(),
    author_name: projectForm.value.author_name.trim(),
    author_email: projectForm.value.author_email.trim(),
    tech_stack: projectForm.value.tech_stack_text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    github_url: projectForm.value.github_url.trim(),
    demo_url: projectForm.value.demo_url.trim(),
    image_url: projectForm.value.image_url.trim(),
    media_type: projectForm.value.media_type,
    status: projectForm.value.status,
  }

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', editingProjectId.value)
    .select()
    .single()

  projectEditSubmitting.value = false

  if (error) {
    projectEditError.value = 'Project opslaan mislukt. Probeer opnieuw.'
    return
  }

  if (data) {
    projects.value = projects.value.map((p) => (p.id === editingProjectId.value ? (data as Project) : p))
    submissions.value = projects.value.filter((project) => isChallengeProject(project))
  }
  closeProjectModal()
}

const openNewsEditor = (item: NewsItem) => {
  editingNewsId.value = item.id
  newsEditError.value = null
  newsEditForm.value = {
    title: item.title ?? '',
    content: item.content ?? '',
    excerpt: item.excerpt ?? '',
    image_url: item.image_url ?? '',
  }
  newsEditModalOpen.value = true
}

const closeNewsEditModal = () => {
  newsEditModalOpen.value = false
  newsEditSubmitting.value = false
  newsEditError.value = null
  editingNewsId.value = null
}

const submitNewsEdit = async (e: Event) => {
  e.preventDefault()
  if (!editingNewsId.value) return
  if (!newsEditForm.value.title.trim() || !newsEditForm.value.content.trim()) {
    newsEditError.value = 'Titel en inhoud zijn verplicht.'
    return
  }

  newsEditSubmitting.value = true
  newsEditError.value = null

  const payload = {
    title: newsEditForm.value.title.trim(),
    content: newsEditForm.value.content.trim(),
    excerpt: newsEditForm.value.excerpt.trim(),
    image_url: newsEditForm.value.image_url.trim(),
  }

  const { data, error } = await supabase
    .from('news')
    .update(payload)
    .eq('id', editingNewsId.value)
    .select()
    .single()

  newsEditSubmitting.value = false

  if (error) {
    newsEditError.value = 'Nieuwsbericht opslaan mislukt. Probeer opnieuw.'
    return
  }

  if (data) {
    news.value = news.value.map((n) => (n.id === editingNewsId.value ? (data as NewsItem) : n))
  }
  closeNewsEditModal()
}

const openChallengeEditor = (challenge: Challenge) => {
  editingChallengeId.value = challenge.id
  challengeEditError.value = null
  challengeForm.value = {
    title: challenge.title ?? '',
    description: challenge.description ?? '',
    company_name: challenge.company_name ?? '',
    contact_email: challenge.contact_email ?? '',
    deadline: challenge.deadline ?? '',
    difficulty: challenge.difficulty ?? 'beginner',
    prize: challenge.prize ?? '',
    image_url: challenge.image_url ?? '',
    category: challenge.category ?? '',
    duration: challenge.duration ?? '',
    status: challenge.status ?? 'pending',
  }
  challengeEditModalOpen.value = true
}

const closeChallengeModal = () => {
  challengeEditModalOpen.value = false
  challengeEditSubmitting.value = false
  challengeEditError.value = null
  editingChallengeId.value = null
}

const submitChallengeEdit = async (e: Event) => {
  e.preventDefault()
  if (!editingChallengeId.value) return
  if (!challengeForm.value.title.trim() || !challengeForm.value.description.trim() || !challengeForm.value.company_name.trim()) {
    challengeEditError.value = 'Titel, beschrijving en bedrijfsnaam zijn verplicht.'
    return
  }

  challengeEditSubmitting.value = true
  challengeEditError.value = null

  const payload = {
    title: challengeForm.value.title.trim(),
    description: challengeForm.value.description.trim(),
    company_name: challengeForm.value.company_name.trim(),
    contact_email: challengeForm.value.contact_email.trim(),
    deadline: challengeForm.value.deadline,
    difficulty: challengeForm.value.difficulty,
    prize: challengeForm.value.prize.trim(),
    image_url: challengeForm.value.image_url.trim(),
    category: challengeForm.value.category.trim(),
    duration: challengeForm.value.duration.trim(),
    status: challengeForm.value.status,
  }

  const { data, error } = await supabase
    .from('challenges')
    .update(payload)
    .eq('id', editingChallengeId.value)
    .select()
    .single()

  challengeEditSubmitting.value = false

  if (error) {
    challengeEditError.value = 'Opslaan mislukt. Controleer de velden en probeer opnieuw.'
    return
  }

  if (data) {
    challenges.value = challenges.value.map((c) => (c.id === editingChallengeId.value ? (data as Challenge) : c))
  }
  closeChallengeModal()
}

const submitNews = async (e: Event) => {
  e.preventDefault()
  if (!newsForm.value.title.trim() || !newsForm.value.content.trim()) {
    newsError.value = 'Titel en inhoud zijn verplicht.'
    return
  }
  newsSubmitting.value = true
  newsError.value = null

  const { data, error } = await supabase
    .from('news')
    .insert({
      title: newsForm.value.title.trim(),
      content: newsForm.value.content.trim(),
      excerpt: newsForm.value.excerpt.trim(),
      image_url: newsForm.value.image_url.trim(),
      author_id: user.value!.id,
    })
    .select()
    .single()

  newsSubmitting.value = false
  if (error) {
    newsError.value = 'Er ging iets mis. Probeer het opnieuw.'
  } else {
    if (data) news.value = [data as NewsItem, ...news.value]
    newsForm.value = { title: '', content: '', excerpt: '', image_url: '' }
    newsModalOpen.value = false
  }
}

const pendingProjects = computed(() => projects.value.filter((p) => p.status === 'pending'))
const pendingChallenges = computed(() => challenges.value.filter((c) => c.status === 'pending'))
const unreadMessages = computed(() => messages.value.length)

const statusVariant = (status: string): 'green' | 'red' | 'amber' => {
  if (status === 'approved') return 'green'
  if (status === 'rejected') return 'red'
  return 'amber'
}
const statusLabel = (status: string) => {
  if (status === 'approved') return 'Goedgekeurd'
  if (status === 'rejected') return 'Afgewezen'
  return 'In behandeling'
}

const tabs = computed(() => [
  { id: 'overview' as Tab, label: 'Overzicht', icon: LayoutDashboard, count: undefined as number | undefined },
  { id: 'projects' as Tab, label: 'Projecten', icon: FolderGit2, count: pendingProjects.value.length || undefined },
  { id: 'challenges' as Tab, label: 'Challenges', icon: Zap, count: pendingChallenges.value.length || undefined },
  { id: 'submissions' as Tab, label: 'Inzendingen', icon: Code2, count: submissions.value.filter((s) => s.status === 'pending').length || undefined },
  { id: 'news' as Tab, label: 'Nieuws', icon: Newspaper, count: undefined as number | undefined },
  { id: 'messages' as Tab, label: 'Berichten', icon: Mail, count: unreadMessages.value || undefined },
])

const overviewCards = computed(() => [
  { label: 'Projecten te beoordelen', value: pendingProjects.value.length, icon: FolderGit2, color: 'text-amber-500', bg: 'bg-amber-50', tab: 'projects' as Tab },
  { label: 'Challenges te beoordelen', value: pendingChallenges.value.length, icon: Zap, color: 'text-roc-500', bg: 'bg-roc-50', tab: 'challenges' as Tab },
  { label: 'Projectinzendingen', value: submissions.value.filter((s) => s.status === 'pending').length, icon: Code2, color: 'text-violet-600', bg: 'bg-violet-50', tab: 'submissions' as Tab },
  { label: 'Nieuwsberichten', value: news.value.length, icon: Newspaper, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'news' as Tab },
  { label: 'Contactberichten', value: messages.value.length, icon: Mail, color: 'text-sky-600', bg: 'bg-sky-50', tab: 'messages' as Tab },
])

const goHome = () => router.push({ name: 'home' })
const doSignOut = async () => {
  await signOut()
  router.push({ name: 'home' })
}
const closeNewsModal = () => {
  newsModalOpen.value = false
  newsError.value = null
  newsForm.value = { title: '', content: '', excerpt: '', image_url: '' }
}

const inputClass = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('nl-NL')
const fmtDateLong = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
const fmtDateTime = (d: string) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const toggleMessage = (id: string) => {
  expandedMessage.value = expandedMessage.value === id ? null : id
}

const toggleSubmission = (id: string) => {
  expandedSubmission.value = expandedSubmission.value === id ? null : id
}
</script>

<template>
  <div v-if="user" class="min-h-screen bg-gray-50">
    <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-4">
            <img src="/image.png" alt="ROC van Flevoland" class="h-10 w-auto" />
            <span class="text-sm font-semibold text-gray-400 hidden sm:block">Beheerderspaneel</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50" @click="goHome">
              <Home :size="15" />
              <span class="hidden sm:inline">Naar site</span>
            </button>
            <button class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-roc-500 transition-colors px-3 py-2 rounded-lg hover:bg-roc-50" @click="doSignOut">
              <LogOut :size="15" />
              <span class="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="flex items-center gap-0.5 overflow-x-auto scrollbar-none" style="scrollbar-width: none">
          <button
            v-for="t in tabs" :key="t.id"
            :class="['flex items-center gap-1.5 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-all', tab === t.id ? 'border-roc-500 text-roc-600' : 'border-transparent text-gray-400 hover:text-gray-900 hover:border-gray-200']"
            @click="tab = t.id"
          >
            <component :is="t.icon" :size="15" />
            {{ t.label }}
            <span v-if="t.count !== undefined && t.count > 0" class="ml-0.5 bg-roc-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none font-bold">
              {{ t.count }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div v-if="loading" class="flex items-center justify-center py-24">
        <Loader2 :size="32" class="text-roc-500 animate-spin" />
      </div>

      <template v-else>
        <div v-if="tab === 'overview'" class="space-y-8">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-0.5">Dashboard</h1>
            <p class="text-gray-400 text-sm">Ingelogd als {{ user.email }}</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              v-for="card in overviewCards" :key="card.label"
              class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-left hover:shadow-md hover:border-gray-300 transition-all"
              @click="tab = card.tab"
            >
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.bg]">
                <component :is="card.icon" :size="18" :class="card.color" />
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ card.label }}</p>
            </button>
          </div>

          <div v-if="pendingProjects.length > 0 || pendingChallenges.length > 0" class="space-y-6">
            <div v-if="pendingProjects.length > 0">
              <h2 class="text-gray-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                <Clock :size="15" class="text-amber-500" />
                Projecten wachtend op goedkeuring
              </h2>
              <div class="space-y-2">
                <div v-for="p in pendingProjects.slice(0, 5)" :key="p.id" class="bg-white rounded-xl border border-amber-100 p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div class="min-w-0">
                    <p class="text-gray-900 text-sm font-semibold truncate">{{ p.title }}</p>
                    <p class="text-gray-400 text-xs mt-0.5">door {{ p.author_name }} · {{ fmtDate(p.created_at) }}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200" @click="updateProjectStatus(p.id, 'approved')">
                      <CheckCircle :size="12" /> Goedkeuren
                    </button>
                    <button class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200" @click="updateProjectStatus(p.id, 'rejected')">
                      <XCircle :size="12" /> Afwijzen
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="pendingChallenges.length > 0">
              <h2 class="text-gray-900 font-semibold mb-3 flex items-center gap-2 text-sm">
                <Clock :size="15" class="text-roc-500" />
                Challenges wachtend op goedkeuring
              </h2>
              <div class="space-y-2">
                <div v-for="c in pendingChallenges.slice(0, 5)" :key="c.id" class="bg-white rounded-xl border border-roc-100 p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div class="min-w-0">
                    <p class="text-gray-900 text-sm font-semibold truncate">{{ c.title }}</p>
                    <p class="text-gray-400 text-xs mt-0.5">{{ c.company_name }} · {{ fmtDate(c.created_at) }}</p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200" @click="updateChallengeStatus(c.id, 'approved')">
                      <CheckCircle :size="12" /> Goedkeuren
                    </button>
                    <button class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200" @click="updateChallengeStatus(c.id, 'rejected')">
                      <XCircle :size="12" /> Afwijzen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingProjects.length === 0 && pendingChallenges.length === 0" class="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle :size="32" class="text-emerald-400 mx-auto mb-3" />
            <p class="font-semibold text-gray-700">Alles bijgewerkt</p>
            <p class="text-sm text-gray-400 mt-1">Er zijn geen inzendingen die wachten op goedkeuring.</p>
          </div>
        </div>

        <div v-else-if="tab === 'projects'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Projecten</h2>
              <p class="text-sm text-gray-400 mt-0.5">{{ projects.length }} totaal · {{ pendingProjects.length }} wachtend</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-if="projects.length === 0" class="text-center py-16 text-gray-400">
              <FolderGit2 :size="40" class="mx-auto mb-3 opacity-30" />
              <p class="font-medium">Geen projecten gevonden.</p>
            </div>
            <div v-for="p in projects" v-else :key="p.id" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-gray-900 font-semibold text-sm">{{ p.title }}</span>
                    <Badge :variant="statusVariant(p.status)">{{ statusLabel(p.status) }}</Badge>
                  </div>
                  <p class="text-gray-400 text-xs mb-2">
                    door <span class="font-medium text-gray-600">{{ p.author_name }}</span>
                    <template v-if="p.author_email"> ({{ p.author_email }})</template> · {{ fmtDate(p.created_at) }}
                  </p>
                  <p class="text-gray-500 text-xs line-clamp-2 leading-relaxed">{{ p.description }}</p>
                  <div v-if="visibleTechStack(p.tech_stack).length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span v-for="t in visibleTechStack(p.tech_stack).slice(0, 6)" :key="t" class="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs">{{ t }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <template v-if="p.status === 'pending'">
                    <button class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200" @click="updateProjectStatus(p.id, 'approved')">
                      <CheckCircle :size="12" /> Goedkeuren
                    </button>
                    <button class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200" @click="updateProjectStatus(p.id, 'rejected')">
                      <XCircle :size="12" /> Afwijzen
                    </button>
                  </template>
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-roc-50 text-gray-500 hover:text-roc-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-roc-200" @click="openProjectEditor(p)">
                    Bewerken
                  </button>
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-red-200" @click="deleteProject(p.id)">
                    <Trash2 :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'challenges'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Challenges</h2>
              <p class="text-sm text-gray-400 mt-0.5">{{ challenges.length }} totaal · {{ pendingChallenges.length }} wachtend</p>
            </div>
          </div>
          <div class="space-y-3">
            <div v-if="challenges.length === 0" class="text-center py-16 text-gray-400">
              <Zap :size="40" class="mx-auto mb-3 opacity-30" />
              <p class="font-medium">Geen challenges gevonden.</p>
            </div>
            <div v-for="c in challenges" v-else :key="c.id" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-gray-900 font-semibold text-sm">{{ c.title }}</span>
                    <Badge :variant="statusVariant(c.status)">{{ statusLabel(c.status) }}</Badge>
                  </div>
                  <p class="text-gray-400 text-xs mb-2">
                    <span class="font-medium text-gray-600">{{ c.company_name }}</span>
                    <template v-if="c.contact_email"> · {{ c.contact_email }}</template> · {{ fmtDate(c.created_at) }}
                  </p>
                  <p class="text-gray-500 text-xs line-clamp-2 leading-relaxed">{{ c.description }}</p>
                  <span v-if="c.prize" class="inline-block mt-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{{ c.prize }}</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <template v-if="c.status === 'pending'">
                    <button class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200" @click="updateChallengeStatus(c.id, 'approved')">
                      <CheckCircle :size="12" /> Goedkeuren
                    </button>
                    <button class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200" @click="updateChallengeStatus(c.id, 'rejected')">
                      <XCircle :size="12" /> Afwijzen
                    </button>
                  </template>
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-roc-50 text-gray-500 hover:text-roc-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-roc-200" @click="openChallengeEditor(c)">
                    Bewerken
                  </button>
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-red-200" @click="deleteChallenge(c.id)">
                    <Trash2 :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'submissions'">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">Projectinzendingen</h2>
            <p class="text-sm text-gray-400 mt-0.5">{{ submissions.length }} inzendingen</p>
          </div>
          <div v-if="submissionsError" class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            <AlertCircle :size="16" />
            {{ submissionsError }}
          </div>
          <div class="space-y-3">
            <div v-if="submissions.length === 0" class="text-center py-16 text-gray-400">
              <Code2 :size="40" class="mx-auto mb-3 opacity-30" />
              <p class="font-medium">Nog geen inzendingen.</p>
            </div>
            <div v-for="s in submissions" v-else :key="s.id" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-gray-900 font-semibold text-sm">{{ s.title }}</span>
                    <Badge :variant="statusVariant(s.status)">{{ statusLabel(s.status) }}</Badge>
                  </div>
                  <p class="text-gray-400 text-xs mb-2">
                    voor challenge <span class="font-medium text-gray-600">{{ challenges.find((c) => c.id === getChallengeId(s))?.title || 'Onbekend' }}</span>
                    · door <span class="font-medium text-gray-600">{{ s.author_name }}</span>
                    <template v-if="s.author_email"> ({{ s.author_email }})</template>
                  </p>
                  <p v-if="expandedSubmission === s.id" class="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">{{ s.description }}</p>
                  <p v-else class="text-gray-500 text-xs line-clamp-2 leading-relaxed">{{ s.description }}</p>
                  <div v-if="visibleTechStack(s.tech_stack).length > 0" class="flex flex-wrap gap-1 mt-2">
                    <span v-for="t in visibleTechStack(s.tech_stack).slice(0, 6)" :key="t" class="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 text-xs">{{ t }}</span>
                  </div>
                  <div class="flex flex-wrap gap-3 mt-3 text-xs">
                    <a v-if="s.github_url" :href="s.github_url" target="_blank" rel="noopener noreferrer" class="text-roc-600 hover:underline">GitHub</a>
                    <a v-if="s.demo_url" :href="s.demo_url" target="_blank" rel="noopener noreferrer" class="text-roc-600 hover:underline">Demo</a>
                    <a v-if="s.image_url" :href="s.image_url" target="_blank" rel="noopener noreferrer" class="text-roc-600 hover:underline">Preview</a>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200" @click="toggleSubmission(s.id)">
                    <EyeOff v-if="expandedSubmission === s.id" :size="12" />
                    <Eye v-else :size="12" />
                    {{ expandedSubmission === s.id ? 'Inklappen' : 'Lees meer' }}
                  </button>
                  <button v-if="s.status === 'pending'" class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200" @click="updateSubmissionStatus(s.id, 'approved')">
                    <CheckCircle :size="12" /> Goedkeuren
                  </button>
                  <button v-if="s.status === 'pending'" class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-200" @click="updateSubmissionStatus(s.id, 'rejected')">
                    <XCircle :size="12" /> Afwijzen
                  </button>
                  <button class="flex items-center gap-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 hover:border-red-200" @click="deleteSubmission(s.id)">
                    <Trash2 :size="12" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'news'">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Nieuws</h2>
              <p class="text-sm text-gray-400 mt-0.5">{{ news.length }} berichten</p>
            </div>
            <button
              class="flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              @click="newsModalOpen = true; newsError = null"
            >
              <Plus :size="15" />
              Nieuwsbericht
            </button>
          </div>
          <div class="space-y-3">
            <div v-if="news.length === 0" class="text-center py-16 text-gray-400">
              <Newspaper :size="40" class="mx-auto mb-3 opacity-30" />
              <p class="font-medium">Nog geen nieuwsberichten.</p>
              <p class="text-xs mt-1">Klik op "Nieuwsbericht" om te beginnen.</p>
            </div>
            <div v-for="n in news" v-else :key="n.id" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex gap-4">
              <img v-if="n.image_url" :src="n.image_url" :alt="n.title" class="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-gray-900 font-semibold text-sm mb-0.5">{{ n.title }}</p>
                <p v-if="n.excerpt" class="text-gray-400 text-xs line-clamp-1 mb-1">{{ n.excerpt }}</p>
                <p class="text-gray-300 text-xs">{{ fmtDateLong(n.created_at) }}</p>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 self-start">
                <button
                  class="flex items-center gap-1.5 bg-gray-50 hover:bg-roc-50 text-gray-500 hover:text-roc-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 hover:border-roc-200"
                  @click="openNewsEditor(n)"
                >
                  Bewerken
                </button>
                <button
                  class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200"
                  @click="deleteNews(n.id)"
                >
                  <Trash2 :size="12" /> Verwijderen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="tab === 'messages'">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-gray-900">Contactberichten</h2>
            <p class="text-sm text-gray-400 mt-0.5">{{ messages.length }} berichten</p>
          </div>
          <div v-if="messagesError" class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            <AlertCircle :size="16" />
            {{ messagesError }}
          </div>
          <div class="space-y-3">
            <div v-if="messages.length === 0" class="text-center py-16 text-gray-400">
              <Mail :size="40" class="mx-auto mb-3 opacity-30" />
              <p class="font-medium">Geen contactberichten.</p>
            </div>
            <div v-for="m in messages" v-else :key="m.id" class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-3 mb-0.5 flex-wrap">
                    <span class="text-gray-900 font-semibold text-sm">{{ m.name }}</span>
                    <a :href="`mailto:${m.email}`" class="text-roc-500 text-xs hover:underline">{{ m.email }}</a>
                  </div>
                  <p v-if="m.subject" class="text-gray-700 text-sm font-medium mb-2">{{ m.subject }}</p>
                  <p v-if="expandedMessage === m.id" class="text-gray-500 text-sm leading-relaxed">{{ m.message }}</p>
                  <p v-else class="text-gray-400 text-xs line-clamp-2">{{ m.message }}</p>
                </div>
                <button
                  class="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-gray-200 flex-shrink-0"
                  @click="toggleMessage(m.id)"
                >
                  <EyeOff v-if="expandedMessage === m.id" :size="12" />
                  <Eye v-else :size="12" />
                  {{ expandedMessage === m.id ? 'Inklappen' : 'Lees meer' }}
                </button>
                <button
                  class="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-red-200 flex-shrink-0"
                  @click="deleteMessage(m.id)"
                >
                  <Trash2 :size="12" /> Verwijderen
                </button>
              </div>
              <p class="text-gray-300 text-xs mt-3">{{ fmtDateTime(m.created_at) }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Modal :is-open="newsModalOpen" title="Nieuwsbericht Plaatsen" @close="closeNewsModal">
      <form class="space-y-5" @submit="submitNews">
        <div v-if="newsError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          <AlertCircle :size="16" />
          {{ newsError }}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Titel <span class="text-red-500">*</span></label>
          <input v-model="newsForm.title" type="text" required placeholder="Titel van het nieuwsbericht" :class="inputClass" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Samenvatting</label>
          <input v-model="newsForm.excerpt" type="text" placeholder="Korte samenvatting (optioneel)" :class="inputClass" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Inhoud <span class="text-red-500">*</span></label>
          <textarea v-model="newsForm.content" required :rows="6" placeholder="Schrijf hier de volledige inhoud..." :class="`${inputClass} resize-none`" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding URL</label>
          <input v-model="newsForm.image_url" type="url" placeholder="https://images.pexels.com/..." :class="inputClass" />
        </div>
        <button
          type="submit" :disabled="newsSubmitting"
          class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          <template v-if="newsSubmitting"><Loader2 :size="18" class="animate-spin" />Plaatsen...</template>
          <template v-else><Newspaper :size="18" />Nieuwsbericht Plaatsen</template>
        </button>
      </form>
    </Modal>

    <Modal :is-open="challengeEditModalOpen" title="Challenge Bewerken" size="xl" @close="closeChallengeModal">
      <form class="space-y-5" @submit="submitChallengeEdit">
        <div v-if="challengeEditError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          <AlertCircle :size="16" />
          {{ challengeEditError }}
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Titel <span class="text-red-500">*</span></label>
            <input v-model="challengeForm.title" type="text" required :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Bedrijf <span class="text-red-500">*</span></label>
            <input v-model="challengeForm.company_name" type="text" required :class="inputClass" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Beschrijving <span class="text-red-500">*</span></label>
          <textarea v-model="challengeForm.description" required :rows="4" :class="`${inputClass} resize-none`" />
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contact e-mail</label>
            <input v-model="challengeForm.contact_email" type="email" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
            <input v-model="challengeForm.deadline" type="date" :class="inputClass" />
          </div>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Moeilijkheid</label>
            <select v-model="challengeForm.difficulty" :class="inputClass">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select v-model="challengeForm.status" :class="inputClass">
              <option value="pending">In behandeling</option>
              <option value="approved">Goedgekeurd</option>
              <option value="rejected">Afgewezen</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Categorie</label>
            <input v-model="challengeForm.category" type="text" :class="inputClass" />
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Prijs</label>
            <input v-model="challengeForm.prize" type="text" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Duur</label>
            <input v-model="challengeForm.duration" type="text" :class="inputClass" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding URL</label>
          <input v-model="challengeForm.image_url" type="url" placeholder="https://..." :class="inputClass" />
        </div>
        <button
          type="submit"
          :disabled="challengeEditSubmitting"
          class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          <template v-if="challengeEditSubmitting"><Loader2 :size="18" class="animate-spin" />Opslaan...</template>
          <template v-else>Challenge Opslaan</template>
        </button>
      </form>
    </Modal>

    <Modal :is-open="projectEditModalOpen" title="Project Bewerken" size="xl" @close="closeProjectModal">
      <form class="space-y-5" @submit="submitProjectEdit">
        <div v-if="projectEditError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          <AlertCircle :size="16" />
          {{ projectEditError }}
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Titel <span class="text-red-500">*</span></label>
            <input v-model="projectForm.title" type="text" required :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Auteur <span class="text-red-500">*</span></label>
            <input v-model="projectForm.author_name" type="text" required :class="inputClass" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Beschrijving <span class="text-red-500">*</span></label>
          <textarea v-model="projectForm.description" required :rows="4" :class="`${inputClass} resize-none`" />
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Auteur e-mail</label>
            <input v-model="projectForm.author_email" type="email" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Tech stack (komma-gescheiden)</label>
            <input v-model="projectForm.tech_stack_text" type="text" placeholder="Vue, TypeScript, Supabase" :class="inputClass" />
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">GitHub URL</label>
            <input v-model="projectForm.github_url" type="url" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Demo URL</label>
            <input v-model="projectForm.demo_url" type="url" :class="inputClass" />
          </div>
        </div>
        <div class="grid sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding/video URL</label>
            <input v-model="projectForm.image_url" type="url" :class="inputClass" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Media type</label>
            <select v-model="projectForm.media_type" :class="inputClass">
              <option value="image">Afbeelding</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select v-model="projectForm.status" :class="inputClass">
            <option value="pending">In behandeling</option>
            <option value="approved">Goedgekeurd</option>
            <option value="rejected">Afgewezen</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="projectEditSubmitting"
          class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          <template v-if="projectEditSubmitting"><Loader2 :size="18" class="animate-spin" />Opslaan...</template>
          <template v-else>Project Opslaan</template>
        </button>
      </form>
    </Modal>

    <Modal :is-open="newsEditModalOpen" title="Nieuws Bewerken" @close="closeNewsEditModal">
      <form class="space-y-5" @submit="submitNewsEdit">
        <div v-if="newsEditError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          <AlertCircle :size="16" />
          {{ newsEditError }}
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Titel <span class="text-red-500">*</span></label>
          <input v-model="newsEditForm.title" type="text" required :class="inputClass" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Samenvatting</label>
          <input v-model="newsEditForm.excerpt" type="text" :class="inputClass" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Inhoud <span class="text-red-500">*</span></label>
          <textarea v-model="newsEditForm.content" required :rows="6" :class="`${inputClass} resize-none`" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Afbeelding URL</label>
          <input v-model="newsEditForm.image_url" type="url" :class="inputClass" />
        </div>
        <button
          type="submit"
          :disabled="newsEditSubmitting"
          class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          <template v-if="newsEditSubmitting"><Loader2 :size="18" class="animate-spin" />Opslaan...</template>
          <template v-else>Nieuws Opslaan</template>
        </button>
      </form>
    </Modal>
  </div>
</template>
