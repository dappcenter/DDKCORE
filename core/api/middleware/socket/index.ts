import { API_METHODS } from 'core/api/middleware/apiHolder';
import { Message, MessageType } from 'shared/model/message';
import { CONNECT_TO_CORE, MESSAGE_CHANNEL } from 'shared/driver/socket/channels';
import 'core/api/controller/transaction';
import { ResponseEntity } from 'shared/model/response';

export class SocketMiddleware {

    onConnect(socket: any) {
        socket.emit(CONNECT_TO_CORE, 'IS CONNECTED');
    }

    registerAPI(socket) {
        socket.on(MESSAGE_CHANNEL, (message: Message) => this.onMessage(message, socket));
    }

    onMessage(message: Message, socket: any) {

        const method = API_METHODS[message.code];

        if (method && typeof method === 'function' && message.headers.type === MessageType.REQUEST) {
            message.body = method(message, socket);
            message.headers.type = MessageType.RESPONSE;
            socket.emit(MESSAGE_CHANNEL, message);
        } else {
            const errors = new ResponseEntity({ errors: ['Invalid request'] });
            const errorMessage = new Message(MessageType.RESPONSE, message.code, errors, message.headers.id);
            socket.emit(MESSAGE_CHANNEL, errorMessage);
        }

    }
}

export default new SocketMiddleware();