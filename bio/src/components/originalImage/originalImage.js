import React from "react";
import "./originalImage.css"

export default class OriginalImage extends React.Component{

    render(){
        const {file} = this.props;
        return(
            <div className="originalImg d-flex flex-column align-items-center">
                <h2 className="originalImage__title">Original image</h2>
                <img ref="image" src={file} />
            </div>
        )
    }
}