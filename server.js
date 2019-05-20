const express = require('express');
const path = require('path');
const axios = require('axios');
const redis = require('redis');
const app = express();


const bluebird = require('bluebird');
// make async to all node_redis functions to prevent callback hell
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const API_URL = 'http://data.fixer.io/api';
const ACCESS_KEY = 'access_key=86b4b2819a388fa0736904c6beb83b73';

app.use('/scripts', express.static(path.join(__dirname, '/node_modules/')));

app.get('/', (req, res) => {
    res.sendFile('index.html', {
        root: path.join(__dirname, 'views')
    });
});

app.get('/rate/:date', (req, res) => {
    const date = req.params.date;
    const url = `${API_URL}/${date}?symbols=USD,AUD,MYR,CAD,PHP,JPY&${ACCESS_KEY}`;
    
    const countKey = `EUR:${date}:count`;
    const ratesKey = `EUR:${date}:rates`;

    // callback hell
    // client.incr(countKey, (err, count) => {
    //     client.hgetall(ratesKey, function(err, rates) {
    //         if (rates) {
    //             return res.json({ rates, count });
    //         }

    //         axios.get(url).then(response => {
    //             client.hmset(ratesKey, response.data.rates, function(err, results) {
    //                 if (err) console.log(err);
    //             });

    //             return res.json({
    //                 count,
    //                 rates: response.data.rates
    //             })
    //         }).catch(error => {
    //             return res.json(error.response.data);
    //         });
    //     })
    // });

    // async Promise
    let count;
    client.incrAsync(countKey)
        .then(result => {
            count = result;
            return count;
        })
        .then(() => client.hgetallAsync(ratesKey))
        .then(rates => {
            if (rates) {
                return res.json({ rates, count });
            }

            axios.get(url).then(response => {
                client.hmsetAsync(ratesKey, response.data.rates)
                    .catch(e => {
                        console.log(e);
                    });

                return res.json({
                    count,
                    rates: response.data.rates
                });
            }).catch(err => res.json(err.response.data))
        }).catch(e => console.log(e));
});

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = redis.createClient(REDIS_URL);

client.on('connect', () => {
    console.log(`connected to redis`);
});;

client.on('error', err => {
    console.log(`Error: ${err}`);
});

const port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})