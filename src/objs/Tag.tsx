import { tag } from "../interfaces/wordtags";
import { GenericDataGrid } from "../generics/GenericDataGrid";
import { GridColDef } from "@mui/x-data-grid";
import { DataDisplay } from "../generics/DataDisplay";

const tag_url: string = "";

function Tag(props: tag){
    return (
        <div>
            <span>{props.id}</span>
            <span>{props.text}</span>
        </div>
    );
}

function TagList(props: {tags: tag[]}){

    const colDefs: GridColDef[] = [
        {
            field: "text",
            headerName: "Tag"
        },
    ];

    return (
        <div>
            <h3>Tags</h3>
            <GenericDataGrid<tag> columns={colDefs} data={props.tags} />
        </div>
    );
}

export function Tags(props: {url: string}){

    return (
        <DataDisplay<tag> data_url={props.url} renderFunc={
            (data) =>{
                return (<TagList tags={data} />);
            }
        } />
    );
}