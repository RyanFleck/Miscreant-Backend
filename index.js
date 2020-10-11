const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

const users = {};

class User {
  constructor(uuid, client, lastseen) {
    this.uuid = uuid;
    this.client = client;
    this.lastseen = lastseen;
  }
}

wss.on("connection", function connection(ws, request, client) {
  let user = new User(null, client, Date.now());

  ws.on("message", (message) => {
    message_str = message.toString();
    if (user.uuid == null) {
      //User is not authenticated.
      if (message_str.startsWith("Auth")) {
        console.log("Authenticating new user...");
        user_uuids = Object.keys(users);
        const uuid = message_str.split(" ")[1];
        if(uuid.length == 36){
          console.log(`Got uuid ${uuid}`);
          // Check if user is already in set:
          user_uuids = Object.keys(users);
          if(user_uuids.indexOf(uuid) > -1){
            // User is already in the list, get back their data
            user = users[uuid];
          }else{
            // Add user to the list if not present
            user.uuid = uuid;
            users[uuid] = user;
          }

          user.uuid
        }
      }
    } else {
      //User is authenticated.
      console.log(`Got non-auth message of type ${typeof message}: ${message}`);
    }
  });
});

function listUsers() {
  user_uuids = Object.keys(users);
  console.log(`${user_uuids.length} users connected`);
  user_uuids.forEach(function (user) {
    console.log(`Checking on user ${user}`);
  });
}

setInterval(() => {
  listUsers();
}, 1000);
