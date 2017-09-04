/*
 * CrashSpaceStatus main logic
 */

var statusurl = 'https://crashspacela.com/sign/?output=json';
// var statusurl = 'https://crashspacela.com/sign-tst/?output=json&debug=true';

var app = {
    // initialized: false,
    handleResponse: function(response) {
        console.log("handleResponse success! is_open:", response.is_open, " minutes_left:", response.minutes_left);

        $("#is_open").text("is_open: " + response.is_open) ;
        $("#minutes_left").text("minutes_left: " +response.minutes_left);

        var lastMsg = response.button_presses[0];  // FIXME: check this
        var lastDate = new Date(lastMsg.date);
        var lastDateOff = new Date( lastDate.getTime() + (lastMsg.diff_mins_max * 60*1000) );
        var lastDateOffStr = DateFormat.format.date( lastDateOff, "hh:mm a E d-MMM");

        $("#lastMsgInfo").show();
        $("#lastMsg").text( lastMsg.msg );
        $("#lastMsgId").text( lastMsg.id );
        $("#lastMsgDate").text( lastDateOffStr );

        var mins_ago = Math.round( (new Date() - lastDateOff) / (60*1000) );
        console.log("lastMsg:",lastMsg.msg, ",", lastMsg.id, ",", lastMsg.date, "mins_ago:",mins_ago);
        if( response.is_open ) {
            $("#status").text( "OPEN" );
            $("#alertbg").removeClass("alert-warning alert-danger").addClass("alert-success");
            $("#lastMsgTimeLeft").text( (-mins_ago) + " minutes left");
        } else {
            $("#status").text( "CLOSED" );
            $("#alertbg").removeClass("alert-warning alert-success").addClass("alert-danger");
            $("#lastMsgTimeLeft").text( mins_ago + " minutes ago");
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
            success: self.handleResponse,
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

        document.addEventListener('deviceready', self.onDeviceReady.bind(self), false);
        console.log("in initialize");

        $("#logo").click(function() {
            self.getResponse();
        });

        $("#getState").click(function(){
            console.log("click!");
            self.getResponse();
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
        setTimeout( function() {self.getResponse();} , 1000 );
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        var self = this;
        console.log("onDeviceReady");
        StatusBar.overlaysWebView( true );
        StatusBar.backgroundColorByHexString('#ff00ff');
        StatusBar.styleDefault();

        self.getResponse();

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();
