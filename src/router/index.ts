import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('../pages/Home.vue') },
  { path: '/projecten', name: 'projecten', component: () => import('../pages/Projecten.vue') },
  { path: '/challenges', name: 'challenges', component: () => import('../pages/Challenges.vue') },
  { path: '/nieuws', name: 'nieuws', component: () => import('../pages/Nieuws.vue') },
  { path: '/contact', name: 'contact', component: () => import('../pages/Contact.vue') },
  { path: '/admin-login', name: 'admin-login', component: () => import('../pages/admin/AdminLogin.vue') },
  { path: '/admin-dashboard', name: 'admin-dashboard', component: () => import('../pages/admin/AdminDashboard.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})
