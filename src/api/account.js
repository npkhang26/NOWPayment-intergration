import axios from 'axios'
import {} from 'dotenv/config'

const API_HOST = process.env.API_HOST;

// Create new user account
const create_account = async (username, auth_token) => {
    try {
        let response =  await axios({
            method: 'post',
            url: `${API_HOST}/v1/sub-partner/balance`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${auth_token}`
            },
            data: {
                name: username,
            },
        });
        return response.data;
    } catch (error) {  
        throw error.response.data; 
    }
}

// get user's balance 
const user_balance = async (api_key, user_id, currency='') => {
    try {
        let response =  await axios ({
            method: 'get',
            url: `${API_HOST}/v1/sub-partner/balance/${user_id}`,
            headers: {
                'x-api-key' : api_key,
            },
        });
        if (currency != '') return response.data.result.balances[currency];
        return response.data.result;
    } catch (error) {
        throw error; 
    }
}



export {create_account, user_balance}