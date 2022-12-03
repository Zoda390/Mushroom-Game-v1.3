var channel; //gecko server
var cc_map; //curent client map
var tileSize = 64; //rendered size of tiles
var player = {x: 0, y: 0, z: 5, hand: 1, id: 0, team: 0, hp: 100, mode: 's'}; //a quickhand for player info
var ui = {}; //an object that will store comonly used ui variables
var gameState = "Main_Menu"; //keeps track of what the client is currently doing
var musicplayer; //holds the html element responsible for playing music

var title_img;
//create the img_maps
var tile_img_map = [];
var item_img_map = [];
function preload(){
    tile_img_map.push(0);
    tile_img_map.push([loadImage("imgs/tiles/stone-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/grass-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/water-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/player-v1.png"), loadImage("imgs/tiles/player(left)-v1.png"), loadImage("imgs/tiles/player(back)-v1.png"), loadImage("imgs/tiles/player(right)-v1.png"), loadImage("imgs/tiles/playerOutline-v1.png"), loadImage("imgs/tiles/playerOutline(left)-v1.png"), loadImage("imgs/tiles/playerOutline(back)-v1.png"), loadImage("imgs/tiles/playerOutline(right)-v1.png"), loadImage("imgs/tiles/player2-v1.png"), loadImage("imgs/tiles/player2(left)-v1.png"), loadImage("imgs/tiles/player2(back)-v1.png"), loadImage("imgs/tiles/player2(right)-v1.png"), loadImage("imgs/tiles/player2Outline-v1.png"), loadImage("imgs/tiles/player2Outline(left)-v1.png"), loadImage("imgs/tiles/player2Outline(back)-v1.png"), loadImage("imgs/tiles/player2Outline(right)-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/wood-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/minion-v1.png"), loadImage("imgs/tiles/minion(left)-v1.png"), loadImage("imgs/tiles/minion(back)-v1.png"), loadImage("imgs/tiles/minion(right)-v1.png"), loadImage("imgs/tiles/minionOutline-v1.png"), loadImage("imgs/tiles/minionOutline(left)-v1.png"), loadImage("imgs/tiles/minionOutline(back)-v1.png"), loadImage("imgs/tiles/minionOutline(right)-v1.png"), loadImage("imgs/tiles/minion2-v1.png"), loadImage("imgs/tiles/minion2(left)-v1.png"), loadImage("imgs/tiles/minion2(back)-v1.png"), loadImage("imgs/tiles/minion2(right)-v1.png"), loadImage("imgs/tiles/minion2Outline-v1.png"), loadImage("imgs/tiles/minion2Outline(left)-v1.png"), loadImage("imgs/tiles/minion2Outline(back)-v1.png"), loadImage("imgs/tiles/minion2Outline(right)-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/crystal-base-v1.png")]);
    tile_img_map.push([loadImage("imgs/tiles/mushroom-log-v1.png")]);

    item_img_map.push(0);
    item_img_map.push(loadImage("imgs/items/stone-v1.png"));
    item_img_map.push(loadImage("imgs/items/grass-v1.png"));
    item_img_map.push(loadImage("imgs/items/water-v1.png"));
    item_img_map.push(loadImage("imgs/items/wood-v1.png"));
    item_img_map.push(loadImage("imgs/items/pickaxe.png"));

    title_img = loadImage("imgs/title.png");

    musicplayer = new MusicPlayer(['audio/music/copycat.wav']);
}

