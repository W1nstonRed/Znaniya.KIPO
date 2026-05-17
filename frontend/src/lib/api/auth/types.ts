export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type CurrentUser = {
    id: string
    username: string
    fullName: string | null
    role: UserRole
    isAuthenticated: true
    groupId?: string
    studentId?: string
    teacherId?: string
}

export type AuthResponse = CurrentUser & {
    accessToken: string
    refreshToken: string
}

export type MeResponse = {
    user: CurrentUser | null
}

export type LoginRequest = {
    username: string
    password: string
}

export type RegisterRequest = {
    username: string
    password: string
    role: 'STUDENT' | 'TEACHER'
    fullName?: string
    groupId?: string
    studentId?: string
    teacherId?: string
}
