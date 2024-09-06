/**
    This handler is basically a middleware.
    It will be called for every request in our site.
    Make sure to call next() as it will pass the request to the next handler.
    
    In development, flow is: handler -> vite middlewares
    In production, flow is: serve static files -> handler -> index.html

    For more information, check the repo at:
    https://github.com/egoist/vite-plugin-mix
    
    Note: This is a small project, we may have to improvise but this allows our
    project to be simplier and easier to maintain. We're not sure how this will
    compromise performance. We'll see how it goes.

    By: Coffee
    Date: 9/6/2024 12:00 AM
 */

import express, { Request, Response } from 'express'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { Database } from "bun:sqlite";

const app = express()

export const handler = app

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {

    if (req.url.startsWith('/api/v1/')) {
        let apiDebInfo =
            'API Request From \'' + req.headers['host'] + '\' -> ' + req.method + ' ' + req.originalUrl + '';

        console.log(apiDebInfo);
    }

    next()
})

/**
 * this route verifies code that the user has given us.
 * if the code is valid, we will return the user's data
 * and set the user's session cookie.
 * 
 * the session cookie will then be linked to the user's data
 * and their code. it will then be saved via database.
 *
 * in short, this logins a player.
 */
app.post('/api/v1/player/verifyCode', (req: Request, res: Response) => {

    res.setHeader('Content-Type', 'application/json');

    let code = req.body.code;
    if (!code) {
        let responseJson =
        {
            status: 'invalid',
            message: 'Code is invalid.',
        };

        return res.end(JSON.stringify(responseJson));
    }

    let codeValid = true;
    if (!codeValid) {
        let responseJson =
        {
            status: 'invalid',
            message: 'Code is invalid.',
        };

        return res.end(JSON.stringify(responseJson));
    }

    let token = 'TEST_TOKEN';

    let responseJson =
    {
        status: 'verified',
        message: 'Code is valid.',
        user_data: {
            username: 'CuteLasallian',
            name: 'John Doe',
            email: 'john_doe@dlsl.edu.ph',
            student_id: '2023364882',
            top_score: 100
        }
    };

    res.cookie('JPCS_SESSION_TOKEN', token, { httpOnly: true, sameSite: 'strict' });

    return res.end(JSON.stringify(responseJson));
});

/**
 * this route registers a user to db and returns a code
 * this should only be used by admin.
 * 
 * the user's data will be saved to the database.
 */
app.post('/api/v1/player/register', (req: Request, res: Response) => {

});

/**
 * if player has session token as cookie and refreshed the page, 
 * we will check if the token is valid and is registered.
 * we then return the player's data. 
 *
 * in short, this basically checks if player is logged in.
 */
app.post('/api/v1/player/checkToken', (req: Request, res: Response) => {

    res.setHeader('Content-Type', 'application/json');

    // check if user has our session token
    var token = req.cookies['JPCS_SESSION_TOKEN'];
    if (!token) {
        let responseJson =
        {
            status: 'invalid',
            message: 'Token is invalid.',
        };

        return res.end(JSON.stringify(responseJson));
    }

    // if token is valid, return user data
    let responseJson =
    {
        status: 'verified',
        message: 'Token is valid.',
        user_data: {
            username: 'CuteLasallian',
            name: 'John Doe',
            email: 'john_doe@dlsl.edu.ph',
            student_id: '2023364882',
            top_score: 100
        }
    };

    return res.end(JSON.stringify(responseJson));
});



// bun's built-in sqlite database
const db = new Database("database.sqlite");




/** helper functions for those above */

/**
 * NOTE: We can use sqlite for this project.
 * an alternative would be sql or mariadb but that would be overkill.
 * or we can just store it in ram, but risk losing data in a crash etc.
 * or store it in bin files. i would do it but that would be overkill too. 
 * though i think, some hosting providers allow free sql database for a week or so.
 * so sql it is?
 */

// valid characters
const CODE_POINTS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// generate 4 letter capitalized code. make sure to check db if it's unique.
// and don't forget to link this to a specific user.
export const generateCode = () => {
    // tyron can do this :DD

    // LUHN's mod n algorithm
    // https://en.wikipedia.org/wiki/Luhn_mod_N_algorithm

    const code = generateHumanReadableCode(6);

    let factor = 2;
    let sum = 0;
    let n = CODE_POINTS.length;

    // Starting from the right and working leftwards is easier since
    // the initial "factor" will always be "2"

    for (let i = code.length - 1; i >= 0; i--) {
        let codePoint = CODE_POINTS.indexOf(code.charAt(i));
        let addend = factor * codePoint;

        // Alternate the "factor" that each "codePoint" is multiplied by
        factor = (factor == 2) ? 1 : 2;

        // Sum the digits of the "addend" as expressed in base "n"
        addend = Math.floor(addend / n) + (addend % n);
        sum += addend;
    }

    // Calculate the number that must be added to the "sum"
    // to make it divisible by "n".
    const remainder = sum % n;
    const checkCodePoint = (n - remainder) % n;

    const checkCharacter = CODE_POINTS.charAt(checkCodePoint);

    return code + checkCharacter;
}

const generateHumanReadableCode = (length: number) => {
    const string = [];

    // base 36
    for (let i = 0; i < length; i++) {
        string.push(CODE_POINTS.charAt(Math.floor(Math.random() * 36)));
    }

    return string.join('');
}

// get user data from db, perform prepared sql statements here.
// either of param code or token should be valid
const getPlayerDataFromDB = (code: string, token: string) => {
    // don't use this directly for routes, use checkCode or checkToken instead.
    // for safety reasons. since codes or tokens have their own different parsing
    // kinemerut
}

// tyron, you decide. should we use token as main key or student id?
// which is more secure in this case?
const updatePlayerScore = (token: string) => {
}

// check if code is valid, returns true if valid, false if not.
export const checkCode = (code: string) => {
    // let data = getUserData(code, null);
    // if (!data) return null;

    // code length should be 6 + 1 (check character)
    if (code.length != 7) return false;

    let factor = 1;
    let sum = 0;
    let n = CODE_POINTS.length;

    // Starting from the right, work leftwards
    // Now, the initial "factor" will always be "1"
    // since the last character is the check character.
    for (let i = code.length - 1; i >= 0; i--) {
        let codePoint = CODE_POINTS.indexOf(code.charAt(i));
        let addend = factor * codePoint;

        // Alternate the "factor" that each "codePoint" is multiplied by
        factor = (factor == 2) ? 1 : 2;

        // Sum the digits of the "addend" as expressed in base "n"
        addend = (Math.floor(addend / n)) + (addend % n);
        sum += addend;
    }

    let remainder = sum % n;
    return remainder == 0;
}

// check if token is valid, then return user data as an object.
const checkToken = (token: string) => {
    // tyron can do this too :DD

    // let data = getUserData(null, token);
    // if (!data) return null;

    if (token.length < 0) return null;
}

