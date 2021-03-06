import WebSocket from "ws";
import { animals } from "./animals.js";

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
console.log(`Running on port ${process.env.PORT || 8080}`);

const users = {};

class User {
  constructor(uuid, socket, lastseen) {
    this.uuid = uuid;
    this.socket = socket;
    this.lastseen = lastseen;
    this.name = animals[Math.floor(Math.random() * Math.floor(animals.length))];
  }
}

wss.on("connection", function connection(ws) {
  let uuid = null;

  ws.on("message", (message) => {
    const message_str = message.toString();
    console.log(`User ${uuid || "anon"} sent message ${message_str}`);

    // If the user is not authenticated, they need to send a UUID.
    if (uuid == null) {
      if (message_str.startsWith("Auth")) {
        const user_uuids = Object.keys(users);
        uuid = message_str.split(" ")[1];
        if (uuid.length == 36) {
          // Check if user is already in set:
          if (user_uuids.indexOf(uuid) > -1) {
            // User is already in the list, get back their data
            console.log(`Existing user has re-joined with id:${uuid}`);
          } else {
            // Add user to the list if not present
            console.log(`New user has joined with id:${uuid}`);
            users[uuid] = new User(uuid, ws, Date.now());
          }
          wss.clients.forEach((client) => {
            client.send("msg Sys: Welcome, " + users[uuid].name + "!");
          });
        }
      }
    } else {
      //User is authenticated.
      console.log(
        `Got authorized message from ${uuid} of type ${typeof message}: ${message}`
      );
      const message_str = message.toString();
      if (message_str.startsWith("yep")) {
        console.log(`User ${uuid} checked in.`);
        users[uuid].lastseen = Date.now();
      } else if (message_str.startsWith("msg ")) {
        console.log("Sending message to everyone...");
        let msg = "msg " + users[uuid].name + ": " + message_str.slice(3);
        //users[uuid].name
        wss.clients.forEach((client) => {
          client.send(msg);
        });
      }
    }
  });
});

function listUsers() {
  let expiry = Date.now() - 2000;
  const user_uuids = Object.keys(users);
  console.log(`${user_uuids.length} users connected`);
  user_uuids.forEach(function (uuid) {
    if (users[uuid].lastseen < expiry) {
      console.log(
        `Kicking user ${uuid}, was last seen ${users[uuid].lastseen}`
      );
      users[uuid].socket.terminate();
      delete users[uuid];
    } else {
      users[uuid].socket.send("alive?");
    }
  });
}

setInterval(() => {
  listUsers();
}, 1000);
