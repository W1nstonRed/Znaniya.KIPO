import type { Fetch } from '../client/types'
import { scheduleApi } from './client'
import type {
    ExternalSchedule,
    ExternalGroupItem,
    ExternalTeacherItem,
    TeacherScheduleResponse,
} from './types'

type UserProfile = {
    role: 'STUDENT' | 'TEACHER' | 'ADMIN'
    groupId?: string | null
    teacherId?: string | null
}

/**
 * Получает расписание авторизованного пользователя.
 *
 * Студент  → ищет externalGroup по groupId   → getGroupSchedule
 * Учитель  → ищет externalTeacher по teacherId → getTeacherSchedule
 * Остальные → null
 *
 * groups и teachers передаются снаружи, чтобы не делать лишние запросы
 * (обычно они уже загружены параллельно в load-функции).
 */
export async function resolveMySchedule(
    user: UserProfile,
    date: string,
    groups: ExternalGroupItem[],
    teachers: ExternalTeacherItem[],
    fetch?: Fetch,
): Promise<ExternalSchedule | TeacherScheduleResponse | null> {
    if (user.role === 'STUDENT' && user.groupId) {
        const external = groups.find(g => g.groupId === user.groupId)
        if (!external) return null
        return scheduleApi.getGroupSchedule(external.id, date, fetch)
    }

    if (user.role === 'TEACHER' && user.teacherId) {
        const external = teachers.find(t => t.teacherId === user.teacherId)
        if (!external) return null
        return scheduleApi.getTeacherSchedule(external.id, date, fetch)
    }

    return null
}

/** Проверяет, является ли ответ расписанием преподавателя */
export function isTeacherSchedule(
    schedule: ExternalSchedule | TeacherScheduleResponse,
): schedule is TeacherScheduleResponse {
    return 'schedules' in schedule
}
