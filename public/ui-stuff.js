var ui_arr = ["name_plate", "player_info", "chat_box"];
function r_all_ui(arr){
    for(let i = 0; i < arr.length; i++){
        if(arr[i] == "name_plate"){
            r_name_ui(username, cc_map.tile_map[player.y][player.x][player.z].team);
        }
        else if(arr[i] == "team_info"){
            r_team_ui(cc_map.tile_map[player.y][player.x][player.z].team, 70, 10);
        }
        else if(arr[i] == "player_info"){
            r_player_ui(cc_map.tile_map[player.y][player.x][player.z].hp);
        }
        else if(arr[i] == "chat_box"){
            r_chat_ui(chat_arr, cc_map.tile_map[player.y][player.x][player.z].team);
        }
        else if(arr[i] == "pause_box"){
            r_pause_ui();
        }
        else{
            console.log("UI type not recognized, " + arr[i]);
        }
    }
}

function setup_ui(){
    //size stuff
    ui.s_size = 5;
    
    //text stuff
    ui.t_font = 0;
    ui.t_size = 25;
    ui.ts_size = 2;
    
    //colors
    ui.black = color(0);
    ui.gray1 = color(58);
    ui.white = color(237, 228, 218);
    ui.green = color(0, 255, 0);
    ui.yellow = color(255, 255, 0);
    ui.red = color(255, 0, 0);
    ui.team1 = color(232, 198, 91); //orange
    ui.team2 = color(87, 167, 214); //blue
    ui.brown1 = color(115, 91, 66); //light brown
    ui.brown2 = color(96, 75, 61); //dark brown

    s_chat_ui();
    s_main_menu_ui();
    s_lobby_select();
    s_lobby();
    s_credits();
    s_pause_ui();
}

function r_name_ui(name, team){
    let x = (ui.s_size) + (player.x*tileSize) - (tileSize*15);
    let y = (ui.s_size) + (player.y*tileSize) - (player.z*(tileSize/2)) - (tileSize*7);
    let w = 400;
    let h = 40;
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(x, y, w, h);
    if(team == 0){fill(ui.team1);}
    else{fill(ui.team2);}
    rect(x+(w-h), y, h, h);
    textSize(ui.t_size);
    strokeWeight(ui.ts_size);
    fill(ui.white);
    textAlign(LEFT, TOP);
    text(name, x+(5), y+((h/2)-(ui.t_size/2)));
    pop();
}

function r_team_ui(team, b_health, m_count){
    let w = 400;
    let h = 60;
    let x = (player.x*tileSize) - (tileSize*15) + (width-w) - (ui.s_size);
    let y = (ui.s_size) + (player.y*tileSize) - (player.z*(tileSize/2)) - (tileSize*7);
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(x, y, w, h); //base hp background
    rect(x+(w-h), y+h, h, h); //minion count background
    if(team == 0){fill(ui.team1);}
    else{fill(ui.team2);}
    strokeWeight(0);
    let m = map((100-b_health), 0, 100, 0, w);
    if(b_health > 1){
        rect(x+m+(ui.s_size/2), y+(ui.s_size/2), w-m-(ui.s_size), h-ui.s_size); //base hp filled part
    }
    strokeWeight(ui.ts_size);
    textSize(ui.t_size*1.5);
    textAlign(CENTER, CENTER);
    text(m_count, x+(w-h) +(h/2), y+h + (h/2));
    pop();
}

