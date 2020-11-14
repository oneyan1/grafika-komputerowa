import React from "react";
import "./canvas.css";

export default class Canvas extends React.Component{

    state = {
        canvasWidth: 600,
        canvasHeight: 400,
        img: null,
        context: {},
        dx: 0,
        dy: 0,
        clickCords:[],
        saveFormat: ".jpeg",
        binarization: 1,
        filterMatrix: [1,1,1,1,1,1,1,1,1],
        matrixSize: 3
    };

    constructor(props){
        super(props);
        this.canvasRef = React.createRef();
    };

    componentDidMount() {
        const img = new Image();
        const context = this.canvasRef.current.getContext("2d");
        this.setState(
            {
                img: img,
                context: context
            }
        )
    }

    componentDidUpdate(){
        const {loadFile} = this.props;
        const {img, context, dx, dy} = this.state;
        img.src = loadFile;
        img.onload = ()=>{
            context.drawImage(img, dx, dy, this.state.canvasWidth , this.state.canvasHeight);
        };

    }

    onZoomMinusSize= ()=>{
        const {canvasWidth, canvasHeight, dx, dy} = this.state;

        let newCanvasWidth = Math.floor(canvasWidth/1.1);
        let newCanvasHeight = Math.floor(canvasHeight/1.1);
        let newDx = dx + Math.floor(canvasWidth*0.05);
        let newDy = dy + Math.floor(canvasHeight*0.05);

            this.setState({
                canvasWidth: newCanvasWidth,
                canvasHeight: newCanvasHeight,
                dx: newDx,
                dy: newDy
            })
    };

    loadToHistogram = ()=>{
        const {onCanvasContextUpdate} = this.props;
        const {context} = this.state;
        onCanvasContextUpdate(context);
    };

    onZoomPlusSize= ()=>{
        const { canvasWidth, canvasHeight, dx, dy} = this.state;
        let newCanvasWidth = Math.floor(canvasWidth * 1.1);
        let newCanvasHeight = Math.floor(canvasHeight * 1.1);
        let newDx = dx - Math.floor(canvasWidth*0.05);
        let newDy = dy - Math.floor(canvasHeight*0.05);
        this.setState({
            canvasWidth: newCanvasWidth,
            canvasHeight: newCanvasHeight,
            dx: newDx,
            dy: newDy
        })
    };

    onCanvasClick = (event)=>{
        const {context, clickCords} = this.state;
        const {onRgbaListener} = this.props;
        let x = event.pageX - event.target.offsetLeft;
        let y = event.pageY - event.target.offsetTop;
        const rgba = context.getImageData(x, y, 1, 1).data;
        onRgbaListener(rgba);
        let newClickCords = [...clickCords, [x, y]];
        this.setState({
            clickCords: newClickCords
        });

    };

    changeColor = ()=>{
      const {context, clickCords} = this.state;
      for(let i=0; i< clickCords.length; i++){
          context.fillRect(clickCords[i][0], clickCords[i][1], 5, 5);
      }
    };

    saveImage = (event)=>{
        const {saveFormat} = this.state;
        event.target.href = this.canvasRef.current.toDataURL(`image/${saveFormat}`);
        event.target.download = `newImg.${saveFormat}`;
    };

    onFormatChange = (event)=>{
      const saveFormat = "" + event.target.value;
      this.setState({
          saveFormat
      })
    };

    onNormaliseImg = ()=>{
        const {context} = this.state;
        const {histogramChanel } = this.props;
        const oldImgData = context.getImageData(0,0,600,400);
        const newImgData = context.getImageData(0,0,600,400);
        let skip;
        switch(histogramChanel){
            case "r":
                skip=0;
                break;
            case "g":
                skip=1;
                break;
            case "b":
                skip=2;
                break;
        }
        const newArr = [];

        oldImgData.data.forEach((item, i)=>{
           if(i%4 === skip) newArr.push(item);
        });
        const vals = new Array(256).fill(0);
        const coords = new Array(256);
        for(let i= 0; i < 256; i++){
            coords[i] = []
        }
        newArr.forEach((item, i)=>{
           vals[item]++;
           coords[item].push(i);
        });
        const sum = vals.reduce((a,b)=> a+b);
        const pro = vals.slice("").map(item=> item/sum);
        let s = 0;
        const vals2 = new Array(256).fill(0);
        const coords2 = new Array(coords.length);
        pro.forEach((item,i)=>{
           s += item;
           const index = Math.floor(s * 255);
           vals2[index] = item;
           coords2[index] = coords[i];
        });

        const newData = new Array(coords.length);
        coords2.forEach((item, i)=>{
           item.forEach((item)=>{
              newData[item] = i;
           });
        });

        for(let i = 0; i< oldImgData.data.length; i++){
            if(i % 4 === skip){
                const current = Math.floor(i/4);
                newImgData.data[i] = newData[current];
            }else{
                newImgData.data[i] = oldImgData.data[i];
            }
        }
        context.putImageData(newImgData, 0,0);
        createImageBitmap(newImgData).then((imgBitmap) =>{
            this.setState({
                img: imgBitmap,
                context
            });
        });
    };

