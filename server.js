/*
Chatroom
Author: Cheng Lun Chen 

I currently have a bug, when user input the room directly at the first time
the server will crash. Think about why.

*/

var express = require('express');
var app = express();
app.use(express.bodyParser());


var fs = require('fs');

// set up with socket.io
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server,{log:false});


// Connect to Database
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://chatroom.db');


// Use Hogan for handling the template 
var engines = require('consolidate');
app.engine('html',engines.hogan);
app.set('views',__dirname + '/templates');

app.use('/public', express.static(__dirname + '/public'));


// app.get('/newRoom.json',function(request,response){

// 	var q = conn.query('SELECT DISTINCT room FROM messages');
// 	rooms = [];

// 	q.on('row',function(row){
// 		rooms.push({room:row.room});
// 	});
// 	q.on('end',function(){
// 		response.json(rooms);
// 	});

// });


// app.get('/newRoom',function(request,response){

// 	var roomName = generateRoomIdentifer();
// 	conn.query('INSERT INTO messages(room) VALUES ($1)', 
// 	[roomName]);
// 	response.redirect('/'+roomName);
// });

// // This will render a specific room, when the user type the url of a specific room
app.get('/:roomName',function(request,response){
	console.log("rendering room!");
	var name = request.params.roomName;
	// send back the room.html file
	response.render('room.html',{roomName:request.params.roomName});
});

// // I should have a button for creating room 
// // get a list of rooms on the server

app.get('/',function(request, response){
	response.render('index.html');
});


function generateRoomIdentifer(){

	var chars = 'abcdefghijklmnopqrstuvwxyz123456789';
	var result = '';
	for(var i=0; i<6; i++){
		result += chars.charAt(Math.floor(Math.random()*chars.length));
	}
	return result;
}

/*
Rooms allow simple partitioning of the connected clients. 
This allows events to be emitted to subsets of the connected client list, 
and gives a simple method of managing them.
*/


/*
Event-driven programming 3 essential steps:
1. Write the method of the event handler.  // This is the code we have written in socket.on 
2. Bind the event handler to event. // which has been done by .on
3. Check for the occurence of events. // done by the client side as socket.emit
*/

// This is the same as app.get(...)
io.sockets.on('connection',function(socket){

	// This client side will emit the event to join the room and pass in the room name, user name and the callback function 
	// for displaying the message
	socket.on('join',function(roomName, nickName,callback){


		console.log("Join");

		socket.join(roomName); // This is a socket.io method
		socket.nickName = nickName;
		messages = [];

		// get a list of messages currently in the room and send it back
		var sql = 'SELECT * FROM messages WHERE room=$1 ORDER BY time ASC';
		var q = conn.query(sql,roomName);

		q.on('row',function(row){
			messages.push({nickname:row.nickname,body:row.body,time:row.time, id:row.id});
		});
		q.on('end',function(){
			// This will call the display function in the client side.
			// Here we set messages > 1 is because we have store the room information in the database first
			// Therefore even there is no user input message, the message.length is 1 at the first befining
			// if(messages.length>1){

				callback(messages,socket.id);
			// }
		});
		broadcastMembership(roomName);
	});

	// client will emit the event when the user change the nickname 
	// Need to think about if we should change the nickname of the 
	// previous messages posted
	socket.on('nickname',function(nickName){
		console.log("NICKNAME EMIT");
		socket.nickName = nickName;
		var roomName = getRoomName(socket);
		broadcastMembership(roomName);

	});

	socket.on('message', function(message){
		console.log("message!");

        // Make sure you understand this line before you proceed
        var roomName = getRoomName(socket);

		// Should send message to database:
		conn.query("INSERT INTO messages (room, nickname, body, time) VALUES ($1, $2, $3, strftime('%s', 'now'))", [roomName, socket.nickName, message]);

		// After insert into database we should append the message to the html from the client side
		io.sockets.in(roomName).emit('message',socket.nickName,message,Date.now(),socket.id);
	});


	  // the client disconnected/closed their browser window
    socket.on('disconnect', function(){
        console.log("disconnect!");

        // Leave the room!
    	
        var roomName = getRoomName(socket);
        if(roomName){
    	    console.log("roomname in disconnect:"+roomName);

	        socket.leave(roomName);
    		broadcastMembership(roomName);
    	}
    });


    // When join the newroom 
    socket.on('addroom', function(callback){
        
    	var roomName = generateRoomIdentifer();
		conn.query('INSERT INTO messages(room) VALUES ($1)', [roomName]);
		console.log("room added");
		callback(roomName);
		// Call the function in the index.js
    });


    socket.on('loadindex', function(callback){
        
        //var q = conn.query("SELECT DISTINCT room FROM messages WHERE time >= strftime('%s','now', '-5 minutes') ORDER BY time DESC");


		var q = conn.query('SELECT DISTINCT room FROM messages');
		rooms = [];

		q.on('row',function(row){
			rooms.push({room:row.room});
		});
		q.on('end',function(){
			callback(rooms);		
		});

		// Call the function in the index.js
    });

    socket.on('inputMessage',function(){
    	
    	var roomName = getRoomName(socket);
    	var sockets = io.sockets.clients(roomName);

		// callback(socket.nickName);
		io.sockets.in(roomName).emit('inputMessage',socket.nickName);
    });

});

// This function handles the case whenever anyone leaves a room, joins a room, 
// or changes their nickname, we send a membership update to everyone in the room 
function broadcastMembership(roomName){
	var sockets = io.sockets.clients(roomName);
	var nicknames = sockets.map(function(socket){
		return socket.nickName;
	});
	console.log("nicknames in broadcastMembership:"+nicknames);
	io.sockets.in(roomName).emit('membershipChanged',nicknames);
}


function getRoomName(socket){
		var rooms = io.sockets.manager.roomClients[socket.id];
		console.log("rooms in getRoomName:"+rooms);

	    if(rooms.length == 0){
	    	return;
	    }
        // note that you somehow need to determine what room this is in
        // io.sockets.manager.roomClients[socket.id] may be of some help, or you
        // could consider adding another custom property to the socket object.

        // Note that io.sockets.manager.roomClients[socket.id] is a hash mapping
        // from room name to true for all rooms that the socket is in, that room
        // names are prefixed with a "/", and that every socket is in a global room
        // with name '' (the empty string). Thus, to get the room name, you might
        // have to use something like this:
        var roomsList = Object.keys(rooms);

        // This line prevents the program from crash
        if(roomsList.length != 2) return;
        // Make sure you understand this line before you proceed
        var roomName = (roomsList[0] == '') ? roomsList[1].substr(1) : roomsList[0].substr(1);
    	
        return roomName;
}

// perform database whoosiwhatsits, then start listening
console.log('- Preparing database...');

// here, we cheat and use a sqlite3 method (exec) that lets us run multiple queries at once
var schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
conn._db.exec(schema, function(err){
    if (err)
        console.error('- Error initializing database: ' + err.message);
    else
    {
        console.log('- Database ready!');
        server.listen(8080, function(){
            console.log('- Listening on port 8080');
        });
    }
});