function r_player_ui(p_hp){
    let w = (2*(tileSize+15))+40;
    let h = (2*(tileSize+15))+40;
    let x = (player.x*tileSize) - (tileSize*15) + (width-w) - (ui.s_size);
    let y = (player.y*tileSize) - (player.z*(tileSize/2)) - (tileSize*7) + (height-h) - (ui.s_size);
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(x, y, w, h); //hp background
    
    //inv stuff
    rect(x+40, y+40, (w-40)/2, (h-40)/2); //Left click inv background
    rect(x+40+((w-40)/2), y+40, (w-40)/2, (h-40)/2); //Right click inv background
    rect(x+40, y+40+((h-40)/2), (w-40)/2, (h-40)/2); //1 swap inv background
    rect(x+40+((w-40)/2), y+40+((h-40)/2), (w-40)/2, (h-40)/2); //2 swap inv background
    textSize(ui.t_size*0.75);
    strokeWeight(ui.ts_size);
    fill(ui.white);
    textAlign(LEFT, TOP);
    text("L", x+40+ui.s_size, y+40+ui.s_size); //Left click inv indicator
    text("R", x+40+((w-40)/2)+ui.s_size, y+40+ui.s_size); //Right click inv indicator
    text("1", x+40+ui.s_size, y+40+((h-40)/2)+ui.s_size); //1 swap inv indicator
    text("2", x+40+((w-40)/2)+ui.s_size, y+40+((h-40)/2)+ui.s_size); //2 swap inv indicator
    if(cc_map.tile_map[player.y][player.x][player.z] !== 0 && cc_map.tile_map[player.y][player.x][player.z].inv.length > 0){
        if(cc_map.tile_map[player.y][player.x][player.z].inv[0] != undefined){
            cc_map.tile_map[player.y][player.x][player.z].inv[0].render(x+40+ui.s_size+((tileSize+15)/2), y+40+ui.s_size+((tileSize+15)/2)); //Left click inv
        }
        if(cc_map.tile_map[player.y][player.x][player.z].inv[1] != undefined){
            cc_map.tile_map[player.y][player.x][player.z].inv[1].render(x+40+((w-40)/2)+ui.s_size+((tileSize+15)/2), y+40+ui.s_size+((tileSize+15)/2)); //Right click inv
        }
        if(cc_map.tile_map[player.y][player.x][player.z].inv[2] != undefined){
            cc_map.tile_map[player.y][player.x][player.z].inv[2].render(x+40+ui.s_size+((tileSize+15)/2), y+40+((h-40)/2)+ui.s_size+((tileSize+15)/2)); //1 swap inv
        }
        if(cc_map.tile_map[player.y][player.x][player.z].inv[3] != undefined){
            cc_map.tile_map[player.y][player.x][player.z].inv[3].render(x+40+((w-40)/2)+ui.s_size+((tileSize+15)/2), y+40+((h-40)/2)+ui.s_size+((tileSize+15)/2)); //2 swap inv
        }
    }

    //hp filler
    if(p_hp > 50){ //green and makes it around the turn
        strokeWeight(0);
        fill(ui.green);
        beginShape();
        vertex(x+(ui.s_size/2), y+(ui.s_size/2));
        vertex(x+(ui.s_size/2), y+h-(ui.s_size/2));
        vertex(x+40-(ui.s_size/2), y+h-(ui.s_size/2));
        vertex(x+40-(ui.s_size/2), y+40-(ui.s_size/2));
        endShape(CLOSE);
        if(p_hp <= 59){
            beginShape();
            vertex(x+(ui.s_size/2), y+(ui.s_size/2));
            vertex(x+(ui.s_size/2)+((p_hp-50)*(w/50)), y+(ui.s_size/2));
            vertex(x+40-(ui.s_size/2), y+40-(ui.s_size/2));
            vertex(x+(ui.s_size/2)+0.35, y+40-(ui.s_size/2));
            endShape(CLOSE);
        }
        else{
            rect(x+(ui.s_size/2),y+(ui.s_size/2),(9*(w/50))-ui.s_size+5, 40-ui.s_size)
            rect(x+(ui.s_size/2),y+(ui.s_size/2),((p_hp-50)*(w/50))-ui.s_size, 40-ui.s_size);
        }
    }
    else if(p_hp > 20){
        strokeWeight(0);
        fill(ui.yellow);
        if(p_hp >= 41){
            //rect(x+(ui.s_size/2),y+(ui.s_size/2)+((50-41)*(w/50)),40-ui.s_size, h-((50-41)*(w/50))-ui.s_size);
            beginShape();
            vertex(x+(ui.s_size/2), y+(ui.s_size/2)+((50-p_hp)*(w/50)));
            vertex(x+(ui.s_size/2), y-(ui.s_size/2)+h);
            vertex(x+40-(ui.s_size/2), y+h-(ui.s_size/2));
            vertex(x+40-(ui.s_size/2), y+40-(ui.s_size/2));
            endShape(CLOSE);
        }else{
            rect(x+(ui.s_size/2),y+(ui.s_size/2)+((50-p_hp)*(w/50)),40-ui.s_size, h-((50-p_hp)*(w/50))-ui.s_size);
        }
    }
    else if (p_hp > 1){
        strokeWeight(0);
        fill(ui.red);
        rect(x+(ui.s_size/2),y+(ui.s_size/2)+((50-p_hp)*(w/50)),40-ui.s_size, h-((50-p_hp)*(w/50))-ui.s_size);
    }
    pop();
}

