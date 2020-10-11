const net = require("net");
const { putVar, getVar } = require("@gd-com/utils");
const StreamTcp = require("./stream_tcp");

/*
 * Extremely simple first go at networking a Godot game.
 * Single-lobby, supports n users (whatever it takes to crash the thing)
 * Code from https://github.com/gd-com/examples
 */

class Player {
  constructor(uuid, x, y, last_time) {
    this.uuid = uuid;
    this.x = x;
    this.y = y;
    this.last_time = last_time;
  }
}

const players = {};

function processPlayerLocation(vals) {
  const uuid = vals[0];
  if (uuid == undefined) return null;
  const new_x = vals[1];
  const new_y = vals[2];
  if (Object.keys(players).indexOf(uuid) > -1) {
    console.log(`Player with id ${uuid} is at ${new_x},${new_y}`);
    players[uuid].last_time = Date.now();
  } else {
    console.log(`Adding new player with id ${uuid}`);
    players[uuid] = new Player(uuid, 0, 0, Date.now());
  }
}

function kickPlayersLoop() {
  console.log(`Active on port ${process.env.PORT || 1984}`);
  player_keys = Object.keys(players);
  // The max time a player can lag is 500ms
  let expiry = Date.now() - 500;
  console.log(player_keys);
  console.log(`There are ${player_keys.length} people in the lobby`);
  player_keys.forEach(function (uuid) {
    let last_time = players[uuid].last_time;
    console.log(
      `Checkin: id ${uuid} was last here at ${last_time}, current time is ${expiry}`
    );
    if (last_time < expiry) {
      console.log("Kicking player with UUID " + uuid);
      delete players[uuid];
    }
  });
}

let server = net.createServer((socket) => {
  const tcpSplit = new StreamTcp();
  socket.pipe(tcpSplit).on("data", (data) => {
    const packet = new Buffer.from(data);
    const type = packet.readInt16LE(0);
    if (type !==4) {
        // Not something relevant to the game, discard.
        return;
    }
    const decoded = getVar(packet);
    if (typeof decoded.value == "string") {
      const vals = decoded.value.split(",");
      processPlayerLocation(vals);
    } else {
      const packetToSend = putVar(Math.random());
      // we need to put the packet length on top cause it's tcp
      const lengthBuffer = Buffer.alloc(4);
      lengthBuffer.writeUInt32LE(packetToSend.length, 0);
      const toSend = Buffer.concat([lengthBuffer, packetToSend]);

      console.log("send :", toSend);
      socket.write(toSend);
    }
  });

  socket.on("error", () => console.log("Bye :("));
});

server.on("error", (err) => {
  throw err;
});

setInterval(kickPlayersLoop, 300);
server.listen(process.env.PORT || 1984, () => {
  console.log(`Server launched TCP on port ${process.env.PORT || 1984}`);
});
