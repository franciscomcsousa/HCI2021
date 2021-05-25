// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 08;     // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = false;  // set to 'true' before sharing during the simulation and bake-off days

let PPI, PPCM;                 // pixel density (DO NOT CHANGE!)
let second_attempt_button;     // button that starts the second attempt (DO NOT CHANGE!)

// Finger parameters (DO NOT CHANGE!)
let finger_img;                // holds our finger image that simules the 'fat finger' problem
let FINGER_SIZE, FINGER_OFFSET;// finger size and cursor offsett (calculated after entering fullscreen)

// Arm parameters (DO NOT CHANGE!)
let arm_img;                   // holds our arm/watch image
let ARM_LENGTH, ARM_HEIGHT;    // arm size and position (calculated after entering fullscreen)

// Study control parameters (DO NOT CHANGE!)
let draw_finger_arm  = false;  // used to control what to show in draw()
let phrases          = [];     // contains all 501 phrases that can be asked of the user
let current_trial    = 0;      // the current trial out of 2 phrases (indexes into phrases array above)
let attempt          = 0       // the current attempt out of 2 (to account for practice)
let target_phrase    = "";     // the current target phrase
let currently_typed  = "";     // what the user has typed so far
let entered          = new Array(2); // array to store the result of the two trials (i.e., the two phrases entered in one attempt)
let CPS              = 0;      // add the characters per second (CPS) here (once for every attempt)

// Metrics
let attempt_start_time, attempt_end_time; // attemps start and end times (includes both trials)
let trial_end_time;            // the timestamp of when the lastest trial was completed
let letters_entered  = 0;      // running number of letters entered (for final WPM computation)
let letters_expected = 0;      // running number of letters expected (from target phrase)
let errors           = 0;      // a running total of the number of errors (when hitting 'ACCEPT')
let database;                  // Firebase DB

// 2D Keyboard UI
let leftArrow, rightArrow;     // holds the left and right UI images for our basic 2D keyboard   
//let ARROW_SIZE;                // UI button size
//let current_letter = 'a';      // current char being displayed on our basic 2D keyboard (starts with 'a')
let KEYBOARD_WIDTH;
let KEYBOARD_HEIGHT;

let SECTIONA_WIDTH;
let SECTIONA_HEIGHT;

let SECTIONB_WIDTH;
let SECTIONB_HEIGHT;

let SECTIONC_WIDTH;
let SECTIONC_HEIGHT;

let SPACEBAR_WIDTH;
let SPACEBAR_HEIGHT;

let BACKSPACE_WIDTH;
let BACKSPACE_HEIGHT;

let LIGHTBULB_WIDTH;
let LIGHTBULB_HEIGHT;

let PREDICT_WIDTH;
let PREDICT_HEIGHT;

let SELECT_WIDTH;
let SELECT_HEIGHT;

let FONT_MULT;

let gState = "start";
let gWritten = 0;

let words_guessed = [];
let predicted = "the";
let predictions_init = ["the", "of", "and"];

// Runs once before the setup() and loads our data (images, phrases)
function preload()
{    
  // Loads simulation images (arm, finger) -- DO NOT CHANGE!
  arm = loadImage("data/arm_watch.png");
  fingerOcclusion = loadImage("data/finger.png");
    
  // Loads the target phrases (DO NOT CHANGE!)
  phrases = loadStrings("data/phrases.txt");
  
  // Loads UI elements for our basic keyboard
  //leftArrow = loadImage("data/left.png");
  //rightArrow = loadImage("data/right.png");

  keyboard  = loadImage("data/keyboard.png");
  SectionA  = loadImage("data/SectionA.png");
  SectionB  = loadImage("data/SectionB.png");
  SectionC  = loadImage("data/SectionC.png");
  spacebar  = loadImage("data/spacebar.png");
  backspace = loadImage("data/backspace.png");
  lightbulb = loadImage("data/lightbulb.png");
  
  lightest  = loadImage("data/lightest.png");
  medium    = loadImage("data/medium.png");
  darkest   = loadImage("data/darkest.png");

  // Loads the txt file that has the predictions
  words_guessed = loadStrings("data/words.txt");
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);   // window size in px before we go into fullScreen()
  frameRate(60);            // frame rate (DO NOT CHANGE!)
  
  // DO NOT CHANGE THESE!
  shuffle(phrases, true);   // randomize the order of the phrases list (N=501)
  target_phrase = phrases[current_trial];
  
  drawUserIDScreen();       // draws the user input screen (student number and display size)
}

