import React from "react";
import "./rgba.css";


const Rgba =({rgba})=>{
    return(
        <div className="rgba-block">
             <h3 className="d-flex justify-content-center">RGBA</h3>
            <div className="rgba-block__colors">
                <div className="rgba-block__colorsbox">
                    <div className="box red"></div>
                    <div className="box green"></div>
                    <div className="box blue"></div>
                    <div className="box alpha">α</div>
                </div>
                <div className="rgba-block__colorsvalue">
                    <div className="value">{rgba[0]}</div>
                    <div className="value">{rgba[1]}</div>
                    <div className="value">{rgba[2]}</div>
                    <div className="value">{rgba[3]}</div>
                </div>
            </div>
        </div>
    )
};
export default Rgba;