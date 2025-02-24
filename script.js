/**
 * Fetches image file URLs from a specified game folder in the GitHub repository.
 * @param {string} gameName - The selected game name (should correspond to a folder name in assets).
 * @returns {Promise<Array<string>>} - Promise that resolves to an array of image URLs.
 */
function fetchGameImages(gameName) {
    // Replace these with your actual GitHub username and repository name.
    const repoOwner = 'JohnCarsonCodes';   // e.g., 'johnDoe'
    const repoName = 'agent-randomizer';  // repository name
    // Build the path to the game folder; ensure folder names match (e.g., valorant, marvel-rivals)
    const folderPath = `assets/${gameName.toLowerCase()}`;
    // GitHub API URL to list contents of the folder
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderPath}`;
  
    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Filter out only the image files based on common file extensions.
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];
        return data
          .filter(item => 
            imageExtensions.some(ext => item.name.toLowerCase().endsWith(ext))
          )
          .map(item => item.download_url); // download_url provides the full URL to the image.
      })
      .catch(error => {
        console.error('Error fetching game images:', error);
        return [];
      });
  }
  