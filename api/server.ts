import { ApiSocketServer } from 'api/socket';
import { API_SOCKET_PORT, API_SOCKET_SERVER_CONFIG } from 'shared/config/socket';

const server = new ApiSocketServer(API_SOCKET_PORT, API_SOCKET_SERVER_CONFIG);
server.run();
