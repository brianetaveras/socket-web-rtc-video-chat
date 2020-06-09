import * as express from "express";
import * as socketIO from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import * as path from 'path';

export class Server {
    private httpServer: HTTPServer;
    private app: express.Application;
    private io: socketIO.Server;
    private users: Object;

    private readonly DEFAULT_PORT = 3000;

    constructor(){
        this.initialize();
        this.registerRoutes();
        this.appSetup();
        this.handleSocketConnections();
    }

    private initialize():void{
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = socketIO(this.httpServer);
        this.users = {};
    }

    private registerRoutes():void{
        this.app.get('/api', async (req, res, next) =>{
            res.send(`<h1>Herro</h1>`)
        })
    }

    private appSetup():void{
        this.app.use(express.static(path.join(__dirname, "./public")));
    }

    private handleSocketConnections():void{
        this.io.on('connection', socket =>{
            if(!this.users[socket.id]){
                this.users[socket.id] = {
                    id: socket.id,
                    name: `User #${Object.keys(this.users).length + 1}`
                }
            }

            socket.emit('yourID', socket.id);

            socket.on('callUser', ({to, signal, from}) =>{
                socket.to(to).emit('hey', {signal, from})
            })

            socket.on('acceptCall', ({signal, to, })=>{
                console.log('signal received...')
                socket.to(to).emit('callAccepted', signal);
            })

            socket.emit('updateUserList', this.users);
            socket.broadcast.emit('updateUserList', this.users);
            
            socket.on('disconnect', ()=>{
                delete this.users[socket.id];
                socket.broadcast.emit('updateUserList', this.users);
            });



            // socket.on('callFriend', ({data, to})=>{
            //     socket.to(to).emit('friendCalling', {
            //         data,
            //         socket: socket.id
            //     });
            // });

            // socket.on('answerCall', ({answer, to}) =>{
            //     socket.to(to).emit('callAnswered', {
            //         socket: socket.id,
            //         answer
            //     })
            // })
        })
    }

    public listen():void{
        this.httpServer.listen(this.DEFAULT_PORT, () =>{
            console.log(
                `Server running on http://localhost:${this.DEFAULT_PORT}`
            )
        })
    }

}


