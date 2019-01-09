const sql = require('../sql/referal_sql');
let modules, library, self;

/**
 * Referral logic.
 * @class
 */
function Referral(logger, schema, db, account) {
    self = this;
    library = {
        db: db,
        logger: logger,
        schema: schema,
        account: account
    };
    return this;
}

Referral.prototype.bind = function () {
    modules = {

    };
};

Referral.prototype.create = async function (data, trs) {
    trs.recipientId = data.sender.address;
    trs.asset.referrals = [...data.referrals];
    trs.trsName = "REGISTER";
    return trs;
};

Referral.prototype.getBytes = function (trs) {
    return null;
};

Referral.prototype.verify = function (trs, sender, cb) {
    library.account.get({ address: trs.recipientId }, (err, account) => {
        if (account && account.global) {
            return setImmediate(cb, 'Account already exists.');
        }
        return setImmediate(cb);
    });
};

Referral.prototype.apply = function (trs, block, sender, cb) {
    library.db.none(sql.changeAccountGlobalStatus, {
        address: trs.recipientId,
        status: true
    }).then(() => {
        setImmediate(cb);
    }).catch((err) => {
        setImmediate(cb,err);
    });
};

Referral.prototype.undo = function (trs, block, sender, cb) {
    library.db.none(sql.changeAccountGlobalStatus, {
        address: trs.recipientId,
        status: false
    }).then(() => {
        setImmediate(cb);
    }).catch((err) => {
        setImmediate(cb,err);
    });
};

Referral.prototype.applyUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
};

Referral.prototype.undoUnconfirmed = function (trs, sender, cb) {
    setImmediate(cb);
};

Referral.prototype.schema = {
    id: 'Referral',
    type: 'object',
    properties: {
        address: {
            type: 'string',
            minLength: 1
        },
        level: {
            type: 'array'
        }
    },
    required: ['address', 'level']
};

Referral.prototype.dbRead = function (raw) {
    return {
        referrals: raw.ref_level ? raw.ref_level : [],
    };
};

Referral.prototype.dbTable = 'referals';

Referral.prototype.dbFields = [
    'address',
    'level'
];

Referral.prototype.dbSave = function (trs) {
    return {
        table: this.dbTable,
        fields: this.dbFields,
        values: {
            address: trs.recipientId,
            level: trs.asset.referrals.length ? `{${trs.asset.referrals.toString()}}` : null,
        }
    };
};

Referral.prototype.ready = function () {
    return true;
};

Referral.prototype.calculateFee = function () {
    return 0;
};

Referral.prototype.objectNormalize = function (trs) {
    return trs;
};

Referral.prototype.process = function (trs, sender, cb) {
    return setImmediate(cb, null, trs);
};

module.exports = Referral;

/*************************************** END OF FILE *************************************/