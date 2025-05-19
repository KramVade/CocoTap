// List of valid registration keys
export const validKeys = [
    // Add your valid 20-character keys here
    'EXAMPLE_KEY_1234567890',
    // You can add more keys as needed
];

// Function to validate a key
export const isValidKey = (key) => {
    return validKeys.includes(key);
}; 