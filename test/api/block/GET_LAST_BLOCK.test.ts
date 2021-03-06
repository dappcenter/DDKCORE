import { Fixture } from 'test/api/base/fixture';
import { Message } from 'shared/model/message';
import { expect } from 'chai';
import { ResponseEntity } from 'shared/model/response';
import { API_ACTION_TYPES } from 'shared/driver/socket/codes';
import { getSocket } from 'test/api/base';


describe('Test GET_LAST_BLOCK', () => {

    it('Positive', (done) => {
        const HEADERS = Fixture.getBaseHeaders();
        const REQUEST = {
            headers: HEADERS,
            code: API_ACTION_TYPES.GET_LAST_BLOCK,
            body: {}
        };

        const socket = getSocket();
        socket.emit('message', REQUEST);
        socket.on('message', (response: Message<ResponseEntity<any>>) => {
                if (response.headers.id === HEADERS.id) {
                    expect(response.body.success).to.equal(true);
                    expect(response.body.data).to.deep.equal({
                        id: 'cbb9449abb9672d33fa2eb200b1c8b03db7c6572dfb6e59dc334c0ab82b63ab0',
                        version: 1,
                        height: 1,
                        transactionCount: 24,
                        amount: 4797000000000000,
                        fee: 482700000000,
                        payloadHash: '7e6ba6ec459d96207414f61b67ecd2ecd8c946507bb102a1e47a0ce987e494d0',
                        generatorPublicKey: 'f4ae589b02f97e9ab5bce61cf187bcc96cfb3fdf9a11333703a682b7d47c8dc2',
                        signature: 'd664da064f083be23d8845c3dc2572342dfbb3a04c037205d3fee8a973dd' +
                            '7a73dfb1e6dafcdb06b9738c9d7be4f0e5e98f237187f055edb8c307d6cbfa457207',
                        transactions: [],
                        relay: 0,
                        createdAt: 0,
                        previousBlockId: null
                    });
                    socket.close();
                    done();
                }
            }
        );
    });
});
