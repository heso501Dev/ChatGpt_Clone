import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');




// Declare a variable named loadInterval to store the ID of the interval timer used in the loader function.
let loadInterval;
// Define a function named loader that takes an element as an argument. This function displays a loading animation
// by setting the text content of the given element to an empty string and appending a period to it every 300 milliseconds,
// until the text content reaches the value "....", at which point it is reset to an empty string. The ID of the interval
// timer used in this function is stored in the loadInterval variable.
function loader(element){
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....'){
      element.textContent = '';
    }
  }, 300);
}



// Define a function named typeText that takes two arguments:
// - element: the HTML element to type text into
// - text: the text to type into the element
function typeText(element, text){
  // Declare a variable named index and set its initial value to 0.
  let index = 0;

  // Set an interval timer that types the text into the element by appending each character of the text
  // one by one, until the whole text is typed out. The interval is set to 20 milliseconds.
  let interval = setInterval(() =>{
    // If the index is less than the length of the text, append the next character of the text to the innerHTML of the element
    // and increment the index. Otherwise, clear the interval timer.
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  }, 20);
}


// Create Id for every single message
// Define a function named generateUniqueId that returns a unique ID string consisting of a timestamp and a random hexadecimal number.
function generateUniqueId(){
  // Get the current timestamp in milliseconds and assign it to the timestamp variable.
  const timestamp = Date.now();
  
  // Generate a random number between 0 and 1 and assign it to the randomNumber variable.
  const randomNumber = Math.random();
  
  // Convert the random number to a hexadecimal string and assign it to the hexadecimalString variable.
  const hexadecimalString = randomNumber.toString(16);

  // Return a string that combines the "id-" prefix, the timestamp, and the hexadecimal string using string interpolation.
  return `id-${timestamp}-${hexadecimalString}`;
}




// Define a function named chatStripe that takes three arguments: isAi (a boolean indicating whether the message is from the AI or the user), 
// value (the text content of the message), and uniqueId (a unique identifier for the message).
function chatStripe (isAi, value, uniqueId){
  // Return a string that represents a chat message with the appropriate class names, message content, and unique ID.
  return(
    `
    <div class="wrapper ${isAi && 'ai'}"> <!-- Create a div with class "wrapper". If isAi is true, add class "ai" as well. -->
      <div class="chat"> <!-- Create a div with class "chat". -->
        <div class="profile"> <!-- Create a div with class "profile". -->
          <img src="${isAi ? bot: user}"/> <!-- Create an image element with the source URL specified by the isAi parameter. -->
        </div>
        <div class="message" id=${uniqueId}>${value}</div> <!-- Create a div with class "message" and an ID specified by the uniqueId parameter. -->
      </div>
    </div>
    `
  )
}



// This function handles the form submission
const handleSubmit = async (e)=> {
  e.preventDefault(); // Prevents the default form submission behavior

  const data = new FormData(form); // Creates a new FormData object from the form data
  // Adds the user's chat stripe to the chat container
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  
  form.reset(); // Resets the form fields

  const uniqueId = generateUniqueId(); // Generates a unique ID for the chat stripe
  // Adds the bot's chat stripe with the unique ID to the chat container
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight; // Scrolls to the bottom of the chat container

  const messageDiv = document.getElementById(uniqueId); // Gets the chat stripe with the unique ID

  loader(messageDiv); // Shows a loader animation in the chat stripe


   // fetch data from server -> bot's response

 const response = await fetch(' http://localhost:5000/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: data.get('prompt')
  })
})
if(response.ok){
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  const data = await response.json();
  const parsedData = data.bot.trim();

  typeText(messageDiv, parsedData);
}else{
  const err = await response.text();

  clearInterval(loadInterval);
  messageDiv.innerHTML = "Something went wrong";

  alert(err);
  console.log(err);
}


}



// Adds an event listener to the form for form submission
form.addEventListener('submit', handleSubmit);
// Adds an event listener to the form for keyup events (e.g. when the Enter key is pressed)
form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13){
    handleSubmit(e); // Calls the handleSubmit function if the Enter key is pressed
  }
})