function setup(){
    //Stop contextmenu on right click
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    channel = geckos({ port: 3000 }); //conect gecko server to port

    //dealing with messages that the client gets
    channel.onConnect(error => {
        if (error) {
            console.error(error.message)
            return
        }

        //when you connect send the server a join message
        channel.emit('join', {id: channel.id});

        //when the server gives you the world data
        channel.on('give_world', data => {
            if(cc_map == undefined){ //only take the world if you don't already have it
                cc_map = new ClientMap("unUpdated", 0, 0);
                cc_map.name = data.name;
                cc_map.fromStr(data.str);
                player.y = floor(random(0, cc_map.tile_map.length-1));
                player.x = floor(random(0, cc_map.tile_map[player.y].length-1));
                player.z = 5;
                if(cc_map.tile_map[player.y][player.x][player.z] !== 0){
                    for(let i = cc_map.tile_map[player.y][player.x].length; i>player.z; i--){
                        if(cc_map.tile_map[player.y][player.x][player.z] === 0){
                            player.z = i;
                        }
                    }
                }
            }
            /*
            else{
                console.log(cc_map);
            }
            */
        })
        
        //change a block data = {x:int, y:int, z:int, to:str}
        channel.on('change', data => {
            if(data.to !== 0){
                //parse the str from data.to
                let tempArr = data.to.split('.');
                for(let i = 0; i < tempArr.length; i++){
                    if(parseInt(tempArr[i])+"" == tempArr[i]){
                        tempArr[i] = parseInt(tempArr[i]);
                    }
                }

                //use the type to create the right tile class
                if(tempArr[0] == 1){ //solid
                    cc_map.tile_map[data.y][data.x][data.z] = new ClientTile("solid", tile_name_map[tempArr[1]], tempArr[2], data.x, data.y, data.z);
                }
                else if(tempArr[0] == 2){ //liquid
                    cc_map.tile_map[data.y][data.x][data.z] = new ClientTile("liquid", tile_name_map[tempArr[1]], tempArr[2], data.x, data.y, data.z);
                }
                else if(tempArr[0] == 3){ //entity
                    cc_map.tile_map[data.y][data.x][data.z] = new ClientTileEntity("entity", "player", tempArr[2], data.x, data.y, data.z, tempArr[4], tempArr[5]);
                    cc_map.tile_map[data.y][data.x][data.z].move_counter = tempArr[6];
                    cc_map.tile_map[data.y][data.x][data.z].id = tempArr[3];
                    if(tempArr[tempArr.length-1] != '[]'){
                        let tempArr2 = [];
                        let tempArr3 = [];
                        var pastBracket = false;
                        for(let i = 0; i < tempArr.length; i++){
                            if(tempArr[i] !== parseInt(tempArr[i])){
                                if(tempArr[i][0] == '['){
                                    pastBracket = true;
                                }
                            }
                            if(pastBracket){
                                if(tempArr[i][tempArr[i].length-2] == '≈'){
                                    tempArr3.push(tempArr[i].split('≈')[0]);
                                    tempArr2.push(tempArr3);
                                    tempArr3 = [tempArr[i].split('≈')[1]];
                                }
                                else{
                                    tempArr3.push(tempArr[i]);
                                }
                                if(tempArr[i][tempArr[i].length-1] == ']'){
                                    break;
                                }
                            }
                        }
                        tempArr2[0][0] = tempArr2[0][0].replace('[', '');
                        for(let i = 0; i < tempArr2.length; i++){
                            cc_map.tile_map[data.y][data.x][data.z].inv[i] = new ClientItem(item_type_map[tempArr2[i][0]], item_name_map[tempArr2[i][1]], parseInt(tempArr2[i][2]), '');
                        }
                    }
                }
                else if(tempArr[0] == 4){ //facing tile
                    cc_map.tile_map[data.y][data.x][data.z] = new ClientTile("facing", tile_name_map[tempArr[1]], tempArr[2], data.x, data.y, data.z);
                }
                else{
                    console.log("tile type not found client side " + tempArr[0]);
                }
            }
            else{ //air tile
                cc_map.tile_map[data.y][data.x][data.z] = 0;
            }
        })

        channel.on('hurt', data => {
            cc_map.tile_map[data.y][data.x][data.z].hp -= data.hit;
            /*if(data.x === player.x && data.y === player.y && data.z === player.z){
                player.hp -= data.hit;
                console.log(player.hp);
                if(player.hp <= 0){
                    channel.emit('change', {x: player.x, y: player.y, z: player.z, to: 0});
                    player.x = 0;
                    player.y = 0;
                    player.z = 5;
                    player.hp = 100;
                    channel.emit('change', {x: player.x, y: player.y, z: player.z, to: '3.4.100.'+channel.id+'.'+player.team+'.0.0.[]'});
                }
            }*/
        })

        channel.on('reset_view', data => {
            if(data.id === channel.id){
                player.x = data.x;
                player.y = data.y;
                player.z = data.z;
            }
        })

        channel.on('add_item', data => {
            if(data.id === channel.id){
                cc_map.tile_map[player.y][player.x][player.z].give(data.item);
            }
        })

        channel.on('regen', data => {
            let heal = 0;
            for(let y = 0; y < cc_map.tile_map.length; y++){
                for(let x = 0; x < cc_map.tile_map[y].length; x++){
                    for(let z = 0; z < cc_map.tile_map[y][x].length; z++){
                        if(cc_map.tile_map[y][x][z] != 0){
                            if(cc_map.tile_map[y][x][z].hp < 10){
                                cc_map.tile_map[y][x][z].hp += 1;
                                heal++;
                            }
                        }
                    }
                }
            }
            if(heal > 0){
                //console.log('healed ' + heal + ' tiles');
            }
        })

        channel.on('msg', data => {
            chat_arr.push(data);
            if(chat_arr.length > 12){
                chat_arr.splice(0, 1);
            }
        })
    })

    createCanvas(tileSize*30, tileSize*14);
    setup_ui();
}

