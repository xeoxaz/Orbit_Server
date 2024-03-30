$(()=>{
    var socket = io("http://192.168.1.51:2163");
    socket.on("connect", () => {
        socket.emit('_type', "web");

        const url = new URL(window.location.href);
        const hostname = url.hostname;
        socket.emit('_hostname', hostname)

        $('#status').html(`
            <p>Currently <b>connected</b> to Space Command.</p>
        `);
    });

    socket.on('_connected', (_connected)=>{
        $('#users').html("");
        $('#users').append(`
            <fieldset>
                <legend>Connected</legend>
                <p>There are <b>${_connected.length}</b> currently connected.</p>
            </fieldset>
        `)
        _connected.forEach(user => {
            $('#users').append(`
                <fieldset id='${user.socket_id}'>

                </fieldset>
            `);

            if(user.type == "web"){
                $(`#${user.socket_id}`).append(`
                    <legend>${user.hostname}</legend>
                    <p><b>Socket</b>: ${user.socket_id}</p>
                    <p><b>Type</b>: ${user.type}</p>
                `);
            }else{
                $(`#${user.socket_id}`).append(`
                    <legend>${user.hostname}</legend>
                    <p><b>Socket</b>: ${user.socket_id}</p>
                    <p><b>Type</b>: ${user.type}</p>
                    <hr>
                `);
                if(user.system){
                    $(`#${user.socket_id}`).append(`
                        <p><b>Motherboard</b>: ${user.system.motherboard}</p>
                        <p><b>CPU</b>: ${user.system.cpu}</p>
                    `);
                }else{
                    $(`#${user.socket_id}`).append(`
                        <p>System Info: <b>Loading..</b></p>
                    `);
                }
            }
        });
    });

    setInterval(() => {
        socket.emit('_connected');
    }, 5000);
});