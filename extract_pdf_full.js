ObjC.import('Quartz');
ObjC.import('Foundation');

var args = $.NSProcessInfo.processInfo.arguments;
var pdfPath = args.objectAtIndex(args.count - 1).js;

var url = $.NSURL.fileURLWithPath(pdfPath);
var pdfDoc = $.PDFDocument.alloc.initWithURL(url);

if (pdfDoc.isNil()) {
    console.log("Could not load PDF.");
    $.exit(1);
}

var pageCount = pdfDoc.pageCount;
for (var i = 0; i < pageCount; i++) {
    var page = pdfDoc.pageAtIndex(i);
    var pageText = page.string.js;
    console.log("--- PAGE " + (i+1) + " ---");
    if (pageText) {
        console.log(pageText.substring(0, 500) + "... [TRUNCATED]"); // Just to get an overview without overflowing output
    }
}
