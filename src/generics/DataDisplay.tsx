import { useState } from "react";
import { useDataListModel } from "../utils/dataFetch";
import { DataListRenderFunction } from "../interfaces/generics";

export function DataDisplay<T>(props: {data_url: string, renderFunc: DataListRenderFunction<T>}){

    // State that triggers the data fetching. If this value changes, the fetch is triggered
    // It is a boolean since booleans are the smallest amount of memory.
    const [fetchTrigger, setFetchTrigger] = useState(false);

    function triggerDataFetch(){
        setFetchTrigger(!fetchTrigger);
    }

    const {data, loading, error} = useDataListModel<T>(props.data_url, fetchTrigger);

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p className="error">Error: {error}</p>}
            {!loading && !error? 
                props.renderFunc(data):
                <p>No Data Found</p>
            }
        </div>
    );
}