import geckos from '@geckos.io/server'
import express from 'express'
import fs from 'fs'
import {find_in_array, ServerTile, ServerMap, ServerTileEntity, ServerItem} from './server-classes.js'

//server stuff
const port = 3000;
const app = express()
const server = app.listen(port)
const io = geckos()

io.addServer(server)

app.use(express.static("public"));
console.log("My server is running on port " + port);

//open a json file and make map for names and types
var json_tiles = fs.readFileSync("tiles.json");
json_tiles = JSON.parse(json_tiles);
var tile_name_map = [0]; //a map for all tile names
var tile_type_map = [0]; //a map for all tile types
var item_name_map = [0]; //a map for all item names
var item_type_map = [0]; //a map for all item types

//add each tile in json to map arrays
for(let i = 0; i < json_tiles.length; i++){
    tile_name_map.push(json_tiles[i]['name'])
    tile_type_map.push(json_tiles[i]['type'])
}

//remove duplicates
tile_name_map = [...new Set(tile_name_map)];
tile_type_map = [...new Set(tile_type_map)];

item_type_map = [0, 'block', 'tool', 'consumable'];
item_name_map = [0, 'stone', 'grass', 'water', 'wood', 'pickaxe'];


//create the curent server map
var cs_map = new ServerMap('unUpdated', 0, 0); //curent server map
cs_map.fromtxt("map.txt");
cs_map.save();


var player_count = 0;
var chat_arr = [];
//dealing with messages that the server gets
io.onConnection(channel => {
    channel.onDisconnect(() => { //client disconnect message
        //console.log(`${channel.id} got disconnected`);
    })
    
    channel.on('join', data => { //client join message
        //convert the map to a string and send it to the player
        io.room(channel.roomId).emit('give_world', {str: cs_map.totxt(), name: cs_map.name});
    })

    channel.on('start', data => {
        //add a player to the map
        cs_map.tile_map[data.y][data.x][data.z] = new ServerTileEntity(find_in_array("entity", tile_type_map), find_in_array("player", tile_name_map), 100, (player_count%2), 0);
        cs_map.tile_map[data.y][data.x][data.z].id = data.id;
        cs_map.tile_map[data.y][data.x][data.z].inv[0] = new ServerItem(2, 5, 1, '');
        cs_map.tile_map[data.y][data.x][data.z].inv[1] = new ServerItem(1, 4, 10, '');
        io.room(channel.roomId).emit('change', {x: data.x, y: data.y, z: data.z, to: cs_map.tile_map[data.y][data.x][data.z].toStr()});
        player_count++;
        chat_arr.push({team: 0, txt: data.username + ' has joined'});
        io.room(channel.roomId).emit('msg', {team: -1, txt: data.username + ' has joined'});
    })

    channel.on('change', data => { //change a block data = {x:int, y:int, z:int, to:str}
        if(data.to != 0){
            //parse the str from data.to
            let tempArr = data.to.split('.');
            for(let i = 0; i < tempArr.length; i++){
                if(tempArr[i] == parseInt(tempArr[i]) + ''){
                    tempArr[i] = parseInt(tempArr[i]);
                }
            }

            //use the type to create the right tile class
            if(tempArr[0] == 1){ //solid
                cs_map.tile_map[data.y][data.x][data.z] = new ServerTile(1, tempArr[1], tempArr[2]);
            }
            else if(tempArr[0] == 2){ //liquid
                cs_map.tile_map[data.y][data.x][data.z] = new ServerTile(2, tempArr[1], tempArr[2]);
            }
            else if(tempArr[0] == 3){ //entity
                cs_map.tile_map[data.y][data.x][data.z] = new ServerTileEntity(3, tempArr[1], tempArr[2], tempArr[4], tempArr[5]);
                cs_map.tile_map[data.y][data.x][data.z].move_counter = tempArr[6];
                cs_map.tile_map[data.y][data.x][data.z].id = tempArr[3];
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
                        cs_map.tile_map[data.y][data.x][data.z].inv[i] = new ServerItem(tempArr2[i][0], tempArr2[i][1], tempArr2[i][2], '');
                    }
                }
            }
            else if(tempArr[0] == 4){ //facing
                cs_map.tile_map[data.y][data.x][data.z] = new ServerTile(4, tempArr[1], tempArr[2]);
            }
            else{
                console.log("tile type not found server side " + tempArr[0]);
            }
        }
        else{
            //add a 0 to the server map
            cs_map.tile_map[data.y][data.x][data.z] = 0;
        }

        //send the change out to all clients
        io.room(channel.roomId).emit('change', {x: data.x, y: data.y, z: data.z, to: data.to});
    })

    channel.on('hurt', data => {
        if(cs_map.tile_map[data.y][data.x][data.z] != 0){
            cs_map.tile_map[data.y][data.x][data.z].hp -= data.hit;
            if(cs_map.tile_map[data.y][data.x][data.z].hp>0){
                io.room(channel.roomId).emit('hurt', {x: data.x, y: data.y, z: data.z, hit: data.hit});
            }
            else{
                if(cs_map.tile_map[data.y][data.x][data.z].id != undefined){
                    cs_map.tile_map[0][0][5] = new ServerTileEntity(3, 4, 100, cs_map.tile_map[data.y][data.x][data.z].team, 0);
                    cs_map.tile_map[0][0][5].id = cs_map.tile_map[data.y][data.x][data.z].id;
                    io.room(channel.roomId).emit('change', {x: 0, y: 0, z: 5, to: cs_map.tile_map[0][0][5].toStr()});
                    io.room(channel.roomId).emit('reset_view', {x: 0, y: 0, z: 5, id: cs_map.tile_map[data.y][data.x][data.z].id});
                }
                io.room(channel.roomId).emit('add_item', {id: data.id, item: cs_map.tile_map[data.y][data.x][data.z].drop_item});
                cs_map.tile_map[data.y][data.x][data.z] = 0;
                io.room(channel.roomId).emit('change', {x: data.x, y: data.y, z: data.z, to: 0});
            }
        }
    })

    setInterval(tile_regen, 7000);

    function tile_regen(){
        let heal = 0;
        for(let y = 0; y < cs_map.tile_map.length; y++){
            for(let x = 0; x < cs_map.tile_map[y].length; x++){
                for(let z = 0; z < cs_map.tile_map[y][x].length; z++){
                    if(cs_map.tile_map[y][x][z] != 0){
                        if(cs_map.tile_map[y][x][z].hp < 10){
                            cs_map.tile_map[y][x][z].hp += 1;
                            heal++;
                        }
                    }
                }
            }
        }
        if(heal > 0){
            //console.log('healed ' + heal + ' tiles');
        }
        io.room(channel.roomId).emit('regen', {});
    }

    channel.on('msg', data => {
        chat_arr.push(data);
        io.room(channel.roomId).emit('msg', data);
    })
})