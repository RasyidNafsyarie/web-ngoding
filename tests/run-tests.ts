import { testXpCalculation } from "./unit/xp.test";
import { testMdxHeadingExtraction } from "./unit/mdx.test";
import { testValidationSchemas } from "./unit/validation.test";
import { testApiResponseFormats } from "./integration/api.test";

function runAllTests() {
  console.log("=========================================");
  console.log(" 🧪 NGODING SANTUY — TEST SUITE RUNNER  ");
  console.log("=========================================\n");

  try {
    testXpCalculation();
    testMdxHeadingExtraction();
    testValidationSchemas();
    testApiResponseFormats();

    console.log("\n=========================================");
    console.log(" 🎉 SELURUH UNIT & INTEGRATION TEST LULUS!");
    console.log("=========================================\n");
  } catch (error) {
    console.error("\n❌ Uji tes gagal:", error);
    process.exit(1);
  }
}

runAllTests();
