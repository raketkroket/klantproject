<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'
import { isSupabaseConfigured } from './lib/supabase'

const route = useRoute()
const isAdminPage = computed(
  () => route.name === 'admin-dashboard' || route.name === 'admin-login'
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div v-if="!isSupabaseConfigured" class="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm px-4 py-3 text-center">
      Supabase is niet geconfigureerd. Voeg VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY toe aan .env.local.
    </div>
    <Header v-if="!isAdminPage" />
    <main class="flex-1">
      <router-view v-slot="{ Component, route: r }">
        <div :key="r.fullPath" class="page-enter">
          <component :is="Component" />
        </div>
      </router-view>
    </main>
    <Footer v-if="!isAdminPage" />
    <div v-if="isAdminPage" class="bg-gray-900 text-gray-100 border-t border-black/20">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-center">
        <p class="text-xs font-semibold tracking-[0.25em] uppercase">
          Made by <span class="text-roc-400">CHAS</span>
        </p>
      </div>
    </div>
  </div>
</template>
