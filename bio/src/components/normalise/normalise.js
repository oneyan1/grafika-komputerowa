import React from "react";

export default class Normalise extends React.Component{
    onNormaliseClick = (onNormaliseImg)=>{
        //console.log("IN NORMAALISE COMPONENT")
        onNormaliseImg();
    };
  render() {
      const {onNormaliseImg} = this.props;
      return (
          <div className="d-flex justify-content-center">
              <button className="btn" onClick={() => this.onNormaliseClick(onNormaliseImg)}>Normalise</button>
          </div>
      )
  }
};

