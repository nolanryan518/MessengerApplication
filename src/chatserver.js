var http = require('http')
var app = require('express')()
var path = require('path');
const express = require('express');

var server = http.createServer(app)
const port = process.env.PORT || 8080
server.listen(port);
console.log(`ChatServer is listening at port ${port}`)
app.get('/', (request, response) => {
	response.sendFile(__dirname + '/index.html')
});
app.use("/image", express.static('image'));
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const fs = require('fs');
var io = require('socket.io')();
var socketio = io.listen(server);
console.log(`Socket.IO is listening at port:  ${port}`);
let userList = new Array();
let serverList = new Map();
let IDs = new Map();
let disconnectUsers = new Array();
var imgNumber = 0;
var msgID=0;
//Deals with user uploaded files to store in database
const multer = require('multer');
var storage = multer.diskStorage({
	destination: function (reg, file, callback) {
		var dir = "./image";
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		callback(null, dir);
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + imgNumber + ".png");
	}
});
var upload = multer({ storage: storage }).array('image', 1);

app.post("/upload", (req, res, next) => {

	upload(req, res, function (err) {
		// console.log(req.body.username);
		if (err) {
			//return res.send("x");
		}
		res.end("File Uploaded");
	});
});

socketio.on('connection', function (socketclient) {
	console.log("A new Socket.io cleint is connected, ID= " + socketclient.id);
	socketclient.on("login", async ({
		username, password
	}) => {
		var checklogin = await DataLayer.checklogin(username, password)
		socketclient.emit("FailedLogin", checklogin);
		if (checklogin) {
			if (DataLayer.checklogin(username, password)) {
				socketclient.authenticated = true;
				socketclient.emit("authenticated");
				socketclient.username = username;
				var welcomemessage = username + " has joined the chat system!";
				console.log(welcomemessage);
				socketio.sockets.emit("welcome", welcomemessage);
				//ON REGISTERED USER CONNECT	
				let pos = findUser(userList, socketclient.username);
				var chat_history = await messengerdb.loadChatHistory(socketclient.username, 100, "public_chat")
				if (chat_history && chat_history.length > 0) {
					chat_history = chat_history.reverse()
						 socketclient.emit("chat_history", { chat_history: chat_history, div: "messages" })
				}
				if (pos != -1) {
					//user is already in server
					//simply change the User's new client id in its user class
					let theUser = userList[pos];
					theUser.id = socketclient.id;
					socketio.sockets.to(socketclient.id).emit("showprofile", { username: socketclient.username, theImage: theUser.profileImage });
					//retrieve list of server names and IDS from database
					DataLayer.getServerList(socketclient.username, (get_result) => {
						var theServers = processString(get_result);
						if (theServers.length != 0) {
							for (var i = 0; i < theServers.length; i++) {
								if (i == 0) {
									socketio.sockets.to(socketclient.id).emit("addserver", { theName: "Public Chat", theID: 0, imageSource: 0 });
								}
								DataLayer.getServerID(theServers[i], (result) => {
									var theID = parseInt(processID(result));
									let theServer = serverList.get(theID);
									//create all server buttons for reconnected user
									if (theServer.attribute.localeCompare("direct") == 0) {
										//if the server is a direct chat
										//find direct user
										var pos = 0;
										for (var i = 0; i < theServer.serverMembers.length; i++) {
											if (theServer.serverMembers[i].localeCompare(socketclient.username) != 0) {
												pos = i;
											}
										}
										let member = theServer.serverMembers[pos];
										let memberClass = userList[findUser(userList, member)];
										socketio.sockets.to(socketclient.id).emit("makeDirectChat", { username: member, profileImage: 0, serverID: theID });
									}
									if (theServer.attribute.localeCompare("ndirect") == 0) {
										//create a "normal" server
										socketio.sockets.to(socketclient.id).emit("addserver", { theName: theServer.name, theID: theID, imageSource: 0 });
									}
								});
							}
						}
						if (theServers.length == 0) {
							socketio.sockets.to(socketclient.id).emit("addserver", { theName: "Public Chat", theID: 0, imageSource: 0 });
						}
						// socketio.sockets.to(socketclient.id).emit("updateUser", { username: socketclient.username, imgSource: imageSource });
					});
				}
				if (pos == -1) {
					//user is not in user list, add them
					userList.push(new User(socketclient.id, socketclient.username, 0, 0, "image/ud2.jpeg", 0, 0));
					socketio.sockets.to(socketclient.id).emit("addserver", { theName: "Public Chat", theID: 0, imageSource: 0 });
					socketio.sockets.to(socketclient.id).emit("showprofile", { username: socketclient.username, image: "image/ud2.jpeg" });
				}
				// socketio.sockets.to(socketclient.id).emit("updateUser", { username: socketclient.username, imgSource: imageSource });
				/*
				Problem: users with space in name causes profile picture not to print?!?
				*/
				var count = 0;
				for (var i in userList) {
					socketio.sockets.emit("userlist", {
						username: userList[i].username,
						count: count,
						div: "userList",
						imageSource: userList[i].profileImage
					});
					count++;
				}
			}
		}

	});
	socketclient.on("register", (username, password) => {
		DataLayer.addUser(username, password, (result) => {
			socketclient.emit("registration", result)
		});
	});

	socketclient.on("changeSettings", ({ username, imgSource }) => {
		if (imgSource != "") {
			// var imageSrc = "image/image-" + (imgNumber + 1) + ".png";
			// imgNumber++;
		}
		let theUser = userList[findUser(userList, socketclient.username)];
		if (imgSource != "") {
			//changeImage(socketclient.username, imgSource); -uncomment when testing database
			theUser.profileImage = imgSource;
		}

		if (username != 0) {
			changeUser(socketclient.username, username);
			theUser.username = username;
			socketclient.username = username;
		}
		printUserList(0, "userList");
		//previously theUser.profileImage
		socketio.sockets.to(socketclient.id).emit("updateUser", { username: theUser.username, imgSource: imgSource });
		socketio.sockets.emit("updatechats", { username: theUser.username, imageSource: imgSource })


	});
	socketclient.on("getusersforsearch", function () {
		let theUser=userList[findUser(userList,socketclient.username)];
		for (var i = 0; i < userList.length; i++) {
			let member=userList[i];
			let server=serverList.get(theUser.activeServer);
			let members=server.serverMembers;
			let pos=findMember(members, member.username);
			if(userList[i].username.localeCompare(socketclient.username)!=0 && pos==-1){
				socketio.sockets.emit(socketclient.id).emit("showusersearch", ({ username: userList[i].username, imageSource: userList[i].profileImage, count: i }));
			}
		}
	});
	socketclient.on("getprofileinformation", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		let selectedUser = theUser.selectedUser;
		socketio.sockets.to(socketclient.id).emit("profileinfo", ({ username: selectedUser.username, imageSource: selectedUser.profileImage }));
	});
	socketclient.on("getmutualservers", function () {
		let common = new Array();
		let theUser = userList[findUser(userList, socketclient.username)];
		let selectedUser = theUser.selectedUser;
		if (theUser.username.localeCompare(selectedUser.username) != 0) {


			for (var i = 0; i < theUser.userServerList.length; i++) {
				let server = theUser.userServerList[i];
				let contains = containsServer(selectedUser.userServerList, server.name);
				if (contains != -1) {
					common.push(server);
				}
			}
			if (common.length == 0) {
				socketio.sockets.to(socketclient.id).emit("nocommon");
			}
			if (common.length != 0) {


				for (var i = 0; i < common.length; i++) {
					socketio.sockets.to(socketclient.id).emit("displaymutual", ({ serverName: common[i].name, imageSource: common[i].image, count: i }));
				}
			}
		}
	});
	socketclient.on('disconnect', function () {
		console.log(socketclient.username + " is disconnected");
		var disc = socketclient.username + " has disconnected";
		socketio.sockets.emit("dc", disc);
		// disconnectUser();
	});
	socketclient.on("userdisconnected", function () {
		theUser = userList[findUser(userList, socketclient.username)];
		theUser.dc = 1;
		disconnectUsers.push(theUser);
		disconnectUser();
	});
	function disconnectUser() {
		var disUser = socketclient.username;
		var pos;
		if (disUser != undefined) {
			for (var i = 0; i < userList.length; i++) {
				var n = disUser.localeCompare(userList[i].username)
				if (n == 0) {
					pos = i;
					break;
				}
			}
			userList.splice(pos, 1);
			var count = 0;
			for (var i in userList) {
				socketio.sockets.emit("userlist", {
					username: userList[i].username,
					count: count,
					div: "userList"
				});
				count++;
			}
		}
	}
	socketclient.on("chat", (message) => {
		var date = Date(Date.now()); 
		a = date.toString() 
		//25
		var theDate=a.substring(0, 25);
	   var chatmessage =theDate + "|" + " " + message;
	   console.log(chatmessage);
	   msgID++;
		//pull the active server of the current socketclient and emit to this server
		let theUser = userList[findUser(userList, socketclient.username)];
		let theServer = serverList.get(theUser.activeServer);
		console.log("the active server" + theUser.activeServer);
		//if the active server isn't public, then only transmit to private server
		if (theServer != undefined && theServer.serverID != 0) {
			for (var i = 0; i < theServer.memberSockets.length; i++) {
				//the active server of curernt user in memberSockets
                
                messengerdb.storeChat(socketclient.username,message,theServer.name)
				let member = userList[findUser(userList, theServer.serverMembers[i])];
				let memberActiveServer = member.activeServer;
				//only emit this message if user's active server is this

				//check to see if user is blocked
				let blockedUsers = member.blockedUsers;
				let blocked = findMember(blockedUsers, theUser.username);
				if (memberActiveServer == theServer.serverID && blocked == -1) {

					socketio.sockets.to(member.id).emit("chat", {
						chatmessage: chatmessage,
						div: "privatechat",
						profileImage: theUser.profileImage,
						username: theUser.username,
						msgID:msgID

					});
				}
			}
			theServer.addMessage(chatmessage);
		}
		//just public chat
		if (theServer == undefined) {
			messengerdb.storeChat(socketclient.username,chatmessage,"public_chat")
			for (var i = 0; i < userList.length; i++) {
				//the active server of curernt user in memberSockets
				let member = userList[i];
				//only emit this message if user's active server is this

				//check to see if user is blocked
				let blockedUsers = member.blockedUsers;
				let blocked = findMember(blockedUsers, theUser.username);
				if (blocked == -1) {
					socketio.sockets.to(userList[i].id).emit("chat", {
						chatmessage: chatmessage,
						div: "messages",
						profileImage: theUser.profileImage,
						username: socketclient.username,
						msgID:JSON.stringify(msgID)

					});
				}
				if (blocked != -1) {
					socketio.sockets.to(userList[i].id).emit("chat", {
						chatmessage: "Message from blocked user",
						div: "messages",
						profileImage:"image/redX.png",
						username:socketclient.username,
						msgID:msgID

					});
				}
			}
		}
	});
	socketclient.on("<TYPE>", function () {
		var msg = socketclient.username + " is typing";
		console.log(msg);
		socketio.sockets.emit("<TYPING>", socketclient.username);
	});
	socketclient.on("donetyping", (doneTyping) => {
		console.log(doneTyping);
		socketio.sockets.emit("done", (doneTyping))
	});
	socketclient.on("kickuser", (reason) => {
		let theUser = userList[findUser(userList, socketclient.username)];
		let selectedUser = theUser.selectedUser;
		let theServer = serverList.get(theUser.activeServer);
		let serverMembers = theServer.serverMembers;
		let pos = findMember(serverMembers, selectedUser.username);
		serverMembers.splice(pos, 1);
		var divCount = 0;
        socketio.sockets.emit("userkicked", { theReason: reason, serverName: theServer.name, username: theUser.username });
        socketio.sockets.to(selectedUser.id).emit("removebutton", theUser.activeServer);
		for (var i = 0; i < serverMembers.length; i++) {
			let member = serverMembers[i];
			let theMember = userList[findUser(userList, member)];
			for (var j = 0; j < theServer.memberSockets.length; j++) {
				socketio.sockets.to(theServer.memberSockets[j]).emit("userlist", {
					username: member,
					count: divCount,
					div: "userList",
					imageSource: theMember.profileImage
				});
			}
			divCount++;
		}
		/*
		TODO: remove user from server database
		*/
	});
	socketclient.on("getuserlist", (username) => {
		for (var i = 0; i < userList.length; i++) {
			//userInvite.push(new Button());
			if (username.localeCompare(userList[i].username) != 0) {
				socketio.sockets.to(socketclient.id).emit("returnuser", {
					user: userList[i].username,
					count: i
				})
			}
		}
	});
	socketclient.on("getinviteServers", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		let theServerList = theUser.userServerList;
		let selectedUser = theUser.selectedUser;


		if (theServerList.length > 0) {
			for (var i = 0; i < theServerList.length; i++) {
				let theServer = theServerList[i];
				let serverMembers = theServer.serverMembers;
				let userIn = findMember(serverMembers, selectedUser.username);
				if (userIn != -1 && theServer.shown == 1) {
					socketio.sockets.to(socketclient.id).emit("removeserver", theServer.name);
				} //only display servers invite option for servers selected user insn't apart of (avoids duplicate invites)
				if (theServer.shown == 1) {
				}
				if (theServer.attribute.localeCompare("direct") != 0 && theServer.shown == 0)
					socketio.sockets.to(socketclient.id).emit("displayinviteServer", { theID: theServer.serverID,serverName: theServer.name, serverImage: theServer.image });
				theServer.shown = 1;
			}
		}
	});
	socketclient.on("getservernumber", function () {
		socketio.sockets.to(socketclient.id).emit("servernumber", 0);
	});
	socketclient.on("setuser", (id) => {
		let theUser = userList[findUser(userList, socketclient.username)];
		let selected = userList[findUser(userList, id)];
		//if selected user is =socketclient.username 
		theUser.selectedUser = selected;
		/*hide necessary settings
		i.e we don't want non-owners to be able to kick members
		or we don't want regular profile menu to appear when clicking own name
		*/
		let blockedList = theUser.blockedUsers;
		let blocked = findMember(blockedList, selected.username);
		if (blocked != -1) {
			socketio.emit("blocked", 0);
		}
		if (blocked == -1) {
			socketio.emit("blocked", 1);
		}
		if (theUser.username.localeCompare(selected.username) == 0) {
			//hide buttons: message user, invite to server, block, kick
			socketio.sockets.to(socketclient.id).emit("userself");
		}
		if (theUser.username.localeCompare(selected.username) != 0) {
			socketio.sockets.to(socketclient.id).emit("reshowoptions");
		}
		//if user is not owner of server, cannot kick
		let theactiveServer = serverList.get(theUser.activeServer);
		if (theactiveServer != undefined) {

			if (theactiveServer.owner.localeCompare(theUser.username) != 0) {
				socketio.sockets.to(socketclient.id).emit("kicktoggle", 0);
			}
			if (theactiveServer.owner.localeCompare(theUser.username) == 0 && theUser.username.localeCompare(selected.username) != 0) {
				socketio.sockets.to(socketclient.id).emit("kicktoggle", 1);
			}
		}
		if (theactiveServer == undefined) {
			socketio.sockets.to(socketclient.id).emit("kicktoggle", 0);
		}

	})
	socketclient.on("sendInvite", (theServer) => {
		let theUser = userList[findUser(userList, socketclient.username)];
		let theTarget = theUser.selectedUser;
		var theID;
		serverList.forEach((key) => {
			if (key.name.localeCompare(theServer) == 0) {
				theID = key.serverID;
			}
		});
		//only send invite to target user if they don't already have one from user
		var invite = theID + "invitation" + socketclient.username;
		console.log(invite);
		let invites = theTarget.activeInvitations;
		if (invites.length == 0 || !isInvited(invites, invite)) {
			theTarget.addInvitation(invite);
			socketio.sockets.to(theTarget.id).emit("showInvite", { username: theUser.username, theImage: theUser.profileImage, theID: theID });
		}

	});
	socketclient.on("sendinvite", (username) => {
		let theUser = userList[findUser(userList, socketclient.username)];
		var targetUser=username.replace('search', '');
		let theTarget=userList[findUser(userList, targetUser)];
		let theID=theUser.activeServer;
		console.log(theID);
		console.log(targetUser);
		var invite = theID + "invitation" + socketclient.username;
		// console.log(invite);
		let invites = theTarget.activeInvitations;
		if (invites.length == 0 || !isInvited(invites, invite)) {
			theTarget.addInvitation(invite);
			socketio.sockets.to(theTarget.id).emit("showInvite", { username: theUser.username, theImage: theUser.profileImage, theID: theID });
		}

	});
	socketclient.on("createServer", ({ username, theServerName, imageSrc }) => {

		//to avoid conflicts with database, check to see if server is already made
		var theID = 0;
		serverList.forEach((key) => {
			if (key.name.localeCompare(theServerName) == 0) {
				theID = -2;
			}
		});
		if (theID != -2) {
			var imageSource = "image/image-" + (imgNumber + 1) + ".png";
			imgNumber++;
			//var imageSource="image/image-"+imgNumber+".png";
			//console.log(imageSource);
			console.log("imageSource " + imageSource);
			var newServerID;
			if (serverList.size == 0) {
				newServerID = 1;
			} else {
				//need to test to make sure this works
				var count;
				while (true) {
					newServerID = getRandomInt(100);
					if (serverList.get(newServerID) == undefined) {
						break;
					}
				}
			}
			//update current server of owner to new server
			var ownerPOS = findUser(userList, username);
			userList[ownerPOS].activeServer = newServerID;

			let newServer = new Server(newServerID, username, theServerName, imageSrc, "ndirect", 0);
			newServer.addMember(username); //add owner to list of current members in server
			newServer.addMemberSocket(userList[ownerPOS].id);
			userList[ownerPOS].addServer(newServer);
			serverList.set(newServerID, newServer); //set serverList hashmap, key is Owner's name, value is reference to server object
			//activeServer.push(newServer);
			addServerToDatabase(theServerName, username, imageSrc, newServerID);
			//console.log(imageSrc);
			// storeImage(imageSrc, theServerName);
			socketio.sockets.to(userList[ownerPOS].id).emit("addserver", { theName: theServerName, theID: newServerID, imageSource: imageSrc });
		}
		if (theID == -2) {
			socketio.sockets.to(socketclient.id).emit("createserverfail");
		}
	});
	socketclient.on("getSelectedUser", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		socketio.sockets.to(theUser.id).emit("returnSelectedUser", theUser.selectedUser.username);

	});
	socketclient.on("getselected", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		socketio.sockets.to(theUser.id).emit("returnForBlock", theUser.selectedUser.username);
	});
	socketclient.on("blockuser", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		let selectedUser = theUser.selectedUser;
		theUser.addBlockedUser(selectedUser.username);
	});
	socketclient.on("unblockuser", function () {
		console.log("unblock");
		let theUser = userList[findUser(userList, socketclient.username)];
		let selectedUser = theUser.selectedUser;
		let blockedUsers = theUser.blockedUsers;
		let pos = findMember(blockedUsers, selectedUser.username);
		blockedUsers.splice(pos, 1);
	});
	socketclient.on("createDirectMessage", (username) => {
		/*
		IMPORTANT: need to check if a DM is already created between two users
		*/

		let theUser = userList[findUser(userList, socketclient.username)];
		//check to see if there's already a direct message between the two
		let theChats = theUser.directMessages;
		let directUser = userList[findUser(userList, username)];
		let directUserChats = directUser.directMessages;
		let blockedUsers = directUser.blockedUsers;
		let blocked = findMember(blockedUsers, theUser.username);
		if (blocked == -1) {

			var exists = 0;
			var existsDirect = 0;
			if (theChats.length != 0) {
				exists = findMember(theChats, username);

			}
			if (directUserChats.length != 0) {
				existsDirect = findMember(directUserChats, socketclient.username);
			}

			if (exists == -1 || theChats.length == 0) {
				var newServerID;
				if (serverList.size == 0) {
					newServerID = 1;
				} else {
					//need to test to make sure this works
					var count;
					while (true) {
						newServerID = getRandomInt(100);
						if (serverList.get(newServerID) == undefined) {
							break;
						}
					}
				}
				//update current server of owner to new server
				var ownerPOS = findUser(userList, socketclient.username);
				userList[ownerPOS].activeServer = newServerID;

				let newServer = new Server(newServerID, socketclient.username, 0, 0, "direct", 0);
				newServer.addMember(socketclient.username); //add owner to list of current members in server
				newServer.addMemberSocket(userList[ownerPOS].id);
				newServer.addMember(directUser.username);
				newServer.addMemberSocket(directUser.id);
				userList[ownerPOS].addServer(newServer);
				newServer.name = username + "/" + socketclient.username;
				directUser.addServer(newServer);
				serverList.set(newServerID, newServer);
				theUser.addDirectMessage(username);
				directUser.addDirectMessage(socketclient.username);
				socketio.sockets.to(socketclient.id).emit("makeDirectChat", { username: directUser.username, profileImage: directUser.profileImage, serverID: newServerID });
				socketio.sockets.to(directUser.id).emit("makeDirectChat", { username: socketclient.username, profileImage: theUser.profileImage, serverID: newServerID });
				addServerToDatabase(username + "/" + socketclient.username, 0, 0, newServerID);
				addMemberToServerDatabase(username + "/" + socketclient.username, theUser.username);
				addMemberToServerDatabase(username + "/" + socketclient.username, directUser.username);
			}

			else {
				//find common dm between users, launch this instead
				serverList.forEach((key) => {
					if (key.serverMembers.length == 2) {
						let testServer = key;
						if (findMember(testServer.serverMembers, socketclient.username) != -1 && findMember(testServer.serverMembers, directUser.username) != -1) {
							socketio.sockets.to(socketclient.id).emit("launchdirectChat", testServer.serverID);
							socketio.sockets.to(directUser.id).emit("launchdirectChat", testServer.serverID);
						}
					}
				});
			}
		}
		if (blocked != -1) {
			socketio.sockets.to(theUser.id).emit("youareblocked", directUser.username);
		}
	});

	socketclient.on("getservername", (serverID) => {
		let theServer = serverList.get(serverID);
		if (serverID != 0) {
			socketio.sockets.to(socketclient.id).emit("displayServerName", theServer.name);
		}
		else {
			socketio.sockets.to(socketclient.id).emit("displayServerName", "Public Chat");
		}

	});
	socketclient.on("servers", function () {
		let theUser = userList[findUser(userList, socketclient.username)];
		let theServers = theUser.userServerList;
		var number = 0;
		for (var i = 0; i < theServers.length; i++) {
			if (theServers[i].attribute.localeCompare("direct") != 0) {
				number++;
			}
		}
		socketio.sockets.to(socketclient.id).emit("serverNumber", number);
	});
	socketclient.on("acceptinvitation", ({
		theID, member
	}) => {
		//find server of owner
		//add user to server
		//set this user's active server to server ID of invitation

		//check to see if user is already part of server
		let theUser = userList[findUser(userList, member)];
		let theServer = serverList.get(parseInt(theID));
		let theServerMembers = theServer.serverMembers;
		let serverName = serverList.get(parseInt(theID)).name;
		theUser.addServer(theServer);
		//if user is not part of server, add server to their list
		if (findMember(theServerMembers, member) == -1) {
			theServer.addMember(member);
			theServer.addMemberSocket(theUser.id);
			addMemberToServerDatabase(serverName, theUser.username);
			//have the server show up on their "server list " screen (use serverID)
			socketio.sockets.to(theUser.id).emit("addserver", { theName: theServer.name, theID: theServer.serverID, imageSource: theServer.image });
			socketio.sockets.to(userList[findUser(userList, theServer.owner)].id).emit("userlist", {
				username: member,
				count: 1,
				div: "userList"
			});
		}
		//now remove invitation from Active server invitation (clean up)
		let pos = findInvite(theUser.activeInvitations, theID); //theID(unparsed) = theID+"invitation" +username
		theUser.activeInvitations.splice(pos, 1);

	});
	socketclient.on("enterserver", async (serverID) => {
		//change user active server ID to serverID
		//need to separate between public and private...
		//if it's the public server, we don't do any of this
		let theUser = userList[findUser(userList, socketclient.username)];
		let theServer = serverList.get(serverID);
		if (serverID != 0) {
			if (serverID == -1) {
				theServer = serverList.get(theUser.activeServer);
			}
			var divCount = 0;
			for (var i = 0; i < theServer.serverMembers.length; i++) {
				let member = theServer.serverMembers[i];
				let theUser = userList[findUser(userList, member)];
				for (var j = 0; j < theServer.memberSockets.length; j++) {
					socketio.sockets.to(theServer.memberSockets[j]).emit("userlist", {
						username: member,
						count: divCount,
						div: "userList",
						imageSource: theUser.profileImage
					});
				}
				divCount++;
			}
			var chat_history =  await messengerdb.loadChatHistory(socketclient.username,100,theServer.name)
			if (chat_history && chat_history.length > 0) {
				chat_history = chat_history.reverse()

				socketclient.emit("chat_history",{chat_history: chat_history, div:"privatechat"})
			}
			if (serverID !== -1) {
				theUser.activeServer = serverID;
			}
		}
		if (serverID == 0) {
			//let theUser=userList[findUser(userList, socketclient.username)];
			theUser.activeServer = 0;
			socketio.sockets.to(socketclient.id).emit("enterpublic");
			printUserList(0, "userList");

		}
	});

	//launch server is used to remove the most recent created server from "active servers" queue, so that another can be created
});
class User {
	//activeServer will keep track of the current server the user is in
	//we can use 0 as public server
	constructor(userId, username, activeServer, dc, profileImage, selectedUser, admin) {
		this._id = userId;
		this._selectedUser = selectedUser;
		this._profileImage = profileImage;
		this._activeServer = activeServer;
		this._username = username;
		this._userServerList = [];
		this._missedMessages = [];
		this._directMessages = [];
		this._activeInvitations = [];
		this._blockedUsers = [];
		this._dc = dc;
		this._admin = admin;
		this.addServer = function (serverID) {
			this._userServerList.push(serverID);
		};
		this.addMissedMessage = function (message) {
			this._missedMessages.push(message);
		};
		this.addDirectMessage = function (username) {
			this._directMessages.push(username);
		}
		this.addInvitation = function (message) {
			this._activeInvitations.push(message);
		}
		this.addBlockedUser = function (username) {
			this._blockedUsers.push(username);
		}

	}
	get selectedUser() {
		return this._selectedUser;
	}
	get directMessages() {
		return this._directMessages;
	}
	get blockedUsers() {
		return this._blockedUsers;
	}
	get userServerList() {
		return this._userServerList;
	}
	get activeInvitations() {
		return this._activeInvitations;
	}
	get id() {
		return this._id;
	}
	get profileImage() {
		return this._profileImage;
	}
	get username() {
		return this._username;
	}
	get activeServer() {
		return this._activeServer;
	}
	get missedMessages() {
		return this._missedMessages;
	}
	get dc() {
		return this._dc;
	}
	get admin() {
		return this._admin;
	}
	set admin(value) {
		this._admin = value;
	}
	set selectedUser(user) {
		this._selectedUser = user;
	}
	set profileImage(source) {
		this._profileImage = source;
	}
	set id(userId) {
		this._id = userId;
	}
	set dc(num) {
		this._dc = num;
	}
	set username(username) {
		this._username = username;
	}
	set activeServer(newServer) {
		this._activeServer = newServer;
	}
}

