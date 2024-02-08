'use strict';
(function () {
    // Create a class for the element
    class FoCustomElement extends HTMLElement {
        static observedAttributes = [];

        constructor() {
            // Always call super first in constructor
            super();
            this._attachDomElements();
            this._listenForEvent();
        }

        connectedCallback() {
            // let the parent Element know that we are connected
            this._ping('wc.connected');
        }

        disconnectedCallback() {
            this._ping('wc.disconnected');
            console.log("Custom element removed from page.");
        }

        adoptedCallback() {
            console.log("Custom element moved to new page.");
        }

        /**
         * Listen to change in element attribute and do something
         * @param {*} name 
         * @param {*} oldValue 
         * @param {*} newValue 
         */
        attributeChangedCallback(name, oldValue, newValue) {
            console.log(`Attribute ${name} has changed.`);
        }

        /**
         * this method will register to eventlistener and start lsitening for events sent by FO WC
         * FO WC listens on wc.ping and dispatch a wc.pong as a response to ping
         */
        _listenForEvent() {
            this.addEventListener('wc.pong', event => {
                // do something with the event
                const eventActions = {
                    'wc.get.resource': data => {
                        // do something with resource data
                        console.log(data);
                    },
                    'wc.call.service': response => {
                        // do something with response
                        // error and success response will be sent in response
                        // response.status tell if error or succes
                        console.log(response);
                    }
                };

                var eventDetails = event.detail;
                eventActions[eventDetails.type](eventDetails.data);
            });


        }

        /**
         * Use this function for comunicating with other parent / child Element 
         * @param {*} type 
         * @param {*} data 
         */
        _ping(type, data) {
            this._pushEvent('wc.ping', {
                type,
                data
            });
        }

        /**
         *  type of event you intend to ping 
         *   list of accepted events by FO WC
         *   wc.get.resource wc.set.state wc.call.service
         * @param {*} name 
         * @param {*} detail 
         */
        _pushEvent(name, detail) {
            var customEvent = new CustomEvent(name, {
                detail
            });

            this.dispatchEvent(customEvent);
        }

        /**
         * 
         * @param {*} childCmp 
         * @param {*} onEventData 
         */
        _listenToChildEvents(childCmp, onEventData) {
            // listen to child Ping Event
            childCmp.addEventListener('wc.ping', event => this._pushEvent(event.type, Object.assign({ target: childCmp }, event.detail)), false);
            // child component pushes data to parent
            // this event is not propagated to root
            childCmp.addEventListener('wc.event.data', event => onEventData(event.detail), false);
        }

        _attachDomElements() {
            // create a shadow dom where custom element views will rendered
            const shadow = this.attachShadow({ mode: 'open' });

            // this is a sample view
            const contentContainer = document.createElement('div');
            contentContainer.innerHTML = `<h5>MY Custom Element</h5>`;


            // attach listener to parent element
            // uncomment code to use subscribe to child element
            //   this._listenToChildEvents(childCmp, (res) => {
            //     // do something with information coming from child element
            //   });
            // create and attach styles to shadow DOM
            this._attachDomStyles(shadow);
            shadow.appendChild(contentContainer);
        }

        _attachDomStyles(shadowRoot) {
            const style = document.createElement('style');
            style.textContent = `STYLES GOES IN HERE`;
            shadowRoot.appendChild(style);
        }
    }

    // let the browser know about the custom element
    customElements.define("fo-custom-element", FoCustomElement);
})();