function draw()
{ 
  if(draw_finger_arm)
  {
    background(255);           // clear background
    noCursor();                // hides the cursor to simulate the 'fat finger'
    
    drawArmAndWatch();         // draws arm and watch background
    writeTargetAndEntered();   // writes the target and entered phrases above the watch
    drawACCEPT();              // draws the 'ACCEPT' button that submits a phrase and completes a trial
    
    // Draws the non-interactive screen area (4x1cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill('#000000');
    rect(width/2 - 2.0*PPCM, height/2 - 2.0*PPCM, 4.0*PPCM, 1.0*PPCM);
    //textAlign(CENTER); 
    //textFont("Arial", 16);
    //fill(0);
    //text("NOT INTERACTIVE", width/2, height/2 - 1.3 * PPCM);


    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    stroke(0, 255, 0);
    noFill();
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM);

    if(gState == "lightbulb"){
      drawLightbulb();
    }
    else{
      drawPredictions();

      draw2Dkeyboard();       // draws our basic 2D keyboard UI
    }

    drawFatFinger();        // draws the finger that simulates the 'fat finger' problem
  }
}

//Draws the elements after clicking the lightbulb
function drawLightbulb(){
  imageMode(CORNER);
  fill('#FFFFFF');
  rect(width/2 - 2.0*PPCM, height/2 - 2.0 * PPCM, 4.0 * PPCM, 4.0 * PPCM);
  noFill();
  
  //Draw Predict retangles
  image(darkest, width/2 - 1.0 * PPCM, height/2 - 1.9 * PPCM, PREDICT_WIDTH, PREDICT_HEIGHT);
  image(medium, width/2 - 1.0 * PPCM, height/2 - 1 * PPCM, PREDICT_WIDTH, PREDICT_HEIGHT);
  image(lightest, width/2 - 1.0 * PPCM, height/2 - 0.1 * PPCM, PREDICT_WIDTH, PREDICT_HEIGHT);

  //Draw Select retandgles
  image(darkest, width/2 - 3 * SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)
  image(medium, width/2 - SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)
  image(lightest, width/2 + SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)

  //Draw the help setence
  stroke(0, 0, 0);
  textAlign(LEFT);
  textFont("Arial", 1.3 * FONT_MULT);
  fill('#000000');
  text("Click the rectangles bellow", width/2 - 1.9 * PPCM, height/2 + 2 * PPCM - SELECT_HEIGHT - 0.1 * PPCM)
  
  //Draw the predictions
  textAlign(CENTER);
  textFont("Arial", 2 * FONT_MULT);
  fill('#FFFFFF');
  text(predictions_init[0], width/2 - 1.0 * PPCM + PREDICT_WIDTH/2, height/2 - 1.9 * PPCM + PREDICT_HEIGHT/2);
  text(predictions_init[1], width/2 - 1.0 * PPCM + PREDICT_WIDTH/2, height/2 - 1 * PPCM + PREDICT_HEIGHT/2);
  text(predictions_init[2], width/2 - 1.0 * PPCM + PREDICT_WIDTH/2, height/2 - 0.1 * PPCM + PREDICT_HEIGHT/2);
}

