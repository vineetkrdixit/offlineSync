// model/schema.js
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 5,
    tables: [
        tableSchema({
            name: 'userdata',
            columns: [
                { name: 'username', type: 'string' },
                { name: 'createdAt', type: 'number' },
                { name: 'updatedAt', type: 'number' },
                { name: 'age', type: 'number' },
                { name: 'deleted', type: 'boolean' },
            ]
        }),
    ]
})