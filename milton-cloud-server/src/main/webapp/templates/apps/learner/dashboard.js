$(function() {
    initDashboard();
});


function initDashboard() {
    log("initDashboard");
    initPosts();
}

function initPosts() {    
    $.getJSON("/_postSearch?a", function(response) {
        log("got posts response", response);
        processPosts(response);
    });
}

function processPosts(comments) {
    $(".barList").html("");
    if( comments ) {
        comments.sort( dateOrd );
        for( i=0; i<comments.length; i++ ) {
            var comment = comments[i];
            log("processPost", comment);
            var dt = new Date(comment.date);
            displayPost(comment.user, dt, comment.notes, comment.contentTitle, comment.contentHref); // pageTitle and pagePath are only present for aggregated results
        }
    }
}

function displayPost(user, date, comment, pageTitle, pagePath) {   
    if( user == null ) {
        log("missing user, ignore");
        return;
    }
    log("displayPost",  user);
    var li = $("<li>");
    if( user.photoHref ) {
        li.append("<a class='profilePic' href='#'><img src='" + user.photoHref + "' alt='' /></a>");
    }
    li.append("<a class='user' href='#'>" + user.name + "</a> posted in <a class='module' href='" + pagePath + "'><span>" + pageTitle + "</span></a>");
    li.append("<p>" + comment + "</p>");
    li.append("<em>" + toDisplayDateNoTime(date) + "</em>");
    $(".barList").append(li);
            
//                <li>
//                    <a class="profilePic" href="#"><img src="/content/images/CarlBrown.jpg" alt="" /></a>
//                    <a class='user' href='#'>Carl Brown</a> posted in <a class='module' href='module'><span>module 8</span></a>
//                    <p>Lorem ipsum dolor sit amet, ultricies dui proin, eget aliquam tincidunt risus pede ullamcorper praesent...</p>
//                    <em>Today 3:34</em>
//                    <small>5 Comments</small>
//                </li>             
}