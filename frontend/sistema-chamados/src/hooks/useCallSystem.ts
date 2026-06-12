import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTicket, getTechnicians as getTechnicians, getTicketQueryResult, updateTicket, changeTicketStatus } from '../api/ticket'
import type { Ticket } from '../types/ticket'
import type { TicketFilters } from '../types/filters'
import type { TicketPayload } from '../types/ticketForm'

const ticketQueryKey = (filters: TicketFilters) => ['tickets', filters] as const
const techniciansQueryKey = ['technicians'] as const

export function useTickets(filters: TicketFilters) {
  return useQuery({
    queryKey: ticketQueryKey(filters),
    queryFn: () => getTicketQueryResult(filters),
    staleTime: 1000 * 60,
  })
}

export function useTechnicians() {
  return useQuery({
    queryKey: techniciansQueryKey,
    queryFn: getTechnicians,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTicket(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TicketPayload) => createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      if (onSuccess) onSuccess()
    },
  })
}

export function useUpdateTicket(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TicketPayload }) => updateTicket(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      if (onSuccess) onSuccess()
    },
  })
}

export function useChangeTicketStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Ticket['status'] }) => changeTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      if (onSuccess) onSuccess()
    },
  })
}
