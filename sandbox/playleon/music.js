  
  
  
  
var music = function() {
		this.topic = 'jsfftwebaudio';
		this.comment_teaser = 'Please leave a comment...';
		this.initAudio();
		this.context;
		his.source = 0;
		this.jsProcessor = 0;
		
		this.histoindex = 0;
		this.histomax = 500;
		
		this.histobuffer_x = new Array();
		this.histobuffer_y = new Array();
		this.histobuffer_t = new Array();
		for (a=0;a<histomax;a++) {
			histobuffer_t[a] = 0;
		}
		
		maxvalue = new Array();
		for (a=0;a<1024;a++) {
			maxvalue[a] = 0;
		}
		
		currentvalue = new Array();
		
		var frameBufferSize = 4096;
		var bufferSize = frameBufferSize/4;
		
		var signal = new Float32Array(bufferSize);
		var peak = new Float32Array(bufferSize);
		
		var fft = new FFT(bufferSize, 44100);
		
		
		var canvas = document.getElementById('fft');
		var ctx = canvas.getContext('2d');
	}  
  
  
		window.onload = init_page;



music.prototype.loadSample = function (url) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() { 
        source.buffer = context.createBuffer(request.response, false);
        source.looping = false;
        source.noteOn(0);
        this.initSpectralAnalyser(currentvalue.length);
		  this.visualizer();				// run jsfft visualizer
		
    }

    request.send();
}

music.prototype.initAudio = function() {
    context = new webkitAudioContext();
    source = context.createBufferSource();

    // This AudioNode will do the amplitude modulation effect directly in JavaScript
    jsProcessor = context.createJavaScriptNode(2048);
    jsProcessor.onaudioprocess = audioAvailable;			// run jsfft audio frame event
    
    // Connect the processing graph: source -> jsProcessor -> analyser -> destination
    source.connect(jsProcessor);
    jsProcessor.connect(context.destination);

    // Load the sample buffer for the audio source
    loadSample("MYBE.mp3");
}

	   var theme = ["rgba(255, 255, 255,","rgba(240, 240, 240,","rgba(210, 210, 210,","rgba(180, 180, 180,","rgba(150, 150, 150,","rgba(120, 120, 150,","rgba(90, 90, 150,","rgba(60, 60, 180,","rgba(30, 30, 180,","rgba(0, 0, 200,","rgba(0, 0, 210,","rgba(0, 0, 220,","rgba(0, 0, 230,","rgba(0, 0, 240,","rgba(0, 0, 255,","rgba(0, 30, 255,","rgba(0, 60, 255,","rgba(0, 90, 255,","rgba(0, 120, 255,","rgba(0, 150, 255,"];
		
		
function audioAvailable(event) {
		
			// Copy input arrays to output arrays to play sound
			var inputArrayL = event.inputBuffer.getChannelData(0);
			var inputArrayR = event.inputBuffer.getChannelData(1);
			var outputArrayL = event.outputBuffer.getChannelData(0);
			var outputArrayR = event.outputBuffer.getChannelData(1);
			
			var n = inputArrayL.length;
			for (var i = 0; i < n; ++i) {
				outputArrayL[i] = inputArrayL[i];
				outputArrayR[i] = inputArrayR[i];
				signal[i] = (inputArrayL[i] + inputArrayR[i]) / 2;		// create data frame for fft - deinterleave and mix down to mono
			}
			
			// perform forward transform
			fft.forward(signal);
			
			for ( var i = 0; i < bufferSize/8; i++ ) {
				magnitude = fft.spectrum[i] * 1000; 					// multiply spectrum by a zoom value
				
				currentvalue[i] = magnitude;
				
				if (magnitude > maxvalue[i]) {
					maxvalue[i] = magnitude;
					makeSize(magnitude-20);
				} else {
					if (maxvalue[i] > 10) {
						maxvalue[i]--;
					}
				}
			
			}
			
			
		}
		
		function makeSize(x,y)  {
			y = Math.floor(y);
			
			histobuffer_t[histoindex] = 19;
	
			histobuffer_y[histoindex++] = y;
			
			if (histoindex > histomax) {
				histoindex = 0;
			}
		}


		function new_pos(y) {
	
			y = Math.floor(y);
			
			histobuffer_t[histoindex] = 19;
	
			histobuffer_y[histoindex++] = y;
			
			if (histoindex > histomax) {
				histoindex = 0;
			}
		}
		
		var spectrum_on = true;	
		var ctxD = document.getElementById('dIV');
	  function initSpectralAnalyser(length) {
	      var idD = 'analyse';
	  		for (var i=0; i<length; i++) {
					// Draw rectangle bars for each frequency bin
				   var div = document.createElement('div');
				   div.setAttribute('id', idD+i);
				   div.setAttribute('style', 'border:1px solid black;width:10px;height:10px');
				   div.innerHTML = i;
				   ctxD.appendChild(div);
				}
	  }		
		
		function visualizer() {
	
			//ctx.clearRect(0,0, canvas.width, canvas.height);
		   
		   console.log(currentvalue.length);
			if (spectrum_on) {
				ctx.fillStyle = '#000044';
				for (var i=0; i<currentvalue.length; i++) {
					// Draw rectangle bars for each frequency bin
					ctxD.childNodes[i+1].style.width =  currentvalue[i]*3 + 'px';
					ctxD.childNodes[i+1].style.background = '#000044';
					ctxD.childNodes[i+1].style.color = 'red';
				}
			}
	/*
			for (h=0;h<histomax;h++) {
				if (histobuffer_t[h] > 0) {
					var size = histobuffer_t[h] * 4;
					histobuffer_y[h] = histobuffer_y[h] - 3 + Math.random() * 6;
				}
			}*/
			t = setTimeout('visualizer()',50);
		}
	
	
		function toggle_spectrum() {
			if (spectrum_on) {
				spectrum_on = false;
			} else {
				spectrum_on = true;		
			}
		}
