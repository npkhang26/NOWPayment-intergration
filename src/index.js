import express from 'express';
import { router } from './routes.js';
import bodyParser from 'body-parser';
import morgan from 'morgan';
const app = express();
const port = 4000; 

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json() );
app.use('/', router);
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
