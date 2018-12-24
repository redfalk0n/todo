//if ("onhashchange" in window) {
//    window.onhashchange = previewWithHashTag;
//}

var getLibraryCommand = 'library';
var getMediaLibrariesCommand = 'listMediaLibraries';
var deleteLibraryItems = 'deleterid';
//var pageSize = 50;
var pageSize = 50;
//var shareURL = "http://cinco.ly!";
var shareURL = "https://cincopa.com/~";
//var hasFlash = false;
var videoFileDuration = 0;
var analyticsUrl = "//analytics.cincopa.com/api_fid.aspx";
var browse_upload_thumb_limit = 4;
var browse_extra_files_limit = 20;
var changed_count = true;
var changed_count_extra = true;
var changed_count_subtitles = true;
var hash_existed = true;
var find_details = '';
var currentEditingItemID, lastCreatedAnnotationIndex, lastCreatedCtaIndex;
var showAsset = false;
var disableLoad = false;
var activeTab = "info";
var seo_html = "";
var allTags = [];
var copyRefs = [], copyElem, copyElemHtml,copyElemShare;
var embed_fid, default_fid;
var annotationTemp = [], ctaTemp = [];
var currentEditingAnnotation = null;
var mediaLibraries = [];
var subtitlesCount = 0;
if ("onhashchange" in window) {
    window.onhashchange = function () {
        if(event.oldURL && event.oldURL.indexOf("details=") > -1){ // this is for when click browser back button, when details is opened
            $('#libraryHeadAsset .back_toassets').trigger("click");
        }

        if (disableLoad) {
            disableLoad = false;
            return;
        } else {
            previewWithHashTag();
        }
    }
}

function previewWithHashTag() {
    main_funcs = new LibraryControl($);
    main_funcs.hashActionExist();
}

//try {
//    var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
//    if (fo) {
//        hasFlash = true;
//    }
//} catch (e) {
//    if (navigator.mimeTypes ["application/x-shockwave-flash"] != undefined) {
//        hasFlash = true;
//    }
//}

var _videoCurrentTime = 0;
function onVideoEvents(eventName, data) {
    if (eventName == 'video.pause') {
        $('#add_thumb_sec, #add_annotation').hide();
    } else if (eventName == 'video.play') {
        if(activeTab == "thumbnail"){
            $('#add_annotation').hide();
            $('#add_thumb_sec').show();
        } else if (activeTab == "timeline" || activeTab == "annotations" || activeTab == "callforaction"){
            $('#add_thumb_sec').hide();
            $('#add_annotation').show();
        } else {
            $('#add_thumb_sec').hide();
            $('#add_annotation').hide();
        }
    } else if (eventName == 'video.timeupdate') {
        if(activeTab == "thumbnail"){
            $('#add_annotation').hide();
            $('#add_thumb_sec').show();
        } else if (activeTab == "timeline" || activeTab == "annotations" || activeTab == "callforaction"){
            $('#add_thumb_sec').hide();
            $('#add_annotation').show();
        } else {
            $('#add_thumb_sec').hide();
            $('#add_annotation').hide();
        }
        _videoCurrentTime = data.second;
        _this.showAnnotationBox(data.second);
        _this.showCta(data.second);
    } else if (eventName == 'video.load'){
        if(activeTab == "annotations"){
            $("#" + new_guid).find(".mejs-controls").addClass("force_visible");
        } else {
            $("#" + new_guid).find(".mejs-controls").removeClass("force_visible");
        }
        $(".ze_annotation_placeholder").height($(".mejs-container").outerHeight())
        _this.drawTimelineAnnotationBox();
        _this.showCta("preroll");
    } else if (eventName == 'video.ended'){
        _this.showCta("postroll");
    }
}



function cp_apiready(evantName, player) {
    _this.player = player;
}

var Library = null;
$(document).ready(function () {
    __user_feature['integration-youtube-uploader']={}
    __user_feature['integration-youtube-uploader'].value ="true";
    Library = new LibraryControl($);
    Library.initialize();
    $(document).on('click', '[data-action]', function () {
        var action = $(this).attr('data-action');
        trackAndGo(action);
    });

//dropdown action for Upload button sideMenuControls
    $('.sideMenuControls').find('.upload_files').on('click', function () {
//$(this).find('.hint').hide();
        var actionsMenu = $(this).parents('.sideMenuControls').find('.itemsDropdown.actionsMenu');
        showHidePopups($(this), actionsMenu);
        return false;
    });
    /*$('.sideMenuControls').find('.upload_files').hover( function() {
     $(this).find('.hint').show();
     }, function() {
     $(this).find('.hint').hide();
     });*/
    $('.itemsDropdown.actionsMenu').mouseleave(function () {
        $(this).fadeOut();
        $(this).parents('.sideMenuControls').find('.upload_files').removeClass('active');
    });
//End dropdown for Upload button

    $('#libraryContainer').on('click', '.more_description', function () {
//$(this).parents('.item_name_desc').find('.description').css('-webkit-line-clamp','500');
        $(this).parents('.item_name_desc').find('.description').addClass('description_opened');
        $(this).text('less');
        $(this).removeClass('more_description').addClass('less_description');
    });
    $('#libraryContainer').on('click', '.less_description', function () {
//$(this).parents('.item_name_desc').find('.description').css('-webkit-line-clamp','2');
        $(this).parents('.item_name_desc').find('.description').removeClass('description_opened');
        $(this).text('more');
        $(this).removeClass('less_description').addClass('more_description');
    });

    $("body").on("mouseover", ".posterUploadedImages .thumbImage", function () {
        $(this).find(".remove_upload_file").show();
    });

    $("body").on("mouseleave", ".posterUploadedImages .thumbImage", function () {
        $(this).find(".remove_upload_file").hide();
    });

    $('body').on('keyup keypress', "form", function (e) {
        var code = e.keyCode || e.which;
        if (code == 13 && !$(e.target).is("textarea") && !$(this).is(".changeName")) {
            e.preventDefault();
            return false;
        }
    });
    _this.libraryContainer.on('click', ".analytics_domain_div .weekly_views", function () {
        var domainsList = $(this).find('.itemsDropdown.domainsList');
        if (!domainsList.hasClass('notEmpty')) {
            var rid = $(this).parents('.library-line').attr('data-rid');
            drawDomainsList(rid, _this.mediaItems[rid]['domains'])
        }
        showHidePopups($(this), domainsList);
        return false;
    });

    _this.libraryContainer.on('click', ".analytics_div .infolder", function (e) {
        if($(e.target).hasClass("domainpage")){
            var fid = $(e.target).attr("data-fid");
            checking_hash("fid", fid);
            _this.showWorking();
        }
        var galleriesList = $(this).find('.itemsDropdown.galleriesList');
        if (!galleriesList.hasClass('notEmptyGalleriesList')) {
            var rid = $(this).parents('.library-line').attr('data-rid');
            _this.getGalleries(rid, $(this));
//drawGalleriesList(_this.mediaItems[rid]['galleriesList'], rid)
        } else {
            showHidePopups($(this), galleriesList);
        }
        return false;
    });

    $('#libraryHead, .librarySideMenu').on('click', function () {
        $('.itemsDropdown').hide();
        $('.all_actions_block .more.active, .analytics_domain_div .weekly_views.active, .analytics_div .infolder.active').removeClass('active');
    });

    _this.libraryContainer.on('click', '.library-line', function (e) {
        if ($(e.target).hasClass('icon-download') || $(e.target).hasClass('domainpage') || $(e.target).closest('.tagsList').length) {
            return true;
        }
        if ($(e.target).parents().hasClass('domainsList') || $(e.target).parents().hasClass('galleriesList')) {
            return false;
        }
        $('.all_actions_block .more.active, .analytics_domain_div .weekly_views.active, .analytics_div .infolder.active').removeClass('active');
        $('.itemsDropdown').find('.itemsDropdown_head').slideUp('slow');
        $('.itemsDropdown').find('.itemsDropdown_items').fadeOut('slow', function () {
            $(this).parents('.itemsDropdown').hide();
        });
    });

    $(document).on("input", ".extraFileType", function(){
        if($(this).val() == ""){
            $(this).parents(".upload_box").find(".uploadBtn").addClass("disabled");
            $("#upload_extrafile_btn").prop("disabled", true);
        } else {
            $(this).parents(".upload_box").find(".uploadBtn").removeClass("disabled");
            $("#upload_extrafile_btn").prop("disabled", false);
        }
    });
//download button limitation
    $(document).on("click", ".download_action", function(){
        if(__user_feature['ui-assets-allow-download'].value === 'true'){
            window.open($(this).attr('data-href'),'_self');
        } else {
            openFeaturesModal(__user_feature['ui-assets-allow-download'].upgrade_text);
        }
    });
    $('.headRight .bluetext').on('click', function (){
        if($(this).hasClass("preventDoubleClick")) return false;
        $(this).addClass("preventDoubleClick");
        _this.libraryContainer.find(".library-line:not(.uploading)").remove();
        _this.showWorking();
        _this.hashActionExist();
        return false;
    });



    rid_by_views();

});

function openFeaturesModal(msg){
    var popHtml = "";
    msg = msg || 'This feature is not available for this plan' ;
    popHtml += '<div class="modalContainer premiumContainer">'
        +'<div class="modalHeader">'
        +'<span>Premium feature</span>'
        +'</div>'
        +'<div class="modalContent">'
        +'<div class="infoBlock">'
        +'<p>'+msg+'</p>'
        +'</div>'
        +'<a class="btn blue LearnMore" href="/pricing">Learn More</a>'
        +'</div>'
        +'</div>';
    openModal(popHtml, 500, 200);
}
function rid_by_views(){
    $.ajax({
        url: "//www.cincopa.com/media-platform/api/redis?disable_editor=y&cmd=topuserres&stats=fid-views-stats&end=-1",
        success: function(d){
            if(d.aslist){
                for(var i=0; i< d.aslist.length; i += 2){
                    if(d.aslist[i] == '0') continue;
                    if(i > 100) break;
                    riduserlist += d.aslist[i]+',';
                }
            }
        }
    })
}

function drawDomainsList(rid, statsArray) {
    var htm = '', counter = 1, emptyList = true, view;
    var domain_hits_array = new Array(), url_hits_array = new Array();
    for (var domain in statsArray) {
        if(domain_hits_array.indexOf(statsArray[domain]['hits']) == -1)
            domain_hits_array.push(statsArray[domain]['hits']);
    }
    domain_hits_array.sort(compareNumeric);
    for (var array_count = 0; array_count <= domain_hits_array.length; array_count++) {
        for (var domain in statsArray) {
            if (statsArray[domain]['hits'] == domain_hits_array[array_count]) {
                emptyList = false;
                htm += '<li><div class="domains expandable">';
                var urlsCount = '';
                var statsUrlArray = statsArray[domain]['urlList'];
                urlsCount = objectSize(statsUrlArray);
                htm += "<div><a class='domainname'>" + domain + "</a><i>" + (nFormatter(statsArray[domain]['hits'])) + "</i><div>";
                htm += "<div class='urlList'>";
                url_hits_array = new Array();
                for (var url in statsUrlArray) {
                    url_hits_array.push(statsUrlArray[url].hits)
                }
                url_hits_array.sort(compareNumeric);
                for (var url_array_count = 0; url_array_count <= url_hits_array.length; url_array_count++) {
                    for (var url in statsUrlArray) {

                        if (statsUrlArray[url].hits == url_hits_array[url_array_count]) {
                            url_title = url;
                            if (url_title.length > 80) {
                                url_title = url_title.substr(0, 80) + '...';
                            }
                            htm += "<a class='domainpage' href='" + (url_title == "unknown" ? "#" : url) + "'>" + url_title + "</a><i>Total Views: " + (nFormatter(statsUrlArray[url].hits)) + "</i>";
                            break;
                        }
                    }
                }
                htm += "</div>";
                htm += "</li>";
            }
        }
    }
    if (!emptyList) {
        $('.library-line[data-rid="' + rid + '"] .domainsList .itemsDropdown_items .emptyDomains').remove();
    }
    $('.library-line[data-rid="' + rid + '"] .domainsList .itemsDropdown_items ul').html(htm);
    if ($('.library-line[data-rid="' + rid + '"] .domainsList .itemsDropdown_items ul li').length != 0) {
        $('.library-line[data-rid="' + rid + '"] .domainsList').addClass('notEmpty');
    }
    $('.library-line[data-rid="' + rid + '"] .domainsList .itemsDropdown_items .expandable').on('click', function (e) {
        e.stopPropagation();
        if ($(e.target).hasClass('domainpage')) {
            window.open($(e.target).attr('href'), '_blank');
            return false;
        }
        showHideUrls($(this));
    });
}

function drawGalleriesList(list, rid) {
    var previewLink = "https://cincopa.com/media-platform/wizard2/library15#fid="
    var galleriesList = $('.library-line[data-rid="' + rid + '"] .itemsDropdown.galleriesList');
    if (galleriesList.hasClass("notEmptyGalleriesList"))
        return;
    var htm = "";
    if (typeof list == 'undefined')
        return;
    if (list.length) {
        galleriesList.addClass("notEmptyGalleriesList");
        galleriesList.find(".emptyGalleries").remove();
    }

    for (var i = 0; i < list.length; i++) {
        htm += "<li><a data-fid='" + list[i].did + "' class='domainpage' href='" + previewLink + list[i].did + "'>" + list[i].name + "  (" + list[i].did + ")</a>"
    }
    $('.library-line[data-rid="' + rid + '"] .itemsDropdown.galleriesList ul').html(htm);

}

function showHideUrls(url) {
    if (url.find('.urlList').hasClass('active')) {
        url.removeClass('active');
        url.find('.urlList i').hide();
        url.find('.urlList').removeClass('active').fadeOut('slow');
    } else {
        url.addClass('active');
        url.find('.urlList i').show();
        url.find('.urlList').addClass('active').show();
    }
}

function showHidePopups(obj, popup) {
    $('.all_actions_block .more.active, .analytics_domain_div .weekly_views.active, .analytics_div .infolder.active').not(obj).removeClass('active');
    $('.itemsDropdown').not(popup).hide();
    if (obj.hasClass('active')) {
        obj.removeClass('active');
        popup.find('.itemsDropdown_head').slideUp('slow');
        popup.find('.itemsDropdown_items').fadeOut('slow', function () {
            popup.hide();
        });
    } else {
        obj.addClass('active');
        popup.find('.itemsDropdown_head, .itemsDropdown_items').hide();
        popup.show();
        if(!popup.find('.itemsDropdown_head').hasClass("forcehide"))
            popup.find('.itemsDropdown_head').slideDown('slow');
        popup.find('.itemsDropdown_items').fadeIn('slow');
    }
}

function removedMessage(count) {
    $('.removed_items_box').html('<span class="deleted">' + (count > 1 ? "These " + count + " files have" : "This file has") + ' been deleted!</span><div class="trash"></div>');
    $('.removed_items_box').show();
    setTimeout(function () {
        $('.removed_items_box').fadeOut();
    }, 5000);
}

