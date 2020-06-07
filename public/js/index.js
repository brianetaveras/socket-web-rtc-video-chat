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

function callFriend(id){
    console.log(id);
}

function addUserToList(user){
    const li = document.createElement('li');
    li.innerHTML = `${user.id}`

    
    li.addEventListener('click', () =>{
        callFriend(user);
    });

    return li;
}

socket.on('updateUserList', (users) =>{
    user_list.innerHTML = ``;
    for(const user in users){
        user_list.appendChild(addUserToList(users[user]));
        
    }
});




