import fs from 'fs'

var tile_name_map = [0, 'stone', 'grass', 'water', 'player','wood', 'log', 'crystal base', 'minion log'];
var tile_type_map = [ 0, 'solid', 'liquid', 'entity', 'facing'];

//Mostly for searching the name and type maps
export function find_in_array(input, arr){
    for(let i = 0; i < arr.length; i++){
        if(input === arr[i]){
            return i;
        }
    }
}

//a solid tile for server end
export class ServerTile{
    constructor(type, name, hp){
        this.type = type; //int
        this.name = name; //int
        this.hp = hp; //int
        if(find_in_array(tile_name_map[this.name], item_name_map) !== undefined){
            this.drop_item = '1.'+find_in_array(tile_name_map[this.name], item_name_map)+'.1≈'; //str
        }
        else if(this.type == 3){
            this.drop_item = '2.5.1≈';
        }
        else{
            this.drop_item = 0;
        }

    }

    toStr(){
        return this.type + '.' + this.name + '.' + this.hp;
    }
}

export class ServerTileEntity extends ServerTile{
    constructor(type, name, hp, team, facing){
        super(type, name, hp);
        this.team = team;
        this.facing = facing; //an int for which direction the entity is facing
        this.move_counter = 0;
        this.walk_wait = 10; //frames before you can walk again
        this.run_wait = 5; //frames before you can run again
        this.id = 0;
        this.inv = [];
    }

    toStr(){
        let invStr = "";
        for(let i = 0; i < this.inv.length; i++){
            invStr += this.inv[i].toStr();
        }
        return this.type + '.' + this.name + '.' + this.hp + '.' + this.id + '.' + this.team + '.' + this.facing + '.' + this.move_counter + '.[' + invStr + ']';
    }
}

var item_type_map = [0, 'block', 'tool', 'consumable'];
var item_name_map = [0, 'stone', 'grass', 'water', 'wood', 'pickaxe'];

export class ServerItem {
    constructor(type, name, amount, click){
        this.type = type;
        this.name = name;
        this.amount = amount;
        this.click = 'Place ' + find_in_array(this.name, item_name_map) + ';';
        if(this.name == 'Pickaxe'){
            this.click = 'Mine;';
        }
        if(click !== ''){
            this.click = click;
        }
    }

    toStr(){
        return this.type + '.' + this.name + '.' + this.amount + '≈';
    }
}

export class ServerMap{
    constructor(name, seed, ver){
        this.name = name; //name of map
        this.seed = seed; //seed used for map gen & random stuffs
        this.ver = ver; //version of game that map was made in
        this.tile_map = [];
        for(let y = 0; y < 20; y++){
            this.tile_map[y] = [];
            for(let x = 0; x < 40; x++){
                this.tile_map[y][x] = [];
                this.tile_map[y][x][0] = new ServerTile(1, 1, 10); //stone
                this.tile_map[y][x][1] = new ServerTile(1, 3, 10); //water
                this.tile_map[y][x][2] = new ServerTile(1, 1, 10); //stone
                this.tile_map[y][x][3] = new ServerTile(1, 2, 10); //grass
                this.tile_map[y][x][4] = new ServerTile(1, 2, 10); //grass
                this.tile_map[y][x][5] = 0;
                this.tile_map[y][x][6] = 0;
                this.tile_map[y][x][7] = 0;
                this.tile_map[y][x][8] = 0;
                this.tile_map[y][x][9] = 0;
            }
        }
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

    fromtxt(filepath){ //convert a txt file to a working map
        this.name = filepath.split('.')[0]; //get the name from the filepath given
        let temp_tile_map = [];
        let data = fs.readFileSync(filepath).toString(); //open the file
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

        //flip the map cause map.txt is from top to bottom, but tile_map is bottom to top
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
                        //.[1.1≈] for items in tiles
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
                    if(temp_tile_map[z][y][x] !== "0" && temp_tile_map[z][y][x] !== 0){
                        let tempArr = temp_tile_map[z][y][x].split('.');
                        for(let i = 0; i < tempArr.length; i++){
                            if(parseInt(tempArr[i])+"" == tempArr[i]){
                                tempArr[i] = parseInt(tempArr[i]);
                            }
                        }
                        
                        //use the type to create the right tile class
                        if(tempArr[0] == 1){ //solid
                            this.tile_map[y][x][z] = new ServerTile(1, tempArr[1], tempArr[2]);
                        }
                        else if(tempArr[0] == 2){ //liquid
                            this.tile_map[y][x][z] = new ServerTile(2, tempArr[1], tempArr[2]); //this might not be working
                        }
                        else if(tempArr[0] == 3){ //entity
                            this.tile_map[y][x][z] = new ServerTileEntity(3, tempArr[1], tempArr[2], tempArr[4], tempArr[5]);
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
                                    this.tile_map[y][x][z].inv[i] = new ServerItem(tempArr2[i][0], tempArr2[i][1], tempArr2[i][2], '');
                                }
                            }
                        }
                        else if(tempArr[0] == 4){ //facing
                            this.tile_map[y][x][z] = new ServerTile(4, tempArr[1]. tempArr[2]);
                        }
                        else{
                            console.log("251: tile type not found server side " + tempArr[0]);
                        }
                    }
                    else{
                        this.tile_map[y][x][z] = 0;
                    }
                }
            }
        }
    }

    save(){ //actually put the txt into a file
        fs.writeFileSync((this.name + ".txt"), this.totxt());
    }
}