import { Filter } from 'shared/model/types';
import { Reward } from 'shared/model/reward';
import ResponseEntity from 'shared/model/response';
import { Account, AccountModel } from 'shared/model/account';
import { generateReferredUsers } from 'api/mock/referredUsers';

interface ReferredUsersService {
    getReferredUsers(address: string, filter: Filter): ResponseEntity<Array<AccountModel>>;

    getReferredUsersByLevel(address: string, level: number, filter: Filter): ResponseEntity<Array<AccountModel>>;
}

export class ReferredUsersServiceImpl implements ReferredUsersService {

    getReferredUsers(address: string, filter: Filter): ResponseEntity<Array<AccountModel>> {
        return new ResponseEntity({data: generateReferredUsers()});
    }

    getReferredUsersByLevel(address: string, level: number, filter: Filter): ResponseEntity<Array<AccountModel>> {
        return new ResponseEntity({data: generateReferredUsers()});
    }

}

export default new ReferredUsersServiceImpl();
