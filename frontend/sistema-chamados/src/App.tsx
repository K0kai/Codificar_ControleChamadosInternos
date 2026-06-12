import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { Metric } from './components/Metric'
import { Modal } from './components/Modal'
import { TicketFormComponent } from './components/TicketFormComponent'
import { useChangeTicketStatus, useCreateTicket, useTechnicians, useTickets, useUpdateTicket } from './hooks/useCallSystem'
import type { Priority, StatusTicket, Ticket } from './types/ticket'
import type { TicketFilters } from './types/filters'
import type { TicketForm, TicketPayload } from './types/ticketForm'
import { getMetrics } from './api/ticket'
import PageNavigator from './components/PageNavigator'

const priorities: Priority[] = ['Baixa', 'Media', 'Alta']
const statusOptions: StatusTicket[] = ['Aberto', 'EmAndamento', 'Resolvido', 'Fechado']

const defaultFilters: TicketFilters = {
  keyword: '',
  status: 'Todos',
  priority: 'Todas',
  technicianId: 'Todos',
  page: 1,
}

const emptyForm: TicketForm = {
  title: '',
  description: '',
  requester: '',
  priority: 'Media',
  status: 'Aberto',
  technicianId: '',
  automaticAttribution: true,
}

function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<TicketForm>(emptyForm)
  const [filters, setFilters] = useState<TicketFilters>(defaultFilters)
  const [draftFilters, setDraftFilters] = useState<TicketFilters>(defaultFilters)
  const [message, setMessage] = useState('')

  const ticketsQuery = useTickets(filters)
  const techniciansQuery = useTechnicians()

  const createTicketMutation = useCreateTicket(() => {
    setMessage('Chamado cadastrado com sucesso.')
    closeForm();
  })

  const updateTicketMutation = useUpdateTicket(() => {
    setMessage('Chamado atualizado com sucesso.')
    closeForm();
  })

  const changeTicketStatusMutation = useChangeTicketStatus(() => {
    setMessage('Status atualizado com sucesso.')
  })

  const tickets = ticketsQuery.data?.tickets ?? []
  const pages = ticketsQuery.data?.pages ?? 0
  const technicians = techniciansQuery.data ?? []
  const isLoading = ticketsQuery.isLoading || techniciansQuery.isLoading
  const isSaving = createTicketMutation.isPending || updateTicketMutation.isPending || changeTicketStatusMutation.isPending
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0]

  const workload = useMemo(() => {
    return technicians.map((technician) => ({
      ...technician,
    }))
  }, [technicians])

  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    highPriorityTickets: 0,
    closedTickets: 0,
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      const metrics = await getMetrics()
      setStats(metrics)
    }

    fetchMetrics()
  }, [tickets])

  useEffect(() => {
    if (!selectedId && tickets[0]) {
      setSelectedId(tickets[0].id)
    }
  }, [selectedId, tickets])

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilters(draftFilters)
    setMessage('')
  }

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  function closeForm(){
    setIsModalOpen(false)
  }

  function startEdit(ticket: Ticket) {
    setEditingId(ticket.id)
    setSelectedId(ticket.id)
    setForm({
      title: ticket.title,
      description: ticket.description,
      requester: ticket.requester,
      priority: ticket.priority,
      status: ticket.status,
      technicianId: String(ticket.technicianId),
      automaticAttribution: false,
    })
    setIsModalOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const payload: TicketPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      requester: form.requester.trim(),
      priority: form.priority,
      status: form.status,
      technicianId: form.automaticAttribution ? 0 : Number(form.technicianId),
    }

    if (editingId) {
      updateTicketMutation.mutate(
        { id: editingId, payload },
        {
          onError(error) {
            setMessage(error instanceof Error && error.message ? error.message : 'Não foi possível salvar o chamado.')
          },
        },
      )
      return
    }

    createTicketMutation.mutate(payload, {
      onError(error) {
        setMessage(error instanceof Error && error.message ? error.message : 'Não foi possível salvar o chamado.')
        console.error(error)
      },
    })
  }

  function changeStatus(ticket: Ticket, status: StatusTicket) {
    setMessage('')

    changeTicketStatusMutation.mutate(
      { id: ticket.id, status },
      {
        onError(error) {
          setMessage(error instanceof Error && error.message ? error.message : 'Não foi possível alterar o status.')
        },
      },
    )
  }

  return (
    <main className="app-shell">
      <section className="summary-band">
        <div>
          <p className="eyebrow">Controle de chamados internos</p>
          <h1>Atendimento com fila visível e distribuição equilibrada</h1>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={() => {
            startCreate()
          }}
        >
          Novo chamado
        </button>
      </section>

      <section className="metrics-grid" aria-label="Indicadores">
        <Metric label="Total" value={stats.totalTickets} />
        <Metric label="Em aberto" value={stats.openTickets} />
        <Metric label="Alta prioridade" value={stats.highPriorityTickets} />
        <Metric label="Concluídos" value={stats.closedTickets} />
      </section>

      {message && <p className="feedback">{message}</p>}

      <section className="workbench">
        <div className="list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Listagem e acompanhamento</p>
              <h2>Chamados</h2>
            </div>
           {isLoading && <span>Carregando</span>}
          </div>

          <form className="filters" onSubmit={handleFilterSubmit}>
            <label>
              Buscar
              <input
                value={draftFilters.keyword}
                onChange={(event) => setDraftFilters({ ...draftFilters, keyword: event.target.value })}
                placeholder="Título ou descrição"
              />
            </label>
            <label>
              Status
              <select
                value={draftFilters.status}
                onChange={(event) => setDraftFilters({ ...draftFilters, status: event.target.value as 'Todos' | StatusTicket })}
              >
                <option value="Todos">Todos</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Prioridade
              <select
                value={draftFilters.priority}
                onChange={(event) => setDraftFilters({ ...draftFilters, priority: event.target.value as 'Todas' | Priority })}
              >
                <option>Todas</option>
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </label>
            <label>
              Responsável
              <select
                value={draftFilters.technicianId}
                onChange={(event) => setDraftFilters({ ...draftFilters, technicianId: event.target.value })}
              >
                <option>Todos</option>
                {technicians.map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Filtrar</button>
          </form>

          <div className="ticket-table">
            {tickets.map((ticket) => (
              <button
                className={`ticket-row ${selectedTicket?.id === ticket.id ? 'is-selected' : ''}`}
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
              >
                <span>
                  <strong>{ticket.title}</strong>
                  <small>{ticket.requester}</small>
                </span>
                <span className={`pill priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                <span className={`pill status-${ticket.status.toLowerCase()}`}>{formatStatus(ticket.status)}</span>
                <span>{ticket.technicianName}</span>
                <time>{formatDate(ticket.issueDate)}</time>
              </button>
            ))}
            {!isLoading && tickets.length === 0 && (
              <p className="empty-state">Nenhum chamado encontrado para os filtros atuais.</p>
            )}
          </div>
          <PageNavigator pages={pages} currentPage={filters.page} onPageChange={(page) => { setFilters({ ...filters, page }); console.log(page); }} />
        </div>
        
        

        {selectedTicket && (
          <section className="details">
            <p className="eyebrow">Visualização</p>
            <div className="panel-heading">
              <div>
                <h2>Chamado #{selectedTicket.id}</h2>
              </div>
              <button type="button" onClick={() => startEdit(selectedTicket)}>
                Editar
              </button>
            </div>
            <h3>{selectedTicket.title}</h3>
            <p>{selectedTicket.description}</p>
            <dl>
              <div>
                <dt>Solicitante</dt>
                <dd>{selectedTicket.requester}</dd>
              </div>
              <div>
                <dt>Responsável</dt>
                <dd>{selectedTicket.technicianName}</dd>
              </div>
              <div>
                <dt>Abertura</dt>
                <dd>{formatDateTime(selectedTicket.issueDate)}</dd>
              </div>
              <div>
                <dt>Fechamento</dt>
                <dd>{selectedTicket.closeDate ? formatDateTime(selectedTicket.closeDate) : 'Ainda não concluído'}</dd>
              </div>
            </dl>
            <div className="status-actions">
              {statusOptions.map((status) => (
                <button
                  disabled={selectedTicket.status === status}
                  key={status}
                  type="button"
                  onClick={() => changeStatus(selectedTicket, status)}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={closeForm}
        title={editingId ? `Editando #${editingId}` : 'Novo chamado'}
      >
        <div style={{ padding: '20px' }}>
          <TicketFormComponent
            form={form}
            onFormChange={setForm}
            editingId={editingId}
            isSaving={isSaving}
            workload={workload}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </div>
      </Modal>
    </main>
  )
}

function formatStatus(status: StatusTicket) {
  return status === 'EmAndamento' ? 'Em andamento' : status
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default App
