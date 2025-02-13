/**
 * analyser.js
 * this file analyses the sound wich will be loaded async
 * and make it avaiable to render some visualisation 
 * in context with the current played music!
 *
 */
var analyser = function () {

}

analyser.prototype.init = function () {
    this.context = null;
    this.source = 0;
    this.jsProcessor = 0;
   
    this.topic = 'jsfftwebaudio';
    this.comment_teaser = 'Please leave a comment...'; 
    this.spectrum_on = true;	
    this.ctxD = document.getElementById('dIV');
    this.theme = ["rgba(255, 255, 255,","rgba(240, 240, 240,","rgba(210, 210, 210,","rgba(180, 180, 180,","rgba(150, 150, 150,","rgba(120, 120, 150,","rgba(90, 90, 150,","rgba(60, 60, 180,","rgba(30, 30, 180,","rgba(0, 0, 200,","rgba(0, 0, 210,","rgba(0, 0, 220,","rgba(0, 0, 230,","rgba(0, 0, 240,","rgba(0, 0, 255,","rgba(0, 30, 255,","rgba(0, 60, 255,","rgba(0, 90, 255,","rgba(0, 120, 255,","rgba(0, 150, 255,"];
		
    this.histoindex = 0;
    this.histomax = 500;
		
    this.histobuffer_x = new Array();
    this.histobuffer_y = new Array();
    this.histobuffer_t = new Array();
    for (a=0;a<this.histomax;a++) {
        this.histobuffer_t[a] = 0;
    }
		
    this.maxvalue = new Array();
    for (a=0;a<1024;a++) {
        this.maxvalue[a] = 0;
    }
		
    this.currentvalue = new Array();
		
    this.frameBufferSize = 4096;
    this.bufferSize = this.frameBufferSize/4;
		
    this.signal = new Float32Array(this.bufferSize);
    this.peak = new Float32Array(this.bufferSize);
		
    this.fft = new FFT(this.bufferSize, 44100);
		
		
    this.canvas = document.getElementById('fft');
    this.ctx = this.canvas.getContext('2d');
    //cubus stuff
    this.left = document.getElementsByClassName('left');
    this.right = document.getElementsByClassName('right');
    this.front = document.getElementsByClassName('front');
    this.back = document.getElementsByClassName('back');
    this.top = document.getElementsByClassName('top');
    this.bottom = document.getElementsByClassName('bottom');
   
    this.initAudio();
}


window.onload = function () {
    window.analyserObj = new analyser();
    window.analyserObj.init();
};
 


analyser.prototype.loadSample = function (url) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    (function(ObjContext) {
        request.onload = function() { 
            ObjContext.source.buffer = ObjContext.context.createBuffer(request.response, false);
            ObjContext.source.looping = false;
            ObjContext.source.noteOn(0);
            //ObjContext.bindEvents();
            ObjContext.initSpectralAnalyser(ObjContext.currentvalue.length);
            ObjContext.visualizer();				// run jsfft visualizer
        }
    ;
    })(this);
    request.send();
}

analyser.prototype.initAudio = function () {
    this.context = new webkitAudioContext();
    this.source = this.context.createBufferSource();

    // This AudioNode will do the amplitude modulation effect directly in JavaScript
    this.jsProcessor = this.context.createJavaScriptNode(2048);

    this.jsProcessor.onaudioprocess = window.analyserObj.audioAvailable;			// run jsfft audio frame event

    // Connect the processing graph: source -> jsProcessor -> analyser -> destination
    this.source.connect(this.jsProcessor);
    this.jsProcessor.connect(this.context.destination);

    // Load the sample buffer for the audio source
    this.loadSample("ZJMU.ogg");
}

	
analyser.prototype.audioAvailable = function (event) {
    // Copy input arrays to output arrays to play sound
    var inputArrayL = event.inputBuffer.getChannelData(0);
    var inputArrayR = event.inputBuffer.getChannelData(1);
    var outputArrayL = event.outputBuffer.getChannelData(0);
    var outputArrayR = event.outputBuffer.getChannelData(1);
			
    var n = inputArrayL.length;
    for (var i = 0; i < n; ++i) {
        outputArrayL[i] = inputArrayL[i];
        outputArrayR[i] = inputArrayR[i];
                         
        window.analyserObj.signal[i] = (inputArrayL[i] + inputArrayR[i]) / 2;		// create data frame for fft - deinterleave and mix down to mono
    }
			
    // perform forward transform
    window.analyserObj.fft.forward(window.analyserObj.signal);
			
    for ( var i = 0; i < window.analyserObj.bufferSize/8; i++ ) {
        magnitude = window.analyserObj.fft.spectrum[i] * 1000; 					// multiply spectrum by a zoom value
				
        window.analyserObj.currentvalue[i] = magnitude;
				
        if (magnitude > window.analyserObj.maxvalue[i]) {
            window.analyserObj.maxvalue[i] = magnitude;
            window.analyserObj.makeSize(magnitude-20);
        } else {
            if (window.analyserObj.maxvalue[i] > 10) {
                window.analyserObj.maxvalue[i]--;
            }
        }
			
    }
			
			
}
analyser.prototype.breakPlay = function () {
    this.source.noteOff(0);
}		

