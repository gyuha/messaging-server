var socket = null;

function connectRoom(channel) {
  if (socket !== null) {
    console.log('disconnect');
    socket.close();
  }

  socket = io.connect('http://127.0.0.1:4040/room', {
    query: 'ch=' + channel + '&' + 'type=room',
    transports: ['websocket', 'polling']
  });

  if (socket === null) {
    console.log('socket connenct error');
  }
  var name = $('#name').val();
  socket.emit('join', {
    user: {
      id: name,
      name
    },
    type: 'join',
    message: '',
    data: {}
  });

  // 방에서 나오는 메시지 보여 주기
  socket.on('message', function(msg) {
    setMessage(msg.user.name, msg.message);
  });

  // 방에 연결 된 사용자 목록 보여 주기
  socket.on('connected', function(msg) {
    connectedUser(msg);
  });
}

function sendMessage(name, message) {
  socket.emit('message', { user: { name, id: name }, message });
}
