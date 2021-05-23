// Support variables & functions (DO NOT CHANGE!)

let student_ID_form, display_size_form, start_button;                 // Initial input variables
let student_ID, display_size;                                         // User input parameters

// Prints the initial UI that prompts that ask for student ID and screen size
function drawUserIDScreen()
{ 
  background(color(0,0,0));                                          // sets background to black
  
  // Text prompt
  main_text = createDiv("Insert your student number and display size");
  main_text.id('main_text');
  main_text.position(10, 10);
  
  // Input forms:
  // 1. Student ID
  let student_ID_pos_y_offset = main_text.size().height + 40;         // y offset from previous item
  
  student_ID_form = createInput('');                                 // create input field
  student_ID_form.position(200, student_ID_pos_y_offset);
  
  student_ID_label = createDiv("Student number (int)");              // create label
  student_ID_label.id('input');
  student_ID_label.position(10, student_ID_pos_y_offset);
  
  // 2. Display size
  let display_size_pos_y_offset = student_ID_pos_y_offset + student_ID_form.size().height + 20;
  
  display_size_form = createInput('');                              // create input field
  display_size_form.position(200, display_size_pos_y_offset);
  
  display_size_label = createDiv("Display size in inches");         // create label
  display_size_label.id('input');
  display_size_label.position(10, display_size_pos_y_offset);
  
  // 3. Start button
  start_button = createButton('START');
  start_button.mouseReleased(startTest);
  start_button.position(width/2 - start_button.size().width/2, height/2 - start_button.size().height/2);
}

// Verifies if the student ID is a number, and within an acceptable range
function validID()
{
  if(parseInt(student_ID_form.value()) < 200000 && parseInt(student_ID_form.value()) > 1000) return true
  else 
  {
    alert("Please insert a valid student number (integer between 1000 and 200000)");
	return false;
  }
}

// Verifies if the display size is a number, and within an acceptable range
function validSize()
{
  if (parseInt(display_size_form.value()) < 50 && parseInt(display_size_form.value()) > 10) return true
  else
  {
    alert("Please insert a valid display size (between 10 and 50)");
    return false;
  }
}

// Starts the test (i.e., target selection task)
function startTest()
{
  if (validID() && validSize())
  {
    // Saves student and display information
    student_ID = parseInt(student_ID_form.value());
    display_size = parseInt(display_size_form.value());

    // Deletes UI elements
    main_text.remove();
    student_ID_form.remove();
    student_ID_label.remove();
    display_size_form.remove();
    display_size_label.remove();
    start_button.remove();  

    // Goes fullscreen and starts test
    fullscreen(!fullscreen());
    testStartTime = millis();
  }
}

function getNextChar(char){
  var charCode = char.charCodeAt(0);
  var nextChar = String.fromCharCode(charCode+1);
  return nextChar;
}

function getPreviousChar(char){
  var charCode = char.charCodeAt(0);
  var nextChar = String.fromCharCode(charCode-1);
  return nextChar;
}

// Draws arm and watch background
function drawArmAndWatch()
{
  imageMode(CENTER);
  image(arm, width/2, height/2, ARM_LENGTH, ARM_HEIGHT);
}

// Writes the target and entered phrases above the watch
function writeTargetAndEntered()
{
  textAlign(LEFT);
  textFont("Arial", 24);
  fill(100);
  text("Phrase " + (current_trial + 1) + " of " + 2, width/2 - 4.0*PPCM, height/2 - 8.1*PPCM);   
  text("Target:    " + target_phrase, width/2 - 4.0*PPCM, height/2 - 7.1*PPCM);
  fill(0);
  text("Entered:  " + currently_typed + "|", width/2 - 4.0*PPCM, height/2 - 6.1*PPCM);
}

// Draws the 'ACCEPT' button that submits a phrase and completes a trial
function drawACCEPT()
{
  textAlign(CENTER);
  textFont("Arial", 24);
  noStroke();
  fill(0, 250, 0);
  rect(width/2 - 2*PPCM, height/2 - 5.1*PPCM, 4.0*PPCM, 2.0*PPCM);
  fill(0);
  text("ACCEPT", width/2, height/2 - 4.1*PPCM);
}

// Draws the finger that simulates the 'fat finger' problem
function drawFatFinger()
{
  imageMode(CORNER);
  image(fingerOcclusion, mouseX - FINGER_OFFSET, mouseY - FINGER_OFFSET, FINGER_SIZE, FINGER_SIZE);
}

// This computes the error between two strings (i.e., the target and entered phrases)
function computeLevenshteinDistance(phrase1, phrase2)
{
  distance = new Array(phrase1.length + 1).fill(null).map(() => new Array(phrase2.length + 1).fill(null));

  for (i = 0; i <= phrase1.length; i++) distance[i][0] = i;
  for (j = 1; j <= phrase2.length; j++) distance[0][j] = j;

  for (i = 1; i <= phrase1.length; i++)
    for (j = 1; j <= phrase2.length; j++)
      distance[i][j] = min(min(distance[i - 1][j] + 1, distance[i][j - 1] + 1), distance[i - 1][j - 1] + ((phrase1.charAt(i - 1) == phrase2.charAt(j - 1)) ? 0 : 1));

  return distance[phrase1.length][phrase2.length];
}

// Checks if a mouse click was within certain bounds (e.g., within a button)
function mouseClickWithin(x, y, w, h)
{
  return (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h);
}