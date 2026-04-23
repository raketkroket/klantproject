<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Pause, Play, ArrowRight, Code as Code2, Briefcase, GraduationCap, Rocket } from 'lucide-vue-next'
import { useScrollAnimation } from '../composables/useScrollAnimation'
import { supabase } from '../lib/supabase'
import type { Project } from '../types'

const CHALLENGE_TAG_PREFIX = '__challenge:'
const isChallengeSubmission = (project: Pick<Project, 'tech_stack'>) =>
  (project.tech_stack ?? []).some((tech) => tech.startsWith(CHALLENGE_TAG_PREFIX))
const visibleTechStack = (stack?: string[] | null) => (stack ?? []).filter((tech) => !tech.startsWith(CHALLENGE_TAG_PREFIX))

const router = useRouter()
useScrollAnimation()

const recentProjects = ref<Project[]>([])
const loadingProjects = ref(true)

const fetchRecent = async () => {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20)
  recentProjects.value = ((data ?? []) as Project[])
    .filter((project) => !isChallengeSubmission(project))
    .slice(0, 3)
  loadingProjects.value = false
}

let projectsChannel: ReturnType<typeof supabase.channel> | null = null

const heroSlides = [
  {
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'STUDENTEN',
    title: 'Bouw mee aan de software van morgen',
    description: 'Werk aan echte projecten voor lokale bedrijven en zet je vaardigheden om in tastbare resultaten.',
  },
  {
    image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'JONGEREN',
    title: 'Jouw code, echte impact in de regio',
    description: 'Ontdek uitdagingen van bedrijven uit Flevoland en laat zien wat je waard bent als developer.',
  },
  {
    image: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80',
    label: 'TALENT',
    title: 'Software Talent Hub — maakt werk van je talent',
    description: 'ROC van Flevoland verbindt talentvolle studenten met innovatieve bedrijven voor een sterke digitale toekomst.',
  },
]

const partnerLogos = [
  { id: 1, name: 'Archimedict', logo: '/partnerimages/archimedict.png' },
  { id: 2, name: 'Daylinq', logo: '/partnerimages/daylinq_logo.jpg' },
  { id: 3, name: 'FlevoDevs', logo: '/partnerimages/flevodevs_logo.jpg' },
  { id: 4, name: 'GreyGames', logo: '/partnerimages/greygames_logo.jpg' },
  { id: 5, name: 'IDCP BV', logo: '/partnerimages/idcp_bv_logo.jpg' },
  { id: 6, name: 'Mobiel Centre Marktonderzoek', logo: '/partnerimages/mobiel_centre_marktonderzoek_b_v__logo.jpg' },
  { id: 7, name: 'Raion Design', logo: '/partnerimages/raion_design_logo.jpg' },
  { id: 8, name: 'Wur Bio Veterinary', logo: '/partnerimages/wurbioveterinary_logo.jpg' },
  { id: 9, name: 'Partner 1', logo: '/partnerimages/1631310391030.jpg' },
  { id: 10, name: 'Partner 2', logo: '/partnerimages/1684497600651.jpg' },
  { id: 11, name: 'Partner 3', logo: '/partnerimages/286984754_115513597846209_2920194728808591723_n.jpg' },
  { id: 12, name: 'Partner 4', logo: '/partnerimages/Screenshot%202026-04-20%20173856.png' },
] as const
const partnersDouble = [...partnerLogos, ...partnerLogos]

const features = [
  { icon: Code2, title: 'Projecten', desc: 'Studenten publiceren softwareprojecten', color: 'bg-blue-50 text-blue-600' },
  { icon: Briefcase, title: 'Challenges', desc: 'Bedrijven plaatsen echte opdrachten', color: 'bg-amber-50 text-amber-600' },
  { icon: GraduationCap, title: 'Leren', desc: 'Leer van echte praktijkervaring', color: 'bg-green-50 text-green-600' },
  { icon: Rocket, title: 'Groeien', desc: 'Bouw je portfolio en netwerk op', color: 'bg-roc-50 text-roc-600' },
]