// Draws the words for the predictions in the grey rectangle 
function drawPredictions() {
  stroke(0, 0, 0);
  textAlign(CENTER);
  textFont("Arial", FONT_MULT);
  fill('#FFFFFF');
  text(predictions_init[0], width/2 - 1.3 * PPCM, height/2 - 1.3 * PPCM);
  text(predictions_init[1], width/2, height/2 - 1.3 * PPCM);
  text(predictions_init[2], width/2 + 1.3 * PPCM, height/2 - 1.3 * PPCM);
  //stroke(0, 255, 0); perhaps?
}

// Draws 2D keyboard UI (current letter and left and right arrows)
function draw2Dkeyboard()
{
  // Writes the current letter
  //textFont("Arial", 24);
  //fill(0);
  //text("" + current_letter, width/2, height/2); 
  
  // Draws and the left and right arrow buttons
  noFill();
  imageMode(CORNER); 
  if(gState == "start"){
    image(keyboard, width/2 - KEYBOARD_WIDTH/2, height/2 - KEYBOARD_HEIGHT/2, KEYBOARD_WIDTH, KEYBOARD_HEIGHT);
    image(spacebar, width/2 - 2.0*PPCM, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, SPACEBAR_WIDTH, SPACEBAR_HEIGHT);
    image(backspace, width/2 + 2.0*PPCM - BACKSPACE_WIDTH, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, BACKSPACE_WIDTH, BACKSPACE_HEIGHT);
    image(lightbulb, width/2 - LIGHTBULB_WIDTH/2, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, LIGHTBULB_WIDTH, LIGHTBULB_HEIGHT);
  }
  else if(gState == "stateA"){
    image(SectionA, width/2 - 2.0*PPCM , height/2 - 1.0*PPCM, SECTIONA_WIDTH, SECTIONA_HEIGHT);
  }
  else if(gState == "stateB"){
    image(SectionB, width/2 - 2.0*PPCM , height/2 - 1.0*PPCM, SECTIONB_WIDTH, SECTIONB_HEIGHT);
  }
  else if(gState == "stateC"){
    image(SectionC, width/2 - 2.0*PPCM , height/2 - 1.0*PPCM, SECTIONC_WIDTH, SECTIONC_HEIGHT);
  }
}

