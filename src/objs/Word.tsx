import { GridColDef } from "@mui/x-data-grid";
import { create_response, word } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Dialog } from "@mui/material";
import { doFetch } from "../utils/secureFetch";


function Word(props: word){
    return (
        <div>
            <span>{props.id}</span>
            <span>{props.text}</span>
            <span>{props.details? props.details: "N/A"}</span>
        </div>
    );
}

function WordList(props: {words: word[], reloadFunc?:() => void}){

    const [errorText, setErrorText] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [newWordText, setNewWordText] = useState("");
    const [newWordDetails, setNewWordDetails] = useState("");

    function toggleEditMode(){
        setEditMode(!editMode);
    }

    function addWord(newWordText: string, newWordDetails: string){
        doFetch<create_response>({
            url: "/api/words",
            method: "POST",
            data: {"text": newWordText, "details": newWordDetails}
        }).then((resp: create_response | void)=>{
            if(props.reloadFunc){
                props.reloadFunc();
            }
        }).catch((err) =>{
            setErrorText(err);
        });
    }

    const colDefs: GridColDef[] = [
        {
            field: "text",
            headerName: "Word"
        },
        {
            field: "details",
            headerName: "Description"
        }
    ];

    return (
        <div>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Words</h3>
            <button onClick={toggleEditMode}>Add Tag</button>
            <Dialog open={editMode} onClose={() => {toggleEditMode(); addWord(newWordText, newWordDetails); setNewWordText(""); setNewWordDetails("");}}>
                <label className="formLabel">Word:</label><input 
                    value={newWordText} 
                    onChange={e => setNewWordText(e.target.value)}
                    placeholder="New Word"
                /><br/>
                <label className="formLabel">Details:</label><textarea 
                    value={newWordText} 
                    onChange={e => setNewWordText(e.target.value)}
                    placeholder="New Word"
                />
            </Dialog>
            <GenericDataGrid<word> columns={colDefs} data={props.words} />
        </div>
    );
}

export function Words(props: {url: string}){

    return (
        <DataDisplay<word> data_url={props.url} renderFunc={
            (data, reloadFunc) =>{
                return (<WordList words={data} reloadFunc={reloadFunc}/>);
            }
        } />
    );
}