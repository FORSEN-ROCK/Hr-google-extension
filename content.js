/*
    Convert DOM-object document to string for send to background
*/
function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }
    return html;
}

/*
    Add listener from input message from background
    Take input message with 'action' (command):
        _getContent - build document item and send to background
*/
chrome.extension.onMessage.addListener(function(requestMessage) {
    switch(requestMessage.action) {
        case '_getContent':
            var message = {
                "resume_content": [DOMtoString(document)],
                "action": "parse",
                "resume_source": window.location.host,
                "resume_url": window.location.href
            };
            console.log(message);
            chrome.runtime.sendMessage(JSON.stringify(message), 
                    function(response) {
                        console.log(response);
                    });
            break;
    }
});