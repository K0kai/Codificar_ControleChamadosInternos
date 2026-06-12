import type { Priority, StatusTicket } from './ticket'

export type TicketFilters = {
  keyword: string
  status: 'Todos' | StatusTicket
  priority: 'Todas' | Priority
  technicianId: string
  page: number
}
