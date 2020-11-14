(() => {	
	const Image = function(data) {
		const exp = /^(\S+)\s+(\#.*?\n)*\s*(\d+)\s+(\d+)\s+(\d+)?\s*/;
		let match = data.match(exp);
		if (match) {
			const width = this.width = parseInt (match[3], 10),
				height = this.height = parseInt (match[4], 10),
				maxVal = parseInt (match[5], 10),
				bytes = (maxVal < 256)? 1 : 2;
			data = data.substr (match[0].length);
			switch (match[1]) {
				case 'P3':
					this._parser = new ASCIIParser (data, bytes);
					this._formatter = new PPMFormatter (width, height, maxVal);
					break;
				case 'P6':
					this._parser = new Parser (data, bytes);
					this._formatter = new PPMFormatter (width, height, maxVal);
					break;
				default:
					throw new TypeError ('format is not supported');
			}
		} else {
			data = data.split("\n");
			console.log(data);
			data = data.filter(line => line.charAt(0) !== "#");
			data = data.map(line => line.split("#")[0].trim());
			data = data.filter(line => line.length !== 0);
			data = data.join("\n");
			match = data.match(exp);
			if (match) {
				const width = this.width = parseInt (match[3], 10),
					height = this.height = parseInt (match[4], 10),
					maxVal = parseInt (match[5], 10),
					bytes = (maxVal < 256)? 1 : 2;
				data = data.substr (match[0].length);
				switch (match[1]) {
					case 'P3':
						this._parser = new ASCIIParser (data, bytes);
						this._formatter = new PPMFormatter (width, height, maxVal);
						break;
					case 'P6':
						this._parser = new Parser (data, bytes);
						this._formatter = new PPMFormatter (width, height, maxVal);
						break;
					default:
						throw new TypeError ('format is not supported');
				}
			} else {
				throw new TypeError ('file does not .');
			}
		}
	};
	
	
	Image.prototype.getPNG = function() {
		const canvas = this._formatter.getCanvas (this._parser);
		return Canvas2Image.saveAsPNG (canvas, true);
	};
	
	Parser = function(data, bytes) {
		this._data = data;
		this._bytes = bytes;
		this._pointer = 0;
	};
	
	
	Parser.prototype.getNextSample = function() {
		if (this._pointer >= this._data.length) return false;

		let val = 0;
		for (let i = 0; i < this._bytes; i++) {
			val = val * 255 + this._data.charCodeAt (this._pointer++);
		}

		return val;
	};
	
	
	ASCIIParser = function(data, bytes) {
		this._data = data.split (/\s+/);
		this._bytes = bytes;
		this._pointer = 0;
	};
	
	
	ASCIIParser.prototype.getNextSample = function() {
		if (this._pointer >= this._data.length) return false;
		
		let val = 0;
		for (let i = 0; i < this._bytes; i++) {
			val = val * 255 + parseInt (this._data[this._pointer++], 10);
		}

		return val;
	};
	
	PPMFormatter = function(width, height, maxVal) {
		this._width = width;
		this._height = height;
		this._maxVal = maxVal;
	};


	PPMFormatter.prototype.getCanvas = function(parser) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = context.width = this._width;
		canvas.height = context.height = this._height;
		const img = context.getImageData(0, 0, this._width, this._height);
		for (let row = 0; row < this._height; row++) {
			for (let col = 0; col < this._width; col++) {
				const factor = 255 / this._maxVal;
				const r = factor * parser.getNextSample();
				const g = factor * parser.getNextSample();
				const b = factor * parser.getNextSample();
				const position = (row * this._width + col) * 4;
				img.data[position] = r;
				img.data[position + 1] = g;
				img.data[position + 2] = b;
				img.data[position + 3] = 255;
			}	
		}
		context.putImageData(img, 0, 0);
		return canvas;
	};


	PGMFormatter = function(width, height, maxVal) {
		this._width = width;
		this._height = height;
		this._maxVal = maxVal;
	};


	PGMFormatter.prototype.getCanvas = function(parser) {
		const canvas = document.createElement ("canvas");
		const context = canvas.getContext ("2d");
		canvas.width = context.width = this._width;
		canvas.height = context.height = this._height;
		const img = context.getImageData (0, 0, this._width, this._height);
		for (let row = 0; row < this._height; row++) {
			for (let col = 0; col < this._width; col++) {
				const d = parser.getNextSample () * (255 / this._maxVal);
				const position = (row * this._width + col) * 4;
				img.data[position] = d;
				img.data[position + 1] = d;
				img.data[position + 2] = d;
				img.data[position + 3] = 255;
			}	
		}
		context.putImageData(img, 0, 0);
		return canvas;
	};

	
	PBMFormatter = function(width, height) {
		this._width = width;
		this._height = height;
	};


	PBMFormatter.prototype.getCanvas = function(parser) {
		const canvas = document.createElement ("canvas");
		const context = canvas.getContext ("2d");
		
		if (parser instanceof Parser) {
			const data = '';
			const bytesPerLine = Math.ceil (this._width / 8);
			let byte;

			for (let i = 0; i < this._height; i++) {
				const line = parser._data.substr (i * bytesPerLine, bytesPerLine),
					lineData = '';

				for (const j = 0; j < line.length; j++) lineData += ('0000000' + line.charCodeAt (j).toString (2)).substr (-8);
				data += lineData.substr (0, this._width);
			}
								
			while ((byte = (parser.getNextSample ())) !== false) {
				data += ('0000000' + byte.toString (2)).substr (-8);
			}

			parser = new ASCIIParser (data.split ('').join (' '), 1);
		}
		
		canvas.width = context.width = this._width;
		canvas.height = context.height = this._height;

		const img = context.getImageData(0, 0, this._width, this._height);

		for (let row = 0; row < this._height; row++) {
			for (let col = 0; col < this._width; col++) {
				
				const d = (1 - parser.getNextSample ()) * 255,
					pos = (row * this._width + col) * 4;
				img.data[pos] = d;
				img.data[pos + 1] = d;
				img.data[pos + 2] = d;
				img.data[pos + 3] = 255;
			}	
		}

		context.putImageData (img, 0, 0);
		return canvas;
	};

	
	const landingZone = document.getElementById ('landing-zone'),
		imageList = document.getElementById ('image-list');
	
	landingZone.ondragover = function(e) {
		e.preventDefault ();
		return false;	
	};
	
	landingZone.ondrop = function(e) {
		e.preventDefault ();
		
		let outstanding = 0,
			checkOutstanding = function() {
				if (!outstanding) $(landingZone).removeClass ('busy');
			};
			
		$(landingZone).addClass ('busy');
		
		
		for (let i = 0, l = e.dataTransfer.files.length; i < l; i++) {
			outstanding++;
			
			const file = e.dataTransfer.files[i],
				reader = new FileReader();
	
			reader.onload = function(event) {
				const data = event.target.result;
				try {
					const img = new Image (data);
					addImage(img);

				} catch(e) {
					alert(e.message);
				}
			
				outstanding--;
				checkOutstanding ();
			};
		
			reader.readAsBinaryString (file);
		}
				
		return false;
	};

	const addImage = img => {
		const height = img.height;
		const png = img.getPNG();
		$(png).height(0).css({
			left: '-25px'
		}).animate({
			top: (-height / 2) + 'px',
			left: '25px',
			height: height + 'px'
		}); 
		$('<li>').append(png).prependTo(imageList);
	};
})();



