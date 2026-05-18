import { CalendarDays, Server, Users, type House } from '@lucide/svelte'

export type NavItem = {
    id: number
    href: string
    label: string
    icon: typeof House
    authOnly: boolean
}

export const NAV_ITEMS: NavItem[] = [
    { id: 1, href: '/', label: 'Группы', icon: Users, authOnly: false },
    { id: 2, href: '/schedule', label: 'Расписание', icon: CalendarDays, authOnly: false },
    { id: 3, href: '/files', label: 'Файловый обменник', icon: Server, authOnly: true },
]
