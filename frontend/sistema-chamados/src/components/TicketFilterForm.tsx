import type { SubmitEvent } from 'react'
import type { Priority, StatusTicket } from '../types/ticket'
import type { Technician } from '../types/technician'
import type { TicketFilters } from '../types/filters'

type TicketFilterFormProps = {
  draftFilters: TicketFilters
  responsaveis: Technician[]
  onDraftFiltersChange: (draftFilters: TicketFilters) => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

export function TicketFilterForm({ draftFilters, responsaveis, onDraftFiltersChange, onSubmit }: TicketFilterFormProps) {
  return (
    <form className="filters" onSubmit={onSubmit}>
      <label>
        Buscar
        <input
          value={draftFilters.keyword}
          onChange={(event) => onDraftFiltersChange({ ...draftFilters, keyword: event.target.value })}
          placeholder="Título ou descrição"
        />
      </label>

      <label>
        Status
        <select
          value={draftFilters.status}
          onChange={(event) => onDraftFiltersChange({ ...draftFilters, status: event.target.value as 'Todos' | StatusTicket })}
        >
          <option value="Todos">Todos</option>
          <option value="Aberto">Aberto</option>
          <option value="EmAndamento">Em andamento</option>
          <option value="Resolvido">Resolvido</option>
          <option value="Fechado">Fechado</option>
        </select>
      </label>

      <label>
        Prioridade
        <select
          value={draftFilters.priority}
          onChange={(event) => onDraftFiltersChange({ ...draftFilters, priority: event.target.value as 'Todas' | Priority })}
        >
          <option>Todas</option>
          <option>Baixa</option>
          <option>Media</option>
          <option>Alta</option>
        </select>
      </label>

      <label>
        Responsável
        <select
          value={draftFilters.technicianId}
          onChange={(event) => onDraftFiltersChange({ ...draftFilters, technicianId: event.target.value })}
        >
          <option>Todos</option>
          {responsaveis.map((responsavel) => (
            <option key={responsavel.id} value={responsavel.id}>
              {responsavel.name}
            </option>
          ))}
        </select>
      </label>

      <button type="submit">Filtrar</button>
    </form>
  )
}
