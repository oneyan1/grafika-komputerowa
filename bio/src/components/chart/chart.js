import React from "react";
import {Line} from "react-chartjs-2";
import "./chart.css";

export default class ChartImage extends React.Component {

    state = {
        newChart: {
            labels: [],
            datasets: [{
                label: 'Histogram',
                data: [],
            }]
        },
        histogramChanel: "r",
        pixelCoords: {
            r: new Array(256).fill(new Array()),
            g: new Array(256).fill(new Array()),
            b: new Array(256).fill(new Array())
        },
        pixelVals: {
            r: new Array(256).fill(0),
            g: new Array(256).fill(0),
            b: new Array(256).fill(0),
            a: new Array(256).fill(0)
        }
    };


        onChanelChange = (event) => {
            const histogramChanel = "" + event.target.value;
            const {context, onHistogramChange} = this.props;;
            const {newChart, pixelVals} = this.state;
            let newChartCopy = Object.assign({}, newChart);
            this.fillPixelsVals(context.getImageData(0,0, 600 , 400).data, histogramChanel);
            newChartCopy.datasets[0].data = pixelVals[histogramChanel];
            newChartCopy.labels = new Array(256).fill(0);
            onHistogramChange(histogramChanel);
            this.setState({
                histogramChanel,
                newChart: newChartCopy
            })
        };

        fillPixelsVals = (imageData) => {
            const {pixelCoords} = this.state;

            let newPixelCoords = {
                r: new Array(256).fill(new Array()),
                g: new Array(256).fill(new Array()),
                b: new Array(256).fill(new Array())
            };
            let newPixelVals = {
                r: new Array(256).fill(0),
                g: new Array(256).fill(0),
                b: new Array(256).fill(0),
                a: new Array(256).fill(0)
            };

            for (let i = 0; i < pixelCoords.r.length; i++) {
                newPixelCoords.r[i] = pixelCoords.r[i].slice();
                newPixelCoords.g[i] = pixelCoords.g[i].slice();
                newPixelCoords.b[i] = pixelCoords.b[i].slice()
            }
            for (let i = 0; i < imageData.length; i++) {
                switch (i % 4) {
                    case 0:
                        newPixelVals.r[imageData[i]]++;
                        newPixelCoords.r[imageData[i]].push(i);
                        break;
                    case 1:
                        newPixelVals.g[imageData[i]]++;
                        newPixelCoords.g[imageData[i]].push(i);
                        break;
                    case 2:
                        newPixelVals.b[imageData[i]]++;
                        newPixelCoords.b[imageData[i]].push(i);
                        break;
                    case 3:
                        newPixelVals.a[Math.floor((imageData[i - 3] + imageData[i - 2] + imageData[i - 1]) / 3)]++;
                        break;
                }
            }
            this.setState({
                pixelCoords: newPixelCoords,
                pixelVals: newPixelVals
            });

        };


        render()
        {
            return (
                <div className="chart-block">
                    <h3 className="d-flex justify-content-center">Histogram</h3>
                    <Line data={this.state.newChart}/>
                    <div className="chanel-input">
                        <input className="chanel-switch" type="radio" id="r" name="chanel" value="r"
                               onInput={(event => this.onChanelChange(event))}/>
                        <label className="chanel-switch__label" htmlFor="r">r</label>
                        <input className="chanel-switch" type="radio" id="g" name="chanel" value="g"
                               onInput={(event => this.onChanelChange(event))}/>
                        <label className="chanel-switch__label" htmlFor="g">g</label>
                        <input className="chanel-switch" type="radio" id="b" name="chanel" value="b"
                               onInput={(event => this.onChanelChange(event))}/>
                        <label className="chanel-switch__label" htmlFor="b">b</label>
                        <input className="chanel-switch" type="radio" id="a" name="chanel" value="a"
                               onInput={(event => this.onChanelChange(event))}/>
                        <label className="chanel-switch__label" htmlFor="a">a</label>
                    </div>
                </div>
            )
        }
    }
