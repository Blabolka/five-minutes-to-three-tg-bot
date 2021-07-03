import { WeekDay } from '@enums/Subject'

export interface ISubjectAdd {
    user_id: string
    title: string
    week_day: WeekDay
    time: Date
    link: string | null
}