const activeSlide = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const clear = () => { if (timer) { clearInterval(timer); timer = null } }
const start = () => {
  clear()
  if (paused.value) return
  timer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.length
  }, 5000)
}

watch(paused, start)
onMounted(() => {
  start()
  fetchRecent()
  projectsChannel = supabase
    .channel('home-recent-projects')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchRecent)
    .subscribe()
})
onBeforeUnmount(() => {
  clear()
  if (projectsChannel) supabase.removeChannel(projectsChannel)
})

const openProjecten = () => router.push({ name: 'projecten' })

const go = (name: string) => router.push({ name })
const goTo = (i: number) => { activeSlide.value = i }
</script>

<template>
  <div>
    <section class="relative w-full overflow-hidden" :style="{ minHeight: 'min(100svh, 85.2rem)' }">
      <div
        v-for="(slide, i) in heroSlides" :key="i"
        class="absolute inset-0 transition-opacity duration-1000"
        :style="{ opacity: i === activeSlide ? 1 : 0, zIndex: i === activeSlide ? 1 : 0 }"
      >
        <img :src="slide.image" alt="" class="absolute inset-0 w-full h-full object-cover" :loading="i === 0 ? 'eager' : 'lazy'" />
        <div class="absolute inset-0" :style="{ background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)' }" />
      </div>

      <div class="relative z-10 flex flex-col min-h-[inherit]" :style="{ minHeight: 'min(100svh, 85.2rem)' }">
        <div class="mt-auto max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-16">
          <div class="bg-roc-500 text-white rounded-2xl overflow-hidden shadow-xl" :style="{ width: 'clamp(280px, 28rem, 100%)' }">
            <div class="px-6 pt-5 pb-4">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <button
                    v-for="(_, i) in heroSlides" :key="i"
                    :aria-label="`Slide ${i + 1}`"
                    :class="['transition-all duration-300 rounded-full', i === activeSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70']"
                    @click="goTo(i)"
                  />
                </div>
                <button
                  :aria-label="paused ? 'Afspelen' : 'Pauzeren'"
                  class="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                  @click="paused = !paused"
                >
                  <Play v-if="paused" :size="13" fill="white" />
                  <Pause v-else :size="13" fill="white" />
                </button>
              </div>

              <div class="min-h-[7rem]">
                <p class="text-xs font-bold tracking-[0.15em] text-white/70 uppercase mb-2">{{ heroSlides[activeSlide].label }}</p>
                <h1 class="text-2xl md:text-[2rem] font-bold leading-tight mb-3">{{ heroSlides[activeSlide].title }}</h1>
                <p class="text-sm text-white/80 leading-relaxed">{{ heroSlides[activeSlide].description }}</p>
              </div>
            </div>

            <div class="bg-roc-700 px-6 py-4">
              <button
                class="flex items-center gap-2 bg-white text-roc-700 hover:bg-roc-50 font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
                @click="go('projecten')"
              >
                Bekijk projecten
                <ArrowRight :size="15" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-16 md:py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div data-animate>
            <span class="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-4">Over het platform</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-5">
              Software Talent Hub —<br />
              <span class="text-roc-500">maakt werk van je talent</span>
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              De Software Talent Hub van ROC van Flevoland is het verbindende platform tussen studenten, bedrijven en onderwijs. Studenten laten hier zien wat ze kunnen door echte uitdagingen op te lossen.
            </p>
            <button
              class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
              @click="go('contact')"
            >
              Neem contact op
              <ArrowRight :size="15" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4" data-animate data-animate-delay="200">
            <div v-for="f in features" :key="f.title" class="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center mb-3', f.color]">
                <component :is="f.icon" :size="18" />
              </div>
              <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ f.title }}</h3>
              <p class="text-gray-500 text-xs leading-relaxed">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gray-50 py-14 overflow-hidden">
      <p class="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-10">Samenwerkingspartners</p>
      <div class="relative flex" :style="{ maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }">
        <div class="flex gap-8 shrink-0" :style="{ animation: 'marquee 28s linear infinite' }">
          <div
            v-for="(p, i) in partnersDouble" :key="`${p.id}-${i}`"
            class="shrink-0 w-44 h-20 bg-white rounded-xl border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <img v-if="p.logo" :src="p.logo" :alt="p.name" class="max-h-12 max-w-36 object-contain" />
            <span v-else class="text-xs font-semibold text-gray-300">{{ p.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white py-16 md:py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-12" data-animate>
          <span class="inline-block text-xs font-bold tracking-widest text-roc-500 uppercase mb-3">Uitgelicht</span>
          <h2 class="text-3xl font-bold text-gray-900">Recente projecten</h2>
        </div>

        <div v-if="loadingProjects" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 3" :key="`skeleton-${i}`"
            class="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse"
          >
            <div class="h-44 bg-gray-100" />
            <div class="p-5 space-y-3">
              <div class="h-3 w-24 bg-gray-100 rounded-full" />
              <div class="h-4 w-3/4 bg-gray-100 rounded" />
              <div class="h-3 w-full bg-gray-100 rounded" />
            </div>
          </div>
        </div>

        <div
          v-else-if="recentProjects.length === 0"
          class="max-w-xl mx-auto text-center border border-dashed border-gray-200 rounded-2xl p-10"
          data-animate
        >
          <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <Code2 :size="22" class="text-gray-400" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Nog geen projecten</h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            Zodra studenten hun eerste projecten uploaden verschijnen ze hier automatisch.
          </p>
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            v-for="(p, i) in recentProjects" :key="p.id"
            class="text-left bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
            data-animate
            :data-animate-delay="`${(i + 1) * 100}`"
            @click="openProjecten"
          >
            <div class="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <video
                v-if="p.image_url && p.media_type === 'video'"
                :src="p.image_url"
                muted loop playsinline
                class="w-full h-full object-cover"
              />
              <img
                v-else-if="p.image_url"
                :src="p.image_url"
                :alt="p.title"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Code2 :size="32" class="text-gray-300" />
              </div>
            </div>
            <div class="p-5">
              <div v-if="visibleTechStack(p.tech_stack).length" class="flex flex-wrap items-center gap-2 mb-3">
                <span
                  v-for="(t, ti) in visibleTechStack(p.tech_stack).slice(0, 3)" :key="t"
                  :class="[
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    ti === 0 ? 'bg-roc-50 text-roc-600' : ti === 1 ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  ]"
                >{{ t }}</span>
              </div>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-1">{{ p.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-2">{{ p.description }}</p>
              <p v-if="p.author_name" class="text-xs text-gray-400 mt-3">door {{ p.author_name }}</p>
            </div>
          </button>
        </div>

        <div class="text-center mt-10" data-animate data-animate-delay="300">
          <button
            class="inline-flex items-center gap-2 border-2 border-roc-500 text-roc-500 hover:bg-roc-500 hover:text-white font-semibold px-6 py-3 rounded-full transition-all"
            @click="go('projecten')"
          >
            Alle projecten bekijken
            <ArrowRight :size="15" />
          </button>
        </div>
      </div>
    </section>

    <section class="bg-roc-500 py-16" data-animate>
      <div class="max-w-3xl mx-auto px-6 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Klaar om mee te doen?</h2>
        <p class="text-white/80 mb-8 leading-relaxed">
          Of je nu student bent die zijn werk wil presenteren, of een bedrijf dat op zoek is naar talent — de Software Talent Hub is voor jou.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button
            class="bg-white text-roc-600 hover:bg-roc-50 font-semibold px-7 py-3 rounded-full transition-colors"
            @click="go('projecten')"
          >Project indienen</button>
          <button
            class="border-2 border-white text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-full transition-colors"
            @click="go('challenges')"
          >Challenge bekijken</button>
        </div>
      </div>
    </section>
  </div>
</template>
