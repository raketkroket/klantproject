<script setup lang="ts">
import { ref } from 'vue'
import {
  Phone, Mail, MessageSquare, ArrowRight, CircleCheck as CheckCircle,
  MapPin, Clock, Calendar, Users, GraduationCap, ChevronRight
} from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useScrollAnimation } from '../composables/useScrollAnimation'

useScrollAnimation()

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const contacts = [
  {
    icon: Phone,
    label: 'Bel ons',
    value: '0900 - 0918',
    sub: 'Ma–vr 08:30 – 17:00',
    href: 'tel:09000918',
    accent: 'bg-roc-500',
  },
  {
    icon: Mail,
    label: 'Mail ons',
    value: 'informatiecentrum@rocvf.nl',
    sub: 'Reactie binnen 2 werkdagen',
    href: 'mailto:informatiecentrum@rocvf.nl',
    accent: 'bg-gray-900',
  },
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: '06 - 250 385 66',
    sub: 'Snel antwoord via chat',
    href: 'https://wa.me/31625038566',
    accent: 'bg-emerald-600',
  },
]

const infoBlocks = [
  {
    icon: Users,
    title: 'Studiekeuze-adviseur',
    body: 'Twijfel je over welke opleiding bij jou past? Plan een persoonlijk gesprek met een studiekeuze-adviseur.',
    cta: 'Maak een afspraak',
    href: 'mailto:informatiecentrum@rocvf.nl?subject=Afspraak studiekeuze-adviseur',
  },
  {
    icon: Calendar,
    title: 'Open dagen & Meeloopdagen',
    body: 'Kom de sfeer proeven en ontdek hoe een dag op het ROC eruitziet. Schrijf je in voor een open dag of meeloopdag.',
    cta: 'Bekijk data',
    href: 'https://www.rocvanflevoland.nl/opendagen',
  },
  {
    icon: GraduationCap,
    title: 'Hulp bij aanmelden',
    body: 'Heb je vragen over het aanmeldproces, studiefinanciering of toelatingseisen? We helpen je graag op weg.',
    cta: 'Stel je vraag',
    href: 'mailto:informatiecentrum@rocvf.nl?subject=Hulp bij aanmelden',
  },
]

