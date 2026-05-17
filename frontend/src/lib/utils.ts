import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { UserRole } from './api/auth/types'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatRole(role: UserRole): string {
    const map: Record<UserRole, string> = {
        STUDENT: 'Студент',
        TEACHER: 'Преподаватель',
        ADMIN: 'Администратор',
    }
    return map[role] ?? role
}
