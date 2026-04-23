<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn, UserPlus, CircleAlert as AlertCircle, Loader as Loader2, CircleCheck as CheckCircle } from 'lucide-vue-next'
import { useAuth } from '../../composables/useAuth'

const REGISTRATION_CODE = 'ROCVA2026'

const router = useRouter()
const { user, signIn, signUp } = useAuth()

const tab = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const regCode = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const toSignupMessage = (err: string) => {
  const lower = err.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'Er bestaat al een account met dit e-mailadres. Log in of reset je wachtwoord.'
  }
  if (lower.includes('password')) {
    return 'Kies een sterker wachtwoord en probeer opnieuw.'
  }
  if (lower.includes('invalid email')) {
    return 'Voer een geldig e-mailadres in.'
  }
  if (lower.includes('signup is disabled')) {
    return 'Registreren is momenteel uitgeschakeld. Neem contact op met een beheerder.'
  }
  return 'Registratie mislukt. Probeer het opnieuw.'
}

watchEffect(() => {
  if (user.value) router.replace({ name: 'admin-dashboard' })
})

const switchTab = (t: 'login' | 'register') => {
  tab.value = t
  error.value = null
  success.value = null
}

const handleLogin = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  error.value = null
  const { error: err } = await signIn(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = 'Ongeldig e-mailadres of wachtwoord.'
  } else {
    router.replace({ name: 'admin-dashboard' })
  }
}

const handleRegister = async (e: Event) => {
  e.preventDefault()
  error.value = null
  if (regCode.value.trim().toUpperCase() !== REGISTRATION_CODE) {
    error.value = 'Ongeldige registratiecode. Neem contact op met een beheerder.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Wachtwoorden komen niet overeen.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Wachtwoord moet minimaal 8 tekens bevatten.'
    return
  }
  loading.value = true
  const { error: err, requiresEmailConfirmation } = await signUp(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = toSignupMessage(err)
  } else {
    success.value = requiresEmailConfirmation
      ? 'Account aangemaakt! Controleer je e-mail om je account te bevestigen voordat je inlogt.'
      : 'Account aangemaakt! Je kunt nu inloggen.'
    tab.value = 'login'
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    regCode.value = ''
  }
}

const inputClass = 'w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-roc-500 focus:ring-1 focus:ring-roc-500 transition-colors'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <img src="/image.png" alt="ROC van Flevoland" class="h-20 w-auto mx-auto mb-4" />
        <p class="text-gray-500 text-sm">Beheerdersomgeving Software Talent Hub</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="flex border-b border-gray-100">
          <button
            :class="['flex-1 py-4 text-sm font-semibold transition-colors', tab === 'login' ? 'text-roc-500 border-b-2 border-roc-500 bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50']"
            @click="switchTab('login')"
          >Inloggen</button>
          <button
            :class="['flex-1 py-4 text-sm font-semibold transition-colors', tab === 'register' ? 'text-roc-500 border-b-2 border-roc-500 bg-white' : 'text-gray-400 hover:text-gray-600 bg-gray-50']"
            @click="switchTab('register')"
          >Registreren</button>
        </div>

        <div class="p-8">
          <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm mb-5">
            <AlertCircle :size="16" class="flex-shrink-0" />
            {{ error }}
          </div>
          <div v-if="success" class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm mb-5">
            <CheckCircle :size="16" class="flex-shrink-0" />
            {{ success }}
          </div>

          <form v-if="tab === 'login'" class="space-y-5" @submit="handleLogin">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input v-model="email" type="email" required placeholder="naam@rocvanflevoland.nl" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
              <input v-model="password" type="password" required placeholder="••••••••" :class="inputClass" />
            </div>
            <button
              type="submit" :disabled="loading"
              class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <template v-if="loading"><Loader2 :size="18" class="animate-spin" />Inloggen...</template>
              <template v-else><LogIn :size="18" />Inloggen</template>
            </button>
          </form>

          <form v-else class="space-y-5" @submit="handleRegister">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input v-model="email" type="email" required placeholder="naam@rocvanflevoland.nl" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
              <input v-model="password" type="password" required placeholder="Minimaal 8 tekens" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord herhalen</label>
              <input v-model="confirmPassword" type="password" required placeholder="••••••••" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Registratiecode</label>
              <input v-model="regCode" type="text" required placeholder="Voer de registratiecode in" :class="inputClass" />
              <p class="text-xs text-gray-400 mt-1.5">Alleen voor medewerkers van ROC van Flevoland</p>
            </div>
            <button
              type="submit" :disabled="loading"
              class="w-full flex items-center justify-center gap-2 bg-roc-500 hover:bg-roc-600 disabled:bg-roc-300 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <template v-if="loading"><Loader2 :size="18" class="animate-spin" />Bezig...</template>
              <template v-else><UserPlus :size="18" />Account aanmaken</template>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
