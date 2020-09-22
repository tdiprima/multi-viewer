// Get random samples of tissue
function main() {
    // Image Information Request URI Syntax
    // {scheme}://{server}{/prefix}/{identifier}/info.json
    // https://example.org/image-service/abcd1234/info.json

    let imgUri = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/tcgaimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E.svs/info.json'
    let transUri = 'https://quip.bmi.stonybrook.edu/iiif/?iiif=/tcgaseg/featureimages/blca/TCGA-2F-A9KO-01Z-00-DX1.195576CF-B739-4BD9-B15B-4A70AE287D3E-featureimage.tif/info.json'
    // console.log('data uri', imgUri);

    fetch(imgUri).then(function (response) {
        // printResponseImageInfo(response);
        return response.json();

    }).then(function (data) {
        // printImageInfo(data);
        getMugshots(data);
        // return console.log(data);
    });

    function getMugshots(data) {
        // Image Request URI Syntax
        // {scheme}://{server}{/prefix}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
        // https://example.org/image-service/abcd1234/full/max/0/default.jpg

        // Grab a tile (just print the uri for now)
        console.log('uri', data['@id'] + '/' + Math.round(data.width / 2) + ',' + Math.round(data.height / 2) + ',256,256/full/0/default.jpg');

    }

    function printResponseImageInfo(response) {
        console.log('response', response.ok)
        console.log('response', response.status)
        console.log('response', response.statusText)
    }

    function printImageInfo(data) {
        console.log('context', data['@context'])
        console.log('id', data['@id'])
        console.log('width', data.width)
        console.log('height', data.height)
        console.log('profile', data.profile[0])
        console.log('profile', data.profile[1])
        console.log('protocol', data.protocol)
        console.log('tiles', data.tiles)
        console.log('xResolution', data.xResolution)
        console.log('yResolution', data.yResolution)
    }

    // Display random samples of tissue

    // Onclick jump to location in slide
}
main();
