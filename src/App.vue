<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/layout/Header.vue'
import Footer from './components/layout/Footer.vue'

const route = useRoute()
const isAdminPage = computed(
  () => route.name === 'admin-dashboard' || route.name === 'admin-login'
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header v-if="!isAdminPage" />
    <main class="flex-1">
      <router-view v-slot="{ Component, route: r }">
        <div :key="r.fullPath" class="page-enter">
          <component :is="Component" />
        </div>
      </router-view>
    </main>
    <Footer v-if="!isAdminPage" />
  </div>
</template>
