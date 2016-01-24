import GuiButton from '../guibutton';


export default class StatsDisplay extends GuiButton {

	setStats(stats) {
		this.stats = stats;
	}


 	render(context, images) {
	    context.drawImage(images.stats, this.x, this.y, 210, 210);
	    context.font = '15px Comic Sans MS';
	    context.textAlign = 'end';
	    context.fillText(this.stats.getHealth(), this.x + 150, this.y + 10);
	    context.fillText(this.stats.getDamage(), this.x + 150, this.y + 30);
	    context.fillText(this.stats.getSpeed(), this.x + 150, this.y + 52);
	    context.fillText(this.stats.getWeight(), this.x + 150, this.y + 74);
	    context.fillText(this.stats.getWcost(), this.x + 150, this.y + 94);
	    context.fillText(this.stats.getCcost(), this.x + 150, this.y + 114);
	    context.fillText(this.stats.getTcost(), this.x + 150, this.y + 150);  

	    context.textAlign = 'start';
	}

}
