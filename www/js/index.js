/*
 * CrashSpaceStatus main logic
 */

var statusurl = 'https://crashspacela.com/sign/?output=json';
// var statusurl = 'https://crashspacela.com/sign-tst/?output=json&debug=false';
// var statusurl = 'https://crashspacela.com/sign-tst/?output=json';
var fetchInterval = 15 * 1000;

var app = {
    fetchTimer: null,
    startFetching: function() {
        var self = this;
        self.getResponse(); // start it off without delay
        if( !self.fetchTimer ) {
            self.fetchTimer = setInterval( self.getResponse.bind(self), fetchInterval );
        }
    },
    stopFetching: function() {
        var self = this;
        clearInterval( self.fetchTimer );
        self.fetchTimer = null;
    },
    // initialized: false,
    handleResponse: function(response,data) {
        console.log("handleResponse success! is_open:", response.is_open, " minutes_left:", response.minutes_left);

        $("#is_open").text("is_open: " + response.is_open) ;
        $("#minutes_left").text("minutes_left: " +response.minutes_left);

        var lastMsg = response.button_presses[0];  // FIXME: check this
        var lastDate = new Date(lastMsg.date);
        var lastDateOff = new Date( lastDate.getTime() + (lastMsg.diff_mins_max * 60*1000) );
        var lastDateOffStr = DateFormat.format.date( lastDateOff, "hh:mm a d-MMM");
        var mins_ago = Math.abs(Math.round( (new Date() - lastDateOff) / (60*1000) ));

        if( data != null &&  // it was a button press by us
            (response.minutes_left != lastMsg.diff_mins_max) ) {  // if they don't match something's wrong
                console.log("OOOPS");
            $('#errorMsg').text("Oops: Couldn't update button! Are you at the space?").show();
        } else {
            $('#errorMsg').text('').hide();
        }

        $("#lastMsgInfo").show();
        $("#lastMsg").text( lastMsg.msg );
        $("#lastMsgId").text( lastMsg.id );
        $("#lastMsgDate").text( lastDateOffStr );

        console.log("lastMsg:",lastMsg.msg, ",", lastMsg.id, ",", lastMsg.date, "mins_ago:",mins_ago);
        if( response.is_open ) {
            var timeleftstr = mins_ago + " minutes left";
            $("#status").text( "OPEN" );
            $("#alertbg").removeClass("alert-warning").addClass("alert-success");
            $("#lastMsgTimeLeft").text( );
        } else {
            var timeleftstr = mins_ago + " minutes ago";
            if( mins_ago > 100 ) {
                timeleftstr = Math.floor( mins_ago/60 ) + " hours ago";
            }
            $("#status").text( "CLOSED" );
            $("#alertbg").removeClass("alert-success").addClass("alert-warning");
            $("#lastMsgTimeLeft").text( timeleftstr );
        }
    },
    getResponse: function(url,data) {
        var self = this;
        url = url || statusurl; // default to just checking
        console.log('getResponse:',"url:",url);
        $.ajax({
            cache: false,
            url: statusurl,
            data: data,
            success: function(resp) { self.handleResponse.call(self,resp,data); },
            error: function(jqXHR, exception) {
                console.log("error:",jqXHR);
            }
        }); // use promises
    },
    // 'id=todbottest&msg=howdy+bub&debug=true&diff_mins_max=1&mins=1'
    updateStatus: function(msg, name, hours) {
        msg = msg || 'someone is here!';
        name = name || 'someone';
        hours = parseFloat(hours) || 1;
        var mins = Math.floor(hours * 60); // should be 60 normally
        var query_data = {
            msg: msg,
            id: name,
            diff_mins_max: mins
        };
        this.getResponse(statusurl,query_data);
    },

    // Application Constructor
    initialize: function() {
        var self = this;
        console.log("in initialize");

        document.addEventListener('deviceready', self.onDeviceReady.bind(self), false);
        document.addEventListener('pause', self.onPause.bind(self), false);
        document.addEventListener('resume', self.onResume.bind(self), false);

        $("#logo").click(function() {
            self.startFetching();
        });

        $("#messageSubmit").click(function() {
            console.log("messageSubmit");
            var msg = $("#inputMessage").val();
            var name = $("#inputName").val();
            var hours = $("#inputHours").val();
            console.log("vals:",msg,",",name,",",hours);
            self.updateStatus(msg, name, hours);
        });

        // FIXME: hack for testing
        // setTimeout( function() {self.getResponse();} , 1000 );
    },

    // 'deviceready' event handler
    onDeviceReady: function() {
        var self = this;
        console.log("onDeviceReady");
        StatusBar.overlaysWebView( true );
        StatusBar.backgroundColorByHexString('#ff00ff');
        StatusBar.styleDefault();

        self.startFetching();
    },
    // 'pause' Event Handler
    onPause: function() {
        var self = this;
        console.log("onPause");
        self.stopFetching();
    },
    // 'resume' event handler
    // see ios quirks on resume
    // https://cordova.apache.org/docs/en/latest/cordova/events/events.html
    onResume: function() {
        var self = this;
        setTimeout(function() {
            // TODO: do your thing!
            console.log("onResume");
            self.startFetching();
        }, 0);
    },
};

app.initialize();
