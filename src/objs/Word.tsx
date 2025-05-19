import { GridColDef } from "@mui/x-data-grid";
import { word } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { DataDisplay } from "../generics/DataDisplay";


function Word(props: word){
    return (
        <div>
            <span>{props.id}</span>
            <span>{props.text}</span>
            <span>{props.details? props.details: "N/A"}</span>
        </div>
    );
}

function WordList(props: {words: word[]}){

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
            <h3>Words</h3>
            <GenericDataGrid<word> columns={colDefs} data={props.words} />
        </div>
    );
}

export function Words(props: {url: string}){

    return (
        <DataDisplay<word> data_url={props.url} renderFunc={
            (data) =>{
                return (<WordList words={data} />);
            }
        } />
    );
}