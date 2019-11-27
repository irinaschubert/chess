import {MongoClient} from "mongodb";
let url = "mongodb://localhost:27017/";
let client;

/** Database
 *  @author Irina
 * */

'use strict';

export default class DB{
    async connectDB() {
        if (!client) client = await MongoClient.connect(url,{ useNewUrlParser: true, useUnifiedTopology: true });
        return {
            db: client.db(process.env.MONGO_DBNAME),
            client: client
        };
    }

    async checkUsernamePassword(name, pw) {
        const { db, client } = await this.connectDB();
        const collection = db.collection("users");
        try{
            const doc = await collection.findOne({name:name, pw:pw});
            return {name: doc.name};
        }catch (err) {
            console.log("No such user found.");
            return false;
        }
    }

    async checkUsername(name) {
        const { db, client } = await this.connectDB();
        const collection = db.collection("users");
        try{
            const doc = await collection.findOne({name:name});
            console.log("Found user.");
            return true;
        }catch (err) {
            console.log("No such user found.");
            return false;
        }
    }
}