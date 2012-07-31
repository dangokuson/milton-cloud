var initialSelect;
var mtype = '';
var url = '';
var src = '';
var selObj;




CKEDITOR.plugins.add( 'embed_video',
{
    init: function( editor ) {
        log("init embed_video");
        var iconPath = this.path + 'images/icon.png';
        var fileIcon = this.path + "images/file.png";
        var folderIcon = this.path + "images/folder.png";
        var rootIcon = this.path + "images/root.png";
        var jsPath = this.path + "video/javascript";
        var basePath = this.path;
 
        log("vid command");
        editor.addCommand( 'videoDialog', new CKEDITOR.dialogCommand( 'videoDialog' ) );
        log("done command");
 
        editor.ui.addButton( 'Video', {
            label: 'Insert Video',
            command: 'videoDialog',
            icon: iconPath
        } );
        log("done button", iconPath);
 
        if ( editor.contextMenu ) {
            editor.addMenuGroup( 'videoGroup' );
            editor.addMenuItem( 'videoItem',
            {
                label : 'Edit Video',
                icon : iconPath,
                command : 'videoDialog',
                group : 'videoGroup'
            });
            editor.contextMenu.addListener( function( element )
            {
                if ( element )
                    element = element.getAscendant( 'img', true );
                if ( element && !element.isReadOnly() && !element.data( 'cke-realelement' ) )
                    return {
                        videoItem : CKEDITOR.TRISTATE_ON
                    };
                return null;
            });
        }

        // These interfere with page themes, but might need to be put back somehow for editor layout
        // 
        editor.element.getDocument().appendStyleSheet(this.path + 'template.css');
        //        editor.element.getDocument().appendStyleSheet("/static/common/bootstrap.min.css");
        //        editor.element.getDocument().appendStyleSheet("/static/common/bootstrap-responsive.min.css");
        //        editor.element.getDocument().appendStyleSheet("/static/common/bootstrap-image-gallery.min.css");

        /*CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/vendor/jquery.ui.widget.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/tmpl.min.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/load-image.min.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/canvas-to-blob.min.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/bootstrap.min.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/bootstrap-image-gallery.min.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/jquery.iframe-transport.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/canvas-to-blob.js'));
		CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/embed_video/video/upload/js/jquery.fileupload.js'));*/
 
        CKEDITOR.dialog.add( 'videoDialog', function( editor )
        {
            return {
                title : 'Insert/Edit Video',
                minWidth : 750,
                minHeight : 550,
                contents :
                [
                {
                    id : 'video',
                    label : 'Insert/Edit Video',
                    elements :
                    [
                    {
                        type : 'hbox',
                        widths : [ '250px', '500px' ],
                        align : 'right',
                        children :
                        [
                        {
                            type : 'vbox',
                            heights : [ '20px', '450px' ],
                            children :
                            [
                            {
                                type : 'html',
                                html : '<div>Select a video from server</div>' +
                            '		<div>' +
                            '			<input type="button" class="btn-default" onclick="onDeleteNode()" value="Delete File" style="background-color:#FAA732;background-image:-moz-linear-gradient(center top , #FBB450, #F89406);padding:6px;color:#fff;text-shadow:0 -1px 0 rgba(0, 0, 0, 0.25);border-radius:4px;"/>' +
                            '			<input type="button" class="btn-default" onclick="onAddFolder()" value="Add Folder" style="background-color:#DA4F49;background-image:-moz-linear-gradient(center top , #EE5F5B, #BD362F);padding:6px;color:#fff;text-shadow:0 -1px 0 rgba(0, 0, 0, 0.25);border-radius:4px;"/>' +
                            '		</div>'
                            },
                            {
                                type : 'html',
                                html : '<div id="serverTree" class="serverTree" style="height:450px;overflow-y:auto;width:250px;"></div>'
                            }
                            ]
                        },
                        {
                            type : 'vbox',
                            heights : ['80px', '450px'],
                            children :
                            [
                            {
                                type : 'vbox',
                                heights : ['10px', '70px'],
                                children :
                                [
                                {
                                    type : 'html',
                                    html : '<div>Upload a new video</div>'
                                },
                                {
                                    type : 'html',
                                    html : '<div id="uploadDiv"></div>'
                                }
                                ]
                            },
                            {
                                type : 'html',
                                html :	'<div id="previewDiv"></div>'
                            },
                            ]
                        }
                        ]
                    },
                    ]
                }
                ],
                onShow : function() {
                    $("#uploadDiv").html(uploadHtml);
                    $("#previewDiv").html(previewHtml);
                    
                    var sel = editor.getSelection(),
                    element = sel.getStartElement();
                    if ( element )
                        element = element.getAscendant( 'img', true );
 
                    if ( !element || element.getName() != 'img' || element.data( 'cke-realelement' ) ) {
                        element = editor.document.createElement( 'img' );
                        this.insertMode = true;
                    } else {
                        this.insertMode = false;
                        var p = getPathFromHref(window.location.href);
                        p = getFolderPath(p);
                        initialSelect = p;
                        mtype = element.getAttribute("mtype");
                        src = element.getAttribute("src");
                        url = getFolderPath(src); // the url of the video is the parent of the preview image
                        log("update mode", initialSelect, url, mtype, src);
                    }

                    initTree('/', processData, 2);
 
                    this.element = element;
 
                    this.setupContent( this.element );
                    $("#jquery_jplayer_1").jPlayer({
                        ready: function () {
                            $(this).jPlayer("setMedia", {
                                m4v: "",
                                //                                webmv: "",
                                poster: ""
                            });
                        },
                        swfPath: jsPath,
                        supplied: "mp4, ogv, flv",
                        solution:"flash, html",
                        size: {
                            width: "500px",
                            height: "360px",
                            cssClass: "jp-video-360p"
                        }
                    });
                    $("#jquery_jplayer_1").jPlayer("play", 0);

                    e=document.createElement('script');
                    e.type='text/javascript';
                    e.src=basePath + 'video/upload/js/ajax-upload.js';
                    log("ajax upload", e.src);
                    document.getElementsByTagName('head')[0].appendChild(e);
                },
                onOk : function() {
                    log("onOk");
                    var dialog = this,
                    img = this.element;
 
                    img.setAttribute( "url", url );
                    img.setAttribute( "src", url + "/alt-800-455.png" );
                    img.setAttribute("class", "video");
                    if ( this.insertMode ) {
                        editor.insertElement( img );
                    }
                    this.commitContent( img );
                }
            };
        } );
        log("done init");
    }
} );

