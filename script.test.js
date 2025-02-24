// script.test.js

// Import the function you want to test. Depending on your project setup,
// you might need to adjust the import style (e.g., using ES Modules or CommonJS).
// For this example, we assume that fetchGameImages is exported from script.js.
const { fetchGameImages } = require('./script.js');

// Mocking the global fetch function.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        // Sample API response simulating files in the folder.
        { name: "image1.png", download_url: "https://example.com/image1.png" },
        { name: "image2.jpg", download_url: "https://example.com/image2.jpg" },
        { name: "document.txt", download_url: "https://example.com/document.txt" } // non-image file
      ])
  })
);

describe("fetchGameImages", () => {
  it("should return an array of image URL strings", async () => {
    const gameName = "valorant"; // The folder name in your repository.
    const images = await fetchGameImages(gameName);

    // Check that the return value is an array.
    expect(Array.isArray(images)).toBe(true);
    
    // Check that each element in the array is a string and looks like a URL.
    images.forEach(url => {
      expect(typeof url).toBe("string");
      expect(url).toMatch(/^https?:\/\//);
    });
    
    // Verify that only image files are returned (document.txt should be filtered out).
    expect(images).toEqual([
      "https://example.com/image1.png",
      "https://example.com/image2.jpg"
    ]);
  });
});
