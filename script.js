// Global fieldData variable that will hold the configuration values.
let fieldData = {};

/**
 * Fetches image URLs from a specified game folder in your GitHub repository.
 * @param {string} gameName - The selected game name (folder in assets).
 * @returns {Promise<Array<string>>} - Resolves to an array of image URLs.
 */
function fetchGameImages(gameName) {
  const folderPath = `assets/${gameName.trim().toLowerCase()}`;
  const apiUrl = `https://api.github.com/repos/JohnCarsonCodes/agent-randomizer/contents/${folderPath}`;
  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
      return data
        .filter(item => imageExtensions.some(ext => item.name.toLowerCase().endsWith(ext)))
        .map(item => item.download_url);
    })
    .catch(error => {
      console.error('Error fetching game images:', error);
      return [];
    });
}

/**
 * Randomly shuffles through an array of image URLs and updates the image element.
 * @param {Array<string>} images - Array of image URLs.
 * @param {number} duration - Duration of randomization (in seconds).
 * @param {number} intervalTime - Milliseconds between each update.
 * @param {string} animationType - Animation type ("flip", "spin", "fade", "slide", "zoom", or "wipe").
 * @param {boolean} enableAnimation - Whether animations are enabled.
 */
function randomizeSelection(images, duration, intervalTime, animationType, enableAnimation) {
  const imageElement = document.getElementById("randomizer-image");
  const totalTime = duration * 1000; // Convert seconds to milliseconds
  let elapsed = 0;
  
  const intervalId = setInterval(() => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    console.log("Updating image to:", randomImage);
    imageElement.src = randomImage;
    
    if (enableAnimation) {
      // Remove previous animation classes.
      imageElement.classList.remove("flip", "spin", "fade-in", "slide-in", "zoom", "wipe");
      // Force a reflow so that the animation restarts.
      void imageElement.offsetWidth;
      // Set the animation duration dynamically based on intervalTime.
      imageElement.style.animationDuration = intervalTime + "ms";
      // Apply the selected animation class.
      switch (animationType) {
        case "flip":
          imageElement.classList.add("flip");
          break;
        case "spin":
          imageElement.classList.add("spin");
          break;
        case "fade":
          imageElement.classList.add("fade-in");
          break;
        case "slide":
          imageElement.classList.add("slide-in");
          break;
        case "zoom":
          imageElement.classList.add("zoom");
          break;
        case "wipe":
          imageElement.classList.add("wipe");
          break;
        default:
          break;
      }
    }
    
    elapsed += intervalTime;
    if (elapsed >= totalTime) {
      clearInterval(intervalId);
      console.log("Randomization complete.");
    }
  }, intervalTime);
}

/**
 * Main function to initiate the randomization process.
 * Makes the overlay visible, starts randomization, then fades out the overlay.
 */
function startRandomization() {
  // Get the container element using its class "main-container".
  const container = document.querySelector(".main-container");
  
  // Fade in: make the container visible.
  container.style.visibility = "visible";
  container.style.opacity = 1;
  
  // Retrieve settings from fieldData.
  const gameSelection = fieldData.game || "valorant";
  const animationDuration = parseInt(fieldData.duration || "6", 10); // Animation duration (in seconds)
  const intervalTime = parseInt(fieldData.interval || "250", 10);     // Milliseconds between updates
  const overlayLength = parseInt(fieldData.length || "10", 10);       // Total seconds the overlay stays active
  // const customImages = fieldData.customImages || [];
  const animationEnabled = (fieldData.animation && fieldData.animation.toLowerCase() === "yes");
  const animationType = fieldData.animationType || "flip";
  
  // Start the randomization process.
  if (gameSelection === "custom" && customImages.length > 0) {
    randomizeSelection(customImages, animationDuration, intervalTime, animationType, animationEnabled);
  } else {
    fetchGameImages(gameSelection)
      .then(images => {
        console.log("Fetched images:", images);
        if (images.length > 0) {
          randomizeSelection(images, animationDuration, intervalTime, animationType, animationEnabled);
        } else {
          console.error("No images found for the selected game.");
        }
      });
  }
  
  // After the overlay stays active for 'overlayLength' seconds, fade it out.
  setTimeout(() => {
    container.style.opacity = 0;
    // After the 400ms transition (matches container CSS), hide the container.
    setTimeout(() => {
      container.style.visibility = "hidden";
    }, 400);
  }, overlayLength * 1000);
}

/* --------------------------
   Event Listeners for Streamelements
   -------------------------- */

/**
 * onWidgetLoad event: Called when the widget loads.
 * Stores the field data from the widget's configuration.
 */
window.addEventListener('onWidgetLoad', function(obj) {
  fieldData = obj.detail.fieldData;
  console.log("Widget loaded. Field data:", fieldData);
});

/**
 * onEventReceived event: Called when an event (like a chat message) is received.
 * Checks if the message text matches our randomize command.
 */
window.addEventListener('onEventReceived', function(obj) {
  if (obj.detail.listener === "message" && obj.detail.event && obj.detail.event.data) {
    const data = obj.detail.event.data;
    const receivedCommand = data.text.trim().toLowerCase();
    const expectedCommand = (fieldData.randomizeCommand || "!agent").toLowerCase();
    console.log("Received command:", receivedCommand, "| Expected command:", expectedCommand);
    if (receivedCommand === expectedCommand) {
      console.log("Command matched, starting randomization.");
      startRandomization();
    }
  }
});
