import axios from 'axios'
import {} from 'dotenv/config'

const API_HOST = process.env.API_HOST;

const create_invoice = async (api_key, ) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/invoice`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key' : api_key,
            },
            data: {
                price_amount,
                pay_currency,
                ipn_callback_url,
                order_id,
                success_url,
                cancel_url,
                is_fixed_rate,
                is_fee_paid_by_user,
            },
        });
        let data = response.data;
        data.payment_url = `https://nowpayments.io/payment/?iid=${data.invoice_id}&paymentId=${data.payment_id}`;
        return data;
    } catch (error) {  
        throw error.response.data; 
    }
};


export {create_invoice}