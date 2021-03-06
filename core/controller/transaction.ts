import { ON } from 'core/util/decorator';
import { BaseController } from 'core/controller/baseController';
import { logger } from 'shared/util/logger';
import { IAsset, Transaction } from 'shared/model/transaction';
import TransactionQueue from 'core/service/transactionQueue';
import TransactionService from 'core/service/transaction';
import TransactionPool from 'core/service/transactionPool';
import { Account } from 'shared/model/account';
import AccountRepo from 'core/repository/account';
import SharedTransactionRepo from 'shared/repository/transaction';
import { createKeyPairBySecret } from 'shared/util/crypto';
import { ResponseEntity } from 'shared/model/response';
import { CreateTransactionParams } from 'core/controller/types';
import config from 'shared/config';
import { ActionTypes } from 'core/util/actionTypes';
import { PeerAddress } from 'shared/model/types';
import RoundService from 'core/service/round';
import SyncService from 'core/service/sync';

type TransactionReceiveData = {
    data: Transaction<IAsset>,
    peerAddress: PeerAddress
};

class TransactionController extends BaseController {

    @ON(ActionTypes.TRANSACTION_RECEIVE)
    public onReceiveTransaction(response: TransactionReceiveData): void {
        
        const transaction = response.data;
        
        if (!RoundService.getMySlot()) {
            SyncService.sendUnconfirmedTransaction(transaction);
            return;
        }

        const validateResult = TransactionService.validate(transaction);
        if (!validateResult.success) {
            return;
        }

        if (TransactionPool.has(transaction)) {
            return;
        }

        const sender: Account = AccountRepo.getByAddress(transaction.senderAddress);
        if (!sender) {
            AccountRepo.add({
                publicKey: transaction.senderPublicKey,
                address: transaction.senderAddress
            });
        } else if (!sender.publicKey) {
            sender.publicKey = transaction.senderPublicKey;
        }

        TransactionQueue.push(transaction);
    }

    // TODO: extract this somewhere and make it async
    public transactionCreate(data: CreateTransactionParams) {
        if (config.CORE.IS_DISABLED_TRANSACTION_CREATION) {
            return new ResponseEntity({ errors: ['Transaction creation on core is disabled'] });
        }

        const keyPair = createKeyPairBySecret(data.secret);
        const secondKeyPair = data.secondSecret ? createKeyPairBySecret(data.secondSecret) : undefined;

        const responseTrs = TransactionService.create(data.trs, keyPair, secondKeyPair);
        if (responseTrs.success) {
            const validateResult = TransactionService.validate(responseTrs.data);
            if (!validateResult.success) {
                logger.debug(
                    `[RPC][TransactionController][transactionCreate] Validation of ${responseTrs.data} failed`
                );
                return new ResponseEntity({ errors: validateResult.errors });
            }
            TransactionQueue.push(responseTrs.data);
            return new ResponseEntity({ data: SharedTransactionRepo.serialize(responseTrs.data) });
        }
    }

}

export default new TransactionController();
