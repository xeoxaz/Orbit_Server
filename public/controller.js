$(()=>{
    var socket = io("http://192.168.1.51:2163");
    socket.on("connect", () => {
        socket.emit('_type', "web");

        const url = new URL(window.location.href);
        const hostname = url.hostname;
        socket.emit('_hostname', hostname);

        $('#status').html(`
            <p>Currently <b>connected</b> to Space Command.</p>
            <p>Connected clients: <b id='count'>...</b></p>
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

            $(`#${user.socket_id}`).append(`
                <legend>${user.hostname} <div class='ping'></div></legend>
                <p><b>Type</b>: ${user.type}</p>
            `);

            if(user.type == "web"){
                // Browser info maybe?
            }else{
                $(`#${user.socket_id}`).append(`
                    <hr>
                `);
                if(user.system){
                    $(`#${user.socket_id}`).append(`
                        <p><b>Motherboard</b>: ${user.system.motherboard}</p>
                        <p><b>CPU</b>: ${user.system.cpu}</p>
                        <p><b>Ram</b>: ${user.system.ram}</p>
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