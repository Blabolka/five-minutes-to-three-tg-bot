import db from '@db'
import { ISubjectAdd, ISubjectInfo } from '@interfaces/Subject'
import { QueryResult } from 'pg'

export async function createSubject(subject: ISubjectAdd): Promise<string> {
    const result: QueryResult = await db.query(
        `INSERT INTO subjects (user_id, title, link, week_day, time)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [subject.user_id, subject.title, subject.link, subject.week_day, subject.time],
    )
    return result.rows[0].id
}

export async function subjectExistsOnTime(subject: ISubjectAdd): Promise<boolean> {
    const exists: QueryResult = await db.query(
        `SELECT *
         FROM subjects
         WHERE user_id = $1
           AND time = $2
           AND week_day = $3`,
        [subject.user_id, subject.time, subject.week_day],
    )
    return exists.rowCount > 0
}

export async function findAllSubjectsByUserId(userId: string): Promise<ISubjectInfo[]> {
    const result: QueryResult = await db.query(
        `SELECT title, week_day, time, link
         FROM subjects
         WHERE user_id = $1`,
        [userId],
    )
    const subjects: ISubjectInfo[] = []
    for (const row of result.rows) {
        subjects.push({
            title: row.title,
            week_day: row.week_day,
            time: new Date(row.time),
            link: row.link ? row.link : null,
        })
    }

    return subjects
}