const Canvas2Image = (function() {

	let bHasCanvas = false;
	const oCanvas = document.createElement("canvas");
	if (oCanvas.getContext("2d")) {
		bHasCanvas = true;
	}

	if (!bHasCanvas) {
		return {
			saveAsPNG : function(){}
		}
	}

	const bHasDataURL = !!(oCanvas.toDataURL);

	const strDownloadMime = "image/octet-stream";


	const saveFile = function(strData) {
		document.location.href = strData;
	}

	const makeImageObject = function(strSource) {
		const oImgElement = document.createElement("img");
		oImgElement.src = strSource;
		return oImgElement;
	}

	const scaleCanvas = function(oCanvas, iWidth, iHeight) {
		if (iWidth && iHeight) {
			const oSaveCanvas = document.createElement("canvas");
			oSaveCanvas.width = iWidth;
			oSaveCanvas.height = iHeight;
			oSaveCanvas.style.width = iWidth+"px";
			oSaveCanvas.style.height = iHeight+"px";

			const oSavecontext = oSaveCanvas.getContext("2d");

			oSavecontext.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
			return oSaveCanvas;
		}
		return oCanvas;
	}

	return {

		saveAsPNG : function(oCanvas, bReturnImg, iWidth, iHeight) {
			if (!bHasDataURL) {
				return false;
			}
			const oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
			const strData = oScaledCanvas.toDataURL("image/png");
			if (bReturnImg) {
				return makeImageObject(strData);
			} else {
				saveFile(strData.replace("image/png", strDownloadMime));
			}
			return true;
		}
	};

})();