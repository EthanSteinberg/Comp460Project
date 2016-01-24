import GuiButton from '../guibutton';


export default class InfoDisplay extends GuiButton {

	setMessage(message) {
		this.count = 120;
		this.message = message;
	}

 	render(context, images) {
 		this.count--;

 		if (this.count > 0 && this.message != "") {
 			context.font = '15px Comic Sans MS';
		    context.fillStyle = 'LightCoral';
		    context.fillText(this.message, this.x, this.y);
 		}

	}

}
