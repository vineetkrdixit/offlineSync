// model/Post.js
import { Model } from '@nozbe/watermelondb'
import { field, readonly, date } from '@nozbe/watermelondb/decorators'

export default class userdata extends Model {
    static table = 'userdata'
    @field("username") username;
    @readonly @date("createdAt") createdAt;
    @date("updatedAt") createdAt;
    @field("age") age;
    @field("deleted") deleted;
}