analyser.prototype.startPlay = function () {
    this.source.noteOn(0);
}

analyser.prototype.makeSize = function (x,y)  {
    y = Math.floor(y);
			
    this.histobuffer_t[this.histoindex] = 19;
	
    this.histobuffer_y[this.histoindex++] = y;
			
    if (this.histoindex > this.histomax) {
        this.histoindex = 0;
    }
}



		
		
analyser.prototype.initSpectralAnalyser = function (length) {
    var idD = 'analyse';
  /*  for (var i=0; i<length; i++) {
        // Draw rectangle bars for each frequency bin
        var div = document.createElement('div');
        div.setAttribute('id', idD+i);
        div.setAttribute('style', 'border:1px solid black;width:10px;height:10px');
        div.innerHTML = i;
        this.ctxD.appendChild(div);
    }*/
}		
analyser.prototype.visualizer = function () {
	
    //ctx.clearRect(0,0, canvas.width, canvas.height);
    
		   
    if (this.spectrum_on) {
        this.ctx.fillStyle = '#000044';
        var Zl = 100+Math.round(this.currentvalue[3]/10);
        var Zr = 100+Math.round(this.currentvalue[2]/10);
        var Zf = 100+Math.round(this.currentvalue[1]/10);
        var Zb = 100+Math.round(this.currentvalue[4]/10);
        
        this.left[0].style.webkitTransform =" rotateY(   90deg ) translateZ( " + Zl + "px )";
        this.right[0].style.webkitTransform =" rotateY(   180deg ) translateZ( " + Zr + "px )";
        this.front[0].style.webkitTransform =" rotateY(   0deg ) translateZ( " + Zf + "px )";
        this.back[0].style.webkitTransform =" rotateY(   270deg ) translateZ( " + Zb + "px )";
       /* for (var i=0; i<this.currentvalue.length; i++) {
            // Draw rectangle bars for each frequency bin
            this.ctxD.childNodes[i+1].style.width =  this.currentvalue[i] + 'px';
            this.ctxD.childNodes[i+1].style.background = '#000044';
            this.ctxD.childNodes[i+1].style.color = 'red';
        }*/
    }
    /*
			for (h=0;h<histomax;h++) {
				if (histobuffer_t[h] > 0) {
					var size = histobuffer_t[h] * 4;
					histobuffer_y[h] = histobuffer_y[h] - 3 + Math.random() * 6;
				}
			}*/
    t = setTimeout('window.analyserObj.visualizer()',50);
}
	
	
analyser.prototype.toggle_spectrum = function () {
    if (this.spectrum_on) {
        this.spectrum_on = false;
    } else {
        this.spectrum_on = true;		
    }
}

analyser.prototype.bindEvents = function () {
    this.breakPlay();
    var breakMe = document.getElementById('pause');
    var playMe = document.getElementById('start');
    (function(analyserObj) {
        breakMe.addEventListener('click', function (event) {
               
                    analyserObj.breakPlay();
        }, true);
        playMe.addEventListener('click', function (event) {
                    
                    analyserObj.startPlay();
        }, true);
    })(this);    
    
}
