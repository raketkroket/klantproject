<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Phone, Mail, MessageSquare, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const go = (name: string) => router.push({ name })

const platformLinks = [
  { label: 'Projecten', name: 'projecten' },
  { label: 'Challenges', name: 'challenges' },
  { label: 'Nieuws', name: 'nieuws' },
  { label: 'Contact', name: 'contact' },
]

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/school/roc-van-flevoland', letter: 'in' },
  { label: 'Facebook', href: 'https://www.facebook.com/ROCvanFlevoland', letter: 'f' },
  { label: 'Instagram', href: 'https://www.instagram.com/rocvanflevoland', letter: 'ig' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-100 text-gray-800">
    <div class="max-w-6xl mx-auto px-6 py-14">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div class="md:col-span-1">
          <img src="/image.png" alt="ROC van Flevoland" class="h-16 w-auto mb-4" />
          <p class="text-sm text-gray-500 leading-relaxed">
            Software Talent Hub verbindt studenten, bedrijven en onderwijs in de regio Flevoland.
          </p>
        </div>

        <div>
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Platform</h4>
          <ul class="space-y-3">
            <li v-for="l in platformLinks" :key="l.name">
              <button
                class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-roc-500 transition-colors group"
                @click="go(l.name)"
              >
                <ArrowRight :size="13" class="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200" />
                {{ l.label }}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Contact</h4>
          <p class="text-sm font-semibold text-gray-700 mb-3">Informatiecentrum</p>
          <div class="space-y-2.5">
            <a href="tel:09000918" class="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
              <Phone :size="14" class="shrink-0" /> 0900 - 0918
            </a>
            <a href="mailto:informatiecentrum@rocvf.nl" class="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
              <Mail :size="14" class="shrink-0" /> informatiecentrum@rocvf.nl
            </a>
            <a href="https://wa.me/31625038566" class="flex items-center gap-2.5 text-sm text-gray-500 hover:text-roc-500 transition-colors">
              <MessageSquare :size="14" class="shrink-0" /> 06 - 250 385 66
            </a>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Blijf op de hoogte</h4>
          <p class="text-sm text-gray-500 leading-relaxed mb-5">
            Schrijf je in voor onze nieuwsbrief en blijf op de hoogte van het laatste nieuws.
          </p>
          <button
            class="inline-flex items-center gap-2 bg-roc-500 hover:bg-roc-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            @click="go('nieuws')"
          >
            Nieuwsbrief <ArrowRight :size="14" />
          </button>
          <div class="flex items-center gap-3 mt-6">
            <a
              v-for="s in socials" :key="s.label"
              :href="s.href" target="_blank" rel="noopener noreferrer"
              :aria-label="s.label"
              class="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-roc-500 hover:border-roc-200 transition-colors shadow-sm text-xs font-bold"
            >{{ s.letter }}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-200 bg-gray-200/60">
      <div class="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
        <p>© {{ year }} ROC van Flevoland. Alle rechten voorbehouden.</p>
        <div class="flex items-center gap-4">
          <span class="hover:text-gray-600 cursor-pointer transition-colors">Privacy</span>
          <span class="hover:text-gray-600 cursor-pointer transition-colors">Disclaimer</span>
          <span class="hover:text-gray-600 cursor-pointer transition-colors">Cookies</span>
        </div>
      </div>
    </div>
  </footer>
</template>