// Evoked when the mouse button was pressed
function mousePressed()
{
  // Only look for mouse presses during the actual test
  if (draw_finger_arm)
  {                   
    // Check if mouse click happened within the touch input area
    if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM))  
    {  

      if(gState == "start"){
        //Click within stateA boundaries
        if(mouseClickWithin(width/2 - KEYBOARD_WIDTH/2, height/2 - KEYBOARD_HEIGHT/2, KEYBOARD_WIDTH/3, KEYBOARD_HEIGHT)){
          gWritten = 0;
          gState = "stateA";
        }
        //Click within stateB boundaries
        else if(mouseClickWithin(width/2 - KEYBOARD_WIDTH/6, height/2 - KEYBOARD_HEIGHT/2, KEYBOARD_WIDTH/3, KEYBOARD_HEIGHT)){
          gWritten = 0;
          gState = "stateB";
        }
        //Click within stateC boundaries
        else if(mouseClickWithin(width/2 + KEYBOARD_WIDTH/6, height/2 - KEYBOARD_HEIGHT/2, KEYBOARD_WIDTH/3, KEYBOARD_HEIGHT)){
          gWritten = 0;
          gState = "stateC";
        }
        //Spacebar is pressed
        else if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, SPACEBAR_WIDTH, SPACEBAR_HEIGHT)){
          currently_typed += " ";
          doPredict();
        }
        //Backspace is pressed
        else if(mouseClickWithin(width/2 + 2.0*PPCM - BACKSPACE_WIDTH, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, BACKSPACE_WIDTH, BACKSPACE_HEIGHT) && currently_typed.length > 0){
          currently_typed = currently_typed.substring(0, currently_typed.length - 1);
          doPredict();
        }
        else if(mouseClickWithin(width/2 - LIGHTBULB_WIDTH/2, height/2 + 2.0*PPCM - KEYBOARD_HEIGHT/2, LIGHTBULB_WIDTH, LIGHTBULB_HEIGHT)){
          gState = "lightbulb";
        }
      }
      
      //StateA keys
      else if(gState == "stateA"){
        if(mouseClickWithin(width/2 - SECTIONA_WIDTH/2, height/2 - SECTIONA_HEIGHT/2, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "q";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONA_WIDTH/6, height/2 - SECTIONA_HEIGHT/2, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "w";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONA_WIDTH/6, height/2 - SECTIONA_HEIGHT/2, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "e";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONA_WIDTH/2, height/2 - SECTIONA_HEIGHT/6, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "a";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONA_WIDTH/6, height/2 - SECTIONA_HEIGHT/6, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "s";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONA_WIDTH/6, height/2 - SECTIONA_HEIGHT/6, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "d";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONA_WIDTH/3, height/2 + SECTIONA_HEIGHT/6, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "z";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2, height/2 + SECTIONA_HEIGHT/6, SECTIONA_WIDTH/3, SECTIONA_HEIGHT/3)){
          currently_typed += "x";
          gWritten = 1;
        }
        if(gWritten){
          gWritten = 0;
          gState = "start"
        }
        doPredict();
      }

      //StateB keys
      else if(gState == "stateB"){
        if(mouseClickWithin(width/2 - SECTIONB_WIDTH/2, height/2 - SECTIONB_HEIGHT/2, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "r";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONB_WIDTH/4, height/2 - SECTIONB_HEIGHT/2, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "t";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2, height/2 - SECTIONB_HEIGHT/2, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "y";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONB_WIDTH/4, height/2 - SECTIONB_HEIGHT/2, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "u";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONB_WIDTH/2, height/2 - SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "f";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONB_WIDTH/6, height/2 - SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "g";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONB_WIDTH/6, height/2 - SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "h";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONB_WIDTH/2, height/2 + SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "c";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONB_WIDTH/6, height/2 + SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "v";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONB_WIDTH/6, height/2 + SECTIONB_HEIGHT/6, SECTIONB_WIDTH/3, SECTIONB_HEIGHT/3)){
          currently_typed += "b";
          gWritten = 1;
        }
        if(gWritten){
          gWritten = 0;
          gState = "start"
        }
        doPredict();
      }

      //StateC keys
      else if(gState == "stateC"){
        if(mouseClickWithin(width/2 - SECTIONC_WIDTH/2, height/2 - SECTIONC_HEIGHT/2, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "i";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONC_WIDTH/6, height/2 - SECTIONC_HEIGHT/2, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "o";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONC_WIDTH/6, height/2 - SECTIONC_HEIGHT/2, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "p";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONC_WIDTH/2, height/2 - SECTIONC_HEIGHT/6, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "j";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONC_WIDTH/6, height/2 - SECTIONC_HEIGHT/6, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "k";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 + SECTIONC_WIDTH/6, height/2 - SECTIONC_HEIGHT/6, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "l";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2 - SECTIONC_WIDTH/3, height/2 + SECTIONC_HEIGHT/6, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "n";
          gWritten = 1;
        }
        else if(mouseClickWithin(width/2, height/2 + SECTIONC_HEIGHT/6, SECTIONC_WIDTH/3, SECTIONC_HEIGHT/3)){
          currently_typed += "m";
          gWritten = 1;
        }
        if(gWritten){
          gWritten = 0;
          gState = "start"
        }
        doPredict();
      }
      //Lightbulb
      else if(gState == "lightbulb"){
        if(mouseClickWithin(width/2 - 3 * SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)){
          //code for darkest
          acceptPredict(predictions_init[0]);
          gState = "start"
        }
        else if(mouseClickWithin(width/2 - SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)){
          //code for medium
          acceptPredict(predictions_init[1]);
          gState = "start"
        }
        else if(mouseClickWithin(width/2 + SELECT_WIDTH/2, height/2 + 2.0 * PPCM - SELECT_HEIGHT, SELECT_WIDTH, SELECT_HEIGHT)){
          //code for lightest
          acceptPredict(predictions_init[2]);
          gState = "start"
        }
      }
      doPredict();
    }
    
    // Check if mouse click happened within 'ACCEPT' 
    // (i.e., submits a phrase and completes a trial)
    else if (mouseClickWithin(width/2 - 2*PPCM, height/2 - 5.1*PPCM, 4.0*PPCM, 2.0*PPCM))
    {
      // Saves metrics for the current trial
      letters_expected += target_phrase.trim().length;
      letters_entered += currently_typed.trim().length;
      errors += computeLevenshteinDistance(currently_typed.trim(), target_phrase.trim());
      entered[current_trial] = currently_typed;
      trial_end_time = millis();

      current_trial++;

      // Check if the user has one more trial/phrase to go
      if (current_trial < 2)                                           
      {
        // Prepares for new trial
        currently_typed = "";
        target_phrase = phrases[current_trial];  
      }
      else
      {
        // The user has completed both phrases for one attempt
        draw_finger_arm = false;
        attempt_end_time = millis();
        
        printAndSavePerformance();        // prints the user's results on-screen and sends these to the DB
        attempt++;

        // Check if the user is about to start their second attempt
        if (attempt < 2)
        {
          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 200);
        }
      }
    }
  }
}

