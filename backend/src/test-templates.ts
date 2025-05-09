import { Router, RequestHandler } from "express";
import { GenerateRequestBody, TemplateType } from "./types";

/**
 * This is a test script to verify template-handling logic.
 * You can run this script with ts-node to see how templates are handled.
 */

// Mock request body examples for each template type
const testTemplateRequests: Record<TemplateType, Partial<GenerateRequestBody>> = {
  "product-showcase": {
    description: "Show my product on a clean background",
    productDescription: "A sleek modern watch with leather band",
    productName: "Premium Watch",
    userId: "test-user-id",
    generationId: "test-generation-id",
    template: "product-showcase",
  },
  
  "lifestyle": {
    description: "Show my product being used in real life",
    productDescription: "A sleek modern watch with leather band",
    productName: "Premium Watch",
    userId: "test-user-id",
    generationId: "test-generation-id",
    template: "lifestyle",
    lifestyleDescription: "Active professionals who value quality and style",
    environment: "both",
    timeOfDay: "day",
    activityDescription: "Business meeting in a modern office space",
    moodKeywords: "professional, elegant, sophisticated",
  },
  
  "clothing-showcase": {
    description: "Display my clothing product professionally",
    productDescription: "A premium cotton t-shirt with graphic print",
    productName: "Graphic Tee",
    userId: "test-user-id",
    generationId: "test-generation-id",
    template: "clothing-showcase",
    clothingType: "Cotton t-shirt with round neck and short sleeves",
    shotType: "full-body",
    viewType: "multiple",
  },
  
  "special-offer": {
    description: "Create a promotional ad for my product",
    productDescription: "A sleek modern watch with leather band",
    productName: "Premium Watch",
    userId: "test-user-id",
    generationId: "test-generation-id",
    template: "special-offer",
    offerDescription: "Summer Sale - Limited Time Only",
    price: "$199.99",
    discount: "30% OFF",
  },
};

// Process each template type request through the template handling logic
function processTemplateRequest(template: TemplateType) {
  const request = testTemplateRequests[template];
  
  console.log(`\n\n===== Processing ${template} Template =====`);
  console.log("Request data:", JSON.stringify(request, null, 2));
  
  // Here you would add the actual template handling logic from your generate.ts file
  // For now, we're just logging the request data
  
  console.log(`\nTemplate ${template} would be processed with the specific fields`);
  
  // Display template-specific fields
  if (template === "lifestyle") {
    console.log("Lifestyle specific fields:");
    console.log("- lifestyleDescription:", request.lifestyleDescription);
    console.log("- environment:", request.environment);
    console.log("- timeOfDay:", request.timeOfDay);
    console.log("- activityDescription:", request.activityDescription);
    console.log("- moodKeywords:", request.moodKeywords);
  } 
  else if (template === "clothing-showcase") {
    console.log("Clothing showcase specific fields:");
    console.log("- clothingType:", request.clothingType);
    console.log("- shotType:", request.shotType);
    console.log("- viewType:", request.viewType);
  } 
  else if (template === "special-offer") {
    console.log("Special offer specific fields:");
    console.log("- offerDescription:", request.offerDescription);
    console.log("- price:", request.price);
    console.log("- discount:", request.discount);
  }
}

// Process each template type
console.log("Testing template handling logic\n");
console.log("This script shows how each template type would be processed\n");

Object.keys(testTemplateRequests).forEach((template) => {
  processTemplateRequest(template as TemplateType);
});

console.log("\n\nAll templates processed. This test script helps verify the template handling logic.");
console.log("To test the actual implementation, run the server and make requests from the frontend.");

/**
 * To run this test script:
 * npx ts-node src/test-templates.ts
 */