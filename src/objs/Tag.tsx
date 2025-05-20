import { create_response, tag } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Dialog } from "@mui/material";
import { doFetch } from "../utils/secureFetch";

const tag_url: string = "";

function Tag(props: tag){
    return (
        <div>
            <span>{props.id}</span>
            <span>{props.text}</span>
        </div>
    );
}

function TagList(props: {tags: tag[], reloadFunc?: ()=> void}){


    const [editMode, setEditMode] = useState(false);
    const [newTagText, setNewTagText] = useState("");
    const [errorText, setErrorText] = useState("");

    function toggleEditMode(){
        setEditMode(!editMode);
    }

    function addTag(text: string){
        doFetch<create_response>({
            url: "/api/tags",
            method: "POST",
            data: {"text": text}
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
            headerName: "Tag"
        },
    ];

    return (
        <div>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Tags</h3>
            <button onClick={toggleEditMode}>Add Tag</button>
            <Dialog open={editMode} onClose={() => {toggleEditMode(); addTag(newTagText); setNewTagText("")}}>
                <input 
                    value={newTagText} 
                    onChange={e => setNewTagText(e.target.value)}
                    placeholder="New Tag"
                />
            </Dialog>
            <GenericDataGrid<tag> columns={colDefs} data={props.tags} />
        </div>
    );
}

export function Tags(props: {url: string}){

    return (
        <DataDisplay<tag> data_url={props.url} renderFunc={
            (data, reloadFunc) =>{
                return (<TagList tags={data} reloadFunc={reloadFunc}/>);
            }
        } />
    );
}