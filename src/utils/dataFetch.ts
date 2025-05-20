import { useEffect, useState } from "react";
import { Dict } from "../interfaces/actionState";

const DataModel = {
    async fetchData(url: string){
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Network Response was bad: ' + response.status + "  " + response.statusText);
        }
        return response.json();
    }
}

export const useSingleDataModel = <T>(url:string) =>{
    const [data, setData] = useState<T|null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>{
        const loadData = async () =>{
            try{
                const data: T | null = await DataModel.fetchData(url);
                setData(data);
            }catch(err){
                setError("Error: " + err);
            }finally{
                setLoading(false);
            }
        };
        loadData()
    }, []);

    return {data, loading, error}
}

export const useDataListModel = <T>(url: string, reload_trigger: boolean = false) =>{
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>{
        const loadData = async () =>{
            try{
                const data = await DataModel.fetchData(url);
                setData(data);
            }catch(err){
                setError("Error: " + err);
            }finally{
                setLoading(false);
            }
        };
        loadData()
    }, [reload_trigger]);

    return {data, loading, error}
}

export const useDataRecordModel = <T>(url: string, reload_trigger: boolean = false) =>{
    const [data, setData] = useState<Dict<T>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() =>{
        const loadData = async () =>{
            try{
                const data = await DataModel.fetchData(url);
                setData(data);
            }catch(err){
                setError("Error: " + err);
            }finally{
                setLoading(false);
            }
        };
        loadData()
    }, [reload_trigger]);

    return {data, loading, error}
}