// function that changes gives 3 predictions of the word you are writing
function doPredict() {

  phrase = split(currently_typed, " ");     // frase incompleta escrita (divide se em palavras)
  typed = phrase[phrase.length - 1];        // palavra incompleta escrita
    
  if (currently_typed[currently_typed.length - 1] == " " || phrase == "") {
    // reiniciacao das palavras ' the, and, of '
    predictions_init[0] = words_guessed[0];
    predictions_init[1] = words_guessed[1];
    predictions_init[2] = words_guessed[2];
  }

  nr_words = words_guessed.length;
  counter_words = 0;
  for (i = 0; i < nr_words; i++) 
  {
    if (counter_words >= 3)
      break;
    else if (words_guessed[i].startsWith(typed))
    {
      counter_words ++;
      predicted = words_guessed[i]; //guarda a palavra possivel na variavel predicted
    }
    if (counter_words == 1) {
      predictions_init[0] = predicted;
    }
    else if (counter_words == 2) {
      predictions_init[1] = predicted;
    }
    else if (counter_words == 3) {
      predictions_init[2] = predicted;
    }
  }
}


function acceptPredict(word) {
  // da nos um array com todas as palavras da frase escrita ate ao momento
  phrase = split(currently_typed, " ");
  current_word = phrase[phrase.length -1];

  // inicio de quando nao tem nada escrito (o tamanho da palavra vai ser o mesmo que a previsao)
  if (currently_typed.length == 0 || currently_typed[currently_typed.length - 1] == " ")
    currently_typed += word;

  else {
    // apaga a palavra nao acabada
    currently_typed = currently_typed.substring(0,currently_typed.length - current_word.length);
    //adiciona a palavra prevista
    currently_typed += word;
  }
  }

// Resets variables for second attempt
function startSecondAttempt()
{
  // Re-randomize the trial order (DO NOT CHANGE THESE!)
  shuffle(phrases, true);
  current_trial        = 0;
  target_phrase        = phrases[current_trial];
  
  // Resets performance variables (DO NOT CHANGE THESE!)
  letters_expected     = 0;
  letters_entered      = 0;
  errors               = 0;
  currently_typed      = "";
  CPS                  = 0;
  
  //current_letter       = 'a';
  
  // Show the watch and keyboard again
  second_attempt_button.remove();
  draw_finger_arm      = true;
  attempt_start_time   = millis();  
}

