import React from 'react';
import './App.css';
import MenuFileInput from "../menuFileInput";
import Canvas from "../canvas";
import Rgba from "../rgba";
import ChartImage from "../chart";

export default class App extends React.Component{

    state = {
        newFile: null,
        rgba:[0,0,0,0],
        context: {},
        histogramChanel: "",
        chartPixelCoords: {},
        chratPixelVals: {}
    };

    onLoad = (file)=>{
        this.setState({
            newFile: file
        })
    };

    onRgbaListener =(rgba)=>{
      this.setState({
          rgba
      })
    };

    onCanvasContextUpdate = (context)=>{
      this.setState({
          context
      });
    };

    onHistogramChange = (histogramChanel)=>{
      this.setState({
          histogramChanel
      });
    };

    onChartObjects = (pixelCoords, pixelVals) =>{
      this.setState({
         chartPixelCoords: pixelCoords,
         chartPixelVals: pixelVals
      });
    };

    render(){
        return (
            <div className="App d-flex">
                <div className="left-block d-flex flex-column">
                    <MenuFileInput onLoad={(file)=>this.onLoad(file)}></MenuFileInput>
                    <Rgba rgba={this.state.rgba}/>
                    <ChartImage context={this.state.context}
                                onHistogramChange={this.onHistogramChange}
                                onChartObjects={this.onChartObjects}/>
                </div>
                <div className="right-block">
                    <Canvas loadFile={this.state.newFile} onRgbaListener={this.onRgbaListener}
                            onCanvasContextUpdate={this.onCanvasContextUpdate}
                            histogramChanel={this.state.histogramChanel}
                            chartPixelsCoords={this.state.chartPixelCoords}
                            chartPixelsVals={this.state.chartPixelVals}/>
                </div>
            </div>
        )
    }
}
