/**
	_enyo.Input_ implements an HTML &lt;input&gt; element with cross-platform
	support for change events.

	You can listen for _oninput_ and _onchange_ DOM events from this control
	to know when the text inside has been modified. _oninput_ fires immediately,
	while _onchange_ fires when the text has changed and the input subsequently
	loses focus.

	For more information, see the documentation on
	[Text Fields](https://github.com/enyojs/enyo/wiki/Text-Fields) in the Enyo
	Developer Guide.
*/
enyo.kind({
	name: "enyo.Input",
	published: {
		/**
			Value of the input. Use this property only to initialize the value.
			Call _getValue_ and _setValue_ to manipulate the value at runtime.
		*/
		value: "",
		//* Text to display when the input is empty
		placeholder: "",
		/**
			Type of input; if not specified, it's treated as "text". It can
			be anything specified for the _type_ attribute in the HTML
			specification, including "url", "email", "search", or "number".
		*/
		type: "",
		/**
			When true, prevents input into the control. This maps to the
			_disabled_ DOM attribute.
		*/
		disabled: false,
		//* When true, select the contents of the input when it gains focus.
		selectOnFocus: false
	},
	events: {
		//* Fires when the input is disabled or enabled.
		onDisabledChange: ""
	},
	//* Set to true to focus this control when it is rendered
	defaultFocus: false,
	//* @protected
	tag: "input",
	classes: "enyo-input",
	handlers: {
		onfocus: "focused",
		oninput: "input",
		onclear: "clear",
		ondragstart: "dragstart"
	},
	create: enyo.super(function (sup) {
		return function() {
			if (enyo.platform.ie) {
				this.handlers.onkeyup = "iekeyup";
			}
			if (enyo.platform.windowsPhone) {
				this.handlers.onkeydown = "iekeydown";
			}
			sup.apply(this, arguments);
			this.placeholderChanged();
			// prevent overriding a custom attribute with null
			if (this.type) {
				this.typeChanged();
			}
			this.valueChanged();
		};
	}),
	rendered: enyo.super(function (sup) {
		return function() {
			sup.apply(this, arguments);

			enyo.makeBubble(this, "focus", "blur");

			//Force onchange event to be bubbled inside Enyo for IE8
			if(enyo.platform.ie == 8){
				this.setAttribute("onchange", enyo.bubbler);
			}

			this.disabledChanged();
			if (this.defaultFocus) {
				this.focus();
			}
		};
	}),
	typeChanged: function() {
		this.setAttribute("type", this.type);
	},
	placeholderChanged: function() {
		this.setAttribute("placeholder", this.placeholder);
	},
	disabledChanged: function() {
		this.setAttribute("disabled", this.disabled);
		this.bubble("onDisabledChange");
	},
	valueChanged: function() {
		this.setAttribute("value", this.value);
		if (this.getNodeProperty("value", this.value) !== this.value) {
			this.setNodeProperty("value", this.value);
		}
	},
	iekeyup: function(inSender, inEvent) {
		var ie = enyo.platform.ie, kc = inEvent.keyCode;
		// input event missing on ie 8, fails to fire on backspace and delete keys in ie 9
		if (ie <= 8 || (ie == 9 && (kc == 8 || kc == 46))) {
			this.bubble("oninput", inEvent);
		}
	},
	iekeydown: function(inSender, inEvent) {
		var wp = enyo.platform.windowsPhone, kc = inEvent.keyCode, dt = inEvent.dispatchTarget;
		// onchange event fails to fire on enter key for Windows Phone 8, so we force blur
		if (wp <= 8 && kc == 13 && this.tag == "input" && dt.hasNode()) {
			dt.node.blur();
		}
	},
	clear: function() {
		this.setValue("");
	},
	// note: we disallow dragging of an input to allow text selection on all platforms
	dragstart: function() {
		return this.hasFocus();
	},
	focused: function() {
		if (this.selectOnFocus) {
			enyo.asyncMethod(this, "selectContents");
		}
	},
	selectContents: function() {
		var n = this.hasNode();

		if (n && n.setSelectionRange) {
			n.setSelectionRange(0, n.value.length);
		} else if (n && n.createTextRange) {
			var r = n.createTextRange();
			r.expand("textedit");
			r.select();
		}
	},
	input: function() {
		var val = this.getNodeProperty("value");
		this.setValue(val);
	}
});
