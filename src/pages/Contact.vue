<script setup lang="ts">
import { ref } from 'vue'
import { Phone, Mail, MessageSquare, ArrowRight, CircleCheck as CheckCircle } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const contacts = [
  { icon: Phone, label: 'TELEFOON', value: '0900 - 0918', href: 'tel:09000918' },
  { icon: Mail, label: 'E-MAIL', value: 'informatiecentrum@rocvf.nl', href: 'mailto:informatiecentrum@rocvf.nl' },
  { icon: MessageSquare, label: 'WHATSAPP', value: '06 - 250 385 66', href: 'https://wa.me/31625038566' },
]

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (!form.value.name || !form.value.email || !form.value.message) return
  submitting.value = true
  error.value = ''
  const { error: err } = await supabase.from('contact_messages').insert(form.value)
  submitting.value = false
  if (err) {
    error.value = 'Er is iets misgegaan. Probeer het opnieuw.'
  } else {
    submitted.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="relative w-full h-52 sm:h-64 md:h-72">
      <img
        src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt="Contact"
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div class="absolute inset-x-0 bottom-6">
        <div class="max-w-[1400px] mx-auto px-6 md:px-10">
          <span class="text-xs font-bold tracking-widest text-roc-300 uppercase block mb-1">Informatiecentrum</span>
          <h1 class="text-3xl sm:text-4xl font-bold text-white">Contact</h1>
          <p class="text-white/70 text-sm mt-1">Welkom bij het Informatiecentrum</p>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-8 md:px-16 pt-8 pb-16">
      <div class="grid md:grid-cols-2 gap-10 md:gap-16">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-snug">
            Heb je vragen over onze opleidingen of hulp nodig bij je aanmelding? Bij het Informatiecentrum helpen we je verder!
          </h2>
          <p class="text-gray-600 leading-relaxed mb-8">
            Een opleiding kiezen kan lastig zijn. Dat begrijpen wij heel goed. Heb je vragen over een van onze opleidingen? Of heb je hulp nodig bij je aanmelding? Dan is het Informatiecentrum van het ROC van Flevoland de plek waar je moet zijn.
          </p>

          <h3 class="text-xl font-bold text-gray-900 mb-5">Zo kun je ons bereiken</h3>

          <div class="space-y-4">
            <a v-for="c in contacts" :key="c.label" :href="c.href" class="flex items-center gap-4 group">
              <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-roc-50 transition-colors">
                <component :is="c.icon" :size="18" class="text-gray-500 group-hover:text-roc-500 transition-colors" />
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 tracking-widest uppercase mb-0.5">{{ c.label }}</p>
                <p class="text-base font-semibold text-gray-900">{{ c.value }}</p>
              </div>
            </a>
          </div>

          <div class="mt-10 pt-10 border-t border-gray-100">
            <h3 class="text-xl font-bold text-gray-900 mb-3">Afspraak met studiekeuze-adviseur maken?</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              Vind je het lastig om een opleiding te kiezen? Of twijfel je welke opleiding beter bij jou past? Een persoonlijk gesprek met een studiekeuze-adviseur kan dan helpen.
            </p>
            <a href="mailto:informatiecentrum@rocvf.nl" class="inline-flex items-center gap-2 mt-5 text-roc-500 font-semibold text-sm hover:gap-3 transition-all">
              Maak een afspraak <ArrowRight :size="16" />
            </a>
          </div>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Stuur ons een bericht</h2>

          <div v-if="submitted" class="flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl p-6">
            <CheckCircle :size="22" class="text-green-500 shrink-0 mt-0.5" />
            <div>
              <p class="font-semibold text-green-800 mb-1">Bericht verstuurd!</p>
              <p class="text-sm text-green-700">We nemen zo snel mogelijk contact met je op.</p>
            </div>
          </div>

          <form v-else class="space-y-5" @submit="handleSubmit">
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{{ error }}</div>

            <div class="grid grid-cols-1 gap-5">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Naam <span class="text-roc-500">*</span></label>
                <input v-model="form.name" type="text" required placeholder="Voornaam" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">E-mailadres <span class="text-roc-500">*</span></label>
                <input v-model="form.email" type="email" required placeholder="E-mailadres" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Onderwerp <span class="text-roc-500">*</span></label>
                <input v-model="form.subject" type="text" required placeholder="Onderwerp" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1.5">Bericht <span class="text-roc-500">*</span></label>
                <textarea v-model="form.message" required :rows="5" placeholder="Noem hier ook de naam van de opleiding waarover je een vraag hebt." class="w-full px-5 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-roc-500 bg-gray-50 placeholder:text-gray-400 resize-none" />
              </div>
            </div>

            <button
              type="submit" :disabled="submitting"
              class="flex items-center gap-2.5 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-8 py-3.5 rounded-full transition-colors disabled:opacity-60 text-sm"
            >
              {{ submitting ? 'Verzenden…' : 'Verzenden' }}
              <ArrowRight v-if="!submitting" :size="16" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
