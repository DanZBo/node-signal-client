const SignalClient = require('./');

const client = new SignalClient("nodejs");

// triggered when you receive a message on signal
client.on('message', (ev) => {
  console.log('received message from', ev.data.source, ev.data);
});

// triggered when a sent message synced from another client
client.on('sent', (ev) => {
  console.log('sent a message to', ev.data.destination, ev.data);
});

client.on('receipt', (ev) => {
  var pushMessage = ev.proto;
  var timestamp = pushMessage.timestamp.toNumber();
  console.log(
    'delivery receipt from',
    pushMessage.source + '.' + pushMessage.sourceDevice,
    timestamp
  );
});


client.on('contact', (ev) => {
  console.log('contact received', ev.contactDetails);
});

client.on('group', (ev) => {

});

let groups = new Map(); // abstract storage for groups
// triggered when we run syncGroups
client.on('group', (ev) => {
  console.log('group received', ev.groupDetails);
  let id = ev.groupDetails.id;
  let name = ev.groupDetails.name.replace(/\s/g, '_');
  groups.set(name, id) // save ids to storage (for example: Redis)
});

setTimeout(client.syncGroups, 3000); // request for sync groups 

setTimeout(sendingMessage, 10000);// send message in 10 secs after start

async function sendingMessage() {
  let groupId = groups.get(process.env.GROUP_NAME); // get group id from storage by group name
  await client.sendMessageToGroup(groupId, 'test_message'); // send message to group
  return;
}

client.on('read', (ev) => {
  var read_at = ev.timestamp;
  var timestamp = ev.read.timestamp;
  var sender = ev.read.sender;
  console.log('read receipt', sender, timestamp);
});

client.on('error', (ev) => {
  console.log('error', ev.error, ev.error.stack);
});

client.start()