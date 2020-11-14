import React from "react";
import "./menuFileInput.css"


export default class MenuFileInput extends React.Component{

    state = {
        file:null,
    };

    onFileSelected = (event)=>{
        const selectedFile = event.target.files[0];

        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = ()=>{
            const src = reader.result;
            this.setState({
                file: src
            })
        };

    };



    render(){
        const {onLoad} = this.props;
        return(
            <div className="form-group">
                <h3 className="d-flex justify-content-center">File input</h3>
                <small className="form-text text-muted">jpeg, png, bmp, gif, tiff</small>
                <input type="file" className="form-control-file" onChange={this.onFileSelected}/>
                <button className="btn" onClick={()=>onLoad(this.state.file)}>Load</button>
            </div>
        )
    }
}