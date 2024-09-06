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

const app = express()

export const handler = app

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  
    if (req.url.startsWith('/api/v1/'))
    {
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
    if (!code)
    {
        let responseJson = 
        {
            status: 'invalid',
            message: 'Code is invalid.',
        };

        return res.end(JSON.stringify(responseJson));
    }

    let codeValid = true;
    if (!codeValid)
    {
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
    if (!token)
	{
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

app.post('/api/v1/player/signatureCheck', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');

    // check if user has our session token
	var token = req.cookies['JPCS_SESSION_TOKEN'];
    if (!token)
	{
        let responseJson = 
        {
            status: 'no_sign',
            message: 'Player has no signature.',
        };
        
        return res.end(JSON.stringify(responseJson));   
    }

    let responseJson = 
    {
        status: 'no_sign',
        message: 'Player has no signature.',
    };
    
    return res.end(JSON.stringify(responseJson));   

    /*let responseJson = 
    {
        status: 'signed',
        message: 'Player has signed.',
    };

    return res.end(JSON.stringify(responseJson));*/
});

app.post('/api/v1/player/submitSignature', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    
    // check if user has our session token
	var token = req.cookies['JPCS_SESSION_TOKEN'];
    if (!token)
	{
        let responseJson = 
        {
            status: 'invalid',
            message: 'Player signature invalid.',
        };
        
        return res.end(JSON.stringify(responseJson));   
    }

    /*let responseJson = 
    {
        status: 'invalid',
        message: 'Player signature invalid.',
    };
    
    return res.end(JSON.stringify(responseJson));  */ 

    let responseJson = 
    {
        status: 'verified',
        message: 'Player signature verified.',
    };

    return res.end(JSON.stringify(responseJson));
});

/** helper functions for those above */

/**
 * NOTE: We can use sqlite for this project.
 * an alternative would be sql or mariadb but that would be overkill.
 * or we can just store it in ram, but risk losing data in a crash etc.
 * or store it in bin files. i would do it but that would be overkill too. 
 * though i think, some hosting providers allow free sql database for a week or so.
 * so sql it is?
 */

// generate 4 letter capitalized code. make sure to check db if it's unique.
// and don't forget to link this to a specific user.
const generateCode = () => {
    // tyron can do this :DD
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

// check if code is valid, then return user data as an object.
const checkCode = (code: string) => {
    // tyron can do this too :DD

    // let data = getUserData(code, null);
    // if (!data) return null;

	code.toUpperCase();

	if (code.length < 1 || code.length > 4) return null;
}

// check if token is valid, then return user data as an object.
const checkToken = (token: string) => {
    // tyron can do this too :DD

    // let data = getUserData(null, token);
    // if (!data) return null;

	if (token.length < 0) return null;
}

