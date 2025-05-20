import { GridColDef } from "@mui/x-data-grid";
import { create_update_response, delete_response, word } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Box, Button, Dialog, Modal, TextField } from "@mui/material";
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
    const [wordId, setWordId] = useState(-1);
    const [tagId, setTagId] = useState(-1);
    const [tagText, setTagText] = useState("");

    function toggleEditMode(){
        setEditMode(!editMode);
    }

    function addTagIfNeeded(): Promise<number | undefined>{
        if(tagId <= 0){
            return doFetch<create_update_response>({
                url: "/api/tags/",
                method: "POST",
                data: {"text": tagText}
            }).then((resp: create_update_response | void) =>{
                if(resp){
                    if(resp.id){
                        if(typeof(resp.id) == 'string'){
                            return Number.parseInt(resp.id);
                        }else{
                            return resp.id;
                        }
                    }else{
                        setErrorText("Create Failed: " + resp.name)
                    }
                }else{
                    setErrorText("Network Error: Unable to create tag: " + tagText)
                }
            });
        }else{
            return new Promise(resolve => resolve(tagId));
        }
    }

    function addWord(newWordText: string, newWordDetails: string){
        addTagIfNeeded().then((tag_id: number | undefined) =>{
            if(tag_id == undefined){
                throw new TypeError("There is no tag for: " + newWordText);
            }
            doFetch<create_update_response>({
                url: wordId > 0? "/api/words/" + wordId + "/": "/api/words/",
                method: wordId > 0? "PUT": "POST",
                data: {"text": newWordText, "details": newWordDetails, "tag_id": tag_id}
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
        })
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
        doFetch<delete_response>({
            url: "/api/words/" + row.id + "/",
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

    function makeNewRow(){
        setWordId(-1);
        toggleEditMode();
    }

    function updateRow(row: any){
        setWordId(row.id);
        setTagId(row.tag.id);
        setTagText(row.tag.text);
        setNewWordText(row.text);
        setNewWordDetails(row.details);
        toggleEditMode();
    }

    const colDefs: GridColDef[] = [
        {
            field: "tag",
            headerName: "Tag",
            align: "center", 
            headerAlign: "center", 
            width: 100,
            renderCell: (params) =>{
                return (<label>{params.row.tag.text}</label>);
            }
        },
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
            width: 500,
            renderCell: (params) => {
                return (<p className="wordDetails" onClick={(event: React.MouseEvent) =>{updateRow(params.row)}}>{params.row.details}</p>)
            }
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

    function dialogKeyUpHandler(event: React.KeyboardEvent){
        event.preventDefault();
        if(event.key == "Enter"){
            if(!event.shiftKey){
                close();
            }
        }
    }

    return (
        <div>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Words</h3>
            <button onClick={makeNewRow}>Add Word</button>
            <Modal className="modal" onKeyUp={dialogKeyUpHandler} open={editMode} onClose={close}>
                <Box>
                    <form onSubmit={close}>
                    <label className="formLabel">Tag:</label><input disabled={tagId > 0? true: false}
                            value={tagText} 
                            onChange={e => setTagText(e.target.value)}
                            placeholder="New Tag"
                        /><br/>
                        <label className="formLabel">Word:</label><input disabled={wordId > 0? true: false}
                            value={newWordText} 
                            onChange={e => setNewWordText(e.target.value)}
                            placeholder="New Word"
                        /><br/><br/>
                        <label className="formLabel">Details:</label><br/><textarea 
                            value={newWordDetails} 
                            onChange={e => setNewWordDetails(e.target.value)}
                            placeholder="New Word"
                        />
                    </form>
                </Box>
            </Modal>
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