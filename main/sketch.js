var radius = 25;
var circles = [
	{ x: 524, y: 373, color:'white', stroke:'black', active: false , textX1: 'Panning', textX2: 'Delay', textY: 'Rate', textD:'Depth',texta1: '-1',texta2:'~1',textb1:'0',textb2:'~3',textc1:'2',textc2:'~0',textd1:'0',textd2:'150'},
	{ x: 524, y: 145, color: 'black', stroke:'white', active: false, textX1: 'Bendpass', textX2: 'ReverbAmp', textY: 'FilterWidth',textD:'ReverbTime',texta1: '10',texta2:'20k',textb1:'0',textb2:'3',textc1:'90',textc2:'0',textd1:'5',textd2:'0'}
]
var dropzone;
var filename='';
var panning, delTime, rate, depth, filter, filterFreq, filterWidth,reverb,fft;
var A='',B='',C='',D='';
var a1=0,b1=0,c1=0,a2=0,b2=0,c2=0,d1=0,d2=0;
var a,b,c,d;
var playstatus=false;
var rotation=0;
var recordFile, mic, recorder;
var recordState = 0;
var recordText = 'Click to record';

function preload(){
	soundFormats('mp3','ogg','wav');
	soundFile=loadSound('../assets/speach.wav');
}


function setup() {
  //Create drop file function in canvas
  var Z = createCanvas(window.innerWidth, window.innerHeight);
  Z.drop(gotFile);

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  textSize(20);
  img = loadImage("../assets/bgi.jpg"); //background
  img2 = loadImage('../assets/Taiji.png');//Taiji
  //sound settings
  soundFile.disconnect();
  filter = new p5.BandPass();
  delay=new p5.Delay();
  reverb=new p5.Reverb();
  fft = new p5.FFT();
  
  delay.process(soundFile, 0, .7);
  filter.process(soundFile);
  reverb.process(soundFile,0.1,0.1);
  reverb.amp(1);
  mic = new p5.AudioIn();
  recorder = new p5.SoundRecorder();
  recordFile = new p5.SoundFile();
  mic.start();
  recorder.setInput(mic);
}

function gotFile(file){
	soundFile=loadSound(file);
	filename=file.name;
}

