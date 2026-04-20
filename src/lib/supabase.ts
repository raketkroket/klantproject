import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const createConfigError = () => new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.')

const createNoopQueryBuilder = () => {
	const builder: any = {
		select: () => builder,
		eq: () => builder,
		order: () => builder,
		limit: () => builder,
		update: () => builder,
		delete: () => builder,
		insert: () => builder,
		upsert: () => builder,
		single: async () => ({ data: null, error: createConfigError() }),
		maybeSingle: async () => ({ data: null, error: createConfigError() }),
	}

	return builder
}

const createNoopChannel = () => {
	const channel: any = {
		on: () => channel,
		subscribe: () => channel,
		unsubscribe: () => undefined,
	}

	return channel
}

const createNoopSupabase = () => ({
	auth: {
		getSession: async () => ({ data: { session: null }, error: null }),
		onAuthStateChange: () => ({
			data: {
				subscription: {
					unsubscribe: () => undefined,
				},
			},
		}),
		signInWithPassword: async () => ({ data: null, error: createConfigError() }),
		signUp: async () => ({ data: null, error: createConfigError() }),
		signOut: async () => ({ error: null }),
	},
	from: () => createNoopQueryBuilder(),
	storage: {
		from: () => ({
			upload: async () => ({ data: null, error: createConfigError() }),
			getPublicUrl: () => ({ data: { publicUrl: '' } }),
		}),
	},
	channel: () => createNoopChannel(),
	removeChannel: async () => undefined,
})

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: (createNoopSupabase() as any)
