export type Ticket = {
  id: number
  title: string
  description: string
  requester: string
  priority: Priority
  status: StatusTicket
  technicianId: number
  technicianName: string
  issueDate: string
  closeDate?: string | null
}

export type Priority = 'Baixa' | 'Media' | 'Alta'
export type StatusTicket = 'Aberto' | 'EmAndamento' | 'Resolvido' | 'Fechado'
