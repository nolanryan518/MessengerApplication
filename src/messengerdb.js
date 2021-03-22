const { json } = require('body-parser');
const { SSL_OP_CIPHER_SERVER_PREFERENCE } = require('constants');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://valadezjrr1:9GhgEp38kVFU6Aln@bestmessengerdb.bmb6e.mongodb.net/BestMessengerDB?retryWrites=true&w=majority";
const mongodbclient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db = null;

mongodbclient.connect((err, connection) => {
    if (err) throw err;
    console.log("Connected to the MongoDB cluster!");
    db = connection.db();
})
const dbIsReady = () => {
    return db != null;
};
const getDb = () => {
    if (!dbIsReady())
        throw Error("No database connection");
    return db;
}
const checklogin = async (username, password) => {
    var users = getDb().collection("users");
    var user = await users.findOne({ username: username, password: password });
    if (user != null && user.username == username) {
        return true;
    }
    //your implementation
    return false
}

const addUser = (username, password, callback) => {
    var users = getDb().collection("users");
    users.findOne({ username: username }).then(user => {
        if (user && user.username == username) {
            callback("UserExist");
        } else {
            var newUser = { "username": username, "password": password }
            users.insertOne(newUser, (err, result) => {
                if (err) {
                    callback("Error");
                } else {
                    users.updateOne({ "username": username },
                        { $set: { "serverList": [] } },
                        {
                            upsert: false,
                            multi: true
                        })
                        users.updateOne(
                            { "username": username },
                            { $set: { "image": "image/ud2.jpeg" } })
                    callback("Success");
                }
            })
        }

    })
}
const changeImage = (username, imageSource) => {
    console.log(imageSource);
    var users = getDb().collection("users");
    users.findOne({ username: username }).then(user => {
        if (user && user.username == username) {
            users.updateOne(
                { "username": username },
                { $set: { "image": imageSource } });

        }
    })
}

const changeUser = (username, newUsername) => {
    var users = getDb().collection("users");
    users.findOne({ username: username }).then(user => {
        if (user && user.username == username) {
            users.updateOne(
                { "username": username },
                { $set: { "username": newUsername } });

        }
    })

}
const addServerToDatabase = (servername, owner, imageSource, serverID) => {
    getDb().createCollection(servername);
    var server = getDb().collection(servername);
    server.insertOne({ owner: owner });
    server.insertOne({ imageSource: imageSource });
    server.insertOne({ id: serverID });
    server.insertOne({ memberList: "memberList" });

    server.updateOne({ memberList: "memberList" },
        { $set: { "memberList": [] } },
        {
            upsert: false,
            multi: true
        })
    server.update({},
        { $push: { "memberList": owner } });
    var users = getDb().collection("users");
    users.findOne({ username: owner }).then(user => {
        if (user && user.username == owner) {
            users.updateOne(
                { "username": owner },
                { $addToSet: { "serverList": servername } });
        }
    })
}

const addMemberToServerDatabase = (servername, member) => {
    var server = getDb().collection(servername);
    server.update({},
        {
            $push: { "memberList": member }
        });
    var users = getDb().collection("users");
    users.findOne({ username: member }).then(user => {
        if (user && user.username == member) {
            users.updateOne(
                { "username": member },
                { $push: { "serverList": servername } }
            );
        }
    })
}
const getServerList = (username, callback) => {
    let servers = new Array();
    db.collection("users").find({ "username": username }, { 'fields': { '_id': 0, 'username': 0, 'password': 0, 'image': 0 } }).forEach(function (doc) {
        doc.serverList.forEach(function (x) {
            servers.push(JSON.stringify(x));
        });

        callback(servers.toString());
        //console.log(JSON.stringify(doc));
    });
}
const getServerID = (serverName, callback) => {
    db.collection(serverName).find({ "id": { $exists: true } }, { 'fields': { '_id': 0 } }).forEach(function (doc) {
        callback(JSON.stringify(doc).toString());
    });
}
const getImageSource = (serverName, callback) => {
    db.collection(serverName).find({ "imageSource": { $exists: true } }, { 'fields': { '_id': 0 } }).forEach(function (doc) {
        console.log(JSON.stringify(doc).toString());
        callback(JSON.stringify(doc).toString());
    });
}
const loadChatHistory = async (receiver, limits, serverID) => {
    var chat_history = await getDb().collection(serverID).find({ receiver: receiver }).sort({ timestamp: -1 }).limit(limits).toArray();
    var chat_history = await getDb().collection(serverID).find({ "receiver": { $exists: true } }).sort({ timestamp: -1 }).limit(limits).toArray();
    if (chat_history && chat_history.length > 0) return chat_history
}

const storeChat = (receiver,message,serverID) => {

    // let timestamp = Date.now();
    let chat = {receiver: receiver, message:message};
    getDb().collection(serverID).insertOne(chat,function(err,doc){
        if(err != null){
            console.log(err);
        }else{
            console.log("Debug: message is added:" + JSON.stringify(doc.ops));
        }
    })
}
module.exports = { checklogin, addUser, changeUser, changeImage, addServerToDatabase, addMemberToServerDatabase, getServerList, getServerID, getImageSource, loadChatHistory, storeChat};
