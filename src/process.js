const AdmZip = require('adm-zip');
const tempy = require('tempy');
const fs = require('fs');
const { loggers } = require('winston');
// extract zip

var target = tempy.directory();
// tempy.directory.task((folder) =>{
    // console.log(folder);
    // })
var source = './real.zip';
var zip = new AdmZip(source);
var zipEntries = zip.getEntries(); // an array of ZipEntry records
// zipEntries.forEach(function(zipEntry) {
    //     if (zipEntry.entryName == "_metadata.txt") {
        //             console.log(zipEntry.getData().toString('utf8')); 
        //     }
        // });


// read _metadata.txt
var metadata = zip.getEntry('_metadata.txt');
// try {
//   const data = fs.readFileSync('/Users/joe/test.txt', 'utf8')
//   console.log(data)
// } catch (err) {
//   console.error(err)
// }

var data = metadata.getData();
var lines = Buffer.from(data).toString();
try {
    var a = lines.match(/html-description:\s(\S.*)\n/);
    var description = a[1];
    console.log(description);
} catch(e) {
    console.error('No se encuentra la descripcion')
}




// // outputs the content of some_folder/my_file.txt
// console.log(zip.readAsText("some_folder/my_file.txt")); 
// // extracts the specified file to the specified location
// zip.extractEntryTo(/*entry name*/"some_folder/my_file.txt", /*target path*/"/home/me/tempfolder", /*maintainEntryPath*/false, /*overwrite*/true);
// // extracts everything
// zip.extractAllTo(/*target path*/"/home/me/zipcontent/", /*overwrite*/true);
	






// var source = VIEWS_PATH + fileName + '.tmp';
// var target = VIEWS_PATH + fileName + '.folder.tmp';
// const file = new AdmZip(source);
// file.extractAllTo(target);


// find description page and main simulation file
// put in views

