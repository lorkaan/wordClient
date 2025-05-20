import { GridColDef } from "@mui/x-data-grid";
import { auth_interface, create_update_response, delete_response, word } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { DataDisplay } from "../generics/DataDisplay";
import { useState } from "react";
import { Box, Button, Dialog, Modal, TextField } from "@mui/material";
import { doFetch } from "../utils/secureFetch";
import { useNavigate, useParams } from "react-router-dom";
import { useSingleDataModel } from "../utils/dataFetch";

interface domain_id_response{
    domain_id: number;
}

function WordList(props: {words: word[], domain: string, reloadFunc?:() => void}){

    /**
     * The Login code needs to be generalized and refactored, but this will do for now as the SpellinBlox server requires a login to have data pushed to it
     */

    const navigate = useNavigate()

    const [errorText, setErrorText] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [newWordText, setNewWordText] = useState("");
    const [newWordDetails, setNewWordDetails] = useState("");
    const [wordId, setWordId] = useState(-1);
    const [tagId, setTagId] = useState(-1);
    const [tagText, setTagText] = useState("");
    const [domainId, setDomainId] = useState(-1);
    const [syncMode, setSyncMode] = useState(false);

    // ---- Login specific stuff -----
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(''); // Login error handling



    function toggleEditMode(){
        setEditMode(!editMode);
    }

    function getDomainIdIfNeeded(): Promise<number | undefined>{
        if(domainId <= 0){
            return doFetch<domain_id_response>({
                url: "get_domain_id",
                method: "POST",
                data: {"domain": props.domain}
            }).then((resp: domain_id_response | void) =>{
                if(resp){
                    if(resp.domain_id && resp.domain_id > 0){
                        return resp.domain_id;
                    }else{
                        setErrorText("Fatal Error: Retrived an unauthorized Domain")
                    }
                }else{
                    setErrorText("Network Error: Unable to create tag: " + tagText)
                }
            }).then((domain_id: number | undefined) =>{
                if(domain_id){
                    setDomainId(domain_id);
                }
                return domain_id;
            });
        }else{
            return new Promise(resolve => resolve(domainId));
        }
    }

    function addTagIfNeeded(): Promise<number | undefined>{
        if(tagId <= 0){
            return getDomainIdIfNeeded().then((domain_id) =>{
                return doFetch<create_update_response>({
                    url: "/api/tags/",
                    method: "POST",
                    data: {"text": tagText, "domain_id": domain_id}
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
                }).then((tag_id: number | undefined) =>{
                    if(tag_id){
                        setTagId(tag_id);
                    }
                    return tag_id;
                });
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
            if(resp && resp.error && resp.error.length > 0){
                setErrorText("Delete Failed: " + resp.error)
            }else{
                if(props.reloadFunc){
                    props.reloadFunc();
                }
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

    function performSync(){
        if(username.length > 0 && password.length > 0){
            doFetch<any>({
                url: "/push_data",
                method: "POST",
                data: {
                    'username': username,
                    'password': password,
                    'domain': props.domain
                }
            }).catch((err) => {})
        }
    }

    function syncDialogKeyUpHandler(event: React.KeyboardEvent){
        event.preventDefault();
        if(event.key == "Enter"){
            performSync();
            setUsername("");
            setPassword("");
            
        }
    }

    function logout(e: React.MouseEvent){
        doFetch<auth_interface>({
            url: "/logout",
            method: "POST"
        }).then((data: auth_interface | void)=>{
            if(data == null || !data.auth){
                navigate("/");
            }else{
                setErrorText("Log Out Failed");
            }
        })
    }

    return (
        <div>
            <Button className="logoutButton left" onClick={logout}>Log Out</Button>
            {error && <p className="error">{error}</p>}
            <Button className="syncButton right" onClick={performSync}>Push to SpellinBlox</Button>
            {errorText.length > 0? <p className="error">{errorText}</p> : <></>}
            <h3>Words</h3>
            <Button onClick={makeNewRow} variant="contained">Add Word</Button>
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
            <Modal className="modal" onKeyUp={syncDialogKeyUpHandler} open={syncMode} onClose={()=> {setUsername(""); setPassword("");}}>
                <div className="loginDiv">
                    <form className="loginForm" onSubmit={()=>{performSync(); setUsername(""); setPassword("")}}>
                        <label className="formLabel">Username:</label><input 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                        <br/>
                        <label className="formLabel">Password:</label><input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <br/>
                        <Button id="loginSubmitButton" type="submit" variant="contained">Login</Button>
                    </form>
                </div>
            </Modal>
            <GenericDataGrid<word> columns={colDefs} data={props.words} />
        </div>
    );
}

export function Words(props: {url: string, domain: string}){

    const navigate = useNavigate()

    const {data, loading, error} = useSingleDataModel<auth_interface>("/is_auth");

    if(!loading && !error && (data == null || !data.auth)){
        navigate("/");
    }

    return (
        <DataDisplay<word> data_url={props.url} renderFunc={
            (data, reloadFunc) =>{
                return (<WordList words={data} domain={props.domain} reloadFunc={reloadFunc}/>);
            }
        } />
    );
}