var chat_input;
var chat_arr = [];
function s_chat_ui(){
    chat_input = createInput();
    chat_input.style('color', '#ffffff00');
    chat_input.style('background-color', '#ffffff00');
    chat_input.style('position', 'absolute');
    chat_input.style('left', '9px');
    chat_input.style('bottom', '30px');
    chat_input.style('width', '385px');
    chat_input.style('outline', '0px');
    chat_input.style('border', '0px');
    chat_input.input(update_chat_input_txt);
    chat_input.hide();
}

function update_chat_input_txt(){
    if(this.value().length < 37-username.length){
        chat_in_txt = this.value();
    }
    else{
        this.value(this.value().substring(0, 36-username.length));
    }
}

function send_chat_msg(){
    if(chat_in_txt.length > 0){
        channel.emit('msg', {team: cc_map.tile_map[player.y][player.x][player.z].team, txt: (username + ': ' + chat_in_txt)})
        chat_in_txt = "";
        chat_input.value('');
    }
}

var chat_in_txt = "";
function r_chat_ui(arr, team){
    let w = 400;
    let h = 300;
    let x = (player.x*tileSize) - (tileSize*15) + (ui.s_size);
    let y = (player.y*tileSize) - (player.z*(tileSize/2)) - (tileSize*7) + (height-h) - (ui.s_size);
    chat_input.show();
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(x, y, w-50, h-28);
    if(document.activeElement === chat_input.elt){
        stroke(ui.white);
    }
    rect(x, y+(h-28), w, 28);
    stroke(ui.black);
    if(chat_in_txt.length > 0){
        if(team == 0){fill(ui.team1);}
        else{fill(ui.team2);}
        if(chat_in_txt[0] == '/'){fill(ui.white);}
        textSize(ui.t_size*0.75);
        stroke(ui.black);
        strokeWeight(ui.ts_size);
        textAlign(LEFT, CENTER);
        text(chat_in_txt, x+(ui.s_size*1.5), y+(h-28)+(28/2));
    }
    for(let i = 0; i < arr.length; i++){
        if(arr[i].team == 0){fill(ui.team1);}
        else if(arr[i].team == 1){fill(ui.team2);}
        else{fill(ui.white);}
        textSize(ui.t_size*0.75);
        stroke(ui.black);
        strokeWeight(ui.ts_size);
        textAlign(LEFT, TOP);
        text(arr[i].txt, x+(ui.s_size*1.5), y+(ui.s_size*1.5)+(i*21));
    }
    pop();
}

var mm_name_input = {html: 0, pos:0, size:{x: 400, y: 50}};
var mm_start_button = {html: 0, pos:0, size: {x: 400, y: 100}};
var mm_options_button = {html: 0, pos:0, size: {x: 400, y: 100}};
var mm_credits_button = {html: 0, pos:0, size: {x: 400, y: 100}};
function s_main_menu_ui(){
    mm_name_input.pos = {x: width/2, y: (height/2)+170}; //100
    mm_start_button.pos = {x: width/2, y: (height/2)+280}; //170
    mm_options_button.pos = {x: width/2, y: (height/2)+280};
    mm_credits_button.pos = {x: width/2, y: (height/2)+390};

    mm_name_input.html = createInput();
    mm_start_button.html = createButton("Start");
    mm_options_button.html = createButton("Options");
    mm_credits_button.html = createButton("Credits");

    mm_name_input.html.position(mm_name_input.pos.x - (mm_name_input.size.x/2)-5, mm_name_input.pos.y - (mm_name_input.size.y));
    mm_start_button.html.position(mm_start_button.pos.x - (mm_start_button.size.x/2), mm_start_button.pos.y - (mm_start_button.size.y/2));
    mm_options_button.html.position(mm_options_button.pos.x - (mm_options_button.size.x/2), mm_options_button.pos.y - (mm_options_button.size.y/2));
    mm_credits_button.html.position(mm_credits_button.pos.x - (mm_credits_button.size.x/2), mm_credits_button.pos.y - (mm_credits_button.size.y/2));
    
    mm_name_input.html.size(mm_name_input.size.x, mm_name_input.size.y);
    mm_start_button.html.size(mm_start_button.size.x, mm_start_button.size.y);
    mm_options_button.html.size(mm_options_button.size.x, mm_options_button.size.y);
    mm_credits_button.html.size(mm_credits_button.size.x, mm_credits_button.size.y);

    mm_name_input.html.style('color', '#ffffff00');
    mm_name_input.html.style('background-color', '#ffffff00');
    mm_name_input.html.style('font-size', '50px');
    mm_name_input.html.style('outline', '0px');
    mm_name_input.html.style('border', '0px');
    mm_start_button.html.style('color', '#ffffff00');
    mm_start_button.html.style('background-color', '#ffffff00');
    mm_options_button.html.style('color', '#ffffff00');
    mm_options_button.html.style('background-color', '#ffffff00');
    mm_credits_button.html.style('color', '#ffffff00');
    mm_credits_button.html.style('background-color', '#ffffff00');

    mm_name_input.html.input(update_name_input);
    mm_start_button.html.mousePressed(()=>{
        if(username.length >= 1){
            channel.emit('start', {x: player.x, y: player.y, z: player.z, id: channel.id, username: username});
            gameState = "game";
            lastbuildMilli = millis();
            musicplayer.play();
        }
    });
    mm_options_button.html.mousePressed(()=>{});//add options to the ui list
    mm_credits_button.html.mousePressed(()=>{gameState = "Credits";});

    mm_name_input.html.hide();
    mm_start_button.html.hide();
    mm_options_button.html.hide();
    mm_credits_button.html.hide();
}

