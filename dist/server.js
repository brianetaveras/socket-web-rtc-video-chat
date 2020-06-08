"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Server = void 0;
var express = require("express");
var socketIO = require("socket.io");
var http_1 = require("http");
var path = require("path");
var Server = /** @class */ (function () {
    function Server() {
        this.DEFAULT_PORT = 3000;
        this.initialize();
        this.registerRoutes();
        this.appSetup();
        this.handleSocketConnections();
    }
    Server.prototype.initialize = function () {
        this.app = express();
        this.httpServer = http_1.createServer(this.app);
        this.io = socketIO(this.httpServer);
        this.users = {};
    };
    Server.prototype.registerRoutes = function () {
        var _this = this;
        this.app.get('/api', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.send("<h1>Herro</h1>");
                return [2 /*return*/];
            });
        }); });
    };
    Server.prototype.appSetup = function () {
        this.app.use(express.static(path.join(__dirname, "./public")));
    };
    Server.prototype.handleSocketConnections = function () {
        var _this = this;
        this.io.on('connection', function (socket) {
            _this.users[socket.id] = {
                id: socket.id,
                name: "User #" + (Object.keys(_this.users).length + 1)
            };
            socket.emit('updateUserList', _this.users);
            socket.broadcast.emit('updateUserList', _this.users);
            console.log("User #" + (Object.keys(_this.users).length + 1) + " joined the partey");
            socket.on('disconnect', function () {
                delete _this.users[socket.id];
                socket.broadcast.emit('updateUserList', _this.users);
            });
            socket.on('callFriend', function (_a) {
                var offer = _a.offer, to = _a.to;
                socket.to(to).emit('friendCalling', {
                    offer: offer,
                    socket: socket.id
                });
            });
            socket.on('answerCall', function (_a) {
                var answer = _a.answer, to = _a.to;
                socket.to(to).emit('callAnswered', {
                    socket: socket.id,
                    answer: answer
                });
            });
        });
    };
    Server.prototype.listen = function () {
        var _this = this;
        this.httpServer.listen(this.DEFAULT_PORT, function () {
            console.log("Server running on http://localhost:" + _this.DEFAULT_PORT);
        });
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=server.js.map