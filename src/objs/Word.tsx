import { GridColDef } from "@mui/x-data-grid";
import { create_update_response, delete_response, word } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Button, Dialog } from "@mui/material";
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
        doFetch<create_update_response>({
            url: "/api/words",
            method: "POST",
            data: {"text": newWordText, "details": newWordDetails}
        }).then((resp: create_update_response | void)=>{
            if(resp){
                if(resp.id){
                    if(props.reloadFunc){
                        props.reloadFunc();
                    }
                }else{
                    setErrorText("Create Failed: " + resp.name)
                }
            }else{
                setErrorText("Network Error: Unable to create word: " + newWordText)
            }
        }).catch((err) =>{
            setErrorText(err);
        });
    }

    function close(){
        toggleEditMode();
        if(newWordText.length > 0){
            addWord(newWordText, newWordDetails.length > 0? newWordDetails: "");
        }
        setNewWordText("");
        setNewWordDetails("");
    }

    function removeWord(row: any){
        doFetch<delete_ok_response| delete_no_response>({
            url: "/api/words/" + row.id,
            method: "DELETE"
        }).then((resp: delete_response | void)=>{
            if(resp){
                if(resp.status && resp.status.length > 0 && resp.message && resp.message.length >= 0){
                    // All good
                    if(props.reloadFunc){
                        props.reloadFunc();
                    }
                }else if(resp.error && resp.error.length > 0){
                    setErrorText("Delete Failed: " + resp.error)
                }else{
                    let msg: string = "Unknown Response:\n";
                    for( const [k, v] of Object.entries(resp)){
                        msg += "\t" + k + " : " + v + "\n"
                    }
                    setErrorText(msg)
                }
            }else{
                setErrorText("Network Error: Unable to create word: " + newWordText)
            }
        }).catch((err) =>{
            setErrorText(err);
        });
    }

    const colDefs: GridColDef[] = [
        {
            field: "text",
            headerName: "Word",
            align: "center", 
            headerAlign: "center", 
            width: 100,
        },
        {
            field: "details",
            headerName: "Description",
            align: "center", 
            headerAlign: "center", 
            width: 100,
        },
        {
            field: "delete",
            headerName: "Delete", 
            align: "center", 
            headerAlign: "center", 
            width: 100,
            renderCell: (params) =>{
                return (<Button onClick={(event: React.MouseEvent)=>{event.stopPropagation(); event.preventDefault(); removeWord(params.row)}} style={{marginLeft: 16}} variant="contained" size="small">X</Button>);
            }
        }
    ];

    return (
        <div>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Words</h3>
            <button onClick={toggleEditMode}>Add Word</button>
            <Dialog maxWidth="md" open={editMode} onClose={close}>
                <form onSubmit={close}>
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
                </form>
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