function initTree(fullUrl, func, deep){
    log("initTree", fullUrl, deep);
    $.ajax( {
        url:fullUrl+"_DAV/PROPFIND?fields=name,href,iscollection&depth="+deep, 
        dataType:"JSON", 
        success: func
    });
}

function makeContent(e, data, cururl) {
    var content = "<ul>";
    var deep = 0;
    var before = new Array(3);
    var lmtype;
    var lurl;

    $.each(e, function(index, test) {
        if ( index == 0 )
        {
            if ( cururl != '')
            {
                content += '<li id="' + test.href + '" class="jstree-closed" rel="folder" mtype="" url="" src="">';
                content += '<ins class="jstree-icon">&nbsp;</ins>';
                content += '<a href="#" class=""><ins class="jstree-icon">&nbsp;</ins>' + test.name + '</a><ul>';
                before[0] = test.href;
            }
        } else {
            if ( cururl != '' && before[deep] != test.href.substring(0, before[deep].length) )
            {
                content += "</ul>";
                deep--;
                if ( before[deep] != test.href.substring(0, before[deep].length) )
                {
                    content += "</ul>";
                    deep--;
                }
            }
            if ( test.iscollection )
            {
                content += '<li id="' + test.href + '" class="jstree-closed" rel="folder" mtype="" url="" src="">';
                content += '<ins class="jstree-icon">&nbsp;</ins>';
                if ( test.href == cururl+'/')
                {
                    content += '<a href="#" class="jstree-clicked"><ins class="jstree-icon">&nbsp;</ins>' + test.name + '</a><ul>';
                    initialSelect = cururl+'/';
                }else{
                    content += '<a href="#" class=""><ins class="jstree-icon">&nbsp;</ins>' + test.name + '</a><ul>';
                }
                deep++;
                before[deep] = test.href;
            } else {
                lurl = '' + test.href
                content += '<li id="' + test.href + '" class="jstree-closed" rel="file" url="' + lurl + '">';
                content += '<ins class="jstree-icon">&nbsp;</ins>';
                content += '<a href="#" class=""><ins class="jstree-icon">&nbsp;</ins>' + test.name + '</a>';
            }
        }
    });
    content += "</ul>";
    return content;
}

