import { create_update_response, tag } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Dialog, Modal } from "@mui/material";
import { doFetch } from "../utils/secureFetch";

// Whole file depreciated since Word provides all the interaction

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
        doFetch<create_update_response>({
            url: "/api/tags/",
            method: "POST",
            data: {"text": text}
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
                setErrorText("Network Error: Unable to create tag: " + text)
            }
        }).catch((err) =>{
            setErrorText(err);
        });
    }

    function close(){
        toggleEditMode(); 
        if(newTagText.length > 0){
            addTag(newTagText); 
        }
        setNewTagText("")
    }

    function dialogKeyUpHandler(event: React.KeyboardEvent){
        event.preventDefault();
        if(event.key == "Enter"){
            if(!event.shiftKey){
                close();
            }
        }
    }

    const colDefs: GridColDef[] = [
        {
            field: "text",
            headerName: "Tag",
            align: "center", 
            headerAlign: "center", 
            width: 100,
        },
        {
            field: "word",
            headerName: "Word",
            align: "center",
            headerAlign: "center",
            width: 100
        }
    ];

    return (
        <div>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Tags</h3>
            <button onClick={toggleEditMode}>Add Tag</button>
            <Modal className="modal" onKeyUp={dialogKeyUpHandler} open={editMode} onClose={close}>
                <form onSubmit={close}>
                    <input 
                        value={newTagText} 
                        onChange={e => setNewTagText(e.target.value)}
                        placeholder="New Tag"
                    />
                </form>
            </Modal>
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