var username = '';
function update_name_input(){
    if(this.value().length < 14){
        username = this.value();
    }
    else{
        this.value(this.value().substring(0, 13));
    }
}

function r_main_menu_ui(){
    mm_name_input.html.show();
    mm_start_button.html.show();
    //mm_options_button.html.show();
    mm_credits_button.html.show();
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(mm_start_button.pos.x - (mm_start_button.size.x/2), mm_start_button.pos.y - (mm_start_button.size.y/2)- 30, mm_start_button.size.x, mm_start_button.size.y);
    //rect(mm_options_button.pos.x - (mm_options_button.size.x/2), mm_options_button.pos.y - (mm_options_button.size.y/2)- 30, mm_options_button.size.x, mm_options_button.size.y);
    rect(mm_credits_button.pos.x - (mm_credits_button.size.x/2), mm_credits_button.pos.y - (mm_credits_button.size.y/2)- 30, mm_credits_button.size.x, mm_credits_button.size.y);
    if(document.activeElement === mm_name_input.html.elt){
        stroke(ui.white);
    }
    rect(mm_name_input.pos.x - (mm_name_input.size.x/2), mm_name_input.pos.y - mm_name_input.size.y- 30, mm_name_input.size.x, mm_name_input.size.y);
    textSize(ui.t_size);
    strokeWeight(ui.ts_size);
    stroke(ui.black);
    fill(ui.white);
    textAlign(CENTER, CENTER);
    text(username, mm_name_input.pos.x, mm_name_input.pos.y-52.5);
    textSize(ui.t_size*2);
    strokeWeight(ui.ts_size*2);
    text(mm_start_button.html.elt.innerText, mm_start_button.pos.x, mm_start_button.pos.y-30);
    //text(mm_options_button.html.elt.innerText, mm_options_button.pos.x, mm_options_button.pos.y-30);
    text(mm_credits_button.html.elt.innerText, mm_credits_button.pos.x, mm_credits_button.pos.y-30);
    pop();
}

var lobby_amm = 1;
var lobby_select_buttons = [];
var c_lobby = -1;
function s_lobby_select(){
    for(let i = 0; i < lobby_amm; i++){
        lobby_select_buttons[i] = {html: createButton("Lobby " + (i+1)), pos: {x: (width/2), y: 200+(i*110)}, size: {x: 400, y: 100}}
        lobby_select_buttons[i].html.position(lobby_select_buttons[i].pos.x - (lobby_select_buttons[i].size.x/2), lobby_select_buttons[i].pos.y - (lobby_select_buttons[i].size.y/2));
        lobby_select_buttons[i].html.size(lobby_select_buttons[i].size.x, lobby_select_buttons[i].size.y);
        lobby_select_buttons[i].html.style('color', '#ffffff00');
        lobby_select_buttons[i].html.style('background-color', '#ffffff00');
        lobby_select_buttons[i].html.mousePressed(()=>{c_lobby = i; gameState = "in-Lobby";});
        lobby_select_buttons[i].html.hide();
    }
}

