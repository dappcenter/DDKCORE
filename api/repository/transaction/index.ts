import { IAsset, IAssetVote, Transaction, TransactionType } from 'shared/model/transaction';
import db from 'shared/driver/db';
import query from 'api/repository/transaction/query';
import { DEFAULT_COUNT, Sort } from 'shared/util/common';
import SharedTransactionPGRepo from 'shared/repository/transaction/pg';
import { toSnakeCase } from 'shared/util/util';
import { isFiltered } from 'shared/util/filter';

type AllowedFilters = {
    blockId?: string;
    senderPublicKey?: string;
    type?: number;
    recipientAddress?: string;
    asset?: string;
    height?: number;
};

const UPDATE_TRANSACTIONS_COUNT_INTERVAL = 30000;

class TransactionPGRepository {
    private transactionsCount: number;

    constructor() {
        this.transactionsCount = 0;

        this.updateTransactionsCount();
        setInterval(this.updateTransactionsCount, UPDATE_TRANSACTIONS_COUNT_INTERVAL);
    }

    private async updateTransactionsCount(): Promise<void> {
        const result = await db.oneOrNone(query.getTransactionsCount);
        if (result) {
            this.transactionsCount = Number(result.count);
        }
    }

    async getOne(id: string): Promise<Transaction<IAsset> | null> {
        const transaction = await db.oneOrNone(query.getTransaction, { id });
        return transaction ? SharedTransactionPGRepo.deserialize(transaction) : null;
    }

    async getMany(
        filter: AllowedFilters,
        sort: Array<Sort>,
        limit: number,
        offset: number,
    ): Promise<{ transactions: Array<Transaction<IAsset>>, count: number }> {
        let getTransactionsQuery: string;
        if (filter && filter.recipientAddress) {
            filter.asset = `{"recipientAddress": "${filter.recipientAddress}"}`;
            delete filter.recipientAddress;
            getTransactionsQuery = query.getTransactionsByAsset(
                filter, sort.map(elem => `${toSnakeCase(elem[0])} ${elem[1]}`).join(', '),
            );
        } else {
            getTransactionsQuery = query.getTransactions(
                filter, sort.map(elem => `${toSnakeCase(elem[0])} ${elem[1]}`).join(', '),
            );
        }

        const transactions = await db.manyOrNone(getTransactionsQuery, {
            ...filter,
            limit,
            offset,
        });


        let transactionsCount;

        if (isFiltered(filter)) {
            if (isFiltered(filter, new Set['type'])) {
                transactionsCount = DEFAULT_COUNT;
            } else {
                transactionsCount = transactions[0].count;
            }
        } else {
            transactionsCount = this.transactionsCount;
        }


        if (transactions && transactions.length) {
            return {
                transactions: transactions.map(trs => SharedTransactionPGRepo.deserialize(trs)),
                count: transactionsCount
            };
        }

        return {
            transactions: [],
            count: 0,
        };

    }

    async getVotesWithStakeReward(senderPublicKey: string, limit: number, offset: number):
        Promise<{ transactions: Array<Transaction<IAssetVote>>, count: number }> {
        const transactions = await db.manyOrNone(query.getVotesWithStakeReward, {
            senderPublicKey,
            voteType: TransactionType.VOTE,
            limit,
            offset,
        });

        if (transactions && transactions.length) {
            return {
                transactions: transactions.map(
                    trs => SharedTransactionPGRepo.deserialize(trs) as Transaction<IAssetVote>
                ),
                count: Number(transactions[0].count),
            };
        }

        return {
            transactions: [],
            count: 0,
        };
    }
}

export default new TransactionPGRepository();
