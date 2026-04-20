import { onMounted, onUpdated, onBeforeUnmount } from 'vue'

export function useScrollAnimation() {
  let observer: IntersectionObserver | null = null

  const attach = () => {
    observer?.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer!.observe(el))
  }

  onMounted(attach)
  onUpdated(attach)
  onBeforeUnmount(() => observer?.disconnect())
}