function r_lobby_select(){
    for(let i = 0; i < lobby_select_buttons.length; i++){
        lobby_select_buttons[i].html.show();
        push();
        stroke(ui.black);
        strokeWeight(ui.s_size);
        fill(ui.gray1);
        rect(lobby_select_buttons[i].pos.x - (lobby_select_buttons[i].size.x/2), lobby_select_buttons[i].pos.y - (lobby_select_buttons[i].size.y/2) - 30, lobby_select_buttons[i].size.x, lobby_select_buttons[i].size.y);
        textSize(ui.t_size);
        strokeWeight(ui.ts_size);
        fill(ui.white);
        textAlign(CENTER, CENTER);
        text(lobby_select_buttons[i].html.elt.innerText, lobby_select_buttons[i].pos.x, lobby_select_buttons[i].pos.y-30);
        pop();
    }
    textSize(ui.t_size);
    strokeWeight(ui.ts_size);
    stroke(ui.black);
    fill(ui.white);
    textAlign(CENTER, CENTER);
    text("Pick a lobby", width/2, 50);
}

var lobby_start_button = {html: 0, pos:0, size: {x: 400, y: 100}};
var lobby_leave_button = {html: 0, pos:0, size: {x: 400, y: 100}};
function s_lobby(){
    lobby_start_button.pos = {x: width/2, y: height-140};
    lobby_leave_button.pos = {x: width/2, y: height-30};
    
    lobby_start_button.html = createButton("Start");
    lobby_leave_button.html = createButton("Leave");

    lobby_start_button.html.position(lobby_start_button.pos.x - (lobby_start_button.size.x/2), lobby_start_button.pos.y - (lobby_start_button.size.y/2));
    lobby_leave_button.html.position(lobby_leave_button.pos.x - (lobby_leave_button.size.x/2), lobby_leave_button.pos.y - (lobby_leave_button.size.y/2));
    
    lobby_start_button.html.size(lobby_start_button.size.x, lobby_start_button.size.y);
    lobby_leave_button.html.size(lobby_leave_button.size.x, lobby_leave_button.size.y);

    lobby_start_button.html.style('color', '#ffffff00');
    lobby_start_button.html.style('background-color', '#ffffff00');
    lobby_leave_button.html.style('color', '#ffffff00');
    lobby_leave_button.html.style('background-color', '#ffffff00');

    lobby_start_button.html.mousePressed(()=>{gameState = "game";});
    lobby_leave_button.html.mousePressed(()=>{gameState = "Lobby_select";});

    lobby_start_button.html.hide();
    lobby_leave_button.html.hide();
}

function r_lobby(){
    lobby_start_button.html.show();
    lobby_leave_button.html.show();
    push();
    stroke(ui.black);
    strokeWeight(ui.s_size);
    fill(ui.gray1);
    rect(lobby_start_button.pos.x - (lobby_start_button.size.x/2), lobby_start_button.pos.y - (lobby_start_button.size.y/2) - 30, lobby_start_button.size.x, lobby_start_button.size.y);
    rect(lobby_leave_button.pos.x - (lobby_leave_button.size.x/2), lobby_leave_button.pos.y - (lobby_leave_button.size.y/2) - 30, lobby_leave_button.size.x, lobby_leave_button.size.y);
    fill(ui.team1);
    rect(ui.s_size, 50+(ui.s_size*3), (width/2)-ui.s_size, height-50-ui.s_size-240);
    fill(ui.team2);
    rect((width/2), 50+(ui.s_size*3), (width/2)-ui.s_size, height-50-ui.s_size-240);
    textSize(ui.t_size);
    strokeWeight(ui.ts_size);
    stroke(ui.black);
    fill(ui.white);
    textAlign(CENTER, CENTER);
    text(lobby_start_button.html.elt.innerText, lobby_start_button.pos.x, lobby_start_button.pos.y-30);
    text(lobby_leave_button.html.elt.innerText, lobby_leave_button.pos.x, lobby_leave_button.pos.y-30);
    text("Lobby " + (c_lobby+1), width/2, 40);
    pop();
}

