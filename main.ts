console.log("Hello, World!");
console.log("This is the main TypeScript file.");

function flattenJson(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(result, flattenJson(obj[key], newKey));
            } else {
                result[newKey] = obj[key];
            }
        }
    }
    return result;
}

// Test case
const nestedJson = {
    name: "John Doe",
    age: 30,
    address: {
        street: "123 Main St",
        city: "Anytown",
        zip: "12345"
    },
    contacts: {
        email: "john.doe@example.com",
        phone: "555-1234"
    },
    hobbies: ["reading", "hiking"]
};

const flattenedJson = flattenJson(nestedJson);
console.log("Original JSON:", nestedJson);
console.log("Hello from new branch");