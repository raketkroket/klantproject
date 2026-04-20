import { ref, readonly } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(true)

let initialized = false

function init() {
  if (initialized) return
  initialized = true

  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
    user.value = data.session?.user ?? null
    loading.value = false
  })

  supabase.auth.onAuthStateChange((_event, newSession) => {
    ;(async () => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })()
  })
}

export function useAuth() {
  init()

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? error.message : null }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? error.message : null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user: readonly(user),
    session: readonly(session),
    loading: readonly(loading),
    signIn,
    signUp,
    signOut,
  }
}
