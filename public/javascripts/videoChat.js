// initializing RTCMultiConnection constructor.
var connection = new RTCMultiConnection();

connection.body = document.getElementById('container');

// using reliable-signaler
var signaler = initReliableSignaler(connection, '/');

connection.session = {
  audio: true,
  video: true,
  data: true
};

connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true
};

var videoConstraints = {
  mandatory: {
    maxWidth: 1920,
    maxHeight: 1080,
    minAspectRatio: 1.77,
    minFrameRate: 3,
    maxFrameRate: 64
  },
  optional: []
};

var audioConstraints = {
  mandatory: {
    // echoCancellation: false,
    // googEchoCancellation: false, // disabling audio processing
    // googAutoGainControl: true,
    // googNoiseSuppression: true,
    // googHighpassFilter: true,
    // googTypingNoiseDetection: true,
    // googAudioMirroring: true
  },
  optional: []
};

connection.mediaConstraints = {
  video: videoConstraints,
  audio: audioConstraints
};

document.getElementById('open').onclick = function() {
  var sessionid = document.getElementById('session-id').value;
  if (sessionid.replace(/^\s+|\s+$/g, '').length <= 0) {
    alert('Please enter session-id');
    document.getElementById('session-id').focus();
    return;
  }

  this.disabled = true;

  connection.channel = connection.sessionid = connection.userid = sessionid;
  connection.open({
    onMediaCaptured: function() {
      signaler.createNewRoomOnServer(connection.sessionid);
    }
  });
};

document.getElementById('join').onclick = function() {
  var sessionid = document.getElementById('session-id').value;
  if (sessionid.replace(/^\s+|\s+$/g, '').length <= 0) {
    alert('Please enter session-id');
    document.getElementById('session-id').focus();
    return;
  }

  this.disabled = true;
  signaler.getRoomFromServer(sessionid, function(sessionid) {
    connection.channel = connection.sessionid = sessionid;
    connection.join({
      sessionid: sessionid,
      userid: sessionid,
      extra: {},
      session: connection.session
    });
  });
};

document.getElementById('share-file').onclick = function() {
  var fileSelector = new FileSelector();
  fileSelector.selectSingleFile(function(file) {
    connection.send(file);
  });
};

connection.onopen = function() {
  document.getElementById('share-file').disabled = false;
  document.getElementById('input-text-chat').disabled = false;
};

document.getElementById('input-text-chat').onkeyup = function(e) {
  if(e.keyCode != 13) return;

  // removing trailing/leading whitespace
  this.value = this.value.replace(/^\s+|\s+$/g, '');

  if (!this.value.length) return;

  connection.send(this.value);
  appendDIV(this.value);
  this.value =  '';
};

connection.onmessage = appendDIV;

var chatContainer = document.querySelector('.chat-output');

// a custom method used to append a new DIV into DOM
function appendDIV(event) {
  var div = document.createElement('div');
  div.innerHTML = event.data || event;
  chatContainer.insertBefore(div, chatContainer.firstChild);
  div.tabIndex = 0; div.focus();

  document.getElementById('input-text-chat').focus();
}
