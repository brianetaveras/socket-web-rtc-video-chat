import React, {useState, useEffect, useRef} from 'react';
import VideoCall from './VideoCall';
import io from "socket.io-client";

const Video = props => {
    const [streamState, setStreamState] = useState({
        stream: false,
        active: false
    });
    
    const videoRef = useRef();
  
    useEffect(() => { 
      if( streamState.stream ){
        videoRef.current.srcObject = streamState.stream;
      }
    }, [streamState.stream]);

    useEffect(() => { 
      if( props.stream ){
        console.log('Whipple fuck')
        console.log( props.stream )
        setStreamState({ stream: props.stream, active: true });
      }
    }, [props.stream]);

    const startStream = async () => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
            setStreamState({stream: newStream, active: true});
            props.setUserStream(newStream);
        } catch(err){
            console.error(err);
        }
    }

    const stopStream = () => {
        streamState.stream.getTracks().forEach(track => track.stop());
        setStreamState({...streamState, active: false})
    }

    const handleClick = () => {
        streamState.active ? stopStream() : startStream();
    }

    return (
        <div className="stream-block user-stream">
            <video style={{'background': 'black'}} ref={ videoRef } autoPlay playsInline muted controls></video>
           { props.user === 'self' && <button onClick={ handleClick }>{ streamState.active ? 'Stop' : 'Start' } Video </button> }
        </div>
    );
}


const Caller = props => {
    const handleAnswer = e => {
        e.preventDefault();
        props.answer( props.caller, props.answerCallback, props.userStream );
    }
    return(
        <>
            <button value={ props.caller.id } onClick={handleAnswer} >Answer</button>
        </>
    );
}

const Available = props => {
    console.log( props.callPeer )
    const handleCall = e => {
        e.preventDefault();
        props.callPeer( e.target.value, props.userStream ,props.setPartnerStream );
    }
    return (
        <ul>
            { props.available.map( user => <button key={ user } value={ user } onClick={ handleCall }>Call User</button> ) }
        </ul>
    );
}


const Chat = () => {
    const [chatSession, setChatSession] = useState({
        partnerStream: null,
        partnerData: null,
        userStream: null
    });

    const [callData, setCallData] = useState({
        receivingCall: false,
        caller: {
            id: '',
            name: '',
            signal: null,
            stream: false
        },
        callAccepted: false,
    });

    const [ usersOnline, updateOnline ] = useState({})

    const [callController, setCallController] = useState(false);

    const socket = useRef();

    const setUserStream = stream => setChatSession({...chatSession, userStream: stream});
    const setPartnerStream = stream => setChatSession({...chatSession, partnerStream: stream})

    useEffect(() => {
        socket.current = io.connect('http://localhost:8000');//("https://65956de79733.ngrok.io/");
    
        socket.current.on("init", (id) => {
          const vidCall = new VideoCall(id, socket);
          setCallController( vidCall );
        })

        socket.current.on("usersOnline", (users) => {
            console.log(users)
          updateOnline({...users});
        })
    
        socket.current.on("callRequest", (data) => {
            console.log('calling')
            console.log(data);
          setCallData({...callData, caller: { 
              id: data.from, name: data.from, signal: data.signal 
            }
           });
        });
      }, []);

    return ( 
        <div>
            <Video user='self' setUserStream={setUserStream} />
            { chatSession.partnerStream && <Video user={callData.caller} stream={chatSession.partnerStream} callController={callController} /> }
            { callData.caller.signal && <Caller  caller={ callData.caller } answer={ callController.acceptCall } userStream={ chatSession.userStream } answerCallback={ setPartnerStream } /> }
            { callController && <Available available={ Object.keys(usersOnline) } userStream={ chatSession.userStream } callPeer={ callController.callPeer } setPartnerStream={ setPartnerStream } /> }
        </div>
    );
}

export default Chat;