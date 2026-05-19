// routes/schedule/+page.server.ts

import type { PageServerLoad } from './$types'
import { scheduleApi } from '$lib/api/schedule/client'
import { resolveMySchedule } from '$lib/api/schedule/resolve'
import { tryFetch } from '$lib/api/client/utils'

export const load: PageServerLoad = async ({ fetch, locals }) => {
    const user = locals.user ?? null
    const today = new Date().toISOString().split('T')[0]

    // Списки грузим всегда — нужны для поиска
    const [groupsResult, teachersResult] = await Promise.all([
        tryFetch(() => scheduleApi.getGroups(fetch)),
        tryFetch(() => scheduleApi.getTeachers(fetch)),
    ])

    const groups = groupsResult.ok ? groupsResult.data : []
    const teachers = teachersResult.ok ? teachersResult.data : []

    // Своё расписание + избранное — только для авторизованных
    const [mySchedule, favorites] = await Promise.all([
        user
            ? tryFetch(() => resolveMySchedule(user, today, groups, teachers, fetch))
            : Promise.resolve({ ok: true as const, data: null }),
        user
            ? tryFetch(() => scheduleApi.getFavorites(fetch))
            : Promise.resolve({ ok: true as const, data: { groups: [], teachers: [] } }),
    ])

    return {
        groups,
        teachers,
        mySchedule: mySchedule.ok ? mySchedule.data : null,
        favorites: favorites.ok ? favorites.data : { groups: [], teachers: [] },
        user,
        today,
    }
}
