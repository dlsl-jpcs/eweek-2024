import axios, { AxiosRequestConfig } from "axios";

export const SERVER_URL = "http://localhost:3000";

// Set to true to enable debug mode
// This will ignore the signature check and token check
const DEBUG = false;

export interface PlayerData {
    id: number;
    username: string;
    name: string;
    email: string;
    student_id: string;
    top_score: number;
    is_facilitator: boolean;
    has_signed: boolean;
    course: string;
    section: string;
    code: string;
}

export async function signatureCheck(): Promise<boolean> {

    if (DEBUG) {
        return true;
    }

    interface Response {
        status: string,
        message: string
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }
    return axios.post(SERVER_URL + "/api/v1/player/signatureCheck", {}, config)
        .then((response) => {
            const data = response.data as Response;
            return data.status === "signed";
        })
        .catch((error) => {
            console.log(error);
            return false;
        });
}

export type TokenCheckResponse = {
    status: string,
    message: string,
    user_data: PlayerData
}

export async function tokenCheck(): Promise<TokenCheckResponse> {
    if (DEBUG) {
        return {
            status: "verified",
            message: "Debug mode",
            user_data: {
                id: 1,
                username: "debug",
                name: "debug",
                email: "debug@debug.edu.ph",
                student_id: "debug",
                top_score: 0,
                is_facilitator: false,
                has_signed: false,
                course: "debug",
                section: "debug",
                code: "debug"
            }
        };
    }
    interface Response {
        status: string,
        message: string,
        user_data: PlayerData
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }

    return axios.post(SERVER_URL + "/api/v1/player/checkToken", {}, config)
        .then((response) => {
            const data = response.data as Response;
            return {
                status: data.status,
                message: data.message,
                user_data: data.user_data
            };
        });
}

export async function codeCheck(code: string): Promise<boolean> {
    if (DEBUG) {
        return true;
    }

    interface Response {
        status: string,
        message: string,
        user_data: PlayerData
    }

    interface Request {
        code: string
    }

    const request: Request = {
        code: code
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }

    console.log('Checking Code: ' + code);

    return axios.post(SERVER_URL + "/api/v1/player/verifyCode", request, config)
        .then((response) => {
            const data = response.data as Response;
            console.log(data);

            return data.status === "verified";
        });
}


// TODO: Upload the signature to the server
export async function submitSignature(signatureBase64: string) {

    interface Response {
        status: string,
        message: string
    }

    interface Request {
        signatureBase64: string
    }

    const request: Request = {
        signatureBase64: signatureBase64
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }

    console.log('Submitting Signature in Base64 Format: ' + signatureBase64);

    return axios.post(SERVER_URL + "/api/v1/player/submitSignature", request, config)
        .then((response) => {
            const data = response.data as Response;
            console.log(data);
            return data.status === "verified";
        })
        .catch((error) => {
            console.log(error);
            return false;
        });
}