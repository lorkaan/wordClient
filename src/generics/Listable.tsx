import React from 'react';
import { CompositionElemData, RenderFunction } from '../interfaces/generics';
import { Action } from '../interfaces/actionState';

// Possibly Depreciated
export function Listable<T, A, V>(props: {elems: T[], renderFunc: RenderFunction<T, A, V>, editFunc?: React.Dispatch<Action<A, CompositionElemData<V>>>}){
    return (
        <ul>
            {props.elems?.map((elem, index) =>(
                <li key={index}>
                    {props.editFunc? props.renderFunc({elem:elem, editFunc: props.editFunc, index:index}): props.renderFunc({elem:elem, index:index})}
                </li>
            ))}
        </ul>
    );
}