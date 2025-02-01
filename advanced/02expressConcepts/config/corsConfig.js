
const cors = require('cors');

const configureCors = () => {

    return cors({
        // origin: which origin are allowed to access this api
        origin: (origin, callback) => {
            const allowedOrigins = [
                'http://localhost:3000', //local dev
                'http://your-custom-domain.com', //production domain
            ]

            if(!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true); //giving permission so that request can be allowed
            }else{
                callback(new Error('Not allowed by CORS'))
            }
        },

        // which http mehtods are you allowing users
        methods: ['GET', 'POST', 'PUT', 'DELETE'],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept-Version',
        ],

        exposedHeaders: [ //all headers that can be exposed to the client during the response (not request)
            'X-Total-Count',
            'Conten-Range'
        ],

        credentials: true, //enables supports for cookies and authorization headers

        preflightContinue: false, //if false: CORS middleware will handle preflight requests automatically. 

        maxAge: 600, //preflight requests will be cached for 600 seconds (10 minutes). Helps avoid sending option request multiple times

        optionsSuccessStatus: 204 //some legacy browsers (IE11, various SmartTVs) choke on 204
    })
}

module.exports = { configureCors };