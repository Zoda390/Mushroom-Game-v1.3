class MusicPlayer {
    constructor(tracks) {
        this.player = document.createElement("audio");
        this.player.id = 'MusicPlayer';
        this.tracks = tracks;
        
        this.currentTrack = 0; //round(random(0,this.tracks.length-1))
        this.player.src = tracks[this.currentTrack];
        //this.player.setAttribute("preload", "auto");
        this.player.setAttribute("controls", "none");
        this.player.setAttribute("preload", "none");
        this.player.style.display = "none";
        
        document.body.appendChild(this.player);
    }

    play() {
        this.player.play();
        this.player.volume = musicSlider.html.value() * 0.05;
    }
    stop() {
        this.player.pause();
    }

    update_vol(){
        this.player = document.getElementById('MusicPlayer');
        this.player.volume = musicSlider.html.value() * 0.05;
    }

    update(){
        //console.log(this.player.currentTime + " Not " + (this.player.duration - 0.1) + " Track " + this.currentTrack);
        if(this.player.currentTime >= this.player.duration - 0.1){ //check if done
            this.player.src = this.tracks[0]; //round(random(0,this.tracks.length-1))
            this.play();
        }
    }

}