class Server {
	//can add name field, allowing user to name the server(additional use case)
	constructor(serverID, owner, name, imageSrc, attribute, shown) {
		this._name = name;
		this._shown = shown;
		this._attribute = attribute;
		this._imageSource = imageSrc;
		this._serverID = serverID;
		this._owner = owner;
		this._serverList = [];
		this._messages = [];
		this._memberSockets = [];
		this.addMember = function (username) {
			this._serverList.push(username)
		};
		this.addMemberSocket = function (id) {
			this._memberSockets.push(id);
		};
		this.addMessage = function (message) {
			this._messages.push(message);
		};
	}
	set name(name) { this._name = name; }
	set attribute(type) { this._attribute = type; }
	set shown(yn) { this._shown = yn; }
	get image() {
		return this._imageSource;
	}
	get shown() {
		return this._shown;
	}
	get attribute() {
		return this._attribute;
	}
	get memberSockets() {
		return this._memberSockets;
	}
	get serverMembers() {
		return this._serverList;
	}
	get messages() {
		return this._messages;
	}
	get name() {
		return this._name;
	}
	get owner() {
		return this._owner;
	}
	get serverID() {
		return this._serverID;
	}
}

function findUser(array, user) {
	var pos = -1;
	for (var i = 0; i < array.length; i++) {
		var n = user.localeCompare(array[i].username)
		if (n == 0) {
			pos = i;
			break;
		}
	}
	return pos;
}
function containsServer(array, server) {
	var pos = -1;
	for (var i = 0; i < array.length; i++) {
		var n = server.localeCompare(array[i].name)
		if (n == 0) {
			pos = i;
			break;
		}
	}
	return pos;
}
function findMember(array, user) {
	var pos = -1;
	for (var i = 0; i < array.length; i++) {
		var n = user.localeCompare(array[i])
		if (n == 0) {
			pos = i;
			break;
		}
	}
	return pos;
}
function printUserList(theCount, theDiv) {
	var count = theCount;
	for (var i in userList) {
		socketio.sockets.emit("userlist", {
			username: userList[i].username,
			count: count,
			div: theDiv,
			imageSource: userList[i].profileImage
		});
		count++;
	}
}
function isInvited(array, invite) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].localeCompare(invite) == 0) {
			return true;
		}
	}
	return false;
}
function findInvite(array, invite) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].localeCompare(invite) == 0) {
			return i;
		}
	}
}
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}
function processString(string) {
	var temp = "";
	let servers = new Array();
	for (var i = 0; i < string.length; i++) {
		if (string[i] != '"' && string[i] != ',') {
			temp += string[i];
		}
		if (string[i] == ',' || i == string.length - 1) {
			servers.push(temp);
			temp = "";
		}
	}
	return servers;
}
function processID(string) {
	var temp = "";
	for (var i = 0; i < string.length; i++) {
		if (string[i] != '"' && string[i] != ',' && string[i] != '{' && string[i] != '}'
			&& string[i] != 'i' && string[i] != 'd' && string[i] != ':') {
			temp += string[i];
		}
	}
	return temp;
}
function processImage(string) {
	var temp = "";
	for (var i = 0; i < string.length; i++) {
		if (string[i] != '"' && string[i] != ',' && string[i] != '{' && string[i] != '}'
			&& string[i] != 'i' && string[i] != 'd') {
			temp += string[i];
		}
	}
	return temp;
}
var messengerdb = require("./messengerdb");
const { count } = require('console');
const { networkInterfaces, userInfo } = require('os');
const serveStatic = require('serve-static');
const { changeUser } = require('./messengerdb');
const { changeImage } = require('./messengerdb');
const { addServerToDatabase } = require('./messengerdb');
const { addMemberToServerDatabase } = require('./messengerdb');
const { getServerList } = require('./messengerdb');
const { getServerID } = require('./messengerdb');
const { getImageSource } = require('./messengerdb');
const { ENGINE_METHOD_DIGESTS } = require('constants');
var DataLayer = {
	info: 'Data Layer Implementation for Messenger',
	async checklogin(username, password) {
		var checklogin_result = await messengerdb.checklogin(username, password)
		return checklogin_result
	},
	addUser(username, password, callback) {
		messengerdb.addUser(username, password, (result) => {
			callback(result)
		})
	},
	getServerList(username, callback) {
		messengerdb.getServerList(username, (result) => {
			callback(result);
		})

	},
	getServerID(serverName, callback) {
		messengerdb.getServerID(serverName, (result) => {
			callback(result);
		})
	},
	getImageSource(serverName, callback) {
		messengerdb.getImageSource(serverName, (result) => {
			callback(result);
		})
	}
}


