import speakeasy from 'speakeasy';
import {} from 'dotenv/config'

const SECRET_2FA = process.env.SECRET_2FA;

const get_2fa_code = () => {
    return speakeasy.totp({
        secret : SECRET_2FA,
        encoding: 'base32',
    });
}

// console.log(get_2fa_code());
export {get_2fa_code}
