
export interface identifiable{
    id: string | number;
}

export interface identifiableText extends identifiable{
    text: string;
}


export interface word extends identifiableText{
    details?: string;
}

export interface tag extends identifiableText{
    words?: word[];
}


// ----- Response Interfaces -----

export interface create_update_response{
    id?: string | number;
    name: string | string[];
}

export interface delete_response{
    status?: string;
    message?: string;
    error?: string;
}

export interface auth_interface{
    auth: boolean;
}

