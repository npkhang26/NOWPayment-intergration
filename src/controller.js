import { get_auth_token } from './api/auth_token.js';
import {create_account, user_balance} from './api/account.js';
import {min_amount, estimated_price, deposit_payment, payment_status, deposit_from_master} from './api/deposit.js'
import {min_withdraw_amount, validate_payout_address, write_off, create_payout, verify_payout, payout_status, transfer_status} from './api/withdraw.js';
import { create_invoice } from './api/payment.js';


// DEPOSIT //
// [GET] estimate payment
const estimate_payment = async (req, res) => {
    try {
        let min_amount_res = await min_amount(req.headers.api_key, req.query.cur_from, req.query.cur_to);
        if (min_amount_res.min_amount > req.query.amount) 
            return res.status(400).json({
                "error" : "INVALID_AMOUNT",
                "msg" : "Amount is smaller than required minimum amount."
            });
        let estimate_data = await estimated_price(req.headers.api_key, req.query.cur_from, req.query.cur_to, req.query.amount);
        return res.json({"data" : estimate_data});
    } catch (error) {
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

// [POST] deposit
const deposit = async (req, res)=> {
    try {
        let auth_token_data = await get_auth_token();
        let min_amount_res = await min_amount(req.headers.api_key, req.body.currency);
        if (min_amount_res.min_amount > req.body.amount) 
            return res.status(400).json({
                "error" : "INVALID_AMOUNT",
                "msg" : `Amount is smaller than required minimum amount ${min_amount_res.min_amount}.`
            });
        let deposit_data =  await deposit_payment(req.headers.api_key, req.body.currency, req.body.amount, req.body.user_id, req.body.is_fixed_rate || false, auth_token_data.token)
        return res.json({"data" : deposit_data})
    } catch (error) {  
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

// [POST] master deposit
const master_deposit = async (req, res) => {
    try {
        let auth_token_data = await get_auth_token();
        // let min_amount_res = await min_amount(req.headers.api_key, req.body.currency);
        // if (min_amount_res.min_amount > req.body.amount) 
        //     return res.status(400).json({
        //         "error" : "INVALID_AMOUNT",
        //         "msg" : `Amount is smaller than required minimum amount ${min_amount_res.min_amount}.`
        //     });
        let master_deposit_data =  await deposit_from_master(req.headers.api_key, req.body.user_id, req.body.currency, req.body.amount, auth_token_data.token)
        return res.json({"data" : master_deposit_data})
    } catch (error) {  
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

// [GET] deposit status
const deposit_status = async (req, res) => {
    try {
        let status_data = await payment_status(req.headers.api_key, req.query.payment_id);
        return res.json({"data" : status_data})
    } catch (error) {
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};


// WITHDRAW //
// [POST] make withdrawal
const withdraw = async (req, res) => {
    try {
        let [check_payout_address, check_user_balance, min_amount, auth_token_data] = await Promise.all([
                validate_payout_address(req.headers.api_key, req.body.payout_address, req.body.currency),
                user_balance(req.headers.api_key, req.body.user_id, req.body.currency),
                min_withdraw_amount(req.headers.api_key, req.body.currency),
                get_auth_token()
            ]);
        if (!check_payout_address)
            return res.status(400).json({
                "error" : "INVALID_ADDRESS",
                "msg" : "Invalid payout address."
            });
        if (!check_user_balance) 
            return res.status(400).json({
                "error" : "INVALID_CURRENCY",
                "msg" : `Not get the suitable currency in this assest (${req.body.currency}).`
            });
        if (!min_amount.success || min_amount.result > req.body.amount)
            return res.status(400).json({
                "error" : "INVALID_AMOUNT",
                "msg" : `Required amount ${req.body.amount} is smaller than minimal amount (${min_amount.result}).`
            });
        if (req.body.amount > 0 && check_user_balance.amount - check_user_balance.pendingAmount < req.body.amount) 
            return res.status(400).json({
                "error" : "INVALID_AMOUNT",
                "msg" : `Required amount (${req.body.amount}) is larger than avaiable amount (${check_user_balance.amount - check_user_balance.pendingAmount}).`
            });
        
        let write_off_data = await write_off(req.headers.api_key, req.body.user_id, req.body.currency, req.body.amount, auth_token_data.token) ;

        // wait for write off success
        while (true) {
            let transfer_status_data = await transfer_status(req.headers.api_key, write_off_data.result.id, auth_token_data.token);
            console.log(transfer_status_data);
            console.log(transfer_status_data.result.status);
            if (transfer_status_data.result.status === "FINISHED") break;
            else if (transfer_status_data.result.status === "REJECTED") {
                return res.status(400).json({
                    "error" : "WRITE_OFF_FAILED",
                    "msg" : "WRITE_OFF_FAILED",
                });
            } 
        }

        let create_payout_data = await create_payout(
            req.headers.api_key,
            [{
                "address": req.body.payout_address,
                "currency": req.body.currency,
                "amount": req.body.amount,
                "ipn_callback_url": req.body.ipn_callback_url || "https://nowpayments.io",
            }], 
            req.body.ipn_callback_url || "https://nowpayments.io",
            auth_token_data.token,
        );
        let verify_payouyt_data = await verify_payout(req.headers.api_key, create_payout_data.id, auth_token_data.token);
        return res.json({"data" : create_payout_data});
    } catch (error) {
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
}

// [GET] withdraw status
const withdraw_status = async (req, res) => {
    try {
        let auth_token_data = await get_auth_token();
        let status_data = await payout_status(req.headers.api_key, req.query.withdraw_id, auth_token_data.token);
        return res.json({"data" : status_data})
    } catch (error) {
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

// [GET] transfer status
const status_transfer = async (req, res) => {
    try {
        let auth_token_data = await get_auth_token();
        let status_data = await transfer_status(req.headers.api_key, req.query.transfer_id, auth_token_data.token);
        return res.json({"data" : status_data})
    } catch (error) {
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};


// ACCOUNT //
// [POST] create user 
const create_user = async (req, res) => {
    try {
        let auth_token_data = await get_auth_token();
        let account_data =  await create_account(req.body.username, auth_token_data.token);
        return res.json({"data" : account_data})
    } catch (error) {  
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

// [GET] user's balance
const account_balance = async (req, res) => {
    try {
        let account_balance = await user_balance(req.headers.api_key, req.query.user_id, req.query.currency || '')
        return res.json({"data" : account_balance})
    } catch (error) {  
        return res.status(400).json({
            "error" : error.code,
            "msg" : error.message,
        });
    }
};

const withdraw_ipn = async(req, res) => {
    console.log("IPN");
    console.log(req.body);
    // if (req.body.status == 'finished') 
    
}

// [POST] create invoice
// const create_invoice = async(req, res) => {

// };

export {estimate_payment, deposit, master_deposit, deposit_status, withdraw, withdraw_status, status_transfer, create_user, account_balance, withdraw_ipn, create_invoice}