function draw(){
    if(gameState == "Main_Menu"){
        for(let i = 0; i < lobby_select_buttons.length; i++){
            lobby_select_buttons[i].html.hide();
        }
        credits_back_button.html.hide();
        pause_quit_button.html.hide();
        musicSlider.html.hide();
        background(139, 176, 173);
        image(title_img, (width/2)-580, 20);
        r_main_menu_ui();
    }
    else if(gameState == "Lobby_select"){
        mm_start_button.html.hide();
        mm_options_button.html.hide();
        mm_credits_button.html.hide();
        lobby_start_button.html.hide();
        lobby_leave_button.html.hide();
        background(139, 176, 173);
        r_lobby_select();
    }
    else if(gameState == "Credits"){
        mm_start_button.html.hide();
        mm_options_button.html.hide();
        mm_credits_button.html.hide();
        background(139, 176, 173);
        r_credits();
    }
    else if(gameState == "in-Lobby"){
        for(let i = 0; i < lobby_select_buttons.length; i++){
            lobby_select_buttons[i].html.hide();
        }
        background(139, 176, 173);
        r_lobby();
    }
    else if(gameState == "game"){
        //take out when lobby select is re-implimented
        mm_name_input.html.hide();
        mm_start_button.html.hide();
        mm_options_button.html.hide();
        mm_credits_button.html.hide();

        lobby_start_button.html.hide();
        lobby_leave_button.html.hide();
        musicplayer.update();
        background(139, 176, 173);
        if(cc_map != undefined){ //only draw the map if the map exists
            cc_map.render();
            r_all_ui(ui_arr);
            takeInput();
        }
    }
}

//keyboard variables
var move_right_button = 68; //d
var move_left_button = 65; //a
var move_up_button = 87; //w
var move_down_button = 83; //s
var move_fly_up_button = 81; //q
var move_fly_down_button = 69; //e
var run_button = 16; //shift
var slot1_button = 49; //1
var slot2_button = 50; //2
var slot3_button = 51; //3
var slot4_button = 52; //4
var pause_button = 27; //esc

//waiting stuffs
var lastbuildMilli = 0;
var build_wait = 400;
var lastChatMili = 0;
var last_swap_mili = 0;
var swap_wait = 150;
var last_pause_mili = 0;
var pause_wait = 150;

