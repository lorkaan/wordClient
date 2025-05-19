
export interface identifiable{
    id: string | number;
}

export interface identifiableText extends identifiable{
    text: string;
}

export interface tag extends identifiableText{

}

export interface word extends identifiableText{
    details?: string;
}