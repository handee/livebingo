const express = require('express');
const app = express();
const http = require('http');
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
  io.to(socket.id).emit('welcome',socket.id);
  console.log(socket.nick)
  
  bingo_zero=["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteeen","nineteen","twenty","twentyone","twentytwo","twentythree","twentyfour"];

  socket.on('chat message', (msg) => {
    console.log("chat message")
    console.log(msg)
    console.log(socket.nick)
    console.log(socket.id)
    if (socket.nick==="") {
        socket.nick=msg;
	io.to(socket.id).emit('welcome',socket.nick);
    } else if (socket.mygame==="") {
        socket.join(msg);
	socket.mygame=msg;
        io.to(socket.id).emit('inroom',socket.mygame,socket.nick,bingo_zero);
    } else {
        io.sockets.in(socket.mygame).emit('chat message', socket.nick,msg);
    }
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
