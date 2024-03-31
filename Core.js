//
// Thanks for checking this project out.
//
// Email: Xeoxaz@outlook.com
//
console.clear();
process.title = "Orbit Server";

// Import
import express from "express";
import http from "http";
import { Server } from "socket.io";

// Const
const app = express();
const server = http.createServer(app);
const io = new Server(server,
  {
    pingInterval: 5000,
    cors: {
      origin: "*",
      credentials: false
    }
  }
);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' })
});

var connected = [];

// Connection
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} has connected.`);
  
  var user = {
    socket_id: socket.id
    // color
  }
  connected.push(user);

  socket.on("_type", (_type)=>{
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected[_index].type = _type;
        console.log(`Upgraded ${_user.socket_id} to: ${_type}.`);
      }
    });
  });

  socket.on("_pong", (_ping)=>{

    var current_time = Math.floor(new Date().getTime() / 1000);
    var ms = current_time - _ping;

      connected.forEach((_user, _index)=>{
          if(_user.socket_id == socket.id){
              connected[_index].ping = `${ms}`;
          }
      });
  });

  socket.on("_hostname", (_hostname)=>{
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected[_index].hostname = _hostname;
        console.log(`Information update ${_user.socket_id} hostname to: ${_hostname}.`);
      }
    });
  });

  socket.on("_system", (_data)=>{
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected[_index].system = _data;
      }
    });
  })

  socket.on('_connected', ()=>{
    socket.emit("_connected", connected);
  });

  // End of message
  socket.on("disconnect", () => {
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected.splice(_index, 1);
        console.log(`Socket ${socket.id} has disconnected.`);
      }
    });
  });
});

// Port
const PORT = process.env.PORT || 2163;

// Open Port
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});