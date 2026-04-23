<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { signIn, signUp } = useAuth()
const router = useRouter()

const REGISTRATION_CODE = 'ROCVA2026'

const tab = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const regCode = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

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

const resetFields = () => {
  error.value = ''
  success.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  regCode.value = ''
}

watch([tab, () => props.isOpen], resetFields)

watch(
  () => props.isOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)

const keyHandler = (e: KeyboardEvent) => {
  if (props.isOpen && e.key === 'Escape') emit('close')
}
window.addEventListener('keydown', keyHandler)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', keyHandler)
  document.body.style.overflow = ''
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  const { error: err } = await signIn(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = 'Onjuist e-mailadres of wachtwoord.'
  } else {
    emit('close')
    router.push({ name: 'admin-dashboard' })
  }
}

const handleRegister = async () => {
  error.value = ''
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
  }
}

const onEnter = () => {
  if (tab.value === 'login') handleLogin()
  else handleRegister()
}

const inputClass = 'w-full px-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 focus:border-transparent placeholder:text-gray-400'
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[200] flex items-center justify-center p-4 login-backdrop"
    :style="{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden login-panel"
      @click.stop
    >
      <div class="bg-roc-500 px-8 pt-8 pb-6">
        <button
          class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>
        <img src="/image.png" alt="ROC van Flevoland" class="h-14 w-auto mb-4" />
        <h2 class="text-2xl font-bold text-white">
          {{ tab === 'login' ? 'Inloggen' : 'Account aanmaken' }}
        </h2>
        <p class="text-white/75 text-sm mt-1">Beheerdersomgeving Software Talent Hub</p>
      </div>

      <div class="flex border-b border-gray-100">
        <button
          :class="['flex-1 py-3 text-sm font-semibold transition-colors', tab === 'login' ? 'text-roc-500 border-b-2 border-roc-500' : 'text-gray-400 hover:text-gray-600']"
          @click="tab = 'login'"
        >Inloggen</button>
        <button
          :class="['flex-1 py-3 text-sm font-semibold transition-colors', tab === 'register' ? 'text-roc-500 border-b-2 border-roc-500' : 'text-gray-400 hover:text-gray-600']"
          @click="tab = 'register'"
        >Registreren</button>
      </div>

      <div class="p-8">
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{{ error }}</div>
        <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{{ success }}</div>

        <div v-if="tab === 'login'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
            <input v-model="email" type="email" placeholder="naam@rocvanflevoland.nl" :class="inputClass" @keydown.enter="onEnter" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
            <input v-model="password" type="password" placeholder="••••••••" :class="inputClass" @keydown.enter="onEnter" />
          </div>
          <button
            :disabled="loading"
            class="w-full bg-roc-500 hover:bg-roc-600 text-white font-semibold py-3 px-6 rounded-full transition-colors disabled:opacity-60 mt-2"
            @click="handleLogin"
          >{{ loading ? 'Bezig…' : 'Inloggen →' }}</button>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">E-mailadres</label>
            <input v-model="email" type="email" placeholder="naam@rocvanflevoland.nl" :class="inputClass" @keydown.enter="onEnter" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord</label>
            <input v-model="password" type="password" placeholder="Minimaal 8 tekens" :class="inputClass" @keydown.enter="onEnter" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Wachtwoord herhalen</label>
            <input v-model="confirmPassword" type="password" placeholder="••••••••" :class="inputClass" @keydown.enter="onEnter" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Registratiecode</label>
            <input v-model="regCode" type="text" placeholder="Voer de code in" :class="inputClass" @keydown.enter="onEnter" />
            <p class="text-xs text-gray-400 mt-1">Alleen beschikbaar voor medewerkers van ROC van Flevoland</p>
          </div>
          <button
            :disabled="loading"
            class="w-full bg-roc-500 hover:bg-roc-600 text-white font-semibold py-3 px-6 rounded-full transition-colors disabled:opacity-60 mt-2"
            @click="handleRegister"
          >{{ loading ? 'Bezig…' : 'Account aanmaken →' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