// Print and save results at the end of 2 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE
  let attempt_duration = (attempt_end_time - attempt_start_time) / 60000;          // 60K is number of milliseconds in minute
  let wpm              = (letters_entered / 5.0) / attempt_duration;      
  let freebie_errors   = letters_expected * 0.05;                                  // no penalty if errors are under 5% of chars
  let penalty          = max(0, (errors - freebie_errors) / attempt_duration); 
  let wpm_w_penalty    = max((wpm - penalty),0);                                   // minus because higher WPM is better: NET WPM
  let timestamp        = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  background(color(0,0,0));    // clears screen
  cursor();                    // shows the cursor again
  
  textFont("Arial", 16);       // sets the font to Arial size 16
  fill(color(255,255,255));    //set text fill color to white
  text(timestamp, 100, 20);    // display time on screen 
  
  text("Finished attempt " + (attempt + 1) + " out of 2!", width / 2, height / 2); 
  
  // For each trial/phrase
  let h = 20;
  for(i = 0; i < 2; i++, h += 40 ) 
  {
    text("Target phrase " + (i+1) + ": " + phrases[i], width / 2, height / 2 + h);
    text("User typed " + (i+1) + ": " + entered[i], width / 2, height / 2 + h+20);
  }
  
  text("Raw WPM: " + wpm.toFixed(2), width / 2, height / 2 + h+20);
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h+40);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h+60);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h+80);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:         GROUP_NUMBER,
        assessed_by:          student_ID,
        attempt_completed_by: timestamp,
        attempt:              attempt,
        attempt_duration:     attempt_duration,
        raw_wpm:              wpm,      
        freebie_errors:       freebie_errors,
        penalty:              penalty,
        wpm_w_penalty:        wpm_w_penalty,
        cps:                  CPS
  }
  
  // Send data to DB (DO NOT CHANGE!)
  if (BAKE_OFF_DAY)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
  let display    = new Display({ diagonal: display_size }, window.screen);
  
  // DO NO CHANGE THESE!
  PPI           = display.ppi;                        // calculates pixels per inch
  PPCM          = PPI / 2.54;                         // calculates pixels per cm
  FINGER_SIZE   = (int)(11   * PPCM);
  FINGER_OFFSET = (int)(0.8  * PPCM)
  ARM_LENGTH    = (int)(19   * PPCM);
  ARM_HEIGHT    = (int)(11.2 * PPCM);
  
  //ARROW_SIZE     = (int)(2.2 * PPCM);
  KEYBOARD_WIDTH   = (int)(4 * PPCM);
  KEYBOARD_HEIGHT  = (int)(2 * PPCM);

  SECTIONA_WIDTH   = (int)(4 * PPCM);
  SECTIONA_HEIGHT  = (int)(3 * PPCM);

  SECTIONB_WIDTH   = (int)(4 * PPCM);
  SECTIONB_HEIGHT  = (int)(3 * PPCM);

  SECTIONC_WIDTH   = (int)(4 * PPCM);
  SECTIONC_HEIGHT  = (int)(3 * PPCM);

  SPACEBAR_WIDTH   = (int)(1.3 * PPCM)
  SPACEBAR_HEIGHT  = (int)(1 * PPCM)

  BACKSPACE_WIDTH  = (int)(1.3 * PPCM)
  BACKSPACE_HEIGHT = (int)(1 * PPCM)

  LIGHTBULB_WIDTH  = (int)(1.3 * PPCM)
  LIGHTBULB_HEIGHT = (int)(1 * PPCM)

  PREDICT_WIDTH    = (int)(3 * PPCM)
  PREDICT_HEIGHT   = (int)(0.8 * PPCM)

  SELECT_WIDTH     = (int)(1.3333 * PPCM)
  SELECT_HEIGHT    = (int)(0.8 * PPCM)

  FONT_MULT = (int)(0.25 * PPCM)
  
  // Starts drawing the watch immediately after we go fullscreen (DO NO CHANGE THIS!)
  draw_finger_arm = true;
  attempt_start_time = millis();
}