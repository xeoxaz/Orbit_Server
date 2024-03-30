// Space Command Server
console.clear();

// Import
import express from "express";
import http from "http";
import { Server } from "socket.io";

// Const
const app = express();
const server = http.createServer(app);
const io = new Server(server,
  {
    cors: {
      origin: "*",
      credentials: false
    }
  }
);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Example route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' })
});

var connected = [];

// Connection
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} has connected.`);
  
  var user = {
    socket_id: socket.id
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

setInterval(()=>{
  // Ping | Update to clients
  
}, 5000);


// Port
const PORT = process.env.PORT || 2163;

// Open Port
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});