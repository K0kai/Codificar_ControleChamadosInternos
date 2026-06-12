import type { Priority, StatusTicket } from './ticket'

export type TicketForm = {
  title: string
  description: string
  requester: string
  priority: Priority
  status: StatusTicket
  technicianId: string
  automaticAttribution: boolean
}

export type TicketPayload = {
  title: string
  description: string
  requester: string
  priority: Priority
  status: StatusTicket
  technicianId: number
}
