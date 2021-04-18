import './index.less';

(() => {
	/* register service worker */
	if ('serviceWorker' in navigator) {
		const regex = new RegExp(/^(([0-9]{1,3}\.){3}[0-9]{1,3})$/);
		const host = window.location.hostname;
		const prot = window.location.protocol;
		if (!regex.test(host) && host !== 'localhost' && prot === 'https:') {
			window.onload = () => {
				navigator.serviceWorker.register('./sw.js');
			};
		}
	}
})();

interface Message {
	content: string;
}

class Message {
	constructor(content: string) {
		this.content = content;
	}

	send() {
		console.log(this.content);
	}
}

const message = new Message('\u29dc');
message.send();
