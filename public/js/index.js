const sio = io();
const {RTCPeerConnection, RTCSessionDescription} = window;
const peerConnection = new RTCPeerConnection();
// Let's add all DOM elements here
const my_video = document.getElementById('my-video');
const friends_video = document.getElementById('friends-video');
const user_list = document.getElementById('user-list');

navigator.getUserMedia({video: true, audio: true}, stream =>{
    if(my_video){
        my_video.srcObject = stream;
    }
    stream.getTracks().forEach(track =>{
        peerConnection.addTrack(track, stream);
    })

    peerConnection.ontrack = function({streams: [stream]}) {
        if(friends_video){
            friends_video.srcObject = stream;
        }
    }
},
error=>{
    console.error(error.message);
}
);


async function callFriend({id}){
    const offer =  await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    sio.emit('callFriend', {
        offer,
        to: id
    })
}

function addUserToList(user){
    const li = document.createElement('li');
    li.innerHTML = `${user.id}`

    
    li.addEventListener('click', () =>{
        callFriend(user);
    });

    return li;
}

sio.on('updateUserList', (users) =>{
    user_list.innerHTML = ``;
    for(const user in users){
        user_list.appendChild(addUserToList(users[user]));
        
    }
});

sio.on('friendCalling', async ({offer, socket}) =>{ 
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    if(confirm('Someone is calling you. Want to answer?')){
        sio.emit('answerCall', {
            answer,
            to: socket
        });


    } else {
        // do nothing?
    }
});

sio.on('callAnswered', async ({socket, answer}) =>{
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
    );

    callFriend({id: socket});
})






