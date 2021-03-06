import { Delegate } from 'shared/model/delegate';
import { AccountState, Address, PublicKey, TransactionId } from 'shared/model/types';
import { Stake } from 'shared/model/transaction';
import config from 'shared/config';

export enum AccountChangeAction {
    TRANSACTION_APPLY_UNCONFIRMED = 'TRANSACTION_APPLY_UNCONFIRMED',
    TRANSACTION_UNDO_UNCONFIRMED = 'TRANSACTION_UNDO_UNCONFIRMED',
    VIRTUAL_UNDO_UNCONFIRMED = 'VIRTUAL_UNDO_UNCONFIRMED',
    MONEY_RECEIVE = 'MONEY_RECEIVE',
    MONEY_RECEIVE_UNDO = 'MONEY_RECEIVE_UNDO',
    AIRDROP_REWARD_RECEIVE = 'AIRDROP_REWARD_RECEIVE',
    AIRDROP_REWARD_RECEIVE_UNDO = 'AIRDROP_REWARD_RECEIVE_UNDO',
    DISTRIBUTE_FEE = 'DISTRIBUTE_FEE',
    DISTRIBUTE_FEE_UNDO = 'DISTRIBUTE_FEE_UNDO',
}

export class AccountModel {
    address: Address;
    publicKey?: PublicKey;
    secondPublicKey?: PublicKey;
    actualBalance?: number = 0;
    delegate?: Delegate;
    votes?: Array<PublicKey>;
    referrals?: Array<Account>;
    stakes?: Array<Stake>;

    constructor(data: AccountModel) {
        Object.assign(this, data);
        this.votes = [...(data.votes || [])];
        this.referrals = [...(data.referrals || [])];
        this.stakes = (data.stakes || []).map(stake => new Stake({ ...stake }));
        this.delegate = data.delegate && new Delegate(data.delegate);
    }
}

export class Account extends AccountModel {

    history: Array<AccountState> = [];

    public getCopy(): Account {
        return new Account( { ...this, history: [] });
    }

    addHistory(action: AccountChangeAction, transactionId: TransactionId): void {
        if (!config.CORE.IS_HISTORY || !config.CORE.HISTORY.ACCOUNTS) {
            return;
        }

        this.history.push({
            action,
            state: this.getCopy(),
            transactionId: transactionId
        });
    }

    public getActiveStakes = (): Array<Stake> => {
        return this.stakes.filter(stake => stake.isActive);
    }
}
