import { WeekDay } from '@enums/Subject'

export interface ISubjectAdd {
    user_id: string
    week_day: WeekDay
    title: string
    time: Date
    link: string | null
}

export interface ISubjectInfo {
    title: string
    week_day: WeekDay
    time: Date
    link: string | null
}
