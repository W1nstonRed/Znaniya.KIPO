import { NotebookPen, Server, CalendarDays } from '@lucide/svelte'
import type { Component } from 'svelte'

type FeatureItem = {
    id: number
    icon: Component
    title: string
    description?: string
}

export const FEATURE_ITEMS: FeatureItem[] = [
    {
        id: 1,
        icon: CalendarDays,
        title: 'Расписание занятий',
        description: 'Посмотреть пары, аудитории и изменения',
    },
    {
        id: 2,
        icon: Server,
        title: 'Хранение данных',
        description:
            'Вы можете оставить свои работы прямо на платформе и получить жоступ в любое время',
    },
    {
        id: 3,
        icon: NotebookPen,
        title: 'Просмотр журнала',
        description: 'Посмотреть оценки и темы которые проходили',
    },
]
