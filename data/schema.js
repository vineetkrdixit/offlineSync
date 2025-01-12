// model/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 4,
    tables: [
        tableSchema({
            name: 'userdata',
            columns: [
                { name: 'username', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'age', type: 'number' },
                { name: 'deleted', type: 'boolean' },
            ]
        }),
    ]
})