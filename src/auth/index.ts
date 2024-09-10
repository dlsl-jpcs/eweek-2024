import axios, { AxiosRequestConfig } from "axios";
import { getServerURL, isDebugModeOn } from "../utils";

export const SERVER_URL = getServerURL();

// Set to true to enable debug mode
// This will ignore the signature check and token check
const DEBUG = isDebugModeOn();

export interface PlayerData {
    id: number;
    username: string;
    name: string;
    email: string;
    student_id: string;
    top_score: number;
    is_facilitator: boolean;
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

export async function tokenCheck(): Promise<PlayerData> {
    if (DEBUG) {
        let debugData: PlayerData = {
            id: 1,
            username: "debug",
            name: "debug",
            email: "debug@debug.com",
            student_id: "debug",
            top_score: 0,
            is_facilitator: false,
            course: "debug",
            section: "debug",
            code: "debug"
        };

        return debugData;
    }
    interface Response {
        status: string,
        message: string,
        user_data: {
            player_id: number,
            student_id: string,
            code: string,
            username: string,
            full_name: string,
            email: string,
            course: string,
            section: string,
            is_facilitator: boolean,
            top_score: number
        }
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
            console.log(data);
            if (data.status === "invalid") {
                console.log(data.status);
                throw new Error("Invalid Token");
            }

            let playerData: PlayerData = {
                id: data.user_data.player_id,
                username: data.user_data.username,
                name: data.user_data.full_name,
                email: data.user_data.email,
                student_id: data.user_data.student_id,
                top_score: data.user_data.top_score,
                is_facilitator: data.user_data.is_facilitator,
                course: data.user_data.course,
                section: data.user_data.section,
                code: data.user_data.code
            };

            return playerData;
        });
}

export async function codeCheck(code: string): Promise<boolean> {
    if (DEBUG) {
        return true;
    }

    code = code.toUpperCase();

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

export async function updateTopScore(newScore: number) {

    interface Response {
        status: string,
        message: string
    }

    interface Request {
        score: number
    }

    const request: Request = {
        score: Math.round(newScore)
    }

    const config: AxiosRequestConfig = {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }

    console.log('Submitting New Top Score: ' + newScore);

    return axios.post(SERVER_URL + "/api/v1/player/updateTopScore", request, config)
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