function takeInput(){
    if(document.activeElement !== chat_input.elt && !ui_arr.includes('pause_box')){
        if (keyIsDown(move_right_button) && player.x != cc_map.tile_map[0].length-1 && cc_map.tile_map[player.y][player.x+1][player.z] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(3, channel.id);
        }
        if (keyIsDown(move_left_button) && player.x != 0 && cc_map.tile_map[player.y][player.x-1][player.z] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(1, channel.id);
        }
        if (keyIsDown(move_up_button) && player.y != 0 && cc_map.tile_map[player.y-1][player.x][player.z] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(2, channel.id);
        }
        if (keyIsDown(move_down_button) && player.y != cc_map.tile_map.length-1 && cc_map.tile_map[player.y+1][player.x][player.z] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(0, channel.id);
        }
        if (keyIsDown(move_fly_up_button) && player.z != 1 && cc_map.tile_map[player.y][player.x][player.z-1] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(5, channel.id);
        }
        if (keyIsDown(move_fly_down_button) && player.z != cc_map.tile_map[0][0].length-1 && cc_map.tile_map[player.y][player.x][player.z+1] === 0 && cc_map.tile_map[player.y][player.x][player.z].type == "entity") {
            cc_map.tile_map[player.y][player.x][player.z].move(4, channel.id);
        }
        if (keyIsDown(slot1_button) && millis() - last_swap_mili > swap_wait){
            let temp = cc_map.tile_map[player.y][player.x][player.z].inv[0];
            cc_map.tile_map[player.y][player.x][player.z].inv[0] = cc_map.tile_map[player.y][player.x][player.z].inv[2];
            cc_map.tile_map[player.y][player.x][player.z].inv[2] = temp;
            last_swap_mili = millis();
        }
        if (keyIsDown(slot2_button) && millis() - last_swap_mili > swap_wait){
            let temp = cc_map.tile_map[player.y][player.x][player.z].inv[1];
            cc_map.tile_map[player.y][player.x][player.z].inv[1] = cc_map.tile_map[player.y][player.x][player.z].inv[3];
            cc_map.tile_map[player.y][player.x][player.z].inv[3] = temp;
            last_swap_mili = millis();
        }
        if (keyIsDown(slot3_button) && millis() - last_swap_mili > swap_wait){
            let temp = cc_map.tile_map[player.y][player.x][player.z].inv[0];
            cc_map.tile_map[player.y][player.x][player.z].inv[0] = cc_map.tile_map[player.y][player.x][player.z].inv[1];
            cc_map.tile_map[player.y][player.x][player.z].inv[1] = temp;
            last_swap_mili = millis();
        }
        if (keyIsDown(slot4_button)){
            //open big inv
        }
        if(mouseIsPressed){
            if(millis() - lastbuildMilli > build_wait){
                let y = player.y + floor((mouseY - ((player.z-((player.z%2 == 0)? 1:0)) * 32))/tileSize) - 7 + floor(player.z/2) - ((player.z%2 == 0)? 1:0);
                let x = player.x + floor(mouseX/tileSize) - 15;
                let z = -1;
        
                if(mouseButton == LEFT){ //left click
                    if(cc_map.tile_map[player.y][player.x][player.z].inv[0] !== undefined){
                        cc_map.tile_map[player.y][player.x][player.z].inv[0].clicked(x, y, z);
                    }
                    lastbuildMilli = millis();
                }
                else{  //right click
                    if(cc_map.tile_map[player.y][player.x][player.z].inv[1] !== undefined){
                        cc_map.tile_map[player.y][player.x][player.z].inv[1].clicked(x, y, z);
                    }
                    lastbuildMilli = millis();
                }
            }
        }
    }
    if (keyIsDown(13) && millis()-lastChatMili > 200){ //enter
        send_chat_msg();
        lastChatMili = millis();
    }
    if (keyIsDown(pause_button) && millis() - last_pause_mili > pause_wait){
        if(ui_arr.includes('pause_box')){
            pause_quit_button.html.hide();
            musicSlider.html.hide();
            ui_arr.pop();
        }
        else{
            ui_arr.push('pause_box');
        }
        last_pause_mili = millis();
    }
}