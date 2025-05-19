import { DataGrid, GridColDef } from '@mui/x-data-grid';

export function GenericDataGrid<T>(props: {columns: GridColDef[], data: T[]}){

    return (
        <div>
            <DataGrid disableDensitySelector disableRowSelectionOnClick rows={props.data} columns={props.columns} />
        </div>
    )
}