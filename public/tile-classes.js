function find_in_array(input, arr){
    for(let i = 0; i < arr.length; i++){
        if(input === arr[i]){
            return i;
        }
    }
}

var tile_type_map = [0, 'solid', 'liquid', 'entity', 'facing'];
var tile_name_map = [0, 'stone', 'grass', 'water', 'player', 'wood', 'minion', 'crystal base', 'minion log'];

class ClientTile{ //a solid tile
    constructor(type, name, hp, x, y, z){
        this.type = type;
        this.name = name;
        this.hp = hp;
        this.img_num = find_in_array(this.name, tile_name_map); //img found in tile_img_map
        this.pos = {x: x, y: y, z: z};
    }

    toStr(){
        return find_in_array(this.type, tile_type_map) + '.' + find_in_array(this.name, tile_name_map) + '.' + this.hp;
    }

    render(){
        image(tile_img_map[this.img_num][0], (this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), tileSize, tileSize + (tileSize/2));
        if(this.hp < 10){
            push();
            stroke(0, ((10-this.hp)/10) * 255);
            strokeWeight(3);
            line((this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - ((this.pos.z-1) * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - ((this.pos.z-1) * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2));
            pop();
        }
    }
}

class ClientTileLiquid extends ClientTile{ //an liquid tile
    constructor(type, name, hp, x, y, z, full){
        super(type, name, hp, x, y, z);
        this.full = 10; //an int for how much the tile is filled, 10 is full
    }

    toStr(){
        return find_in_array(this.type, tile_type_map) + '.' + find_in_array(this.name, tile_name_map) + '.' + this.full;
    }

    render(){
        console.log('water');
        image(tile_img_map[3][0], (this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), tileSize, tileSize + (tileSize/2));
        if(this.hp < 10){
            push();
            stroke(0, ((10-this.hp)/10) * 255);
            strokeWeight(3);
            line((this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - ((this.pos.z-1) * tileSize/2));
            line((this.pos.x*tileSize), ((this.pos.y+1)*tileSize) - ((this.pos.z-1) * tileSize/2), ((this.pos.x+1)*tileSize), ((this.pos.y+1)*tileSize) - (this.pos.z * tileSize/2));
            pop();
        }
    }
}

class ClientTileFacing extends ClientTile{ //an facing tile
    constructor(type, name, hp, x, y, z, facing){
        super(type, name, hp, x, y, z);
        this.facing = facing; //an int for which direction the tile is facing
    }

    toStr(){
        return find_in_array(this.type, tile_type_map) + '.' + find_in_array(this.name, tile_name_map) + '.' + this.hp + '.' + this.facing;
    }

    render(){
        image(tile_img_map[this.img_num][this.facing], (this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), tileSize, tileSize + (tileSize/2));
    }
}

class ClientTileEntity extends ClientTileFacing{ //an entity tile
    constructor(type, name, hp, x, y, z, team, facing){
        super(type, name, hp, x, y, z, facing);
        this.team = team;
        this.move_counter = 0;
        this.walk_wait = 10; //frames before you can walk again
        this.run_wait = 5; //frames before you can run again
        this.id = 0;
        this.inv = [];
    }

    toStr(){
        let invStr = "";
        for(let i = 0; i < this.inv.length; i++){
            if(this.inv[i] !== undefined){
                invStr += this.inv[i].toStr();
            }
            else{
                //invStr += '0≈';  //fixing this makes inventory no try to move when you walk
            }
        }
        return find_in_array(this.type, tile_type_map) + '.' + find_in_array(this.name, tile_name_map) + '.' + this.hp + '.' + this.id + '.' + this.team + '.' + this.facing + '.' + this.move_counter + '.[' + invStr + ']';
    }

    render(){
        //Render the player shadow
        fill(0, 70);
        stroke(0);
        let shadowZ = 0;
        for(let z2 = 0; z2 < cc_map.tile_map[this.pos.y][this.pos.x].length; z2++){
            if(cc_map.tile_map[this.pos.y][this.pos.x][z2] != 0 && cc_map.tile_map[this.pos.y][this.pos.x][z2].type != "entity"){
                shadowZ = z2;
            }
        }
        circle((this.pos.x*tileSize) + (tileSize/2), (this.pos.y*tileSize) - (shadowZ * tileSize/2) + (tileSize/2), (10-(this.pos.z-shadowZ)) * (tileSize/20));

        image(tile_img_map[this.img_num][this.facing + ((this.team == 1)? 8:0)], (this.pos.x*tileSize), (this.pos.y*tileSize) - (this.pos.z * tileSize/2), tileSize, tileSize + (tileSize/2));
        
        //deal with player outlines
        let OutlineBool = false;
        for(let i = this.pos.z+1; i < cc_map.tile_map[this.pos.y][this.pos.x].length; i++){
            if(cc_map.tile_map[this.pos.y][this.pos.x][i] !== 0){
                OutlineBool = true;
            }
        }
        if(OutlineBool){
            cc_map.outlineList.push({x: this.pos.x, y: this.pos.y, z: this.pos.z, img_num: (this.facing + ((this.team == 1)? 12:4))});
        }

        //incriment move_counter
        if(this.move_counter <= this.walk_wait){
            this.move_counter++;
        }
    }

    move(d, id){ //move the entity by sending 2 change messages
        if ((this.move_counter >= ((keyIsDown(run_button))? this.run_wait:this.walk_wait)) && id == this.id) {
            socket.emit('change', {x: this.pos.x, y: this.pos.y, z: this.pos.z, to: 0});
            if(d == 0){
                this.facing = 0;
                this.pos.y ++;
                player.y++;
            }
            else if(d == 1){
                this.facing = 1;
                this.pos.x --;
                player.x--;
            }
            else if(d == 2){
                this.facing = 2;
                this.pos.y --;
                player.y--;
            }
            else if(d == 3){
                this.facing = 3;
                this.pos.x ++;
                player.x++;
            }
            else if(d == 4){
                this.pos.z ++;
                player.z ++;
            }
            else if(d == 5){
                this.pos.z --;
                player.z --;
            }
            this.move_counter = 0;
            socket.emit('change', {x: this.pos.x, y: this.pos.y, z: this.pos.z, to: this.toStr()});
        }
    }

    give(item){
        //parse the str from item
        let tempArr = item.split('.');
        tempArr[tempArr.length-1] = tempArr[tempArr.length-1].split('≈')[0];
        for(let i = 0; i < tempArr.length; i++){
            if(parseInt(tempArr[i])+"" == tempArr[i]){
                tempArr[i] = parseInt(tempArr[i]);
            }
        }
        let temp_item = new ClientItem(item_type_map[tempArr[0]], item_name_map[tempArr[1]], tempArr[2], '');
        let given = false;
        if(cc_map.tile_map[player.y][player.x][player.z].inv.length === 0){
            cc_map.tile_map[player.y][player.x][player.z].inv[0] = temp_item;
        }
        else if(cc_map.tile_map[player.y][player.x][player.z].inv.length < 4){
            for(let i = 0; i < cc_map.tile_map[player.y][player.x][player.z].inv.length; i++){
                if(cc_map.tile_map[player.y][player.x][player.z].inv[i].type == temp_item.type && cc_map.tile_map[player.y][player.x][player.z].inv[i].name == temp_item.name){
                    cc_map.tile_map[player.y][player.x][player.z].inv[i].amount += temp_item.amount;
                    given = true;
                }
            }
            if(!given){
                cc_map.tile_map[player.y][player.x][player.z].inv.push(temp_item);
            }
        }
        else if(cc_map.tile_map[player.y][player.x][player.z].inv.length == 4){
            for(let i = 0; i < cc_map.tile_map[player.y][player.x][player.z].inv.length; i++){
                if(cc_map.tile_map[player.y][player.x][player.z].inv[i].type == temp_item.type && cc_map.tile_map[player.y][player.x][player.z].inv[i].name == temp_item.name){
                    cc_map.tile_map[player.y][player.x][player.z].inv[i].amount += parseInt(temp_item.amount);
                }
            }
        }
    }
}

class ClientMap{
    constructor(name, seed, ver){
        this.name = name; //name of map
        this.seed = seed; //seed used for map gen & random stuffs
        this.ver = ver; //version of game that map was made in
        this.mode = 's';
        this.tile_map = [];
        for(let y = 0; y < 20; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < 40; x++){
                this.tile_map[y][x] = [];
                this.tile_map[y][x][0] = new ClientTile('solid', 'stone', 10, x, y, 0);
                this.tile_map[y][x][1] = new ClientTile('solid', 'water', 10, x, y, 1);
                this.tile_map[y][x][2] = new ClientTile('solid', 'stone', 10, x, y, 2);
                this.tile_map[y][x][3] = new ClientTile('solid', 'grass', 10, x, y, 3);
                this.tile_map[y][x][4] = new ClientTile('solid', 'grass', 10, x, y, 4);
                this.tile_map[y][x][5] = 0;
                this.tile_map[y][x][6] = 0;
                this.tile_map[y][x][7] = 0;
                this.tile_map[y][x][8] = 0;
                this.tile_map[y][x][9] = 0;
            }
        }
        this.outlineList = []; //a list of all rendered outlines
    }

    totxt(){ //convert the map to txt format
        //~ for the end of a tile
        //~~ for the end of a y section
        //~~~ for the end of a z section
        //≈ for the end of an item
        //. to seperate properties
        let temp = "";
        for(let z = this.tile_map[0][0].length-1; z >= 0; z--){
            for(let y = 0; y < this.tile_map.length; y++){
                for(let x = 0; x < this.tile_map[y].length; x++){
                    if(this.tile_map[y][x][z] !== 0){
                        temp += this.tile_map[y][x][z].toStr() + "~";
                    }
                    else{
                        temp += "0~";
                    }
                }
                temp += " ~~\n";
            }
            temp += "~~~\n";
        }
        temp += "s:" + this.seed + " v:" + this.ver;
        return temp;
    }

    fromStr(data){ //convert a str to a working map
        let temp_tile_map = [];
        let lastz = 0; //hold the index of the last ~~~ you found
        for(let z = 0; z < data.length; z++){
            if((data[z]+data[z+1]+data[z+2]) === "~~~"){
                let temp = ""
                for(let j = lastz; j < z-1; j++){
                    temp += data[j];
                }
                temp_tile_map.push(temp);
                lastz = z + 4;
            }
        }

        //get the seed and version
        let temp_sv = "";
        for(let i = lastz; i < data.length; i++){
            temp_sv += data[i];
        }
        temp_sv = temp_sv.split(" ");
        this.seed = parseInt(temp_sv[0].split(":")[1]);
        this.ver = parseFloat(temp_sv[1].split(":")[1]);

        //flip the map cause str is from top to bottom, but tile_map is bottom to top
        temp_tile_map.reverse();

        let ycount = 0; //hold the index of the last ~~ you found
        for(let z = 0; z < temp_tile_map.length; z++){
            let data = temp_tile_map[z];
            temp_tile_map[z] = [];
            ycount = 0;
            let lasty = 0;
            for(let y = 0; y < data.length; y++){
                if((data[y]+data[y+1]) === "~~"){
                    let temp = ""
                    for(let j = lasty; j < y-1; j++){
                        temp += data[j];
                    }
                    temp_tile_map[z].push(temp);
                    lasty = y + 3;
                    ycount ++;
                }
            }
        }

        let xcount = 0; //hold the index of the last ~ you found
        for(let z = 0; z < temp_tile_map.length; z++){
            for(let y = 0; y < temp_tile_map[z].length; y++){
                let data = temp_tile_map[z][y];
                temp_tile_map[z][y] = [];
                xcount = 0;
                let lastx = 0;
                for(let x = 0; x < data.length; x++){
                    if(data[x] === "~"){
                        let temp = ""
                        for(let j = lastx; j < x; j++){
                            temp += data[j];
                        }
                        temp_tile_map[z][y].push(temp);
                        lastx = x + 1;
                        xcount ++;
                    }
                }
            }
        }

        //fill the current tile_map with the temp_tile_map
        this.tile_map = []; //empty the current tile_map
        for(let y = 0; y < ycount; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < xcount; x++){
                this.tile_map[y][x] = [];
                for(let z = 0; z < temp_tile_map.length; z++){
                    if(temp_tile_map[z][y][x] !== "0"){
                        let tempArr = temp_tile_map[z][y][x].split('.');
                        for(let i = 0; i < tempArr.length; i++){
                            if(parseInt(tempArr[i])+"" == tempArr[i]){
                                tempArr[i] = parseInt(tempArr[i]);
                            }
                        }

                        //use the type to create the right tile class
                        if(tempArr[0] == 1){ //solid
                            this.tile_map[y][x][z] = new ClientTile("solid", tile_name_map[tempArr[1]], tempArr[2], x, y, z);
                        }
                        else if(tempArr[0] == 2){ //liquid
                            this.tile_map[y][x][z] = new ClientTile("liquid", tile_name_map[tempArr[1]], x, y, z);
                        }
                        else if(tempArr[0] == 3){ //entity
                            this.tile_map[y][x][z] = new ClientTileEntity("entity", "player", tempArr[2], x, y, z, tempArr[4], tempArr[5]);
                            this.tile_map[y][x][z].move_counter = tempArr[6];
                            this.tile_map[y][x][z].id = tempArr[3];
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
                                    this.tile_map[y][x][z].inv[i] = new ClientItem(item_type_map[tempArr2[i][0]], item_name_map[tempArr2[i][1]], tempArr2[i][2], '');
                                }
                            }
                        }
                        else if(tempArr[0] == 4){ //facing
                            this.tile_map[y][x][z] = new ClientTile("facing", tile_name_map[tempArr[1]], tempArr[2], x, y, z);
                        }
                        else{
                            console.log("tile type not found client side " + tile_type_map[tempArr[0]]);
                        }
                    }
                    else{
                        this.tile_map[y][x][z] = 0;
                    }
                }
            }
        }
    }
    
    save(){ //save the map to a file
        //fs.writeFileSync((this.name + ".txt"), this.totxt());
    }

    render(){
        translate((-player.x*tileSize)+(tileSize*15), (-player.y*tileSize)+(player.z*(tileSize/2))+(tileSize*7)); //move the camera
        this.outlineList = [];
        push();
        for(let y = 0; y < this.tile_map.length; y++){
            for(let x = 0; x < this.tile_map[y].length; x++){
                for(let z = 0; z < this.tile_map[y][x].length; z++){
                    imageMode(CORNER);
                    if(this.tile_map[y][x][z] != 0){
                        this.tile_map[y][x][z].render();
                    }

                    //selected tile, transparent white square
                    if(x == (player.x + floor(mouseX/tileSize) - 15) && y == (player.y + floor((mouseY - ((player.z-((player.z%2 == 0)? 1:0)) * 32))/tileSize) - 7 + floor(player.z/2) - ((player.z%2 == 0)? 1:0)) && z == player.z-1){
                        fill(255, 10);
                        stroke(255, 200);
                        rect((player.x + floor(mouseX/tileSize) - 15)*tileSize, (player.y + floor((mouseY - ((player.z-((player.z%2 == 0)? 1:0)) * 32))/tileSize) - 7 + floor(player.z/2) - ((player.z%2 == 0)? 1:0) - (player.z-1)/2)*tileSize, tileSize, tileSize);
                    }
                }
            }
        }
        for(let i = 0; i < this.outlineList.length; i++){ //render outlines
            image(tile_img_map[4][this.outlineList[i].img_num], (this.outlineList[i].x*tileSize), (this.outlineList[i].y*tileSize) - (this.outlineList[i].z * tileSize/2), tileSize, tileSize + (tileSize/2));
        }
        pop();
    }
}
