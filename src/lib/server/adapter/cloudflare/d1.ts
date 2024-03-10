import {type D1Database, D1PreparedStatement} from "@cloudflare/workers-types";

let d1: D1Database | null = null;
export const setD1 = (db: D1Database | undefined) => {
    if (!db || d1) return
    d1 = db
    console.log('Cloudflare D1 connected!');
}
const sqlBuilder = (fn: (d: D1PreparedStatement) => unknown) =>
    <T>(raw: TemplateStringsArray, ...field: unknown[]) => {
        if (!d1) throw new Error('cloudflare D1 not configure.')
        const sql = raw.join('?')
        const p = d1.prepare(sql)
        if (field.length) return fn(p.bind(...field)) as Promise<T>
        return fn(p) as Promise<T>
    }

export const run = sqlBuilder((p: D1PreparedStatement) => {
    return p.run()
})
export const first = sqlBuilder((p: D1PreparedStatement) => {
    return p.first()
})
export const all = sqlBuilder((p: D1PreparedStatement) => {
    return p.all()
})
