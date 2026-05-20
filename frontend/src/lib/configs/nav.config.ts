import { Home, Calendar, FileText, Users, BookOpen, Cloud } from '@lucide/svelte'
import type { Component } from 'svelte'

export interface NavItem {
    id: number
    label: string
    href: string
    icon: Component
    authOnly: boolean
    section: 'main' | 'study'
}

export const NAV_ITEMS: NavItem[] = [
    { id: 1, label: 'Главная', href: '/', icon: Home, authOnly: false, section: 'main' },
    {
        id: 2,
        label: 'Расписание',
        href: '/schedule',
        icon: Calendar,
        authOnly: false,
        section: 'main',
    },
    {
        id: 3,
        label: 'Журналы',
        href: '/journals',
        icon: FileText,
        authOnly: false,
        section: 'main',
    },
    { id: 4, label: 'Группы', href: '/groups', icon: Users, authOnly: true, section: 'study' },
    { id: 5, label: 'Тесты', href: '/tests', icon: BookOpen, authOnly: true, section: 'study' },
    { id: 6, label: 'Хранилище', href: '/storage', icon: Cloud, authOnly: true, section: 'study' },
]

export const NAV_SECTIONS = [
    { key: 'main', label: 'Основное' },
    { key: 'study', label: 'Учёба' },
] as const
