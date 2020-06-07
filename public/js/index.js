navigator.getUserMedia({video: true, audio: true}, stream =>{
    const my_video = document.getElementById('my-video');
    if(my_video){
        my_video.srcObject = stream;
    }
},
error=>{
    console.error(error.message);
}
)