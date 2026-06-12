import type { FormEvent } from 'react'
import type { Priority, StatusTicket } from '../types/ticket'
import type { TicketForm } from '../types/ticketForm'

type TicketFormComponentProps = {
  form: TicketForm
  onFormChange: (form: TicketForm) => void
  editingId: number | null
  isSaving: boolean
  workload: { id: number; name: string; icon: string; openTickets: number }[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

const prioridades: Priority[] = ['Baixa', 'Media', 'Alta']
const statusOptions: StatusTicket[] = ['Aberto', 'EmAndamento', 'Resolvido', 'Fechado']

export function TicketFormComponent({
  form,
  onFormChange,
  editingId,
  isSaving,
  workload,
  onSubmit,
  onCancel,
}: TicketFormComponentProps) {
  return (
    <form className="ticket-form" onSubmit={onSubmit}>
      <label>
        Título
        <input
          required
          value={form.title}
          onChange={(event) => onFormChange({ ...form, title: event.target.value })}
        />
      </label>
      <label>
        Solicitante
        <input
          required
          value={form.requester}
          onChange={(event) => onFormChange({ ...form, requester: event.target.value })}
        />
      </label>
      <label>
        Descrição
        <textarea
          required
          value={form.description}
          onChange={(event) => onFormChange({ ...form, description: event.target.value })}
          rows={4}
        />
      </label>

      <div className="form-grid">
        <label>
          Prioridade
          <select
            value={form.priority}
            onChange={(event) => onFormChange({ ...form, priority: event.target.value as Priority })}
          >
            {prioridades.map((prioridade) => (
              <option key={prioridade}>{prioridade}</option>
            ))}
          </select>
        </label>
        {editingId && (
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => onFormChange({ ...form, status: event.target.value as StatusTicket })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="check-line">
        <input
          checked={form.automaticAttribution}
          disabled={Boolean(editingId)}
          type="checkbox"
          onChange={(event) => onFormChange({ ...form, automaticAttribution: event.target.checked })}
        />
        Atribuir automaticamente ao responsável com menos chamados em aberto
      </label>

      <label>
        Responsável
        <select
          required={!form.automaticAttribution}
          disabled={form.automaticAttribution}
          value={form.technicianId}
          onChange={(event) => onFormChange({ ...form, technicianId: event.target.value })}
        >
          <option value="">Selecione</option>
          {workload.map((responsavel) => (
            <option key={responsavel.id} value={responsavel.id}>
              {responsavel.name} - {responsavel.openTickets} aberto(s)
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button className="primary-action" disabled={isSaving} type="submit">
          {isSaving ? 'Salvando' : editingId ? 'Salvar edição' : 'Cadastrar'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function formatStatus(status: StatusTicket) {
  return status === 'EmAndamento' ? 'Em andamento' : status
}
