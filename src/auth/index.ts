import axios, { AxiosRequestConfig } from "axios";

export const SERVER_URL = "http://localhost:5173";

// Set to true to enable debug mode
// This will ignore the signature check and token check
const DEBUG = true;

export async function signatureCheck(): Promise<boolean> {

    if (DEBUG) {
        return false;
    }

    interface Response {
        status: string,
        message: string
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
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
    user_data: {
        username: string,
        name: string,
        email: string,
        student_id: string,
        top_score: number
    }
}

export async function tokenCheck(): Promise<TokenCheckResponse> {
    if (DEBUG) {
        return {
            status: "verified",
            message: "Debug mode",
            user_data: {
                username: "debug",
                name: "debug",
                email: "debug",
                student_id: "debug",
                top_score: 0
            }
        };
    }
    interface Response {
        status: string,
        message: string,
        user_data: {
            username: string,
            name: string,
            email: string,
            student_id: string,
            top_score: number
        }
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    return axios.post(SERVER_URL + "/api/v1/player/checkToken", {}, config)
        .then((response) => {
            const data = response.data as Response;
            return {
                status: data.status,
                message: data.message,
                user_data: {
                    username: data.user_data.username,
                    name: data.user_data.name,
                    email: data.user_data.email,
                    student_id: data.user_data.student_id,
                    top_score: data.user_data.top_score
                }
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
        user_data: {
            username: string,
            name: string,
            email: string,
            student_id: string,
            top_score: number
        }
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
        }
    }

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
        code: string
    }

    const request: Request = {
        code: ''
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    return axios.post("http://localhost:5173/api/v1/player/submitSignature", request, config)
        .then((response) => {
            const data = response.data as Response;
            console.log(data);
            return data.status === "verified";
        });
}