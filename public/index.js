/* This is a client side javascript file */



// connect with socket.io
var socket = io.connect();

// This code will be executed when the page finishes loading
window.addEventListener('load', function(){


	socket.emit('loadindex',function(data){
		// 	var rooms_container = document.getElementById('rooms_container');
		rooms_container.innerHTML="";
		console.log(data);
		for(var i =0; i<data.length; i++){
				var current_room = document.createElement('div');
				var roomName_link ='<a href=/'+data[i].room+'>'+data[i].room+'</a>';
				current_room.className = 'single_link';
				current_room.innerHTML = roomName_link;
				// append the message 
				rooms_container.appendChild(current_room);		
		}
	});

	var click = function addroom(){
		console.log("button pressed");
		socket.emit('addroom',function(data){
			console.log("emit");
			var rooms_container = document.getElementById('rooms_container');
			// rooms_container.innerHTML="";
			// for(var i =0; i<data.length; i++){
			var current_room = document.createElement('div');
			var roomName_link ='<a href=/'+data+'>'+data+'</a>';
			current_room.className = 'single_link';
			current_room.innerHTML = roomName_link;
			// append the message 
			rooms_container.appendChild(current_room);	
		});
	}

	document.getElementById('addroom').onclick = click; 

	// function renderRooms(data){
		
	// }

	// I should be able to make a hashtable in client side but should I do that?

	// function display(chats){
		
	// 	var data = JSON.parse(chats);

	// 	var rooms_container = document.getElementById('rooms_container');
	// 	rooms_container.innerHTML="";
	// 	for(var i =0; i<data.length; i++){
	// 			var current_room = document.createElement('div');
	// 			var roomName_link ='<a href=/'+data[i].room+'>'+data[i].room+'</a>';
	// 			current_room.className = 'single_link';
	// 			current_room.innerHTML = roomName_link;
	// 			// append the message 
	// 			rooms_container.appendChild(current_room);	
			
	// 	}
	// }

	// This is the part for get request
	// function request(url,display){
	// 	var req = new XMLHttpRequest();
	// 	req.open('GET','/newRoom.json',true);
	// 	req.addEventListener('load', function(){
	// 		if (req.status == 200)
	// 		{
	// 			// call the callback function
	// 			console.log("request made");
	// 			display(req.responseText);
	// 		}
	// 	}, false);
	// 	req.send(null);
	// }

	// var wrapper = function(){
	// 	request('/',display);
	// }
	// // Not quite sure if I am doing it right needs to check
	// wrapper();
	// setInterval(wrapper,1000);


	// Make a request if the create room button is set
	// var button = document.getElementById('addroom');
	// var button_request = new XMLHttpRequest();

	// button.addEventListener('click',function(){
	// 	button_request.open('GET','/newRoom',true);
	// 	button_request.send(null);
	// });

}, false);

