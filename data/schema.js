// model/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'userdata',
            columns: [
                { name: 'username', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'is_adult', type: 'boolean', isOptional: true },
                { name: 'sync_status', type: 'string' }
            ]
        }),
    ]
})