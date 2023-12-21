import axios from 'axios'
import {} from 'dotenv/config'

const API_HOST = process.env.API_HOST;

// Get minimum payment amount
const min_amount = async (api_key, cur_from, cur_to='', fiat_equivalent='usd', is_fixed_rate=false, is_fee_paid_by_user=false) => {
    try {
        let response =  await axios ({
            method: 'get',
            url: `${API_HOST}/v1/min-amount`,
            headers: {
                'x-api-key' : api_key,
            },
            params: {
                currency_from : cur_from,
                currency_to: cur_to,
                fiat_equivalent : fiat_equivalent,
                is_fixed_rate : is_fixed_rate,
                is_fee_paid_by_user : is_fee_paid_by_user,
            }
        });
        return response.data;
    } catch (err) {
        throw err.response.data; 
    };
}

// Get the estimate of the total amount in crypto
const estimated_price = async (api_key, cur_from, cur_to, amount) => {
    try {
        let response = await axios({
            method: 'get',
            url: `${API_HOST}/v1/estimate`,
            headers: {
                'x-api-key' : api_key,
            },
            params: {
                amount: amount,
                currency_from : cur_from,
                currency_to: cur_to,
            }
        });
        return response.data;
    } catch (error) {
        throw error.response.data; 
    }
}

// Deposit with payment
const deposit_payment = async (api_key, currency, amount, user_id, is_fixed_rate=false, auth_token) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/sub-partner/payment`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            },
            data: {
                currency: currency,
                amount: amount,
                sub_partner_id: user_id,
                is_fixed_rate: is_fixed_rate,
            },
        });
        let data = response.data;
        data.payment_url = `https://nowpayments.io/payment/?iid=${data.invoice_id}&paymentId=${data.payment_id}`;
        return data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// Deposit from master account
const deposit_from_master = async (api_key, user_id, currency, amount, auth_token) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/sub-partner/deposit`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`,
                'x-api-key' : api_key,
            },
            data: {
                currency: currency,
                amount: amount,
                sub_partner_id: user_id,
            },
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// get payment status
const payment_status = async (api_key, payment_id) => {
    try {
        let response = await axios ({
            method: 'get',
            url: `${API_HOST}/v1/payment/${payment_id}`,
            headers: {
                'x-api-key' : api_key,
            },
        });
        let data = response.data;
        data.payment_url = `https://nowpayments.io/payment/?iid=${data.invoice_id}&paymentId=${data.payment_id}`;
        return data;
    } catch (error) {
        throw error.response.data; 
    }
}

// const result = await deposit_payment('bnbbsc', 0.0005, '1729540906');
// const result = await payment_status('4715415227');
// console.log(result);

export {min_amount, estimated_price, deposit_payment, payment_status, deposit_from_master}