const locations = [
  { name: 'ROC van Flevoland – Almere', address: 'Louis Armstrongweg 40, 1311 RK Almere' },
  { name: 'ROC van Flevoland – Lelystad', address: 'Bongerd 1, 8232 ZL Lelystad' },
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
    <div class="relative pt-32 md:pt-36 pb-10 md:pb-14 bg-gradient-to-b from-stone-50 to-white overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-roc-100/70 blur-3xl" />
        <div class="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>

      <div class="relative max-w-[1300px] mx-auto px-6 md:px-10">
        <div class="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <span class="hover:text-gray-600 cursor-pointer transition-colors">Home</span>
          <ChevronRight :size="12" />
          <span class="text-roc-500 font-semibold">Contact</span>
        </div>

        <div class="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div class="md:col-span-7">
            <span class="inline-flex items-center gap-2 bg-white border border-roc-100 text-roc-600 rounded-full pl-2 pr-4 py-1.5 text-xs font-bold tracking-wider uppercase shadow-sm mb-6">
              <span class="w-5 h-5 rounded-full bg-roc-500 flex items-center justify-center text-white">
                <MessageSquare :size="10" />
              </span>
              Informatiecentrum
            </span>
            <h1 class="text-4xl sm:text-5xl md:text-[3.75rem] font-bold text-gray-900 tracking-tight leading-[1.05] mb-6">
              Welkom bij het <span class="relative inline-block">
                <span class="relative z-10 text-roc-500">Informatie&shy;centrum</span>
                <span class="absolute left-0 right-0 bottom-1 h-3 bg-roc-100/80 -z-0"></span>
              </span>
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Wij zijn jouw eerste aanspreekpunt voor vragen over opleidingen, aanmelden of studiekeuze. Bel, mail of app — we helpen je graag verder.
            </p>

            <div class="flex flex-wrap items-center gap-3 mt-8">
              <a href="tel:09000918" class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-lg shadow-roc-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Phone :size="15" /> 0900 - 0918
              </a>
              <a href="mailto:informatiecentrum@rocvf.nl" class="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-full text-sm border border-gray-200 hover:border-gray-900 transition-all">
                <Mail :size="15" /> Stuur een mail
              </a>
            </div>
          </div>

          <div class="md:col-span-5 relative">
            <div class="relative aspect-[4/5] max-w-sm mx-auto md:ml-auto md:mr-0">
              <div class="absolute -inset-4 bg-gradient-to-br from-roc-200/60 to-amber-100/40 rounded-[2.5rem] rotate-3" />
              <div class="absolute -inset-2 bg-white rounded-[2rem] -rotate-2 shadow-xl" />
              <div class="relative rounded-3xl overflow-hidden shadow-2xl h-full">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt="Informatiecentrum medewerkers"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              <div class="absolute -left-4 bottom-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[15rem]">
                <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle :size="18" />
                </div>
                <div>
                  <p class="text-xs font-bold text-gray-900">Online</p>
                  <p class="text-[0.7rem] text-gray-500">Reactie binnen 2 werkdagen</p>
                </div>
              </div>
              <div class="absolute -right-2 top-8 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-roc-500 flex items-center justify-center text-white">
                  <Phone :size="14" />
                </div>
                <div class="pr-2">
                  <p class="text-[0.65rem] font-bold tracking-wider uppercase text-gray-400">Ma–vr</p>
                  <p class="text-xs font-bold text-gray-900">08:30 – 17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <section class="max-w-[1300px] mx-auto px-6 md:px-10 pt-14 md:pt-20">
      <div class="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
        <div class="md:col-span-5" data-animate>
          <span class="text-[0.7rem] font-bold tracking-[0.25em] text-roc-500 uppercase">Wij helpen je verder</span>
          <h2 class="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-[1.15]">
            Heb je vragen over onze opleidingen of hulp nodig bij je aanmelding?
          </h2>
        </div>
        <div class="md:col-span-7 md:pt-3" data-animate data-animate-delay="120">
          <p class="text-gray-600 leading-relaxed text-base md:text-lg">
            Een opleiding kiezen kan lastig zijn. Dat begrijpen wij heel goed. Heb je vragen over een van onze opleidingen, of heb je hulp nodig bij je aanmelding? Dan is het Informatiecentrum van het ROC van Flevoland de plek waar je moet zijn. Ons team staat klaar om al je vragen te beantwoorden.
          </p>
        </div>
      </div>
    </section>

    <section class="max-w-[1300px] mx-auto px-6 md:px-10 pt-14 md:pt-16">
      <div class="flex items-end justify-between mb-8 pb-4 border-b border-gray-200">
        <h3 class="text-xl md:text-2xl font-bold text-gray-900">Zo kun je ons bereiken</h3>
        <span class="hidden sm:inline text-xs text-gray-400 tracking-wider uppercase font-medium">3 manieren</span>
      </div>

      <div class="grid md:grid-cols-3 gap-5 md:gap-6">
        <a
          v-for="(c, i) in contacts" :key="c.label"
          :href="c.href"
          :target="c.href.startsWith('http') ? '_blank' : undefined"
          :rel="c.href.startsWith('http') ? 'noopener noreferrer' : undefined"
          class="group relative bg-white border border-gray-200 rounded-3xl p-7 md:p-8 hover:border-gray-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          data-animate
          :data-animate-delay="`${i * 100}`"
        >
          <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-roc-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div class="relative">
            <div :class="[c.accent, 'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-black/10 group-hover:scale-105 transition-transform']">
              <component :is="c.icon" :size="22" class="text-white" />
            </div>
            <p class="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">{{ c.label }}</p>
            <p class="text-xl font-bold text-gray-900 leading-tight mb-1 break-words">{{ c.value }}</p>
            <p class="text-sm text-gray-500 mb-6">{{ c.sub }}</p>
            <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 group-hover:text-roc-500 group-hover:gap-2.5 transition-all">
              Contact opnemen <ArrowRight :size="15" />
            </span>
          </div>
        </a>
      </div>
    </section>

    <section class="max-w-[1300px] mx-auto px-6 md:px-10 pt-16 md:pt-24">
      <div class="grid md:grid-cols-3 gap-5 md:gap-6">
        <div
          v-for="(b, i) in infoBlocks" :key="b.title"
          class="group bg-gradient-to-br from-stone-50 to-white border border-gray-100 rounded-3xl p-7 md:p-8 hover:shadow-xl transition-all duration-300 flex flex-col"
          data-animate
          :data-animate-delay="`${i * 100}`"
        >
          <div class="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-5 text-roc-500 group-hover:bg-roc-500 group-hover:text-white group-hover:border-roc-500 transition-colors">
            <component :is="b.icon" :size="20" />
          </div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">{{ b.title }}</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-5 flex-1">{{ b.body }}</p>
          <a
            :href="b.href"
            :target="b.href.startsWith('http') ? '_blank' : undefined"
            :rel="b.href.startsWith('http') ? 'noopener noreferrer' : undefined"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-roc-500 group-hover:gap-2.5 transition-all"
          >
            {{ b.cta }} <ArrowRight :size="14" />
          </a>
        </div>
      </div>
    </section>

    <section class="mt-20 md:mt-28 bg-gray-50 border-y border-gray-100">
      <div class="max-w-[1300px] mx-auto px-6 md:px-10 py-16 md:py-20">
        <div class="grid md:grid-cols-12 gap-10 md:gap-14">
          <div class="md:col-span-5" data-animate>
            <span class="text-[0.7rem] font-bold tracking-[0.25em] text-roc-500 uppercase">Stuur ons een bericht</span>
            <h2 class="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-[1.15] mb-6">
              Liever schriftelijk contact? Vul dan het formulier in.
            </h2>
            <p class="text-gray-600 leading-relaxed mb-10">
              We nemen zo snel mogelijk contact met je op — doorgaans binnen 2 werkdagen. Noem in je bericht de naam van de opleiding waarover je een vraag hebt, dan kunnen we je gerichter helpen.
            </p>

            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-roc-500 shrink-0">
                  <Clock :size="16" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">Openingstijden</p>
                  <p class="text-sm text-gray-500">Maandag t/m vrijdag · 08:30 – 17:00</p>
                </div>
              </div>
              <div
                v-for="loc in locations" :key="loc.name"
                class="flex items-start gap-4"
              >
                <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-roc-500 shrink-0">
                  <MapPin :size="16" />
                </div>
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ loc.name }}</p>
                  <p class="text-sm text-gray-500">{{ loc.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-7" data-animate data-animate-delay="120">
            <div class="bg-white border border-gray-200 rounded-3xl p-7 md:p-10 shadow-sm">
              <div v-if="submitted" class="flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <CheckCircle :size="22" class="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p class="font-bold text-emerald-900 mb-1">Bericht verstuurd!</p>
                  <p class="text-sm text-emerald-800">Bedankt voor je bericht. We nemen zo snel mogelijk contact met je op.</p>
                </div>
              </div>

              <form v-else class="space-y-5" @submit="handleSubmit">
                <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{{ error }}</div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Naam <span class="text-roc-500">*</span></label>
                    <input v-model="form.name" type="text" required placeholder="Voornaam Achternaam" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-roc-500 focus:ring-4 focus:ring-roc-500/10 bg-gray-50 placeholder:text-gray-400 transition-all" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">E-mailadres <span class="text-roc-500">*</span></label>
                    <input v-model="form.email" type="email" required placeholder="naam@voorbeeld.nl" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-roc-500 focus:ring-4 focus:ring-roc-500/10 bg-gray-50 placeholder:text-gray-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Onderwerp <span class="text-roc-500">*</span></label>
                  <input v-model="form.subject" type="text" required placeholder="Waar gaat je vraag over?" class="w-full px-5 py-3.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-roc-500 focus:ring-4 focus:ring-roc-500/10 bg-gray-50 placeholder:text-gray-400 transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Bericht <span class="text-roc-500">*</span></label>
                  <textarea v-model="form.message" required :rows="6" placeholder="Noem hier ook de naam van de opleiding waarover je een vraag hebt." class="w-full px-5 py-4 border border-gray-200 rounded-3xl text-sm focus:outline-none focus:border-roc-500 focus:ring-4 focus:ring-roc-500/10 bg-gray-50 placeholder:text-gray-400 resize-none transition-all" />
                </div>

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                  <p class="text-xs text-gray-400 leading-relaxed">
                    Door te verzenden ga je akkoord met ons privacybeleid. We gebruiken je gegevens alleen om je vraag te beantwoorden.
                  </p>
                  <button
                    type="submit" :disabled="submitting"
                    class="inline-flex items-center justify-center gap-2.5 bg-roc-500 hover:bg-roc-600 text-white font-semibold px-8 py-3.5 rounded-full transition-all disabled:opacity-60 text-sm shadow-lg shadow-roc-500/20 hover:shadow-xl hover:shadow-roc-500/30 hover:-translate-y-0.5 shrink-0"
                  >
                    {{ submitting ? 'Verzenden…' : 'Verstuur bericht' }}
                    <ArrowRight v-if="!submitting" :size="16" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-[1300px] mx-auto px-6 md:px-10 py-16 md:py-24">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-roc-900 px-8 md:px-14 py-12 md:py-16">
        <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-roc-500/20 blur-3xl" />
        <div class="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-roc-400/10 blur-3xl" />
        <div class="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <span class="text-[0.7rem] font-bold tracking-[0.25em] text-roc-300 uppercase mb-4 block">Blijf op de hoogte</span>
            <h3 class="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">Mis geen enkel verhaal uit de Software Talent Hub</h3>
            <p class="text-white/70 leading-relaxed">Ontvang updates over nieuwe projecten, challenges en kansen in de regio Flevoland.</p>
          </div>
          <div class="flex md:justify-end">
            <router-link
              :to="{ name: 'nieuws' }"
              class="inline-flex items-center gap-2.5 bg-white text-gray-900 hover:bg-roc-500 hover:text-white font-semibold px-8 py-4 rounded-full transition-all text-sm shadow-xl"
            >
              Bekijk het nieuws <ArrowRight :size="16" />
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
