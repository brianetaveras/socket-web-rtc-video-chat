const socket = io();

// Let's add all DOM elements here
const my_video = document.getElementById('my-video');
const user_list = document.getElementById('user-list');

navigator.getUserMedia({video: true, audio: true}, stream =>{
    if(my_video){
        my_video.srcObject = stream;
    }
},
error=>{
    console.error(error.message);
}
)

socket.on('updateUserList', (users) =>{
    user_list.innerHTML = ``;
    for(const user in users){
        user_list.innerHTML += `
            <li>${users[user].name}</li>
        `
    }
})

