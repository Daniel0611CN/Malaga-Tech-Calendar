const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
const consentKey = 'analytics-consent'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function hasAnalyticsConsent() {
  return localStorage.getItem(consentKey) === 'granted'
}

export function setAnalyticsConsent(granted: boolean) {
  localStorage.setItem(consentKey, granted ? 'granted' : 'denied')
  if (granted) loadAnalytics()
}

export function loadAnalytics() {
  if (!measurementId || !hasAnalyticsConsent() || typeof window.gtag === 'function') return

  window.dataLayer = window.dataLayer || []
  window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { anonymize_ip: true })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (window.gtag && hasAnalyticsConsent()) window.gtag('event', name, parameters)
}
