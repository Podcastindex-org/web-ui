var cgFeedSearchATO = null;
var cgFeedSearchXHR = null;
var cgFeedAppleSearchXHR = null;
var cgLastSearchString = "";

$(document).ready(function () {
    $(document).on('click', 'div#divSearch a.backButton', function () {
        var backHash = $(this).data('backhash');
        $('div#divSearch input.feedSearch').val(backHash);
        $('button.search').trigger('click');

        return false;
    });
    window.addEventListener("hashchange", function (e) {
        var backHash = $(this).data('backhash');
        $('div#divSearch input.feedSearch').val(backHash);
        $('button.search').trigger('click');
    })


    //Focus the feed search box
    $('div#divSearch input.feedSearch').focus();

    //Attach lookup handler to search box
    $(document).on('click', 'div#divSearch button.search', function () {
        var searchString = $('input.feedSearch').val();
        if (searchString === cgLastSearchString) return false;

        //Don't search for nothing
        if (isEmpty(searchString)) return false;

        searchForFeeds(searchString);
    });

    //Enter press on search box triggers search button
    $(document).on('keyup', 'div#divSearch input.feedSearch', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('button.search').trigger('click');
        }
    });

    //Attach get podcast info handler to episode title link
    $(document).on('click', 'div#divSearch a.openPodcastInfo', function () {
        var feedId = $(this).data('id');
        var feedUrl = $(this).data('url');
        var feedTitle = $(this).text();

        $('div#divMain span.feedDisplayTitle').text(feedTitle);
        getPodcastInfo(feedId, feedUrl);

        return false;
    });

    //Add feed handler
    $(document).on('click', 'div#divMain a.addFeed', function () {
        //Add a feed to the index
        bootbox.prompt({
            size: "large",
            title: "Add a podcast...",
            placeholder: "Podcast feed url",
            centerVertical: true,
            callback: function (result) {
                console.log(result);
                if (result !== null && result !== "") {
                    if (result.indexOf('http') !== 0) {
                        bootbox.alert("You must give the full feed address.");
                    } else {
                        console.log(result);
                        sendApiRequest('/api/1.0/add/byfeedurl', {url: result}, function (data) {
                            bootbox.alert(data.description);
                        });
                    }
                }
            }
        });

        return false;
    });
});

function searchForFeeds(searchString) {
    $('div#divMain span.feedDisplayTitle').empty();
    //Send a search request
    sendApiRequest('/api/1.0/search/byterm', {
        q: searchString
    }, function (data) {
        $('div.searchResults a.backButton').data('backhash', searchString);
        $('div.searchResults a.backButton').addClass('d-none');
        window.location.hash = 'sc-' + searchString;
        $('div.searchResults ul').empty();
        data.feeds.forEach(function (item, index, value) {
            $('div.searchResults ul').append('' +
                '<li class="list-unstyled podcast">' +
                '<img class="pull-left albumart" src="' + item.image + '">' +
                '<div class="subscribeBlock pull-right" style="text-align: right;">' +
                '<a class="subscribeBadge" target="_blank" href="' + item.url + '"><svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-rss-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">\n' +
                '  <path fill-rule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm1.5 2.5a1 1 0 0 0 0 2 8 8 0 0 1 8 8 1 1 0 1 0 2 0c0-5.523-4.477-10-10-10zm0 4a1 1 0 0 0 0 2 4 4 0 0 1 4 4 1 1 0 1 0 2 0 6 6 0 0 0-6-6zm.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>\n' +
                '</svg></a><br>' +
                '<a class="subscribeBadge" href="overcast://x-callback-url/add?url=' + item.url + '">' +
                '<img class="d-block d-sm-none" height=40 src="/images/overcast-button.png" alt="Subscribe in Overcast"></a>' +
                '</div>' +
                '<div class="pull-left infocard">' +
                '<h5><a class="openPodcastInfo" data-id="' + item.id + '" data-url="' + item.url + '" href="' + item.link + '">' + item.title + '</a></h5>' +
                '<p class="description">' + item.description + '</p>' +
                '</div>' +
                '<div style="clear:both">&nbsp;</div>' +
                '</li>'
            );
        });
        if (typeof data.feeds !== "object" || data.feeds.length === 0) {
            $('div.searchResults ul').append('<li class="list-unstyled">No results found</li>');
        }
    });

    return;
}

function getPodcastInfo(feedId, feedUrl) {
    //Send a search request
    sendApiRequest('/api/1.0/episodes/byfeedid', {
        id: feedId
    }, function (data) {
        window.location.hash = 'id-' + feedId;
        $('div.searchResults a.backButton').removeClass('d-none');
        $('div.searchResults ul').empty();
        window.scrollTo(0, 0);
        if (Array.isArray(data.items)) {
            data.items.forEach(function (item, index, value) {
                imageUrl = item.image;
                if (imageUrl === "" && item.feedImage !== "") imageUrl = item.feedImage;

                //Insert the html layout for the podcast episode
                $('div.searchResults ul').append('' +
                    '<li class="list-unstyled podcast" id="item' + item.id + '">' +
                    '<img class="pull-left albumart" src="' + imageUrl + '">' +
                    '<div class="subscribeBlock pull-right" style="text-align: right;">' +
                    '<small class="itemTime"><b>' + timeConverter(item.datePublished) + '</b></small><br>' +
                    '</div>' +
                    '<div class="pull-left infocard">' +
                    '<h5><a class="openEpisodeLink" target="_blank" href="' + item.link + '">' + item.title + '</a></h5>' +
                    '<p class="description">' + item.description + '</p>' +
                    '<div class="enclosurePlayer"></div>' +
                    '</div>' +
                    '<div style="clear:both">&nbsp;</div>' +
                    '</li>'
                );

                //Add the enclosure player controls to the previous episode
                var enclosurePlayer = '<audio controls preload="none"><source src="' + item.enclosureUrl + '" type="' + item.enclosureType + '"></audio>';
                if (isVideo(item.enclosureUrl, item.enclosureType)) {
                    enclosurePlayer = '<video controls preload="none"><source src="' + item.enclosureUrl + '" type="' + item.enclosureType + '"></video>';
                }
                $('div.searchResults ul li#item' + item.id + ' div.enclosurePlayer').append(enclosurePlayer);
            });
        }
        if (typeof data.items !== "object" || data.items.length === 0) {
            $('div.searchResults ul').append('<li class="list-unstyled">No episodes found</li>');
        }
    });

    return;
}

function sendApiRequest(endpoint, args, callback) {
    console.log(args);
    if (cgFeedSearchXHR !== null) {
        cgFeedSearchXHR.abort();
        cgFeedSearchXHR = null;
    }
    clearTimeout(cgFeedSearchATO);
    $('svg.loading').show();
    cgFeedSearchATO = setTimeout(function () {
        console.log(args);
        cgFeedSearchXHR = $.ajax({
            url: endpoint,
            type: 'GET',
            data: args,
            error: function (xhr, textStatus, errorThrown) {
                console.log(xhr);
                console.log(textStatus);
                console.log(errorThrown);
                if (endpoint === '/api/1.0/add/byfeedurl') {
                    if (xhr.status == 422 || xhr.status == 302) {
                        bootbox.alert("That feed already exists in the index.");
                    }
                }
                if (xhr.status == 400) {
                    bootbox.alert("Bad request.");
                }
                $('svg.loading').hide();
            },
            success: function (data) {
                $('svg.loading').hide();
                callback(data);
            }
        });

    }, 300);
}