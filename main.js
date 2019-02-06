class NoteEvent {
	constructor(sender) {
		this._sender = sender;
		this._listeners = [];
	}

	attach(listener) {
		this._listeners.push(listener);
	}
	notify(args) {
		for(let listener of this._listeners) {
			listener(this._sender, args);
		}
	}
}

class NotesModel {
	constructor(items) {
		this._items = items;
		this.itemAdded = new NoteEvent(this);
		this.listPurged = new NoteEvent(this);
	}

	getItems() {
		return [].concat(this._items);
	}
    
	addItem(item) {
		this._items.push(item);
		this.itemAdded.notify({item: item});
	}
	clearList() {
		this._items.splice(0, this._items.length);
		this.listPurged.notify();
	}
}

class NotesView {
	constructor(model, elements) {
		this._model = model;
		this._elements = elements;
		this.addButtonClicked = new NoteEvent(this);
		this.clearButtonClicked = new NoteEvent(this);
		this.inputSubmited = new NoteEvent(this);

		this._model.itemAdded.attach( () => this.rebuildList() );
		this._model.listPurged.attach( () => this.rebuildList() );

		this._elements.addButton.onclick = () => this.addButtonClicked.notify();
		this._elements.textInput.onkeydown = (e) => this.inputSubmited.notify({keypressed: e.key});
		this._elements.clearButton.onclick = () => this.clearButtonClicked.notify();
	}

	show() {
		this.rebuildList();
	}
	rebuildList() {
		let list, items;
		list = this._elements.list;
		list.innerHTML = '';
		this._elements.textInput.value = '';

		items = this._model.getItems();
		for(let key in items) {
			if(items.hasOwnProperty(key)) {
				list.insertAdjacentHTML('beforeend', `<li>${items[key]}</li>`);
			}
		}
	}
}

class NotesController {
	constructor(model, view) {
		this._model = model;
		this._view = view;

		this._view.addButtonClicked.attach( () => this.addItem() );
		this._view.clearButtonClicked.attach( () => this.clearList() );
		this._view.inputSubmited.attach( (sender, args) => {
			if(args.keypressed !== 'Enter') return;
			else this.addItem();
		});
	}
	addItem() {
		let item = this._view._elements.textInput.value;
		if(item) {
			this._model.addItem(item);
		}
	}
	clearList() {
		this._model.clearList();
	}
}

window.addEventListener('load', function() {
	let model = new NotesModel([]),
		view = new NotesView(model, {
			'list': document.getElementById('notes'),
			'addButton': document.getElementById('add'),
			'textInput': document.getElementById('write'),
			'clearButton': document.getElementById('clear')
		}),
		controller = new NotesController(model, view);

	view.show();
});