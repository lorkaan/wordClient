
const cookie_key = {
    csrf_token: "csrftoken"
};

const regex = {
    attr_seperator: "=",
    cookie_seperator: ";"
};

function getCookies(name: string | null = null){
    let cookieArray = document.cookie.split(regex.cookie_seperator);
    let cur_cookie: string[];
    if(name != null && name.length > 0){
        for (let i = 0; i < cookieArray.length; i++) {
            cur_cookie = cookieArray[i].split(regex.attr_seperator);
            if (cur_cookie[0] == name) {
                return cur_cookie[1];
            }
        }
        return "";
    }else{
        // Get All Cookies
        // But for now just raise error
        throw new TypeError("Name must be a string with length greater than 0");
    }
}

function setCookie(key: string, value: string){
    let tmp_str: string = key + regex.attr_seperator + value;
    document.cookie = document + regex.cookie_seperator + tmp_str;
}

const token_url = "csrf-token";
const token_response_key = "csrfToken";

export function getCsrfToken(){
    let crsf_token = getCookies(cookie_key.csrf_token);
    if(!(typeof(crsf_token) == 'string' && crsf_token.length > 0)){
        return fetch(token_url, {
            method: "GET"
        })
        .then((response) =>{
            if (response) {
                if (!response.ok || response.status != 200) {
                    throw new Error("Issue with sending from " + response.url + "   Status:" + response.status);
                }
                return response.json(); // Assumes JSON Response
            } else {
                throw new Error("Did not get a response from Token Request");
            }
        })
        .then((resp_json) =>{
            return resp_json[token_response_key] || "";
        })
        .then((token_string: string)=>{
            setCookie(cookie_key.csrf_token, token_string);
            return token_string;
        });
    }else{
        return new Promise(resolve => resolve(crsf_token));
    }
}