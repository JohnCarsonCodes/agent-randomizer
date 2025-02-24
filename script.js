/**
 * Script for the Agent Randomizer streaming overlay.
 * This script handles DOM initialization, fetching images from GitHub,
 * and the randomization logic.
 *
 * Ensure that the repository is public (or properly authenticated) so that
 * the GitHub API can list folder contents.
 */

/* ======================= Configuration Constants ======================= */

// Replace these constants with your actual GitHub username and repository name.
const REPO_OWNER = "JohnCarsonCodes"; // Your GitHub username.
const REPO_NAME = "agent-randomizer"; // Repository name.

/* ======================= Utility Functions ======================= */

/**
 * Fetches image file URLs from a specified game folder in the GitHub repository.
 * @param {string} gameName - The selected game name (corresponds to a folder name in assets).
 * @returns {Promise<Array<string>>} - Promise resolving to an array of full image URLs.
 */
function fetchGameImages(gameName) {
  // Construct the folder path. Assumes folder names in the repository are lowercase.
  const folderPath = `assets/${gameName.trim().toLowerCase()}`;
  // Build the GitHub API URL to list the contents of the folder.
  const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderPath}`;

  return fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `GitHub API request failed: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    })
    .then((data) => {
      // Define common image file extensions.
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
      // Filter and return only those files with matching extensions.
      return data
        .filter((item) =>
          imageExtensions.some((ext) => item.name.toLowerCase().endsWith(ext))
        )
        .map((item) => item.download_url);
    })
    .catch((error) => {
      console.error("Error fetching game images:", error);
      return [];
    });
}

/**
 * Randomly shuffles through an array of image URLs with animation,
 * then stops on the final selected image.
 * @param {Array<string>} images - Array of image URLs to shuffle through.
 * @param {number} duration - Total duration for randomization (in seconds).
 * @param {string} animationType - Animation type ("fade" or "slide").
 */
function randomizeSelection(images, duration, animationType) {
  const imageElement = document.getElementById("randomizer-image");
  const totalTime = duration * 1000; // Convert duration to milliseconds.
  const shuffleInterval = 100; // Change image every 100 ms.
  let elapsed = 0;

  // Remove any previous animation classes.
  imageElement.classList.remove("fade-in", "slide-in");

  // Start shuffling images at regular intervals.
  const intervalId = setInterval(() => {
    const randomImage = images[Math.floor(Math.random() * images.length)];
    imageElement.src = randomImage;

    // Restart the animation by forcing a reflow.
    imageElement.classList.remove(
      animationType === "fade" ? "fade-in" : "slide-in"
    );
    void imageElement.offsetWidth; // Force reflow.
    imageElement.classList.add(
      animationType === "fade" ? "fade-in" : "slide-in"
    );

    elapsed += shuffleInterval;
    if (elapsed >= totalTime) {
      clearInterval(intervalId);
      // The final image remains visible.
    }
  }, shuffleInterval);
}

/* ======================= DOM Initialization ======================= */

/**
 * Sets up all DOM event listeners. This function is called after the DOM content is loaded.
 */
function setupDOMListeners() {
  // Toggle the configuration panel's visibility.
  const toggleConfig = document.getElementById("toggle-config");
  if (toggleConfig) {
    toggleConfig.addEventListener("click", () => {
      const configPanel = document.getElementById("config-panel");
      configPanel.classList.toggle("hidden");
    });
  }

  // Show or hide the custom images input field based on the game selection.
  const gameSelect = document.getElementById("game-select");
  if (gameSelect) {
    gameSelect.addEventListener("change", (event) => {
      const customSection = document.getElementById("custom-images-section");
      // Display custom image input only when "custom" is selected.
      customSection.classList.toggle("hidden", event.target.value !== "custom");
    });
  }

  // Apply the user-selected settings and initiate the randomization process.
  const applySettings = document.getElementById("apply-settings");
  if (applySettings) {
    applySettings.addEventListener("click", () => {
      const selectedGame = document.getElementById("game-select").value;
      const duration = parseInt(document.getElementById("duration").value, 10);
      const animationType = document.getElementById("animation").value;

      if (selectedGame === "custom") {
        // Use the manually entered image URLs.
        const customImagesInput =
          document.getElementById("custom-images").value;
        const customImages = customImagesInput
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url);
        if (customImages.length > 0) {
          randomizeSelection(customImages, duration, animationType);
        } else {
          console.error("No custom images provided.");
        }
      } else {
        // Dynamically fetch images from the selected game folder on GitHub.
        fetchGameImages(selectedGame).then((images) => {
          // Debug: Output the array of images to the debug element.
          const debugOutput = document.getElementById("debug-output");
          if (debugOutput) {
            debugOutput.textContent = JSON.stringify(images, null, 2);
          }

          if (images.length > 0) {
            randomizeSelection(images, duration, animationType);
          } else {
            console.error("No images found for the selected game.");
          }
        });
      }
    });
  }
}

// Initialize DOM listeners when the document is ready.
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", setupDOMListeners);
}

module.exports = {
  fetchGameImages,
  randomizeSelection,
  setupDOMListeners,
};
