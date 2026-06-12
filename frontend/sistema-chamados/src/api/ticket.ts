import { requestEmpty, requestJson } from './client'
import type { Ticket, StatusTicket } from '../types/ticket'
import type { TicketFilters } from '../types/filters'
import type { TicketPayload } from '../types/ticketForm'

function buildTicketSearchPath(filters: TicketFilters) {

  const params = new URLSearchParams()
  if (filters.keyword.trim()) params.set('keyword', filters.keyword.trim())
  if (filters.status !== 'Todos') params.set('status', filters.status)
  if (filters.priority !== 'Todas') params.set('priority', filters.priority)
  if (filters.technicianId !== 'Todos') params.set('technicianId', filters.technicianId)
  params.set('page', filters.page.toString())
  return `/Ticket/search?${params.toString()}`
}

export type TicketQueryResult = {
  tickets: Ticket[]
  total: number
  pages: number
}

export async function getTicketQueryResult(filters: TicketFilters): Promise<TicketQueryResult> {
  const queryResult = await requestJson<TicketQueryResult>(buildTicketSearchPath(filters))
  return queryResult;
}

export async function getTechnicians() {
  return requestJson<{ id: number; name: string; icon: string, openTickets: number }[]>('/Technician')
}

export async function getMetrics(){
  return requestJson<{ highPriorityTickets: number; closedTickets: number, openTickets: number, totalTickets: number }>('/Ticket/metrics')
}

export async function createTicket(payload: TicketPayload) {
  return requestEmpty('/Ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function updateTicket(id: number, payload: TicketPayload) {
  return requestEmpty(`/Ticket/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function changeTicketStatus(id: number, status: StatusTicket) {
  return requestEmpty(`/Ticket/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}
