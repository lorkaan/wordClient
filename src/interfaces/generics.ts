import { Action } from "./actionState";

export interface KeyValue<T>{
    key: string;
    value: T;
    rep?: string;
}

export interface CompositionElemData<T>{
    data: KeyValue<T>[];
    index?: number | string;
}

export type RenderFunction<T, A, V> = (innerProps: {elem: T, editFunc?: React.Dispatch<Action<A, CompositionElemData<V>>>, index?: string | number}) => React.JSX.Element;

export type DataListRenderFunction<T> = (data: T[]) => React.JSX.Element