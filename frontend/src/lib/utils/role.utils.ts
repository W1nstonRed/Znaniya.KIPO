import type { UserRole } from '$lib/api/auth/types'

export function formatRole(role: UserRole): string {
    const map: Record<UserRole, string> = {
        STUDENT: 'Студент',
        TEACHER: 'Преподаватель',
        ADMIN: 'Администратор',
    }
    return map[role] ?? role
}
