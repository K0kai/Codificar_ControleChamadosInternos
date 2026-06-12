import { queryOptions } from "@tanstack/react-query";
import type { Ticket } from "../types/ticket";

export function createTicketQueryOptions(urlSearchParams: URLSearchParams) {
    return queryOptions({
        queryKey: ["tickets", urlSearchParams.toString()],
        queryFn: () => fetchTickets(),
    })

    async function fetchTickets() {
        const response = await fetch(`http://localhost:5077/api/tickets?${urlSearchParams.toString()}`)
        if (!response.ok) {
            throw new Error("Failed to fetch tickets")
        }
        return response.json() as Promise<Ticket[]>
    }
}