function draw() {
	//background Image
	background(255);
	image(img,0,0,img.width/3,img.height/3);
	//Taiji Image and its rotation
	push();
	translate(528,255);
	rotate(rotation);
	image(img2,-223,-221,img2.width/4,img2.height/4);
	pop();
	//Note texts
	fill(255);
	stroke(0);
	text('Drag your sound file here (press 1 to play/stop original sound file)',20,20);
	text('Current sound file: '+filename,20,50);
	rect(880,530,150,80);
	fill(0);
	text(recordText,890,580);
	fill(0);
	text('Spectrum & Waveform', 170,690);
	note();
	//create white and black ball
	noStroke();
	fill( 0xee, 0xee, 0xff, 50);
	if (circles.length > 0) {
		for (var i = 0; i < circles.length; i++) {
			var circle = circles[i];
			stroke(circle.stroke);
			fill(circle.color);
			ellipse(circle.x, circle.y, radius, radius);
		}
	}
	//draw spectrum and waveform
	var spectrum = fft.analyze();
	  push();
	  stroke(163,161,161);
	  fill(0);
	  translate(370,400);
	  scale(0.4);

	  for (var j = 0; j< spectrum.length; j++){
	    var x = map(j, 0, spectrum.length, 0, width);
	    var h = -height + map(spectrum[j], 0, 255, height, 0);
	    rect(x, height, (width / spectrum.length), h/2);
	  }
	  translate(0,250);
	  var waveform = fft.waveform();
	  noFill();
	  beginShape();
	  stroke(77,170,214); // waveform is red
	  strokeWeight(4);
	  for (var j = 0; j< waveform.length; j++){
	    var x = map(j, 0, waveform.length, 0, width);
	    var y = map( waveform[j], -1, 1, 0, height/2.5);
	    vertex(x,y);
	  }
	  endShape();

	  pop();
	  //if sound is playing, rotate Taiji
	  if(soundFile.isPlaying()){
	  	startrotate();
	  }
	  
}
function startrotate(){
	rotation=rotation+2;
}
//check if mouseXY is inside the balls
function mousePressed() {
	if (circles.length > 0) {
		for (var i = 0; i < circles.length; i++) {
			var circle = circles[i],
					distance = dist(mouseX, mouseY, circle.x, circle.y);
			if (distance < radius) {
				circle.active = true;
				//soundFile.play();
				A=circle.textX1;B=circle.textX2;C=circle.textY;D=circle.textD;
				a1=circle.texta1;a2=circle.texta2;b1=circle.textb1;b2=circle.textb2;c1=circle.textc1;c2=circle.textc2;d1=circle.textd1;d2=circle.textd2;
				soundFile.loop();
			} else {
				circle.active = false;
			}
		}
	}
  // Prevent default functionality.
  return false;
}
//when dragged the balls, change sound effects
function mouseDragged() {
		if (circles.length > 0) {
			for (var i = 0; i < circles.length; i++) {
				var circle = circles[i];
				if (circle.active) {
					if(mouseX>=0 && mouseX<=970){
						if(i==0){
							panning = map(mouseX,0,970,-1,1);
							soundFile.pan(panning);
							delTime = map(mouseX,0,970,0,3);
							delay.delayTime(delTime);
							depth=map(mouseX,0,970,0,150);
							soundFile.amp(depth);
							//control the note bar at the bottom of canvas
							a=map(mouseX,0,970,40,180);
							b=map(mouseX,0,970,40,180);
							d=map(mouseX,0,970,40,180);
						}else{
							filterFreq=map(mouseX,0,970,10,20000);
							reverb.amp(mouseX,0,970,0,4);
							//control the note bar at the bottom of canvas
							a=map(mouseX,0,970,40,180);
							b=map(mouseX,0,970,40,180);
						}
						circle.x = mouseX;
					}
					if(mouseY>=0 && mouseY<=480){
						if(i==0){
							rate = map(mouseY,0,480,2,0);
							rate = constrain(rate,0.01,2);
							soundFile.rate(rate);
							//control the note bar at the bottom of canvas
							c=map(mouseY,0,480,40,180);
						}else{
							filterWidth=map(mouseY,0,480,90,0);
							reverb.set(map(mouseY,0,480,5,0));
							//control the note bar at the bottom of canvas
							c=map(mouseY,0,480,40,180);
							d=map(mouseY,0,480,40,180);
						}
						circle.y = mouseY;
					}
					filter.set(filterFreq,filterWidth);
					break;
				}
			}
		}
  // Prevent default functionality.
  
  return false;

}
//when release the balls, stop playing
function mouseReleased(){
	soundFile.stop();
}


function note(){
	fill(0);
	text(A,240,550);
	text(B,240,580);
	text(C,240,610);
	text(D,260,640);
	text(a1,20,550);
	text(b1,20,580);
	text(c1,20,610);
	text(d1,20,640);
	text(a2,200,550);
	text(b2,200,580);
	text(c2,200,610);
	text(d2,200,640);
	fill(255);
	stroke(0);
	line(40,550,180,550);
	line(40,580,180,580);
	line(40,610,180,610);
	line(40,640,180,640);
	ellipse(a,550,10,10);
	ellipse(b,580,10,10);
	ellipse(c,610,10,10);
	ellipse(d,640,10,10);
}
//press 1 to play sound
function keyPressed(){
	if(key==='1'){
		playstatus=!playstatus;
		if(playstatus){
			soundFile.play();
		}else{
			soundFile.stop();
		}
	}
}


function mouseClicked(){
	if(mouseX>=880 && mouseX<=1030 && mouseY>=530 && mouseY<=610){
		if(recordState === 0 && mic.enabled){
			recorder.record(recordFile);
			recordText='Click to stop';
			recordState++;
		}else if(recordState === 1){
			recorder.stop();
			recordText='Click to record';
			recordState--;
			save(recordFile, 'record_sound.wav'); 
		}
	}
}