export interface Action<T, V>{
    type: T;
    payload: V;
}

export interface State<T>{
    value: T;
}

export type Dict<T> = Record<string|number, T>;