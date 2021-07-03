import db from '@db'
import { ISubjectAdd } from '@interfaces/Subject'
import { QueryResult } from 'pg'

export async function createSubject(subject: ISubjectAdd): Promise<string> {
    const result: QueryResult = await db.query(
        `INSERT INTO subjects (user_id, title, link, week_day, time)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
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
