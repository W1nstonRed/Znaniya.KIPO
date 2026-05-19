import { api } from '../client/client'
import type { Fetch } from '../client/types'
import type {
    ExternalGroupItem,
    ExternalSchedule,
    ExternalTeacherItem,
    FavoritesResponse,
    FavoriteGroup,
    FavoriteTeacher,
    FreeCabinetsResponse,
    TeacherScheduleResponse,
    AddFavoriteRequest,
} from './types'

export const scheduleApi = {
    // ── Списки (нужны для поиска и для resolveMySchedule) ──────────────

    getGroups: (fetch?: Fetch) => api.get<ExternalGroupItem[]>('/schedule/groups', { fetch }),

    getTeachers: (fetch?: Fetch) => api.get<ExternalTeacherItem[]>('/schedule/teachers', { fetch }),

    // ── Расписание по группе / преподавателю ───────────────────────────

    getGroupSchedule: (groupId: number, date: string, fetch?: Fetch) =>
        api.post<ExternalSchedule>('/schedule/group', { groupId, date }, { fetch }),

    getTeacherSchedule: (teacherId: number, date: string, fetch?: Fetch) =>
        api.post<TeacherScheduleResponse>('/schedule/teacher', { teacherId, date }, { fetch }),

    // ── Избранное ──────────────────────────────────────────────────────

    getFavorites: (fetch?: Fetch) => api.get<FavoritesResponse>('/schedule/favorites', { fetch }),

    addFavorite: (dto: AddFavoriteRequest, fetch?: Fetch) =>
        api.post<FavoriteGroup | FavoriteTeacher>('/schedule/favorites', dto, { fetch }),

    removeFavorite: (id: string, fetch?: Fetch) =>
        api.delete<{ deleted: number }>(`/schedule/favorites/${id}`, { fetch }),

    // ── Свободные кабинеты ─────────────────────────────────────────────

    getFreeCabinets: (date: string, lesson: number, building?: string, fetch?: Fetch) => {
        const params = new URLSearchParams({ date, lesson: String(lesson) })
        if (building) params.set('building', building)
        return api.get<FreeCabinetsResponse>(`/schedule/free-cabinets?${params}`, { fetch })
    },
}
