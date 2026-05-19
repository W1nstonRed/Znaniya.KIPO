export type ExternalLesson = {
    id: string
    weekday: number
    lesson: number
    startTime: string
    endTime: string
    startTimeMin: number
    endTimeMin: number
    unionGroups: {
        id: string
        group: { id: number; name: string }
        subgroup: string | null
    }[]
    teachers: { id: number; fio: string }[]
    subject: { id: number; name: string } | null
    cabinet: {
        id: number
        name: string
        shortName: string | null
        ignore: boolean
    } | null
    typeLesson: string | null
}

export type ExternalSchedule = {
    startDate: string
    endDate: string
    group?: { id: number; name: string }
    teacher?: { id: number; fio: string }
    bells: {
        weekday: number
        lesson: number
        startTime: string
        endTime: string
        startTimeMin: number
        endTimeMin: number
    }[]
    lessons: ExternalLesson[]
}

export type ExternalGroupItem = {
    id: number
    name: string
    normalizedName: string
    groupId: string | null
    group: {
        id: string
        name: string
        specialty: { id: string; name: string; iconName: string } | null
    } | null
}

export type ExternalTeacherItem = {
    id: number
    fio: string
    normalizedFio: string
    teacherId: string | null
    teacher: { id: string; fullName: string } | null
}

export type TeacherScheduleResponse = {
    teacher: { id: string; fullName: string } | null
    externalTeacherIds: number[]
    schedules: {
        externalTeacherId: number
        fio: string
        schedule: ExternalSchedule
    }[]
}

export type FavoriteGroup = {
    id: string
    externalGroupId: number
    externalGroup: ExternalGroupItem
    createdAt: string
}

export type FavoriteTeacher = {
    id: string
    externalTeacherId: number
    externalTeacher: ExternalTeacherItem
    createdAt: string
}

export type FavoritesResponse = {
    groups: FavoriteGroup[]
    teachers: FavoriteTeacher[]
}

export type FreeCabinetsResponse = {
    free: Cabinet[]
    busy: Cabinet[]
}

export type Cabinet = {
    id: string
    name: string
    shortName: string | null
    building: string | null
    floor: number | null
}

export type AddFavoriteRequest =
    | { externalGroupId: number; externalTeacherId?: never }
    | { externalTeacherId: number; externalGroupId?: never }
