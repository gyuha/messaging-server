function setMessage(name, message, isAni = true) {
  var template = $('#template').html();
  var compiled = _.template(template);
  var html = compiled({ name, message });
  $('#messages').append(html);
  if (isAni) {
    $('#messages').animate({ scrollTop: $('#messages').prop('scrollHeight') }, 500);
  } else {
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }
}

function enterMessage() {
  var name = $('#name').val();
  var message = $('#input').val();
  sendMessage(name, message);
  $('#input').val('');
}

function changeChannel() {
  $('#messages').html('');
  var channel = $('#channel').val();
  axios.post('/channel/message/' + channel).then(res => {
    if (!res.data.result) return;
    for (let d of res.data.data) {
      setMessage(d.user.name, d.message, false);
    }
    connectRoom(channel);
  });
}

function connectedUser(data) {
  let me = $('#name').val();
  $('#connected').html('');
  for (var d of data.users) {
    let color = me == d.name ? 'is-danger' : 'is-primary';
    var btn =
      "  <a class='button is-small  " +
      color +
      "'> \
    <span class='icon is-small'> \
      <i class='fab fa-github'></i> \
    </span> \
    <span>" +
      d.name +
      '</span> \
  </a>';
    $('#connected').append(btn);
  }
}

$(function() {
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  $('#input').keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      enterMessage();
    }
  });

  $('#channel').keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
    }
  });

  $('#name').val(
    Math.random()
      .toString(36)
      .substring(7)
  );
  changeChannel();
});