var credits_back_button = {html: 0, pos: 0, size: {x: 400, y: 100}};
function s_credits(){
    credits_back_button.pos = {x: width/2, y: height-30};
    credits_back_button.html = createButton("Leave");
    credits_back_button.html.position(credits_back_button.pos.x - (credits_back_button.size.x/2), credits_back_button.pos.y - (credits_back_button.size.y/2));
    credits_back_button.html.size(credits_back_button.size.x, credits_back_button.size.y);
    credits_back_button.html.style('color', '#ffffff00');
    credits_back_button.html.style('background-color', '#ffffff00');
    credits_back_button.html.mousePressed(()=>{gameState = "Main_Menu";});
    credits_back_button.html.hide();
}

function r_credits(){
    credits_back_button.html.show();
    push();
    strokeWeight(ui.s_size);
    stroke(ui.brown2);
    fill(ui.brown1);
    rect((width/2)-200, 20, 400, 100);
    rect(100, 120, width-200, height-250);
    stroke(ui.black);
    fill(ui.gray1);
    rect(credits_back_button.pos.x - (credits_back_button.size.x/2), credits_back_button.pos.y - (credits_back_button.size.y/2) - 30, credits_back_button.size.x, credits_back_button.size.y);
    textSize(ui.t_size*3);
    strokeWeight(ui.ts_size*2);
    stroke(ui.black);
    fill(ui.white);
    textAlign(CENTER, CENTER);
    text('Credits', width/2, 70);
    text('Coding: Christian Rodriguez', (width/2), ((height-250)/5)+50);
    text('Art: Christian Rodriguez', (width/2), (((height-250)/5)*2)+50);
    text('Art Help: Seth Ewer', (width/2), (((height-250)/5)*3)+50);
    text('Music: Parker Becton', (width/2), (((height-250)/5)*4)+50);
    text('Music Help: Christian Rodriguez', (width/2), (((height-250)/5)*5)+50);
    textSize(ui.t_size);
    text(credits_back_button.html.elt.innerText, credits_back_button.pos.x, credits_back_button.pos.y-30);
    pop();
}

var pause_quit_button = {html: 0, pos: 0, size: {x: 400, y: 100}};
var musicSlider = {html: 0, pos: 0, size: 300};
function s_pause_ui(){
    pause_quit_button.pos = {x: width/2, y: height-260};
    musicSlider.pos = {x: (width/2) + 50, y: (height/2)-200};

    pause_quit_button.html = createButton("Quit");
    musicSlider.html = createSlider(0, 1, 0.5, 0.01);

    pause_quit_button.html.position(pause_quit_button.pos.x - (pause_quit_button.size.x/2), pause_quit_button.pos.y - (pause_quit_button.size.y/2));
    musicSlider.html.position(musicSlider.pos.x, musicSlider.pos.y);

    pause_quit_button.html.size(pause_quit_button.size.x, pause_quit_button.size.y);
    musicSlider.html.size(musicSlider.size);

    pause_quit_button.html.style('color', '#ffffff00');
    pause_quit_button.html.style('background-color', '#ffffff00');
    pause_quit_button.html.mousePressed(()=>{
        gameState = "Main_Menu";
        channel.emit('change', {x: player.x, y: player.y, z: player.z, to: 0});
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
        ui_arr.pop();
        musicplayer.stop();
    });
    musicSlider.html.input(musicplayer.update_vol);
    pause_quit_button.html.hide();
    musicSlider.html.hide();
}

function r_pause_ui(){
    let w = 800;
    let h = 600;
    let x = (player.x*tileSize) - (w/2);
    let y = (player.y*tileSize) - ((player.z-1)*(tileSize/2)) - (h*(2/3));
    pause_quit_button.html.show();
    musicSlider.html.show();
    push();
    strokeWeight(ui.s_size);
    stroke(ui.brown2);
    fill(ui.brown1);
    rect(x, y, w, h);
    stroke(ui.black);
    fill(ui.gray1);
    rect(x+200, y+475, pause_quit_button.size.x, pause_quit_button.size.y);
    stroke(ui.black);
    strokeWeight(ui.ts_size*2);
    fill(ui.white);
    textAlign(CENTER, CENTER);
    textSize(ui.t_size*2);
    text(pause_quit_button.html.elt.innerText, x+200+(pause_quit_button.size.x/2), y+475+(pause_quit_button.size.y/2));
    text('Paused', x+400, y+50);
    text('Music Volume:', x+200, y+145);
    pop();
}