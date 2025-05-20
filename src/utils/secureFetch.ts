import { getCsrfToken } from "./crsfTokenFetch";

interface RequestData{
    url: string;
    method: string;
    data?: any;
}

function createGetURL(request: RequestData){
    let cur_url = request.url;
    if(request.data){
        let query_started = false;
        for(const [key, val] of Object.entries(request.data)){
            if(!query_started){
                cur_url = cur_url + "?";
                query_started = true;
            }else{
                cur_url = cur_url + "&";
            }
            cur_url = cur_url + key + "=" + val;
        }
    }
    return cur_url;
}

/** This is a generic async fetch wrapper for requests that expect a JSON response.
 * It is especially useful for doing POST requests as it handles the CRSF tokens and a few other small web stuff. 
 * 
 * I wrote this code a while ago to help me with requests from ReactTS to Django, and use it pretty often in my projects.
 * 
 * @param request           {RequestData}   An object that represents the most changed variables in any web request
 * @param transformFunc     {Function}      A function that performs
 * @returns                 {Promise}       A Promise containing the interface T specified
 */
export function doFetch<T>(request: RequestData, transformFunc?: (jsonObj: Record<any, any>) => T): Promise<void | T>{
    if(request.method in ["POST", "PUT", "DELETE"]){
        return getCsrfToken()
        .then(function(csrf_token){
            if(typeof(csrf_token) == 'string'){
                return fetch(request.url, {
                    method: request.method,
                    mode: "cors",
                    cache: "no-cache",
                    credentials: "same-origin",
                    headers : {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrf_token
                    },
                    body: JSON.stringify(request.data)
                });
            }else{
                throw new TypeError("Expected a string for CRSF Token but got: " + typeof(csrf_token) +  " instead");
            }
        })
        .then(function (response) {
            if (response) {
                if (!response.ok || response.status != 200) {
                    throw new Error("Issue with sending from " + response.url + "   Status:" + response.status);
                }
                return response.json(); // Assumes JSON Response
            } else {
                throw new Error("Did not get a response from " + request.url);
            }
        })
        .then((resp_json) =>{
            let resp_data: T;
            if(transformFunc){
                resp_data = transformFunc(resp_json);
            }else{
                resp_data = resp_json;
            }
            return resp_data;
        });
    }else if(request.method == "GET"){
        return fetch(createGetURL(request), {
            method: request.method
        })
        .then(function (response) {
            if (response) {
                if (!response.ok || response.status != 200) {
                    throw new Error("Issue with sending from " + response.url + "   Status:" + response.status);
                }
                return response.json(); // Assumes JSON Response
            } else {
                throw new Error("Did not get a response from " + request.url);
            }
        })
        .then((resp_json) =>{
            let resp_data: T;
            if(transformFunc){
                resp_data = transformFunc(resp_json);
            }else{
                resp_data = resp_json;
            }
            return resp_data;
        });
    }else{
        return new Promise(()=>{
            throw new Error("Method failed");
        });
    }
}

