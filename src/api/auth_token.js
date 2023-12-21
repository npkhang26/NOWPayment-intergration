import axios from 'axios'
import {} from 'dotenv/config'

const API_HOST = process.env.API_HOST;
const EMAIL=process.env.EMAIL;
const PASSWORD=process.env.PASSWORD;

// Get Token
const get_auth_token = async () => {
    let response =  await axios({
        method: 'post',
        url: `${API_HOST}/v1/auth`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            email: EMAIL,
            password:  PASSWORD
        },
    });
    return response.data;
}
export {get_auth_token}
