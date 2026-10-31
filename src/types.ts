export type Category = 'IA' | 'Desarrollo' | 'Startups' | 'Gaming' | 'Ciberseguridad' | 'Otros'
export type TechEvent = {
  id: string
  title: string
  category: Category
  start: string // ISO 8601
  end?: string
  allDay?: boolean // sin hora concreta
  image?: string // URL de un cartel oficial; si falta se genera una portada
  projected?: boolean // fecha estimada (edición futura sin confirmar)
  note?: string // aviso mostrado en el detalle
  venue: string
  address?: string
  lat?: number
  lon?: number
  description: string
  url: string // página oficial / inscripción
  source: string
  organizer?: string
  speakers?: { name: string; role?: string }[]
  attendees?: number // solo cifra agregada, nunca nombres
  capacity?: number
  price?: string
  language?: string
}