function checking_hash(filter_var, filter_value) {
    l_hash = location.hash;
    if (filter_value != 0) {
        if (l_hash != '' && l_hash != '#__') {
            if (l_hash.indexOf(filter_var) > -1) {
                arr_hash = l_hash.split('|');
                $.each(arr_hash, function (i, v) {
                    if (v.indexOf(filter_var) > -1) {
                        filter_arr = splitTwoParts(v, '=');
                        filter_val = filter_arr[1];
                        return false;
                    }
                });

                new_loc_hash = l_hash.replace(filter_val, filter_value);
                location.hash = new_loc_hash;
            } else {
                location.hash = location.hash + '|' + filter_var + '=' + filter_value;
            }
        } else {
            location.hash = '#' + filter_var + '=' + filter_value;
        }
    } else {
        if (l_hash != '' && l_hash != '#__') {
            if (l_hash.indexOf(filter_var) > -1) {
                arr_hash = l_hash.split('|');
                $.each(arr_hash, function (i, v) {
                    if (v.indexOf(filter_var) > -1) {
                        filter_arr = splitTwoParts(v, '=');
                        filter_var_name = filter_arr[0];
                        filter_val = filter_arr[1];
                        return false;
                    }
                });
                filter_start_num = l_hash.indexOf(filter_var_name);

                new_loc_hash = l_hash.replace(filter_var_name + '=', '');
                new_loc_hash = new_loc_hash.replace(filter_val, '');
                if (new_loc_hash.substr((filter_start_num * 1 - 1), 1) == '|' || new_loc_hash.substr((filter_start_num * 1 - 1), 1) == '#') {
                    new_loc_hash = new_loc_hash.slice(0, (filter_start_num * 1 - 1)) + new_loc_hash.slice(filter_start_num);
                }
                if ((new_loc_hash.substr(0, 1)) == '|') {
                    new_loc_hash = new_loc_hash.slice(1, new_loc_hash.length);
                }
            }
            if (new_loc_hash == '' && $('#libraryContainer .library-line').length > 1) {
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
            if (new_loc_hash == '') {
                location.hash = "#__";
            } else {
                location.hash = new_loc_hash;
            }
        }
    }
}

function splitTwoParts(str, char){
    var ind = str.indexOf(char);
    if(ind != -1){
        return [str.substring(0, ind), str.substring(ind +1 )]
    }
}

function appendSeoText(textarea, embedCode) {
    var iframeCode = embedCode;
    if (textarea == "embed" || typeof textarea == "undefined") {
        var embedCode = embedCode || $("#reg_html").val();
        embedCode = embedCode.replace("</noscript>", seo_html);
        $("#reg_html").val(embedCode)
    }
// if (textarea == "iframe" || typeof textarea == "undefined") {
//     var iframeCode = iframeCode || $("#copy_embed").val();
//     iframeCode = iframeCode + "<noscript>" + seo_html;
//     $("#copy_embed").val(iframeCode)
// }
}
function srtParser(data) {
    function strip(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }
    srt = data.replace(/\r\n|\r|\n/g, '\n');
    srt = strip(srt);
    var srt_ = srt.split('\n\n');
    var text = "";
    for (s in srt_) {
        st = srt_[s].trim().split('\n');
        if (st.length >= 2) {
            t = st[2];
            if (st.length > 2) {
                for (j = 3; j < st.length; j++)
                    t += " " + st[j];
            }
            text += '<span>' + t + '</span>';
        }
    }
    return text;
}

function editData(ev){
    var parent = $(ev.target).closest("div");
    var changeName = parent.next(".changeName");
    parent.fadeOut(function(){
        changeName.find("input").val( parent.find("i").text());
        changeName.fadeIn(function(){
            changeName.find("input").focus();
        });
    })
}

function editDesc(ev){
    var parent = $(ev.target).closest("div");
    var changeDesc = parent.next(".changeDescription");
    parent.fadeOut(function(){
        changeDesc.find("textarea").val( parent.find("i").text());
        changeDesc.fadeIn(function(){
            changeDesc.find("textarea").focus();
        });
    })
}

function cancelAssetEdit(ev){
    var changeName = $(ev.target).closest("div.changeName, div.changeDescription");
    changeName.fadeOut(function(){
        changeName.prev("div").fadeIn();
    });
}

function changeAssetCaption(fid, event){
    var changeName = $(event.target).closest("div.changeName")
    var caption = changeName.find("input").val();
    var cdm = 'updateid';
    var url = 'rid=' + fid + '&caption=' + caption;
    _this.invoke(cdm, url, function(){
        _this.mediaItems[fid].caption = caption;
        changeName.prev().find(">i").text(caption);
    }, "");
    cancelAssetEdit(event);
}

function changeAssetDescription(fid, event){
    var changeDesc = $(event.target).closest("div.changeDescription")
    var description = changeDesc.find("textarea").val();
    var cdm = 'updateid';
    var url = 'rid=' + fid + '&description=' + description;
    _this.invoke(cdm, url, function(){
        _this.mediaItems[fid].description = description;
        changeDesc.prev().find(">i").text(description)
    }, "");

    cancelAssetEdit(event);
}

function playStoryBoard(rid, lineElement){
    var json = _this.mediaItems[rid];
    var storyBoardUrl = "";
    if(json.versions && json.versions.jpg_sb_200x150 && json.versions.jpg_sb_200x150.url){
        storyBoardUrl = json.versions.jpg_sb_200x150.url;
    }
    if(!storyBoardUrl) return;

    var w = json.exif.width;
    var h = json.exif.height;
    var aspect_ratio = w/h || 1.33;
    var thumbDiv = lineElement.find(".thumb>div");
    var timeDiv = thumbDiv.find(".thumb-time");
    var initialSec = timeDiv.text();
    var dur = hmsToSecondsOnly(json.exif.duration);
    var ni = new Image();
    ni.src = storyBoardUrl;
    ni.onload = function () {
        var sb_interval = null;
        thumbDiv.on("mouseenter", function(ev){
            thumbDiv.addClass("playing_story_board");
            setTimeout(function(){
                if(thumbDiv.hasClass("playing_story_board")){
                    thumbDiv.addClass("flash_animation");
                }
            }, 2500)

            var sb_w = 200, sb_h = 150;
            var containerDiv = $("<div>").addClass("ze-inline-sb-wrap");
            var padding = thumbDiv.css("padding");
            containerDiv.css({
                "width" : "100%",
                "height" : "100%",
                "background" : "#ffffff",
                "position" : "absolute",
                "margin": padding,
                "top": 0,
                "left" : 0,
                "z-index": 5000,
                "overflow": "hidden"
            });

            var sbDiv = $("<div>").addClass("ze-inline-sb");

            sbDiv.css({
                'background-image': 'url(' + storyBoardUrl.replace(/\(|\)/g, "") + ')',
                'background-repeat': 'no-repeat',
                "width" : sb_w + "px",
                "height" : sb_h + "px",
                "position": "absolute",
                "top": "0",
                "bottom": "0",
                "left": "0",
                "right": "0",
                "margin": "auto"
            });

            sbDiv.appendTo(containerDiv);
            var index = 0;
            if(thumbDiv.find(".ze-inline-sb-wrap").length == 0){
                containerDiv.appendTo(thumbDiv);
                showInlineStoryboard(sbDiv, dur, ev, aspect_ratio, timeDiv);
            }
        });
        var mouseTimer;
        thumbDiv.on("mouseleave", function(){

            thumbDiv.removeClass("playing_story_board flash_animation");
            clearTimeout(mouseTimer);
            thumbDiv.find(".ze-inline-sb-wrap").remove();
            timeDiv.text(initialSec);
        });

        thumbDiv.on("mousemove", function(ev){
            showInlineStoryboard(thumbDiv.find(".ze-inline-sb"), dur, ev, aspect_ratio, timeDiv);
        });
    };
    ni.onerror = function () {
    }
}

function showInlineStoryboard(sbDiv,duration, ev, aspect_ratio, timeDiv){

    var sb_w = 200, sb_h = 150;
    var row, col;
    var frameC;
    if (duration <= 120) {  // video duration < 2 min, frame for every sec
        frameC = 1;
    } else if (duration > 120 && duration <= 300) { // video 2min < duration < 5 min, frame for every 2 sec
        frameC = 2;
    } else if (duration > 300 && duration <= 900) { //video 5min < duration < 15 min, frame for every 5 sec
        frameC = 5;
    } else { //video  duration > 15 min, frame for every 10 sec
        frameC = 10;
    }
    var frameCount = Math.ceil(duration/frameC);
    var minOffset = 0, maxOffset = 222;
    var frameWidth = maxOffset/frameCount;
    var index = Math.floor(ev.offsetX/frameWidth);

    var diff = 0;
    if(aspect_ratio > 1){

        var chapterThumbH = sb_w/ aspect_ratio;
        diff = (sb_h - chapterThumbH) / 2;
        sbDiv.height(chapterThumbH);
    } else {
        var chapterThumbW = parseInt(sb_h * aspect_ratio);
        diff = (sb_w - chapterThumbW) / 2;
        sbDiv.height(sb_h);
        sbDiv.width(chapterThumbW);
    }

    var currentSec = Math.min(Math.max(0, index*frameC), duration);
    timeDiv.text(secondsToMS(currentSec))
    if (index < 10) {
        col = index;
    } else {
        col = index % 10;
    }
    row = parseInt(index / 10);
    var bgX, bgY;
    if (aspect_ratio > 1) {
        var positionY = -diff + (-row * sb_h);
        bgX = (-col * sb_w);
        bgY = positionY;
        if(bgX <= 0){
            sbDiv.css({
                'background-position-x': bgX + 'px',
                'background-position-y': bgY + 'px',
                'background-repeat': 'no-repeat'
            });
        }
    } else {
        var positionX = -diff + (-col * sb_w);
        bgX = positionX;
        bgY = (-row * sb_h)
        sbDiv.css({
            'background-position-x': bgX + 'px',
            'background-position-y': bgY + 'px',
            'background-repeat': 'no-repeat'
        });
    }
}

function LibraryControl($) {
    _this = this;
    this.hash_fid = '';
    this.hash_sort = '';
    this.hash_filter = '';
    this.hash_details = '';
    this.find_details = '';
    this.tagsStr = '';
    this.mediaItems = new Object();
    this.tagSearchCtl = new Array();
    this.itemsToDelete = '';
    this.itemsToCopy = '';
    this.currentPageNumber = 1;
    this.searchBlock = $('#libraryHead div.searchbox');
    this.copyDeleteBlock = $('#libraryHead div.copy_delete_block');
    this.searchBox = $('.library-head .searchbox');
    this.searchTextCtl = $('input.search_input');
    this.searchImgCtl = $('.library-head .searchbox .search_img');
    this.typeSearchCtl = $('#dropdownTypes');
    this.byGalleryFilterCtl = $('#dropdownGalleries');
    this.byUsageCtl = $('#dropdownUsage');
    this.tagsCloud = $('#tagsCloud');
    this.usageSearchCtl = $('#dropdownUsage');
    this.tagsFilterBlock = $('.tagsFilterBlock');
    this.libraryContainer = $('#libraryContainer');
    this.libraryHead = $('.libraryHead');
    this.otherActionsBlock = $('.other_actions_block');
    this.assetEditor = $('.assetEditor');
    this.uploadButton = $('.librarySideMenu .sideMenuControls');
    this.libraryHeadRight = $('.library-head .headRight');
    this.libraryArea = $('.libraryArea');
    this.loadMore = $('.libraryArea .load_more');
    this.lineView = $('.last_added_grid_view .line_view');
    this.normalView = $('.last_added_grid_view .normal_view');
    this.gridView = $('.last_added_grid_view .grid_view');
    this.isLastPage = false;
    this.player = null;
    this.searchEmptyResult = '';
    this.searchEmptyResultGallery = '';

    this.getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[#|]+([^=|]+)=([^|]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }


    this.initialize = function () {
        this.loadData(getMediaLibrariesCommand);
        this.loadTags();
//this.loadData(getLibraryCommand);

        /* atach basic events */
        this.searchTextCtl.on('keyup', function (e) {
            if ($(this).val().length > 0) {
                $(this).next('.reset_search').css('display', 'block');
                $(this).removeClass('search_empty');
            } else {
                _this.searchTextCtl.val('');
                $(this).next('.reset_search').css('display', 'none');
                $(this).addClass('search_empty');
                checking_hash('search', 0);
                _this.showWorking();
            }
        });

        var search_val = '';
        this.searchTextCtl.on('keypress', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();

                if (_this.getUrlVars()['search'] != '') {
                    search_val = $.trim(_this.getUrlVars()['search']);
                }
                if ($.trim($(this).val()) != '' && search_val != $(this).val()) {
                    _this.showWorking();
                }
                checking_hash('search', $.trim(_this.searchTextCtl.val()));
                search_val = $(this).val();
                return false;
            }
        });

        this.searchBox.find('.reset_search').on('click', function () {
            $(this).hide();

            if (_this.searchTextCtl.val() && location.hash.indexOf("search=") > -1) {
                _this.showWorking();
                checking_hash('search', 0);
            }

            _this.searchTextCtl.val('');
        });

        this.searchImgCtl.on('click', function () {
            if (_this.getUrlVars()['search'] != '') {
                search_val = $.trim(_this.getUrlVars()['search']);
            }
            if ($.trim(_this.searchTextCtl.val()) != '' && search_val != _this.searchTextCtl.val()) {
//_this.loadData(getLibraryCommand); //will be called when hash will be changed
                _this.showWorking();
            }
            checking_hash('search', $.trim(_this.searchTextCtl.val()));
            search_val = _this.searchTextCtl.val();
            return false;
        });

        if (account_asset != '') {
            this.searchTextCtl.val(account_asset);
            this.searchTextCtl.next('.reset_search').css('display', 'block');
        }

        $('.headRight .refreshItem').on('click', function (){
            if($(this).hasClass("disableClick")) return;
            $('.headRight .refreshItem').removeClass("disableClick");
            $(this).addClass("disableClick");
            _this.refreshSingleItemData(currentEditingItemID);
        })

        $(window).bind('scroll resize', function () {
            if (!$('.libraryArea').hasClass('activeEditor')) {
                _this.analyticsOnScroll();
            }

            var scrollTop = $(window).scrollTop();
            if ($('.libraryContainer .library-line').length && !_this.libraryArea.hasClass('loading') && !_this.libraryArea.hasClass('activeEditor')) {
                if (isElementVisible($('.load_more'))) {
                    if (!_this.loadMore.hasClass('inactive'))
                        _this.loadMore.click();
                }
            }
        });

        /* select all items */
        $('.check_all_items_block:not("activated")').bind('click', function () {
            $(this).prop("checked", true);
            var checkBoxes = $('.libraryContainer').find('.input_class_checkbox');
            checkBoxes.prop("checked", !checkBoxes.prop("checked"));
            _this.showHideOhterActions();
            var itemsCount = $('input.input_class_checkbox:checked').length;
            $('#copyTo .dd-select .dd-selected-text span').remove();
            $('#copyTo .dd-select .dd-selected-text').html('Copy To<span>(' + itemsCount + ')</span>');
        });
        $('.check_all_items_block').addClass('activated');


        this.normalView.addClass('active');
        this.lineView.on('click', function () {
            $('.last_added_grid_view a').removeClass('active');
            $(this).addClass('active');
            _this.libraryContainer.removeClass('assets_grid').removeClass('assets_list').addClass('assets_line');

            disableLoad = true;
            checking_hash('views', 'line');
        });
        this.normalView.on('click', function () {
            $('.last_added_grid_view a').removeClass('active');
            $(this).addClass('active');
            _this.libraryContainer.removeClass('assets_grid').removeClass('assets_line').addClass('assets_list');

            disableLoad = true;
            checking_hash('views', '');
        });
        this.gridView.on('click', function () {
            $('.last_added_grid_view a').removeClass('active');
            $(this).addClass('active');
            _this.libraryContainer.removeClass('assets_list').removeClass('assets_line').addClass('assets_grid');

            disableLoad = true;
            checking_hash('views', 'grid');
        });

        this.loadMore.on('click', function () {
            disableLoad = false;
            _this.loadData(getLibraryCommand, false);
        });

        $("body").on("mousemove", ".uploadBtn, .uploadSubtitleBtn", function (e) {
            varL = 5;
            varR = 12;
            offL = $(this).offset().left;
            offT = $(this).offset().top;
            width = $(this).find("input").width();
            $(this).parent().find("input[type='file']").css({
                left: e.pageX - offL - width + varL,
                top: e.pageY - offT - varR
            });
        });


        $("body").on("mousemove", "#extra_files .uploadBtn", function (e) {
            varL = 5;
            varR = 12;
            offL = $(this).offset().left;
            offT = $(this).offset().top;
            width = $(this).find("input").width();
            $(this).parent().find("input[type='file']").css({
                left: e.pageX - offL - width + varL,
                top: e.pageY - offT - varR
            });
        });

        $('body').on('click', '.remove_upload_file', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var file_id = $(this).attr("data-id");
            var obj = $(this);
            $.ajax({
                type: 'GET',
                url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_remove&rid=' + currentEditingItemID + '&type=' + file_id,
                dataType: 'json',
                success: function (data) {
                    $(obj).parents('.thumbImage').fadeOut();
                    setTimeout(function () {
                        $(obj).parents('.thumbImage').remove();
                        $(".extra_file_box").find("[data-id='" + file_id + "']").closest(".extra_file_line").remove();
                        browse_upload_thumb_limit++;
                        if (browse_upload_thumb_limit != 0) {
                            $("#upload_thumb_btn").prop('disabled', false);
                            $("#upload_thumb_files .uploadBtn").css("opacity", "1");
                        }

                        browse_extra_files_limit++;
                        if (browse_extra_files_limit != 0) {
                            $("#upload_extrafile_btn").prop('disabled', false);
                            $("#extra_files .uploadBtn").css("opacity", "1");
                        }
                    }, 500);
                    _this.libraryContainer.find('div[data-rid="' + file_id + '"]').remove();
//                    if($(".thumbImage.active").parents(".posterUploadedImages").length){
//                        _this.saveMetaInfo(true);
//                    } else{
                    //                        _this.saveMetaInfo();
                    //                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });

        $('body').on('click', '.remove_extra_file', function (e) {
            e.preventDefault();
            var file_id = $(this).attr('data-id');
            var obj = $(this);
            $.ajax({
                type: 'GET',
                url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_remove&rid=' + currentEditingItemID + '&type=' + file_id,
                dataType: 'json',
                success: function (data) {
                    $(obj).parents('.extra_file_line').fadeOut();
                    if ($(".posterUploadedImages").find('[data-id="' + file_id + '"]').closest(".thumbImage").length) {
                        $(".posterUploadedImages").find('[data-id="' + file_id + '"]').closest(".thumbImage").remove();
                        browse_upload_thumb_limit++;
                        if (browse_upload_thumb_limit != 0) {
                            $("#upload_thumb_btn").prop('disabled', false);
                            $("#upload_thumb_files .uploadBtn").css("opacity", "1");
                        }
                    }
                    browse_extra_files_limit++;
                    if (browse_extra_files_limit != 0) {
                        $("#upload_extrafile_btn").prop('disabled', false);
                        $("#extra_files .uploadBtn").css("opacity", "1");
                    }

                    setTimeout(function () {
                        _this.updateExtraFiles();
                    }, 500);
                    _this.libraryContainer.find('div[data-rid="' + file_id + '"]').remove();
                    if ($(".thumbImage.active").parents(".posterUploadedImages").length) {
                        _this.saveMetaInfo(true);
                    } else {
                        _this.saveMetaInfo();
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    }

    this.hashActionExist = function (clearItems) {
//_this.disableLoad = true;
        l_hash = location.hash;
        l_hash = l_hash.replace('#', '');
        if (l_hash != '') {
            action = '';
            if (_this.getUrlVars()['views']) {
                action = _this.getUrlVars()['views'];
                if (_this.getUrlVars()['views'] == 'list')
                    action = 'normal';
//$('.last_added_grid_view .'+action + '_view').trigger('click');

                $('.last_added_grid_view').addClass('wasActive');
                $('.last_added_grid_view a').removeClass('active');
                $('.last_added_grid_view a.' + action + '_view').addClass('active');
                _this.libraryContainer.removeClass('assets_grid').removeClass('assets_list').removeClass('assets_line').addClass('assets_' + _this.getUrlVars()['views']);
            }
            if (_this.getUrlVars()['filter']) {
                $('#dropdownTypes .dd-selected-value').val(_this.getUrlVars()['filter']);
                type_label = _this.getUrlVars()['filter'];
                if (type_label == 'image')
                    type_label = 'Photos';
                else if (type_label == 'video')
                    type_label = 'Videos';
                firstLetter = type_label.substr(0, 1);
                type_label = firstLetter.toUpperCase() + type_label.substr(1);
                $('#dropdownTypes a .dd-selected-text').text(type_label);

                _this.hash_filter = _this.getUrlVars()['filter'];

//filterActive = _this.getUrlVars()['filter'];
            }
            if (_this.getUrlVars()['fid']) {
                fid_value = '';
                $('#dropdownGalleries .dd-options li .dd-option-description').each(function () {
                    if ($(this).text() == _this.getUrlVars()['fid']) {
                        fid_value = $(this).parent().find('.dd-option-value').val();
                        return false;
                    }
                })
                $('#dropdownGalleries .dd-select .dd-selected-value').val(fid_value);
                if ($('#dropdownGalleries .dd-select a small').length <= 0)
                    $('#dropdownGalleries .dd-select a').append('<small class="dd-selected-description dd-desc dd-selected-description-truncated">' + _this.getUrlVars()['fid'] + '</small>');

                _this.hash_fid = fid_value;
            }
            if (_this.getUrlVars()['search']) {
                $('.searchbox .search_input').val(_this.getUrlVars()['search']);
                $('.searchbox .reset_search').show();
                $('.searchbox .search_img').trigger('click');
            }
            if (_this.getUrlVars()['details']) {
                /*console.log( '#libraryContainer .library-line[data-drid="' + _this.getUrlVars()['details'] + '"]' )
                 if( $('#libraryContainer .library-line[data-drid="' + _this.getUrlVars()['details'] + '"]').length > 0 ){
                 console.log( $('#libraryContainer .library-line[data-drid="' + _this.getUrlVars()['details'] + '"]').find('.thumb') )
                 setTimeout(function(){
                 $('#libraryContainer .library-line[data-drid="' + _this.getUrlVars()['details'] + '"] .thumb').trigger('click');
                 }, 500)
                 //disableLoad = true;
                 //setTimeout(function(){ disableLoad = true; }, 500);
                 }else{*/
                _this.hash_details = _this.getUrlVars()['details'];
//}
            }
            if (_this.getUrlVars()['sort']) {
                if (typeof _this.getUrlVars()['sort'] == 'string' && _this.getUrlVars()['sort'] != '') {
                    sort_text = '';
                    $('#dropdownUsage .dd-options li a').removeClass('dd-option-selected');
                    $('#dropdownUsage .dd-select .dd-selected-value').val(_this.getUrlVars()['sort']);
                    $('#dropdownUsage .dd-options li').each(function () {
                        if ($(this).find('a .dd-option-value').val() == _this.getUrlVars()['sort']) {
                            sort_text = $(this).find('a .dd-option-text').text();
                            $(this).find('a').addClass('dd-option-selected');
                        }
                    })
                    $('#dropdownUsage a .dd-selected-text').text(sort_text);
                    _this.hash_sort = _this.getUrlVars()['sort'];
                }
            }
            if (_this.getUrlVars()['tags']) {
                tags_arr = _this.getUrlVars()['tags'].split(',');
                _this.tagSearchCtl = tags_arr;

                $.each(tags_arr, function (i, v) {
                    if (i == 0)
                        _this.tagsStr += 'tag=' + v
                    else
                        _this.tagsStr += ',tag=' + v

                    tagUnescape = unescape(v);
                    var selectedTag = $('<div class="selectedTag selectedFromHash" data-value="' + v + '"/>');
//var selectedTagInner = $('<span/>').html(v);
                    var selectedTagInner = $('<span/>').html(tagUnescape);
                    selectedTagInner.appendTo(selectedTag);
                    var deletedFromTagFilter = $('<a class="removeTag" />');
                    deletedFromTagFilter.html('X');

                    if ($('.headCenter .tagsFilterBlock .selectedTag[data-value="' + v + '"]').hasClass('added'))
                        return;
                    else
                        deletedFromTagFilter.appendTo(selectedTag);

                    selectedTag.appendTo(_this.tagsFilterBlock);
                    $('.headCenter .tagsFilterBlock .selectedTag').addClass('added');
                });

                $('.tagsFilterBlock div.selectedTag.added').each(function () {
                    if ($.inArray($(this).attr('data-value'), tags_arr) == -1) {
                        $(this).remove();
                    }
                });
            }

            if ($('#libraryHeadAsset .back_toassets').is(':visible') == true) {
                $('.libraryArea.activeEditor .back_toassets').trigger('click');
            }

//_this.disableLoad = false;
            setTimeout(function () {
                _this.loadData(getLibraryCommand, true);
            }, 200);
        } else {
            itemsCount = $('#dropdownTypes').attr('data-itemscount');
            $('#dropdownTypes .dd-selected-value').val('');
            $('#dropdownTypes a .dd-selected-text').text('All Types(' + itemsCount + ')');

            itemsCount = $('#dropdownGalleries').attr('data-itemscount');
            $('#dropdownGalleries .dd-selected-value').val('');
            $('#dropdownGalleries .dd-select .dd-selected-text').text('All Media(' + itemsCount + ')');
            $('#dropdownGalleries .dd-select a small').remove();

            //$('.last_added_grid_view .normal_view').trigger('click');
            $('.last_added_grid_view a').removeClass('active');
            $('.last_added_grid_view a.normal_view').addClass('active');
            _this.libraryContainer.removeClass('assets_grid').removeClass('assets_list').removeClass('assets_line').addClass('assets_list');

            $('.reset_search').trigger('click');

            $('.tagsFilterBlock div.selectedTag.added').each(function () {
                $(this).remove();
            });

            if ($('#libraryHeadAsset .back_toassets').is(':visible') == true) {
                $('.libraryArea.activeEditor .back_toassets').trigger('click');
            }

            setTimeout(function () {
                _this.disableLoad = false;
                _this.loadData(getLibraryCommand, true);
            }, 500);
        }
    }

    this.loadData = function (type, clearItems) {
//if( _this.disableLoad ) return;
        if (disableLoad) {
            disableLoad = false;
            return;
        }

        _this.libraryArea.addClass('loading');
        if (type == getLibraryCommand) {

            if (_this.hash_fid != '') {
                $('#dropdownUsage').addClass('disabled');
            } else {
                $('#dropdownUsage').removeClass('disabled');
            }

            if ($('#libraryContainer .library-line[data-drid="' + _this.hash_details + '"]').length > 0) {
                find_details = 1;
            } else {
                find_details = '';
            }

            var url, successHandler, errorMessage, command;
            command = 'get_library';
            var libraryName = "recently_updated";
            var searchQuery = '';
            var searchQuery = this.searchTextCtl.val();
            if (searchQuery.length > 0) {
                searchQuery = '&search=' + searchQuery;
            }
//if( _this.hash_details != '' && _this.hash_details != undefined && find_details == '' ){
            if (location.hash.indexOf('details=') > -1 && find_details == '') {
                searchQuery = '&search=' + _this.hash_details;
            }

            var tagQuery = '';
            if (this.tagSearchCtl.length > 0) {
                for (var tagsIndex = 0; tagsIndex < this.tagSearchCtl.length; tagsIndex++) {
                    if (tagsIndex == 0)
                        tagQuery += 'tag=' + this.tagSearchCtl[tagsIndex]
                    else
                        tagQuery += ',tag=' + this.tagSearchCtl[tagsIndex]
                }
                if (searchQuery.length == 0) {
                    tagQuery = '&search=' + tagQuery;
                } else {
                    tagQuery = ',' + tagQuery;
                }
            }
            else if (_this.tagsStr != '') {
                tagQuery = _this.tagsStr;

                if (searchQuery.length == 0) {
                    tagQuery = '&search=' + tagQuery;
                } else {
                    tagQuery = ',' + tagQuery;
                }
            }

            if (this.typeSearchCtl.val() != '') {
                _this.searchEmptyResult = this.typeSearchCtl.val();
                searchQuery += '&type=' + this.typeSearchCtl.val();

                checking_hash('filter', this.typeSearchCtl.val());
            }
            else if (location.hash.indexOf('filter') > -1) {
                if (_this.hash_filter != '') {
                    searchQuery += '&type=' + _this.getUrlVars()['filter'];
                }
            }

            searchQuery += tagQuery;
            if (this.hash_sort) {
                var libraryName = this.hash_sort;
            } else {
                if (this.byUsageCtl.val())
                    libraryName = this.byUsageCtl.val();

                if (typeof this.byUsageCtl.val() == 'string' && this.byUsageCtl.val() != '') {
                    libraryName = this.byUsageCtl.val();
                }
            }

            if (typeof this.byGalleryFilterCtl.val() == 'string' && this.byGalleryFilterCtl.val() != '') {
                command = 'get_folders';
                libraryName = this.byGalleryFilterCtl.val();
            }

            if (location.hash.indexOf('fid') > -1) {
                if (_this.hash_fid != '') {
                    command = 'get_folders';
                    libraryName = _this.hash_fid;
                }
            }

            if (clearItems || typeof clearItems == 'undefined') {
                this.currentPageNumber = 1;
            }

            url = 'page_size=' + pageSize + '&page_index=' + (this.currentPageNumber++);
            if(libraryName == "bylist"){
                if(riduserlist != "")
                    libraryName += "&order_by_list=" + riduserlist.replace(/,\s*$/, "")
                else
                    libraryName = "recently_updated";
            }
            url += '&library_name=' + libraryName + searchQuery;
            successHandler = function (res) {
                _this.onItemsLoadSuccess(res, clearItems);
            };
            errorMessage = 'Unknown error while loading media library. Please reload page and try again.';
        } else {
            command = 'get_mediaLibraries';
            url = '';
            successHandler = function (res) {
                _this.onSuccessLoadLibraries(res);
            };
            errorMessage = 'Unknown error while loading media library. Please reload page and try again.';

        }
        this.invoke(command, url, successHandler, errorMessage);
        if (!showAsset) {
            _this.libraryArea.removeClass('activeEditor');
            $(".content-container").removeClass("hideleftbar");
        }


        showAsset = false;

        if (location.hash != '') {
//_this.disableLoad = true;
            disableLoad = false;
        }
    }

    this.refreshSingleItemData = function (id, disableIt){
        _this.libraryArea.find('.headRight .saving').removeClass('success error').text('');
        _this.libraryArea.find('.headRight .saving').addClass('processing').show().text('Refreshing...');
        if(!disableIt){
            $('.boxMetaEditor').addClass("disabled");
        }

        var url;
        var params = "cache=never&page_size=50&page_index=1&library_name=recently_updated&search=" + _this.getUrlVars()['details'];
        $.ajax({
            type: 'POST',
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: 'cmd=get_library&' + params,
            dataType: 'json',
            success: function (res) {
                $('.boxMetaEditor').removeClass("disabled");
                $('.headRight .refreshItem').removeClass("disableClick");
                $.extend(_this.mediaItems[currentEditingItemID], res.d.response.items[0], true);
                _this.editMediaItem(_this.mediaItems[currentEditingItemID]);
                _this.libraryArea.find('.headRight .saving').removeClass('processing').text('');
                _this.libraryArea.find('.headRight .saving').addClass('success').text('Done.');
                clearTimeout(_this.showMessageTimer);
                _this.showMessageTimer = setTimeout(function () {
                    _this.libraryArea.find('.headRight .saving.success').hide();
                }, 5000);
            },
            error: function () {
                _this.showMessage(errorMessage);
            }
        });
    }

    this.updateExtraFiles = function (){
        var beforeSubCount = subtitlesCount;
        subtitlesCount = 0;
        var url;
        var params = "cache=never&library_name=recently_updated&search=" + _this.getUrlVars()['details'];

        $.ajax({
            type: 'GET',
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: 'cmd=get_library&' + params,
            dataType: 'json',
            success: function (res) {
                var item = res.d.response.items[0];
                var subtitle_files_thm = "", extra_files_thm = "";
                if (item.attached) {
//extra_files_thm = '<div class="extra_file_box">';
                    $.each(item.attached, function (i, v) {
//var whattoReplace = inBetween(url, '?o=', '&');
                        var url = item.thumbnail.directive_innervalue;
                        url = url.replace("&t=y", "&p=y");
                        var fileType = v.directive_attribues.type;
//console.log(item)
                        var file_id = v.directive_attribues.id;
                        var start_pos = url.lastIndexOf('/') + 1;
                        var end_pos = url.indexOf('?');
                        var text_to_get = url.substring(start_pos, end_pos);
                        url = v.url.directive_innervalue;

                        if (v.directive_attribues.type.lastIndexOf("subtitle-", 0) === 0) {
                            subtitlesCount ++;
                            var lang_code = v.directive_attribues.type.replace("subtitle-", "");
                            var lang = langCodes[lang_code].name;
                            subtitle_files_thm += '<div class="subtitle_file_line file_line">';
                            subtitle_files_thm += '<div class="file_id">' + lang + ' </div>';
                            subtitle_files_thm += '<div class="file_name">';
                            subtitle_files_thm += '<a target="_blank" href="' + url + '" title="' + decodeXMl(v.directive_attribues.filename) + '" >' + decodeXMl(v.directive_attribues.filename) + '</a>';
                            subtitle_files_thm += '</div>';
                            subtitle_files_thm += '<div class="file_srt"><a class="srt_action" data-name="'+ decodeXMl(v.directive_attribues.filename) + '" data-id="' + v.directive_attribues.id + '" data-lang="'+lang_code+'"  data-srturl="'+url+'"  data-filename="'+item.filename+'" data-drid="' + _this.mediaItems[currentEditingItemID].directive_attribues.drid + '" href="javascript:;"><i class="icon-gear"></i></a></div>';
                            subtitle_files_thm += '<div class="file_remove"><a class="remove_subtitle" data-id="' + v.directive_attribues.id + '" href="javascript:;"><i class="icon-delete"></i></a></div>';
                            subtitle_files_thm += '</div>';
                        }
                        extra_files_thm += '<div class="extra_file_line file_line">';
                        extra_files_thm += '<div class="file_name">';
                        extra_files_thm += '<a target="_blank" href="' + url + '" title="' + decodeXMl(v.directive_attribues.filename) + '">' + decodeXMl(v.directive_attribues.filename) + '</a>';
                        extra_files_thm += '</div>';
                        extra_files_thm += '<div class="file_type">' + v.directive_attribues.type + '</div>';
                        extra_files_thm += '<div class="file_remove"><a class="remove_extra_file" data-id="' + v.directive_attribues.id + '" href="javascript:;"><i class="icon-delete"></i></a></div>';
                        extra_files_thm += '</div>';

                    });
                }

                $(".subtitles_box").empty().html(subtitle_files_thm);
                $(".extra_file_box").empty().html(extra_files_thm);
                if((subtitlesCount >0 && beforeSubCount == 0) || (subtitlesCount ==0 && beforeSubCount > 0)){
                    _videoCurrentTime = 0;
                    if(typeof cincopa_mejs != "undefined" && typeof cincopa_mejs.players != "undefined")
                        for(var pl in cincopa_mejs.players){
                            cincopa_mejs.players[pl].remove();
                        }
                    _this.loadSkinPreview(embed_fid,_this.getUrlVars()['details'], new_guid)
                }
            },
            error: function () {
            }
        });
    }

    this.showWorking = function () {
        $('.removed_items_box').html('<img src="/_cms/design13/images/spinner_squares_circle.gif" /> <span>Working...</span>');
        $('.removed_items_box').show();

        setTimeout(function () {
            if ($('.removed_items_box').is(':visible') || $('.removed_items_box').css('display') == 'block') {
                $('.removed_items_box').hide();
            }
        }, 3500);
    }
    this.hideWorking = function () {
        $('.removed_items_box').hide();
    }
    this.onItemsLoadSuccess = function (res, clearItems) {

        _this.libraryArea.removeClass('loading');
        $('.headRight .bluetext').removeClass("preventDoubleClick");
        var items = res.d.response.items || res.d.response.folder.items;

        var htm = '', emptyHtm = '';
        if (typeof clearItems == 'undefined' || clearItems) {
            _this.mediaItems = new Array();
            window.scrollTo(0, 0);
        }
        if (clearItems || typeof clearItems == 'undefined')
            _this.libraryContainer.find(".library-line:not(.uploading)").remove();

        if (res.d.response.items_data || res.d.response.folder.items_data) {
            var currentPage, pagesCount;
            if (res.d.response.items_data) {
                currentPage = res.d.response.items_data.page;
                pagesCount = res.d.response.items_data.pages_count;
            } else {
                currentPage = res.d.response.folder.items_data.page;
                pagesCount = res.d.response.folder.items_data.pages_count;
            }
            if (currentPage == pagesCount) {
                this.loadMore.hide().addClass('inactive');
            } else {
                this.loadMore.show().removeClass('inactive');
            }
        }
        if (items.length) {
            for (var i = 0; i < items.length; i++) {
                htm = this.drawItem(items[i], i);
                _this.libraryContainer.append(htm);
                _this.loadImages(items[i].thumbnail.directive_innervalue);

                /* adding to medaItems array */

                _this.mediaItems[ items[i].directive_attribues.id] = items[i];

                _this.attachLineEvents(items[i].directive_attribues.id);


            }
        } else {
            emptyHtm += '<div class="galleryRow library-line empty_gallery"><div class="createGalleryNow">';
            if (_this.searchTextCtl.val() == '' && _this.searchEmptyResult != '') {
                emptyHtm += '<p><img src="/_cms/design15/images/noassets.png"></p>\
                    <h2>You haven\'t uploaded any ' + (_this.searchEmptyResult != 'other' ? _this.searchEmptyResult : "assets") + ' yet!</h2>\
                    <p><a class="btn primary"><i class="icon-upload"></i><b>Upload Assets</b></a></p>';
            } else if (_this.searchTextCtl.val() == '' && _this.searchEmptyResultGallery != '') {
                emptyHtm += '<p><img src="/_cms/design15/images/noassets.png"></p>\
                    <h2>You don\'t have any assets in this gallery!</h2>\
                    <p><a class="btn primary"><i class="icon-upload"></i><b>Upload Assets</b></a></p>';
            } else if (_this.searchTextCtl.val() == '' && _this.searchEmptyResult == '') {
                emptyHtm += '<p><img src="/_cms/design15/images/noassets.png"></p>\
                   <h2>You haven\'t uploaded any assets yet!</h2>\
                   <p><a class="btn primary"><i class="icon-upload"></i><b>Upload Assets</b></a></p>';
            } else {
                emptyHtm += '<p>Sorry but we couldn\'t find <a>' + _this.searchTextCtl.val().replace("<", "< ").replace(">", "> ") + '</a></p>\
                    <p>Perhaps the filename is incorrect? Want to try again?</p>';
            }
            emptyHtm += '</div></div></div>';
            _this.libraryContainer.html(emptyHtm);
            _this.loadMore.hide().addClass('inactive');
            $(".createGalleryNow").on("click", function(){
                window.open("/media-platform/upload-files", "_self")
            })
        }

        if (typeof (res.d.response.items_data) != 'undefined' || typeof (res.d.response.folder.items_data) != 'undefined') {
            var itemsCount;
            if (res.d.response.items_data) {
                itemsCount = res.d.response.items_data.items_count;
            } else {
                itemsCount = res.d.response.folder.items_data.items_count;
            }
            $('#dropdownTypes').attr('data-itemscount', itemsCount);
            $('#dropdownTypes .dd-options li:first .dd-option-text:not(".loaded")').html('All Types(' + itemsCount + ')').addClass('loaded');
            $('#dropdownTypes .dd-select .dd-selected:contains("All")').html('All Types(' + itemsCount + ')').addClass('loaded');
            $('#dropdownGalleries .dd-select .dd-selected-text').html('All Media(' + itemsCount + ')');
            $('#dropdownGalleries').attr('data-itemscount', itemsCount);
        }

        $('.galleryRow.empty_gallery .primary').on('click', function () {
            _this.uploadButton.trigger('click');
        });

        $('.copy_delete_block .delete_action:not("activated")').click(function () {
            $('input.input_class_checkbox:checked').each(function () {
                var rid = $(this).parents('.library-line').attr('data-rid');
                if (_this.itemsToDelete == '') {
                    _this.itemsToDelete = rid;
                } else {
                    _this.itemsToDelete += ',' + rid;
                }
            });
            var checked_length = $('input.input_class_checkbox:checked').length;
            _this.drowDeletePopup(checked_length);
        });

        $('.delete_action').addClass('activated');
        _this.analyticsOnScroll();

        if (account_asset != '') {
            setTimeout(function () {
                $('.library-line[data-rid="' + account_asset + '"] .all_actions_block .popup_action').trigger('click');
            }, 500);
        }

        if (_this.hash_details != '') {
            setTimeout(function () {
                if (hash_existed) {
                    if ($('#libraryContainer .library-line[data-drid="' + _this.hash_details + '"]').length > 0) {
                        $('#libraryContainer .library-line[data-drid="' + _this.hash_details + '"]').find('.thumb').trigger('click');
                    }
                } else {
                    hash_existed = true
                }

            }, 600);

        }
        _this.activateDropdown();
    }

    this.loadTags = function(){
        allTags = [];
        $.ajax({
            type: 'POST',
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: 'cmd=get_tags',
            dataType: 'json',
            success: function (res) {
                var data = res.d.response.tag_cloud;
                for(var tag in data){
                    allTags.push(tag);
                }
                _this.createTagsCloud(res.d.response.tag_cloud);
            },
            error: function (er) {
                console.log(er)
            }
        });
    };

    this.attachLineEvents = function (rid) {
        var lineElement = $('.library-line[data-rid="' + rid + '"]');
        var drid = lineElement.attr('data-drid');
        var item_type = lineElement.attr('data-type');

        /*clear tags and then activate/reactivate plugin */
        $('.tagsinput', lineElement).remove();

        $('input[name="tags_main"]', lineElement).tagsInput({
            'height': '40px',
            'width': '300px',
            'interactive': true,
            'defaultText': 'add a tag',
            'onChange': function () {
                if ($(this).hasClass('activated')) {
                    var tags = $(this).val();
                    var rid = $(this).closest(".library-line").attr("data-rid");
                    var cdm = 'updateid';
                    var url = 'rid=' + rid + '&tags=' + escape(tags);
                    _this.invoke(cdm, url, function(){
                        _this.mediaItems[rid].tags = tags;
                        _this.loadTags();
                    }, "");
                } else {
                    $(this).addClass('activated');
                }
            },
            'onClick': function () {
            },
            'removeWithBackspace': true,
            'minChars': 0,
            'maxChars': 0, //if not provided there is no limit,
            'placeholderColor': '#666666'
        });

        if($('input[name="tags_main"]', lineElement).val() == '') {
            $('input[name="tags_main"]', lineElement).addClass('activated');
        }

        $(".selectTags", lineElement).buildTagsList({
            tagsInput: $('input[name="tags_main"]', lineElement),
            tagsElement: $('div.tagsinput',lineElement)
        });

        /* attaching events for edit */
        $('.popup_action, .thumb, .filename ', lineElement).on("click", function () {
            if($(this).parents(".library-line").hasClass("uploading")) return true;
            var index = $(this).parents('.library-line').attr('data-rid');
            showAsset = true;
            _this.editMediaItem(_this.mediaItems[index]);

            _this.beforeScrollPosition = $(window).scrollTop();
            $('.libraryArea').addClass('activeEditor');
            window.scrollTo(0, 0);
            $('.content-container').addClass("hideleftbar");

            drid = $(this).parents('.library-line').attr('data-drid');
            hash_existed = false;
            disableLoad = true;
            checking_hash('details', drid);
        });

        $('.embed_action', lineElement).click(function () {
            var index = $(this).parents('.library-line').attr('data-rid');
            _this.editMediaItem(_this.mediaItems[index]);
            _this.beforeScrollPosition = $(window).scrollTop();
            $('.libraryArea').addClass('activeEditor');
            $('.content-container').addClass("hideleftbar");
            $('.tabsHead li.embed_info', _this.assetEditor).trigger('click');
            window.scrollTo(0, 0);
        });

        /* show deleted popup event */
        $('.delete_action', lineElement).click(function () {
            if (_this.itemsToDelete == '') {
                _this.itemsToDelete = $(this).parents('.library-line').attr('data-rid');
            } else {
                _this.itemsToDelete += ',' + $(this).parents('.library-line').attr('data-rid');
            }
            var checked_length = $('input.input_class_checkbox:checked').length;
            _this.drowDeletePopup(checked_length);
        });


        /* share tooltip */
        var tooltipTimer;
        $('.share_action', lineElement).on('click', function () {
            $(this).next('.share_tooltip').show();
            if(copyElemShare){
                copyElemShare.destroy();
            }
            var successCallback = function(event, msg){
                var trg = $(event.trigger);
                $('.shareBlock').find('.copyStatus').remove();
                doneText = '<span class="copyStatus" style="display:none;"> ' + msg +' </span>';
                trg.after(doneText);
                $('.shareBlock').find('.copyStatus').fadeIn();
                setTimeout(function () {
                    $('.shareBlock').find('.copyStatus').fadeOut(function () {
                        $(this).remove();
                    });
                }, 1000);
            }
            copyElemShare = new Clipboard('.share_tooltip .copy_button:not(.activatedPlugin)', {
                text: function(trigger) {
                    var trg = $(trigger);
                    var returnText = '';
                    returnText = trg.parents('.share_tooltip').find('span.shortShareLink').text() + '\n';
                    return returnText;
                }
            }).on('success', function(event){
                successCallback(event, "Copied")
            }).on('error', function(event){
                successCallback(event, " Your browser doesn't support Clipboard API, in order to copy just press CTRL+C")
            });
            if(typeof addthis != "undefined"){
                addthis.toolbox('.addthis_toolbox');
                setTimeout(function () {
//addthis.update('share', 'url', "http://cinco.ly/!" + drid);
                    addthis.update('share', 'url', shareURL + resShareDefaults[item_type] + '!' + drid);
                }, 500);

            }

            clearTimeout(tooltipTimer);
        });

        $('.icon-share', lineElement).mouseleave(function (e) {
            var that = this;
            tooltipTimer = setTimeout(function () {
                $(that).next('.share_tooltip').fadeOut();
            }, 500);
        });
        lineElement.mouseleave(function (e) {
            $('.share_tooltip').fadeOut();
        });
        $('.shareBlock', lineElement).mouseover(function () {
            clearTimeout(tooltipTimer);
        });
        $('.shareBlock', lineElement).mouseleave(function (e) {
            if ($(e.target).hasClass('copy_button'))
                return false;
            $(this).parents('.share_tooltip').hide();
        });

        /* select line event */
        $('.selected', lineElement).bind('click', function (e) {
            lineElement.toggleClass('library-line-selected');
            var checkbox = lineElement.find('.input_class_checkbox');
            checkbox.prop("checked", !checkbox.prop("checked"));
            _this.showHideOhterActions();
            var itemsCount = $('input.input_class_checkbox:checked').length;
            $('#copyTo .dd-select .dd-selected-text span').remove();
            $('#copyTo .dd-select .dd-selected-text').html('Copy To<span>(' + itemsCount + ')</span>');
            $('#copyTo .dd-options li').show();
        });
    }
    this.drowDeletePopup = function (count) {
        var htm = '<div class="modalContainer modalContainer-deleteConfirmation">\
                            <div class="modalHeader">\
                            <span>Wait!</span>\
                         </div>\
                         <div class="modalContent">\
                            <div class="infoBlock">\
                                <h3> You can delete <b>' + (count > 1 ? "these " + count + " files " : "this file ") + '</b> but it\'s permanent</h3>\
                                <h5>( And no, our support will not be able to restore it )</h5>\
                            </div>\
                            <div class="deleteActionBlock">\
                               <a class="btn red deleteAsset">Yes delete those files forever</a>\
                            </div>\
                        </div>\
                        <div class="modalFooter">\
                               <a class="btn cancelAction keepFile" onclick="$.modal.close(); _this.itemsToDelete=\"\""> No, I will keep it</a>\
                         </div>\
                    </div>';
        openModal(htm, 500, 300);

        $(".simplemodal-close").click(function(){
            _this.itemsToDelete=''
        })
        /*
        $('.deleteActionBlock .item').draggable({
            revert: 'invalid'
        });
        $('.deleteActionBlock .trash').droppable({
            activeClass: 'highlight',
            hoverClass: 'highlight-accept',
            drop: function (event, ui) {
                errorMessage = 'Problem with deleting :( ';
                deleteSuccessHandler = function () {
                    $.modal.close();

                    if (count < 6) {
                        removedMessage(count);
                    } else {
                        $('.removed_items_box').html('<img src="/_cms/design13/images/spinner_squares_circle.gif" /> <span>Working...</span>');
                        $('.removed_items_box').show();
                    }

                    var ridArray = _this.itemsToDelete.split(',');
                    for (var i = 0; i < ridArray.length; i++) {
                        $('.library-line[data-rid="' + ridArray[i] + '"]').addClass('deleted');
                        setTimeout(function () {
                            if (count < 6) {
                                $('.library-line.deleted div').slideUp('slow');
                                $('.library-line.deleted').fadeOut('slow', function () {
                                    $('.library-line.deleted').remove();
                                });
                            } else {
                                $('.library-line.deleted div').slideUp('slow');
                                $('.library-line.deleted').remove();
                                show_remove_message = 1;
                            }
                        }, 4000);
                        try {
                            delete _this.mediaItems[ridArray[i]]
                        } catch (ex) {
                            console.log(ex);
                        }
                    }
                    $('#copyTo .dd-select .dd-selected-text span').remove();
                    _this.libraryArea.removeClass('activeEditor');
                    $(".content-container").removeClass("hideleftbar");
                    setTimeout(function () {
                        if (show_remove_message == 1) {
                            removedMessage(count);
                        }
                    }, 4300);

                    if (_this.beforeScrollPosition) {
                        window.scrollTo(0, _this.beforeScrollPosition);
                    }
                    _this.itemsToDelete = '';
                }

                _this.invoke(deleteLibraryItems, 'rid=' + _this.itemsToDelete, deleteSuccessHandler, errorMessage);
            }
        });*/
        $(".deleteAsset").on("click", function(){
            if($(this).hasClass("disabled")) return;
            $(this).addClass("disabled");
            $(this).text("Deleting, please wait....");
            errorMessage = 'Problem with deleting :( ';
            deleteSuccessHandler = function () {
                $.modal.close();
                if (count < 6) {
                    removedMessage(count);
                } else {
                    $('.removed_items_box').html('<img src="/_cms/design13/images/spinner_squares_circle.gif" /> <span>Working...</span>');
                    $('.removed_items_box').show();
                }

                var ridArray = _this.itemsToDelete.split(','), show_remove_message;
                for (var i = 0; i < ridArray.length; i++) {
                    $('.library-line[data-rid="' + ridArray[i] + '"]').addClass('deleted');
                    $('.library-line[data-rid="' + ridArray[i] + '"]').addClass('disabled');
                    setTimeout(function () {
                        if (count < 6) {
                            $('.library-line.deleted div').slideUp('slow');
                            $('.library-line.deleted').fadeOut('slow', function () {
                                $('.library-line.deleted').remove();
                                _this.showHideOhterActions();
                            });
                        } else {
                            $('.library-line.deleted div').slideUp('slow');
                            $('.library-line.deleted').remove();
                            show_remove_message = 1;
                            _this.showHideOhterActions();
                        }

                    }, 4000);
                    try {
                        delete _this.mediaItems[ridArray[i]]
                    } catch (ex) {
                        console.log(ex);
                    }
                }
                $('#copyTo .dd-select .dd-selected-text span').remove();
                _this.libraryArea.removeClass('activeEditor');
                $(".content-container").removeClass("hideleftbar");
                setTimeout(function () {
                    if (show_remove_message == 1) {
                        removedMessage(count);
                    }
                }, 4300);

                if (_this.beforeScrollPosition) {
                    window.scrollTo(0, _this.beforeScrollPosition);
                }
                _this.itemsToDelete = '';

                var itemsCount = parseInt( $('#dropdownTypes').attr('data-itemscount'));
                var newCount = itemsCount - count;
                $('#dropdownTypes').attr('data-itemscount', newCount);
                $('#dropdownTypes .dd-options li:first .dd-option-text').html('All Types(' + newCount + ')');
                $('#dropdownTypes .dd-select .dd-selected:contains("All")').html('All Types(' + newCount + ')');
                $('#dropdownGalleries .dd-select .dd-selected-text').html('All Media(' + newCount + ')');
                $('#dropdownGalleries').attr('data-itemscount', newCount);

            }

            _this.invoke(deleteLibraryItems, 'rid=' + _this.itemsToDelete, deleteSuccessHandler, errorMessage);
        })
    };
    this.loadImages = function (src) {
        var ni = new Image();
        src = decodeXMl(src);
        ni.onload = function () {
            var ratio = this.width / this.height;
            var src = $(this).attr('src');
            if (ratio <= 1) {
                $('.library-line .thumb img[src="' + src + '"]').parents('.thumb').addClass('portrait');
            } else {
                $('.library-line .thumb img[src="' + src + '"]').parents('.thumb').addClass('landscape');
            }
        }
        ni.src = src;
    }
    this.activateDropdown = function () {
        $('.options_list').on("change", function (e) {
            e.preventDefault();
            var tab = $(this).val();
            if(((tab == "timeline" || tab == "annotations" || tab == "callforaction") && __user_feature["assets-timeline"].value == "false") || (tab == "subtitles" && __user_feature["assets-subtitles"].value == "false"))
                return false;
            $(this).parents(".library-line").find(".popup_action").trigger("click");
            $(".tabsHead [data-tab='" + tab + "']").trigger("click");

        });
    }
    this.drawItem = function (item) {
        var caption = (item.caption == '' ? 'no-title' : item.caption);
        var description = (item.description == '' ? 'no-description' : item.description);
        var thumbnail = '';
        if (item.directive_attribues.type == 'music') {
            if (item.thumbnail.directive_innervalue) {
                thumbnail = '<div class="audioIcon"><img src="' + item.thumbnail.directive_innervalue + '"></div>';
            } else {
                thumbnail = '<div class="audioIcon"></div>';
            }

        } else if (item.directive_attribues.type == 'unknown') {
            if (item.thumbnail.directive_innervalue) {
                thumbnail = '<div class="unknownIcon"><img src="' + item.thumbnail.directive_innervalue + '"></div>';
            } else {
                thumbnail = '<div class="unknownIcon"></div>';
            }
        } else if (item.directive_attribues.type == 'video'){
            thumbnail = '<span class="thumb-time">' + (item.exif.duration ? secondsToMS(hmsToSecondsOnly(item.exif.duration.split(".")[0])) : "")+ '</span><img src="' + item.thumbnail.directive_innervalue + '">';
        } else {
            thumbnail = '<img src="' + item.thumbnail.directive_innervalue + '">';
        }
        more_description = '';
        if (description.length > 200) {
            more_description = '<a class="more_description" href="javascript:;">more</a>'
        }

        var mediType = item.directive_attribues.type;
        var realImageSrc = decodeXMl(item.content.directive_innervalue);
        var returnUrl = 'https://www.cincopa.com/media-platform/upload-files';

        var analytics_button = '';



        if (mediType == 'video') {
            var statisticsUrl = 'https://www.cincopa.com/analytics/main#uid=' + _uid + '&type=media&rid=' + item.directive_attribues.drid;
            analytics_button = '<a target="_blank" href="' + statisticsUrl + '"class="analytics_action btn rounded" data-action="Analytics"><i class="icon-graph"><b class="hint">Analytics</b></i></a>';
        }
        var dropdown = '<select class="options_list" id="options_list_' + item.directive_attribues.id + '">' +
            '<option value="info">Info</option>' +
            (mediType != 'unknown' ? '<option value="share">Share</option>' : '') +
            (mediType != 'unknown' ? '<option value="embed">Embed</option>' : '') +
            (mediType == 'video' || mediType == 'music' || mediType == 'unknown' ? '<option value="thumbnail">Thumbnails</option>' : '') +
            (mediType == 'video' ? '<option value="subtitles" ' + (__user_feature["assets-subtitles"].value == 'false' ? 'disabled' : '') + '>Subtitles & CC</option>' : '') +
            (mediType == 'video' ? '<option value="timeline" ' + (__user_feature["assets-timeline"].value == 'false' ? 'disabled':'') + '>Timeline</option>' : '') +
            (mediType == 'video' ? '<option value="annotations" ' + (__user_feature["assets-timeline"].value == 'false' ? 'disabled':'') + '>Annotations</option>' : '') +
            (mediType == 'video' ? '<option value="callforaction" ' + (__user_feature["assets-timeline"].value == 'false' ? 'disabled':'') + '>Call to action</option>' : '') +
            '<option value="extra">Extra files</option>' +
            '<option value="versions" ' + (__user_feature["assets-versions"].value == 'false' ? 'disabled':'') + '>Versions</option>' + '</select>' ;

        var fileName = decodeXMl(item.filename);
        htm = '<div class="library-line ' + (item.tags != '' ? 'withTags' : '') + ' ' + item.directive_attribues.type + '" data-type="' + item.directive_attribues.type + '" data-rid="' + item.directive_attribues.id + '" data-drid="' + item.directive_attribues.drid + '" >\
						<div class="selected">\
                            <input type="checkbox" class="input_class_checkbox" >\
                            <label ></label>\
						</div>\
						<div class="thumb" data-action="thumb"><div>'
            + thumbnail +
            '</div></div>\
                    <div class="item_name_desc">\
                        <span class="filename" title="' + fileName + '" data-action="File name">' + fileName + '</span>\
							<div class="lastUpdated"> <i class="icon-clock cp-hide"></i><div class="date_div"> Last Updated: ' + item.directive_attribues.modified.substr(0, item.directive_attribues.modified.indexOf(" ")) + '</div></div>\
							<div class="caption" title="' + caption + '"><i onclick="editData(event);">' + caption + '</i><a href="javascript:void(0)" class="changeLink btn trans" title="Edit Caption" onclick="editData(event);"><i class="icon-edit"></i></a></div>\
							<div class="changeName"><form class="changeName" onsubmit="changeAssetCaption(' + item.directive_attribues.id + ', event);return false;"><input name="changeName" type="text"><div><a href="javascript:void(0)" onclick="changeAssetCaption(' + item.directive_attribues.id + ', event)">Save</a>&nbsp;<a href="javascript:void(0)" onclick="cancelAssetEdit(event)">Cancel</a></div></form></div>\
							<div class="description" title="' + description + '"><i onclick="editDesc(event);">' + description + '</i><a href="javascript:void(0)" class="changeLink btn trans" title="Edit Description" onclick="editDesc(event);"><i class="icon-edit"></i></a></div>' + more_description + '\
							<div class="changeDescription fieldItem" style="display:none"><textarea class="field" name="change_desc" placeholder="description"></textarea><div class="save_cancel_box"><a onclick="changeAssetDescription(' + item.directive_attribues.id + ', event)" href="javascript:void(0)">Save</a>&nbsp;<a href="javascript:;" onclick="cancelAssetEdit(event)">Cancel</a></div></div>\
							<div class="all_tags">\
                            <div class="tags"><input name="tags_main" value="' + item.tags + '"/><a href="javascript:void(0)" class="selectTags">Add more tags</a></div>\
            </div>' +
            dropdown +
            '</div>\
                    <div class="all_actions_block">\
                        ' + analytics_button + '\
                            <a class="popup_action btn rounded" data-action="Edit"><i class="icon-gear"><b class="hint">Preview & Edit</b></i></a>\
							<a data-href="' + item.content.directive_innervalue.replace(/&amp;/g, '&') + '&m=y" class="download_action btn rounded" data-action="Download"><i class="icon-download"><b class="hint">Download</b></i></a>\
							<a class="embed_action btn rounded" data-action="Embed"><i class="icon-code"><b class="hint">Embed</b></i></a>\
							<a class="share_action btn rounded" data-action="Share"><i class="icon-share"><b class="hint">Share</b></i></a>\
							<div class="share_tooltip">\
								<span class="tooltipArrow"></span>\
								<div class="shareBlock">\
									<div class="share_media">Share Your Media</div>\
                                    <span class = "shortShareLink copy_url"> ' + shareURL + resShareDefaults[item.directive_attribues.type] + '!' + (item.directive_attribues.drid) + '</span>\
                                    <span class="copy_button copyBtn">Copy URL</span>\
                                    <div class="addthis_toolbox addthis_default_style addthis_32x32_style" addthis:title="File share using Cincopa" >\
                                        <a class="addthis_button_facebook"></a>\
                                        <a class="addthis_button_twitter"></a>\
                                        <a class="addthis_button_google_plusone_share "></a>\
                                        <a class="addthis_button_pinterest_share"></a>\
                                        <a class="addthis_button_preferred_1"></a>\
                                        <a class="addthis_button_preferred_2"></a>\
                                        <a class="addthis_button_preferred_3"></a>\
                                        <a class="addthis_button_preferred_4"></a>\
                                        <a class="addthis_button_compact"></a>\
                                        <a class="addthis_counter addthis_bubble_style"></a>\
                                    </div>\
								</div>\
							</div>\
                            <a class="delete_action btn rounded" title="Delete item" data-action="Delete"><i class="icon-delete"></i></a>\
						</div>'
            + '<div class="analytics_view_div analytics_domain_div">'
            + (item.directive_attribues.type == 'video' || item.directive_attribues.type == 'music' ? '<div class="weekly_views domain_views">' +
                '<i class="icon-domain"></i>' +
                '<b>-</b>' +
                '<div class="itemsDropdown domainsList">' +
                '<div class="itemsDropdown_head">' +
                '<div class="headLeft"><h3>Domains used </h3></div>' +
                '</div>' +
                '<div class="itemsDropdown_items"><div class="emptyDomains">this item is not used in any domain.</div>' +
                '<ul></ul>' +
                '</div>' +
                '</div>' +
                '</div><div>Weekly Domains</div>' : '') +
            '</div><div class="analytics_view_div">'
            + (item.directive_attribues.type == 'video' || item.directive_attribues.type == 'music' ? '<div class="weekly_views"><i class="icon-stat_views"></i><b>-</b></div><div>Weekly Views</div>' : '') +
            '</div>'
            + (typeof (item.in_folders) != 'undefined' ? '<div class="analytics_div">' +
                '<div class="infolder">' +
                '<i class="icon-stat_galleries"></i>' +
                '<b>' + item.in_folders + '</b>' +
                '<div class="itemsDropdown galleriesList">' +
                '<div class="itemsDropdown_head">' +
                '<div class="headLeft"><h3>In Galleries </h3></div>' +
                '</div>' +
                '<div class="itemsDropdown_items"><div class="emptyGalleries">this item is not used in any gallery.</div>' +
                '<ul></ul>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div>In Galleries</div>' +
                '</div>' : '<div class="analytics_div"></div>') +
            '</div>';
        return htm;
    };

    this.onSuccessLoadLibraries = function (res) {
        var items = res.d.items;
        mediaLibraries = items;
        var htm = '';
        for (var i = 0; i < items.length; i++) {
            var fname = $("<div>").html(items[i].fname).text();
            htm += '<option value="' + items[i].fid + '" ' + ('#' + items[i].did == location.hash ? 'selected' : '') + '  data-description="' + items[i].did + '" >' + fname + '</option>';
        }
//$('#dropdownGalleries').html('<option value="">All media</option>' + htm);
        input_serach_gallery = escape('<div class="fieldItem"><i class="icon-search"></i><input id="search_gallery" class="field" type="text" name="search_gallery" value="" placeholder="Search" /></div>');
        $('#dropdownGalleries').html('<option value="">All media</option><option value="">' + input_serach_gallery + '</option>' + htm);
        $('#copyTo').html('<option value="new_gallery">New Gallery</option>' + htm);

        var firstActivation = true;
        $('select:not(#languages)').each(function () {
            $(this).ddslick({
                onSelected: function (data) {
                    if (!firstActivation) {
                        _this.libraryArea.removeClass('activeEditor');
                        $(".content-container").removeClass("hideleftbar");
                        if ($(data.original).attr('id') == 'copyTo') {
                            if (data.selectedData.value) {
                                var itemsToCopy = '';
                                $('input.input_class_checkbox:checked', _this.libraryContainer).each(function () {
                                    var rid = $(this).parents('.library-line').attr('data-rid');
                                    if (itemsToCopy == '') {
                                        itemsToCopy = rid;
                                    } else {
                                        itemsToCopy += ',' + rid;
                                    }
                                });
                                $('#copyTo .dd-options li').show();
                                var gallery_value = data.selectedData.value;
                                var gallery_name = data.selectedData.text;
                                var items_length = itemsToCopy.split(',').length;

                                _this.onCopyGallery(gallery_value, itemsToCopy, gallery_name, items_length);
                            }
                        } else if ($(data.original).attr('id') == 'dropdownTypes') {

                            checking_hash('filter', data.selectedData.value);
                            _this.showWorking();

                        } else if ($(data.original).attr('id') == 'dropdownUsage') {
//_this.loadData(getLibraryCommand, true);
                            checking_hash('sort', data.selectedData.value)
                            _this.showWorking();
                        } else if ($(data.original).attr('id') == 'dropdownUsageMobile') {
                            $('#dropdownUsage').ddslick('select', {index: data.selectedIndex});
                        } else {
                            _this.searchEmptyResultGallery = data.selectedData.value;
                            if ($(data.original).attr('id') == 'dropdownGalleries') {

                                if (data.selectedData.description == undefined) {
                                    data.selectedData.description = 0;
                                }

                                checking_hash('fid', data.selectedData.description);

                                _this.showWorking();

//location.hash = 'fid=' + data.selectedData.description || ''; //Original code
                            }
//_this.loadData(getLibraryCommand, true);//will be called when hash will be changed
                        }
                    }

                }
            });
        });

        $('#dropdownGalleries ul li:eq(1)').html(unescape($('#dropdownGalleries ul li:eq(1)').text()));

        setTimeout(function () {
            if (location.hash != '') {
                _this.hashActionExist();
            }
        }, 2000)

        var search_val;
        var search_index;
        $('#search_gallery').keyup(function (e) {
            search_val = $(this).val();
            var obj = $(this);

            $('#dropdownGalleries ul li').hide();
            $('#dropdownGalleries ul li:first').show();
            $('#search_gallery').parents('li').show();

            $('#dropdownGalleries ul li a').each(function () {
                gallery_label_val = $(this).find('label').text();
                gallery_val_id = $(this).find('small').text();
                if (gallery_label_val.toLowerCase().indexOf(search_val.toLowerCase()) > -1 || gallery_val_id.toLowerCase().indexOf(search_val.toLowerCase()) > -1) {
                    $(this).parents('li').show();
                }
                $(obj).focus().val($(obj).val()); //This need for IE, because in IE after insert 1 character input not focused and need add cursor again after each character
            });
            return false;
        });

        $(document).on('keyup', '#copyTo ul li:first .copy_searchbox input', function (e) {
            search_val = $(this).val();
            var obj = $(this);

            $('#copyTo ul li').hide();
            $('#copyTo ul li:first').show();
            $('#search_gallery').parents('li').show();

            $('#copyTo ul li a').each(function () {
                gallery_label_val = $(this).find('label').text();
                gallery_val_id = $(this).find('small').text();
                if (gallery_label_val.toLowerCase().indexOf(search_val.toLowerCase()) > -1 || gallery_val_id.toLowerCase().indexOf(search_val.toLowerCase()) > -1) {
                    $(this).parents('li').show();
                }
                $(obj).focus().val($(obj).val()); //This need for IE, because in IE after insert 1 character input not focused and need add cursor again after each character
            });
            return false;
        });

        firstActivation = false;

        $('#copyTo .dd-options li:first').append('<div class="copy_searchbox"><a class="search_img btn trans"><i class="icon-search"></i></a><input type="text" placeholder="Search..." class="field new_gallery"></div>');
        if (location.hash == '') {
            _this.loadData(getLibraryCommand);
        }
        $(document).on('keyup', '#copyTo .dd-options .new_gallery', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                var copyInputVal = $.trim($(this).val());
                if (copyInputVal != '') {
                    $('#copyTo .dd-options li').hide();
                    $('#copyTo .dd-options li:first').show();
                    $("#copyTo .dd-options li label:contains('" + copyInputVal + "'), #copyTo .dd-options li small:contains('" + copyInputVal + "')").parents('li').show();
                } else {
                    $('#copyTo .dd-options li').show();
                }
                return false;
            }
        });
    }

    this.invoke = function (command, params, successHandler, errorMessage) {
        var url;
        $.ajax({
            type: 'POST',
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: 'cmd=' + command + '&' + params,
            dataType: 'json',
            success: function (res) {
                successHandler(res);

                setTimeout(function () {
                    _this.hideWorking();
                }, 700)
            },
            error: function () {
                _this.showMessage(errorMessage);
            }
        });
    }

    this.onCopyGallery = function (galleryValue, reoderItems, galleryName, itemsLength) {
        var htm = '<div class="modalContainer modalContainer-copyConfirmation">\
                <div class="modalHeader">\
                <span>Copy To</span>\
             </div>\
             <div class="modalContent">\
                <div class="infoBlock">\
                    <h3> Are you sure you want to copy the selected <b>' + itemsLength + '</b> ' + (itemsLength > 1 ? " files" : " file") + ' to <b>' + galleryName + '</b></h3>'
            + (galleryValue == 'new_gallery' ? '<input class="field new_gallery" type="text" value="">' : '') +
            '</div>\
            <label class="checkBox"><input type="checkbox" class="check_item"><i></i><b>Add files at the begining of the gallery</b></label>\
        </div>\
        <div class="modalFooter">\
           <div class="floatleft"> <a title="Cancel, do not copy" class="btn gray cancelAction"><b>Cancel</b></a> </div>\
           <div class="floatright"> <a title="Yes, copy the files" class="btn green copyFile"><b>Yes, copy the files</b></a> </div>\
        </div>\
    </div>';
        openModal(htm, 500, 300);
        $('.modalContainer-copyConfirmation .cancelAction').on('click', function () {
            $.modal.close();
            $('#copyTo').ddslick('select', {index: '0'});
            $('#copyTo .dd-select .dd-selected-text span').remove();
            $('#copyTo .dd-select .dd-selected-text').html('Copy To<span>(' + itemsLength + ')</span>');
        });
        $('.modalContainer-copyConfirmation .copyFile').on('click', function () {
            var command = 'save_folder';
            var params = '';
            if (galleryValue == 'new_gallery') {
                galleryValue = $('.modalContainer-copyConfirmation .new_gallery').val();
                galleryValue = galleryValue.replace(/[<>]/g, '');
                params += '&folder_name=' + galleryValue;
            } else {
                params += '&folder_id=' + galleryValue;
            }
            params += '&rid=' + reoderItems;
            if ($(this).parents('.modalContainer-copyConfirmation').find('input.check_item').is(':checked')) {
                params += '&reorder_items=1';
            }

            successHandler = function (res) {
                if ($('.modalContainer-copyConfirmation .copied').length)
                    $('.modalContainer-copyConfirmation .copied').remove();
                $('.modalContainer-copyConfirmation').append('<p class="copied">Copy done</p>');
                setTimeout(function () {
                    $.modal.close();
                    $('.input_class_checkbox').prop('checked', false);
                }, 3000);
                $('#copyTo').ddslick('select', {index: '0'});
            };
            _this.invoke(command, params, successHandler, 'Error occured during added items to gallery ' + galleryValue);
        });
    }

    this.showMessage = function (text) {
        _this.libraryArea.find('.headRight .saving').removeClass('processing').text('');
        _this.libraryArea.find('.headRight .saving').addClass('error').text(text);
        clearTimeout(_this.showMessageTimer);
        _this.showMessageTimer = setTimeout(function () {
            _this.libraryArea.find('.headRight .saving.error').hide();
            _this.libraryArea.find('.headRight .saving').removeClass('error');
        }, 5000);
    }

    this.editMediaItem = function (item) {
        currentEditingItemID = item.directive_attribues.id;
        var width = '', height = '', aspect_ratio = '', fps = '', bitrate = '', duration = '', size = '', videoRatio = 1;
        var previewHtm = '<div id="' + new_guid + '">...</div>', embed_id = '', previewContainer = '', timelineContainer = '', annotationsContainer = '', callForActionContainer = '', previewEmbed = '', previewEmbedEmail = '';
        var itemType = item.directive_attribues.type;
        var extraData;
        if (itemType == 'image') {
            extraData = item.exif;
            width = item.exif.width;
            height = item.exif.height;
            aspect_ratio = detectRatio(width, height) || '';
            bitrate = item.exif.bitrate || '';
            fps = item.exif.fps || '';
            duration = item.exif.duration || '';
            embed_id = 'A8AAFV8a-H5b'; //'AYFAGWcln79E';
            previewHtm = '<img src="' + item.thumbnail.directive_innervalue.replace('o=0', 'o=1').replace('o=2', 'o=1') + '" />';
        } else if (itemType == 'video') {
            extraData = item.exif;
            width = item.exif.width || width;
            height = item.exif.height || height;
            aspect_ratio = detectRatio(width, height) || '';
            bitrate = item.exif.bitrate || bitrate;
            fps = item.exif.fps || fps;
            duration = item.exif.duration || duration;


            if (width && height) {
                videoRatio = width / height;
            }

            embed_id = 'A4HAcLOLOO68';

            previewHtm += '<input type="button" id="add_annotation" value="Click to add chapter" data-action="add annotation"/>';
            previewHtm += '<input type="button" id="add_thumb_sec" value="Click to set as thumb" class="video_thumb_sec fl" data-action="set thumb"/>';

            previewEmbed = '<ul id="add_gall_id" data-type="video"></ul>';
            /*
            previewEmbed = '<select id="add_gall_id" name="add_gall_id">\
                                <option value="AoIAMJd_cbRb">Default Video Player</option>\
                                <option value="A4IA-RbWMFlu">Popup Video Player</option>\
                                <option value="A4LAbUcY-7We">Cool Red Player</option>\
                                <option value="AgEA0W8R-PWg">Blue Player</option>\
                                <option value="AAPAVWso-Lzh">Black & White Player</option>\
                                <option value="">Customized Player </option>\
                            </select>';
            */
        } else if (itemType == 'music') {

            extraData = item.id3tag;
            bitrate = item.id3tag.bitrate || bitrate;
            duration = item.id3tag.duration || duration;

            embed_id = 'AEFALSr3trK4';
            previewEmbed = '<ul id="add_gall_id" data-type="music"></ul>';
            /*
            previewEmbed = '<select id="add_gall_id" name="add_gall_id">\
                                <option value="AEFALSr3trK4">Default Audio Player</option>\
                                <option value="AwBA9Ybai0BL">Dark Rounded Player</option>\
                                <option value="AIIACaM9Xsjp">Square White Player</option>\
                                <option value="AMAA3ZM-XEoq">Retro Blue Player</option>\
                        </select>';
            */
        } else if (itemType == 'unknown') {
            previewHtm = '<div><div class="unknownIcon"></div></div>'
                + "<div class='unknownFile'>" + item.filename + "</div>";
        } else {
            previewHtm = "<div class='unknownFile'>" + item.filename + "</div>";
        }
        previewEmbedEmail = _this.createEmbedEmailHtml(item.directive_attribues.id, item.directive_attribues.drid, embed_id, itemType);
        var filesize = fileSizeConvertor(item.filesize);
        var previewContainer = '';
        if (itemType == 'video') {
            /*  thumbnail container */
            previewContainer = '<div id="tab_thumbnail" class="tabContent thumbnail">' +
                '<div id="auto-caption" data-status="check"><div class="thumbnail banner">\
                        <div class="thumbnail description row">\
                            <div class="col-sm-8"><h2 class="banner-title">Video Thumbnail</h2>\
                            <p>Set a specific frame of the video or upload a preview image.</p></div>\
						<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="thumbnailVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div>\
                        </div></div></div>' +
                '<div class="previewVideoPoster" style="margin: 30px;">' +
                '<input class="asset_block" name="video_thumb_sec" type="hidden">' +
                '<div class="fl" ><div class="poster_by_sec"><label>Choose thumbnail for your video by entering a second from the video or choose from predefined thumbnails or upload image file </label><input class="secondsInput"  placeholder="enter a number of a second" type="text" style="width:30% !important; background-color:#fff;" value="' + (typeof item.video_thumb_sec != "undefined" ? item.video_thumb_sec: "") + '"/></div></div><br/>' +
                '<div class="posterGroup" >' +
                '<div class="postersContainer">';
            var hms = item.exif.duration;   // your input string
            var ze_time_convert = hms.split(':'); // split it at the colons

// minutes are worth 60 seconds. Hours are worth 60 minutes.
            var seconds = (+ze_time_convert[0]) * 60 * 60 + (+ze_time_convert[1]) * 60 + (+parseInt(ze_time_convert[2]));
            item.exif.durationBySeconds = seconds;
            var posteUrl;
            if (typeof item.thumbnail_orig != "undefined")
                posteUrl = item.thumbnail_orig.directive_innervalue.replace(/&amp;/g, '&').replace('p=y', 't=y');
            else
                posteUrl = item.thumbnail.directive_innervalue.replace(/&amp;/g, '&').replace('p=y', 't=y');
            var whattoReplace = inBetween(posteUrl, '?o=', '&');

            var sec = getRandomInt(0, 3);
            var tmbUrl = posteUrl.replace('?o=' + whattoReplace, '?o=' + whattoReplace.charAt(0) + sec);
            previewContainer += '<div data-src="' + (item.tmbUrl !== undefined ? item.tmbUrl : posteUrl) + '"  class="thumbImage loaderImageContainer" video-sec="-1"><img src="'+thumbLoaderUrl+'"></div>';
            previewContainer += '<div data-src="' + tmbUrl + '" class="thumbImage loaderImageContainer" video-sec="' + sec + '"><img src="'+thumbLoaderUrl+'"></div>';

            sec = parseInt(seconds * 20 / 100);
            tmbUrl = posteUrl.replace('?o=' + whattoReplace, '?o=' + whattoReplace.charAt(0) + sec);
            previewContainer += '<div data-src="' + tmbUrl + '"  class="thumbImage loaderImageContainer" video-sec="' + sec + '"><img src="'+thumbLoaderUrl+'"></div>';

            sec = parseInt(seconds * 60 / 100);
            tmbUrl = posteUrl.replace('?o=' + whattoReplace, '?o=' + whattoReplace.charAt(0) + parseInt(seconds * 60 / 100));
            previewContainer += '<div data-src="' + tmbUrl + '"  class="thumbImage loaderImageContainer preview" video-sec="' + sec + '"><img src="'+thumbLoaderUrl+'"></div>';

            previewContainer += '</div></div>';

            /* upload button */
            thumb_files_thm = '';
            browse_upload_thumb_limit = 4;
            if (item.attached) {
                $.each(item.attached, function (i, v) {
                    var fileType = v.directive_attribues.type;
                    var file_id = v.directive_attribues.id;
                    var url = v.url.directive_innervalue;
                    url = url.replace("o=1", "o=2");
                    if (fileType == "thumb") {
                        thumb_files_thm += '<div class="thumbImage ' + (typeof item.thumbnail.directive_attribues.attached_id != "undefined" && file_id == item.thumbnail.directive_attribues.attached_id ? "active" : "") + '" style="position:relative">';
                        thumb_files_thm += '<div class="file_img">';
                        thumb_files_thm += '<img src="' + url + '">';
                        thumb_files_thm += '</div>';
                        thumb_files_thm += '<a class="remove_upload_file" data-id="' + file_id + '" style="position:absolute; right:0; top:0; z-index:1000; line-height:1; display:none" href="javascript:;"><i class="icon-delete"></i></a>';
                        thumb_files_thm += '</div>';
                        browse_upload_thumb_limit--;
                        if (browse_upload_thumb_limit == 0) {
                            $("#upload_thumb_btn").prop('disabled', true);
                            $("#upload_thumb_files .uploadBtn").css("opacity", "0.5");
                        }
                    }
                    url = '';
                });
            }
            previewContainer += '<div class="posterGroup posterUploadedImages" >' +
                '<div class="postersContainer">' + thumb_files_thm + '</div>' +
                '</div>';
            previewContainer += '<div id="upload_thumb_files"><div type="button" class="btn secondary3 uploadBtn" style="margin-top:15px"><input id="upload_thumb_btn"' + (browse_upload_thumb_limit == 0 ? 'disabled = true' : '') + ' type="file" style="position:absolute; visibility:visible; opacity:0;" class="upload_button cp_hidden"/><i class="icon-uploadfiles"></i><b>Upload new thumb (max 4)</b></div><input name="thumb_attached_rid" type="hidden" value=""></div>';
            /* upload button */

            previewContainer += '<div class="saveBtn btn primary saveBtnDisabled" data-action="Save thumb">Save</div>';
            previewContainer += '</div>\
                            </div>';
            /* end thumbnail container */

        } else if (itemType == 'music' || itemType == 'unknown') {
            /*  thumbnail container */
            previewContainer = '<div id="tab_thumbnail" class="tabContent thumbnail">\
                            <div class="previewVideoPoster">\
                            <div class="fl" ><label>Choose thumbnail or upload a new one </label></div><br/>';

            /* upload button */
            thumb_files_thm = '';
            browse_upload_thumb_limit = 4;
            if (item.attached) {
                $.each(item.attached, function (i, v) {
                    var fileType = v.directive_attribues.type;
                    var file_id = v.directive_attribues.id;
                    var url = v.url.directive_innervalue;
                    url = url.replace("o=1", "o=2");
                    if (fileType == "thumb") {
                        thumb_files_thm += '<div class="thumbImage ' + (typeof item.thumbnail.directive_attribues.attached_id != "undefined" && file_id == item.thumbnail.directive_attribues.attached_id ? "active" : "") + '" style="position:relative">';
                        thumb_files_thm += '<div class="file_img">';
                        thumb_files_thm += '<img src="' + url + '">';
                        thumb_files_thm += '</div>';
                        thumb_files_thm += '<a class="remove_upload_file" data-id="' + file_id + '" style="position:absolute; right:0; top:0; z-index:1000; line-height:1; display:none" href="javascript:;"><i class="icon-delete"></i></a>';
                        thumb_files_thm += '</div>';
                        browse_upload_thumb_limit--;
                        if (browse_upload_thumb_limit == 0) {
                            $("#upload_thumb_btn").prop('disabled', true);
                            $("#upload_thumb_files .uploadBtn").css("opacity", "0.5");
                        }
                    }
                    url = '';
                });
            }
            previewEmbedEmail = _this.createEmbedEmailHtml(item.directive_attribues.id, item.directive_attribues.drid, embed_id, itemType);
            previewContainer += '<div class="posterGroup posterUploadedImages" >' +
                '<div class="postersContainer">' + thumb_files_thm + '</div>' +
                '</div>';
            previewContainer += '<div id="upload_thumb_files"><div type="button" class="btn secondary3 uploadBtn" style="margin-top:15px"><input id="upload_thumb_btn"' + (browse_upload_thumb_limit == 0 ? 'disabled = true' : '') + ' type="file" style="position:absolute; visibility:visible; opacity:0;" class="upload_button cp_hidden"/><i class="icon-uploadfiles"></i><b>Upload new thumb (max 4)</b></div><input name="thumb_attached_rid" type="hidden" value=""></div>';
            /* upload button */

            previewContainer += '<div class="saveBtn btn primary saveBtnDisabled" data-action="Save thumb">Save</div>';
            previewContainer += '</div>\
                            </div>';
            /* end thumbnail container */

        }

        /* thumb files upload */
        if (changed_count) {
            $(document).on('change', '#upload_thumb_btn', function (e) {
                var fileInput = this;
                var data = new FormData();
                $.ajax({
                    type: 'GET',
                    url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_get_uploadurl&rid=' + currentEditingItemID + '&type=thumb',
                    dataType: 'json',
                    success: function (data) {
                        if (data.upload_url) {
                            $('.error_form').hide();
                            if ('files' in fileInput) {
                                _this.uploadThumb(fileInput.files[0], data.upload_url);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            });
            changed_count = false;
        }

        /* thumb files upload */


        /* extra files upload */

        if (changed_count_extra) {
            $(document).on('change', '#upload_extrafile_btn', function (e) {
                var fileInput = this;
                var form = $("#upload_extrafile_form");
                var data = new FormData();
                var type = $(".extraFileType").val();
                $.ajax({
                    type: 'GET',
                    url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_get_uploadurl&rid=' + currentEditingItemID + '&type=' + type,
                    dataType: 'json',
                    success: function (data) {
                        if (data.upload_url) {
//$('.upload_box').hide();
                            $('.error_form').hide();
                            if ('files' in fileInput) {
                                uploadFile(fileInput.files[0], data.upload_url, type);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            });
            changed_count_extra = false;
        }
        function uploadFile(file, uploadUrl, type) {
            /*
             if($.inArray(file.type, ['image/gif','image/png','image/jpeg','image/jpg', 'image/bmp']) == -1) {
             alert('invalid extension of image!');
             $("#upload_extrafile_btn").replaceWith($("#upload_extrafile_btn").clone());
             return false;
             }
             */
            type = type ? type: "";
            var uploadInfo = {file: file, uploadState: 'Pending', percentComplete: 0, index: 0};
            var xhr = new XMLHttpRequest();
            var eventSource = xhr.upload || xhr;
            xhr.open('POST', uploadUrl, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var resId = xhr.responseText.substr(xhr.responseText.indexOf("id") + 3).split(" ")[0]
                    $('#extra_files .status_text').html('<p>Complete</p>');
                    setTimeout(function () {
                        $('#extra_files .status_text').html('');
                    }, 2000);


                    setTimeout(function () {
                        _this.updateExtraFiles();
                    }, 500);
                    $("#upload_extrafile_btn").replaceWith($("#upload_extrafile_btn").clone());
                    browse_extra_files_limit--;
                    if (browse_extra_files_limit == 0) {
                        $("#upload_extrafile_btn").prop('disabled', false);
                        $("#extra_files .uploadBtn").css("opacity", "1");
                    }

                    if ($(".thumbImage.active").parents(".posterUploadedImages").length) {
                        _this.saveMetaInfo(true);
                    } else {
                        _this.saveMetaInfo();
                    }

                }
            }
            eventSource.onprogress = onUploadProgress(uploadInfo);
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.setRequestHeader('X-FILE-NAME', encodeURIComponent(file.name));
            uploadInfo.xhr = xhr;
            xhr.send(file);
        }


        extra_files_thm = '';
        subtitle_files_thm = '';
        versions_thm = '';
        browse_extra_files_limit = 20;
        subtitlesCount = 0;
        if (item.attached) {
//extra_files_thm = '<div class="extra_file_box">';
            $.each(item.attached, function (i, v) {
//var whattoReplace = inBetween(url, '?o=', '&');
                url = item.thumbnail.directive_innervalue;
                url = url.replace("&t=y", "&p=y");
                var fileType = v.directive_attribues.type;

                file_id = v.directive_attribues.id;
                start_pos = url.lastIndexOf('/') + 1;
                end_pos = url.indexOf('?');
                text_to_get = url.substring(start_pos, end_pos)
                //url = url.replace(text_to_get, v.directive_attribues.name);
//url = url.replace('?o=' + whattoReplace, '?o=7'+ file_id);
//url = url.replace("&o=2", "&o=7"+file_id);
                url = v.url.directive_innervalue;

                if (v.directive_attribues.type.lastIndexOf("subtitle-", 0) === 0) {
                    subtitlesCount ++;
                    var lang_code = v.directive_attribues.type.replace("subtitle-", "");
                    var lang = langCodes[lang_code].name;
                    subtitle_files_thm += '<div class="subtitle_file_line file_line">';
                    subtitle_files_thm += '<div class="file_id">' + lang + ' </div>';
                    subtitle_files_thm += '<div class="file_name">';
                    subtitle_files_thm += '<a target="_blank" href="' + url + '" title="' + decodeXMl(v.directive_attribues.filename) + '">' + decodeXMl(v.directive_attribues.filename) + '</a>';
                    subtitle_files_thm += '</div>';
                    subtitle_files_thm += '<div class="file_srt"><a class="srt_action" data-name="'+ decodeXMl(v.directive_attribues.filename) + '" data-id="' + v.directive_attribues.id + '" data-lang="'+lang_code+'"  data-srturl="'+url+'"  data-filename="'+item.filename+'" data-drid="' + _this.mediaItems[currentEditingItemID].directive_attribues.drid + '" href="javascript:;"><i class="icon-gear"></i></a></div>';
                    subtitle_files_thm += '<div class="file_remove"><a class="remove_subtitle" data-id="' + v.directive_attribues.id + '" href="javascript:;"><i class="icon-delete"></i></a></div>';
                    subtitle_files_thm += '</div>';
                }
                extra_files_thm += '<div class="extra_file_line file_line">';
                extra_files_thm += '<div class="file_name">';
                extra_files_thm += '<a target="_blank" href="' + url + '" title="' + decodeXMl(v.directive_attribues.filename) + '">' + decodeXMl(v.directive_attribues.filename) + '</a>';
                extra_files_thm += '</div>';
                extra_files_thm += '<div class="file_type">' + v.directive_attribues.type + '</div>';
                extra_files_thm += '<div class="file_remove"><a class="remove_extra_file" data-id="' + v.directive_attribues.id + '" href="javascript:;"><i class="icon-delete"></i></a></div>';
                extra_files_thm += '</div>';
                browse_extra_files_limit--;
                if (browse_extra_files_limit == 0) {
                    $("#upload_extrafile_btn").prop('disabled', true);
                    $("#extra_files .uploadBtn").css("opacity", "0.5");
                }
                url = '';

            });
//extra_files_thm += '</div>';
            _this.drawItem(item);
        }
        versions_thm = (__user_feature['assets-versions'].value == "true" ? '<a class="resyncItem btn secondary" title="Resync" style="float:right"><i class="icon-refresh"></i><b>Resync</b></a><div style="clear: both"></div>' : "");
        versions_thm += '<div class="versions_file_box file_box">';
        versions_thm += _this.buildVersionsHtm(item);
        versions_thm += '</div>';


        /* timeline container */
        if (itemType == 'video' /*|| itemType == 'music'*/) {
            timelineContainer = '<div id="tab_timeline" class="tabContent timeline">\
<div class="chapters banner">\
				<div class="chapters description row">\
<div class="col-sm-8"><h2 class="banner-title">Chapters</h2>\
                    <p>Chapter a video for easy in-video viewer navigation.</p></div>\
					<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="chaptersVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div></div></div>\
                                    <div class="timelineBlock" data-type="chapter">\
                                        <a class="add_annotation_btn addTimelineBtn" data-action="Add chapter" data-type="chapter">Add Chapter</a>\
                                        <div class="annotations"></div>\
                                        <table class="addAnnotations boxMeta_form empty_form">\
                                                <tr class="titleBlock annotation_field"><th>Title</th> <td><input placeholder="Add chapter title" class="annotation_title annotation_required"></td></tr>\
                                                <tr class="annotation_field"><th>Description</th> <td><textarea placeholder="Add chapter description" class="annotation_description"></textarea></td></tr>\
                                                <tr class="annotation_field"><th>Seconds</th> <td><input placeholder="0" class="annotation_seconds annotation_second_input"><a class="annotation_seconds_minus annotation_seconds_decrease">-</a><a class="annotation_seconds_plus annotation_seconds_increase">+</a></td></tr>\
                                                <tr class="annotation_field"><th></th> <td><a class="annotatio_submit_btn btn primary alignright disabled">Add</a><a class="annotatio_cancel_btn btn secondary alignright">Cancel</a></td></tr>\
                                        </table>\
                                    </div>\
                                 </div>\
<div id="tab_annotations" class="tabContent annotations">\
<div class="annotation banner">\
				<div class="annotation description row">\
				<div class="col-sm-8"><h2 class="banner-title">Video Annotations</h2>\
                    <p>Add during-play text annotations, clickable links and html forms.</p></div>\
					<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="annotationsVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div></div></div>\
                                     <div class="timelineBlock" data-type="annotation">\
                                         <select id="addAnnotationSelect" class"addAnnotationSelect">\
                                            <option value="title">title</option>\
                                            <option value="label">label</option>\
                                            <option value="note">note</option>\
                                            <option value="spotlight">spotlight</option>\
                                            <option value="timeline">timeline</option>\
                                         </select>\
                                         <div class="annotations"></div>\
                                         <div class="annotationsBox addAnnotations boxMeta_form empty_form">\
                                                 <input type="hidden" class="addAnnotationType">\
                                                 <div class="annotation_field"><textarea placeholder="Type text here" class="annotation_description annotation_required"></textarea></div>\
                                                 <h3><span>When?</span></h3>\
                                                 <div class="fieldsSection">\
                                                     <div class="annotation_field timeField"><p><b>Start</b><div class="inputDigital"><div class="field"><input placeholder="00:00:00" class="annotation_seconds annotation_second_input" ></div><div class="buttons"><a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                     <div class="annotation_field timeField annotation_end"><p><b>End</b><div class="inputDigital"><div class="field"><input placeholder="00:00:00" class="annotation_seconds_end annotation_second_input"></div><div class="buttons"><a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                     <span class="annotationError"></span>\
                                                 </div>\
                                                 <div class="annotation_position_section">\
                                                     <h3><span>Position</span></h3>\
                                                     <div class="fieldsSection">\
                                                         <div class="annotation_field timeField"><p><b>Left (%)</b><div class="inputDigital"><div class="field"><input value="30" class="annotation_left annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                         <div class="annotation_field timeField"><p><b>Top (%)</b><div class="inputDigital"><div class="field"><input value="5" class="annotation_top annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                     </div>\
                                                 </div><div class="annotation_size_section">\
                                                     <h3><span>Size</span></h3>\
                                                      <div class="fieldsSection">\
                                                          <div class="annotation_field timeField"><p><b>Width (%)</b><div class="inputDigital"><div class="field"><input value="50" class="annotation_width annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                          <div class="annotation_field timeField"><p><b>Height (%)</b><div class="inputDigital"><div class="field"><input value="20" class="annotation_height annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                      </div>\
                                                 </div>\
                                                 <div class="annotation_position_section">\
                                                      <h3><span>Position</span></h3>\
                                                      <div class="fieldsSection">\
                                                          <div class="annotation_field timeField"><p><b>Left (%)</b><div class="inputDigital"><div class="field"><input class="annotation_left_sp annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                          <div class="annotation_field timeField"><p><b>Top (%)</b><div class="inputDigital"><div class="field"><input class="annotation_top_sp annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                      </div>\
                                                 </div><div class="annotation_size_section">\
                                                      <h3><span>Size</span></h3>\
                                                       <div class="fieldsSection">\
                                                           <div class="annotation_field timeField"><p><b>Width (%)</b><div class="inputDigital"><div class="field"><input class="annotation_width_sp annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                           <div class="annotation_field timeField"><p><b>Height (%)</b><div class="inputDigital"><div class="field"><input class="annotation_height_sp annotation_size" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                       </div>\
                                                 </div>\
                                                 <h3><span>Custom</span></h3>\
                                                 <div class="fieldsSection">\
                                                      <div class="annotation_field fieldItem color annotation_custom_field"><p><b>Color</b><div class="argumentValue"><input type="text" value="0xffffff" class="field annotation_color" ></div></p></div>\
                                                      <div class="annotation_field fieldItem color bgcolor annotation_custom_field"><p><b>Background Color</b><div class="argumentValue"><input type="text" value="0x000000" class="field annotation_bg_color" ></div></p></div>\
                                                      <div class="annotation_field fieldItem annotation_custom_field"><p><b>Font size</b><div>\
                                                         <select class="annotation_font annotation_font_big">\
                                                            <option value="24px">24px</option>\
                                                            <option value="42px">42px</option>\
                                                            <option value="58px">58px</option>\
                                                            <option value="72px">72px</option>\
                                                            <option value="100px">100px</option>\
                                                         </select>\
                                                         <select class="annotation_font annotation_font_small">\
                                                             <option value="11px">11px</option>\
                                                             <option value="13px">13px</option>\
                                                             <option value="16px">16px</option>\
                                                             <option value="20px">20px</option>\
                                                             <option value="24px">24px</option>\
                                                         </select>\
                                                      </div></p></div>\
                                                       <div class="annotation_field fieldItem annotation_custom_field"><p><b>Font style</b><div>\
                                                           <select class="annotation_font_style annotation_font_big annotation_input_change">\
                                                              <option value="bold">bold</option>\
                                                              <option value="shadow">shadow</option>\
                                                              <option value="italic">italic</option>\
                                                              <option value="underline">underline</option>\
                                                              <option value="normal">normal</option>\
                                                           </select>\
                                                        </div></p></div>\
                                                 </div>\
                                                 <div class="annotation_field annotation_position_link">\
                                                     <label class="checkBox"><input type="checkbox" class="annotation_enable_link" /><i></i><b>Link</b></label>\
                                                     <div class="annotation_link_block cp_hide">\
                                                         <div class="annotation_field">\
                                                            <input type="text" value="http://" placeholder="http://" class="annotation_link">\
                                                         </div>\
                                                         <div class="annotation_field">\
                                                            <label class="checkBox"><input type="checkbox" class="annotation_link_blank" /><i></i><b>Open link in a new tab</b></label>\
                                                         </div>\
                                                         <div class="annotation_field">\
                                                            <label class="checkBox"><input type="checkbox" class="annotation_link_tooltip annotation_input_change" /><i></i><b>Show link in tooltip</b></label>\
                                                         </div>\
                                                         <div class="annotation_field annotation_tooltip_block cp_hide">\
                                                           <div class="annotation_field fieldItem color annotation_custom_field"><p><b>Tooltip color</b><div class="argumentValue"><input type="text" value="000000" class="field annotation_tooltip_color" ></div></p></div>\
                                                           <div class="annotation_field fieldItem color bgcolor annotation_custom_field"><p><b>Tooltip background color</b><div class="argumentValue"><input type="text" value="eeeeee" class="field annotation_tooltip_bg_color"></div></p></div>\
                                                         </div>\
                                                     </div>\
                                                 </div>\
                                         </div>\
                                     </div>\
                                  </div>\
                                  <div id="tab_callforaction" class="tabContent callforaction">\
<div class="action banner">\
				<div class="action description row">\
<div class="col-sm-8"><h2 class="banner-title">Video Call-To-Action</h2><p>Drive viewer action and higher video conversion using a call-to-action.</p></div>\
<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="callToActionVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div></div></div>\
                                   <div class="timelineBlock" data-type="calltoaction">\
                                       <a class="addAnnotationButton addTimelineBtn" data-action="Add call to action" data-type="calltoaction"><i class="icon-squared-plus"></i><b>Add Call To Action</b></a>\
                                       <div class="annotations">\
                                       </div>\
                                       <div class="annotationsBox addAnnotations boxMeta_form empty_form">\
                                               <div class="annotation_field"><textarea placeholder="Type text here" class="annotation_description annotation_required">Type text here</textarea></td></div>\
                                               <div class="annotation_field"><input type="text" placeholder="Link" class="annotation_link annotation_required"></div>\
                                               <div class="fieldsSection">\
                                                   <div class="annotation_field"><h3>When?</h3>\
                                                        <label class="radioBox"><input type="radio" name="callToactionTime_" value="preroll"/><i></i><b>Pre roll</b></label>\
                                                        <label class="radioBox"><input type="radio" name="callToactionTime_" value="postroll"/><i></i><b>Post roll</b></label>\
                                                        <label class="radioBox"><input type="radio" checked="checked" name="callToactionTime_" value="customtime"/><i></i><b class="annotation_seconds_b">\
                                                            <input type="hidden" class="annotation_seconds">\
                                                            <div class="inputDigital"><div class="field">\
                                                                <input placeholder="00:00:00" class="annotation_second_input">\
                                                            </div><div class="buttons">\
                                                                <a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a>\
                                                            </div></div>\
                                                        </b></label>\
                                                   </div>\
                                               </div>\
                                       </div>\
                                   </div>\
                                </div>\
								<div id="tab_start_end" class="tabContent start_end">\
									<div class="start-end banner">\
										<div class="start-end description row">\
											<div class="col-sm-8"><h2 class="banner-title">Start/End</h2>\
											<p>The video will start and end on the set times.</p></div>\
											<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="startVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div>\
										</div>\
									</div>\
                                    <div class="boxMeta_form annotations " >\
                                        <div class="timelineElement" data-type="start_end">\
                                           <div class="start_end_wrap start_wrap">\
                                               <div class="annotation_field"><h3>Start at</h3>\
                                                    <div class="inputDigital"><div class="field">\
                                                        <input name="start_at" title="Hours:Minutes:Seconds" placeholder="Hr:Min:Sec" value="00:00:00" class="annotation_second_input">\
                                                    </div><div class="buttons">\
                                                        <a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a>\
                                                    </div></div>\
                                               </div>\
                                               <div class="start_end_select_wrap"></div>\
                                           </div>\
                                           <div class="start_end_wrap end_wrap">\
                                               <div class="annotation_field"><h3>End at</h3>\
                                                   <div class="inputDigital"><div class="field">\
                                                       <input name="end_at" title="Hours:Minutes:Seconds" placeholder="Hr:Min:Sec" value="00:00:00" class="annotation_second_input">\
                                                   </div><div class="buttons">\
                                                       <a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a>\
                                                   </div></div>\
                                               </div>\
                                               <div class="start_end_select_wrap"></div>\
                                            </div>\
                                      </div>\
                                    </div>\
                                </div>';
        }
        var incompleteProcessMsg = "";
        if(itemType == 'video' && item.directive_attribues && item.directive_attribues.claimed !==item.directive_attribues.storage){
            incompleteProcessMsg = '<div class="incompleteProcessMsg">'+
                'This video is still being processed.<br>'+
                'Video quality may  improved once processing is complete.'+
                '</div>';
        }


        var htm = '<div class="boxMetaEditor ' + itemType + '">\
                        <ul class="tabsHead">\
                           <li class="asset_info active" data-tab="info" data-action="assets info"><a>Asset Info<\/a></li>&nbsp;'
            + (itemType != 'unknown' ? '<li class="share_info " data-tab="share" data-action="share info"><a>Share</a></li>&nbsp;' : '')
            + (itemType != 'unknown' ? '<li class="embed_info " data-tab="embed" data-action="embed info"><a>Embed</a></li>&nbsp;' : '')
            + (itemType != 'unknown' ? '<li class="embed_email " data-tab="embed_email" data-action="embed email"><a>Emails and Campaigns</a></li>&nbsp;' : '')
            + (itemType == 'video' || itemType == 'music' || itemType == 'unknown' ? '<li class="set_thumbnail " data-tab="thumbnail" data-action="set thumbnail"><a>Set thumbnail</a></li>&nbsp;' : '')
            + (itemType == 'video' ? '<li class="start_end" data-tab="start_end" data-action="start/end"><a>Start/End</a></li>&nbsp;' : '')
            + (itemType == 'video' ? '<li class="subtitles ' + (__user_feature["assets-subtitles"].value == 'false' ? 'cp_disabled':'') + '" data-tab="subtitles" data-action="subtitles"><a>CC & Auto Transcription</a></li>&nbsp;' : '')
            + (itemType == 'video' /*|| itemType == 'music'*/ ? '<li class="set_timeline ' + (__user_feature["assets-timeline"].value == 'false' ? 'cp_disabled':'') + '" data-tab="timeline" data-action="set timeline"><a>Chapters</a></li>&nbsp;' : '')
            + (itemType == 'video' ? '<li class="set_annotations  ' + (__user_feature["assets-timeline"].value == 'false' ? 'cp_disabled':'') + '" data-tab="annotations" data-action="annotations"><a>Annotations</a></li>&nbsp;' : '')
            + (itemType == 'video' ? '<li class="callforaction ' + (__user_feature["assets-timeline"].value == 'false' ? 'cp_disabled':'') + '" data-tab="callforaction" data-action="call to action"><a>Call to action</a></li>&nbsp;' : '')
            + '<li class="extra_files " data-tab="extra" data-action="extra files"><a>Extra files<\/a></li>&nbsp;'
            + '<li class="versions_files  ' + (__user_feature["assets-versions"].value == 'false' ? 'cp_disabled':'') + '" data-tab="versions" data-action="versions"><a>Versions</a></li>&nbsp;'
            //+ '<li class="publish_to_youtube  ' + (__user_feature["integration-youtube-uploader"].value == 'false' ? 'cp_disabled':'') + '" data-tab="publish_to_youtube" data-action="publish_to_youtube"><a>Publish to Youtube</a></li>&nbsp;'
            //+ '<li class="publish_to_facebook" data-tab="publish_to_facebook" data-action="publish_to_facebook"><a>Publish to Facebook</a></li>&nbsp;'
            + (itemType === 'video' ? '<li class="publish_to_social  " data-tab="social" data-action="publish_to_social"><a>Publish to social</a></li>&nbsp;' : '')
            + '</ul>'+
            // '<div id="publish_to_youtube" class="tabContent publish_to_youtube"></div>'+
            // '<div id="publish_to_facebook" class="tabContent publish_to_facebook"></div>'+
            '<div id="publish_to_social" class="tabContent social"></div>'
            +
            '<div id="versions" class="tabContent versions">' +
            '<div class="versions banner">\
				<div class="versions description">\
					<h2 class="banner-title">Transcoding Versions</h2>\
                    <p style="color: white;">Access the various transcoding versions manually.</p></div></div>' +
            incompleteProcessMsg+
            versions_thm +
            '</div>\
            <div id="extra_files" class="tabContent extra">\
				<div class="extra-files banner">\
					<div class="extra-files description">\
						<h2 class="banner-title">Extra Files</h2>\
						<p>Developers can store and access related files associated with this asset.</p>\						</div>\
				</div>\
                <div class="upload_box">\
                    <div class="fl" ><label>Enter type of extra file </label><input class="extraFileType" placeholder="enter type" type="text" style="width:20% !important; background-color:#fff;" value="extra"/></div><br/>\
                    <div type="button" class="btn secondary3 uploadBtn" ><i class="icon-uploadfiles"></i><b>Upload new file (max 20)</b>\
                    <input id="upload_extrafile_btn" style="position: absolute; visibility: visible; opacity: 0" type="file" class="upload_button cp_hidden"/></div>\
                    <div class="status_text"></div>\
                </div>'
            + '<div class="extra_file_box file_box">' + extra_files_thm + '</div>' +
            '</div>\
             <div id="subtitles" class="tabContent subtitles">\
             	<div id="auto-caption" data-status="check">Automatic Video Transcription (CC)...</div>\
              	<div class="tab-content-manage">\
					<h2>Manage asset\'s Closed Captions</h2>\
            		<p>Add, manage and edit this video\'s caption files. (Manually uploaded or auto-transcribed)</p>\
            		<div class="subtitles_box file_box">' + subtitle_files_thm + '</div>\
            		<div class="fieldItem block">\
                    	<p class="chooseAnother" style="display:none">Add another subtitle file</p>\
                        <div class="selectbox">' + languageSelectBox + '</div>\
                        <div class="addSubtitleBlock cp-hide" >\
                        	<p>Upload an .srt or .vtt file for <span class="selectedLanguage"></span></p>\
                            <div type="button" class="btn secondary3 uploadSubtitleBtn">\
								<span>Choose File</span><i class="icon-uploadfiles"></i>\
                                <input id="upload_subtitles_button" style="position: absolute; visibility: visible; opacity: 0" type="file" class="upload_subtitles_button cp_hidden"/>\
							</div>\
                            <a class="subtitles_cancel_btn btnflat blue alignright">Cancel</a>\
                        </div>\
                    </div>\
              	</div>\
			</div>\
<div id="tab_info" class="tabContent info active">\
				<div class="info banner">\
				<div class="info description row">\
<div class="col-sm-8"><h2 class="banner-title">Information & Metadata</h2>\
				<p>Edit the various fields for Video SEO and enhanced content management.</p></div>\
				<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="infoVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div></div></div>\
                        <table class="boxMeta_form">\
                            <tr><th>Title</th> <td><input class="keyup_input keyup_input_caption" type="text" placeholder="Add Title" name="caption" value="' + item.caption + '" /></td></tr>\
                                <tr><th>Description</th> <td><textarea class="keyup_textarea_description" name="description" placeholder="Add Description">' + item.description + '</textarea></td></tr>\
                                <tr><th>Notes</th> <td><textarea class="keyup_textarea_notes" name="long_description" placeholder="Add Notes">' + item.long_description.replace("<![CDATA[", "").replace("]]>", "") + '</textarea></td></tr>\
                                <tr><th>Tags</th> <td class="all_tags"> <input class="tags" name="tags" value="' + item.tags + '" /><a href="javascript:void(0)" class="selectTags" >Add new tag</a></td></tr>\
                                <tr><th>Related Link Text</th> <td><input class="keyup_input keyup_input_related_text" type="text"  name="related_link_text" placeholder="Add Text" value="' + item.related_link_text.replace("<![CDATA[", "").replace("]]>", "") + '" /></td></tr>\
                                <tr><th>Related Link URL</th> <td><input class="keyup_input keyup_input_related_url"  type="text" name="related_link_url" placeholder="Add URL" value="' + item.related_link_url + '" /></td></tr>\
                                <tr><th>Reference ID</th> <td><input class="keyup_input keyup_input_reference_id"  type="text" name="reference_id" placeholder="Add ID" value="' + item.reference_id + '"/></td></tr>' +
            (itemType == 'video' || itemType == 'image' ? '<tr class="annotations"><th>Activate 360° Video</th> <td class="timelineElement" data-type="isVR"><label class="checkBox" ><input type="checkbox" class="vr_input"><i></i><b></b></label></tr>': '')
            + '</table>\
                        </div>\
                    <div id="tab_share" class="tabContent share">\
						<div class="share banner">\
				<div class="share description">\
					<h2 class="banner-title">Cincopa SharePage</h2>\
<p>' + (itemType == 'video' ? 'Share this video to social as a clickable thumbnail leading viewers to a sharepage.' : 'Share this audio to social as a clickable thumbnail leading listeners to a sharepage.') + '</p>\
			</div></div>\
                        <div class="addThisBlock" style="padding: 30px;">\
							<div class="share_media">Share Your Media</div>\
								<div class="copy_text_block"><span class = "shortShareLink copy_url" id="shortShareLink" onclick="selectText(\'shortShareLinkHref\');">\
								<a id="shortShareLinkHref" class="copyValue" target="_blank" ></a ></span><span class="copy_button copyBtn" data-action="copy url">Copy URL</span>\
								<span class="copy_ctrl_c">Ctrl+C to copy</span></div>\
								<div class="addthis_toolbox addthis_default_style addthis_32x32_style" addthis:title="File share using Cincopa" >\
								<a class="addthis_button_facebook"></a>\
								<a class="addthis_button_twitter"></a>\
								<a class="addthis_button_google_plusone_share "></a>\
								<a class="addthis_button_pinterest_share"></a>\
								<a class="addthis_button_preferred_1"></a>\
								<a class="addthis_button_preferred_2"></a>\
								<a class="addthis_button_preferred_3"></a>\
								<a class="addthis_button_preferred_4"></a>\
								<a class="addthis_button_compact"></a>\
								<a class="addthis_counter addthis_bubble_style"></a>\
							</div>\
						</div>\
                    </div>\
					<div id="tab_embed_email" class="tabContent embed_email">'
            + '<div class="embed-email banner">\
							<div class="embed-email description row">\
								<div class="col-sm-8"><h2 class="banner-title">Email & Campaigns </h2>\
<p>' + (itemType == 'video' ? 'Embed a video thumbnail inside your marketing emails and track subscribers viewing engagement on our analytics.' : 'Embed a audio file inside your marketing emails sending listeners to your Cincopa sharepage.') + '</p></div>\
<div class="col-sm-4"><br><br><a href="javascript:;" class="submit btn primary" onclick="emailVideo()" id="btn-see-an-explainer"><i class="icon-play play-icon-button-fix"></i>See how this works</a></div>\
							</div></div>'
            + previewEmbedEmail +
            '</div>\
<div id="tab_embed" class="tabContent embed">'
            +'<div class="embed-video banner">\
				<div class="embed-video description">\
<h2 class="banner-title">'+ (itemType == 'video' ? 'Embed Video' : 'Embed Audio') + '</h2>\
<p>' + (itemType == 'video' ? 'Embed this video to your site using one of your galleries acting as a preset.' : 'Embed this audio to your site using one of your galleries acting as a player.') + '</p>\
			</div></div>'
            +'<div class="info" style="margin: 30px;">Choose one of your galleries to act as a preset for this video.<br>'
            +'If you later change the setting of this gallery it will be reflected immediately on your site.<br>'
            +'Note: for fast selection add "preset" label to your gallery to make it appear at the top of the list.<br></div>'
            + previewEmbed
            +'<div class="embedTabContent cp-hide">\
                <div class="embed_code">\
                <div class="titleDescBlock"><h4>html code: </h4>\
                <p>Copy this HTML code and paste it into your blog, CMS or site wherever you want the gallery to appear.</p></div>\
                <textarea id="reg_html" class="reg_html copyValue" onfocus="selectText(\'reg_html\');" readonly>'
            + _this.getEmbedCode(embed_id, item.directive_attribues.drid) +
            '</textarea>\
                <div class="embed_code_copybtn"><span class="copy_embed copyBtn" data-action="copy embed">Copy</span></div></div>\
                <div class="embed_code">\
                <div class="titleDescBlock"><h4>if your cms doesn\'t support JavaScript, try this : </h4>\
                <p>Copy this HTML code and paste it into your blog, CMS or site wherever you want the gallery to appear.You can change the width and height of iframe.</p></div>\
                <textarea id="copy_embed" class="ifrm_html copyValue" onfocus="selectText(\'copy_embed\');" readonly>' + _this.getIframeCode(embed_id, item.directive_attribues.drid) + '</textarea>\
                    <div class="embed_code_copybtn"><span class="copy_iframe copyBtn" data-action="copy embed">Copy</span></div></div>\
                    <div class="argumentGroup left fieldItem toggle iframeToggle">\
                    </label><label class="fieldLabel" style="height: 16px;"><span><b style="color: #66c100;" class="icon-ok"></b> SEO Boost - enables by default - read more about our <a href="/learn/smarter-seo-with-cincopas-json-ld/">JSON-LD</a> support</span></label></div>\
                    </div>\
                </div>';
        htm += previewContainer;
        htm += timelineContainer;
        htm += '</div>\
                <div class="boxDetails">\
                    <div class="boxPreview">\
                        <div class="skinView ' + (itemType == 'video' && videoRatio < 1 ? 'portraitVideo' : '') + '" >' + previewHtm + '</div>\
                    </div>'
            //<div class="analytics_view_div"><div class="weekly_views"><i class="icon-stat_views"></i><b>' + (item.analytics ? item.analytics.hits : '-') + '</b></div><div>Weekly Views</div></div>\
            + (itemType == 'video' || itemType == 'music' ? '<div class="boxStat" >\
                        <div class="analytics_view_div"><div class="weekly_views"><i class="icon-stat_views"></i><b>' + (item.analytics ? nFormatter(item.analytics.hits) : '-') + '</b></div><div>Weekly Views</div></div>\
                        <div class="chart_div">\
                            <div id="chart" style="width: 500px; height: 200px;">\
                            </div>\
                        </div>\
                        <div class="analytics_view_div analytics_domain_div"><div class="weekly_views domain_views"><i class="icon-domain"></i><b>' + (typeof _this.mediaItems[currentEditingItemID]["totaldomains"] != "undefined" ? _this.mediaItems[currentEditingItemID]["totaldomains"] : '-') + '</b></div><div>Weekly Domains</div></div>'
                + (typeof (item.in_folders) != 'undefined' ? '<div class="analytics_div"><div class="infolder"><i class="icon-stat_galleries"></i><b>' + item.in_folders + '</b></div><div>In Galleries</div></div>' : '<div class="analytics_div"></div>') +
                '</div>' : '') +
            '<div class="boxInfo">\
                    <ul>\
                        <li><i>Name:</i> <b>' + item.filename + '</b></li>\
                            <li><i>ID:</i> <b>' + item.directive_attribues.drid + '</b></li>\
                            <li><i>Last Updated:</i> <b>' + item.directive_attribues.modified + '</b></li>\
                            <li><i>Size:</i> <b>' + filesize.filesize + filesize.unit + '</b></li>\
                        </ul>\
                        <ul>'
            + (duration != '' ? '<li class="duration"><i>Duration:</i> <b>' + duration + '</b></li>' : '')
            + (bitrate != '' ? '<li class="bitrate"><i>Bitrate:</i> <b>' + bitrate + '</b></li>' : '')
        '</ul>\
                        <ul>';
        htm += (height != '' ? '<li class="height"><i>Height:</i> <b>' + height + '</b></li>' : '')
        htm += (width != '' ? '<li class="width"><i>Width:</i> <b>' + width + '</b></li>' : '')
        htm += (aspect_ratio != '' ? '<li class="aspect_ratio"><i>Aspect Ratio:</i> <b>' + aspect_ratio + '</b></li>' : '')
        htm += '</ul><ul>';
        htm += (fps != '' ? '<li class="fps"><i>Fps:</i> <b>' + fps + '</b></li>' : '');
        htm += '</ul><ul class="extraData">';
        for (var j  in extraData) {
            if (typeof (extraData[j]) === 'object') {
                for (var k  in extraData[j]) {
                    if (extraData[j][k] == '')
                        continue;
                    htm += ' <li class="fps"><i>' + k.charAt(0).toUpperCase() + k.slice(1).toLowerCase() + ': </i> <b>' + extraData[j][k] + '</b></li>';
                }
            }
            if (extraData[j] == '' || j == 'originaldate' || typeof (extraData[j]) === 'object' || j == 'duration' || j == 'durationBySeconds' || j == 'bitrate' || j == 'height' || j == 'width' || j == 'fps')
                continue;
            htm += ' <li class="fps"><i>' + j.charAt(0).toUpperCase() + j.slice(1).toLowerCase() + ': </i> <b>' + extraData[j] + '</b></li>';
        }
        htm += '</ul></div>'
        '</div>';
        this.assetEditor.empty();
        this.assetEditor.html(htm);

        $('.tabsHead li').click(function() {
            console.log('tab', $(this).data('tab'));
            history.pushState(null, null, '#details='+item.directive_attribues.drid+'|tab=' + $(this).data('tab'));
        });

        $('li.subtitles').click(function (e) {
            _this.checkSubtitles(item);
        });

        $('li.set_thumbnail').click(function (e) {
            _this.checkSubtitles(item);
        });

        $('.publish_to_youtube').click(function (e) {
            _this.buildPublishToYoutubeHtm($('#publish_to_youtube'), item);
        });

        $('.publish_to_facebook').click(function (e) {
            _this.buildPublishToFacebookHtm($('#publish_to_facebook'), item);
        });

        $('li.publish_to_social').click(function (e) {
            _this.buildPublishToSocialHtm($('#publish_to_social'), item);
        });

        if (__user_feature["runtime-seo"].value == "true") {
            _this.seo_on_off(item);
        }
        if (__user_feature["embed-email"].value == "false") {
            $(".email .embedActionsRight .copyBtn").addClass("cp_disabled");
            $(".email .embedActionsRight .copyBtnHtml").addClass("cp_disabled");
            $(".email .emailtextareaWrap").addClass("cp_disabled");
            $(".email_preview_header").addClass("cp-hide")
        }

        _this.bubbleInfo();
        _this.updateEmbedEmailHtml(item);
        if (itemType != 'image') {
            _this.loadSkinPreview(embed_id, item.directive_attribues.drid, new_guid);
        }

        if (!$(".posterUploadedImages").find(".active").length) {
            $(".thumbImage").eq(0).addClass("active");
        }

        var shareBlock = $('.addThisBlock', _this.assetEditor);
//shareBlock.find('.shortShareLink a').text('http://cinco.ly/!' + item.directive_attribues.drid).attr('href', 'http://cinco.ly/!' + item.directive_attribues.drid);
//shareBlock.find('.addthis_toolbox').attr("addthis:url", shareURL + item.directive_attribues.drid);
        shareBlock.find('.shortShareLink a').text(shareURL + resShareDefaults[item.directive_attribues.type] + '!' + item.directive_attribues.drid).attr('href', shareURL + resShareDefaults[item.directive_attribues.type] + '!' + item.directive_attribues.drid);
        shareBlock.find('.addthis_toolbox').attr("addthis:url", shareURL + resShareDefaults[item.directive_attribues.type] + '!' + item.directive_attribues.drid);
        if(typeof addthis != "undefined"){
            addthis.toolbox('.addthis_toolbox');
            setTimeout(function () {
//addthis.update('share', 'url', "http://cinco.ly/!" + item.directive_attribues.drid);
                addthis.update('share', 'url', shareURL + resShareDefaults[item.directive_attribues.type] + '!' + item.directive_attribues.drid);
            }, 500);
        }


        if (item.exif && typeof item.exif.duration != "undefined") {
            videoFileDuration = hmsToSecondsOnly(item.exif.duration);
        } else {
            videoFileDuration = 0;
        }

        $('#add_annotation').click(function (e) {
            e.stopPropagation();
            var type = $(this).attr("data-type");
            $('.timelineBlock[data-type="' + type + '"] .addTimelineBtn').click();
        });
        var firstOpen = true;
        $('#addAnnotationSelect').ddslick({
            selectText: "Add annotation",
            onSelected: function(selectedData){
                if(firstOpen){
                    $("#addAnnotationSelect .dd-selected").hide();
                    $("#addAnnotationSelect").prepend("<a class='addAnnotationButton addTimelineBtn' data-type='annotation'><i class='icon-squared-plus'></i><b>Add Annotation</b></a>");
                    $(".addAnnotationButton", $("#addAnnotationSelect")).off("click.openDropdown").on("click.openDropdown", function(){
                        $('#addAnnotationSelect').ddslick('open');
                        _this.player.pause();
                    });
                    $("#addAnnotationSelect .dd-option-text").each(function(){
                        $(this).html("<i class='icon-annotation-" + $(this).text() + "'></i><span>" + $(this).text() + "</span>")
                    })
                    firstOpen = false;
                } else {
                    var elem = $("#addAnnotationSelect .addAnnotationButton");
                    var type = selectedData.selectedData.value;
                    _this.addAnnotationCallback(elem, type);
                    _this.saveAddTimeLine(currentEditingItemID, "save", "annotation", true);
                }
            }
        });

        if (item.timeline) {
            eval('var timeLine = ' + decodeXMl(item.timeline));
            _this.buildTimeLineHtml(timeLine, "all");
        } else {
            _this.buildTimeLineHtml({}, "all");
        }
        _this.callColorPicker();
        _this.attachTimelineEvents();

        /* subtitles  */
        $('#languages').ddslick({
            onSelected: function (data) {
                if (data.selectedData.value != "Choose languages") {
                    $('.addSubtitleBlock').removeClass("cp-hide");
                    $('.selectedLanguage').text(data.selectedData.text);
                    $('.selectbox').hide();
                } else {
                    $('#languages').find(".dd-selected")
                        .html( '<div style="position: relative;"><i class="icon-search"></i><input id="search_language" class="field" type="text" name="search_language" value="" placeholder="Start typing ..."></div>');
                    $("#languages").find(".dd-pointer").hide()
                }
            }
        });

        $('#languages .dd-select').off("click");

        $('#languages').on("focus", "#search_language", function(){
            $('#languages').find(".dd-options").slideDown("fast");
        })

        $('#languages').on("keyup", "#search_language", function(){
            var search_val = $(this).val();
            var obj = $(this);

            $('#languages ul.dd-options li').hide();

            $('#languages ul.dd-options li:not(:first-child) a').each(function () {
                var label_val = $(this).find('label').text();
                var val_id = $(this).find('input').val();
                if (label_val.toLowerCase().indexOf(search_val.toLowerCase()) > -1) {
                    $(this).parents('li').show();
                }
                $(obj).focus().val($(obj).val()); //This need for IE, because in IE after insert 1 character input not focused and need add cursor again after each character
            });
            return false;
        })


        $('body').on('click', '.addSubtitleBlock .subtitles_cancel_btn', function () {
            $('.selectbox').show();
            $('.addSubtitleBlock').addClass("cp-hide");
            $('#languages .dd-option-selected').removeClass("dd-option-selected");
            $('#languages .dd-options li:first-child a').addClass("dd-option-selected");
            $('#languages').find(".dd-selected")
                .html( '<div style="position: relative;"><i class="icon-search"></i><input id="search_language" class="field" type="text" name="search_language" value="" placeholder="Start typing ..."></div>');
            $('#languages ul.dd-options li:not(:first-child)').show()
        });

        if (changed_count_subtitles) {
            $('body').on('change', '#upload_subtitles_button', function (e) {
                var fileInput = this;
                var data = new FormData();
                var lang = $('#languages .dd-selected-value').val();
                var lang_full = $('#languages .dd-selected-text').text();
                $.ajax({
                    type: 'GET',
                    url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_get_uploadurl&rid=' + currentEditingItemID + '&type=subtitle-' + lang,
                    dataType: 'json',
                    success: function (data) {
                        if (data.upload_url) {
                            $('.error_form').hide();
                            if ('files' in fileInput) {console.log(fileInput.files[0])
                                uploadSubtitleFile(fileInput.files[0], data.upload_url, lang, lang_full);
                            }
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            });
            changed_count_subtitles = false;
        }

        $('body').on('click', '.remove_subtitle', function (e) {
            e.preventDefault();
            var file_id = $(this).attr('data-id');
            var obj = $(this);
            $.ajax({
                type: 'GET',
                url: '/media-platform/wizard2/library2_ajax.aspx?cmd=attached_remove&rid=' + currentEditingItemID + '&type=' + file_id,
                dataType: 'json',
                success: function (data) {
                    $(obj).parents('.subtitle_file_line').fadeOut();

                    setTimeout(function () {
                        _this.updateExtraFiles();
                    }, 500);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });

        $('body').on('click','.srt_action',function () {
            var drid = $(this).attr('data-drid');
            var videoTitle =  $(this).attr('data-filename')
            var srturl = $(this).attr('data-srturl')
            var lang =$(this).attr('data-lang')
            var id = $(this).attr('data-id')
            var name = $(this).attr('data-name')
            var urlsearch = 'mode=srt&name='+name+'&id='+id+'&currentID='+currentEditingItemID+'&lang='+lang+'&fid='+drid+'&videoTitle='+videoTitle+'&disable_editor=y&srturl='+encodeURIComponent(srturl);
            /* $('body').append('<div id="srt_editor_popup"><span class="close-srt">X</span><div class="loader-conteiner"><div class="loader-cont"></div></div></div>')
$('body').css('overflow','hidden');
$('#srt_editor_popup').append(
$('<iframe id="srt_editor_content" src="/media-platform/features/subtitle-editor?' + urlsearch + '" frameBorder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"  />').load(function () {
    $('#srt_editor_popup .loader-conteiner').remove()
	}));*/
            window.open('/media-platform/features/subtitle-editor?' + urlsearch)

        });
        $(document).on('click','#srt_editor_popup .close-srt',function(){
            $('#srt_editor_popup').remove()
            $('body').css('overflow','auto');
        })

        if (itemType == 'video') {
            $('#add_thumb_sec').click(function () {
                $('.tabsHead li.set_thumbnail', _this.assetEditor).trigger('click');
                $('.secondsInput').val(_videoCurrentTime);
                inputHandler(_videoCurrentTime);
            });

            cincopa.registerEvent('onVideoEvents', 'video.*');
            cincopa.registerEvent('cp_apiready', 'api.ready');
            cincopa.registerEvent(function(name, data, gallery) {
                gallery.MediaJSON.items[0].timeline = _this.keepOnlyChapter(gallery.MediaJSON.items[0].timeline);
                $(document).unbind("updateChapterEvent");
                $(document).bind("updateChapterEvent", function(e, data){
                    gallery.MediaJSON.items[0].timeline = _this.keepOnlyChapter(data.timeline);
                    gallery.onSkinEvent("chapter.update", {
                        item: gallery.MediaJSON.items[0]
                    });
                    $(".mejs-container").addClass("forceShowChapters");

                    $(".mediaElementVideoContainer").on("mouseleave", function(){
                        $(".mejs-container").removeClass("forceShowChapters");
                    })
                });

            }, "runtime.on-media-json");

            if (typeof item.exif.duration) {
                videoFileDuration = hmsToSecondsOnly(item.exif.duration);
            } else {
                videoFileDuration = 0;
            }

            $('.saveBtn', _this.assetEditor).bind('click', function () {
                if (!$(this).hasClass("saveBtnDisabled")) {
                    if ($(".thumbImage.active").parents(".posterUploadedImages").length) {
                        _this.saveMetaInfo(true);
                    } else {
                        _this.saveMetaInfo();
                    }
                    setTimeout(function () {
                        _this.updateEmailPreviewThumb(item);
                    },1000)
                    $(this).addClass("saveBtnDisabled")
                }
            });
            $(_this.assetEditor).on("click", ".thumbImage", function (e) {
                if (!$(e.target).hasClass("icon-delete")) {
                    if ($(this).hasClass('invalid'))
                        return false;
                    $('.thumbImage.active').removeClass('active');
                    $(this).addClass('active');
                    $('.saveBtn').removeClass("saveBtnDisabled");
                    var playerId = $('.mediaElementVideoContainer .mejs-container').attr('id');
                    cincopa_mejs.players[playerId].setPoster($('.thumbImage.active img').attr('src').replace('?o=2', '?o=1'));
                    if ($(this).parents(".posterUploadedImages").length) {
                        $('[name="thumb_attached_rid"]').val($(this).find(".remove_upload_file").attr('data-id'));
                    } else {
                        $('.asset_block[name=video_thumb_sec]').val($(this).attr('video-sec'));
                        var inputValue = $(this).attr('video-sec') == '-1' ? '' : $(this).attr('video-sec');
                        $('.secondsInput').val(inputValue);
                        item.tmbUrl = $(this).find('img').attr('src');
                    }

                    $('.saveBtn').removeClass("saveBtnAnimation");
                    void $('.saveBtn').get(0).offsetWidth;
                    $('.saveBtn').addClass("saveBtnAnimation");
                }

            });

            var keyupTimer;
            $('.secondsInput', _this.assetEditor).keyup(function () {
                inputHandler(null, this);
            });

            function inputHandler(timeVal, that) {
                clearTimeout(keyupTimer);
                keyupTimer = setTimeout(function () {
                    var previewSrc = $('.thumbImage:first img').attr('src');
                    var whattoReplace = inBetween(previewSrc, '?o=', '&');
                    var ni = new Image();
                    var timerValue;
                    if (timeVal == null) {
                        timerValue = parseInt($(that).val());
                    } else {
                        timerValue = timeVal;
                    }

                    if (!timerValue)
                        return false;
                    $('.thumbImage.preview').removeClass('active').html('Loading...');

                    $('.saveBtn').removeClass("saveBtnAnimation");
                    void $('.saveBtn').get(0).offsetWidth;
                    $('.saveBtn').addClass("saveBtnAnimation");

                    tmbUrl = previewSrc.replace('?o=' + whattoReplace, '?o=' + whattoReplace.charAt(0) + timerValue);
                    ni.src = tmbUrl;
                    ni.onload = function () {
                        $('.thumbImage.preview')
                            .attr('video-sec', timerValue)
                            .removeClass('invalid')
                            .html('<img src="' + tmbUrl + '" />');
                        $('.thumbImage.active').removeClass('active');
                        $('.thumbImage.preview').addClass('active');
                        $('.asset_block[name=video_thumb_sec]').val(timerValue);
                        item.tmbUrl = tmbUrl;
                        $(".saveBtn").removeClass("saveBtnDisabled");
                        var playerId = $('.mediaElementVideoContainer .mejs-container').attr('id');
                        cincopa_mejs.players[playerId].setPoster($('.thumbImage.active img').attr('src').replace('?o=2', '?o=1'));
                    }
                    ni.onerror = function () {
                        $('.thumbImage.preview').addClass('invalid').html('<span class="error">Preview invalid</span>');
                    }
                }, 500);
            }
        } else if (itemType == "music" || itemType == "unknown") {

            cincopa.registerEvent('cp_apiready', 'api.ready');

            $('.saveBtn', _this.assetEditor).bind('click', function () {
                if (!$(this).hasClass("saveBtnDisabled")) {
                    _this.saveMetaInfo(true);
                    $(this).addClass("saveBtnDisabled");
                }
            });
            $(_this.assetEditor).on("click", ".thumbImage", function (e) {
                if (!$(e.target).hasClass("icon-delete")) {
                    if ($(this).hasClass('invalid'))
                        return false;
                    $('.thumbImage.active').removeClass('active');
                    $(this).addClass('active');
                    $('.saveBtn').removeClass("saveBtnDisabled");
                    $('[name="thumb_attached_rid"]').val($(this).find(".remove_upload_file").attr('data-id'));
                }

            });
        }

        $(_this.assetEditor).on("change", "input.email_field", function (e) {
            var rid = $(this).parents(".email").attr("data-rid");
            if ($(this).attr("name") == 'email_thumb_width') {
                var width = parseInt($(this).val());
                var height = Math.round(width / imgRatio);
                $("input[name='email_thumb_height']").val(height);
            } else if ($(this).attr("name") == 'email_thumb_height') {
                var height = parseInt($(this).val());
                var width = Math.round(height * imgRatio);
                $("input[name='email_thumb_width']").val(width);
            }
            var item = _this.mediaItems[rid];
            _this.updateEmailHtmlVal(item);
        });
        $(_this.assetEditor).on("change", "select[name='email_email_provider']", function () {
            var rid = $(this).parents(".email").attr("data-rid");
            if ($(this).val() == "none") {
                $(".emailClient input").val("");
                $(".emailClient").removeClass("cp-hide");
            } else {
                $(".emailClient").addClass("cp-hide");
            }
            var item = _this.mediaItems[rid];
            _this.updateEmailHtmlVal(item);
            $(window).trigger("resize");
        })


        $('input[name="tags"]', _this.assetEditor).tagsInput({
            'height': '40px',
            'width': '300px',
            'interactive': true,
            'defaultText': 'Add a Tag',
            'onChange': function () {
                if ($(this).hasClass('activated')) {
                    var tags = $(this).val();
                    var rid = currentEditingItemID;
                    var cdm = 'updateid';
                    var url = 'rid=' + rid + '&tags=' + escape(tags);
                    _this.invoke(cdm, url, function(res){
                        _this.mediaItems[rid].tags = tags;
                        _this.loadTags();
                        _this.updateItem(res);
                    }, "");
                } else {
                    $(this).addClass('activated');
                }
            },
            'onClick': function () {
            },
            'removeWithBackspace': true,
            'minChars': 0,
            'maxChars': 0, //if not provided there is no limit,
            'placeholderColor': '#666666'

        });
        if ($('input[name="tags"]', _this.assetEditor).val() == '') {
            $('input[name="tags"]', _this.assetEditor).addClass('activated');
        }
        $('.tagsinput input[id$=_tag]', this.assetEditor).hide();
        $(".selectTags", _this.assetEditor).buildTagsList({
            tagsInput: $('input[name="tags"]', _this.assetEditor),
            tagsElement: $('div.tagsinput', _this.assetEditor)
        });
        $('.tabsHead li', this.assetEditor).on('click', function () {
            var selector = $(this).attr('data-tab');
            if ($(this).hasClass('active')) {
                return false;
            } else if (((selector == "timeline" || selector == "annotations" || selector == "callforaction") && __user_feature["assets-timeline"].value == "false") || (selector == "subtitles" && __user_feature["assets-subtitles"].value == "false") || (selector == "versions" && __user_feature["assets-versions"].value == "false")|| (selector == "publish_to_youtube" && __user_feature["integration-youtube-uploader"].value == "false")) {
                var popupText = "";
                if (selector == "timeline") {
                    popupText = __user_feature["assets-timeline"].upgrade_text ;
                } else if (selector == "subtitles") {
                    popupText = __user_feature["assets-subtitles"].upgrade_text ;
                } else if (selector == "versions") {
                    popupText = __user_feature["assets-versions"].upgrade_text;
                }

                openFeaturesModal(popupText);
                return false;
            }

            if(selector == "annotations"){
                $("#add_annotation").val("Click to add annotation").attr("data-action","add annotation").attr("data-type","annotation");

            } else if (selector == "callforaction") {
                $("#add_annotation").val("Click to add call to action").attr("data-action","add call to action").attr("data-type","calltoaction");
            } else if (selector == "timeline"){
                $("#add_annotation").val("Click to add chapter").attr("data-action","add chapter").attr("data-type","chapter");
            }
            if(selector == "annotations"){
                $("#" + new_guid).find(".mejs-controls").addClass("force_visible");
                if(!_videoCurrentTime && _this.player) _this.player.play();
            } else {
                $("#" + new_guid).find(".mejs-controls").removeClass("force_visible");
            }
            if(selector == "callforaction"){
                if(!_videoCurrentTime && _this.player) _this.player.play();
            }

            if(selector == "thumbnail"){
                $("#tab_thumbnail").find('.thumbImage').each(function(){
                    var thumb = new Image();
                    var that =this;
                    var _img =  $(this).find('img').get(0);
                    var src = $(this).attr('data-src')
                    thumb.onload = function() {
                        _img.src = this.src;
                        $(that).removeClass('loaderImageContainer')
                    }
                    thumb.src = src;
                })
            }
            $('.boxMetaEditor .tabsHead li').removeClass('active');
            $(this).addClass('active');
            $('.boxMetaEditor .tabContent').removeClass('active');
            $('.' + selector).addClass('active');
            activeTab = selector;
            _this.copyToInTabs(selector);
            if(selector == "timeline"){
                if(!$('#edit_chapter').length){
                    $('#tab_timeline').find('.add_annotation_btn[data-type="chapter"]').trigger('click');
                }

            }
        });

        if(_this.getUrlVars()['tab']){
            $("li[data-tab='"+_this.getUrlVars()['tab']+"']", this.assetEditor).trigger("click")
        }


        $('.resyncItem', _this.libraryArea).click(function () {
            resyncAsset(currentEditingItemID)
        });

        $('.deleteItem', _this.libraryArea).click(function () {
            _this.itemsToDelete = item.directive_attribues.id;
            _this.drowDeletePopup();
        });

        $('.keyup_input, .keyup_textarea_description, .keyup_textarea_notes').focusout(function () {
            $(this).parent('td').find('div.character_error_box').remove();
        });

        var keyUpTimer;
        $('.boxMeta_form textarea:not(.annotation_description), .boxMeta_form input.keyup_input', _this.assetEditor).keyup(function (e) {
            clearTimeout(keyUpTimer);

            if ($(e.currentTarget).val() != '') {

                $(e.currentTarget).next('.character_error_box').remove();

                txt = $(e.currentTarget).val();

                var error_mess_box = '';
                character_val = 0;
                if ($(e.currentTarget).hasClass('keyup_input_caption') || $(e.currentTarget).hasClass('keyup_input_reference_id')) {
                    character_limit($(e.currentTarget), txt, 250)
                } else if ($(e.currentTarget).hasClass('keyup_textarea_description')) {
                    character_limit(e.currentTarget, txt, 400)
                } else if ($(e.currentTarget).hasClass('keyup_textarea_notes')) {
                    character_limit(e.currentTarget, txt, 5000)
                } else if ($(e.currentTarget).hasClass('keyup_input_related_text') || $(e.currentTarget).hasClass('keyup_input_related_url')) {
                    character_limit(e.currentTarget, txt, 1000)
                }
            }

            keyUpTimer = setTimeout(function () {
                if ($(".thumbImage.active").parents(".posterUploadedImages").length) {
                    _this.saveMetaInfo(true);
                } else {
                    _this.saveMetaInfo();
                }
                ;
            }, 400);
        });
        $('.boxMeta_form input', _this.assetEditor).keypress(function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });

        $('.library-head .back_toassets', _this.libraryArea).off('click');
        $('.library-head .back_toassets', _this.libraryArea).on('click', function () {
            /*if(account_asset != ''){
             var url = location.href.replace("&asset="+account_asset,"");
             location.href = url;
             }*/

            _this.libraryArea.removeClass('activeEditor');
            $(".content-container").removeClass("hideleftbar");
            if (itemType == 'video') {
                try {
                    _this.player.pause();
                } catch (ex) {
                    console.log(ex);
                }
            }
            _this.unloadSkinPreview();

            if (_this.beforeScrollPosition) {
                window.scrollTo(0, _this.beforeScrollPosition);
            }
            disableLoad = true;
            if ($('.library-line', _this.libraryContainer).length <= 1) {
                disableLoad = false;
                _this.showWorking();
            }

//remove events from clipboard.js
            for(var i = 0; i< copyRefs.length; i++){
                if(copyRefs[i])
                    copyRefs[i].destroy()
            }
            annotationTemp = ctaTemp = [];

            checking_hash('details', 0);
        });
        _this.libraryArea.find('.assetTitle').html(item.filename);
        _this.libraryArea.find('.downloadItem').attr('href', item.content.directive_innervalue.replace(/&amp;/g, '&') + "&m=y");



        $(document).off('keyup.closepopup');
        $(document).on('keyup.closepopup', function (e) {
            if (e.which == 27) {
                _this.libraryArea.removeClass('activeEditor');
                $(".content-container").removeClass("hideleftbar");
                if (itemType == 'video') {
                    try {
                        _this.player.pause();
                    } catch (ex) {
                        console.log(ex);
                    }
                }
                _this.unloadSkinPreview();
                if (_this.beforeScrollPosition) {
                    window.scrollTo(0, _this.beforeScrollPosition);
                }
                disableLoad = true;
                if ($('.library-line', _this.libraryContainer).length <= 1) {
                    disableLoad = false;
                    _this.showWorking();
                }
                checking_hash('details', 0);
            }
        });

        /* activate chart */
        var columnDate = [];
        var columnHits = [];
        if (typeof (item.analytics) == 'undefined') {
            console.log('Analytics is not installed');
        } else {
            for (var i = 0; i < item.analytics.days.length; i++) {
                var day = item.analytics.days[i];
                columnDate.push(new Date(day.date));
                columnHits.push(day.hits);
            }

            $(function () {
                $('#chart').highcharts({
                    title: {
                        text: '',
                        x: -20 //center
                    },
                    subtitle: {
                        text: '',
                        x: -20
                    },
                    xAxis: {
                        categories: columnDate,
                        type: 'datetime',
                        labels: {
                            format: '{value:%d/%m}'
                        }
                    },
                    yAxis: {
                        type: 'linear',
                        min: 0,
                        title: {
                            text: ''
                        },
                        plotLines: [{
                            value: 1,
                            width: 1,
                            color: '#e2d8ff'
                        }]
                    },
                    tooltip: {
                        valueSuffix: '',
                        color: '#7d67ae',
                        useHTML: true,
                        formatter: function () {
                            var d = new Date(this.x);
                            var s = '';
                            s += '<b style="color: ' + this.points[0].series.color + ';">' + Highcharts.dateFormat('%A  %e/%m/%Y', this.x) + '</b> ';
                            $.each(this.points, function (i, point) {
                                s += '<b style="color: ' + point.series.color + ';">' + point.series.name + ': ' + point.y + '</b>';
                            });
                            return s;
                        },
                        shared: true
                    },
                    legend: {
                        enabled: false,
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                        name: 'Hits',
                        data: columnHits,
                        color: '#7d67ae',
                        lineWidth: 2,
                        shadow: false,
                        marker: {
                            radius: 1,
                            states: {
                                hover: {
                                    radius: 2
                                }
                            }
                        },
                    }]
                });
            });
        }
        /* end analytics */
        setTimeout(function () {
            $(window).resize();
        }, 500);

        var firstActivationGal = true;
//$('#add_gall_id').ddslick('destroy');

        this.callTemplateDropdown($('#add_gall_id'), item);
        /*
        $('#add_gall_id').ddslick({
            onSelected: function (data) {
                if (!firstActivationGal) {
                    var dataTime = data.selectedData.value;
                    var selector = $('.tabsHead li.embed_info', _this.assetEditor).attr('data-tab');
                    if(dataTime == ""){
                        var url = 'http://help.cincopa.com/hc/en-us/articles/215449578-Getting-Started-Guide';
                        window.open(url, "_blank");
                        return;
                    }

                    embed_id = dataTime;
                    default_id = item.directive_attribues.drid;
                    var seoOnOff = true;
                    if ($(".iframeToggle label.itoggle").hasClass("iToff"))
                        var seoOnOff = false;
                    _this.setEmbedId(embed_id, default_id, seoOnOff);
                    _this.loadSkinPreview(embed_id, default_id, new_guid);

                    _this.copyToInTabs(selector);
                }
            }
        });
        */
        firstActivationGal = false;
        $('input[type="checkbox"].seoonoff').iToggle({
            keepLabel: true,
            onClick: function () {
                $(this).parent().find('input[type="checkbox"]').trigger('change');
            },
            onClickOn: function () {
                if (__user_feature["runtime-seo"].value == "false")
                    return true;
                var default_id = item.directive_attribues.drid;
                var embedCode = _this.getIframeCode(embed_id, default_id);
                appendSeoText("iframe", embedCode)
                var embedCode = _this.getEmbedCode(embed_id, default_id);
                appendSeoText("embed", embedCode)
            },
            onClickOff: function () {
                if (__user_feature["runtime-seo"].value == "false")
                    return true;
                var default_id = item.directive_attribues.drid;
                var embedCode = _this.getIframeCode(embed_id, default_id);
                $("#copy_embed").val(embedCode)
                var embedCode = _this.getEmbedCode(embed_id, default_id);
                $("#reg_html").val(embedCode);
            }
        });
        if (__user_feature["runtime-seo"].value == "false") {
            $(".itoggle").removeClass("iTon").addClass("iToff");
            $(".itoggle").addClass("cp_disabled").off("click").on("click", function () {
                var popupText = '';
                popupText = __user_feature["runtime-seo"].upgrade_text || "This feature is not available to this plan";
                openFeaturesModal(popupText);
            });
        }

    }

    this.bubbleInfo = function () {
        $('.bubbleInfo:not(.activeBubble)').each(function () {
            $(this).addClass("activeBubble");
            var distance = 10, time = 250, hideDelay = 500, hideDelayTimer = null, beingShown = false, shown = false;
            var trigger = $('.trigger', this);
            var popup = $('.popup', this).css('opacity', 0);
            var closePopup = $('.closePopup', this);
            $([trigger.get(0), popup.get(0)]).click(function () {
                if (hideDelayTimer)
                    clearTimeout(hideDelayTimer);
                if (beingShown || shown) {
                    return;
                } else {
                    beingShown = true;
                    popup.css({
                        display: 'block'
                    }).animate({
                        opacity: 1
                    }, time, 'swing', function () {
                        beingShown = false;
                        shown = true;
                    });
                }
            }).mouseout(function () {
                if (hideDelayTimer)
                    clearTimeout(hideDelayTimer);
                hideDelayTimer = setTimeout(function () {
                    hideDelayTimer = null;
                    popup.animate({
                        opacity: 0
                    }, time, 'swing', function () {
                        shown = false;
                        popup.css('display', 'none');
                    });
                }, hideDelay);
            }).mouseover(function () {
                if (hideDelayTimer)
                    clearTimeout(hideDelayTimer);
            });

            closePopup.click(function () {
                hideDelayTimer = null;
                popup.animate({
                    opacity: 0
                }, time, 'swing', function () {
                    shown = false;
                    popup.css('display', 'none');
                });

            });
        });
    }

    this.loadSkinPreview = function (embed_id, default_id, new_guid) {
        embed_fid = embed_id;
        default_fid = default_id;
        $('#' + new_guid).html('Loading');
        cp_load_widget(embed_id + "!" + default_id, new_guid);
    }
    this.unloadSkinPreview = function (new_guid) {
        $('.skinView').empty('');
        _videoCurrentTime = 0;
        if(typeof mejs != "undefined" && typeof cincopa_mejs.players != "undefined")
            for(var pl in cincopa_mejs.players){
                cincopa_mejs.players[pl].remove();
            }
    }

    this.copyToInTabs = function (selector) {
        var successCallback = function(event, msg){
            var trg = $(event.trigger);
            $('.' + selector).find('.copyStatus').remove();
            doneText = '<span class="copyStatus" style="display:none;"> ' + msg +' </span>';
            if(!trg.hasClass("copy_version_url")){
                trg.after(doneText);
                $('.' + selector).find('.copyStatus').fadeIn();
                setTimeout(function () {
                    $('.' + selector).find('.copyStatus').fadeOut(function () {
                        $(this).remove();
                    });
                }, 1000);
            }

        }
        if($('.' + selector + ' .copyBtn:not(.copyActivated)').length){

            copyRefs.push(new Clipboard('.' + selector + ' .copyBtn', {
                text: function(trigger) {
                    var trg = $(trigger);
                    var returnText = '';
                    if (trg.hasClass('copy_embed')) {
                        returnText = trg.parents('.embedTabContent').find('.reg_html.copyValue').val() || trg.parent().find('.copyValue').text();
                    } else if (trg.hasClass('copy_iframe')) {
                        returnText = trg.parents('.embedTabContent').find('.ifrm_html.copyValue').val() || trg.parent().find('.copyValue').text();
                    } else if (trg.hasClass('emailcopyBtn')) {
                        returnText = trg.parents('.email').find('textarea#email_gallerycode').val();
                    } else if (trg.hasClass("copy_version_url")){
                        returnText = trg.closest('.file_line').find('.version_file_url').text();
                    } else {
                        returnText = trg.parents().find('.copyValue').val() || trg.parent().find('.copyValue').text();
                    }
                    return returnText;
                }
            }).on('success', function(event){
                successCallback(event, "Copied to Clipboard")
            }).on('error', function(event){
                successCallback(event, "Your browser doesn't support Clipboard API, in order to copy just press CTRL+C")
            }))

            $('.' + selector + ' .copyBtn').addClass('copyActivated');
        }
        if($('.' + selector + ' .copyBtnHtml:not(.copyActivated)').length){

            copyRefs.push(new Clipboard('.' + selector + ' .copyBtnHtml', {
                target: function(trigger) {
                    var trg = $(trigger);
                    var return_text = '';
                    return_text = trg.parents('.email').find('textarea#email_gallerycode').val();
                    var wrap = $("#embedDivWrapper");
                    wrap.html(return_text);
                    var retTarget = document.getElementById("embedDivWrapper");
                    return retTarget;
                }
            }).on('success', function(event){
                successCallback(event, "Code Copied to Clipboard")
            }).on('error', function(event){
                successCallback(event, "Your browser doesn't support Clipboard API, in order to copy just press CTRL+C")
            }));

            $('.' + selector + ' .copyBtnHtml').addClass('copyActivated');
        }

    }

    this.getEmbedCode = function (embId, defId) {
        var htm = $(".embedHtmlHidden").val();
        var d = new Date().getTime();
        htm = htm.replace(/REPLACE_FID/g, embId + "!" + defId).replace(/RANDOM_NUMBER/g, d);
        return htm;
    }
    /*
    this.getEmbedCode = function (embId, defId) {
        var htm = '<div id="' + new_guid + '">...</div><script type="text/javascript">'
                + 'var cpo = []; cpo["_object"] ="' + new_guid + '"; cpo["_fid"] = "' + embId + "!" + defId + '";'
                + 'var _cpmp = _cpmp || []; _cpmp.push(cpo);'
                + '(function() { var cp = document.createElement("script"); cp.type = "text/javascript";'
                + 'cp.async = true; cp.src = "//www.cincopa.com/media-platform/runtime/libasync.js";'
                + 'var c = document.getElementsByTagName("script")[0];'
                + 'c.parentNode.insertBefore(cp, c); })(); </script><noscript>Powered by Cincopa <a href="//www.cincopa.com/video-hosting">Video Hosting for Business</a> solution.</noscript>';
        return htm;
    }
    */
    this.getIframeCode = function (embId, defId) {
        var htm = '<iframe width="600" height="430" src="//www.cincopa.com/media-platform/iframe.aspx?fid=' + embId + '!' + defId + '" frameborder="0" allowfullscreen scrolling="no"></iframe>';
        return htm;
    }

    this.setEmbedId = function (embId, defId, seo) {
        var htmlEmbed = "", iframeEmbed = "";
        htmlEmbed = _this.getEmbedCode(embId, defId);
        iframeEmbed = _this.getIframeCode(embId, defId);
        if (seo && __user_feature["runtime-seo"].value == "true") {
            appendSeoText("embed", htmlEmbed);
            appendSeoText("iframe", iframeEmbed);
        } else {
            $("#reg_html").val(htmlEmbed);
            $("#copy_embed").val(iframeEmbed)
        }
    }

    this.setEmbedCode = function (embId, defId) {
        var previewHtm = '<div class="embed_code"><div id="' + new_guid + '">...</div>\
                  <script type="text/javascript">\
                  var cpo = []; cpo["_object"] ="' + new_guid + '"; cpo["_fid"] = "' + embId + "!" + defId + '";\
                  var _cpmp = _cpmp || []; _cpmp.push(cpo);\
                  (function() { var cp = document.createElement("script"); cp.type = "text/javascript";\
                  cp.async = true; cp.src = "//www.cincopa.com/media-platform/runtime/libasync.js";\
                  var c = document.getElementsByTagName("script")[0];\
                  c.parentNode.insertBefore(cp, c); })(); </script><noscript>Powered by Cincopa <a href="//www.cincopa.com/video-hosting">Video Hosting for Business</a> solution.</noscript>\
                  </div>';
        $('.boxPreview .embed_code').replaceWith(previewHtm);
        return previewHtm;
    }

    this.createTagsCloud = function (data) {
        var isExtended = $(".hiddenTags").is(":visible");
        this.tagsCloud.empty().html("<ul style='display: inline-block'></ul>");
        var counter = 0;
        for (i in  data) {
            if (counter++ == 8)
                break;
            if (data[i] < 8) {
                fontsize = data[i] + 8;
            } else if (data[i] > 8 && data[i] < 20) {
                fontsize = data[i] + 20;
            } else {
                fontsize = 40;
            }

            $("ul", this.tagsCloud).append("<li data-val='" + i + "' style='font-size:" + fontsize + "px;line-height:" + fontsize + "px;'>" + i + "(" + data[i] + ")" + "</li>");
        }

        tagsLength = Object.size(data);
        if (counter < tagsLength) {
            counter = 0;
            this.tagsCloud.append("<a href='javascript:void(0)'  class='show_all' style='display:" + (isExtended ? "none" : "block") + "'>Show All</a>");
            this.tagsCloud.append('<ul class="hiddenTags" style="display:' + (isExtended ? "block" : "none") + '"></ul>');
            for (i in  data) {
                counter++;
                if (counter <= 8)
                    continue;
                if (data[i] < 8) {
                    fontsize = data[i] + 8;
                } else if (data[i] > 8 && data[i] < 20) {
                    fontsize = data[i] + 20;
                } else {
                    fontsize = 40;
                }
                $("ul.hiddenTags", this.tagsCloud).append("<li data-val='" + i + "' style='font-size:" + fontsize + "px;line-height:" + fontsize + "px;'>" + i + "(" + data[i] + ")" + "</li>");
            }
            this.tagsCloud.append("<a href='javascript:void(0)' class='show_less' style='display:" + (isExtended ? "block" : "none") + "'>Show Less</a>");
        }

        $('.selectedFromHash .removeTag').on('click.removeTag', function () {
            var removedTagValue = $(this).parent().attr('data-value');
            var index = $.inArray(removedTagValue, _this.tagSearchCtl);
            if (index >= 0)
                _this.tagSearchCtl.splice(index, 1);
            $(this).parent().remove();

            tags_query = '';
            if (_this.tagSearchCtl.length > 0) {
                for (var tagsIndex = 0; tagsIndex < _this.tagSearchCtl.length; tagsIndex++) {
                    if (tagsIndex == 0)
                        tags_query += _this.tagSearchCtl[tagsIndex];
                    else
                        tags_query += ',' + _this.tagSearchCtl[tagsIndex];
                }
            }
            if (tags_query == '') {
                tags_query = 0;
            }

//_this.disableLoad = false;
            disableLoad = false;
            checking_hash('tags', tags_query);

//_this.loadData(getLibraryCommand); //will be called when hash will be changed
        });

        $('li', this.tagsCloud).click(function () {
            if (_this.libraryArea.hasClass('activeEditor')) {
                _this.libraryArea.removeClass('activeEditor');
                $(".content-container").removeClass("hideleftbar");
            }
            if ($('.selected  .input_class_checkbox').is(':checked')) {
                $('.selected  .input_class_checkbox').prop("checked", false);
                _this.copyDeleteBlock.hide();
                _this.searchBlock.show();
            }
            var tagValue = $(this).attr('data-val');
            var selectedTag = $('<div class="selectedTag" data-value="' + tagValue + '"/>');
            var selectedTagInner = $('<span/>').html(tagValue);
            selectedTagInner.appendTo(selectedTag);
            var deletedFromTagFilter = $('<a class="removeTag" />');
            deletedFromTagFilter.html('X');

            if ($('.headCenter .tagsFilterBlock .selectedTag[data-value="' + tagValue + '"]').hasClass('added'))
                return false;
            else
                deletedFromTagFilter.appendTo(selectedTag);

            selectedTag.appendTo(_this.tagsFilterBlock);
            $('.headCenter .tagsFilterBlock .selectedTag').addClass('added');

            $('.removeTag').off('click.removeTag'); /* strange issue with attaching event */
            $('.removeTag').on('click.removeTag', function () {
                var removedTagValue = $(this).parent().attr('data-value');
                var index = $.inArray(removedTagValue, _this.tagSearchCtl);
                if (index >= 0)
                    _this.tagSearchCtl.splice(index, 1);
                $(this).parent().remove();
//_this.loadData(getLibraryCommand);

//added tags string to url by denis
                tags_query = '';
                if (_this.tagSearchCtl.length > 0) {
                    for (var tagsIndex = 0; tagsIndex < _this.tagSearchCtl.length; tagsIndex++) {
                        if (tagsIndex == 0)
                            tags_query += _this.tagSearchCtl[tagsIndex];
                        else
                            tags_query += ',' + _this.tagSearchCtl[tagsIndex];
                    }
                }
                if (tags_query == '') {
                    tags_query = 0;
                }
//_this.disableLoad = false;
                disableLoad = false;
                checking_hash('tags', tags_query);
//end tags string

                _this.showWorking();
            })
            _this.tagSearchCtl.push(tagValue);
//_this.loadData(getLibraryCommand); //will be called when hash will be changed

//added tags string to url by denis
            tags_query = '';
            if (_this.tagSearchCtl.length > 0) {
                for (var tagsIndex = 0; tagsIndex < _this.tagSearchCtl.length; tagsIndex++) {
                    tagSearch = escape(unescape(_this.tagSearchCtl[tagsIndex]));
                    if (tagsIndex == 0) {
//tags_query += _this.tagSearchCtl[tagsIndex];
                        tags_query += tagSearch;
                    } else {
                        //tags_query += ',' + _this.tagSearchCtl[tagsIndex];
                        tags_query += ',' + tagSearch;
                    }
                }
            }
            if (tags_query == '') {
                tags_query = 0;
            }

            checking_hash('tags', tags_query);
//end tags string
//_this.disableLoad = false;
            disableLoad = false;

            _this.showWorking();
        });

        $('.show_all', this.tagsCloud).on('click', function () {
            $("ul.hiddenTags", this.tagsCloud).show();
            $(this).hide();
            $('.show_less', _this.tagsCloud).show();
        });
        $('.show_less', this.tagsCloud).on('click', function () {
            $("ul.hiddenTags", this.tagsCloud).hide();
            $(this).hide();
            $('.show_all', _this.tagsCloud).show();
        });
    }

    this.buildVersionsHtm = function(item){
        var htm = "";
        if (item.versions && __user_feature['assets-versions'].value == "true") {

            htm += '<div class="file_line version_file_line" style="font-weight:bold">';
            htm += '<div class="version_file_name">Name</div>';
            htm += '<div class="version_file_mime">Mime</div>';
            htm += '<div class="version_file_size">Size</div>';
            htm += '<div class="version_file_url">Url</div>';
            htm += '<div>Actions</div>';
            htm += '</div>';
            var versions_thm_firstLine = "", versions_thm_nextLines = "";
            $.each(item.versions, function (i, v) {
                var versions_thm_temp = "";
                versions_thm_temp += '<div class="file_line version_file_line">';
                versions_thm_temp += '<div class="version_file_name">';
                versions_thm_temp += '<a target="_blank" href="' + v.url + '" title="'+i+'">' + i + '</a>';
                versions_thm_temp += '</div>';
                versions_thm_temp += '<div class="version_file_mime">' + v.mime + '</div>';
                versions_thm_temp += '<div class="version_file_size">' + readablizeBytes(v.filesize) + '</div>';
                versions_thm_temp += '<div class="version_file_url">' + v.url + '</div>';
                versions_thm_temp += '<div class="version_file_url_copy"><a class="copy_version_url btn secondary small2 copyBtn" href="javascript:;"><i>Copy</i></a></div>';
                versions_thm_temp += '</div>';
                if(i == "original"){
                    versions_thm_firstLine += versions_thm_temp;
                } else {
                    versions_thm_nextLines += versions_thm_temp;
                }
            });
            htm += versions_thm_firstLine;
            htm += versions_thm_nextLines;
        }
        return htm;
    }

// CC & AUTOMATED SUBTITLES
    var subtitlesAppInit = false;
    this.checkSubtitles = function(item) {

        console.log("dadawdadwdwadwd");

        (function (uid, item) {
            var App = {
                init: function() {
                    App.$el = $('#auto-caption');
                    App.status = null;

                    if(!subtitlesAppInit) {
                        App.$el.on('click', '#btn-see-an-explainer', App.clickBtnSeeAnExplainer);
                        App.$el.on('click', '#btn-see-an-explainer-for-thumbnail', function () {
                            console.log('111111111111111111');
                        });
                        App.$el.on('click', '#btn-submit-to-transcribe', App.clickBtnSubmitToTranscribe);
                        $('body').on('click', '.remove_subtitle', App.clickBtnRemoveSubtitle);
                        subtitlesAppInit = true;
                    }

                    App.render();

                    if(!App.status) {
                        App.getStatus();
                    }
                },
                render: function() {
                    var data = {
                        status: App.status,
                        errorMessage: App.errorMessage,
                        item: item
                    };
                    this.$el.html( tmpl("tmpl-auto-caption", data) );
                },
                clickBtnRemoveSubtitle: function() {
                    var $this = $(this);
                    if($(this).closest('.subtitle_file_line').find('.file_name').text().indexOf('-autoCC') !== false) {
                        $.ajax({
                            url: 'https://vrakzbiqi9.execute-api.us-east-1.amazonaws.com/prod/jobs/' + item.directive_attribues.drid,
                            type: 'put',
                            data: JSON.stringify({"publishStatus": 'UNPUBLISHED'}),
                            dataType: 'json',
                            success: function() {
                                App.status = 'UNPUBLISHED';
                                App.render();
                            }
                        });
                    }
                },
                clickBtnSubmitToTranscribe: function(e) {
                    e.preventDefault();

                    $this = $(this);
                    $this.prop('disabled', true).addClass('disabled');
                    $this.text('Sending');
                    App.errorMessage = '';

                    var data = {
                        uid: _uid,
                        mediaId:  item.directive_attribues.drid,
                        mediaTitle: item.caption ? item.caption : item.filename
                    };
                    $.ajax({
                        url: 'https://vrakzbiqi9.execute-api.us-east-1.amazonaws.com/prod/jobs',
                        type: 'post',
                        data: JSON.stringify(data),
                        contentType: "application/json",
                        success: function(response) {
                            if(response.error) {
                                App.status = 'Error';
                                App.errorMessage = response.message;
                                App.render();

                                $this.text('Error! ' + response.message).hide();
                                return;
                            }

                            App.status = 'InProgress';
                            App.render();

                            setTimeout(App.getStatus, 10 * 1000);
                        }
                    });
                },

                clickBtnSeeAnExplainer: function() {

                    console.log("Хлебное место");

                    var data = {};
                    var html =  tmpl("tmpl-autotranscribe-explainer", data);

                    openModal(html, 500, 300);
                },

                clickBtnSeeAnExplainerVideo: function() {
                    console.log("qwerty");
                    var data = {};
                    var html = tmpl("tmpl-thumbnail-explainer", data);

                    openModal(html, 500, 300);
                },

                getStatus: function() {
                    $.ajax({
                        url: 'https://vrakzbiqi9.execute-api.us-east-1.amazonaws.com/prod/jobs/' + item.directive_attribues.drid,
                        success: function(response) {
//console.log('success response:', response);

                            if('NotFound' === response.error) {
                                App.status = 'NotFound';
                                App.render();
                            }
                            else if('InProgress' === response.status) {
                                App.status = 'InProgress';
                                App.render();

                                setTimeout(App.getStatus, 10 * 1000);
                            }
                            else {
                                App.status = response.status;
                                App.render();
                            }
                        },
                        error: function(response) {
                            console.log('error response:', response);
                            App.status = 'Error';
                            clearInterval(App.timerCheckSubtitles);
                        }
                    });
                }
            };

            return App.init();
        })(_uid, item);
    }

// #publishtosocial
    this.buildPublishToSocialHtm = function($el, item) {
// 0. check if functional avallable for user
//if ( !__user_feature['integration-social-uploader'].value === "true") {
//    return;
//}

        (function (uid, item) {
            var App = {
                init: function () {
                    this.$publish_to_social = $('#publish_to_social');
                    this.accounts = {
                        facebook: [],
                        youtube: [],
                    };
                    this.publishLogs = {
                        facebook: [],
                        youtube: [],
                    };
                    this.currentTab = 'facebook';

                    this.bindEvents();

                    this.getIntegrations();
                    this.getFacebookPublishLogs();
                    this.getYoutubePublishLogs();
                },
                bindEvents: function() {
                    App.$publish_to_social.on('click', '.btn-switch-social-integrations', App.clickBtnSwitchSocialIntegration);

                    App.$publish_to_social.on('click', '.btn-prepare-to-facebook', App.clickBtnPrepareToFacebook);
                    App.$publish_to_social.on('click', '.btn-prepare-to-youtube', App.clickBtnPrepareToYoutube);

                    $('body').on('click', '.modalContainer-publishToYoutube .cancelAction', App.clickYoutubeModalCancelAction);
                    $('body').on('click', '.modalContainer-publishToYoutube .publishAction', App.clickYoutubeModalPublishAction);

                    $('body').on('click', '.modalContainer-publishToFacebook .cancelAction', App.clickFacebookModalCancelAction);
                    $('body').on('click', '.modalContainer-publishToFacebook .publishAction', App.clickFacebookModalPublishAction);
                },
                clickBtnSwitchSocialIntegration: function() {
                    var type = $(this).data('type');
                    App.switchSocialIntegrations(type);
                },
                switchSocialIntegrations: function(type) {
                    App.currentTab = type;
                    App.isHideAccounts = true;
                    App.render();
                },
                clickBtnPrepareToFacebook: function(e) {
                    var data = {
                        item: item,
                        account: $(this).data('account'),
                    };
                    var htmlModal = tmpl("tmpl-publish_to_facebook_modal", data);
                    openModal(htmlModal, 700, 400);
                },
                clickBtnPrepareToYoutube: function() {
                    var data = {
                        item: item,
                        account: $(this).data('account'),
                    };
                    var htmlModal = tmpl("tmpl-publish_to_youtube_modal", data);
                    openModal(htmlModal, 700, 400);
                },
                clickYoutubeModalCancelAction: function() {
                    $.modal.close();
                },
                clickFacebookModalCancelAction: function() {
                    $.modal.close();
                },
                clickYoutubeModalPublishAction: function() {
                    var $this = $(this);

                    $this.text('Working on it. Please wait...');
                    $this.prop('disabled', true).attr('disabled', true).addClass('disabled');

                    $.ajax({
                        url: 'https://yqhrw2xrgb.execute-api.us-east-1.amazonaws.com/prod/upload',
                        type: 'post',
                        data: JSON.stringify({
                            email: $this.data('account'),
                            uid: uid,
                            drid: item.directive_attribues.drid,
                            videoUrl: item.versions.original.url,
                            title: $('#youtube-video-title').val(),
                            description: $('#youtube-video-description').val(),
                            tags: $('#youtube-video-tags').val(),
                            privacy: $('#youtube-video-privacy').val(),
                        }),
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        success: function(response) {
                            if('OK' !== response.status) {
                                alert('Error ' + response.message);
                            }

                            if(thumbLoaderUrl && $('.loading-publish-logs').length === 0) {
                                $('.social-publishing-history-content').append($('<img/>', {src: thumbLoaderUrl, alt: 'loading...', 'class': 'loading-publish-logs'}));
                            }

                            setTimeout(App.getYoutubePublishLogs, 5000);

                            $.modal.close();
                        },
                        error: function() {
                            $.modal.close();
                        }
                    });
                },
                clickFacebookModalPublishAction: function() {
                    $(this).text('Working on it. Please wait...');
                    $(this).prop('disabled', true).attr('disabled', true).addClass('disabled');

                    $.ajax({
                        url: 'https://1qxlag4ljc.execute-api.us-east-1.amazonaws.com/prod/upload',
                        type: 'post',
                        data: JSON.stringify({
                            email: $(this).data('account'),
                            uid: uid,
                            drid: item.directive_attribues.drid,
                            videoUrl: item.versions.original.url,
                            title: $('#facebook-video-title').val(),
                            description: $('#facebook-video-description').val(),
                            privacy: $('#facebook-video-privacy').val(),
                        }),
                        contentType: 'application/json; charset=utf-8',
                        dataType: 'json',
                        success: function(response) {
                            if('OK' !== response.status) {
                                alert('Error');
                            }

                            App.getFacebookPublishLogs();

                            $.modal.close();
                        },
                        error: function() {
                            $.modal.close();
                        }
                    });
                },

                getIntegrations: function() {
// 1. get integrations
                    var that = this;

                    $.ajax({
                        url: '/media-platform/email_integration_ajax.aspx',
                        data: {
                            cmd: 'get-integrations'
                        },
                        dataType: "json",
                        success: function(response) {
// get youtube accounts:
                            var accounts = {
                                facebook: [],
                                youtube: []
                            };
                            for (var key in response) {
                                if (!response.hasOwnProperty(key)) {
                                    continue;
                                }
                                if ('facebook' === response[key].type) {
                                    var arr = key.split('@');
                                    if (arr.length !== 3) {
                                        continue;
                                    }
                                    accounts.facebook.push(arr[1] + '@' + arr[2]);
                                }
                                else if('youtube' === response[key].type) {
                                    var arr = key.split('@');
                                    if(arr.length !== 3) {
                                        continue;
                                    }
                                    accounts.youtube.push(arr[1] + '@' + arr[2]);
                                }
                            }
                            that.accounts = accounts;
                            that.render();
                        }
                    })
                },
                getFacebookPublishLogs: function() {
                    if(thumbLoaderUrl && $('.loading-publish-logs').length === 0) {
                        $('.social-publishing-history-content').append($('<img/>', {src: thumbLoaderUrl, alt: 'loading...', 'class': 'loading-publish-logs'}));
                    }

// 2. get Facebook logs
                    $.ajax({
                        url: 'https://1qxlag4ljc.execute-api.us-east-1.amazonaws.com/prod/publish-logs?uid=' + uid + '&drid=' + item.directive_attribues.drid,
                        success: function(response) {
                            if(response.error) {
                                console.log(error);
                                return;
                            }

                            App.publishLogs.facebook = response;

                            App.render();
                        }
                    });
                },
                getYoutubePublishLogs: function() {
                    if(thumbLoaderUrl && $('.loading-publish-logs').length === 0) {
                        $('.social-publishing-history-content').append($('<img/>', {src: thumbLoaderUrl, alt: 'loading...', 'class': 'loading-publish-logs'}));
                    }

// 3. get Youtube logs
                    $.ajax({
                        url: 'https://yqhrw2xrgb.execute-api.us-east-1.amazonaws.com/prod/publish-logs?uid=' + _uid + '&drid=' + item.directive_attribues.drid,
                        success: function(response) {
                            if(response.error) {
                                console.log(error);
                                return;
                            }

                            App.publishLogs.youtube = response;

                            App.render();
                        }
                    });
                },
                render: function() {
                    var data = {
                        accounts: App.accounts,
                        publishLogs: App.publishLogs,
                        currentTab: App.currentTab,
                        isHideAccounts: App.isHideAccounts,
                    };
                    this.$publish_to_social.html( tmpl("tmpl-publish_to_social", data) );

                    if(App.isHideAccounts) {
                        $('#social-accounts').show('fast');
                        App.isHideAccounts = false;
                    }
                }
            }

            return App.init();
        })(_uid, item);
    }; // end buildPublishToSocialHtm

    this.saveMetaInfo = function (upload) {
        if (upload) {
            if ($('input[name="thumb_attached_rid"]').val() != "")
                var data = $('.boxMeta_form input, .boxMeta_form textarea, #upload_thumb_files input[name="thumb_attached_rid"]').serialize();
            else
                var data = $('.boxMeta_form input, .boxMeta_form textarea').serialize();
        } else {
            if ($("input.asset_block").val() == "")
                var data = $('.boxMeta_form input, .boxMeta_form textarea').serialize();
            else
                var data = $('.boxMeta_form input, .boxMeta_form textarea, .previewVideoPoster input.asset_block').serialize();
        }
        var cdm = 'updateid';
        var url = 'rid=' + currentEditingItemID + '&' + data;
        _this.libraryArea.find('.headRight .saving').removeClass('success error').text('');
        _this.libraryArea.find('.headRight .saving').addClass('processing').show().text('Saving...');

        var errorMessage = 'Unknown error while saving media library. Please reload page and try again.';
        this.invoke(cdm, url, _this.updateItem, errorMessage);
    };

    this.DrawThumbs = function () {
        var cdm = 'updateid';
        var url = 'rid=' + currentEditingItemID;
        var errorMessage = 'Unknown error while saving media library. Please reload page and try again.';
        this.invoke(cdm, url, _this.uploadnewThumb, errorMessage);
    };

    this.uploadnewThumb = function (res) {
        var attached_files = res.d.response.items[0].attached;
        $('.posterUploadedImages .postersContainer').empty();
        $('#extra_files .extra_file_box').empty();
        var thumb_thm = "";
        var extra_thm = "";
        $.each(attached_files, function (i, v) {
            var fileType = v.directive_attribues.type;
            var filename = v.directive_attribues.filename;
            var file_id = v.directive_attribues.id;
            var url = v.url.directive_innervalue;
            url = url.replace("o=1", "o=2");
            if (fileType == "thumb") {
                thumb_thm += '<div class="thumbImage" style="position:relative">';
                thumb_thm += '<div class="file_img">';
                thumb_thm += '<img src="' + url + '">';
                thumb_thm += '</div>';
                thumb_thm += '<a class="remove_upload_file" data-id="' + file_id + '" style="position:absolute; right:0; top:0; z-index:1000; line-height:1; display:none" href="javascript:;"><i class="icon-delete"></i></a>';
                thumb_thm += '</div>'
            }
            extra_thm += '<div class="extra_file_line file_line">';
            extra_thm += '<div class="file_name">';
            extra_thm += '<a target="_blank" href="' + url + '" title="'+filename+'">' + filename + '</a>';
            extra_thm += '</div>';
            extra_thm += '<div class="file_name">' + fileType + '</div>';
            extra_thm += '<div class="file_remove">';
            extra_thm += '<a class="remove_extra_file" data-id="' + file_id + '" href="javascript:;"><i class="icon-delete"></i></a>';
            extra_thm += '</div>'
            extra_thm += '</div>'
            url = '';
        });
        $('.posterUploadedImages .postersContainer').append(thumb_thm);
        $('#extra_files .extra_file_box').append(extra_thm);
        $('.thumbImage.active').removeClass('active');
        $('.posterUploadedImages .postersContainer .thumbImage:last-child').addClass("active");
        $('.saveBtn').removeClass("saveBtnDisabled");

        $('.saveBtn').removeClass("saveBtnAnimation");
        void $('.saveBtn').get(0).offsetWidth;
        $('.saveBtn').addClass("saveBtnAnimation");

        var playerId = $('.mediaElementVideoContainer .mejs-container').attr('id');
        if (playerId != undefined)
            cincopa_mejs.players[playerId].setPoster($('.thumbImage.active img').attr('src').replace('?o=2', '?o=1'));
        $('[name="thumb_attached_rid"]').val($('.thumbImage.active').find(".remove_upload_file").attr('data-id'));

    }

    this.updateItem = function (res) {
        _this.mediaItems[ currentEditingItemID ] = res.d.response.items[0];
        var new_item = _this.drawItem(_this.mediaItems[currentEditingItemID]);
        $('.library-line[data-rid="' + currentEditingItemID + '"]').replaceWith(new_item);
        _this.attachLineEvents(currentEditingItemID);

//var new_thumb_url = _this.mediaItems[ currentEditingItemID ].thumbnail.directive_innervalue;
//$('#' + new_guid + ' video').attr('src', new_thumb_url);

        _this.libraryArea.find('.headRight .saving').removeClass('processing').text('');
        _this.libraryArea.find('.headRight .saving').addClass('success').text('All changes saved.');
        clearTimeout(_this.showMessageTimer);
        _this.showMessageTimer = setTimeout(function () {
            _this.libraryArea.find('.headRight .saving.success').hide();
        }, 5000);
    }
    this.getAnalytics = function (rid, drid, options) {
        var sendData = new Object();
        var type = options['type']
        sendData.m = options['m'];
        sendData.p = options['p'];
        sendData.fid = 'ohit' + drid;
        $.ajax({
            url: analyticsUrl,
            method: "POST",
            contentType: 'application/json',
            cache: false,
            dataType: 'jsonp',
            data: sendData,
            success: function (data) {
                if(data.error){
                    if(data.error == "maintenance"){
                        _this.showMaintenanceError(drid)
                    }
                    return;
                }
                $('.library-line[data-rid="' + rid + '"] .weekly_views:not(.domain_views) b').html(nFormatter(data.hits));
                if (typeof _this.mediaItems[rid] != "undefined")
                    _this.mediaItems[rid]['analytics'] = data;
                var embedStatus = false;
                var totalDomains = 0;
                var domainCounter = 0;
                var daysStat = data.days;
                var statsArray = new Object();
                domsOrUrls = 'urls';
                domOrUrl = 'url';
                for (day in daysStat) {
                    if (typeof daysStat[day][domsOrUrls] != 'undefined' && daysStat[day][domsOrUrls].length > 0) {
                        for (var i in daysStat[day][domsOrUrls]) {

                            var domainName = simple_domain(daysStat[day][domsOrUrls][i][domOrUrl]);
                            if (domainName.indexOf('unknown') == -1) {
                                embedStatus = true;
                            }
                            if (typeof statsArray[domainName] == 'undefined') {
                                statsArray[domainName] = new Object();
                                statsArray[domainName]['hits'] = daysStat[day][domsOrUrls][i].hits;
                                statsArray[domainName]['urlList'] = {};
                                statsArray[domainName]['urlList'][daysStat[day][domsOrUrls][i][domOrUrl]] = {
                                    url: daysStat[day][domsOrUrls][i][domOrUrl],
                                    hits: daysStat[day][domsOrUrls][i].hits
                                };
                            } else {
                                if (typeof statsArray[domainName]['urlList'][daysStat[day][domsOrUrls][i][domOrUrl]] == 'undefined') {
                                    statsArray[domainName]['urlList'][daysStat[day][domsOrUrls][i][domOrUrl]] = {
                                        url: daysStat[day][domsOrUrls][i][domOrUrl],
                                        hits: daysStat[day][domsOrUrls][i].hits
                                    };
                                } else {
                                    statsArray[domainName]['urlList'][daysStat[day][domsOrUrls][i][domOrUrl]].hits += daysStat[day][domsOrUrls][i].hits;
                                }

                                statsArray[domainName]['hits'] += daysStat[day][domsOrUrls][i].hits;
                            }
                        }
                    }

                }
                totalDomains = objectSize(statsArray, 'cincopa.com');
                $('.library-line[data-rid="' + rid + '"] .analytics_domain_div .weekly_views b').html(nFormatter(totalDomains));
                if (typeof _this.mediaItems[rid] != "undefined") {
                    _this.mediaItems[rid]['domains'] = statsArray;
                    _this.mediaItems[rid]['totaldomains'] = totalDomains;
                }
                drawDomainsList(rid, statsArray);

            },
            error: function (err) {
                console.log(err);
                if(err.responseJSON.error){
                    if(err.responseJSON.error == "maintenance"){
                        _this.showMaintenanceError(drid);
                    }
                }
            }
        });
    }

    this.showMaintenanceError = function(drid){
        var row = $('#libraryContainer .library-line[data-drid="'+drid+'"]');
        row.find(".analytics_view_div").addClass("disabled");
    }

    this.getGalleries = function (drid, that) {
        $.ajax({
            method: "POST",
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: {
                cmd: 'get_item',
                rid: drid
            },
            dataType: "json",
            success: function (data) {
                var galleryList = data.d.response.items[0].in_folders_list;
                _this.mediaItems[drid]['galleriesList'] = galleryList;
                drawGalleriesList(galleryList, drid);
                var galleriesList = that.find('.itemsDropdown.galleriesList');
                showHidePopups(that, galleriesList);
            },
            error: function (re) {

            }
        })
    }

    this.createEmbedEmailHtml = function (rid, drid, embed_id, type) {
        var htm = "";
        htm += '<div class="email embedCode" data-rid="' + rid + '">\
			<div class="email_preview"></div>\
			<div class="embedActionsRight right">\
				<a href="javascript:void(0);" class="emailcopyBtn copyBtn" style="margin-left:16px">COPY AS TEXT</a><button type="button" class="btn primary emailcopyBtn copyBtnHtml">COPY AS HTML<br/><span style="font-size:10px;font-weight:normal;">(to embed in your email)</span></button></div>\
			<div class="emailtextareaWrap"><textarea id="email_gallerycode" onclick="this.select();" class="codeField" readonly></textarea>\
        			</div>\
        			<div class="setEmailProvider setEmailOptionsBox">\
        				<h4>Email Provider </h4>\
        				<div class="email_thumb_size">\
        					<select name="email_email_provider" id="email_email_provider">\
        						<option value="none">Gmail and other clients</option>\
        						<option value="active_campaign">ActiveCampaign</option>\
        						<option value="a_weber">AWeber</option>\
        						<option value="blue_hornet">Blue Hornet</option>\
        						<option value="campaign_monitor">Campaign Monitor</option>\
        						<option value="constant_contact">Constant Contact</option>\
        						<option value="dotmailer">Dotmailer</option>\
        						<option value="emma">Emma</option>\
        						<option value="get_response">GetResponse</option>\
        						<option value="hub_spot">HubSpot</option>\
        						<option value="i_contact">iContact</option>\
        						<option value="intercom">Intercom</option>\
        						<option value="mad_mimi">Mad Mimi</option>\
        						<option value="mail_chimp" selected>MailChimp</option>\
        						<option value="marketo">Marketo</option>\
        						<option value="ontraport">Ontraport</option>\
        						<option value="pardot">Pardot</option>\
        						<option value="sendible">Sendible</option>\
        						<option value="smart_focus">SmartFocus</option>\
        						<option value="vertical_response">Vertical Response</option>\
        					</select>\
        				</div>\
        				<div class="emailClient">\
        					<h4>Track user:</h4>\
        					<div>\
        						<input class="email_field" type="text" name="email_client_name" placeholder="name" />\
        						<input class="email_field" type="text" name="email_client_email" placeholder="email"/>\
        					</div>\
        				</div>\
        			</div>\
        			<div class="setEmailOptionsBox">\
        				<h4>Thumbnail Size </h4>\
        				<div class="email_thumb_size">\
        					<input type="text" class="email_field" name="email_thumb_width" value="450" /><span style="display: inline-block; margin: 0 10px;">X</span><input type="text" class="email_field" name="email_thumb_height" value="" />\
        				</div>\
        			</div>\
        			<div class="setEmailOptionsBox">\
        				<h4>Links to </h4>\
        				<div class="email_linksto email_thumb_size">\
        					<input type="text" class="email_field" name="email_link" value="https://cincopa.com/~' + embed_id + '!' + drid + '" />\
        				</div>\
        			</div>\
        			<div class="setEmailOptionsBox">\
        				<h4>Add title and description</h4>\
        				<div class="email_addTitle email_thumb_size">\
        					<input class="email_field" type="checkbox" name="emailTitle"  />\
        				</div>\
        			</div>';
        if(type == 'video'){
            htm += '<div class="setEmailOptionsBox">\
                            <h4>Auto start video</h4>\
                            <div class="email_addAutostart email_thumb_size">\
                                <input class="email_field" type="checkbox" name="emailAutostart"  />\
                            </div>\
                        </div>';

        }
        htm += '</div>'

        return htm;

    }

    this.updateEmbedEmailHtml = function (item) {
        var drid = item.directive_attribues.drid;
        var newImage = new Image();
        var newImageSrc = "https://www.cincopa.com/media-platform/api/thumb.aspx?size=large&rid=" + drid + "&trs=play" + "&fake=" + Math.random();
        var imgWidth = 300;
        imgRatio = 1;
        newImage.onload = function () {
            var ratio = this.width / this.height;
            imgRatio = ratio;
            var height = Math.round(imgWidth / ratio);
            $('input[name="email_thumb_width"]').val(imgWidth);
            $('input[name="email_thumb_height"]').val(height);
            _this.updateEmailHtmlVal(item);
        }
        newImage.src = newImageSrc;
    }

    this.updateEmailPreviewThumb = function (item) {
        this.updateEmbedEmailHtml(item)
    }

    var providerMergeTags = {
        "none": "",
        "active_campaign": "#cpudemail=%EMAIL%&cpudname=%FULLNAME%",
        "a_weber": "#cpudemail={!email}&cpudname={!name}",
        "blue_hornet": "#cpudemail=[%%to_email%%]&cpudname=[%%name%%]",
        "campaign_monitor": "#cpudemail=[email]&cpudname=[fullname]",
        "constant_contact": "#cpudemail=$SUBSCRIBER.EMAIL&cpudname=$SUBSCRIBER.FIRSTNAME $SUBSCRIBER.LASTNAME",
        "dotmailer": "#cpudemail=@email@&cpudname=@fullname@",
        "emma": "#cpudemail=[%member:email%]&cpudname=[%member:name_first%] [%member:name_last%]",
        "get_response": "#cpudemail=[[email]]&cpudname=[[name]]",
        "hub_spot": "#cpudemail={{contact.email}}&cpudname={{contact.firstname}} {{contact.lastname}}",
        "i_contact": "#cpudemail=[email]&cpudname=[fname] [lname]",
        "intercom": "#cpudemail={{email | fallback:'unknown_email'}}&cpudname={{ first_name | fallback: '' }} {{ last_name | fallback: '' }}",
        "mad_mimi": "#cpudemail=(email)&cpudname=(firstname) (lastname)",
        "mail_chimp": "#cpudemail=*|EMAIL|*&cpudname=*|FNAME|* *|LNAME|*",
        "marketo": "#cpudemail={{Lead.Email Address}}&cpudname={{Lead.Full Name}}",
        "ontraport": "#cpudemail=[Email]&cpudname=[First Name] [Last Name]",
        "pardot": "#cpudemail=%%email%%&cpudname=%%first_name%% %%last_name%%",
        "sendible": "#cpudemail=$email&cpudname=$first_name $last_name",
        "smart_focus": "",
        "vertical_response": "#cpudemail={EMAIL_ADDRESS}&cpudname={FIRST_NAME} {LAST_NAME}"
    }

    this.updateEmailHtmlVal = function (item) {
        if (__user_feature["embed-email"].value == "false")
            return;
        var drid = item.directive_attribues.drid, title = item.caption, desc = item.description;
        if ($("input[name = 'email_client_name']").val() != "" || $("input[name = 'email_client_email']").val() != "") {
            providerMergeTags["none"] = "#";
            if ($("input[name = 'email_client_email']").val() != "") {
                providerMergeTags["none"] += "cpudemail=" + $("input[name = 'email_client_email']").val();
            }
            if ($("input[name = 'email_client_name']").val() != "") {
                if ($("input[name = 'email_client_email']").val() != "")
                    providerMergeTags["none"] += "&";
                providerMergeTags["none"] += "cpudname=" + $("input[name = 'email_client_name']").val();
            }
        } else {
            providerMergeTags["none"] = "";
        }
        var width = $("input[name = 'email_thumb_width']").val();
        var height = $("input[name = 'email_thumb_height']").val();
        var provider = $("select[name = 'email_email_provider']").val();
        var link = $("input[name ='email_link']").val();
        var addTitle = $("input[name='emailTitle']").is(":checked");
        var addAutostart = $("input[name='emailAutostart']").is(":checked");
        var hash = providerMergeTags[provider];
        var src = "https://www.cincopa.com/media-platform/api/thumb.aspx?size=large&rid=" + drid + "&trs=play";
        if(addAutostart){
            if(hash != ""){
                hash += "&cpoautostart=true"
            } else {
                hash = "#cpoautostart=true"
            }
        }
        var emailHtml = "";
        var title = title.replace(/"/g, "");
        var aLink = '<a{target} href="{link}"><img src="{src}" {width} alt="' + title + '" /></a>'
        if (addTitle) {
            emailHtml = '<table {align} {table-width}><tr>' + aLink + '</tr>';
            if (title != "") {
                emailHtml += '<tr><td><b>' + title + '</b></td></tr>';
            }
            if (desc != "") {
                emailHtml += '<tr><td>' + desc + '<td></tr></div>';
            }
            emailHtml += '</table>';
        } else {
            emailHtml = aLink;
        }
        $('textarea#email_gallerycode').val(emailHtml.replace("{src}", src).replace("{link}", link + hash).replace("{target}","").replace("{align}",'align="center"').replace("{width}", 'width="' + parseInt(width) + '" height="' + parseInt(height) + '"' ).replace("{table-width}",'width="' + parseInt(width) + '"'));
        $('.email_preview').html(emailHtml.replace("{src}", src + "&fake=" + Math.random()).replace("{link}", provider == "none" ? link + providerMergeTags[provider] : link).replace("{target}"," target='_blank' ").replace("{align}",'').replace("{width}", 'style="max-width:' + width + 'px; max-height:' + height + 'px;"' ).replace("{table-width}",'style="max-width:' + width + 'px; text-align:center" '));

    }

    this.seo_on_off = function (item) {
        var srtFileLimit = 5;
        seo_html = "";
        seo_html += '<span>' + item.filename + '</span>';
        if (item.description != '' && item.description != 'a wordpress plugin folder') {
            seo_html += '<span>' + item.description + '</span>'
        }
        if (item.caption != '')
            seo_html += '<span>' + item.caption + '</span>';
        if (typeof item.exif != 'undefined') {
            for (var j in item.exif) {
                var objType = typeof item.exif[j];
                if (objType.toLowerCase() == 'object') {
                    for (var p in item.exif[j]) {
                        if (item.exif[j][p] == '')
                            continue;
                        seo_html += '<span>' + p + '</span>:<span> ' + item.exif[j][p] + '</span>';
                    }
                } else {
                    if (item.exif[j] == '')
                        continue;
                    seo_html += '<span>' + j + '</span><span> ' + item.exif[j] + '</span>';
                }
            }
        }
        if (typeof item.attached != 'undefined') {
            var subtitlesCount = 0, srtCount = 0;
            for (var t in item.attached) {
                if (item.attached[t].directive_attribues.type.indexOf("subtitle") > -1) {
                    subtitlesCount++;
                }
            }
            srtCount = Math.min(subtitlesCount, srtFileLimit);
            if (srtCount != 0) {
                for (var i = 0; i < item.attached.length; i++) {
                    if (srtFileLimit > 0 && item.attached[i].directive_attribues.type.indexOf("subtitle") > -1) {
                        var url = item.attached[i].url.directive_innervalue.replace(/(&amp;)/g, "&")
                        $.get(url, function (data) {
                            var srtText = srtParser(data);
                            seo_html += srtText;
                            srtCount--;
                            if (srtCount == 0) {
                                seo_html += '</noscript>';
                                appendSeoText();
                            }
                        });
                        srtFileLimit--;
                    } else if (srtFileLimit == 0) {
                        break;
                    }
                }
            } else {
                seo_html += '</noscript>';
                appendSeoText();
            }
        } else {
            seo_html += '</noscript>';
            appendSeoText();
        }
    }

    this.callTemplateDropdown = function(elem, item){
        var type = elem.attr("data-type");
        var dataObj = {};
        var wrapper = $("<div>").addClass("dd-container add_gall_id_wrap");
        elem.wrap(wrapper);

        var defaultText = "Choose template :";
        if(type == "video"){
            var defaultFid = "A4HAcLOLOO68";
        } else if (type == "music"){
            var defaultFid = "AEFALSr3trK4";
        }

        var label = $("<a class='dd-selected' data-default='" + defaultFid + "'><label class='dd-selected-text'>" + defaultText + "</label></a>");
        elem.before(label);
        elem.hide();

        var your_galleries = {
            "title" : "Your Galleries",
            "sub" : [],

        }

        var your_master = {
            "title" : "Your Master Templates",
            "sub" : {}
        }

        var masterExist = false;
        for(var i = 0; i < mediaLibraries.length; i++){
            if( mediaLibraries[i].tags.split(",").indexOf("master") > -1){
                masterExist = true;
                your_master.sub[mediaLibraries[i].did] = { "title" : mediaLibraries[i].fname }
            }
            your_galleries.sub.push({did:mediaLibraries[i].did, "title" : mediaLibraries[i].fname,tags:mediaLibraries[i].tags.split(",") })
        }
        if(!masterExist){
            your_master.sub["no-action"] = { "title" : "You don't have any master gallery yet" }
        }
        your_galleries.sub.sort(function(a,b) {

                if(a.tags.indexOf("preset")>-1 && b.tags.indexOf("preset")==-1){
                    return -1
                } else if (a.tags.indexOf("preset") === -1 && b.tags.indexOf("preset")>-1){
                    return 1
                } else {
                    return 0
                }
            }
        );

// your_galleries.sub.push({did:defaultFid, "title" : "Default Template" ,tags:[]})

        if(type == "video"){

            dataObj = {
// "predefined" : {
//     "title" : "Predefined",
//     "sub": {
//         "A4HAcLOLOO68" : { "title" : "Cincopa Video Player" },
//         "A4IA-RbWMFlu" : { "title" : "Popup Video Player" },
//         "A4LAbUcY-7We" : { "title" : "Cool Red Player" },
//         "AgEA0W8R-PWg" : { "title" : "Blue Player" },
//         "AAPAVWso-Lzh" : { "title" : "Black & White Player" },
//         "none" : { "title" : "Customized Player" }
//     }
// },
// "templates" : {
//     "title" : "Templates",
//     "sub": {
//         "video_playlist" : {
//             "title" : "Video Playlist",
//             "sub": {
//                 "AcNAER78NK3w" : { "title" : "Video with horizontal playlist" },
//                 "AQHAHdbr2tcd" : { "title" : "Video with horizontal playlist cool red player" },
//                 "AEFADfbmvV7Y" : { "title" : "Video with horizontal playlist blue player" },
//                 "AgFA3cbqXJ92" : { "title" : "Video with horizontal playlist black and white player" },
//                 "AUHA9SrrxWc2" : { "title" : "Video with vertical playlist" },
//                 "AEHATi7D_Tgc" : { "title" : "Video with vertical playlist cool red player" },
//                 "AgKAthLw__ml" : { "title" : "Video with vertical playlist blue player" },
//                 "A4JA7nr1YIAW" : { "title" : "Video with vertical playlist black and white player" },
//                 "AgFAmkbEYwLU" : { "title" : "Responsive video gallery with vertical playlist" },
//                 "AUCAkRruIngu" : { "title" : "Playlist over Video" },
//                 "AYNAc-Lp9eix" : { "title" : "Playlist over Video with vertical playlist" },
//                 "AMMAP-LK9S07" : { "title" : "Playlist over Video with small thumbnails" },
//                 "AAMAfZLKhbRd" : { "title" : "Responsive video gallery with right playlist" },
//                 "A8IAPHMM4ebk" : { "title" : "Responsive video gallery with right simple playlist" },
//                 "AkOAkGMs4W4r" : { "title" : "Responsive video gallery with right highlighted playlist" }
//             }
//         },
//         "video_player" : {
//             "title" : "Video player",
//             "sub": {
//                 "A4HAcLOLOO68" : { "title" : "Cincopa Video Player" },
//                 "AQDAbzte6Mau" : { "title" : "Billboard Video Player" },
//                 "AEEAVR7o-q8v" : { "title" : "Video without playlist" },
//                 "AMNAjSc2fN7n" : { "title" : "Video without playlist with rounded player" },
//                 "AEJA8RcqfVY1" : { "title" : "Video without playlist with clean design" },
//                 "A4NAbNsFm-7J" : { "title" : "Facebook mode video player" },
//                 "AsCAx_7wLjMD" : { "title" : "Overlay Video" }
//             }
//         },
//         "video_gallery" : {
//             "title" : "Video gallery",
//             "sub": {
//                 "AIJAaBcRziay" : { "title" : "Video gallery with categories" },
//                 "AYDAyQ8YerqD" : { "title" : "Video gallery with categories highlighted player one" },
//                 "AAGAnSsne3tI" : { "title" : "Video gallery with categories highlighted player two" },
//                 "AAAAdjLHXgtG" : { "title" : "Responsive video gallery" },
//                 "A0PAXnL1PliB" : { "title" : "Responsive video gallery with branded video" }
//             }
//         },
//         "video_timeline" : {
//             "title" : "Video timeline",
//             "sub": {
//                 "AgGArFcg663M" : { "title" : "Video timeline" },
//                 "AAGAmIcWIROl" : { "title" : "Video timeline with red and black design" },
//                 "AYJAvK8pGjmh" : { "title" : "Video timeline with blue and white design" }
//             }
//         },
//         "grid" : {
//             "title" : "Grid timeline",
//             "sub": {
//                 "A4IA-RbWMFlu" : { "title" : "Responsive imagelist" },
//                 "AUHAha7ld4dM" : { "title" : "Responsive imagelist with rounded thumbs" },
//                 "AYGAzbLjdYFM" : { "title" : "Responsive imagelist with square thumbs" },
//                 "A4IAGZL0dgOL" : { "title" : "Responsive imagelist with rectangle thumbs" },
//                 "AoJAFarhTTsD" : { "title" : "Responsive imagelist with flying titles" },
//                 "AcDAvmLLQx3p" : { "title" : "Responsive imagelist with diamond shape" },
//                 "AUNAHmNgbQIY" : { "title" : "Tutorial gallery" },
//                 "AQJAUR7e9Bvz" : { "title" : "Pinterest like" },
//                 "AwGApb7BSpUq" : { "title" : "Pinterest style gallery with rounded thumbs" },
//                 "AMAADfLPOJOE" : { "title" : "Pinterest style gallery with white lightbox background" },
//                 "AsPAkk9KanWA" : { "title" : "Holiday pinterest style gallery" }
//             }
//         },
//         "grid_slider" : {
//             "title" : "Grid Slider Templates",
//             "sub": {
//                 "AEAAQdbniShi" : { "title" : "Responsive image gallery" }
//             }
//         }
//     }
// },
// "your_master" : your_master,
                "your_galleries" : your_galleries,
            }
        } else if (type == "music"){
            dataObj = {
// "predefined" : {
//     "title" : "Predefined",
//     "sub": {
//         "AEFALSr3trK4" : { "title" : "Default Audio Player" },
//         "AwBA9Ybai0BL" : { "title" : "Dark Rounded Player" },
//         "AIIACaM9Xsjp" : { "title" : "Square White Player" },
//         "AMAA3ZM-XEoq" : { "title" : "Retro Blue Player" }
//     }
// },
// "templates" : {
//     "title" : "Templates",
//     "sub": {
//         "audio_playlist" : {
//             "title" : "Audio Playlist",
//             "sub": {
//                 "AwNA4p9fPV92" : { "title" : "Responsive dark branded player with playlist" },
//                 "AMBAiqtwQFeN" : { "title" : "Responsive blue audio player with playlist" },
//                 "A8CA-QLSurLK" : { "title" : "Responsive HTML5 music audio with playlist" },
//                 "AEAA4b7DO-AF" : { "title" : "Responsive HTML5 audio player with playlist dark background" },
//                 "AABAyq7_8XpI" : { "title" : "Responsive HTML5 audio player with playlist bright background" },
//                 "AgKAfar7YifL" : { "title" : "Responsive HTML5 audio rounded player with playlist" },
//                 "AwCAAjrnfsp0" : { "title" : "Responsive HTML5 audio player with playlist with images" },
//                 "AYOAHbrPWrNA" : { "title" : "Audio player with large cover" },
//                 "AcEAaJd0a6JY" : { "title" : "Smooth Audio Player Light" },
//                 "A4MA6JtSaKBb" : { "title" : "Smooth Audio Player Silver" },
//                 "AwLAHdL2qHcL" : { "title" : "Responsive tiny audio player with playlist" },
//                 "A8PATs7O0tI_" : { "title" : "Bandcamp audio player" },
//                 "AwGADLNPcn5U" : { "title" : "Baroque audio player" },
//                 "AMHAuS8mnIlf" : { "title" : "Rounded audio player" },
//                 "AQIApS8Tngve" : { "title" : "Minimalist audio player" },
//                 "A4HARTc5nYRY" : { "title" : "Tiny audio player with playlist" }
//             }
//         },
//         "audio_player" : {
//             "title" : "Audio player",
//             "sub": {
//                 "AEFALSr3trK4" : { "title" : "Responsive HTML5 audio player" },
//                 "AwBA9Ybai0BL" : { "title" : "Responsive HTML5 dark rounded audio player" },
//                 "AIPAXZrCiwrJ" : { "title" : "Responsive HTML5 square white audio player" },
//                 "AkNAvYr8eEAP" : { "title" : "Responsive HTML5 retro blue audio player" },
//                 "A0LAa8sLwel8" : { "title" : "Sonic Uno" }
//             }
//         }
//     }
// },
// "your_master" : your_master,
                "your_galleries" : your_galleries
            }
        }

        elem.addClass("dd-options");
        var presetInd = 0;
        var presetLi = $("<li class='preset'><span>No preset - add a â€˜presetâ€™ tag to a gallery for it to appear here</span></li>")
        if(dataObj.your_galleries && dataObj.your_galleries.sub && !dataObj.your_galleries.sub.length){
            elem.append("<li><span  style='display: inline-block;padding: 10px;margin: 0 -15px;'>No galleries yet</span></li>")
        }
        for(var first in dataObj){
//var firstLi = $("<li>");
// firstLi.append("<a class='dd-option'><label class='dd-option-text'>" + dataObj[first].title + "</label></a>")
            if(typeof dataObj[first].sub != "undefined"){
//firstLi.addClass("with-subs dd-selected");
                var firstUl = elem;
                firstUl.addClass("dd-options");
// firstLi.append(firstUl);
                var second='';
                for(var j=0;j<dataObj[first].sub.length;j++){
                    second = dataObj[first].sub[j].did;
                    if(j ==0 && dataObj[first].sub[j].tags && dataObj[first].sub[j].tags.indexOf("preset")==-1){
                        firstUl.append(presetLi);
                    }
                    if( dataObj[first].sub[j].tags && dataObj[first].sub[j].tags.indexOf("preset")>-1){
                        presetInd++
                    }else{
                        if(presetInd!=0){
                            presetInd = -1;
                        }
                    }
                    var secondLi = $("<li class='"+(presetInd !==-1 && presetInd !==0 && j==0 ? 'preset-top' :'')+" "+(presetInd ==-1 ? 'preset-bottom' :'')+"'>");
                    secondLi.append("<a class=' dd-option" + (second == defaultFid ? ' dd-active': '') + "'><label class='dd-option-text'>" + dataObj[first]['sub'][j].title + "</label></a>");
                    if(typeof dataObj[first]['sub'][j].sub != "undefined"){
                        secondLi.addClass("with-subs dd-selected");
                        var secondUl = $("<ul>");
                        secondUl.addClass("dd-options");
                        secondLi.append(secondUl);
                        for(var third in dataObj[first]['sub'][j]['sub']){
                            var thirdLi = $("<li>");
                            thirdLi.append("<a class='dd-option'><label class='dd-option-text'>" + dataObj[first]['sub'][j]['sub'][third].title + "</label></a>");
                            thirdLi.attr("data-value", third);
                            secondUl.append(thirdLi);
                        }
                        secondUl.addClass('without-subs');
                    } else {
                        secondLi.attr("data-value", second);
                        firstUl.addClass('without-subs');
                    }
                    firstUl.append(secondLi);
                    presetInd = presetInd == -1 ? 0 :presetInd;
                }
            } else {
                elem.addClass('without-subs');
            }
//elem.append(firstLi)
        }

        elem.find(".dd-option").on("click", function(e){
            var value = $(this).parent("li").attr("data-value");
            $('.embedTabContent').removeClass('cp-hide');

            if(value && value != label.attr("data-default")){
                var title = $(this).find("label").text();
                $('#tab_embed .dd-selected-text').text(title)
                var selector = $('.tabsHead li.embed_info', _this.assetEditor).attr('data-tab');
                if(value == "none"){
                    var url = 'http://help.cincopa.com/hc/en-us/articles/215449578-Getting-Started-Guide';
                    window.open(url, "_blank");
                    return;
                } else if(value == "no-action"){
                    return;
                }
                label.attr("data-default", value);
                elem.find(".dd-option").removeClass("dd-active");
                $(this).addClass("dd-active");
//label.find("label").text(title);
                embed_id = value;
                default_id = item.directive_attribues.drid;
                var seoOnOff = true;
                if ($(".iframeToggle label.itoggle").hasClass("iToff"))
                    var seoOnOff = false;
                _this.setEmbedId(embed_id, default_id, seoOnOff);
                _this.loadSkinPreview(embed_id, default_id, new_guid);
                _this.copyToInTabs(selector);
            } else {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        function toggleVisibility() {
            var isVisible = elem.is(":visible");
            if (isVisible) {
                elem.slideUp("fast");
            } else {
                elem.slideDown("fast");
            }
        }
        label.on("click", function(e){
            e.stopPropagation();
            e.preventDefault();
            elem.slideToggle(200);
        })
        $("body").off("click.callTemplateDropdown");
        $("body").on("click.callTemplateDropdown", function() {
            if ( elem.is(":visible")) {
                elem.slideUp("fast");
            }
        })
    }

    this.callColorPicker = function(){
        $('.color input[type="text"]:not(".activated")').each(function () {
            if($(this).spectrum != undefined){
                (function(element){
                    var oldHex = $(element).val();
                    var updateTimer = null;
//$(element).parent().css("float", "none");

                    $(element).spectrum({
                        flat: true,
                        showInput: true,
                        clickoutFiresChange:true,
                        showSelectionPalette: false,
                        showButtons: false,
                        preferredFormat: "hex",
                        show: function(color){
                            $(element).next(".sp-container").find(".sp-input-thumb").css("background-color", color.toHexString());
                        },
                        move: function(color) {
                            var hex = color.toHexString();
                            $(element).val(hex);
                            oldHex = hex;
                            $(element).next(".sp-container").find(".sp-input-thumb").css("background-color", hex);

                            clearTimeout(updateTimer)
                            updateTimer = setTimeout(function () {
                                var id = $(element).parents(".timelineElement").attr("data-guid");
                                _this.saveAddTimeLine(currentEditingItemID, "update", "annotation", true);
                            }, 500)

                        },
                        change: function(color){
                            var hex = color.toHexString();
                            $(element).next(".sp-container").find(".sp-input-thumb").css("background-color", hex);
                            if(oldHex !== hex){
                                oldHex = hex;
                                var id = $(element).parents(".timelineElement").attr("data-guid");
                                _this.saveAddTimeLine(currentEditingItemID, "update", "annotation", true);
                            }
                        }
                    });
                })($(this));
            }
        })
    }

    this.attachTimelineEvents = function(){

        $('.annotatio_submit_btn, .annotatio_save_btn', _this.assetEditor).off('click.addtimline').on('click.addtimline', function () {
            if ($(this).hasClass('disabled')) {
                if(!$(".cta_error").length){
                    $(this).before("<span class='cta_error' style='color:red;width: 100%;display:block;clear:both;text-align: right;margin-bottom:4px'>Title and link can't be empty</span>");
                    setTimeout(function(){
                        $(".cta_error").remove();
                    },3000)
                }
                return false;
            }
            var type = $(this).closest(".timelineBlock").attr("data-type");
            if ($(this).hasClass('annotatio_save_btn')) {
                _this.saveAddTimeLine(currentEditingItemID, "update", type);
            } else {
                _this.saveAddTimeLine(currentEditingItemID, "save", type);
            }
        });

        $('.annotatio_cancel_btn').off('click.addtimline').on('click.addtimline', function () {

            var cont = $(this).closest(".timelineBlock");
            var type = cont.attr("data-type");
            $('.addAnnotations', cont).hide();
            $('#edit_' + type, cont).ddslick('select', {index: '0'});
            $('.timelineElement.active', cont).removeClass('active').hide();
            if($(this).closest('.timelineBlock ').find('.add_annotation_btn[data-type="chapter"]').length){
                $(this).closest('.timelineBlock ').find('.add_annotation_btn[data-type="chapter"]').show();
            }
        });

        $('.timelineElement span.delete', _this.assetEditor).off('click.addtimline').on('click.addtimline', function () {
            $(this).parents('.timelineElement').fadeOut(function () {
                var type = $(this).attr("data-type");
                $(this).remove();
                setTimeout(function () {
                    _this.saveAddTimeLine(currentEditingItemID, "delete", type );
                }, 100);
            });
        });

        $('.timelineElement input, .timelineElement textarea', _this.assetEditor).off('keyup.addtimline change.addtimeline').on('keyup.addtimline change.addtimeline', function () {
            $(this).parents('.timelineElement').addClass('active');
        });

        $('.annotation_link_tooltip', _this.assetEditor).on('change.addtimeline', function () {
            if($(this).is(":checked"))
                $(this).parents(".annotation_field").next().removeClass("cp_hide");
            else
                $(this).parents(".annotation_field").next().addClass("cp_hide");
        });

        $('.annotation_enable_link', _this.assetEditor).on('change.addtimeline', function () {
            if($(this).is(":checked"))
                $(this).parent().next().removeClass("cp_hide");
            else
                $(this).parent().next().addClass("cp_hide");
        });


        $('.annotation_field input[type="radio"][name^="callToactionTime"]', _this.assetEditor).off('change.addtimeline').on('change.addtimline', function () {
            if($(this).val() == "preroll" || $(this).val() == "postroll"){
                $(this).parents(".annotation_field").find(".annotation_seconds_b").addClass("disabled");
                $(this).parents(".annotation_field").find(".annotation_seconds_b .annotation_seconds").val($(this).val());
            } else {
                $(this).parents(".annotation_field").find(".annotation_seconds_b").removeClass("disabled");
                $(this).parents(".annotation_field").find(".annotation_seconds_b .annotation_seconds").val($(this).parents(".annotation_field").find(".annotation_seconds_b .annotation_second_input").val());
            }
            var value = ($(this).val() == "preroll" || $(this).val() == "postroll") ? $(this).val() : $(this).parents(".annotation_field").find(".annotation_seconds_b .annotation_seconds").val();
            if(_this.ctaExistOnSec(value)){
                $(this).parents(".annotation_field").find('.annotationError').text("You already have Call to action at this second!");
                return;
            }
            _this.saveAddTimeLine(currentEditingItemID, "update", "calltoaction", true);
        });

        $(_this.assetEditor).on('change.addtimline', '.annotation_seconds_b input.annotation_second_input' ,function () {
            $(this).parents(".annotation_seconds_b").find(".annotation_seconds").val($(this).val());
        });

        var keyupTimer;

        $('.annotation_required', _this.assetEditor).off('keyup').on('keyup', function () {
            clearTimeout(keyupTimer);
            var cont = $(this).parents(".timelineElement").length ? $(this).parents(".timelineElement"): $(this).parents(".addAnnotations");
            var valid = true;
            cont.find('.annotation_required').each(function(){
                if($.trim($(this).val()) == ""){
                    valid = false;
                    return false;
                }
            })
            keyupTimer = setTimeout(function () {
                if (valid) {
                    $('.annotatio_submit_btn, .annotatio_save_btn', cont).removeClass('disabled');
                } else {
                    $('.annotatio_submit_btn, .annotatio_save_btn', cont).addClass('disabled');
                }
            }, 400);
        });

        $('.addTimelineBtn', _this.assetEditor).off('click.addtimline').on('click.addtimline', function () {
            if($(this).attr("data-type") != "annotation"){
                _this.addAnnotationCallback($(this));
            }
            if($(this).attr("data-type") == "calltoaction"){
                _this.saveAddTimeLine(currentEditingItemID, "save", "calltoaction", true);
            }

        });

        var keyupSaveTimer;




        $('.annotation_seconds_increase', _this.assetEditor).each(function(){
            var _that  = $(this)
            if($(this).hasClass("activatedNumInput")) return true;
            $(this).numInput({
                increaseBtn: _that,
                decreaseBtn: _that.siblings(".annotation_seconds_decrease"),
                inputField: _that.parents(".annotation_field").find('.annotation_second_input'),
                type: "second",
                mouseHold: true,
                maxValue: function(){
                    return videoFileDuration;
                },
                minValue: function(){
                    return 0;
                },
                cbDelay: 1000,
                init: function(elem){
                    elem.addClass("activatedNumInput");
                },
                callbackWithDelay: function(newValue){
                    var annType = _that.parents(".timelineElement").attr("data-type");
                    if(_that.parents("[data-type='calltoaction']").length && _this.ctaExistOnSec(newValue)){
                        _that.parents(".annotation_field").find('.annotationError').text("You already have Call to action at this second!");
                        return;
                    }
                    _that.parents(".annotation_field").find('.annotationError').text("");
                    var isError = _this.saveAddTimeLine(currentEditingItemID, "update", annType, true);
                    if(isError) {
                        _that.parents(".fieldsSection").find('.annotationError').text(isError);
                        _that.parents(".tabContent").find(".addAnnotationButton").addClass("disabled")
                    } else {
                        _that.parents(".fieldsSection").find('.annotationError').text("");
                        _that.parents(".tabContent").find(".addAnnotationButton").removeClass("disabled");
                    }
                },
                afterChange: function(newValue){
                    var dropdown, index;
                    if(_that.parents("[data-type='annotation']").length && _that.parents(".annotation_field").find('.annotation_second_input').attr("data-key") === "time"){
                        dropdown = $("#edit_annotation");
                        index = _that.parents(".timelineElement").attr("data-guid");
                    } else if(_that.parents("[data-type='calltoaction']").length){
                        dropdown = $("#edit_calltoaction");
                        index = _that.parents(".timelineElement").attr("data-time");
                    }

                    if(dropdown){
                        var selected_left = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-left");
                        var selected_right = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-right");
                        var selectedInDropdown = dropdown.find(".dd-option-value[value^='" + index + "']+label .dd-option-text-right");
                        selected_right.text("[" + newValue + "]");
                        selectedInDropdown.text("[" + newValue + "]");
                        dropdown.data("ddslick").selectedData.text = selected_left.text() +  selected_right.text();
                    }
                }
            })
        })

        $('.annotation_input_keyup', _this.assetEditor).off('keyup').on("keyup", function(e){
            var _that = $(this);
            var type = _that.parents(".timelineElement").attr("data-type");
            var text = $(this).val();
            clearTimeout(keyupSaveTimer);
            keyupSaveTimer = setTimeout(function(){
                if(type == "calltoaction" && _that.hasClass("annotation_second_input") && _this.ctaExistOnSec(text)){
                    _that.parents(".annotation_field").find('.annotationError').text("You already have Call to action at this second!");
                    return;
                } else {
                    _that.parents(".annotation_field").find('.annotation_second_input').trigger('change');
                }
                var isError = _this.saveAddTimeLine(currentEditingItemID, "update", type, true);
                if(isError){
                    _that.parents(".fieldsSection").find('.annotationError').text(isError);
                    _that.parents(".tabContent").find(".addAnnotationButton").addClass("disabled")
                } else {
                    _that.parents(".fieldsSection").find('.annotationError').text("");
                    _that.parents(".tabContent").find(".addAnnotationButton").removeClass("disabled")
                }
            }, 1000)

            var index, dropdown;
            if(type == "calltoaction"){
                index = $(this).parents(".timelineElement").attr("data-time");
                dropdown = $("#edit_calltoaction");
            } else {
                var index = $(this).parents(".timelineElement").attr("data-guid");
                dropdown = $("#edit_annotation");
            }
            if(dropdown){
                if($(this).hasClass("annotation_description")){
                    var selected_left = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-left");
                    var selected_right = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-right");
                    var selectedInDropdown = dropdown.find(".dd-option-value[value^='" + index + "']+label .dd-option-text-left");
                    selected_left.text(stripHtml(text));
                    selectedInDropdown.text(stripHtml(text));
                    dropdown.data("ddslick").selectedData.text = selected_left.text() + selected_right.text();
                } else if($(this).hasClass("annotation_second_input")){
                    var selected_left = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-left");
                    var selected_right = dropdown.find(".dd-selected-value[value^='" + index + "']+a .dd-option-text-right");
                    var selectedInDropdown = dropdown.find(".dd-option-value[value^='" + index + "']+label .dd-option-text-right");
                    selected_right.text("[" + text + "]");
                    selectedInDropdown.text("[" + text + "]");
                    dropdown.data("ddslick").selectedData.text = selected_left.text() +  selected_right.text();
                }
            }


        })

        $('.annotation_input_change', _this.assetEditor).off('change.saveTimeline').on("change.saveTimeline", function(){
            _this.saveAddTimeLine(currentEditingItemID, "update", "annotation", true);
        });

        $('.start_end_select_wrap select', _this.assetEditor).off('change').on("change", function(){
            if($(this).val() == ""){
                $(this).closest(".start_end_wrap").find(".annotation_field").removeClass("disabled");
            } else {
                $(this).closest(".start_end_wrap").find(".annotation_field").addClass("disabled");
            }

            _this.saveAddTimeLine(currentEditingItemID, "update", "start_end", true);
        });

        $('.start_end_wrap .annotation_second_input', _this.assetEditor).off('change').on("change", function(){
            _this.saveAddTimeLine(currentEditingItemID, "update", "start_end", true);
        });

        $('.vr_input', _this.assetEditor).off('change').on("change", function(){
            _this.saveAddTimeLine(currentEditingItemID, "update", "isVR", true);
        });
    }

    this.ctaExistOnSec = function (second){
        var exists = false;
        $(".timelineBlock[data-type='calltoaction'] .timelineElement:not(.active)").each(function(){
            if(second == "preroll" || second == "postroll"){
                if($(this).find(".radioBox input[type='radio'][value='" + second + "']").is(":checked")){
                    exists = true;
                    return false
                }
            } else {
                if($(this).find(".radioBox input[type='radio'][value='customtime']").is(":checked") && $(this).find(".annotation_seconds").val() == second){
                    exists = true;
                    return false;
                }

            }

        })
        return exists;
    }

    this.addAnnotationCallback = function (elem, annotationType){
        var cont = elem.closest(".timelineBlock");
        if(annotationType){
            $('.addAnnotations .addAnnotationType', cont).val(annotationType);
            $('.addAnnotations .annotation_link_block', cont).addClass("cp_hide");
            $('.addAnnotations .annotation_color').val("ffffff").prev().css('backgroundColor', '#ffffff');
            $('.addAnnotations .annotation_bg_color').val("000000").prev().css('backgroundColor', '#000000');
            $('.addAnnotations .annotation_tooltip_color').val("000000").prev().css('backgroundColor', '#000000');
            $('.addAnnotations .annotation_tooltip_bg_color').val("eeeeee").prev().css('backgroundColor', '#eeeeee');
            $('.addAnnotations .annotation_size.annotation_left').val("25");
            $('.addAnnotations .annotation_size.annotation_top').val("40");
            $('.addAnnotations .annotation_size.annotation_width').val("50");
            $('.addAnnotations .annotation_size.annotation_height').val("20");
            $('.addAnnotations .annotation_font_style', cont).val("bold");
            var guid = guidGenerator();
            $('.addAnnotations').attr("data-guid", guid);
            if(annotationType == "title"){
                $('.addAnnotations .annotation_font_big', cont).show().val("24px");
                $('.addAnnotations .annotation_font_small', cont).hide();
                $('.addAnnotations .bgcolor', cont).hide();
                $('.addAnnotations .annotation_position_link', cont).hide();
            } else {
                $('.addAnnotations .annotation_font_big', cont).hide();
                $('.addAnnotations .annotation_font_small', cont).show().val("11px");
                $('.addAnnotations .bgcolor', cont).show();
                $('.addAnnotations .annotation_position_link', cont).show();
                $('.addAnnotations .annotation_enable_link, .addAnnotations .annotation_link_blank', cont).prop("checked", false);
            }
            if(annotationType == "timeline"){
                $('.addAnnotations .annotation_position_section', cont).hide();
                $('.addAnnotations .annotation_size_section', cont).addClass("annotation_size_section_full_width");
                $('.addAnnotations .annotation_end', cont).hide();
            } else {
                $('.addAnnotations .annotation_position_section', cont).show();
                $('.addAnnotations .annotation_size_section', cont).removeClass("annotation_size_section_full_width");
                $('.addAnnotations .annotation_end', cont).show();
            }
            if(annotationType == "spotlight"){
                $('.addAnnotations .annotation_font_big', cont).show().val("24px");
                $('.addAnnotations .annotation_font_small', cont).hide();
                $('.addAnnotations .annotation_size.annotation_left').val("35");
                $('.addAnnotations .annotation_size.annotation_top').val("30");
                $('.addAnnotations .annotation_size.annotation_width').val("30");
                $('.addAnnotations .annotation_size.annotation_height').val("30");
                $('.addAnnotations .annotation_size.annotation_width_sp').val("30");
                $('.addAnnotations .annotation_size.annotation_height_sp').val("10");
                $('.addAnnotations .annotation_size.annotation_left_sp').val("35");
                $('.addAnnotations .annotation_size.annotation_top_sp').val("62");
            }
        } else {
            if(cont.attr("data-type") == "chapter")
                $('.addAnnotations', cont).show();
        }
        $('.annotations', cont).find('.timelineElement').hide();
        $('.annotations', cont).find('select.edit_timeline_dropdown').val('');
        $('.addAnnotations .annotation_seconds', cont).val(secondsToHMS(_videoCurrentTime));
        $('.addAnnotations .annotation_second_input', cont).val(secondsToHMS(_videoCurrentTime));
        $('.addAnnotations input[type="radio"][value="customtime"]', cont).prop("checked", true);
        $('.addAnnotations .annotation_description', cont).val("");
        $('.addAnnotations .annotation_link', cont).val("");
        $('.addAnnotations .annotation_seconds_b', cont).removeClass("disabled");
        $('.addAnnotations .annotation_seconds_end', cont).val(secondsToHMS(Math.min(_videoCurrentTime + 3 ,videoFileDuration)));
        if(_this.player){
            _this.player.pause();
        }
        if(cont.attr("data-type") == "chapter")
            elem.hide();
    }

    this.buildTimeLineHtml = function(timeLine, buildType){

        var selectObjectChapters, selectObjectAnnotations, selectObjectCallToAction, chapters = {}, annotations = {}, callToAction = {}, start_end = {}, isVR = false;
        if(typeof timeLine.chapter == "undefined" && typeof timeLine.annotation == "undefined" && typeof timeLine.calltoaction == "undefined" && typeof timeLine.start_end == "undefined" && typeof timeLine.isVR == "undefined"){
            chapters = orderByTime(timeLine);
        } else {
            if(typeof timeLine.chapter != "undefined"){
                chapters = orderByTime(timeLine.chapter);
            }
            if(typeof timeLine.annotation != "undefined"){
                annotations = orderByTime(timeLine.annotation);
            }
            if(typeof timeLine.calltoaction != "undefined"){
                callToAction = orderByTime(timeLine.calltoaction);
            }
            if(typeof timeLine.start_end != "undefined"){
                start_end = timeLine.start_end;
            }
            if(typeof timeLine.isVR != "undefined"){
                isVR = timeLine.isVR;
            }
        }
        if(buildType == "all"){
            if(typeof annotations != "undefined"){
                annotationTemp = annotations;
            }
            if(typeof callToAction != "undefined"){
                ctaTemp = callToAction;
            }
        }
        if(chapters.length && (buildType == "chapter" || buildType == "all")){
            selectObjectChapters = $('<select id="edit_chapter"name="edit_chapters" data-type="chapter"/>');
            var selectHtml = '<option value="">Edit Chapters</option>';
            var annotationBlock = $('.timelineBlock[data-type="chapter"] .annotations');
            var addAnnoButton =  $('.timelineBlock[data-type="chapter"] .addTimelineBtn');
            for (var timeIndex = 0; timeIndex < chapters.length; timeIndex++) {
                selectHtml += '<option value="' + chapters[timeIndex].time + '">#' + (timeIndex + 1) + ' ' + chapters[timeIndex].value.title + ' ' + chapters[timeIndex].time + '</option>';
                var timelineElement = $('<div />').addClass('timelineElement').attr('data-guid', chapters[timeIndex].time).attr('data-time', chapters[timeIndex].time).attr('data-type', 'chapter');
                timelineHtm = '<table class="annotations boxMeta_form">\
                                    <tr class=""><th></th> <td><span class="delete">Delete</span></td></tr>\
                                    <tr class="titleBlock annotation_field"><th>Title</th> <td><input placeholder="Add annotation title" class="annotation_title annotation_required" value="' + chapters[timeIndex].value.title + '"/></td></tr>\
                                    <tr class="annotation_field"><th>Description</th> <td><textarea placeholder="Add annotation description" class="annotation_description">' + chapters[timeIndex].value.desc + '</textarea></td></tr>\
                                    <tr class="annotation_field"><th>Seconds</th> <td><input placeholder="0" class="annotation_seconds annotation_second_input " value="' + chapters[timeIndex].time + '"><a class="annotation_seconds_minus annotation_seconds_decrease">-</a><a class="annotation_seconds_plus annotation_seconds_increase">+</a></td></tr>\
                                    <tr class="annotation_field"><th></th> <td><a class="annotatio_save_btn btn green alignright">Save</a><a class="annotatio_cancel_btn btn secondary alignright">Cancel</a></td></tr>\
                                </table>';
                timelineElement.html(timelineHtm);
                annotationBlock.append(timelineElement);
            }
            selectObjectChapters.html(selectHtml);
            addAnnoButton.after(selectObjectChapters);
        }
        if((buildType == "annotation" || buildType == "all")){
            selectObjectAnnotations = $('<select id="edit_annotation" name="edit_annotations" data-type="annotation"/>');
            var selectHtml = '<option value="">Edit existing annotations</option>';
            if(typeof annotations == "undefined" || !annotations.length)
                selectHtml += '<option value="NoAnnotations">No annotations</option>';
            var annotationBlock = $('.timelineBlock[data-type="annotation"] .annotations');
            var addAnnoButton =  $('.timelineBlock[data-type="annotation"] #addAnnotationSelect');
            for (var aI in annotations) {
                for(var timeIndex = 0; timeIndex < annotations[aI].value.length; timeIndex++){
                    var guid = (buildType == "annotation") ? annotations[aI].value[timeIndex].guid : guidGenerator();
                    annotationTemp[aI].value[timeIndex].guid = guid;
                    selectHtml += '<option value="' + guid + '_' + annotations[aI].value[timeIndex].type + '">' + stripHtml(annotations[aI].value[timeIndex].desc) + '[' + annotations[aI].time + ']' + '</option>';
                    var timelineElement = $('<div />').addClass('timelineElement').attr('data-guid', guid).attr('data-time', annotations[aI].time).attr('data-annotationtype', annotations[aI].value[timeIndex].type).attr('data-type', 'annotation');
                    timelineHtm = '<div class="annotations boxMeta_form">\
                                        <div class="annotation_delete_wrap"><span class="delete">Delete</span></div>\
                                        <input type="hidden" class="addAnnotationType" value="' + annotations[aI].value[timeIndex].type + '">\
                                        <div class="annotation_field"><textarea placeholder="Type text here" class="annotation_description annotation_required annotation_input_keyup" data-key="desc">' + annotations[aI].value[timeIndex].desc + '</textarea></td></div>\
                                        <div class="fieldsSection">\
                                            <h3><span>When?</span></h3>\
                                            <div class="annotation_field timeField "><p><b>Start</b><div class="inputDigital"><div class="field"><input placeholder="00:00:00" class="annotation_seconds annotation_second_input annotation_input_keyup" data-key="time" value="' + annotations[aI].time + '"></div><div class="buttons"><a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                            <div class="annotation_field timeField annotation_end " ' + (annotations[aI].value[timeIndex].type == 'timeline' ? "style='display:none'":"") + '><p><b>End</b><div class="inputDigital"><div class="field"><input placeholder="00:00:00" class="annotation_seconds_end annotation_second_input annotation_input_keyup" data-key="end" value="' + annotations[aI].value[timeIndex].end + '"></div><div class="buttons"><a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div><span class="annotationError"></span></div>\
                                        </div>\
                                        <div class="annotation_position_section" ' + (annotations[aI].value[timeIndex].type == 'timeline' ? "style='display:none'":"") + '>\
                                            <h3><span>Position</span></h3>\
                                             <div class="fieldsSection">\
                                                 <div class="annotation_field timeField"><p><b>Left (%)</b><div class="inputDigital"><div class="field"><input name="left" data-key="left" value="' + annotations[aI].value[timeIndex].left + '" class="annotation_left annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                 <div class="annotation_field timeField"><p><b>Top (%)</b><div class="inputDigital"><div class="field"><input name="top" data-key="top" value="' + annotations[aI].value[timeIndex].top + '" class="annotation_top annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                             </div>\
                                             <div class="fieldsSection">\
                                                  <div class="annotation_field timeField"><p><b>Left (%)</b><div class="inputDigital"><div class="field"><input name="left_sp" data-key="left_sp" value="' + annotations[aI].value[timeIndex].left_sp + '" class="annotation_left_sp annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                  <div class="annotation_field timeField"><p><b>Top (%)</b><div class="inputDigital"><div class="field"><input name="top_sp" data-key="top_sp" value="' + annotations[aI].value[timeIndex].top_sp + '" class="annotation_top_sp annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                             </div>\
                                        </div><div class="annotation_size_section ' + (annotations[aI].value[timeIndex].type == 'timeline' ? "annotation_size_section_full_width":"") + '">\
                                            <h3><span>Size</span></h3>\
                                            <div class="fieldsSection">\
                                              <div class="annotation_field timeField"><p><b>Width (%)</b><div class="inputDigital"><div class="field"><input name="width" data-key="width" value="' + annotations[aI].value[timeIndex].width + '" class="annotation_width annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                              <div class="annotation_field timeField"><p><b>Height (%)</b><div class="inputDigital"><div class="field"><input name="height" data-key="height" value="' + annotations[aI].value[timeIndex].height + '" class="annotation_height annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                            </div>\
                                            <div class="fieldsSection">\
                                                <div class="annotation_field timeField"><p><b>Width (%)</b><div class="inputDigital"><div class="field"><input name="width_sp" data-key="width_sp" value="' + annotations[aI].value[timeIndex].width_sp + '" class="annotation_width_sp annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                                <div class="annotation_field timeField"><p><b>Height (%)</b><div class="inputDigital"><div class="field"><input name="height_sp" data-key="height_sp" value="' + annotations[aI].value[timeIndex].height_sp + '" class="annotation_height_sp annotation_size annotation_input_keyup" ></div><div class="buttons"><a class="annotation_size_increase"><i class="icon-chevron-up"></i></a><a class="annotation_size_decrease"><i class="icon-chevron-down"></i></a></div></div></p></div>\
                                            </div>\
                                        </div>\
                                         <h3><span>Custom</span></h3>\
                                         <div class="fieldsSection">\
                                              <div class="annotation_field fieldItem color annotation_custom_field"><p><b>Color</b><div class="argumentValue"><input data-key="color" type="text" value="' + annotations[aI].value[timeIndex].color + '" class="field annotation_color" ></div></p></div>\
                                              <div class="annotation_field fieldItem color bgcolor annotation_custom_field" ' + (annotations[aI].value[timeIndex].type == "title" ? "style='display:none'" : "") + '><p><b>Background Color</b><div class="argumentValue"><input data-key="bgcolor" type="text" value="' + annotations[aI].value[timeIndex].bgcolor + '" class="field annotation_bg_color" ></div></p></div>\
                                              <div class="annotation_field fieldItem annotation_custom_field"><p><b>Font size</b><div>\
                                                 <select data-key="font" class="annotation_font annotation_font_big annotation_input_change" ' + (annotations[aI].value[timeIndex].type != "title" && annotations[aI].value[timeIndex].type != "spotlight" ? "style='display:none'" : "") + '>\
                                                    <option value="24px" ' + (annotations[aI].value[timeIndex].font == "24px" ? "selected" : "") + '>24px</option>\
                                                    <option value="42px" ' + (annotations[aI].value[timeIndex].font == "42px" ? "selected" : "") + '>42px</option>\
                                                    <option value="58px" ' + (annotations[aI].value[timeIndex].font == "58px" ? "selected" : "") + '>58px</option>\
                                                    <option value="72px" ' + (annotations[aI].value[timeIndex].font == "72px" ? "selected" : "") + '>72px</option>\
                                                    <option value="100px" ' + (annotations[aI].value[timeIndex].font == "100px" ? "selected" : "") + '>100px</option>\
                                                 </select>\
                                                 <select data-key="font" class="annotation_font annotation_font_small annotation_input_change" ' + (annotations[aI].value[timeIndex].type == "title" || annotations[aI].value[timeIndex].type == "spotlight" ? "style='display:none'" : "") + '>\
                                                     <option value="11px" ' + (annotations[aI].value[timeIndex].font == "11px" ? "selected" : "") + '>11px</option>\
                                                     <option value="13px" ' + (annotations[aI].value[timeIndex].font == "13px" ? "selected" : "") + '>13px</option>\
                                                     <option value="16px" ' + (annotations[aI].value[timeIndex].font == "16px" ? "selected" : "") + '>16px</option>\
                                                     <option value="20px" ' + (annotations[aI].value[timeIndex].font == "20px" ? "selected" : "") + '>20px</option>\
                                                     <option value="24px" ' + (annotations[aI].value[timeIndex].font == "24px" ? "selected" : "") + '>24px</option>\
                                                 </select>\
                                              </div></p></div>\
                                              <div class="annotation_field fieldItem annotation_custom_field"><p><b>Font style</b><div>\
                                                 <select class="annotation_font_style annotation_font_big annotation_input_change">\
                                                    <option value="bold" ' + (annotations[aI].value[timeIndex].fontStyle == "bold" ? "selected" : "") + '>bold</option>\
                                                    <option value="shadow" ' + (annotations[aI].value[timeIndex].fontStyle == "shadow" ? "selected" : "") + '>shadow</option>\
                                                    <option value="italic" ' + (annotations[aI].value[timeIndex].fontStyle == "italic" ? "selected" : "") + '>italic</option>\
                                                    <option value="underline" ' + (annotations[aI].value[timeIndex].fontStyle == "underline" ? "selected" : "") + '>underline</option>\
                                                    <option value="normal" ' + (annotations[aI].value[timeIndex].fontStyle == "normal" ? "selected" : "") + '>normal</option>\
                                                 </select>\
                                              </div></p></div>\
                                         </div>\
                                         <div class="annotation_field annotation_position_link">\
                                              <label class="checkBox"><input type="checkbox" data-key="enableLink" class="annotation_enable_link annotation_input_change" ' + (typeof annotations[aI].value[timeIndex].link != "undefined" ? "checked" : "") + ' /><i></i><b>Link</b></label>\
                                              <div class="annotation_link_block ' + (typeof annotations[aI].value[timeIndex].link == "undefined" ? "cp_hide" : "") + '">\
                                                  <div class="annotation_field">\
                                                     <input type="text" data-key="link" placeholder="http://" class="annotation_link annotation_input_keyup" value="' + (typeof annotations[aI].value[timeIndex].link != "undefined" ? annotations[aI].value[timeIndex].link : "http://") + '">\
                                                  </div>\
                                                  <div class="annotation_field">\
                                                     <label class="checkBox"><input type="checkbox" data-key="blank" class="annotation_link_blank annotation_input_change" ' + (annotations[aI].value[timeIndex].blank == true ? "checked" : "") + '/><i></i><b>Open link in a new tab</b></label>\
                                                  </div>\
                                                  <div class="annotation_tooltip_block_wrap" ' + (annotations[aI].value[timeIndex].type == 'timeline' ? "style='display:none'":"") + '>\
                                                      <div class="annotation_field">\
                                                         <label class="checkBox"><input type="checkbox" data-key="tooltip" class="annotation_link_tooltip annotation_input_change" ' + (annotations[aI].value[timeIndex].tooltip == true ? "checked" : "") + '/><i></i><b>Show link in tooltip</b></label>\
                                                      </div>\
                                                      <div class="annotation_field annotation_tooltip_block ' + (typeof annotations[aI].value[timeIndex].tooltip == "undefined" ? "cp_hide" : "") + '">\
                                                        <div class="annotation_field fieldItem color annotation_custom_field"><p><b>Tooltip Color</b><div class="argumentValue"><input data-key="tooltipColor" type="text" value="' + (typeof annotations[aI].value[timeIndex].tooltipColor != "undefined" ? annotations[aI].value[timeIndex].tooltipColor : "000000") + '" class="field annotation_tooltip_color" ></div></p></div>\
                                                        <div class="annotation_field fieldItem color bgcolor annotation_custom_field" ' + (annotations[aI].value[timeIndex].type == "title" ? "style='display:none'" : "") + '><p><b>Tooltip background color</b><div class="argumentValue"><input data-key="tooltipBgColor" type="text" value="' + (typeof annotations[aI].value[timeIndex].tooltipBgColor != "undefined" ? annotations[aI].value[timeIndex].tooltipBgColor : "eeeeee") + '" class="field annotation_tooltip_bg_color" ></div></p></div>\
                                                      </div>\
                                                  </div>\
                                               </div>\
                                         </div>\
                                    </div>';
                    timelineElement.html(timelineHtm);
                    annotationBlock.append(timelineElement);
                }
            }
            selectObjectAnnotations.html(selectHtml);
            addAnnoButton.after(selectObjectAnnotations);
        }

        if((buildType == "calltoaction" || buildType == "all")){
            selectObjectCallToAction = $('<select id="edit_calltoaction" name="edit_calltoaction" data-type="calltoaction"/>');
            var selectHtml = '<option value="">Edit existing Call To Actions</option>';
            if(typeof callToAction == "undefined" || !callToAction.length)
                selectHtml += '<option value="NoAnnotations">No Call to action</option>';
            var annotationBlock = $('.timelineBlock[data-type="calltoaction"] .annotations');
            var addAnnoButton =  $('.timelineBlock[data-type="calltoaction"] .addTimelineBtn');
            for (var timeIndex = 0; timeIndex < callToAction.length; timeIndex++) {
                selectHtml += '<option value="' + callToAction[timeIndex].time + '">' + stripHtml(callToAction[timeIndex].value.desc) + '[' + callToAction[timeIndex].time + ']' +'</option>';
                var timelineElement = $('<div />').addClass('timelineElement').attr('data-guid', callToAction[timeIndex].time).attr('data-time', callToAction[timeIndex].time).attr('data-type', 'calltoaction');
                timelineHtm = '<div class="annotations boxMeta_form">\
                                   <div class="annotation_delete_wrap"><span class="delete">Delete</span></div>\
                                   <div class="annotation_field"><textarea placeholder="Type text here" class="annotation_description annotation_required annotation_input_keyup">' + callToAction[timeIndex].value.desc + '</textarea></td></div>\
                                   <div class="annotation_field"><input type="text" placeholder="Link" class="annotation_link annotation_required annotation_input_keyup" value="' + callToAction[timeIndex].value.link + '" /></div>\
                                   <div class="annotation_field"><div class="fieldsSection">\
                                       <h3>When?</h3>\
                                       <label class="radioBox"><input type="radio" name="callToactionTime_' + callToAction[timeIndex].time + '" ' + ( callToAction[timeIndex].time == "preroll" ? 'checked="checked"':'' ) + ' value="preroll"/><i></i><b>Pre roll</b></label>\
                                       <label class="radioBox"><input type="radio" name="callToactionTime_' + callToAction[timeIndex].time + '" ' + ( callToAction[timeIndex].time == "postroll" ? 'checked="checked"':'' ) + ' value="postroll"/><i></i><b>Post roll</b></label>\
                                       <label class="radioBox"><input type="radio" ' + ( callToAction[timeIndex].time != "preroll" && callToAction[timeIndex].time != "postroll" ? 'checked="checked"':'' ) + ' name="callToactionTime_' + callToAction[timeIndex].time + '" value="customtime"/><i></i><b class="annotation_seconds_b ' + ( callToAction[timeIndex].time == "postroll" || callToAction[timeIndex].time == "preroll"? 'disabled':'' ) + '">\
                                           <input type="hidden" class="annotation_seconds" value="' + callToAction[timeIndex].time + '">\
                                           <div class="inputDigital"><div class="field">\
                                                <input placeholder="00:00:00" class="annotation_second_input annotation_input_keyup" value="' + ( callToAction[timeIndex].time != "preroll" && callToAction[timeIndex].time != "postroll"? callToAction[timeIndex].time : '00:00:00' )+ '">\
                                           </div><div class="buttons">\
                                                <a class="annotation_seconds_increase"><i class="icon-chevron-up"></i></a><a class="annotation_seconds_decrease"><i class="icon-chevron-down"></i></a>\
                                           </div></div>\
                                       </b></label>\
                                   </div><span class="annotationError"></span></div>\
                                </div>';
                timelineElement.html(timelineHtm);
                annotationBlock.append(timelineElement);
            }
            selectObjectCallToAction.html(selectHtml);
            addAnnoButton.after(selectObjectCallToAction);
        }

        if((buildType == "start_end" || buildType == "chapter" || buildType == "all")){
            var start_endBlock = $('.timelineElement[data-type="start_end"]');
            var endField = start_endBlock.find("input[name='end_at']");
            if(chapters.length){
                var chaptersSelectHtml = "<select>";
                chaptersSelectHtml += "<option value=''>-- Select chapter --</option>";
                for(var c = 0; c < chapters.length; c++){
                    chaptersSelectHtml += "<option value='" + chapters[c].value.title + "'>" + chapters[c].value.title + "</option>";
                }
                chaptersSelectHtml += "</select>";
                start_endBlock.find(".start_end_select_wrap").empty().html(chaptersSelectHtml);
                start_endBlock.removeClass("start_end_select_wrap_no_chapter");
            } else {
                start_endBlock.find(".start_end_select_wrap").empty()
                start_endBlock.addClass("start_end_select_wrap_no_chapter");
            }

            var startField = start_endBlock.find("input[name='start_at']");
            var startSelect = start_endBlock.find(".start_wrap select");
            var endField = start_endBlock.find("input[name='end_at']");
            var endSelect = start_endBlock.find(".end_wrap select");

            start_endBlock.find(".annotation_field").removeClass("disabled");
            if(typeof start_end != "undefined"){

                if(typeof start_end.start != "undefined"){
                    if(start_end.start.type == "chapter" && startSelect.find("option[value='" + start_end.start.name + "']").length){
                        startSelect.val(start_end.start.name);
                        start_endBlock.find(".start_wrap .annotation_field").addClass("disabled");
                    } else if (start_end.start.type == "second"){
                        startField.val(secondsToHMS(start_end.start.second));
                    }
                } else {
                    startField.val("00:00:00");
                    startSelect.val("");
                }

                if(typeof start_end.end != "undefined"){
                    if(start_end.end.type == "chapter" && endSelect.find("option[value='" + start_end.end.name + "']").length){
                        endSelect.val(start_end.end.name);
                        endField.val(secondsToHMS(videoFileDuration));
                        start_endBlock.find(".end_wrap .annotation_field").addClass("disabled");
                    } else if (start_end.end.type == "second"){
                        endField.val(secondsToHMS(start_end.end.second));
                    }
                } else {
                    endField.val(secondsToHMS(videoFileDuration));
                    endSelect.val("");
                }
            } else {
                startField.val("00:00:00");
                endField.val(secondsToHMS(videoFileDuration))
            }
        }

        if(buildType == "all"){
            if(isVR){
                $(".vr_input").prop("checked", true)
            }
        }

        var firstActivation = true;

        var selectAnnotationsArray = [{select:selectObjectChapters,text:'Edit Chapters'},{select:selectObjectAnnotations, text:'Edit existing annotations'}, {select:selectObjectCallToAction,text:'Edit Call To Action'}]
        for(var i = 0 ; i < selectAnnotationsArray.length; i++){
            if(typeof selectAnnotationsArray[i].select != "undefined"){
                selectAnnotationsArray[i].select.ddslick('destroy').ddslick({
                    selectText: selectAnnotationsArray[i].text,
                    onSelected: function (data) {
                        var type = $(data.original).attr("data-type");
                        if (!firstActivation) {
                            if(type == "annotation"){
                                var ddSelected = $("#edit_annotation .dd-selected-text");
                                var annType = ddSelected.parent().prev().val().split("_")[1];
                                var text = $("#edit_annotation").data("ddslick").selectedData.text;
                                var timeText = text.substr(text.indexOf("["));
                                var titleText = stripHtml(text.substr(0,text.indexOf("[")));
                                ddSelected.html("<i class='icon-annotation-" + annType + "'></i><span class='dd-option-text-left'>" + titleText + "</span><span class='dd-option-text-right'>" + timeText + "</span>");
                                var guidFull = $("#edit_annotation").data("ddslick").selectedData.value;
                                var guidType = guidFull.split("_")[1];
                                var guid = guidFull.split("_")[0];
                                if(guidType != "timeline" && !$("#edit_annotation").data("ddslick").updateTime){
                                    var time = timeText.replace("[","").replace("]","")
                                    _this.player.setCurrentTime(hmsToSecondsOnly(time));
                                }
                                $("#edit_annotation").data("ddslick").updateTime = false;
                                setTimeout(function(){
                                    var annElem = $("#" + new_guid).find("[data-guid='" + guid + "']")
                                    _this.selectAnnotationItem(guid, annElem, true);
                                }, 1000)
                            } else if (type == "calltoaction"){
                                var ddSelected = $("#edit_calltoaction .dd-selected-text");
                                var text = $("#edit_calltoaction").data("ddslick").selectedData.text;
                                var timeText = text.substr(text.indexOf("["));
                                var titleText = stripHtml(text.substr(0,text.indexOf("[")));
                                ddSelected.html("<span class='dd-option-text-left'>" + titleText + "</span><span class='dd-option-text-right'>" + timeText + "</span>");
                                var time = timeText.replace("[","").replace("]","")
                                if(time == "preroll")
                                    _this.player.pause();
                                else if(time == "postroll")
                                    _this.player.setCurrentTime(videoFileDuration + 1 );
                                else
                                    _this.player.setCurrentTime(hmsToSecondsOnly(time));
                            }
                            var dataTime = data.selectedData.value;
                            $('.timelineElement[data-guid][data-type="' + type + '"]').hide().removeClass("active");
                            $('.timelineElement[data-guid="' + dataTime.split("_")[0] + '"][data-type="' + type + '"]').show().addClass("active");;

                            $('.timelineBlock[data-type="' + type + '"] .addAnnotations').hide();
                            if (data.selectedIndex == 0) {
                                $('.timelineBlock[data-type="' + type + '"] .addTimelineBtn').show();
                                return false;
                            } else {
                            }
                            if(type == 'chapter'){
                                _this.player.setCurrentTime(hmsToSecondsOnly(dataTime));
                                _this.player.play();
                                _this.player.pause();
                            }
                        } else {
                            if(type == "annotation"){
                                if($("#edit_annotation [value='NoAnnotations']").length){
                                    $("#edit_annotation ul li:last-child").remove();
                                    $("#edit_annotation ul").append("<p>no annotation</p>")
                                }
                                $("#edit_annotation .dd-option-text").each(function(i){
                                    if(i==0) return true;
                                    var type = $(this).prev().val().split("_")[1];
                                    var timeText = $(this).text().substr($(this).text().indexOf("["));
                                    var titleText = stripHtml($(this).text().substr(0,$(this).text().indexOf("[")));
                                    $(this).html("<i class='icon-annotation-" + type + "'></i><span class='dd-option-text-left'>" + titleText + "</span><span class='dd-option-text-right'>" + timeText + "</span>")
                                })
                            } else if(type == "calltoaction"){
                                if($("#edit_calltoaction [value='NoAnnotations']").length){
                                    $("#edit_calltoaction ul li:last-child").remove();
                                    $("#edit_calltoaction ul").append("<p>no Call to action</p>")
                                }
                                $("#edit_calltoaction .dd-option-text").each(function(i){
                                    if(i==0) return true;
                                    var timeText = $(this).text().substr($(this).text().indexOf("["));
                                    var titleText = stripHtml($(this).text().substr(0,$(this).text().indexOf("[")));
                                    $(this).html("<span class='dd-option-text-left'>" + titleText + "</span><span class='dd-option-text-right'>" + timeText + "</span>")
                                })
                            }
                        }
                    }
                });
            }
        }

        firstActivation = false;
    }

    this.checkTimelineTimes = function (type, start, end) {
        var error = false;
        if (!start.match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/) && start != "preroll" && start != "postroll") {
            error = "invalid time";
            return error;
        }

        if(start != "postroll" && start != "preroll")
            start = hmsToSecondsOnly(start);
        if(typeof end != "undefined"){
            if (!end.match(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/)) {
                error = "invalid time";
                return error;
            }
            end = hmsToSecondsOnly(end);
            if(end < start){
                error = "Start time must be lower than end time";
                return error;
            }
            if(start > videoFileDuration || end > videoFileDuration){
                error = "time exceed video duration";
                return error;
            }
        }
        return error;
    }
    var errorState;
    this.createTimelineObj = function(container, annotationType, params, newAnnotation) {
        if(typeof params[annotationType] == "undefined")
            params[annotationType] = {}
        var addsec = container.find('.annotation_seconds').val();
        if(annotationType == "chapter"){
            params[annotationType][addsec] = {
                'title': container.find('.annotation_title').val(),
                'desc': container.find('.annotation_description').val()
            } ;
            if(_this.checkTimelineTimes(annotationType, addsec))
                errorState = _this.checkTimelineTimes(annotationType, addsec);
        } else if (annotationType == "annotation") {
            var addType = container.find('.addAnnotationType').val();
            var addFont;
            if(addType == "title" || addType == "spotlight"){
                addFont = container.find('.annotation_font_big').val();
            } else {
                addFont = container.find('.annotation_font_small').val();
            }

            if(typeof params[annotationType][addsec] == "undefined" ) params[annotationType][addsec] = [];
            var obj = {
                'desc' : container.find('.annotation_description').val(),
                'type': addType,
                'width' : container.find('.annotation_width').val(),
                'height' : container.find('.annotation_height').val(),
                'font' : addFont,
                'color' : container.find('.annotation_color').val(),
                'fontStyle': container.find('.annotation_font_style').val()
            };
            obj['guid'] = container.attr("data-guid");
            if(addType != "title"){
                obj.bgcolor = container.find('.annotation_bg_color').val();
            }

            if(container.find('.annotation_enable_link').is(":checked")){
                obj.link = container.find('.annotation_link').val();
                obj.blank = container.find('.annotation_link_blank').is(":checked");
                if(container.find('.annotation_link_tooltip').is(":checked") && addType == "label" || addType == "title" || addType == "note" || addType == "spotlight"){
                    obj.tooltip = true;
                    obj.tooltipColor = container.find('.annotation_tooltip_color').val();
                    obj.tooltipBgColor = container.find('.annotation_tooltip_bg_color').val();
                }
            }

            if(addType != "timeline"){
                obj.left = container.find('.annotation_left').val();
                obj.top = container.find('.annotation_top').val();
                obj.end = container.find('.annotation_seconds_end').val();
            }
            if(addType == "spotlight"){
                obj.left_sp = container.find('.annotation_left_sp').val();
                obj.top_sp = container.find('.annotation_top_sp').val();
                obj.width_sp = container.find('.annotation_width_sp').val();
                obj.height_sp = container.find('.annotation_height_sp').val();
            }

            params[annotationType][addsec].push(obj);
            if(addType != "timeline"){
                if(_this.checkTimelineTimes(annotationType, addsec, container.find('.annotation_seconds_end').val()))
                    errorState = _this.checkTimelineTimes(annotationType, addsec , container.find('.annotation_seconds_end').val());
            } else {
                if(_this.checkTimelineTimes(annotationType, addsec))
                    errorState = _this.checkTimelineTimes(annotationType, addsec);
            }
            if(newAnnotation)
                lastCreatedAnnotationIndex = container.attr("data-guid");

        } else if (annotationType == "calltoaction"){
            params[annotationType][addsec] = {
                'desc': container.find('.annotation_description').val(),
                'link': container.find('.annotation_link').val()
            };
            if(_this.checkTimelineTimes(annotationType, addsec))
                errorState = _this.checkTimelineTimes(annotationType, addsec);
            if(newAnnotation)
                lastCreatedCtaIndex = secondsToHMS(_videoCurrentTime);
        } else if (annotationType == "start_end"){
            var start = hmsToSecondsOnly(container.find('input[name="start_at"]').val());
            var end = hmsToSecondsOnly(container.find('input[name="end_at"]').val());
            var startSelectVal = "", endSelectVal = "";
            if(container.find('.start_wrap select').length){
                startSelectVal = container.find('.start_wrap select').val();
            }
            if(container.find('.end_wrap select').length){
                endSelectVal = container.find('.end_wrap select').val();
            }
            if(startSelectVal){
                if(_this.chapterExist(params["chapter"], startSelectVal))
                    params[annotationType]['start'] = {type: "chapter", name: startSelectVal}
            } else if(start > 0){
                params[annotationType]['start'] = {type: "second", second: start}
            }

            if(endSelectVal){
                if(_this.chapterExist(params["chapter"], endSelectVal))
                    params[annotationType]['end'] = {type: "chapter", name: endSelectVal}
            } else if(end < videoFileDuration && end > start){
                params[annotationType]['end'] = {type: "second", second: end}
            }

            if($.isEmptyObject(params[annotationType])){
                delete params[annotationType];
            }
        } else if (annotationType == "isVR"){
            var isVR = $(".vr_input").is(":checked");
            if(isVR){
                params[annotationType] = isVR;
            } else {
                if(typeof params[annotationType] != "undefined"){
                    delete params[annotationType];
                }
            }
        }
        return params;
    }

    this.chapterExist = function(chapters, name){
        var exist = false;
        for(var chapter in chapters){
            if(chapters[chapter].title == name){
                exist = true;
                break;
            }
        }

        return exist;
    }

    this.saveAddTimeLine = function (rid, action, annotationType, updateDropdown) {
        var _this = this, params = {};
        var annotations = $('.boxMetaEditor .annotations');
        var addAnnotations = $('.timelineBlock[data-type="' + annotationType + '"] .addAnnotations');
        var addAnnotationBtn = $('.timelineBlock[data-type="' + annotationType + '"] .addAnnotationBtn');
        if (action == 'save') {
            params = _this.createTimelineObj(addAnnotations, annotationType, params, true);
        }

        annotations.find('.timelineElement').each(function () {
            var type = $(this).attr("data-type");
            params = _this.createTimelineObj($(this), type, params);
        });
        if (errorState && action != "delete") {
            var isError = errorState;
            errorState = false;
            return isError;
        }
        if(action == "delete"){
            $(".addAnnotationButton").removeClass("disabled");
        }
        errorState = false;
        _this.libraryArea.find('.headRight .saving').removeClass('success error').text('');
        _this.libraryArea.find('.headRight .saving').addClass('processing').show().text('Saving...');
        var proxyParams = $.extend(true,{}, params);
// remove guid fom array, to not send in json
        if(typeof params.annotation != "undefined"){
            for(var an in params.annotation ){
                for(var i = 0 ; i < params.annotation[an].length; i++){
                    delete params.annotation[an][i]['guid']
                }
            }
        }
        $.ajax({
            type: 'POST',
            url: '/media-platform/wizard2/library_ajax.aspx',
            data: {
                cmd: 'set_timeline',
                rid: rid,
                timeline: JSON.stringify(params)
            },
            dataType: 'json',
            success: function (res) {
                if(annotationType === "chapter") {
                    $(document).trigger("updateChapterEvent", {
                        timeline: JSON.stringify(params)
                    });
                }
                _this.libraryArea.find('.headRight .saving').removeClass('processing').text('');
                _this.libraryArea.find('.headRight .saving').addClass('success').text('All changes saved.');
                clearTimeout(_this.showMessageTimer)
                _this.showMessageTimer = setTimeout(function () {
                    _this.libraryArea.find('.headRight .saving.success').hide();
                }, 5000);
                annotationTemp = orderByTime(proxyParams.annotation);
                _this.showAnnotationBox(_videoCurrentTime , true);
                ctaTemp = orderByTime(proxyParams.calltoaction);
                _this.showCta(_videoCurrentTime);

                _this.mediaItems[rid].timeline = JSON.stringify(params);
                if(updateDropdown && action == 'update') return;
// var timeLine = proxyParams;
                var annotations = $('.timelineBlock[data-type="' + annotationType + '"] .annotations');
                if($('.timelineBlock[data-type="' + annotationType + '"] .addTimelineBtn').parent().hasClass("dd-container"))
                    $('.timelineBlock[data-type="' + annotationType + '"] .addTimelineBtn').parent().siblings(".dd-container").remove();
                else
                    $('.timelineBlock[data-type="' + annotationType + '"] .addTimelineBtn').siblings(".dd-container").remove();
                annotations.html('');
                addAnnotations.find('.annotatio_submit_btn').addClass('disabled');
                addAnnotations.find('input,textarea').val('');
                if(annotationType == "calltoaction"){
                    addAnnotations.find('input[type="radio"][value="customtime"]').prop("checked", true);
                    addAnnotations.find('.annotation_seconds_b').removeClass("disabled");
                }
                addAnnotations.hide();
                addAnnotationBtn.show();
                _this.buildTimeLineHtml(proxyParams, annotationType);
                _this.attachTimelineEvents();
                _this.callColorPicker();
                $('.timelineBlock[data-type="' + annotationType + '"] .addTimelineBtn').show();

                if(updateDropdown && action == 'save'){
                    if(annotationType != "calltoaction"){
                        var ind = $('#edit_annotation .dd-option-value[value^="' + lastCreatedAnnotationIndex + '"]').closest("li").index();
                        $('#edit_annotation').ddslick('select', {index: ind });
                    } else {
                        var ind = $('#edit_calltoaction .dd-option-value[value^="' + lastCreatedCtaIndex + '"]').closest("li").index();
                        $('#edit_calltoaction').ddslick('select', {index: ind });
                    }

                }
            },
            error: function () {
//showMessage('red', errorMessage);
            }
        });
        return false;
    }

    this.drawAnnotationBox = function(options){
        var that = this;
        var mainWrap = $("#" + new_guid);
        var type = options.type;
        var container = mainWrap.find(".ze_annotation_placeholder");
        if(type != "timeline"){
            var containerDiv = $("<div>");
            containerDiv.addClass('ze-annotation ze-annotation-' + type);
            containerDiv.attr("id", 'ze-annotation_' + new_guid + '_' + options.guid).attr("data-guid", options.guid).attr("data-time", options.time);
            var containerDivContent = $("<div>");
            containerDivContent.addClass('ze-annotation-text');
            if(type != "spotlight")
                containerDivContent.html(options.desc);
            containerDiv.css({
                'top': options.top + "%",
                'left': options.left + "%",
                'width': options.width + "%",
                'height': options.height + "%",
                'color': options.color.replace("0x", "#"),
                'font-size': options.font
            })
            containerDiv.on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                that.selectAnnotationItem(options.guid, $(this), false);
            });
            if (type == "label") {
                containerDiv.addClass("ze-annotation-label-off");
                containerDiv.on("mouseover",function () {
                    $(this).removeClass("ze-annotation-label-off")
                });

                containerDiv.on("mouseout",function () {
                    $(this).addClass("ze-annotation-label-off")
                });

                if (options.bgcolor) {
                    containerDiv.css("border-color", options.bgcolor.replace("0x", "#"));
                    containerDivContent.css("background-color", options.bgcolor.replace("0x", "#"));
                }
            } else if(type == "title"){
                if (options.color) {
                    containerDiv.css("border-color", options.color.replace("0x", "#"));
                }
            } else if (type == "note") {
                var opacityDiv = $("<div>").addClass("ze-annotation-opacity");
                if (options.bgcolor) {
                    containerDiv.css("border-color", options.bgcolor.replace("0x", "#"));
                    opacityDiv.css("background-color", options.bgcolor.replace("0x", "#"));
                }
                containerDiv.append(opacityDiv);
            } else if (type == "spotlight"){
                if (options.bgcolor) {
                    containerDiv.css("border-color", options.bgcolor.replace("0x", "#"));
                }
                var spotlightTitle = $("<div>").addClass('ze-annotation').addClass('ze-spotlight-title').attr("data-guid", options.guid).attr("data-connected", options.guid);
                spotlightTitle.css({
                    'top': options.top_sp + "%",
                    'left': options.left_sp + "%",
                    'width': options.width_sp + "%",
                    'height': options.height_sp + "%",
                    'color': options.color.replace("0x", "#"),
                    'font-size': options.font,
                    'display': 'none'
                });

                spotlightTitle.append("<span class='ann_resize_dott top_left ui-resizable-handle ui-resizable-nw'></span>");
                spotlightTitle.append("<span class='ann_resize_dott top_right ui-resizable-handle ui-resizable-ne'></span>");
                spotlightTitle.append("<span class='ann_resize_dott bottom_left ui-resizable-handle ui-resizable-sw'></span>");
                spotlightTitle.append("<span class='ann_resize_dott bottom_right ui-resizable-handle ui-resizable-se'></span>");
                var spotlightTitleContent = $("<div>");
                spotlightTitleContent.addClass('ze-annotation-text');
                spotlightTitleContent.html(options.desc);
                spotlightTitle.append(spotlightTitleContent)
                container.append(spotlightTitle);

                spotlightTitle.on("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.selectAnnotationItem(options.guid, containerDiv, false);
                });

                containerDiv.on("mouseover",function () {
                    spotlightTitle.css("display", "block")
                }).on("mouseout",function () {
                    spotlightTitle.css("display", "none")
                });

                this.initResizeableAndDraggable(spotlightTitle, options);
            }

            var textCont = type == "spotlight" ? spotlightTitle: containerDivContent;
            if(options.fontStyle == "bold"){
                textCont.css("font-weight","bold");
            } else if (options.fontStyle == "shadow"){
                textCont.css("font-weight","bold");
                textCont.css("text-shadow","1px 1px 3px rgba(0,0,0,0.6)");
            } else if (options.fontStyle == "italic"){
                textCont.css("font-style","italic");
            } else if (options.fontStyle == "underline"){
                textCont.css("text-decoration","underline");
            }
            if (options.link) {
                var link = options.link;
                var blank = options.link ? "_blank" : "";
                var annotationLink = $("<i>");
                annotationLink.addClass("ze-annotation-icon");
                containerDiv.css("cursor","pointer");
                if (options.tooltip) {
                    var tooltip = $("<span>");
                    tooltip.addClass('ze-annotation-tooltip');
                    tooltip.text(link);
                    if (typeof options.tooltipColor != "undefined")
                        tooltip.css('color', options.tooltipColor.replace("0x", "#"));
                    if (typeof options.tooltipBgColor != "undefined")
                        tooltip.css("background-color", options.tooltipBgColor.replace("0x", "#"));
                    containerDivContent.on("mouseover",function () {
                        $(this).next().css("display", "inline-block");
                    });
                    containerDivContent.on("mouseout",function () {
                        $(this).next().css("display", "none");
                    });
                }
            }
            containerDiv.append(containerDivContent);
            if (tooltip)
                containerDiv.append(tooltip);
            if (annotationLink)
                containerDiv.append(annotationLink);
            containerDiv.append("<span class='ann_resize_dott top_left ui-resizable-handle ui-resizable-nw'></span>");
            containerDiv.append("<span class='ann_resize_dott top_right ui-resizable-handle ui-resizable-ne'></span>");
            containerDiv.append("<span class='ann_resize_dott bottom_left ui-resizable-handle ui-resizable-sw'></span>");
            containerDiv.append("<span class='ann_resize_dott bottom_right ui-resizable-handle ui-resizable-se'></span>");
            this.initResizeableAndDraggable(containerDiv, options);
            container.css("display", "block");
            container.append(containerDiv);
        }
    }

    this.removeAnnotationBox = function(guid){
        var elem = $(".ze-annotation[data-guid='" + guid + "']");
        if (elem.length) {
            elem.remove();
        }
    }

    this.showAnnotationBox = function(second, redraw){
        if(redraw){
            $(".ze_annotation_placeholder").empty();
            this.drawTimelineAnnotationBox(true);
        }
        for (var a in annotationTemp) {
            for (var ind = 0; ind < annotationTemp[a].value.length; ind++) {
                var elem = $(document.getElementById("ze-annotation_" + new_guid + "_" + annotationTemp[a].value[ind].guid));
                if (hmsToSecondsOnly(annotationTemp[a].time) <= second && hmsToSecondsOnly(annotationTemp[a].value[ind].end) >= second){
                    if (!elem.length && annotationTemp[a].value[ind].type != "timeline") {
                        var options = annotationTemp[a].value[ind];
                        options.time = annotationTemp[a].time;
                        options.index = ind;
                        this.drawAnnotationBox(options);
                    }
                } else {
                    if (elem.length) {
                        this.removeAnnotationBox(annotationTemp[a].value[ind].guid)
                    }
                }
            }
        }
        if(currentEditingAnnotation){
            $("#" + new_guid).find("[data-guid='" + currentEditingAnnotation + "']").addClass("ze-selected-annotation");
        }
    }

    this.drawTimelineAnnotationBox = function(redraw){
        var mainWrap = $("#" + new_guid);
        var contW = mainWrap.find(".mejs-container").width();
        var contH = mainWrap.find(".mejs-container").height();
        var timeRial = mainWrap.find(".mejs-time-rail");
        var timeTotal = mainWrap.find(".mejs-time-total");
        var timeRialwidth = timeTotal.width();
        if(redraw) {
            timeRial.find(".tl_annotation_section").remove();
        }
        var controls = mainWrap.find(".mejs-controls");
        for (var a in annotationTemp) {
            for (var ind = 0; ind < annotationTemp[a].value.length; ind++) {
                if (annotationTemp[a].value[ind].type != "timeline") continue;
                var time = annotationTemp[a].time;
                var bgColor = annotationTemp[a].value[ind].bgcolor.replace("0x", "#");
                var color = annotationTemp[a].value[ind].color.replace("0x", "#");
                var fontSize = annotationTemp[a].value[ind].font;
                var duration = videoFileDuration;
                var width = contW * parseInt(annotationTemp[a].value[ind].width) / 100;
                var height = contH * parseInt(annotationTemp[a].value[ind].height) / 100;
                var timePxSize = timeRialwidth / duration;
                var text = annotationTemp[a].value[ind].desc;
                var tlIcon = $("<i>").addClass("ze-annotation-icon");
                var sectionLeft = parseInt(hmsToSecondsOnly(time)) * timePxSize;
                var sectionInfo = $("<div>").addClass("ze_tl_annotation_title").html(text);
                if(annotationTemp[a].value[ind].fontStyle == "bold"){
                    sectionInfo.css("font-weight","bold");
                } else if (annotationTemp[a].value[ind].fontStyle == "shadow"){
                    sectionInfo.css("font-weight","bold");
                    sectionInfo.css("text-shadow","1px 1px 3px rgba(0,0,0,0.6)");
                } else if (annotationTemp[a].value[ind].fontStyle == "italic"){
                    sectionInfo.css("font-style","italic");
                } else if (annotationTemp[a].value[ind].fontStyle == "underline"){
                    sectionInfo.css("text-decoration","underline");
                }
                sectionInfo.css("font-size", fontSize)
                var tlSection = $("<div>");
                tlSection.addClass("tl_annotation_section").attr("data-time", time).attr("data-guid", annotationTemp[a].value[ind].guid).css({"background-color": bgColor, left: sectionLeft + "px"});
                var tlSectionInner = $("<div>");
                tlSectionInner.addClass("tl_section_annotation_info").css({"background-color": bgColor, "color": color, "width": width + "px", "height": height + "px"});
                tlSectionInner.append(sectionInfo);
                tlSectionInner.append(tlIcon);
                tlSection.append(tlSectionInner);
                timeRial.prepend( tlSection );
                tlSection.on("click", function(){
                    _this.selectAnnotationItem($(this).attr("data-guid"), $(this), false);

                })
                tlSectionInner.append("<span class='ann_resize_dott top_left ui-resizable-handle ui-resizable-nw'></span>");
                tlSectionInner.append("<span class='ann_resize_dott top_right ui-resizable-handle ui-resizable-ne'></span>");
                tlSectionInner.append("<span class='ann_resize_dott bottom_left ui-resizable-handle ui-resizable-sw'></span>");
                tlSectionInner.append("<span class='ann_resize_dott bottom_right ui-resizable-handle ui-resizable-se'></span>");
                _this.initTimelineAnnotationResizable(tlSectionInner, tlSection.attr("data-guid"));
            }
        }
    }

    this.initTimelineAnnotationResizable = function(elem, guid){
        var that = this;
        elem.resizable({
            handles: {
                ne: '.top_right'
            },
            resize: function( event, ui ){

                var contW = $("#" + new_guid).find(".mejs-container").width();
                var contH = $("#" + new_guid).find(".mejs-container").height();
                that.selectAnnotationItem(guid, elem.parent(), false);
                var width = ui.size.width;
                var height = ui.size.height;
                var widthPrc = (width * 100/ contW).toFixed(3);
                var heightPrc = (height * 100/ contH).toFixed(3);
                var timelineElement = $(".timelineElement[data-guid='" + guid + "']");
                timelineElement.find(".annotation_width").val(widthPrc);
                timelineElement.find(".annotation_height").val(heightPrc);
                that.startTimer();
            }
        });
    }

    this.initResizeableAndDraggable = function (elem, options){
        var that = this;

        var posInd = options.guid;
        elem.resizable({
            containment: "#" + new_guid + " .ze_annotation_placeholder",
            handles: {
                ne: '.top_right',
                se: '.bottom_right',
                sw: '.bottom_left',
                nw: '.top_left'
            },
            resize: function( event, ui ){
                var contW = $("#" + new_guid).find(".mejs-container").innerWidth();
                var contH = $("#" + new_guid).find(".ze_annotation_placeholder").innerHeight();
                that.selectAnnotationItem(posInd, elem, false);
                var width = ui.size.width;
                var height = ui.size.height;
                var left = ui.position.left;
                var top = ui.position.top;
                var leftPrc = (left * 100/ contW).toFixed(3);
                var topPrc = (top * 100/ contH).toFixed(3);
                var widthPrc = (width * 100/ contW).toFixed(3);
                var heightPrc = (height * 100/ contH).toFixed(3);
                var timelineElement = $(".timelineElement[data-guid='" + posInd + "']");
                if(elem.hasClass("ze-spotlight-title")){
                    timelineElement.find(".annotation_left_sp").val(leftPrc);
                    timelineElement.find(".annotation_top_sp").val(topPrc);
                    timelineElement.find(".annotation_width_sp").val(widthPrc);
                    timelineElement.find(".annotation_height_sp").val(heightPrc);
                } else {
                    timelineElement.find(".annotation_left").val(leftPrc);
                    timelineElement.find(".annotation_top").val(topPrc);
                    timelineElement.find(".annotation_width").val(widthPrc);
                    timelineElement.find(".annotation_height").val(heightPrc);

                }

                that.startTimer();
            }
        });

        elem.draggable({
            containment: "#" + new_guid + " .ze_annotation_placeholder",
            drag: function( event, ui ) {
                var contW = $("#" + new_guid).find(".mejs-container").innerWidth();
                var contH = $("#" + new_guid).find(".ze_annotation_placeholder").innerHeight();
                var timelineElement = $(".timelineElement[data-guid='" + posInd + "']");
                that.selectAnnotationItem(posInd, elem, false);
                var left = ui.position.left;
                var top = ui.position.top;
                if(elem.hasClass("ze-annotation-spotlight")){
                    if(typeof elem.attr("data-top") != "undefined" && typeof elem.attr("data-left") != "undefined"){
                        var movedTop = ui.position.top - elem.attr("data-top");
                        var movedLeft = ui.position.left - elem.attr("data-left");
                        var connectedElem = $(".ze-annotation[data-connected='" + posInd + "']");
                        var leftSp = Math.max(connectedElem.position().left + movedLeft, 0) ;
                        var topSp = Math.max(connectedElem.position().top + movedTop,0);
                        leftSp = leftSp + connectedElem.innerWidth() < contW ? leftSp : contW - connectedElem.innerWidth();
                        topSp = topSp + connectedElem.innerHeight() < contH ? topSp: contH - connectedElem.innerHeight();
                        connectedElem.css("top", topSp + "px");
                        connectedElem.css("left", leftSp + "px");
                        var leftPrcSp = (leftSp * 100/ contW).toFixed(3);
                        var topPrcSp = (topSp * 100/ contH).toFixed(3);
                        timelineElement.find(".annotation_left_sp").val(leftPrcSp);
                        timelineElement.find(".annotation_top_sp").val(topPrcSp);
                    }
                    elem.attr("data-top", ui.position.top);
                    elem.attr("data-left", ui.position.left)
                }
                var leftPrc = (left * 100/ contW).toFixed(3);
                var topPrc = (top * 100/ contH).toFixed(3);

                if(elem.hasClass("ze-spotlight-title")){
                    timelineElement.find(".annotation_left_sp").val(leftPrc);
                    timelineElement.find(".annotation_top_sp").val(topPrc);
                } else {
                    timelineElement.find(".annotation_left").val(leftPrc);
                    timelineElement.find(".annotation_top").val(topPrc);
                }

                that.startTimer();
            }
        });
    }
    this.selectAnnotationItem = function(posInd, elem, notDropdown){
        if(_this.player){
            _this.player.pause();
        }
        if(!$("li.set_annotations").hasClass("active"))
            $("li.set_annotations").trigger("click");
        if(!elem.hasClass("ze-selected-annotation")){
            $(".ze-selected-annotation").removeClass("ze-selected-annotation");
            currentEditingAnnotation = elem.attr("data-guid");
            elem.addClass("ze-selected-annotation");
            if(elem.hasClass("ze-annotation-spotlight")){
                $(".ze-spotlight-title[data-guid='" + posInd + "']").addClass("ze-selected-annotation");
            }
        }
        if(!notDropdown){
            var ind = $('#edit_annotation .dd-option-value[value^="' + posInd + '"]').closest("li").index();
            if($('#edit_annotation').data("ddslick").selectedIndex != ind){
                $('#edit_annotation').data("ddslick").updateTime = true;
                $('#edit_annotation').ddslick('select', {index: ind});
            }

        }

    }

    var resizeAndDragTimer;
    this.startTimer = function(){
        clearTimeout(resizeAndDragTimer);
        resizeAndDragTimer = setTimeout(function(){
            _this.saveAddTimeLine(currentEditingItemID, "update", "annotation", true);
        }, 1500)
    }

    this.showCta = function (second){
        _this.hideCta();
        for (var ind = 0; ind < ctaTemp.length; ind++) {
            var time = ctaTemp[ind].time == "preroll" || ctaTemp[ind].time == "postroll" ? ctaTemp[ind].time : hmsToSecondsOnly(ctaTemp[ind].time);
            if (time == second) {
                try {
                    _this.player.pause();
                } catch (ex) { }
                var options = {
                    time: ctaTemp[ind].time,
                    text: ctaTemp[ind].value.desc,
                    link: ctaTemp[ind].value.link
                }
                _this.drawCta(options);
                break;
            }
        }
    }

    this.drawCta = function (options){
        var that = this;
        var mainWrap = $("#" + new_guid);
        var container = mainWrap.find("#ze_htmloverlay_placeholder_" + new_guid);
        that.hideCta();
        var closeBtn = $("<a>").text("X").addClass("ze_overlay_close_btn").addClass("ze_overlay_close_cta");
        container.append(closeBtn);
        closeBtn.on("click" ,function (e) {
            e.preventDefault();
            that.hideCta(true);
        });
        container.attr("data-time", options.time);
        var containerDiv = $("<div>").addClass('ze_overlay_container_div');
        var containerDivContent = $("<div>").addClass('ze_overlay_container_div_content');
        var overlay = $("<div>").addClass('ze_cta_cont');
        var overLayText = $("<div>").attr("id", "ze_cta_text").html(options.text)
            .on("click" ,function () {
                if(options.link)
                    window.open(options.link, "_blank");
            })
        overlay.append(overLayText);
        containerDivContent.append(overlay);
        containerDiv.append(containerDivContent);
        container.css("display","block");
        container.append(containerDiv);
    }

    this.hideCta = function(play){
        var mainWrap = $("#" + new_guid);
        var container = mainWrap.find("#ze_htmloverlay_placeholder_" + new_guid);
        if (container) {
            container.html("");
            container.css("display", "none");
        }
        if(play) _this.player.play();
    }

    this.keepOnlyChapter = function(timeline){
        if(timeline == undefined || timeline == null)
            return undefined;
        eval('var tO = ' + decodeXMl(timeline));
        if (typeof tO.calltoaction != "undefined") {
            delete tO.calltoaction;
        }
        if (typeof tO.annotation != "undefined") {
            delete tO.annotation;
        }
        return JSON.stringify(tO)
    }


    /* helper to get analytics on scroll */
    _this.analyticsOnScroll = function () {
        var items = $(".library-line.video, .library-line.music").not(".loaded");
        items.each(function () {
            if (isElementVisible($(this))) {
                var rid = $(this).attr('data-rid');
                var drid = $(this).attr('data-drid');
                var options = new Array();
                options['m'] = 'hits-urls';
                options['p'] = 'lw';
                options['type'] = 'min';
                $(this).addClass("loaded");
//_this.getGalleries(rid);
                _this.getAnalytics(rid, drid, options);
                if($(this).hasClass("video")){
                    playStoryBoard(rid, $(this))
                }

            }
        });
    }
    /*show hide other actions block */
    this.showHideOhterActions = function () {
        if ($('.selected  .input_class_checkbox:checked', _this.libraryContainer).length) {
            _this.copyDeleteBlock.show();
            _this.searchBlock.hide();
        } else {
            _this.copyDeleteBlock.hide();
            _this.searchBlock.show();
        }
    }

    this.uploadThumb = function (file, uploadUrl) {
        if ($.inArray(file.type, ['image/gif', 'image/png', 'image/jpeg', 'image/jpg', 'image/bmp']) == -1) {
            alert('invalid extension of image!');
            $("#upload_thumb_btn").replaceWith($("#upload_thumb_btn").clone());
            return false;
        }
        var uploadInfo = {file: file, uploadState: 'Pending', percentComplete: 0, index: 0};
        var xhr = new XMLHttpRequest();
        var eventSource = xhr.upload || xhr;
        xhr.open('POST', uploadUrl, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    _this.DrawThumbs();
                    $("#upload_thumb_btn").replaceWith($("#upload_thumb_btn").clone());
                    browse_upload_thumb_limit--;
                    if (browse_upload_thumb_limit == 0) {
                        $("#upload_thumb_btn").prop('disabled', true);
                        $("#upload_thumb_files .uploadBtn").css("opacity", "0.5");
                    }

                    browse_extra_files_limit--;
                    if (browse_extra_files_limit == 0) {
                        $("#upload_extrafile_btn").prop('disabled', false);
                        $("#extra_files .uploadBtn").css("opacity", "1");
                    }
                } else {
                    console.log("Error", xhr.statusText);
                }
            }
        }
        eventSource.onprogress = onUploadThumbProgress(uploadInfo);
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.setRequestHeader('X-FILE-NAME', encodeURIComponent(file.name));
        uploadInfo.xhr = xhr;
        xhr.send(file);
    }
}

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }
    return size;
};

//return object with filesize and unit
function fileSizeConvertor(bytes, type, fixed) {
    var returnObj = new Object();
    if (bytes == -1) {
        returnObj.filesize = 'Unlimited';
        returnObj.unit = '';
        return returnObj;
    }
    if (typeof fixed == 'undefined') {
        fixed = 1;
    }

    var filesize, i, unit, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (typeof type == 'undefined' || type == null) {
        i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    } else {
        i = $.inArray(type, sizes);
    }
    if (bytes == 0) {
        filesize = 0;
        unit = type == null ? '' : type;
    }
    else {
        filesize = bytes / Math.pow(1024, i);
        unit = sizes[i];
    }
    if (filesize > 10) {
        fixed = 0;
    }
    filesize = filesize.toFixed(fixed);

    returnObj.filesize = filesize;
    returnObj.unit = unit;
    return returnObj;
}
/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stripHtml (str){
    var $div= $('<div>').html(str);
    if($div.children().length){
        return "(HTML Code)"
    }else{
        return str
    }
}

function timeValueHelper(timevalue, plus, step, maxValue) {
    var splicedValue = timevalue.split(':');
    var hour, minute, second;
    step = step || 1;
    if (splicedValue.length == 3) {
        hour = parseInt(splicedValue[0]);
        minute = parseInt(splicedValue[1]);
        second = parseInt(splicedValue[2]);
    } else {
        hour = 0;
        minute = parseInt(splicedValue[0]);
        second = parseInt(splicedValue[1]);
    }
    if (plus) {
        second += step;
        if (second >= 60) {
            second = 0;
            minute++;
            if (minute > 60) {
                hour++;
                minute = 0;
            }
        }
    } else {
        second -= step;
        if (second < 0) {
            second = 59;
            minute--;
            if (minute < 0) {
                minute = 59;
                hour--;
                if (hour < 0)
                    hour = 0;
            }
        }

    }
    if (hour < 10)
        hour = '0' + hour;
    if (minute < 10)
        minute = '0' + minute;
    if (second < 10)
        second = '0' + second;
    return hour + ':' + minute + ':' + second;
}
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function decodeXMl(string) {

    var escaped_one_to_xml_special_map = {
        '&amp;': '&',
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>'
    };
    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
        function (str, item) {
            return escaped_one_to_xml_special_map[item];
        });
}

function orderByTime(timeline) {
    var newOrderedArray = [];
    if(typeof timeline == "undefined") return newOrderedArray;
    for (var i in timeline) {
        if(timeline[i] instanceof Array){
            var value = [];
            for(var j = 0; j < timeline[i].length; j++){
                value.push(timeline[i][j])
            }
        } else {
            value = timeline[i];
        }
        newOrderedArray.push({time: i, value: value});
    }
    newOrderedArray.sort(function (a, b) {
        return hmsToSecondsOnly(a.time) - hmsToSecondsOnly(b.time);
    })
    return newOrderedArray;

}

function hmsToSecondsOnly(str) {
    if(!str) return "";
    if(str == "preroll")
        return -1;
    if(str == "postroll")
        return videoFileDuration + 1;
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

function guidGenerator() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function secondsToMS(value) {
    var sec_num = parseInt(value, 10); // don't forget the second param
    var minutes = Math.floor(sec_num / 60);
    var seconds = sec_num - (minutes * 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = minutes + ':' + seconds;
    return time;
}

function  secondsToHMS(value) {
    var sec_num = parseInt(value, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
}

function selectText(element) {
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;
    if (doc.body.createTextRange) { //ms
        range = doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) { //all others
        selection = window.getSelection();
        range = doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}


function isElementVisible(elem)
{
    var pos = $(elem).offset(),
        wX = $(window).scrollLeft(), wY = $(window).scrollTop(),
        wH = window.innerHeight, wW = $(window).width(),
        oH = $(elem).outerHeight(), oW = $(elem).outerWidth();
// partial visible
    if (((pos.left <= wX && pos.left + oW > wX) ||
        (pos.left >= wX && pos.left <= wX + wW)) &&
        ((pos.top <= wY && pos.top + oH > wY) ||
            (pos.top >= wY && pos.top <= wY + wH)))
        return true;
    else // not visible
        return false;
}

function character_limit(obj, txt, character_val) {
    var error_mess_box = '';
    if (txt.length > character_val)
        error_mess_box = '<span class="galState status error" data-status="error"><i></i><b>Error</b><b class="hint">Error</b></span>';

    $(obj).after('<div class="character_error_box">' + error_mess_box + ' ' + (character_val - txt.length) + ' Characters Left</div>');
}

function onUploadProgress(uploadInfo) {
    $('#extra_files .status_text').html('<p>Uploading...</p>');
}

function onUploadSubtitleProgress(uploadInfo) {
    $('.uploadSubtitleBtn span').text('Uploading...');
    $('.uploadSubtitleBtn').css("pointer-events", "none");
}

function onUploadThumbProgress(uploadInfo) {
    $(".posterGroup.posterUploadedImages .postersContainer").append('<div class="thumbImage" style="position:relative">Loading...</div>');
}

function trackAndGo(action) {
    _gaq.push(['_trackEvent', 'assets page', action]);
}

function nFormatter(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'g';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num;
}

function simple_domain(url) {
    var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    if (matches)
        return matches[1];
    else
        return url;
}
// month names
var month = new Array();
month['01'] = "Jan";
month['02'] = "Feb";
month['03'] = "Mar";
month['04'] = "Apr";
month['05'] = "May";
month['06'] = "Jun";
month['07'] = "Jul";
month['08'] = "Aug";
month['09'] = "Sep";
month['10'] = "Oct";
month['11'] = "Nov";
month['12'] = "Dec";
function specialTypeDate(string) {
    var date = string.split("-");
    var dateObj = new Object();
    dateObj.year = date[0];
    dateObj.month = month[date[1]];
    dateObj.monthNum = date[1];
    dateObj.day = date[2];
    return dateObj;
}
function compareNumeric(a, b) {
    return b - a;
}
function objectSize(obj, exclude) {
    var size = 0, key;
    if (typeof exclude !== undefined) {
        for (key in obj) {
            if (obj.hasOwnProperty(key) && key.indexOf(exclude) == -1)
                size++;
        }
    } else {
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
    }
    return size;
}

function readablizeBytes(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    var retValue = bytes / Math.pow(1024, i);
    retValue = retValue.toFixed(1);
    return retValue + ' ' + sizes[i];
}

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
    }
};

function detectRatio (w , h){
    if(w === "" || h === "") return "";
    function gcd (a, b) {
        return (b == 0) ? a : gcd (b, a%b);
    }
    var r = gcd (w, h);
    return w/r + ":" + h/r
}

function resyncAsset(rid){
    _this.libraryArea.find('.headRight .saving').removeClass('success error').text('');
    _this.libraryArea.find('.headRight .saving').addClass('processing').show().text('Resyncing...');
    var url = "/media-platform/api/api_json.aspx?cmd=asset.resync&api_token=session&rid=" + _this.getUrlVars()['details'];
    $.ajax({
        url: url,
        dataType: "json",
        success: function(){
            var url;
            var params = "cache=never&library_name=recently_updated&search=" + _this.getUrlVars()['details'];
            $.ajax({
                type: 'GET',
                url: '/media-platform/wizard2/library_ajax.aspx',
                data: 'cmd=get_library&' + params,
                dataType: 'json',
                success: function (res) {
                    var item = res.d.response.items[0];
                    var versions_htm = _this.buildVersionsHtm(item);
                    $(".versions_file_box").empty().html(versions_htm);
                    _this.libraryArea.find('.headRight .saving').removeClass('processing').text('');
                    _this.libraryArea.find('.headRight .saving').addClass('success').text('Done.');
                    clearTimeout(_this.showMessageTimer);
                    _this.showMessageTimer = setTimeout(function () {
                        _this.libraryArea.find('.headRight .saving.success').hide();
                    }, 5000);
                },
                error: function () {
                }
            });
        }
    })
}

// tags plugin
(function ($) {
    $.fn.buildTagsList = function (params) {
        var that = this, searchInput;
        function createHtml() {
            var existingTags = params.tagsInput.val();
            var alreadyExistingTags = existingTags.split(",");
            var htm = '<div class="itemsDropdown_items" style="display:none">'
                + '<div class="searchInput"><input type="text" /><p style="display:none"><span class="searchInputNew"></span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="searchInputCreate">(Create tag)</span></p></div>'
                + '<ul>';
            for (var i = 0; i < allTags.length; i++) {
                if (allTags[i] != "" && allTags[i] != "no-tag")
                    htm += '<li><div class="selected"><label class="checkBox"><input type="checkbox" value="' + allTags[i] + '" ' + (alreadyExistingTags.indexOf(allTags[i]) > -1 ? " checked" : "") + '><i></i><b></b></label></div><div class="descr"><a>' + allTags[i] + '</a></div></li>'
            }
            htm += '</ul>'
                + '</div>'
                + '<div class="itemsDropdown_head">'
                + '<a class="btn primary smallest tagsListBtn" href="#" style="display: inline-block;">Apply</a>'
                + '</div>';
            var elem = $('<div class="itemsDropdown tagsList">').html(htm);
            elem.insertAfter(that);
            searchInput = elem.find(".searchInput input");
            searchInputCreate = elem.find(".searchInput .searchInputCreate");
            elem.on("click", ".descr", function(){
                var checkbox = $(this).prev().find(":checkbox");
                if(checkbox.prop("checked") == true){
                    checkbox.prop("checked", false);
                } else {
                    checkbox.prop("checked", true);
                }
            })
        }

        this.off("click.buildTagsList").on("click.buildTagsList", function () {
            if (!$(this).hasClass("listActivated")) {
                createHtml();
                $(this).addClass("listActivated");
                var tagsListBtn = $(this).next().find(".tagsListBtn");
                tagsListBtn.on("click", function (e) {
                    var tagsList = $(this).parents(".tagsList");
                    var selectedTags = [];
                    tagsList.find(".selected input[type='checkbox']:checked").each(function () {
                        selectedTags.push($(this).val());
                    })
                    pastTagsTo(params.tagsElement.prev(), selectedTags);
                    $('.selectTags.active').removeClass('active');
                    $('.itemsDropdown.tagsList ').hide();
                    return false;
                })

                var keyupTimer;
                searchInput.off("keyup").on("keyup", function (e) {
                    var text = $(this).val();
                    var existingTags = params.tagsInput.val();
                    var alreadyExistingTags = existingTags.split(",");
                    if (e.which == 13) {
                        addSingleTag(params.tagsElement, text);
                        return;
                    }
                    clearTimeout(keyupTimer);
                    var timer = typeof e.originalEvent == "undefined" ? 0 : 400;
                    keyupTimer = setTimeout(function(){
                        var li = "";
                        searchInput.parent().find(".searchInputNew").text(text);
                        if(text != "")
                            searchInput.parent().find("p").show();
                        else
                            searchInput.parent().find("p").hide();
                        var filtered = false;
                        for (var j = 0; j < allTags.length; j++) {
                            if (allTags[j] != "" && allTags[j] != "no-tag"){
                                if(allTags[j].toLowerCase().indexOf(text.toLowerCase()) > -1){
                                    filtered = true;
                                    li += '<li><div class="selected"><label class="checkBox"><input type="checkbox" value="' + allTags[j] + '" ' + (alreadyExistingTags.indexOf(allTags[j]) > -1 ? " checked" : "") + '><i></i><b></b></label></div><div class="descr"><a>' + allTags[j] + '</a></div></li>';
                                } else{
                                    li += '<li style="display:none"><div class="selected"><label class="checkBox"><input type="checkbox" value="' + allTags[j] + '" ' + (alreadyExistingTags.indexOf(allTags[j]) > -1 ? " checked" : "") + '><i></i><b></b></label></div><div class="descr"><a>' + allTags[j] + '</a></div></li>';
                                }
                            }
                        }
                        if (filtered) {
                            searchInput.parents(".itemsDropdown_items").next(".itemsDropdown_head").show();
                        } else {
                            searchInput.parents(".itemsDropdown_items").next(".itemsDropdown_head").hide();
                        }
                        searchInput.parents(".itemsDropdown_items").find("ul").html(li);
                    },timer)

                });

                searchInputCreate.on("click", function () {
                    addSingleTag(params.tagsElement, $(this).prev().text());
                });
            } else {
                searchInput.val("").trigger("keyup");
            }
            if (allTags.length) {
                $(this).next(".tagsList").find(".itemsDropdown_head").removeClass("forcehide");
            } else {
                $(this).next(".tagsList").find(".itemsDropdown_head").addClass("forcehide");
            }
            var clicked = $(this);
            showHidePopups(clicked, clicked.next());
            $(".searchInput input").focus();
            return false;
        })

        if(_this.assetEditor.is(":visible")){
            _this.assetEditor.off("click.selectTags").on("click.selectTags", function (e) {
                if (!$(e.target).hasClass("selectTags") && !$(e.target).hasClass("tagsList") && !$(e.target).parents(".tagsList").length) {
                    $('.selectTags.active').removeClass('active');
                    $('.itemsDropdown.tagsList').hide();
                }
            })
        }


        function addSingleTag(element, tag) {
            if(allTags.indexOf(tag) === -1)
                allTags.push(tag);
            var bufferedTags = [];
            bufferedTags.push(tag)
            var insertedId = element.attr('id');
            insertedId = insertedId.replace("_tagsinput", '');

            var alltext = element.find('.tag');
            var exitingTags = '';

            for (var j = 0; j < alltext.length; j++) {
                var text = ($(alltext[j]).find("span").text()).trim();
                exitingTags += text + ',';
            }
            for (var j = 0; j < bufferedTags.length; j++) {
                if (!$('#' + insertedId).tagExist(bufferedTags[j])) {
                    var text = bufferedTags[j].replace(/^\s+|\s+$/g, '');
                    exitingTags += text + ',';
                }
            }

            $("#" + insertedId).importTags(exitingTags);
            searchInput.val("").trigger("keyup");
        }

        function pastTagsTo(element, bufferedTags) {
            var insertedId = element.attr('id');
            insertedId = insertedId.replace("_tagsinput", '');
            $("#" + insertedId).importTags(bufferedTags.join(","));
            searchInput.val("").trigger("keyup");
        }

    }
})(jQuery);

/* numInput */
(function ($) {
    $.fn.numInput = function (params) {

        var increaseBtn = params.increaseBtn;
        var decreaseBtn = params.decreaseBtn;
        var inputField = params.inputField;
        var type = params.type;
        var cbTimer;

        if(typeof params.init === "function"){
            params.init($(this));
        }

        function clickHandler(plusOrMinus, step){
            var initialValue = inputField.val();
            var newValue, newValueForCompare;
            if(type === "second"){
                var newValue = timeValueHelper(initialValue, plusOrMinus, step);
                var newValueForCompare = hmsToSecondsOnly(newValue);
            }

            if(typeof params.maxValue === "function"){
                if(newValueForCompare > params.maxValue()){
                    return;
                }
            }

            if(typeof params.minValue === "function"){
                if(newValueForCompare < params.minValue()){
                    return;
                }
            }

            inputField.val(newValue).trigger("change");

            if(params.cbDelay && typeof params.callbackWithDelay === "function"){
                clearTimeout(cbTimer);
                cbTimer = setTimeout(function(){
                    params.callbackWithDelay(newValue);
                }, params.cbDelay)
            }

            if(typeof params.afterChange === "function"){
                params.afterChange(newValue)
            }
        }

        if(params.mouseHold && typeof requestAnimationFrame === "function"){
//requestAnimationFrame(watcher);
            var nextTime=0;
            var step = 0;
            var mouseHoldDelay = 200;
            var coefficient = 1.05;

            increaseBtn.mousedown(function(e){handleMouseDown(e, true);});
            increaseBtn.mouseup(function(e){handleMouseUp(e);});
            increaseBtn.mouseout(function(e){handleMouseUp(e);});
            decreaseBtn.mousedown(function(e){handleMouseDown(e, false);});
            decreaseBtn.mouseup(function(e){handleMouseUp(e);});
            decreaseBtn.mouseout(function(e){handleMouseUp(e);});

            function handleMouseDown(e, plOrMinus){
                e.preventDefault();
                e.stopPropagation();
                step = plOrMinus ? 1 : -1;
                nextTime = 0;
                mouseHoldDelay = 200;
                requestAnimationFrame(watcher)
            }

            function handleMouseUp(e, plOrMinus){
                e.preventDefault();
                e.stopPropagation();
                step = 0;
            }

            function watcher(time){
                if(step === 0) return ;
                requestAnimationFrame(watcher);
                if(time<nextTime){return;}
                nextTime = time + mouseHoldDelay;
                mouseHoldDelay = Math.max(30, Math.ceil(mouseHoldDelay/coefficient));
                if(step === 1){
                    clickHandler(true, 1);
                } else {
                    clickHandler(false, 1);
                }

            }
        } else {
            increaseBtn.off("click.increase").on("click.increase", function(){
                clickHandler(true , 1)
            });

            decreaseBtn.off("click.decrease").on("click.decrease", function(){
                clickHandler(false, 1)
            });
        }

    }
})(jQuery);

function uploadSubtitleFile(file, uploadUrl, lang, lang_full) {
    $(".subtitle-error-msg").remove();
    var ext = file.name.split(".")[file.name.split(".").length - 1];
    var subtitleExtensions = ["srt", "sbv", "sub", "mpsub", "lrc", "cap", "rt", "vtt", "ttml", "dfxp"];
    if(subtitleExtensions.indexOf(ext) === -1){
        var span  = $("<span class='subtitle-error-msg'>").css({
            color: "red",
            "font-size": "12px",
            "text-align": "center",
            "margin-top": "8px",
            "display": "block",
            "clear": "both"
        }).text("The file your are uploading doesn't have valid subtitle format").insertAfter($(".subtitles_cancel_btn"));
        setTimeout(function(){
            span.remove();
        }, 3000)
        return;
    }


    var uploadInfo = {file: file, uploadState: 'Pending', percentComplete: 0, index: 0};
    var xhr = new XMLHttpRequest();
    var eventSource = xhr.upload || xhr;
    xhr.open('POST', uploadUrl, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resId = xhr.responseText.substr(xhr.responseText.indexOf("id") + 3).split(" ")[0];
            $('.uploadSubtitleBtn span').text('Complete');
            setTimeout(function () {
                $('.uploadSubtitleBtn span').text('Choose File');
                $('.uploadSubtitleBtn').css("pointer-events", "auto");
            }, 2000);

            _this.updateExtraFiles();


            $("#upload_subtitles_button").replaceWith($("#upload_subtitles_button").clone());
            $('.selectbox').show();
            $('.addSubtitleBlock').addClass("cp-hide");
            $('#languages .dd-option-selected').removeClass("dd-option-selected");
            $('#languages .dd-options li:first-child a').addClass("dd-option-selected");
            $('#languages').find(".dd-selected")
                .html( '<div style="position: relative;"><i class="icon-search"></i><input id="search_language" class="field" type="text" name="search_language" value="" placeholder="Start typing ..."></div>');
            $('#languages ul.dd-options li:not(:first-child)').show()
            $('.chooseAnother').show();
        }
    }
    eventSource.onprogress = onUploadSubtitleProgress(uploadInfo);
    xhr.setRequestHeader("Content-Type", "multipart/form-data");
    xhr.setRequestHeader('X-FILE-NAME', encodeURIComponent(file.name));
    uploadInfo.xhr = xhr;
    xhr.send(file);
}

var player;
var cincopa = cincopa || {};
cincopa.registeredFunctions = cincopa.registeredFunctions || [];
cincopa.registeredFunctions.push(
    {
        "func": function (name, data, gallery) {
            gallery.args.iframe = false
        },
        "filter": "runtime.on-args"
    }
);


function thumbnailVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-thumbnail", data);
    openModal(html, 500, 300);
}

function startVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-start", data);
    openModal(html, 500, 300);
}

function emailVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-email", data);
    openModal(html, 500, 300);
}

function callToActionVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-call-to-action", data);
    openModal(html, 500, 300);
}

function annotationsVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-annotations", data);
    openModal(html, 500, 300);
}

function infoVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-info", data);
    openModal(html, 500, 300);
}

function chaptersVideo() {
    var data = {};
    var html =  tmpl("tmpl-explainer-for-chapters", data);
    openModal(html, 500, 300);
}


