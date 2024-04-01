$(()=>{
    var socket = io("http://192.168.1.51:2163");
    socket.on("connect", () => {
        socket.emit('_type', "web");

        socket.emit('_hostname', `${isMobileDevice()} (${getDeviceInfo()})`);
        socket.emit('_browser', `${getBrowserType()}`);

        $('#status').html(`
            <p>Currently <b>connected</b> to <span id='server_name'>...</span></p>
            <p>Connected clients: <b id='count'>...</b></p>
        `);
    });

    socket.on('_host',(_hostname)=>{
        $('#server_name').html(`${_hostname}`);
    });

    socket.io.on("reconnect_attempt",(count)=>{
        var t = "";
        for(var i = 0; i < count; i++){
            if(i > 3){
                t = "";
            }
            t += ".";
        }
        $('#status').html(`
            <p style='color: yellow;'>Trying to reconnect${t}</p>
        `);
    });

    socket.io.on("reconnect_failed", ()=>{
        $('#status').html(`
            <p style='color: red;'>..Failed to reconnect.</p>
        `);
    });

    socket.on("disconnect",()=>{
        $('#status').html(`
            <p style='color: red;'>..Connection lost</p>
        `);
    });

    //
    // get ping
    //
    socket.io.on('ping', ()=>{
        socket.emit('_pong', Math.floor(new Date().getTime() / 1000));
    });

    socket.on('_connected', (_connected)=>{
        $('#count').html(`${_connected.length}`);
        $('#users').html("");
        _connected.forEach(user => {
            $('#users').append(`
                <fieldset id='${user.socket_id}'>

                </fieldset>
            `);

            // added, self identify
            var me = "";
            if(socket.id == user.socket_id){
                me = "<p>This is <b>you</b>.</p>"
            }
            $(`#${user.socket_id}`).append(`
                <legend>${user.hostname} <div class='ping'></div></legend>
                ${me}
                <p><b>Type</b>: ${user.type}</p>
            `);

            if(user.type == "web"){
                $(`#${user.socket_id}`).append(`
                    <p><b>Browser</b>: ${user.browser}</p>
                `);
            }else{
                $(`#${user.socket_id}`).append(`
                    <hr>
                `);
                if(user.system){

                    var ecc = `No`;
                    if(user.ecc){
                        ecc = `Yes`;
                    }

                    $(`#${user.socket_id}`).append(`
                        <p><b>Motherboard</b>: ${user.system.motherboard}</p>
                        <p><b>CPU</b>: ${user.system.cpu}</p>
                        <p><b>Ram</b>: ${user.system.ram}</p>
                        <p>⇶ <b>Ecc</b>: ${ecc}</p>
                    `);
                }else{
                    $(`#${user.socket_id}`).append(`
                        <p>System Info: <b>Loading..</b></p>
                    `);
                }
            }

            if(user.ping){
                $(`#${user.socket_id} .ping`).html(`
                    <p style='color: aqua'>${user.ping}</p>ms
                `);
            }
        });
    });

    //
    // ping server for updates
    //
    setInterval(() => {
        socket.emit('_connected');
    }, 5000);
});

function getBrowserType() {
    const userAgent = navigator.userAgent.toLowerCase(); // Normalize to lowercase

    if (userAgent.includes('opr/') || userAgent.includes('.opr/')) {
        return 'Opera';
    } else if (userAgent.includes('edg')) {
        return 'Microsoft Edge';
    } else if (userAgent.includes('chrome') || userAgent.includes('chromium') || userAgent.includes('crios')) {
        return 'Google Chrome';
    } else if (userAgent.includes('firefox') || userAgent.includes('fxios')) {
        return 'Mozilla Firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) { // Exclude Chrome
        return 'Apple Safari';
    } else if (userAgent.includes('trident') || userAgent.includes('msie')) { // More reliable IE detection
        return 'Microsoft Internet Explorer';
    } else if (userAgent.includes('ucbrowser')) {
        return 'UC Browser';
    } else if (userAgent.includes('samsungbrowser')) {
        return 'Samsung Browser';
    } else {
        return 'Unknown browser';
    }
}

function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.match(/iPhone/i)) { 
        return "iPhone";
    } else if (userAgent.match(/iPad/i)) {
        return "iPad";          
    } else if (userAgent.match(/Android/i)) {
        return "Android";
    } else {
        return "Unknown"; 
    }
}

function isMobileDevice() {
    var md = (/Android|iPhone|iPad|iPod|Windows Phone/i).test(navigator.userAgent); 
    if (md) {
        return "Mobile";
    } else {
        return "Desktop"
    }
}