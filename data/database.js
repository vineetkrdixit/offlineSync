import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite"
import { mySchema } from "./schema"
import { Database } from "@nozbe/watermelondb"
import userdata from "./userdata"
const adapter = new SQLiteAdapter({
    schema: mySchema
})

export const database = new Database({
    adapter,
    modelClasses: [userdata],
    actionEnabled: true
})