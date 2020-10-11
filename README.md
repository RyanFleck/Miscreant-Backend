# Miscreant-Backend

Corresponding frontend is <https://github.com/RyanFleck/Miscreant-Client>

<br />

## Iteration 2 Notes

Basic websocket backend deployed and working on Heroku. Hooray!

Server kicks users who fail to check in at least every two seconds.

<br />

## Iteration 1 Notes

Conclusions from this experiment:

- It is easy to program a simple TCP game server.
- It is impossible to run a simple TCP game server from Heroku, you need to use web sockets.

Console output looks like this:

```
Player with id 5dad3635-eec8-4df9-9eda-0bbdcfbb08b0 is at 0,0
Player with id eb223612-2576-4b49-af49-61e7edc0936f is at 0,0
Active on port 1984
[
  'eb223612-2576-4b49-af49-61e7edc0936f',
  '5dad3635-eec8-4df9-9eda-0bbdcfbb08b0'
]
There are 2 people in the lobby
```
