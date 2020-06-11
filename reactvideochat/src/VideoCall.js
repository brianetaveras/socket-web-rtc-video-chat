import Peer from 'simple-peer';

class VideoCall {
    constructor(userId, socket){
        this.userId = userId;
        this.socket = socket;
    }

    callPeer = (id, stream, setPartnerVideo) => {
        const peer = new Peer({
        initiator: true,
        trickle: false,
        config: {
            iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                urls: 'stun:global.stun.twilio.com:3478?transport=udp'
            }
            ],
            sdpSemantics: 'unified-plan'
        },
        stream: stream,
        });

        peer.on("signal", data => {
          this.socket.current.emit("callUser", { userToCall: id, signalData: data, from: this.userId })
        });

        peer.on("stream", stream => {
          setPartnerVideo(stream);
        });

        this.socket.current.on("callAccepted", signal => {
          peer.signal(signal);
        });
    }

  acceptCall = ( caller, setPartnerVideo, userStream ) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: userStream,
    });

    peer.on("signal", data => {
      this.socket.current.emit("acceptCall", { signal: data, to: caller.id })
    });

    peer.on("stream", stream => {
      setPartnerVideo(stream);
    });

    peer.signal(caller.signal);
  }
  
}

export default VideoCall;