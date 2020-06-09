

// Let's add all DOM elements here
const my_video = document.getElementById('my-video');
const friends_video = document.getElementById('friends-video');
const user_list = document.getElementById('user-list');
let sio = io.connect();
let stream;
let myId;
let callerInfo = {};
let alreadyInCall = false;


function addUserToList(user){
    const li = document.createElement('li');
    li.innerHTML = `${user.name}`

    li.addEventListener('click', () =>{
        callFriend(user.id);
    });

    return li;
}


navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(res =>{
    if(my_video){
        my_video.srcObject = res;
    }
    stream = res;
});

sio.on('yourID', (id) =>{
    myId = id;
});

sio.on('updateUserList', (users) =>{
    user_list.innerHTML = ``;
    for(const user in users){
        if(myId == users[user].id) continue;
        user_list.appendChild(addUserToList(users[user]));   
    }
});

sio.on('hey', (data)=>{
    callerInfo = {
        from: data.from,
        signal: data.signal
    }
    if(!alreadyInCall){
        alreadyInCall = true;
        acceptCall();
    }
  
});


async function callFriend(id){
    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on('signal', data =>{
          sio.emit('callUser', {to: id, signal: data, from: myId});
      });

      peer.on('stream', stream => {
          console.log('we streaming?')
          if(friends_video){
              friends_video.srcObject = stream;
              friends_video.play();
          }
      });

      sio.on('callAccepted', signal =>{
          console.log('signal received again')
          peer.signal(signal);
      })
}

function acceptCall(){
    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream
    });
    peer.on('signal', data =>{
        console.log('sending signal...')
        sio.emit('acceptCall', {signal: data, to: callerInfo.from});
    });

    peer.on('stream', stream =>{
        console.log('stream', stream)
        friends_video.srcObject = stream;
        friends_video.play();
    });

    peer.signal(callerInfo.signal);
}








