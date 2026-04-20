<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Menu, X, Search, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'
import LoginPanel from '../LoginPanel.vue'

const router = useRouter()
const route = useRoute()
const { user, signOut } = useAuth()

type NavItem = { label: string; name: string }
const navItems: NavItem[] = [
  { label: 'Projecten', name: 'projecten' },
  { label: 'Challenges', name: 'challenges' },
  { label: 'Nieuws', name: 'nieuws' },
  { label: 'Contact', name: 'contact' },
]

const loginOpen = ref(false)
const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')

const closeAllOverlays = () => {
  mobileOpen.value = false
  loginOpen.value = false
  searchOpen.value = false
  searchQuery.value = ''
  document.body.style.overflow = ''
}

const openLogin = () => {
  mobileOpen.value = false
  searchOpen.value = false
  searchQuery.value = ''
  document.body.style.overflow = ''
  loginOpen.value = true
}

watch(mobileOpen, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
watch(() => route.fullPath, () => {
  closeAllOverlays()
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const go = (name: string) => router.push({ name })
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 pointer-events-none">
    <div
      class="absolute inset-x-0 top-0 h-36 pointer-events-none"
      :style="{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 100%)' }"
    />

    <div class="absolute top-0 left-0 right-0 pointer-events-none">
      <div class="max-w-[1400px] mx-auto px-6 md:px-10">
        <button aria-label="Ga naar homepage" class="pointer-events-auto inline-block" @click="go('home')">
          <img src="/image.png" alt="ROC van Flevoland" class="h-20 md:h-24 w-auto object-contain" />
        </button>
      </div>
    </div>

    <div class="hidden md:flex justify-end pr-6 md:pr-10 pt-5">
      <nav class="bg-white rounded-full shadow-lg px-2 py-2 flex items-center gap-1 pointer-events-auto">
        <button
          v-for="item in navItems" :key="item.name"
          :class="['flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap', route.name === item.name ? 'bg-roc-500 text-white' : 'text-gray-700 hover:bg-gray-100']"
          @click="go(item.name)"
        >
          {{ item.label }}
          <ChevronDown :size="13" class="opacity-40" />
        </button>

        <div class="w-px h-5 bg-gray-200 mx-1" />

        <div v-if="searchOpen" class="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5">
          <Search :size="15" class="text-gray-400 shrink-0" />
          <input
            v-model="searchQuery"
            autofocus
            type="text"
            placeholder="Zoeken…"
            class="bg-transparent text-sm w-32 outline-none text-gray-800 placeholder:text-gray-400"
            @blur="searchOpen = false; searchQuery = ''"
          />
        </div>
        <button
          v-else
          aria-label="Zoeken"
          class="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          @click="searchOpen = true"
        >
          <Search :size="16" />
        </button>

        <template v-if="user">
          <button
            class="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            @click="go('admin-dashboard')"
          >
            <LayoutDashboard :size="15" /> Dashboard
          </button>
          <button
            aria-label="Uitloggen"
            class="p-2.5 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            @click="signOut()"
          >
            <LogOut :size="16" />
          </button>
        </template>
        <button
          v-else
          aria-label="Inloggen"
          class="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          @click="openLogin"
        >
          <User :size="16" />
        </button>
      </nav>
    </div>

    <div class="md:hidden absolute top-4 right-4 pointer-events-auto">
      <button
        aria-label="Menu openen"
        class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-700"
        @click="mobileOpen = !mobileOpen"
      >
        <X v-if="mobileOpen" :size="20" />
        <Menu v-else :size="20" />
      </button>
    </div>
  </header>

  <div v-if="mobileOpen" class="fixed inset-0 z-[100] flex md:hidden">
    <div class="absolute inset-0 bg-black/40" @click="mobileOpen = false" />
    <div class="relative ml-auto w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button @click="go('home')">
          <img src="/image.png" alt="ROC van Flevoland" class="h-12 w-auto" />
        </button>
        <button class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" @click="mobileOpen = false">
          <X :size="16" />
        </button>
      </div>

      <nav class="flex flex-col gap-1 px-4 py-5 flex-1 overflow-y-auto">
        <button
          v-for="item in navItems" :key="item.name"
          :class="['text-left px-4 py-3 rounded-xl text-base font-medium transition-colors', route.name === item.name ? 'bg-roc-500 text-white' : 'text-gray-800 hover:bg-gray-100']"
          @click="go(item.name)"
        >{{ item.label }}</button>

        <div class="border-t border-gray-100 mt-4 pt-4 space-y-1">
          <template v-if="user">
            <button
              class="w-full flex items-center gap-2 text-left px-4 py-3 rounded-xl text-base font-medium text-gray-800 hover:bg-gray-100"
              @click="go('admin-dashboard')"
            >
              <LayoutDashboard :size="17" /> Dashboard
            </button>
            <button
              class="w-full flex items-center gap-2 text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              @click="signOut()"
            >
              <LogOut :size="17" /> Uitloggen
            </button>
          </template>
          <button
            v-else
            class="w-full bg-roc-500 text-white px-4 py-3 rounded-xl text-base font-semibold flex items-center gap-2"
            @click="openLogin"
          >
            <User :size="17" /> Inloggen
          </button>
        </div>
      </nav>
    </div>
  </div>

  <LoginPanel :is-open="loginOpen" @close="loginOpen = false" />
</template>
