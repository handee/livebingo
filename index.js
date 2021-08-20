const express = require('express');
const app = express();
const http = require('http');
const fs = require('fs');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


io.sockets.on('connection', (socket)=> {
  console.log('a user connected');
  console.log(socket.id)
  socket.nick="";
  socket.mygame="";
  let raw=fs.readFileSync('cards.json');
  let cards=JSON.parse(raw);
  titles=cards.cards.map(a => a.title);
  io.to(socket.id).emit('welcome',socket.id,titles);
  console.log(socket.nick);
  socket.on('chat message', (msg) => {
    cardindex=0;
    if (socket.nick==="") {
        socket.nick=msg;
	io.to(socket.id).emit('welcome',socket.nick, titles);
    } else if (socket.mygame==="") {
	// trying to join an existing game
        console.log(msg);	
	// check to see if there is a room with that id
        if (io.sockets.adapter.rooms[msg]) {	
		console.log("exists");	
		// find out what the bingo card is
		socket.cardindex=io.sockets.adapter.rooms.get(msg).cardindex;
		bingo_card=cards.cards[socket.cardindex];
		socket.join(msg);
		socket.mygame=msg;
		io.to(socket.id).emit('inroom',socket.mygame,socket.nick,bingo_card);
	
	} else {
		console.log("doesn't exist");	
		io.to(socket.id).emit('welcome',socket.nick, titles);
		io.to(socket.id).emit('nonexistentroom')
	}
    } else {
        io.sockets.in(socket.mygame).emit('chat message', socket.nick, msg);
    }
  });
  socket.on('gamejoin', (code, cardtitle) => {
	  socket.join(code);
	  socket.mygame=code;
	  socket.cardindex=titles.indexOf(cardtitle);
	  io.sockets.adapter.rooms.get(code).cardindex = socket.cardindex
	  bingo_card=cards.cards[socket.cardindex];
	  io.to(socket.id).emit('inroom',socket.mygame,socket.nick,bingo_card);
	

  });
  socket.on('bingo selected', (square) => {
     io.sockets.in(socket.mygame).emit('chat message', socket.nick, " clicked "+square);
     io.sockets.in(socket.mygame).emit('bingo select', square, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

server.listen(process.env.PORT || 3000, () => {
  pt=process.env.PORT || 3000;
  console.log('listening on '+pt);
});