function processData(e, data){ 
    var cururl = window.location.href;
    cururl = cururl.substring(0, cururl.lastIndexOf('/'));
    cururl = cururl.substring(28, cururl.length);

    var content = makeContent(e, data, cururl);
    $('#serverTree').html("");
    $('#serverTree').html(content);

    var fileIcon = "/static/ckeditor36/plugins/embed_video/images/file.png";
    var folderIcon = "/static/ckeditor36/plugins/embed_video/images/folder.png";
	
	
    log("processData: initialSelect=", initialSelect);
    $("#serverTree").jstree({
        // the `plugins` array allows you to configure the active plugins on this instance
        "plugins" : ["themes","html_data","ui","crrm","hotkeys", "types", "ui"],
        // each plugin you have included can have its own config object
        "core" : {
            "initially_open" : [ cururl+"/" ]
        },
        "types" : {
            // I set both options to -2, as I do not need depth and children count checking
            // Those two checks may slow jstree a lot, so use only when needed
            "max_depth" : -2,
            "max_children" : -2,
            // I want only `drive` nodes to be root nodes 
            // This will prevent moving or creating any other type as a root node
            "valid_children" : [ "drive" ],
            "types" : {
                // The default type
                "file" : {
                    // I want this type to have no children (so only leaf nodes)
                    // In my case - those are files
                    "valid_children" : "none",
                    // If we specify an icon for the default type it WILL OVERRIDE the theme icons
                    "icon" : {
                        "image" : fileIcon
                    }
                },
                // The `folder` type
                "folder" : {
                    // can have files and other folders inside of it, but NOT `drive` nodes
                    "valid_children" : [ "default", "folder" ],
                    "icon" : {
                        "image" : folderIcon
                    }
                }
            }
        },
        "ui" : {
            // this makes the node with ID node_4 selected onload
            "initially_select" : [ initialSelect ]
        }
    })
    .bind("select_node.jstree", function (e, data) { 
        //if ( data.rslt.obj[0].getAttribute('rel') == 'file')
        //{
        initialSelect = data.rslt.obj[0].id;
        url = data.rslt.obj[0].getAttribute('url');
        log("selectTreeNode: ", src);        
        document.getElementById("fileupload").action = initialSelect.substring(0, initialSelect.lastIndexOf('/')+1) + '_DAV/PUT';
        methodInvoke(url);
    //}
    })
    .bind("open_node.jstree", function (e, data) {
        if ( data.args[0][0] != undefined && data.args[0][0] !='#' )
        {
            if ( data.args[0][0].getAttribute('rel')=='folder' && data.args[0].children().find('li').text() == '' )
            {
                selObj = data.args[0][0];
                log("expand node", data.args[0][0].id);
                initTree(data.args[0][0].id, attachNode, 1);
            } 
        }
			
    });;
}

function attachNode(e, data){
    log("attachNode", e, data);
    var content = makeContent(e, data, '');
    selObj.innerHTML = selObj.innerHTML + content;
}


/**
 * Load the given video into the player.
 *  - url: path to the primary version of the video
 */
function methodInvoke(url) {
    log("methodInvoke", url);
    $("#jquery_jplayer_1").jPlayer("setMedia", {
        //        webmv: url + "/alt-720-576.webm",  
        ogv: url + "/alt-800-455.ogv",        
        flv: url + "/alt-800-455.flv",
        m4v: url + "/alt-800-455.mp4",        
        poster: src
    });
    $("#jquery_jplayer_1").jPlayer({
        solution:"flash, html",
        supplied: "mp4, ogv, flv"
    });
    $("#jquery_jplayer_1").jPlayer("play", 0);
}

function onDeleteNode() {
    log("onDeleteNode");
    if ( initialSelect  ) {
        var rep = window.confirm("Do you really delete this file?");
        if ( rep ) {
            var obj = document.getElementById(initialSelect);
            obj.innerHTML = "";
            obj.parentElement.removeChild(obj);
        }
    }
}

function onAddFolder() {
    log("onAddFolder");
    if ( initialSelect ) {
        var pathID = initialSelect.substring(0, initialSelect.lastIndexOf('/')+1);
        var liObj =  document.createElement( "li" );
        liObj.id = pathID + "new folder";
        liObj.setAttribute("class", "jstree-closed");
        liObj.setAttribute("src", "");
        liObj.setAttribute("rel", "folder");
        liObj.innerHTML = '<ins class="jstree-icon">&nbsp;</ins><a class="" href="#"><ins class="jstree-icon">&nbsp;</ins>new folder</a>';
        document.getElementById(pathID).childNodes[2].appendChild(liObj);
    }
}

function startUpload(filename) {
    log("startUpload");
    if ( filename && initialSelect ) {
        document.getElementById("serverTree").innerHTML = document.getElementById("serverTree").innerHTML.replace("jstree-clicked","");
        var pathID = initialSelect.substring(0, initialSelect.lastIndexOf('/')+1);
        var liObj =  document.createElement( "li" );
        liObj.id = pathID + filename;
        liObj.setAttribute("class", "jstree-open");
        liObj.setAttribute("src", "skins/Big_Buck_Bunny_Trailer_480x270.png");
        liObj.setAttribute("url", "" + pathID + filename);
        liObj.setAttribute("rel", "file");
        liObj.setAttribute("mtype", filename.substring(filename.lastIndexOf('.')+1, filename.length));
        liObj.innerHTML = '<ins class="jstree-icon">&nbsp;</ins><a class="jstree-clicked" href="#"><ins class="jstree-icon">&nbsp;</ins>' + filename + '</a>';
        document.getElementById(pathID).childNodes[2].appendChild(liObj);
    //methodInvoke(filename.substring(filename.lastIndexOf('.')+1, filename.length), "http://dev.video.ettrema.com" + pathID + filename, "http://dev.video.ettrema.com/skins/Big_Buck_Bunny_Trailer_480x270.png");
    }
}

function getInitialSelect() {
    return initialSelect;
}



var uploadHtml;
var previewHtml;

$(function() {
    $.get("upload.html", function(resp) {
        log("got upload html", resp);
        uploadHtml = resp;
    });
    $.get("preview.html", function(resp) {
        log("got previewHtml", resp);
        previewHtml = resp;
    });    
});

