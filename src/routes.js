import { Router } from 'express';
import bodyParser from 'body-parser';
import * as controller from './controller.js';

const router = Router();

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json() );

router.post('/withdraw-ipn', controller.withdraw_ipn);

router.get('/deposit/estimate-payment', controller.estimate_payment);
router.get('/deposit/status', controller.deposit_status);
router.post('/deposit', controller.deposit);
router.post('/deposit-from-master', controller.master_deposit);

router.get('/withdraw/status',controller.withdraw_status);
router.post('/withdraw', controller.withdraw);
router.get('/transfer/status',controller.status_transfer);

router.get('/account/balance', controller.account_balance);
router.post('/account/create',controller.create_user);

router.post('/invoice', controller.create_invoice);
export {router};
