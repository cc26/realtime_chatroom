/* This is a client side javascript file */


// connect with socket.io
var socket = io.connect();

// This code will be executed when the page finishes loading
window.addEventListener('load', function(){
	
	var currentSocketId; // create a global socketid to distinghish the user color

	var messageFrom = document.getElementById('messageFrom');

	messageForm.addEventListener('submit',sendMessage,false);
	messageForm.addEventListener('keydown',keydown,false);
	

	function sendMessage(e){

		// This will prevent the default behavior for example : submit;
		// If we don't have this line, we will have to post handler in the 
		// server side
		e.preventDefault();
		socket.emit('message',document.getElementById('messageField').value);
	
	}

	function keydown(e){
		// currentTyping.innerHTML = "";
	
		socket.emit('inputMessage')
		// The blur doesn't work
		// messageForm.addEventListener('blur',nottyping,false);
	}

	socket.on('inputMessage',function(nickname){
		// var currentTyping = document.getElementById("currentTyping");
		// var currperson = document.createElement('span');
		// currperson.id = nickname;
		// currperson.innerHTML = nickname+" is typing...";
		// currentTyping.appendChild(currperson);
		var currentTyping = document.getElementById(nickname);
		currentTyping.innerHTML =nickname+" is typing...";
		
	});
	// function nottyping(){
	// 	console.log("get called");
	// 	var currentTyping = document.getElementById("currentTyping");	
	// 	currentTyping.innerHTML = "";
	// }





	var click = function changename(){
		console.log("button click!");
		
		var nickname = prompt('Enter a nickname:');

		socket.emit('nickname',nickname);
	}

	document.getElementById('nickNameChange').onclick = click; 


	// handle incoming messages
    socket.on('message', function(nickname, message, time, socketid){
    	
    	// this part is being used for css to distinguish the color of the text
    	var messageclass;
    	var nameclass;
    	var tofillclassname;
    	if(socketid == currentSocketId){
    		messageclass = "my_message";
    		nameclass = "my_name";
    		tofillclassname = "my_single_chat";
    	}else{
    		messageclass = "message";
    		nameclass = "name";
    		tofillclassname = "single_chat";
    	}

        // display a newly-arrived message
        var tofill = document.createElement('div');
		var message_div;
		var name_div;
		var chats_container = document.getElementById('chats_container');

		tofill.className = tofillclassname;
		name_div = '<div class='+nameclass+'>'+nickname+':'+'</div>';
		message_div= '<div class='+messageclass+'>'+message+'</div>';

		// tofill.className = "single_chat";
		// name_div = '<div class=name>'+nickname+':'+'</div>';
		// message_div= '<div class=message>'+message+'</div>';

		tofill.innerHTML =name_div+message_div;
		chats_container.appendChild(tofill);
		chats_container.scrollTop = chats_container.scrollHeight;

		// Empty the form field after the input is posted
		// The if statement is essential, because the form is shared.
		// We should only clean up the form for ourselves
    	if(socketid == currentSocketId){
			var formfield = document.getElementById("messageField");
			formfield.value = "";
		}
		var currentTyping = document.getElementById(nickname);	
		currentTyping.innerHTML = nickname;
    });

    // handle room membership changes
    socket.on('membershipChanged', function(members){

        // display the new member list
       
        var memberslist = document.getElementById('membersList');
        memberslist.innerHTML ="";
        console.log(members);
        for(var i=0; i<members.length; i++){
        	var member = document.createElement('li');
        	member.className = "member";
        	member.id = members[i];
        	member.innerHTML = members[i];
        	memberslist.appendChild(member);
        }


    });


    // get the nickname
    var nickname = prompt('Enter a nickname:');

    // join the room
    socket.emit('join', meta('roomName'), nickname, function(data,socketid){
    	
    	 currentSocketId = socketid;
     	// console.log("currentsocketid"+currentSocketid);

        // process the list of messages the server sent back
		if(data.length != 0){
			var chats_container = document.getElementById('chats_container');
			
			for(var i =1; i < data.length; i++){
				
				var tofill = document.createElement('div');
				tofill.className = "single_chat";
				var name_div = '<div class="oldname">'+data[i].nickname+':'+'</div>';
				var message_div= '<div class="oldmessage">'+data[i].body+'</div>';
				tofill.innerHTML =name_div+message_div;				
				chats_container.appendChild(tofill);	
			}
			var oldmessage = document.createElement('div');
			oldmessage.className = "seperateline";
			oldmessage.innerHTML = "New Message"
			chats_container.appendChild(oldmessage);
	
		}
    });


	// Access the room name variable from Javascript
	function meta(name) {
	    var tag = document.querySelector('meta[name=' + name + ']');
	    if (tag != null)
	        return tag.content;
	    return '';
	}


}, false);

