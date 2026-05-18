import { CalendarDays, House, Server, Users } from '@lucide/svelte'

export type NavItem = {
    id: number
    href: string
    label: string
    icon: typeof House
    authOnly: boolean
}

export const NAV_ITEMS: NavItem[] = [
    { id: 1, href: '/', label: 'Главная', icon: House, authOnly: false },
    { id: 2, href: '/groups', label: 'Группы', icon: Users, authOnly: false },
    { id: 3, href: '/schedule', label: 'Расписание', icon: CalendarDays, authOnly: false },
    { id: 4, href: '/files', label: 'Файловый обменник', icon: Server, authOnly: true },
]
