import axios from 'axios'
import {} from 'dotenv/config'
import {get_2fa_code} from '../verify_code.js'

const API_HOST = process.env.API_HOST;

// min amount for withdraw
const min_withdraw_amount = async (api_key, currency) => {
    try {
        let response =  await axios({
            method: 'get',
            url: `${API_HOST}/v1/payout-withdrawal/min-amount/${currency}`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key' : api_key,
            },
        });
        return response.data;
    } catch (err) {
        throw err.response.data; 
    };
};

// validate payout address
const validate_payout_address = async (api_key, payout_address, currency, extra_id=null) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/payout/validate-address`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key' : api_key,
            },
            data: {
                address: payout_address,
                currency: currency,
                extra_id: extra_id,
            },
        });
        if (response.data === 'OK') return true;
    } catch (error) {
        return false;
    }
}

// write off (move asset from user account to master account)
const write_off = async (api_key, user_id, currency, amount, auth_token) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/sub-partner/write-off`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            },
            data: {
                "currency": currency,
                "amount": amount,
                "sub_partner_id": user_id,
            },
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// create payout
const create_payout = async (api_key, withdrawals=[], ipn_callback_url="https://nowpayments.io", auth_token) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/payout`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            },
            data: {
                ipn_callback_url: ipn_callback_url,
                withdrawals: withdrawals,
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data; 
    }
}

// verify payout
const verify_payout = async (api_key, withdral_id, auth_token) => {
    try {
        let verfiy_code = get_2fa_code();
        let response = await axios({
            method: 'post',
            url: `${API_HOST}/v1/payout/${withdral_id}/verify`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            },
            data: {
                verification_code: verfiy_code,
            },
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// get payout status 
const payout_status = async (api_key, withdral_id, auth_token) => {
    try {
        let response = await axios({
            method: 'get',
            url: `${API_HOST}/v1/payout/${withdral_id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            }
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// get transfer status (write off status)
const transfer_status = async (api_key, transfer_id, auth_token) => { 
    try {
        let response = await axios({
            method: 'get',
            url: `${API_HOST}/v1/sub-partner/transfer/${transfer_id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            }
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}


export {min_withdraw_amount, validate_payout_address, write_off, create_payout, verify_payout, payout_status, transfer_status}

// try {
//     // const result = await deposit_payment('eth', 0.1, "1729540906");
//     // const result = await write_off('1729540906','eth', 0.2);
//     // const result = await create_payout([{
//     //     "address": "TEmGwPeRTPiLFLVfBxXkSP91yc5GMNQhfS",
//     //     "currency": "trx",
//     //     "amount": 200,
//     //     "ipn_callback_url": "https://nowpayments.io"
//     // }]);
//     const result = await user_balance('1729540906');
//     // let currency = 'bnbbsc';
//     // let a = result.balances[currency];
//     console.log(result);
    
//     // const [promise1, promise2] = await Promise.all([min_amount('usd','btc'),estimated_price('usd','btc',1)]);
//     // console.log(promise2.data, '\n');
// } catch (err) {
//     console.log(err);
// }