    onChangeBrightnessQ = (value) =>{
        const {context} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        for(let i = 0; i < oldImgData.data.length; i++){
            if(i % 4 !== 3){
                const pow = Math.pow(oldImgData.data[i], value);
                newImgData.data[i] = pow >= 255 ? 255 : pow;
            }else{
                newImgData.data[i] = oldImgData.data[i];
            }
        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap) => {
            this.setState({
                img: imgBitmap,
                context
            })
        });
    };

    onChangeBrightenssL = (value) =>{
        const {context} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        for(let i = 0; i < oldImgData.data.length; i++){
            if(i % 4 !== 3){
                if(value === "brighter"){
                    newImgData.data[i] = oldImgData.data[i] * (Math.log(oldImgData.data[i])/Math.log(100));
                }else{
                    newImgData.data[i] = oldImgData.data[i] / (Math.log(oldImgData.data[i])/Math.log(100));
                }
            }else{
                newImgData.data[i] = oldImgData.data[i];
            }
        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap)=>{
            this.setState({
               img: imgBitmap,
               context
            });
        });
    };

    onStretchUse = (min, max)=>{
        const {context} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        for(let i = 0; i< oldImgData.data.length; i++){
            newImgData.data[i] = oldImgData.data[i];
        }
    };

    onBinarizationInput = (event)=>{
        this.setState({
            binarization: event.target.value
        });
    };


    otsuTreshold = () =>{
        const {context, binarization} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);
        for(let i = 0; i < oldImgData.data.length; i++){
            if(i%4===3){
                newImgData.data[i] = oldImgData.data[i];
            }else{
                if(oldImgData.data[i- i%4] < 255 - binarization){
                    newImgData.data[i] = 0;
                }else{
                    newImgData.data[i] = 255;
                }
            }
        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap)=>{
            this.setState({
                img: imgBitmap,
                context
            })
        });
    };

    grayScale = (r,g,b) =>{
        return parseInt((r+g+b)/3);
    };

    getAvg = (pixels)=>{
      return pixels.reduce((a,b)=> a+b)/pixels.length;
    };

    niblack = () =>{
        const {context, canvasWidth} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        for(let i = 0; i < oldImgData.data.length; i++){
            const pixels = [];
            if( i % 4 === 0){
                 if(oldImgData.data[i-4] != undefined){
                     pixels.push(this.grayScale(oldImgData.data[i-4], oldImgData.data[i-4+1], oldImgData.data[i-4+2]));
                 }
                if(oldImgData.data[i+4] != undefined){
                    pixels.push(this.grayScale(oldImgData.data[i+4], oldImgData.data[i+4+1], oldImgData.data[i+4+2]));
                }
                if(oldImgData.data[i-canvasWidth] != undefined){
                    pixels.push(this.grayScale(oldImgData.data[i-canvasWidth], oldImgData.data[i-canvasWidth+1], oldImgData.data[i-canvasWidth+2]));
                }
                if(oldImgData.data[i+canvasWidth] != undefined){
                    pixels.push(this.grayScale(oldImgData.data[i+canvasWidth], oldImgData.data[i+canvasWidth+1], oldImgData.data[i+canvasWidth+2]));
                }
                if((this.getAvg(pixels) > this.grayScale(oldImgData.data[i], oldImgData.data[i+1], oldImgData.data[i+2]))){
                    newImgData.data[i] = 0;
                    newImgData.data[i+1] = 0;
                    newImgData.data[i+2] = 0;
                    newImgData.data[i+3] = 255;
                }else{
                    newImgData.data[i] = 255;
                    newImgData.data[i+1] = 255;
                    newImgData.data[i+2] = 255;
                    newImgData.data[i+3] = 255;
                }
            }
        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap)=>{
           this.setState({
              img: imgBitmap,
              context
           });
        });
    };

    onBlurArray = (event)=>{
        const num = event.target.value;
        const {filterMatrix} = this.state;
        let newFilterMatrix = [];
        if(filterMatrix.length < 9){
            newFilterMatrix = [...filterMatrix, (Number(num))];
        }else{
            newFilterMatrix = [...[], Number(num)];
        }
        console.log(newFilterMatrix);
        this.setState({
            filterMatrix: newFilterMatrix
        })
    };

    onFilterImage = ( weight, coef, weightArray)=>{
        let {context, canvasWidth, filterMatrix} = this.state;
        if(weightArray != undefined){
           filterMatrix = weightArray;
        }
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);
        for(let i = 0; i < oldImgData.data.length; i++){
            const pixel = [];
            let j = 0;
            if(i < canvasWidth*4){
                pixel.push(0);
                pixel.push(0);
                pixel.push(0);
                pixel.push(oldImgData.data[i-4] * filterMatrix[j+3]);
                pixel.push(oldImgData.data[i] * filterMatrix[j+4]);
                pixel.push(oldImgData.data[i+4] * filterMatrix[j+5]);
                pixel.push(oldImgData.data[i+canvasWidth*4-4] * filterMatrix[j+6]);
                pixel.push(oldImgData.data[i+canvasWidth*4] * filterMatrix[j+7]);
                pixel.push(oldImgData.data[i+canvasWidth*4+4] * filterMatrix[j+8]);

            } else{
                pixel.push(oldImgData.data[i-canvasWidth*4-4] * filterMatrix[j]);
                pixel.push(oldImgData.data[i-canvasWidth*4] * filterMatrix[j+1]);
                pixel.push(oldImgData.data[i-canvasWidth*4+4] * filterMatrix[j+2]);
                pixel.push(oldImgData.data[i-4] * filterMatrix[j+3]);
                pixel.push(oldImgData.data[i] * filterMatrix[j+4]);
                pixel.push(oldImgData.data[i+4] * filterMatrix[j+5]);
                pixel.push(oldImgData.data[i+canvasWidth*4-4] * filterMatrix[j+6]);
                pixel.push(oldImgData.data[i+canvasWidth*4] * filterMatrix[j+7]);
                pixel.push(oldImgData.data[i+canvasWidth*4+4] * filterMatrix[j+8]);
            }
            const pixelSum = pixel.reduce((a,b)=> a+b);
            if(pixelSum/weight > 0){
                newImgData.data[i] = pixelSum/weight;
            }else{
                newImgData.data[i] =(pixelSum/weight) + coef;
            }

        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap) => {
           this.setState({
              img: imgBitmap,
              context
           });
        });
    };

    kuwaharaFilter = ()=>{
        const {canvasWidth, context} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        for (let i = 0; i < oldImgData.data.length ; i++) {
            const matrix = [];
            matrix.push(oldImgData.data[i-canvasWidth*8-4-4]);
            matrix.push(oldImgData.data[i-canvasWidth*8-4]);
            matrix.push(oldImgData.data[i-canvasWidth*8]);
            matrix.push(oldImgData.data[i-canvasWidth*8+4]);
            matrix.push(oldImgData.data[i-canvasWidth*8+4+4]);
            matrix.push(oldImgData.data[i-canvasWidth*4-4-4]);
            matrix.push(oldImgData.data[i-canvasWidth*4-4]);
            matrix.push(oldImgData.data[i-canvasWidth*4]);
            matrix.push(oldImgData.data[i-canvasWidth*4+4]);
            matrix.push(oldImgData.data[i-canvasWidth*4+4+4]);
            matrix.push(oldImgData.data[i-4-4]);
            matrix.push(oldImgData.data[i-4]);
            matrix.push(oldImgData.data[i]);
            matrix.push(oldImgData.data[i+4]);
            matrix.push(oldImgData.data[i+4+4]);
            matrix.push(oldImgData.data[i+canvasWidth*4-4-4]);
            matrix.push(oldImgData.data[i+canvasWidth*4-4]);
            matrix.push(oldImgData.data[i+canvasWidth*4]);
            matrix.push(oldImgData.data[i+canvasWidth*4+4]);
            matrix.push(oldImgData.data[i+canvasWidth*4+4+4]);
            matrix.push(oldImgData.data[i+canvasWidth*8-4-4]);
            matrix.push(oldImgData.data[i+canvasWidth*8-4]);
            matrix.push(oldImgData.data[i+canvasWidth*8]);
            matrix.push(oldImgData.data[i+canvasWidth*8+4]);
            matrix.push(oldImgData.data[i+canvasWidth*8+4+4]);
            const arrMatrix = {
                0:[],
                1:[],
                2:[],
                3:[]
            };

            for (let j = 0, k = 0; j < matrix.length && k < 4; j+=2, k++) {
                arrMatrix[k].push(matrix[j]);
                arrMatrix[k].push(matrix[j+1]);
                arrMatrix[k].push(matrix[j+2]);
                arrMatrix[k].push(matrix[j+5]);
                arrMatrix[k].push(matrix[j+6]);
                arrMatrix[k].push(matrix[j+7]);
                arrMatrix[k].push(matrix[j+10]);
                arrMatrix[k].push(matrix[j+11]);
                arrMatrix[k].push(matrix[j+12]);
            }

            const arrSum = [arrMatrix[0].reduce((a,b)=> a+b) / 9,
                            arrMatrix[1].reduce((a,b)=> a+b) / 9,
                            arrMatrix[2].reduce((a,b)=> a+b) / 9,
                            arrMatrix[3].reduce((a,b)=> a+b) / 9
            ];
            const variance = [];

            for(let z = 0; z < arrSum.length; z++){
                let tmp = 0;
                for(let u = 0; u < arrMatrix[z].length; u++){
                    tmp += Math.pow(arrSum[z] - arrMatrix[z][u],2);
                }
                variance.push(tmp);
            }
            newImgData.data[i] = arrSum[variance.indexOf(Math.min.apply(null, variance))];
        }
        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap) => {
            this.setState({
                img: imgBitmap,
                context
            });
        });

    };

    medianFilter = ()=>{
        const {canvasWidth, context, matrixSize} = this.state;
        const oldImgData = context.getImageData(0,0, 600 , 400);
        const newImgData = context.getImageData(0,0, 600 , 400);

        if(matrixSize == 3){
            for(let i = 0; i < oldImgData.data.length; i++) {
                const pixel = [];
                if (i < canvasWidth * 4) {
                    pixel.push(0);
                    pixel.push(0);
                    pixel.push(0);
                    pixel.push(oldImgData.data[i - 4]);
                    pixel.push(oldImgData.data[i]);
                    pixel.push(oldImgData.data[i + 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4 - 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4 + 4]);
                } else {
                    pixel.push(oldImgData.data[i - canvasWidth * 4 - 4]);
                    pixel.push(oldImgData.data[i - canvasWidth * 4]);
                    pixel.push(oldImgData.data[i - canvasWidth * 4 + 4]);
                    pixel.push(oldImgData.data[i - 4]);
                    pixel.push(oldImgData.data[i]);
                    pixel.push(oldImgData.data[i + 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4 - 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4]);
                    pixel.push(oldImgData.data[i + canvasWidth * 4 + 4]);
                }
                pixel.sort((a,b) => a-b);
                newImgData.data[i] = pixel[4];
            }
        }else{
            for (let i = 0; i < oldImgData.data.length ; i++) {
                let matrix = [];
                matrix.push(oldImgData.data[i - canvasWidth * 8 - 4 - 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 8 - 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 8]);
                matrix.push(oldImgData.data[i - canvasWidth * 8 + 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 8 + 4 + 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 4 - 4 - 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 4 - 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 4 + 4]);
                matrix.push(oldImgData.data[i - canvasWidth * 4 + 4 + 4]);
                matrix.push(oldImgData.data[i - 4 - 4]);
                matrix.push(oldImgData.data[i - 4]);
                matrix.push(oldImgData.data[i]);
                matrix.push(oldImgData.data[i + 4]);
                matrix.push(oldImgData.data[i + 4 + 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 4 - 4 - 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 4 - 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 4 + 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 4 + 4 + 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 8 - 4 - 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 8 - 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 8]);
                matrix.push(oldImgData.data[i + canvasWidth * 8 + 4]);
                matrix.push(oldImgData.data[i + canvasWidth * 8 + 4 + 4]);

                matrix.sort((a,b) => a-b);
                newImgData.data[i] = matrix[12];
            }
        }

        context.putImageData(newImgData, 0, 0);
        createImageBitmap(newImgData).then((imgBitmap) => {
            this.setState({
                img: imgBitmap,
                context
            });
        });

    };

    onMatrixSize = (event) =>{
        this.setState({
           matrixSiza: event.target.value
        })
    };

    render(){

        return(
            <div className="modifyImg">
                <div className="canvas-block">
                    <h2 className="title">Modify image</h2>
                    <canvas ref={this.canvasRef} width={600} height={400} onClick={event=>this.onCanvasClick(event)}/>
                    <div className="btn-zoom__block">
                        <button className="btn" onClick={this.onZoomMinusSize}>-</button>
                        <span>Zoom</span>
                        <button className="btn" onClick={this.onZoomPlusSize}>+</button>
                    </div>
                </div>
                <div className="control-block">
                    <button className="btn save-btn" onClick={this.changeColor}>Change pixel color</button>
                    <div className="save-block">
                        <a className="btn" download onClick={event => this.saveImage(event)} >Save</a>
                        <div className="format">
                            <input type="radio" id="jpeg" name="format" value="jpeg" onInput={(event => this.onFormatChange(event))}/>
                            <label htmlFor="jpeg">.jpeg</label>
                            <input type="radio" id="png" name="format" value="png" onInput={(event => this.onFormatChange(event))}/>
                            <label htmlFor="png">.png</label>
                            <input type="radio" id="gif" name="format" value="gif" onInput={(event => this.onFormatChange(event))}/>
                            <label htmlFor="gif">.gif</label>
                        </div>
                    </div>
                    <button className="btn chart-load" onClick={this.loadToHistogram}>Load to histogram</button>
                    <button className="btn noramalise" onClick={() => this.onNormaliseImg()}>Noramlise</button>
                    <div className="brightness-btn">
                        <h3 className="title">Brightness</h3>
                        <div className="exponential">
                            <h4 className="title">Exponential</h4>
                            <div className="exponential-block">
                                <button className="btn" onClick={()=>this.onChangeBrightnessQ(0.9)}>dark x 1.1</button>
                                <button className="btn" onClick={()=>this.onChangeBrightnessQ(0.5)}>dark x 2</button>
                                <button className="btn" onClick={()=>this.onChangeBrightnessQ(1.1)}>light x 1.1</button>
                                <button className="btn" onClick={()=>this.onChangeBrightnessQ(2)}>light x 2</button>
                            </div>
                        </div>
                        <div className="logarithmic">
                            <h4 className="title">Logarithmic</h4>
                            <div className="logarithmic-block">
                                <button className="btn" onClick={()=>this.onChangeBrightenssL("darker")}>Darker</button>
                                <button className="btn" onClick={()=>this.onChangeBrightenssL("brighter")}>Lighter</button>
                            </div>
                        </div>
                    </div>
                    <div className="stretch-block">
                        <h3 className="title">Stretching</h3>
                        <form className="streatch-block__inputs">
                            <input className="stretch-input form-control" type="number" placeholder="min" min="0" max="255"/>
                            <input className="stretch-input form-control" type="number" placeholder="max" min="0" max="255"/>
                            <button className="btn">Use</button>
                        </form>
                    </div>
                    <div className="binarization-block">
                        <h3 className="title">Binarization</h3>
                        <div className="form-binarization">
                            <input type="number" className="binarization-input form-control" placeholder="threshold" min={0} max={255}
                                   onChange={(event)=> this.onBinarizationInput(event)}/>
                            <button className="btn" onClick={()=>this.otsuTreshold()}>Otsu</button>
                            <button className="btn" onClick={()=> this.niblack()}>Niblack</button>
                        </div>
                    </div>
                    <div className="filter-block">
                        <h3 className="title">Filter</h3>
                        <div className="filter-inputs">
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                            <input onChange={(event) => this.onBlurArray(event)} className="filter-input form-control" type="number" min={-255} max={255}/>
                        </div>
                        <button className="btn" onClick={()=> this.onFilterImage(this.state.filterMatrix.reduce((a,b)=>a+b))}>BLUR</button>
                        <div className="filter-btn__block">
                            <button onClick={()=> {
                                this.onFilterImage(1,128, [-1,0,1,-1,0,1,-1,0,1]);
                            }} className="btn">Prewitt</button>
                            <button className="btn"
                                onClick={()=>
                                    this.onFilterImage(1, 64,[-1, 0, 1,-2, 0, 2,-1, 0, 1] )
                                }>Sobel</button>
                            <button className="btn"
                                    onClick={()=> {
                                        this.onFilterImage(1, 255, [-1,-1,-1,-1,8,-1,-1,-1,-1]);
                                    }}>Laplace</button>
                            <button className="btn"
                                    onClick={()=> {
                                        this.onFilterImage(1, 100, [1,1,1,1,-2,-1,1,-1,-1]);
                                    }}>Corner</button>
                            <button className="btn" onClick={()=> this.kuwaharaFilter()}>Kuwahara</button>
                            <div className="matrix-input">
                                <input type="radio" id="matrix3" name="format" value="3" onInput={(event => this.onMatrixSize(event))}/>
                                <label htmlFor="matrix3">3x3</label>
                                <input type="radio" id="martix5" name="format" value="5" onInput={(event => this.onMatrixSize(event))}/>
                                <label htmlFor="matrix5">5x5</label>
                                <button className="btn" onClick={()=> this.medianFilter()}>Median</button>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        )
    }
}
