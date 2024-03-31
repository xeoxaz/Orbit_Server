//
// Thanks for checking this project out.
//
// Email: Xeoxaz@outlook.com
//
console.clear();

// Import
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { DateTime } from 'luxon';
import os from 'os';
import chalk from 'chalk';

var host = {
  hostname: os.hostname()
}
process.title = `${host.hostname} [Orbit Server]`;

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

// show post
post();

var connected = [];

// Connection
io.on("connection", (socket) => {
  log(`Socket ${socket.id} has connected.`);
  
  var user = {
    socket_id: socket.id
    // color
  }
  connected.push(user);

  socket.on("_type", (_type)=>{
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected[_index].type = _type;
        log(`Upgraded ${_user.socket_id} to: ${_type}.`);
      }
    });
  });

  socket.on("_browser", (_browser)=>{
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected[_index].browser = _browser;
      }
    });
  });

  socket.on("_pong", (_ping)=>{

    var current_time = Math.floor(new Date().getTime() / 1000);
    var ms = _ping - current_time;

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
        log(`Information update ${_user.socket_id} hostname to: ${_hostname}.`);
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

  socket.emit("_host", (host.hostname));

  // End of message
  socket.on("disconnect", () => {
    connected.forEach((_user, _index)=>{
      if(_user.socket_id == socket.id){
        connected.splice(_index, 1);
        log(`Socket ${socket.id} has disconnected.`);
      }
    });
  });
});

// Port
const PORT = process.env.PORT || 2163;

// Open Port
server.listen(PORT, () => {
  log(chalk.yellowBright(`Server listening on port ${PORT}.`));
});

function log(_data){
  var dt = DateTime.now();
  var cdt = chalk.cyanBright(`${dt.toFormat('tt')}`);
  console.log(`${cdt} ${_data}`);
}

function post(){
  console.log("");
  console.log("");
  log(chalk.white(`  ___       _     _ _    `));
  log(chalk.whiteBright(` / _ \\ _ __| |__ (_) |_ `));
  log(chalk.blue(`: | | | '__| '_ \\| | __|:`));
  log(chalk.blueBright(`: |_| | |  | |_) | | |_ :`));
  log(chalk.cyan(` \\___/|_|  |_.__/|_|\\__|`));
  log(chalk.cyanBright(` [Server]       ~ Xeoxaz`));
  console.log("");
  console.log("");
}