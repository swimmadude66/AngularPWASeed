
export interface DBInfo {
    insertId?: number;
    affectedRows?: number;
    changedRows?: number;
}

export type DBResponse<T> = DBInfo & T;
