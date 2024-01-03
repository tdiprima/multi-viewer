// Pseudocode

// feature url
let url = "http://localhost:8888/halcyon/?iiif=file:///data/erich/FeatureStorage/incept3/TCGA_BRCA_TIL/TCGA-E2-A1IG-01Z-00-DX1.C894EEA1-708A-4043-8C60-3BCA98AA751E.zip/info.json";

// regular url
// let url = "http://localhost:8888/iiif/?iiif=http://localhost:8888/HalcyonStorage/nuclearsegmentation2019/coad/TCGA-CM-5348-01Z-00-DX1.2ad0b8f6-684a-41a7-b568-26e97675cce9.zip";

// fake url
// let url = "http://whatever.com";
// let url = "http://whatever.com/somefile";
// let url = "www.whatever.com";

// Code for fetching data

// featureName = data.name
// if feature.name, return feature.name, ELSE:

let sections = url.split("/");
const elementsContainingTCGA = sections.filter(item => item.includes("TCGA"));
// console.log(elementsContainingTCGA);
let longId;
if (elementsContainingTCGA.length > 0) {
  longId = elementsContainingTCGA.pop();
  if (longId.includes(".")) {
    // return this
    console.log(longId.substring(0, longId.indexOf(".")));
  } else {
    // return longId
    console.log(longId);
  }
} else {
  // return url;
  // console.log(url);
  console.log(url.split('/').pop());
}
